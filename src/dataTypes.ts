import { Request } from 'express';
import { MessagePort, Worker } from "worker_threads";

type BaseTask = {
	taskId: string;
	retryCount?: number; // To track the retry count of failed tasks
	fileToCompress: Express.Multer.File;
};

export type PendingTask = BaseTask & {
	taskStatus: ProcessingStatus.PENDING;
};

export type RunningTask = BaseTask & {
	taskStatus: ProcessingStatus.RUNNING;
};

export type CompletedTask = BaseTask & {
	completedAt: number;
    outputFilePath: string;
	taskStatus: ProcessingStatus.COMPLETED;
};

export type FailedTask = BaseTask & {
	completedAt: number;
	taskStatus: ProcessingStatus.FAILED;
};

export type Task = PendingTask | RunningTask | CompletedTask | FailedTask;

export type ChunkData = {
	taskId: string,
	chunk: Uint8Array,
	chunkIndex: number,
	status: ProcessingStatus
}

export type TaskWorker = {
	worker: Worker;
	isAvailable: boolean;
	assignedTask: Task | null;
};

export type ChunkCompressWorker = {
	worker: Worker;
	taskId: string;
	chunkIndex: number;
	isAvailable: boolean;
}

export enum ProcessingStatus {
	PENDING = "pending",
	RUNNING = "running",
	COMPLETED = "completed",
	FAILED = "failed",
}

export type MulterRequest = Request & { file: Express.Multer.File };

export type IncomingTaskMessage = { buffer: Uint8Array; taskId: string; taskWorkerPort: MessagePort };

export type IncomingChunkMessage = { chunkToCompress: Uint8Array, chunkIndex: number };

export type IncomingCompressionMessage = { taskId: string, chunkIndex: number, compressedChunk: Buffer  };