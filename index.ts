import multer from "multer";
import { TaskEventBus } from "./taskEventBus";
import { FileCompressWorker } from "./dataTypes";
import { createWorker } from "./worker/createWorker";
import express, { Response, Request } from "express";
import { addTaskToQueue, findNextUnprocessedTask } from "./taskQueueManager";

const port = 3000;
const numOfActiveWorkers = 5;
const workerPath = "./worker/fileCompressWorker.ts";
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
		createWorker(workerPath, fileCompressWorkers, i); // Creating worker pool
	}
});

// The loop ensures multiple tasks are dispatched in one run if multiple workers are available
function checkTaskQueue() {
	while (true) {
		const task = findNextUnprocessedTask();
		if (!task) {
			break;
		}

		const availableWorkerEntry = fileCompressWorkers.find((w) => w.isAvailable);
		if (!availableWorkerEntry) {
			break;
		}

		const { worker } = availableWorkerEntry;
		task.isProcessing = true;
		availableWorkerEntry.isAvailable = false;
		availableWorkerEntry.assignedTask = task;
		worker.postMessage(task.fileToCompress);
	}
}

TaskEventBus.on("taskAdded", checkTaskQueue);
TaskEventBus.on("workerAvailable", checkTaskQueue);
