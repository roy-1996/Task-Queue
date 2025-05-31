import multer from "multer";
import { Worker } from "worker_threads";
import { TaskEventBus } from "./taskEventBus";
import { FileCompressWorker } from "./dataTypes";
import express, { Response, Request } from "express";
import { addTaskToQueue, findNextUnprocessedTask, removeTaskFromQueue } from "./taskQueueManager";

const port = 3000;
const numOfActiveWorkers = 5;
const fileCompressWorkers: FileCompressWorker[] = [];

const app = express();
const forms = multer();

app.post(
	"/compressFile",
	forms.single("file"),
	(req: Request, res: Response) => {
		const fileToCompress = (
			req as express.Request & { file: Express.Multer.File }
		).file;

		if (!fileToCompress) {
			res.status(400).send("Please upload a file for compression");
			return;
		}

		const taskId = addTaskToQueue(fileToCompress);
		res.status(202).send({
			taskId: taskId,
			message: "File accepted for compression",
		});
	}
);

app.listen(port, () => {
	console.log(`Task queue app listening on port ${port}`);

	for (let i = 0; i < numOfActiveWorkers; i++) {
		// Creating worker pool
		const worker = new Worker("./worker.ts");
		fileCompressWorkers.push({
			worker,
			isAvailable: true,
		});
	}
});

function checkTaskQueue() {
	const task = findNextUnprocessedTask();
	if (!task) return;

	const availableWorkerEntry = fileCompressWorkers.find((w) => w.isAvailable);
	if (!availableWorkerEntry) return;

	const { worker } = availableWorkerEntry;
	availableWorkerEntry.isAvailable = false;
	worker.postMessage(task.fileToCompress);

	// Use `once` to prevent accumulating multiple listeners for repeated calls
	worker.once("message", () => {
		task.isCompressed = true;
		availableWorkerEntry.isAvailable = true;
		removeTaskFromQueue(task.taskId);
		TaskEventBus.emit("workerAvailable");
	});

	worker.once("error", () => {});

	worker.once("exit", (code) => {
		if (code !== 0) {
			const workerIndex = fileCompressWorkers.findIndex(
				(fileCompressWorker) =>
					fileCompressWorker.worker.threadId === worker.threadId
			);

			if (workerIndex !== -1) {
				fileCompressWorkers[workerIndex] = {
					worker: new Worker("./worker.ts"),
					isAvailable: true,
				};
			}
		}
	});
}

TaskEventBus.on("taskAdded", checkTaskQueue);
TaskEventBus.on("workerAvailable", checkTaskQueue);
