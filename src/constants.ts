export const port = 3000;
export const MAX_RETRIES = 3;
export const MAX_QUEUE_SIZE = 50;
export const numOfActiveWorkers = 5;
export const workerPath = `${process.cwd()}/src/worker/fileCompressWorker.ts`;
export const TASK_RETENTION_MS = 10 * 60 * 1000; // 10 minutes
