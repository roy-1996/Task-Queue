import { deflate } from "node:zlib";
import { promisify } from "node:util";
import { ChunkData } from "../dataTypes";
import { parentPort } from "node:worker_threads";

const deflateAsync = promisify(deflate);

parentPort?.on('message', async (chunkData: ChunkData) => {

    const { chunk, taskId, chunkIndex } = chunkData;
    const compressedChunk = await deflateAsync(chunk);

    parentPort?.postMessage({
        taskId,
        chunkIndex,
        compressedChunk
    });
});
