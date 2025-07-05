import { writeFile } from "node:fs";
import { parentPort } from "worker_threads";
import { breakBufferIntoChunks } from "../utils";
import { IncomingTaskMessage } from "../dataTypes";

parentPort?.on("message", ({ buffer, taskId, taskWorkerPort }: IncomingTaskMessage) => {

		// Map to maintain mapping of chunk index and the compressed chunk

		const compressedChunks = new Map<number, Buffer>();
		const chunkedBuffer = breakBufferIntoChunks(buffer);

		// Sends the chunk to the broker which then pushes it to its queue.

		chunkedBuffer.forEach((chunk, index) => {
			taskWorkerPort.postMessage({
				chunkId: index,
				chunkToCompress: chunk,
			});
		});

		// Compression Worker ----> Compression Broker ------> Task Worker

		taskWorkerPort.on("message", (messageFromBroker) => {

			// Compressing a chunk failed after several retries which means the file cannot be compressed altogether
			if (!messageFromBroker.chunkCompressionSucess) {
				parentPort?.postMessage({
					success: false,
					taskId: taskId,
					message: `Failed to compress file for task ${taskId}`
				});
				process.exit(1);	// Required to send control to exit block for retry
			}

			compressedChunks.set(messageFromBroker.chunkId, messageFromBroker.compressedChunk);

			// Accumulate the compressed chunks and sort them based on their position

			if (compressedChunks.size === chunkedBuffer.length) {
				const filePath = `${process.cwd()}/${taskId}.zip`;						// Same path as used in taskQueueManager.ts
				const ordered = [...compressedChunks.entries()]
					.sort((a, b) => a[0] - b[0])
					.map(([, buf]) => buf);
				
				writeFile(filePath, Buffer.concat(ordered), (error) => {
					if (error) {
						parentPort?.postMessage({
							success: false,
							message: `Failed to write the compressed file for task ${taskId} to disk: ${error.message}`
						});
						process.exit(1);													
					} else {
						parentPort?.postMessage({
							success: true,
							message: `File has been compressed successfully for task ${taskId}`		// Send the path to the compressed file back to the main thread.
						});		
					}
				})

			}
		});
	}
);

// https://www.youtube.com/watch?v=c2OSyOyAde0
// https://medium.com/@serhiisamoilenko/speeding-up-file-parsing-with-multi-threading-in-nodejs-and-typescript-9e91728cf607
