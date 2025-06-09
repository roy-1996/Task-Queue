import { v4 as uuidv4 } from "uuid";
import { TaskEventBus } from "./taskEventBus";
import { Task, TaskStatus } from "./dataTypes";
import { MAX_QUEUE_SIZE, TASK_RETENTION_MS } from "./constants";

let taskQueue: Task[] = [];

export function addTaskToQueue(fileToCompress: Express.Multer.File) {
	if (taskQueue.length >= MAX_QUEUE_SIZE) {
		console.warn("Queue limit exceeded!!!");
		return null;
	}

	const taskId = uuidv4();
	taskQueue.push({
		fileToCompress,
		taskId: taskId,
		taskStatus: TaskStatus.PENDING,
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
	const task = taskQueue.find((task) => task.taskStatus === TaskStatus.PENDING);
	return task;
}

export function getTaskByTaskId(taskId: string): Task | undefined {
	const task = taskQueue.find((task) => task.taskId === taskId);
	return task;
}

export function markTaskStatus(task: Task, status: TaskStatus): void {
	task.taskStatus = status;
	if (task.taskStatus === TaskStatus.COMPLETED || task.taskStatus === TaskStatus.FAILED) {
		task.completedAt = Date.now();
	}
	if (task.taskStatus === TaskStatus.COMPLETED) {
		task.outputFilePath = `${process.cwd()}/${task.taskId}.zip`;
		console.log(task.outputFilePath);
	}
}

// Remove the successful and failed tasks after 10 mins of their completion
// TODO: Add logic to delete the compressed file

setInterval(() => {
	taskQueue = taskQueue.filter((task) => {
		const isExpired =  
				(task.taskStatus === TaskStatus.COMPLETED || task.taskStatus === TaskStatus.FAILED) &&
					(Date.now() - task.completedAt >= TASK_RETENTION_MS) 
			
		return !isExpired;
	});
}, 60 * 1000);
