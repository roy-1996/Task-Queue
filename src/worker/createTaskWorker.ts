import { Worker } from "node:worker_threads";
import { TaskEventBus } from "../taskEventBus";
import { MAX_RETRIES, taskWorkerPath } from "../constants";
import { TaskWorker, ProcessingStatus } from "../dataTypes";
import { getTaskByTaskId, markTaskStatus, requeueTask } from "../taskQueueManager";

/**
 * Initializes and manages a worker thread for file compression tasks within a worker pool.
 *
 * Replaces the specified worker in the pool with a new worker instance, sets up event listeners for task completion, error handling, and worker crashes, and ensures failed tasks are retried or marked as failed according to the maximum retry limit.
 *
 * @param workerPath - Path to the worker script.
 * @param workerPool - Array representing the pool of task workers.
 * @param workerIndex - Index in the pool where the new worker should be assigned.
 *
 * @remark
 * If a worker crashes while processing a task, the function will automatically retry the task up to the maximum allowed retries and respawn the worker to maintain pool size.
 */
export function createTaskWorker(workerPool: TaskWorker[], workerIndex: number) {
	const worker = new Worker(taskWorkerPath);

	const taskWorker: TaskWorker = {
		worker: worker,
		isAvailable: true,
		assignedTaskId: "",
	};

	workerPool[workerIndex] = taskWorker;

	worker.on("message", (messageFromTaskWorker) => {
		const { success, message, taskId } = messageFromTaskWorker;

		if (!success) {
			const currentTask = getTaskByTaskId(taskId);
			if (currentTask) {
				currentTask.failureMessage = message;
			}
			return;
		}

		const { assignedTaskId } = taskWorker;
		const assignedTask = getTaskByTaskId(assignedTaskId);

		if (assignedTask) {
			taskWorker.isAvailable = true;
			taskWorker.assignedTaskId = "";
			markTaskStatus(assignedTask, ProcessingStatus.COMPLETED);
			TaskEventBus.emit("workerAvailable"); // Emit this event to invoke checkTaskQueue
		}
	});

	worker.on("error", (error) => {
		const currentTaskId = workerPool[workerIndex].assignedTaskId;
		const currentTask = getTaskByTaskId(currentTaskId);
		if (currentTask) {
			currentTask.failureMessage = error.message;
			console.error(
				`Worker with task id ${taskWorker.assignedTaskId} and thread id ${worker.threadId} crashed because of ${error.message}`
			);
		}
	});

	worker.on("exit", (code) => {
		const currentTaskId = workerPool[workerIndex].assignedTaskId;
		const currentTask = getTaskByTaskId(currentTaskId);

		if (code !== 0 && currentTask) {
			const retryCount = currentTask.retryCount ?? 0;

			if (retryCount >= MAX_RETRIES) {
				markTaskStatus(currentTask, ProcessingStatus.FAILED);
			} else {
				console.warn(
					`Task worker crashed while processing task ${currentTask.taskId}. Retrying...`
				);
				currentTask.retryCount = retryCount + 1;
				requeueTask(currentTask); // Add the file to the end of the queue
			}

			workerPool[workerIndex].assignedTaskId = "";
			createTaskWorker(workerPool, workerIndex); // Spawn a new worker on worker crash
		}
	});
}
