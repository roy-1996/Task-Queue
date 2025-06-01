import { Worker } from "worker_threads";

export type Task = {
    taskId: string,
    isProcessing: boolean,
    fileToCompress: Express.Multer.File,
}

export type FileCompressWorker = {
    worker: Worker,
    isAvailable: boolean,
    assignedTask: Task | null,
}

export type MulterRequest = Request & { file: Express.Multer.File };