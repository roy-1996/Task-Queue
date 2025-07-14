import { ChunkData } from "../dataTypes";
import { compress } from "@mongodb-js/zstd";
import { parentPort } from "node:worker_threads";

parentPort?.on('message', async (chunkData: ChunkData) => {

    const { chunk, taskId, chunkIndex } = chunkData;
    const compressedChunk = await compress(Buffer.from(chunk), 3);

    parentPort?.postMessage({
        taskId,
        chunkIndex,
        compressedChunk
    });
});
