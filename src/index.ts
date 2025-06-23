import multer from "multer";
import { TaskEventBus } from "./taskEventBus";
import express, { Response, Request } from "express";
import { TaskWorker, ProcessingStatus } from "./dataTypes";
import { createTaskWorker } from "./worker/createTaskWorker";
import { CompressionBroker } from "./worker/compressionBroker";
import { numOfActiveTaskWorkers, port, taskWorkerPath } from "./constants";
import { addTaskToQueue, findNextUnprocessedTask, getTaskByTaskId, markTaskStatus } from "./taskQueueManager";

const app = express();
const forms = multer();

const taskWorkers: TaskWorker[] = [];
const compressionBroker = new CompressionBroker();

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

	if (task.taskStatus === ProcessingStatus.COMPLETED) {
		res.status(200).download(task.outputFilePath);
	}
});

app.listen(port, () => {
	console.log(`Task queue app listening on port ${port}`);

	for (let i = 0; i < numOfActiveTaskWorkers; i++) {
		createTaskWorker(taskWorkerPath, taskWorkers, i); // Creating worker pool
	}
});

/**
 * Dispatches pending file compression tasks to available task workers.
 *
 * Continuously assigns unprocessed tasks from the queue to idle workers, marking tasks as running and workers as busy, until no further assignments are possible.
 */
function checkTaskQueue() {
	while (true) {
		const { port1: taskWorkerPort, port2: brokerPort } = new MessageChannel();
		const task = findNextUnprocessedTask();
		if (!task) {
			break;
		}

		const availableWorkerEntry = taskWorkers.find((w) => w.isAvailable);
		if (!availableWorkerEntry) {
			break;
		}

		const { worker } = availableWorkerEntry;
		markTaskStatus(task, ProcessingStatus.RUNNING);
		availableWorkerEntry.isAvailable = false;
		availableWorkerEntry.assignedTask = task;

		compressionBroker.registerTaskWorker(task.taskId, brokerPort);	
		worker.postMessage({
			buffer: task.fileToCompress.buffer,
			taskId: task.taskId,
			taskWorkerPort: taskWorkerPort
		}, [taskWorkerPort]);
	}
}

TaskEventBus.on("taskAdded", checkTaskQueue);
TaskEventBus.on("workerAvailable", checkTaskQueue);
