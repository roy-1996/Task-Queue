import zlib from "node:zlib";
import { numOfActiveCompressWorkers } from "./constants";
/**
 * Placeholder for compressing a chunk of data.
 *
 * @param chunkToCompress - The data chunk to be compressed.
 *
 * @remark This function currently has no implementation.
 */
export function compressChunk(chunkToCompress: Uint8Array) {

}

/**
 *
 * @param fileBuffer - The buffer to be divided into chunks.
 * @returns An array of {@link Uint8Array} chunks, each up to 256 KB in size.
 */
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

/**
 * Placeholder for merging compressed file chunks into a single output.
 *
 * @remark
 * This function currently has no implementation.
 */
export function mergeCompressedChunks() {}
