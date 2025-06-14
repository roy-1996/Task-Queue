import { Worker } from "node:worker_threads";
import { compressWorkerPath } from "../constants";
import { ChunkCompressWorker } from "../dataTypes";

/**
 * Initializes and assigns a new compression worker thread to the specified index in the worker pool.
 *
 * @param workerPool - The array of chunk compression workers to which the new worker will be added.
 * @param workerIndex - The index in {@link workerPool} where the new worker will be assigned.
 *
 * @remark
 * The worker is created with TypeScript runtime support enabled. Message handling for accumulating compressed chunks is not yet implemented.
 */
export function createCompressWorker(workerPool: ChunkCompressWorker[], workerIndex: number) {
        const worker = new Worker(compressWorkerPath, {
            execArgv: ['-r', 'ts-node/register'],
          });
    
        const chunkCompressWorker: ChunkCompressWorker = {
            worker: worker, 
            isAvailable: true
        };

        workerPool[workerIndex] = chunkCompressWorker;

        worker.on('message', (compressedChunk) => {
            // TODO: Add code to accumulate the compressed chunks from all the chunk compressors for a particular task worker
        });

}