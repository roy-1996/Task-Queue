import { numOfActiveCompressWorkers } from "./constants";

export function compressFile(chunkToCompress: Uint8Array) {}

export function breakBufferIntoChunks(fileBuffer: Uint8Array) {
	let i = 0;
	const bufferLength = fileBuffer.length;
	const chunkedBuffer: Uint8Array[] = [];
	const chunkSize = Math.ceil(bufferLength / numOfActiveCompressWorkers);

	while (i < bufferLength) {
        const endIndex = Math.min(i + chunkSize, bufferLength);
		const bufferChunk = fileBuffer.slice(i, endIndex);
        i += chunkSize;
		chunkedBuffer.push(bufferChunk);
	}

	return chunkedBuffer;
}

export function mergeCompressedChunks() {}
