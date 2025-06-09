import { Worker } from "node:worker_threads";
import { compressWorkerPath } from "../constants";
import { ChunkCompressWorker } from "../dataTypes";

export function createCompressWorker(workerPool: ChunkCompressWorker[], workerIndex: number) {
        const chunkCompressWorker = new Worker(compressWorkerPath, {
            execArgv: ['-r', 'ts-node/register'],
          });
    
        const fileCompressWorker: ChunkCompressWorker = {
            worker: chunkCompressWorker, 
        };

        workerPool[workerIndex] = fileCompressWorker;

        chunkCompressWorker.on('message', (compressedChunk) => {
            // TODO: Add code to accumulate the compressed chunks from all the chunk compressors for a particular task worker
        });

}