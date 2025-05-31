import { Worker } from "worker_threads";

export type Task = {
    taskId: string,
    isCompressed: boolean,
    fileToCompress: Express.Multer.File,
}

export type FileCompressWorker = {
    worker: Worker,
    isAvailable: boolean
}

export type MulterRequest = Request & { file: Express.Multer.File };