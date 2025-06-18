import { ChunkEventBus } from "./chunkEventBus";
import { ChunkData, ProcessingStatus } from "./dataTypes";

const chunksQueue: ChunkData[] = [];

export function addChunkToQueue(chunk: Uint8Array, threadId: string) {
	const chunkEntry: ChunkData = {
		chunk,
		taskThreadId: threadId,
		status: ProcessingStatus.PENDING,
	};

	chunksQueue.push(chunkEntry);
	ChunkEventBus.emit("chunkAvailable");
}

export function findNextUnprocessedChunk(): ChunkData | undefined {
	const chunkData = chunksQueue.find((chunkData) => chunkData.status === ProcessingStatus.PENDING);
	return chunkData;
}

export function markChunkingStatus(chunkData: ChunkData, chunkingStatus: ProcessingStatus) {
    chunkData.status = chunkingStatus;
}
