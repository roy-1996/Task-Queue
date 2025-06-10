import { MAX_RETRIES } from "../constants";
import { Worker } from 'node:worker_threads';
import { TaskEventBus } from "../taskEventBus";
import { TaskWorker, TaskStatus } from "../dataTypes";
import { addTaskToQueue, markTaskStatus } from "../taskQueueManager";

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
export function createTaskWorker(workerPath: string, workerPool: TaskWorker[], workerIndex: number) {
	const worker = new Worker(workerPath, {
		execArgv: ['-r', 'ts-node/register'],
	  });

	const fileCompressWorker: TaskWorker = {
		worker: worker,
		isAvailable: true,
		assignedTask: null,
	};

	workerPool[workerIndex] = fileCompressWorker;

	worker.on("message", () => {
		const task = fileCompressWorker.assignedTask;
		if (task) {
			fileCompressWorker.isAvailable = true;
			fileCompressWorker.assignedTask = null;
			markTaskStatus(task, TaskStatus.COMPLETED);
			TaskEventBus.emit("workerAvailable"); // Emit this event to invoke checkTaskQueue
		}
	});

	worker.on("error", (error) => {
		console.log(
			`Worker with id ${worker.threadId} crashed because of ${error.message}`
		);
	});

	worker.on("exit", (code) => {
		const currentTask = workerPool[workerIndex].assignedTask;
		if (code !== 0 && currentTask) {
			const { retryCount } = currentTask;

			if (retryCount && retryCount >= MAX_RETRIES) {
				markTaskStatus(currentTask, TaskStatus.FAILED);
			} else {
				console.warn(
					`Worker crashed while processing task ${currentTask.taskId}. Retrying...`
				);
				currentTask.retryCount = currentTask.retryCount ?? 0 + 1;
				addTaskToQueue(currentTask.fileToCompress); // Add the file to the end of the queue
			}

			workerPool[workerIndex].assignedTask = null;
			createTaskWorker(workerPath, workerPool, workerIndex); // Spawn a new worker on worker crash
		}
	});
}
