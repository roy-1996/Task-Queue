import { parentPort } from "worker_threads";
import { breakBufferIntoChunks } from "../utils";
import { ChunkEventBus } from "../chunkEventBus";
import { numOfActiveCompressWorkers } from "../constants";
import { createCompressWorker } from "./createCompressWorker";
import { ChunkCompressWorker, ChunkingStatus } from "../dataTypes";
import { addChunkToQueue, findNextUnprocessedChunk, markChunkingStatus } from "../chunksQueueManager";

const chunkCompressWorkers: ChunkCompressWorker[] = [];

parentPort?.on("message", async ({ buffer, threadId }) => {
	const chunkedBuffer = breakBufferIntoChunks(buffer);

	if (chunkCompressWorkers.length === 0) {
		for (let i = 0; i < numOfActiveCompressWorkers; i++) {
			createCompressWorker(chunkCompressWorkers, i);
		}
	}

	chunkedBuffer.forEach((fileChunk) => addChunkToQueue(fileChunk, threadId));
});

function processChunks() {
	while (true) {
		const nextChunkData = findNextUnprocessedChunk();
		if (!nextChunkData) {
			return;
		}

		const availableChunkCompressor = chunkCompressWorkers.find(worker => worker.isAvailable);
		if (!availableChunkCompressor) {
			return;
		}

		const { worker } = availableChunkCompressor;
		availableChunkCompressor.isAvailable = false;
		markChunkingStatus(nextChunkData, ChunkingStatus.RUNNING);
		worker.postMessage(nextChunkData);
	}
}

ChunkEventBus.on("chunkAvailable", processChunks);

// https://www.youtube.com/watch?v=c2OSyOyAde0
// https://medium.com/@serhiisamoilenko/speeding-up-file-parsing-with-multi-threading-in-nodejs-and-typescript-9e91728cf607
