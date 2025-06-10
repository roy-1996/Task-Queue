import { parentPort } from "worker_threads";
import { breakBufferIntoChunks } from "../utils";
import { ChunkCompressWorker } from "../dataTypes";
import { numOfActiveCompressWorkers } from "../constants";
import { createCompressWorker } from "./createCompressWorker";

const chunkCompressWorkers: ChunkCompressWorker[] = [];

parentPort?.on("message", async (fileToCompress: Uint8Array) => {
	const chunkedBuffer = breakBufferIntoChunks(fileToCompress);

	if (chunkCompressWorkers.length === 0) {
		for (let i = 0; i < numOfActiveCompressWorkers; i++) {
			createCompressWorker(chunkCompressWorkers, i);
		}
	}

	chunkedBuffer.forEach((fileChunk, index) => {
		const workerIndex = index % numOfActiveCompressWorkers;
		chunkCompressWorkers[workerIndex].worker.postMessage({
			fileChunk,
			index,
			totalChunks: chunkedBuffer.length,
		});
	});
});

// https://www.youtube.com/watch?v=c2OSyOyAde0
// https://medium.com/@serhiisamoilenko/speeding-up-file-parsing-with-multi-threading-in-nodejs-and-typescript-9e91728cf607
