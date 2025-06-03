import { Worker } from "worker_threads";

type BaseTask = {
	taskId: string;
	retryCount?: number; // To track the retry count of failed tasks
	fileToCompress: Express.Multer.File;
};

export type PendingTask = BaseTask & {
	taskStatus: TaskStatus.PENDING;
};

export type RunningTask = BaseTask & {
	taskStatus: TaskStatus.RUNNING;
};

export type CompletedTask = BaseTask & {
	completedAt: number;
    outputFilePath: string;
	taskStatus: TaskStatus.COMPLETED;
};

export type FailedTask = BaseTask & {
	completedAt: number;
	taskStatus: TaskStatus.FAILED;
};

export type Task = PendingTask | RunningTask | CompletedTask | FailedTask;

export type FileCompressWorker = {
	worker: Worker;
	isAvailable: boolean;
	assignedTask: Task | null;
};

export enum TaskStatus {
	PENDING = "pending",
	RUNNING = "running",
	COMPLETED = "completed",
	FAILED = "failed",
}

export type MulterRequest = Request & { file: Express.Multer.File };
