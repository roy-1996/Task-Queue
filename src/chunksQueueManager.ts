import { ChunkEventBus } from './chunkEventBus';
import { ChunkData, ChunkingStatus } from "./dataTypes";

const chunksQueue = new Map<string, ChunkData[]>();

export function addChunkToQueue(chunk: Uint8Array, threadId: string) {
	const chunkEntry = { chunk, status: ChunkingStatus.PENDING };

	if (!chunksQueue.has(threadId)) {
		chunksQueue.set(threadId, []);
	}

	chunksQueue.get(threadId)?.push(chunkEntry);
    ChunkEventBus.emit("chunkAvailable");
}

export function findNextUnprocessedChunk(): ChunkData | undefined {
    for (const chunkArray of chunksQueue.values()) {
        for (const chunkEntry of chunkArray) {
            if (chunkEntry.status === ChunkingStatus.PENDING) {
                return chunkEntry;
            }
        }
    }
    return undefined;
}

export function markChunkingStatus(chunkData: ChunkData, chunkingStatus: ChunkingStatus) {
    chunkData.status = chunkingStatus;
}
