import multer from "multer";
import { TaskEventBus } from "./taskEventBus";
import express, { Response, Request } from "express";
import { createWorker } from "../src/worker/createWorker";
import { FileCompressWorker, TaskStatus } from "./dataTypes";
import { numOfActiveWorkers, port, workerPath } from "./constants";
import { addTaskToQueue, findNextUnprocessedTask, getTaskByTaskId, markTaskStatus } from "./taskQueueManager";

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
		if (!taskId) {
			res
				.status(503)
				.send("Task limit exceeded!! Please try again later.")
				.set("Retry-After", "10");
			return;
		}

		res.status(202).send({
			taskId: taskId,
			message: "File accepted for compression",
		});
	}
);

app.get("/status/:taskId", (req, res) => {
	const { taskId } = req.params;
	const task = getTaskByTaskId(taskId);

	if (!task) {
		res.status(404).send(`Task with taskId ${taskId} not found.`);
		return;
	}

	res.status(200).json({
		taskId: taskId,
		taskStatus: task.taskStatus,
	});
});

app.get("/download/:taskId", (req, res) => {
	const { taskId } = req.params;
	const task = getTaskByTaskId(taskId);

	if (!task) {
		res.status(404).send(`Compressed file not found.`);
		return;
	}

	if (task.taskStatus === TaskStatus.COMPLETED) {
		res.status(200).download(task.outputFilePath);
	}
});

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
		markTaskStatus(task, TaskStatus.RUNNING);
		availableWorkerEntry.isAvailable = false;
		availableWorkerEntry.assignedTask = task;

		console.log("Going to call postMessage on worker");

		worker.postMessage(task.fileToCompress);
	}
}

TaskEventBus.on("taskAdded", checkTaskQueue);
TaskEventBus.on("workerAvailable", checkTaskQueue);
