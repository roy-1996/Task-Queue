import { MAX_RETRIES } from "../constants";
import { Worker } from 'node:worker_threads';
import { TaskEventBus } from "../taskEventBus";
import { TaskWorker, TaskStatus } from "../dataTypes";
import { addTaskToQueue, markTaskStatus } from "../taskQueueManager";

export function createTaskWorker(workerPath: string, workerPool: TaskWorker[], workerIndex: number) {
	const worker = new Worker(workerPath, {
		execArgv: ['-r', 'ts-node/register'],
	  });

	const taskWorker: TaskWorker = {
		worker: worker,
		isAvailable: true,
		assignedTask: null,
	};

	workerPool[workerIndex] = taskWorker;

	worker.on("message", () => {
		const task = taskWorker.assignedTask;
		if (task) {
			taskWorker.isAvailable = true;
			taskWorker.assignedTask = null;
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
