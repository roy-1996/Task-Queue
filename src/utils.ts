import tar from "tar-stream";
import { Buffer } from "buffer";
import { Writable } from "stream";
import { numOfActiveCompressWorkers } from "./constants";

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
 * Creates an in-memory .tar archive from a single file.
 * @param fileName - The name of the file inside the archive
 * @param fileContent - File content as Uint8Array or Buffer
 * @returns A Buffer containing the tar archive
 */

export async function createTarStream(fileName: string, fileContent: Uint8Array): Promise<Buffer> {

	if (!fileName || typeof fileName !== "string") {
		throw new TypeError(`Invalid fileName: expected non-empty string, got ${typeof fileName}`);
	}

	if (!(fileContent instanceof Uint8Array)) {
		throw new TypeError(`Invalid fileContent: expected Uint8Array, got ${typeof fileContent}`);
	}
	return new Promise((resolve, reject) => {
		const pack = tar.pack(); // create tar pack stream
		const chunks: Buffer[] = [];

		const writable = new Writable({
			write(chunk, _encoding, callback) {
				chunks.push(chunk);
				callback();
			},
		});

		pack.pipe(writable);

		pack.entry(
			{ name: fileName, size: fileContent.length },
			Buffer.from(fileContent),
			(err) => {
				if (err)
					return reject(err instanceof Error ? err : new Error(String(err)));
				pack.finalize(); // closes the tar stream
			}
		);

		writable.on("finish", () => {
			resolve(Buffer.concat(chunks)); // full tar archive in memory
		});

		writable.on("error", reject);
	});
}
