export function compressFile(chunkToCompress: Uint8Array) {}

export function breakBufferIntoChunks(fileBuffer: Uint8Array) {
	let i = 0;
	const chunkSize = 256 * 1024;
	const bufferLength = fileBuffer.length;
	const chunkedBuffer: Uint8Array[] = [];

	while (i < bufferLength) {
        const endIndex = Math.min(i + chunkSize, bufferLength);
		const bufferChunk = fileBuffer.slice(i, endIndex);
        i += chunkSize;
		chunkedBuffer.push(bufferChunk);
	}

	return chunkedBuffer;
}

export function mergeCompressedChunks() {}
