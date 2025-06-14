export const port = 3000;
export const MAX_RETRIES = 3;
export const MAX_QUEUE_SIZE = 50;
export const numOfActiveTaskWorkers = 5;
export const numOfActiveCompressWorkers = 5;
export const TASK_RETENTION_MS = 10 * 60 * 1000; // 10 minutes
export const taskWorkerPath = `${process.cwd()}/src/worker/taskWorker.ts`;
export const compressWorkerPath = `${process.cwd()}/src/worker/chunkCompressWorker.ts`;
