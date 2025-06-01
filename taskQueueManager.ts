import { Task } from "./dataTypes";
import { v4 as uuidv4 } from "uuid";
import { TaskEventBus } from "./taskEventBus";

const taskQueue: Task[] = [];

export function addTaskToQueue(fileToCompress: Express.Multer.File) {
	const taskId = uuidv4()
	taskQueue.push({
		fileToCompress,
		taskId: taskId,
		isProcessing: false,
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
	const task = taskQueue.find((task) => !task.isProcessing);
	return task;
}
