const port = 3000;
const MAX_RETRIES = 3;
const MAX_QUEUE_SIZE = 50;
const numOfActiveWorkers = 5;
const workerPath = "./worker/fileCompressWorker.ts";
const TASK_RETENTION_MS = 10 * 60 * 1000; // 10 minutes
