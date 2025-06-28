import { MessagePort, Worker } from "node:worker_threads";
import { compressWorkerPath, MAX_RETRIES, numOfActiveCompressWorkers } from "../constants";
import { ChunkCompressWorker, ChunkData, IncomingChunkMessage, IncomingCompressionMessage, ProcessingStatus } from "../dataTypes";

export class CompressionBroker {
	private chunksQueue: ChunkData[];
	private readonly taskPorts: Map<string, MessagePort>;
	private readonly chunkCompressWorkers: ChunkCompressWorker[];

	constructor() {
		this.chunksQueue = [];
		this.chunkCompressWorkers = [];
		this.taskPorts = new Map<string, MessagePort>();
		for (let i = 0; i < numOfActiveCompressWorkers; i++) {
			this.spawnCompressionPoolWorker(i);
		}
	}

	private spawnCompressionPoolWorker(workerIndex: number) {
		const worker = new Worker(compressWorkerPath, {
			execArgv: ["-r", "ts-node/register"],
		});

		const chunkCompressWorker: ChunkCompressWorker = {
			worker: worker,
			taskId: '',
			chunkIndex: -1,
			isAvailable: true,
		};

		this.chunkCompressWorkers[workerIndex] = chunkCompressWorker;

		worker.on('message', ({ compressedChunk, taskId, chunkIndex }: IncomingCompressionMessage) => {
			const brokerPort = this.taskPorts.get(taskId);
			brokerPort?.postMessage({
				chunkIndex,
				compressedChunk										// Send the compressed chunk to its associated task worker for accumulation
			});
			chunkCompressWorker.isAvailable = true;					// Mark the worker as available so that it can be found
			this.cleanUpCompletedChunks(taskId, chunkIndex);		// Remove completed task from chunks queue
			this.processChunks();									// Analogous to TaskEventBus.emit("workerAvailable") event
		});

		worker.on('error', (error) => {
			console.log(`Compression Worker with task id ${chunkCompressWorker.taskId} and thread id ${worker.threadId} crashed because of ${error.message}`);
		});

		worker.on('exit', (code) => {
			const { taskId, chunkIndex } = chunkCompressWorker;
			if (code !== 0) {
				console.warn(`Compression worker crashed while processing task ${taskId} and chunk index ${chunkIndex}. Retrying...`);
				const chunkData = this.chunksQueue.find((chunk) => (chunk.taskId === taskId && chunk.chunkIndex === chunkIndex));
				if (chunkData) {
					const compressRetryCount = chunkData.retryCount ?? 0;

					if (compressRetryCount >= MAX_RETRIES) {
						chunkData.retryCount = compressRetryCount + 1;
						chunkData.status = ProcessingStatus.PENDING;	// Set the status to PENDING so that it is picked up in the next run of processChunks()
						this.processChunks();
					} else {
						this.cleanUpAllTaskChunks(taskId);
						// TODO: How to inform main thread that file compression has failed/
					}
				}
				this.spawnCompressionPoolWorker(workerIndex);		// Spawn a new worker on worker crash and place it in the same position as the older one
			}
		});
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
		availableChunkCompressor.taskId = nextChunkData.taskId;
		availableChunkCompressor.chunkIndex = nextChunkData.chunkIndex;
		nextChunkData.status = ProcessingStatus.RUNNING;
		try {
			worker.postMessage(nextChunkData);
		} catch (postMessageError) {
			console.error(`Failed to send chunk ${nextChunkData.chunkIndex} for ${nextChunkData.taskId} to worker:`, postMessageError);
			availableChunkCompressor.isAvailable = true;
			availableChunkCompressor.taskId = '';
			availableChunkCompressor.chunkIndex = -1;
			nextChunkData.status = ProcessingStatus.PENDING ;
		}
	}

	private cleanUpCompletedChunks(taskId: string, chunkIndex: number) {
		this.chunksQueue = this.chunksQueue.filter((chunk) => !(chunk.taskId === taskId && chunk.chunkIndex === chunkIndex));
	}

	private cleanUpAllTaskChunks(taskId: string) {
		this.chunksQueue = this.chunksQueue.filter((chunk) => chunk.taskId !== taskId);
	}

	public registerTaskWorker(taskId: string, brokerPort: MessagePort) {
		this.taskPorts.set(taskId, brokerPort);
		brokerPort.on('message', ({ chunkToCompress, chunkIndex }: IncomingChunkMessage) => {
			this.chunksQueue.push({								// The task worker breaks the files into chunks and sends each of them to be processed by a compress worker
				taskId,
				chunkIndex,
				chunk: chunkToCompress,
				status: ProcessingStatus.PENDING
			});
			this.processChunks();								// Analogous to TaskEventBus.emit("taskAdded") event
		});
	}

	public unregisterTaskWorker(taskId: string) {
		const brokerPort = this.taskPorts.get(taskId);
		if (brokerPort) {
			brokerPort.close();
			this.taskPorts.delete(taskId);
		}
	}
}
