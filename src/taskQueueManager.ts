import { unlink } from 'node:fs';
import { v4 as uuidv4 } from "uuid";
import { promisify } from "node:util";
import { TaskEventBus } from "./taskEventBus";
import { Task, ProcessingStatus, PendingTask } from "./dataTypes";
import { MAX_QUEUE_SIZE, TASK_RETENTION_MS } from "./constants";

let taskQueue: Task[] = [];
const unlinkAsync = promisify(unlink);

export function addTaskToQueue(fileToCompress: Express.Multer.File) {
	if (taskQueue.length >= MAX_QUEUE_SIZE) {
		console.warn("Queue limit exceeded!!!");
		return null;
	}

	const taskId = uuidv4();
	taskQueue.push({
		fileToCompress,
		taskId: taskId,
		taskStatus: ProcessingStatus.PENDING,
	});
	TaskEventBus.emit("taskAdded");
	return taskId;
}

export function removeTaskFromQueue(taskId: string) {
	const taskIndex = taskQueue.findIndex((task) => task.taskId === taskId);

	if (taskIndex !== -1) {
		taskQueue.splice(taskIndex, 1);
	}
}

export function findNextUnprocessedTask(): Task | undefined {
	const task = taskQueue.find((task) => task.taskStatus === ProcessingStatus.PENDING);
	return task;
}

export function requeueTask(task: Task) {
	removeTaskFromQueue(task.taskId);
	const pendingTask: PendingTask = {
		taskId: task.taskId,
		fileToCompress: task.fileToCompress,
		taskStatus: ProcessingStatus.PENDING,
	};
	taskQueue.push(pendingTask);
	TaskEventBus.emit("taskAdded");		// Emit event to trigger queue processing
}

export function getTaskByTaskId(taskId: string): Task | undefined {
	const task = taskQueue.find((task) => task.taskId === taskId);
	return task;
}

export function markTaskStatus(task: Task, status: ProcessingStatus): void {
	task.taskStatus = status;
	if (task.taskStatus === ProcessingStatus.COMPLETED || task.taskStatus === ProcessingStatus.FAILED) {
		task.completedAt = Date.now();
	}
	if (task.taskStatus === ProcessingStatus.COMPLETED) {
		task.outputFilePath = `${process.cwd()}/${task.taskId}.zip`;
	}
}

// Remove the successful and failed tasks after 10 mins of their completion

setInterval(async () => {
	for (let i = taskQueue.length - 1; i >= 0; i--) {
		const task = taskQueue[i];
		const isExpired =  (task.taskStatus === ProcessingStatus.COMPLETED || task.taskStatus === ProcessingStatus.FAILED) &&
							(Date.now() - task.completedAt >= TASK_RETENTION_MS);
		if (isExpired) {
			try {
				await deleteCompressedFile(task.taskId);
				removeTaskFromQueue(task.taskId);
			} catch (error) {
				console.error(`Failed to delete file for task ${task.taskId}. Task will remain in queue for retry.`, error);
			}
		} 
	}
}, 60 * 1000);

async function deleteCompressedFile(taskId: string) {
	const filePath =  `${process.cwd()}/${taskId}.zip`;
	try {
		await unlinkAsync(filePath);
		console.log(`Deleted compressed file successfully at path ${filePath}`);
	} catch (error) {
		console.log(`Failed to delete the compressed file at path ${filePath}`, error);
	}
}
