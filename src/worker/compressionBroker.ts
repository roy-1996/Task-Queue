import { MessagePort, Worker } from "node:worker_threads";
import { compressWorkerPath, numOfActiveCompressWorkers } from "../constants";
import { ChunkCompressWorker, ChunkData, IncomingCompressionMessage, ProcessingStatus } from "../dataTypes";

export class CompressionBroker {
	private readonly chunksQueue: ChunkData[];
	private readonly taskPorts: Map<string, MessagePort>;
	private readonly chunkCompressWorkers: ChunkCompressWorker[];

	constructor() {
		this.chunksQueue = [];
		this.chunkCompressWorkers = [];
		this.taskPorts = new Map<string, MessagePort>();
		this.spawnCompressionPoolWorkers();
	}

	private spawnCompressionPoolWorkers() {
		for (let i = 0; i < numOfActiveCompressWorkers; i++) {
			const worker = new Worker(compressWorkerPath, {
				execArgv: ["-r", "ts-node/register"],
			});

			const chunkCompressWorker: ChunkCompressWorker = {
				worker: worker,
				isAvailable: true,
			};
			this.chunkCompressWorkers.push(chunkCompressWorker);

			worker.on('message', ({ compressedChunk, taskId, chunkId }) => {
				const brokerPort = this.taskPorts.get(taskId);
				brokerPort?.postMessage({
					chunkId,
					compressedChunk										// Send the compressed chunk to its associated task worker for accumulation
				});
				chunkCompressWorker.isAvailable = true;					// Mark the worker as available so that it can be found
				this.processChunks();									// Analogous to TaskEventBus.emit("workerAvailable") event
			});
		}
	}

	private processChunks() {
		const nextChunkData = this.chunksQueue.find((chunkData) => chunkData.status === ProcessingStatus.PENDING);
		if (!nextChunkData) {
			return;
		}

		const availableChunkCompressor = this.chunkCompressWorkers.find(
			(worker) => worker.isAvailable
		);
		if (!availableChunkCompressor) {
			return;
		}

		const { worker } = availableChunkCompressor;
		availableChunkCompressor.isAvailable = false;
		nextChunkData.status = ProcessingStatus.RUNNING;
		worker.postMessage(nextChunkData);
	}

	public registerTaskWorker(taskId: string, brokerPort: MessagePort) {
		this.taskPorts.set(taskId, brokerPort);
		brokerPort.on('message', ({ chunkToCompress, chunkId }: IncomingCompressionMessage) => {
			this.chunksQueue.push({								// The task worker breaks the files into chunks and sends each of them to be processed by a compress worker
				taskId: taskId,
				chunkIndex: chunkId,
				chunk: chunkToCompress,
				status: ProcessingStatus.PENDING
			});
			this.processChunks();								// Analogous to TaskEventBus.emit("taskAdded") event
		});
	}
}
