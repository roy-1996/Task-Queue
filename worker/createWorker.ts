import { Worker } from "worker_threads";
import { TaskEventBus } from "../taskEventBus";
import { FileCompressWorker } from "../dataTypes";
import { addTaskToQueue, removeTaskFromQueue } from "../taskQueueManager";

export function createWorker(workerPath: string, workerPool: FileCompressWorker[], workerIndex: number) {
	const worker = new Worker(workerPath);

	const fileCompressWorker: FileCompressWorker = {
		worker: worker,
		isAvailable: true,
		assignedTask: null,
	};

	workerPool[workerIndex] = fileCompressWorker;

	worker.on("message", () => {
		const task = fileCompressWorker.assignedTask;
		if (task) {
			removeTaskFromQueue(task.taskId);
			fileCompressWorker.assignedTask = null;
			fileCompressWorker.isAvailable = true;
			TaskEventBus.emit("workerAvailable");					// Emit this event to invoke checkTaskQueue
		}
	});

	worker.on("error", (error) => {
		console.log(`Worker with id ${worker.threadId} crashed because of ${error.message}`);
	});

	worker.on("exit", (code) => {
		if (code !== 0) {
			const currentTask = workerPool[workerIndex].assignedTask;
			if (currentTask) {
                console.warn(`Worker crashed while processing task ${currentTask.taskId}. Retrying...`);
				workerPool[workerIndex].assignedTask = null;
				removeTaskFromQueue(currentTask.taskId); 			// Remove the old task from it's location
                addTaskToQueue(currentTask.fileToCompress); 		// Add the file to the end of the queue
			}
			createWorker(workerPath, workerPool, workerIndex);		// Spawn a new worker on worker crash
		}
	});
}
