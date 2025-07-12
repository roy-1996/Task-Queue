import os from "os";

import os from 'os';
import os from 'os';
import os from "os";

import os from 'os';
import os from 'os';
import os from "os";

export const port = 3000;
export const MAX_RETRIES = 3;
export const MAX_QUEUE_SIZE = 1000; // Increased for high load
export const numOfActiveTaskWorkers = Math.max(4, os.cpus().length); // Scale with CPU
export const numOfActiveCompressWorkers = Math.max(4, os.cpus().length * 2);
export const MAX_CONCURRENT_UPLOADS = 100; // New connection limit
export const UPLOAD_RATE_LIMIT = 50; // Uploads per minute per IP
export const MAX_CONCURRENT_UPLOADS = 100; // New connection limit
export const UPLOAD_RATE_LIMIT = 50; // Uploads per minute per IP
export const MAX_CONCURRENT_UPLOADS = 100; // New connection limit
export const UPLOAD_RATE_LIMIT = 50; // Uploads per minute per IP
export const MAX_CONCURRENT_UPLOADS = 100; // New connection limit
export const UPLOAD_RATE_LIMIT = 50; // Uploads per minute per IP
export const MAX_CONCURRENT_UPLOADS = 100; // New connection limit
export const UPLOAD_RATE_LIMIT = 50; // Uploads per minute per IP
export const MAX_CONCURRENT_UPLOADS = 100; // New connection limit
export const UPLOAD_RATE_LIMIT = 50; // Uploads per minute per IP
export const MAX_CONCURRENT_UPLOADS = 100; // New connection limit
export const UPLOAD_RATE_LIMIT = 50; // Uploads per minute per IP
export const TASK_RETENTION_MS = 10 * 60 * 1000; // 10 minutes
export const taskWorkerPath = `${process.cwd()}/dist/worker/taskWorker.js`;
export const compressWorkerPath = `${process.cwd()}/dist/worker/chunkCompressWorker.js`;
