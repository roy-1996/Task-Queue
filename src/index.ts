import multer from "multer";
import { TaskEventBus } from "./taskEventBus";
import express, { Response, Request } from "express";
import { numOfActiveTaskWorkers, port } from "./constants";
import { TaskWorker, ProcessingStatus } from "./dataTypes";
import { createTaskWorker } from "./worker/createTaskWorker";
import { CompressionBroker } from "./worker/compressionBroker";
import { addTaskToQueue, findNextUnprocessedTask, getTaskByTaskId, markTaskStatus, requeueTask } from "./taskQueueManager";

// zstd -dc /Users/I517467/Downloads/50c577ee-3204-4b69-93db-19833b55e3b2.tar.zst | tar -xf -

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
			res.status(503)
				.set("Retry-After", "10")
				.send("Task limit exceeded!! Please try again later.")
			return;
		}

		res.status(202)
			.send({
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

	if (task.taskStatus === ProcessingStatus.FAILED) {
		res.status(200).json({
			taskId: taskId,
			taskStatus: task.taskStatus,
			failureMessage: task.failureMessage,
		});
	} else {
		res.status(200).json({
			taskId: taskId,
			taskStatus: task.taskStatus,
		});
	}
});

app.get("/download/:taskId", (req, res) => {
	const { taskId } = req.params;
	const task = getTaskByTaskId(taskId);

	if (!task) {
		res.status(404)
			.send(`Compressed file not found.`);
		return;
	}

	if (task.taskStatus === ProcessingStatus.COMPLETED) {
		res.status(200)
			.download(task.outputFilePath, (err) => {
			if (err) {
				res.status(500)
					.send("Error in downloading compressed file.");
			}
		});
	} else if (task.taskStatus === ProcessingStatus.FAILED) {
		res.status(410)
			.send({
			errorMessage:
				task.failureMessage ?? "The task could not be completed due to internal failure.",
		});
	} else {
		res.status(409)
			.set("Retry-After", "10")
			.send("File compression is in progress.");
	}
});

app.listen(port, () => {
	console.log(`Task queue app listening on port ${port}`);

	for (let i = 0; i < numOfActiveTaskWorkers; i++) {
		createTaskWorker(taskWorkers, i); // Creating worker pool
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
		availableWorkerEntry.assignedTaskId = task.taskId;

		compressionBroker.registerTaskWorker(task.taskId, brokerPort);	
		try {
			worker.postMessage({
				buffer: task.fileToCompress.buffer,
				taskId: task.taskId,
				taskWorkerPort: taskWorkerPort,
				fileName: task.fileToCompress.originalname
			}, [taskWorkerPort]);
		} catch (taskWorkerPostMessageError) {
			availableWorkerEntry.isAvailable = true;
			availableWorkerEntry.assignedTaskId = "";
			compressionBroker.unregisterTaskWorker(task.taskId);
			requeueTask(task);
			console.error(`Failed to send file buffer to task worker for task ${task.taskId}: ${taskWorkerPostMessageError}`);
		}
	}
}

TaskEventBus.on("taskAdded", checkTaskQueue);
TaskEventBus.on("workerAvailable", checkTaskQueue);
