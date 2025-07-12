import { createServer } from "http";
import rateLimit from "express-rate-limit";
import { createServer } from 'http';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import rateLimit from 'express-rate-limit';
import { createServer } from "http";
import rateLimit from "express-rate-limit";
import { createServer } from 'http';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import rateLimit from 'express-rate-limit';
import { createServer } from "http";
import rateLimit from "express-rate-limit";
import multer from "multer";
import { TaskEventBus } from "./taskEventBus";
import express, { Response, Request } from "express";
import { numOfActiveTaskWorkers, port, MAX_CONCURRENT_UPLOADS, UPLOAD_RATE_LIMIT } from "./constants";
import { TaskWorker, ProcessingStatus } from "./dataTypes";
import { createTaskWorker } from "./worker/createTaskWorker";
import { CompressionBroker } from "./worker/compressionBroker";
import { addTaskToQueue, findNextUnprocessedTask, getTaskByTaskId, markTaskStatus, requeueTask } from "./taskQueueManager";
import { v4 as uuid } from "uuid";

const app = express();

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 200, // 200 requests per second per IP
  message: {
    error: "Too many requests",
    retryAfter: 1
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: UPLOAD_RATE_LIMIT,
  message: {
    error: "Upload rate limit exceeded",
    retryAfter: 60
  },
  skipSuccessfulRequests: true
});

// Connection tracking for circuit breaker
let activeConnections = 0;

app.use(globalLimiter);

// Circuit breaker middleware
const circuitBreaker = (req: Request, res: Response, next: Function) => {
  if (activeConnections >= MAX_CONCURRENT_UPLOADS) {
    return res.status(503).json({
      error: "Server overloaded",
      retryAfter: 10,
      activeConnections,
      maxConnections: MAX_CONCURRENT_UPLOADS
    });
  }
  
  activeConnections++;
  
  const cleanup = () => {
    activeConnections--;
  };
  
  res.on("finish", cleanup);
  res.on("close", cleanup);
  res.on("error", cleanup);
  
  next();
};

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 200, // 200 requests per second per IP
  message: {
    error: 'Too many requests',
    retryAfter: 1
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: UPLOAD_RATE_LIMIT,
  message: {
    error: 'Upload rate limit exceeded',
    retryAfter: 60
  },
  skipSuccessfulRequests: true
});

// Connection tracking for circuit breaker
let activeConnections = 0;

app.use(globalLimiter);

// Circuit breaker middleware
const circuitBreaker = (req: Request, res: Response, next: Function) => {
  if (activeConnections >= MAX_CONCURRENT_UPLOADS) {
    return res.status(503).json({
      error: 'Server overloaded',
      retryAfter: 10,
      activeConnections,
      maxConnections: MAX_CONCURRENT_UPLOADS
    });
  }
  
  activeConnections++;
  
  const cleanup = () => {
    activeConnections--;
  };
  
  res.on('finish', cleanup);
  res.on('close', cleanup);
  res.on('error', cleanup);
  
  next();
};

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 200, // 200 requests per second per IP
  message: {
    error: 'Too many requests',
    retryAfter: 1
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: UPLOAD_RATE_LIMIT,
  message: {
    error: 'Upload rate limit exceeded',
    retryAfter: 60
  },
  skipSuccessfulRequests: true
});

// Connection tracking for circuit breaker
let activeConnections = 0;

app.use(globalLimiter);

// Circuit breaker middleware
const circuitBreaker = (req: Request, res: Response, next: Function) => {
  if (activeConnections >= MAX_CONCURRENT_UPLOADS) {
    return res.status(503).json({
      error: 'Server overloaded',
      retryAfter: 10,
      activeConnections,
      maxConnections: MAX_CONCURRENT_UPLOADS
    });
  }
  
  activeConnections++;
  
  const cleanup = () => {
    activeConnections--;
  };
  
  res.on('finish', cleanup);
  res.on('close', cleanup);
  res.on('error', cleanup);
  
  next();
};

// Circuit breaker middleware
const circuitBreaker = (req: Request, res: Response, next: Function) => {
  if (activeConnections >= MAX_CONCURRENT_UPLOADS) {
    return res.status(503).json({
      error: 'Server overloaded',
      retryAfter: 10,
      activeConnections,
      maxConnections: MAX_CONCURRENT_UPLOADS
    });
  }
  
  activeConnections++;
  
  const cleanup = () => {
    activeConnections--;
  };
  
  res.on('finish', cleanup);
  res.on('close', cleanup);
  res.on('error', cleanup);
  
  next();
};

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 200, // 200 requests per second per IP
  message: {
    error: "Too many requests",
    retryAfter: 1
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: UPLOAD_RATE_LIMIT,
  message: {
    error: "Upload rate limit exceeded",
    retryAfter: 60
  },
  skipSuccessfulRequests: true
});

// Connection tracking for circuit breaker
let activeConnections = 0;

app.use(globalLimiter);

// Circuit breaker middleware
const circuitBreaker = (req: Request, res: Response, next: Function) => {
  if (activeConnections >= MAX_CONCURRENT_UPLOADS) {
    return res.status(503).json({
      error: 'Server overloaded',
      retryAfter: 10,
      activeConnections,
      maxConnections: MAX_CONCURRENT_UPLOADS
    });
  }
  
  activeConnections++;
  
  const cleanup = () => {
    activeConnections--;
  };
  
  res.on('finish', cleanup);
  res.on('close', cleanup);
  res.on('error', cleanup);
  
  next();
};

// Circuit breaker middleware
const circuitBreaker = (req: Request, res: Response, next: Function) => {
  if (activeConnections >= MAX_CONCURRENT_UPLOADS) {
    return res.status(503).json({
      error: "Server overloaded",
      retryAfter: 10,
      activeConnections,
      maxConnections: MAX_CONCURRENT_UPLOADS
    });
  }
  
  activeConnections++;
  
  const cleanup = () => {
    activeConnections--;
  };
  
  res.on("finish", cleanup);
  res.on("close", cleanup);
  res.on("error", cleanup);
  
  next();
};

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 200, // 200 requests per second per IP
  message: {
    error: 'Too many requests',
    retryAfter: 1
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: UPLOAD_RATE_LIMIT,
  message: {
    error: 'Upload rate limit exceeded',
    retryAfter: 60
  },
  skipSuccessfulRequests: true
});

// Connection tracking for circuit breaker
let activeConnections = 0;

app.use(globalLimiter);

// Circuit breaker middleware
const circuitBreaker = (req: Request, res: Response, next: Function) => {
  if (activeConnections >= MAX_CONCURRENT_UPLOADS) {
    return res.status(503).json({
      error: 'Server overloaded',
      retryAfter: 10,
      activeConnections,
      maxConnections: MAX_CONCURRENT_UPLOADS
    });
  }
  
  activeConnections++;
  
  const cleanup = () => {
    activeConnections--;
  };
  
  res.on('finish', cleanup);
  res.on('close', cleanup);
  res.on('error', cleanup);
  
  next();
};

// Circuit breaker middleware
const circuitBreaker = (req: Request, res: Response, next: Function) => {
  if (activeConnections >= MAX_CONCURRENT_UPLOADS) {
    return res.status(503).json({
      error: 'Server overloaded',
      retryAfter: 10,
      activeConnections,
      maxConnections: MAX_CONCURRENT_UPLOADS
    });
  }
  
  activeConnections++;
  
  const cleanup = () => {
    activeConnections--;
  };
  
  res.on('finish', cleanup);
  res.on('close', cleanup);
  res.on('error', cleanup);
  
  next();
};

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 200, // 200 requests per second per IP
  message: {
    error: 'Too many requests',
    retryAfter: 1
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: UPLOAD_RATE_LIMIT,
  message: {
    error: 'Upload rate limit exceeded',
    retryAfter: 60
  },
  skipSuccessfulRequests: true
});

// Connection tracking for circuit breaker
let activeConnections = 0;

app.use(globalLimiter);

// Circuit breaker middleware
const circuitBreaker = (req: Request, res: Response, next: Function) => {
  if (activeConnections >= MAX_CONCURRENT_UPLOADS) {
    return res.status(503).json({
      error: 'Server overloaded',
      retryAfter: 10,
      activeConnections,
      maxConnections: MAX_CONCURRENT_UPLOADS
    });
  }
  
  activeConnections++;
  
  const cleanup = () => {
    activeConnections--;
  };
  
  res.on('finish', cleanup);
  res.on('close', cleanup);
  res.on('error', cleanup);
  
  next();
};

// Circuit breaker middleware
const circuitBreaker = (req: Request, res: Response, next: Function) => {
  if (activeConnections >= MAX_CONCURRENT_UPLOADS) {
    return res.status(503).json({
      error: 'Server overloaded',
      retryAfter: 10,
      activeConnections,
      maxConnections: MAX_CONCURRENT_UPLOADS
    });
  }
  
  activeConnections++;
  
  const cleanup = () => {
    activeConnections--;
  };
  
  res.on('finish', cleanup);
  res.on('close', cleanup);
  res.on('error', cleanup);
  
  next();
};
// Enhanced multer configuration with better limits
const forms = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit for better performance
		files: 1,
	},
	// Add file filter for logging
	fileFilter: (req, file, cb) => {
		console.log(`Upload attempt: ${file.originalname}, size: ${file.size || 'unknown'} bytes`);
		console.log(`Upload attempt: ${file.originalname}, size: ${file.size || "unknown"} bytes`);
		// Accept all file types for compression
		cb(null, true);
	}
});

const taskWorkers: TaskWorker[] = [];
const compressionBroker = new CompressionBroker();

// Apply upload limiting to compression endpoints
app.use("/compressFile", uploadLimiter, circuitBreaker);

// Apply upload limiting to compression endpoints
app.use('/compressFile', uploadLimiter, circuitBreaker);

// Apply upload limiting to compression endpoints
app.use('/compressFile', uploadLimiter, circuitBreaker);
app.use('/compressFileStream', uploadLimiter, circuitBreaker);

// Apply upload limiting to compression endpoints
app.use("/compressFile", uploadLimiter, circuitBreaker);

// Apply upload limiting to compression endpoints
app.use('/compressFile', uploadLimiter, circuitBreaker);

// Apply upload limiting to compression endpoints
app.use('/compressFile', uploadLimiter, circuitBreaker);

// Health check and monitoring endpoints
app.get('/health', (req, res) => {
  const memUsage = process.memoryUsage();
  
  res.json({
    status: 'healthy',
    pid: process.pid,
    uptime: process.uptime(),
    activeConnections,
    maxConnections: MAX_CONCURRENT_UPLOADS,
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
    }
  });
});

app.get('/metrics', (req, res) => {
  res.json({
    activeConnections,
    maxConnections: MAX_CONCURRENT_UPLOADS,
    serverLoad: activeConnections / MAX_CONCURRENT_UPLOADS,
    timestamp: new Date().toISOString()
  });
});

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 200, // 200 requests per second per IP
  message: {
    error: "Too many requests",
    retryAfter: 1
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: UPLOAD_RATE_LIMIT,
  message: {
    error: "Upload rate limit exceeded",
    retryAfter: 60
  },
  skipSuccessfulRequests: true
});

// Connection tracking for circuit breaker
let activeConnections = 0;

app.use(globalLimiter);

// Circuit breaker middleware
const circuitBreaker = (req: Request, res: Response, next: Function) => {
  if (activeConnections >= MAX_CONCURRENT_UPLOADS) {
    return res.status(503).json({
      error: 'Server overloaded',
      retryAfter: 10,
      activeConnections,
      maxConnections: MAX_CONCURRENT_UPLOADS
    });
  }
  
  activeConnections++;
  
  const cleanup = () => {
    activeConnections--;
  };
  
  res.on('finish', cleanup);
  res.on('close', cleanup);
  res.on('error', cleanup);
  
  next();
};

// Circuit breaker middleware
const circuitBreaker = (req: Request, res: Response, next: Function) => {
  if (activeConnections >= MAX_CONCURRENT_UPLOADS) {
    return res.status(503).json({
      error: "Server overloaded",
      retryAfter: 10,
      activeConnections,
      maxConnections: MAX_CONCURRENT_UPLOADS
    });
  }
  
  activeConnections++;
  
  const cleanup = () => {
    activeConnections--;
  };
  
  res.on("finish", cleanup);
  res.on("close", cleanup);
  res.on("error", cleanup);
  
  next();
};

// Apply upload limiting to compression endpoints
app.use("/compressFile", uploadLimiter, circuitBreaker);

// Health check and monitoring endpoints
app.get('/health', (req, res) => {
  const memUsage = process.memoryUsage();
  
  res.json({
    status: 'healthy',
    pid: process.pid,
    uptime: process.uptime(),
    activeConnections,
    maxConnections: MAX_CONCURRENT_UPLOADS,
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
    }
  });
});

app.get('/metrics', (req, res) => {
  res.json({
    activeConnections,
    maxConnections: MAX_CONCURRENT_UPLOADS,
    serverLoad: activeConnections / MAX_CONCURRENT_UPLOADS,
    timestamp: new Date().toISOString()
  });
});
// Health check and monitoring endpoints
app.get("/health", (req, res) => {
	const memUsage = process.memoryUsage();
	
	res.json({
		status: "healthy",
		pid: process.pid,
		uptime: process.uptime(),
		activeConnections,
		maxConnections: MAX_CONCURRENT_UPLOADS,
		memory: {
			rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
			heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
			heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
		},
		workers: {
			taskWorkers: numOfActiveTaskWorkers,
			compressionWorkers: require("./constants").numOfActiveCompressWorkers
		}
	});
});

app.get("/metrics", (req, res) => {
	res.json({
		activeConnections,
		maxConnections: MAX_CONCURRENT_UPLOADS,
		serverLoad: activeConnections / MAX_CONCURRENT_UPLOADS,
		timestamp: new Date().toISOString()
	});
});

// Health check and monitoring endpoints
app.get('/health', (req, res) => {
	const memUsage = process.memoryUsage();
	const cpuUsage = process.cpuUsage();
	
	res.json({
		status: 'healthy',
		pid: process.pid,
		uptime: process.uptime(),
		activeConnections,
		maxConnections: MAX_CONCURRENT_UPLOADS,
		memory: {
			rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
			heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
			heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
		},
		taskQueue: {
			// Add task queue stats if accessible
		}
	});
});

app.get('/metrics', (req, res) => {
	res.json({
		activeConnections,
		maxConnections: MAX_CONCURRENT_UPLOADS,
		serverLoad: activeConnections / MAX_CONCURRENT_UPLOADS,
		timestamp: new Date().toISOString()
	});
});

// Health check and monitoring endpoints
app.get("/health", (req, res) => {
	const memUsage = process.memoryUsage();
	
	res.json({
		status: "healthy",
		pid: process.pid,
		uptime: process.uptime(),
		activeConnections,
		maxConnections: MAX_CONCURRENT_UPLOADS,
		memory: {
			rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
			heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
			heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
		}
	});
});

app.get("/metrics", (req, res) => {
	res.json({
		activeConnections,
		maxConnections: MAX_CONCURRENT_UPLOADS,
		serverLoad: activeConnections / MAX_CONCURRENT_UPLOADS,
		timestamp: new Date().toISOString()
	});
});

// Health check and monitoring endpoints
app.get('/health', (req, res) => {
	const memUsage = process.memoryUsage();
	const cpuUsage = process.cpuUsage();
	
	res.json({
		status: 'healthy',
		pid: process.pid,
		uptime: process.uptime(),
		activeConnections,
		maxConnections: MAX_CONCURRENT_UPLOADS,
		memory: {
			rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
			heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
			heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
		},
		taskQueue: {
			// Add task queue stats if accessible
		}
	});
});

app.get('/metrics', (req, res) => {
	res.json({
		activeConnections,
		maxConnections: MAX_CONCURRENT_UPLOADS,
		serverLoad: activeConnections / MAX_CONCURRENT_UPLOADS,
		timestamp: new Date().toISOString()
	});
});

// Health check and monitoring endpoints
app.get('/health', (req, res) => {
	const memUsage = process.memoryUsage();
	const cpuUsage = process.cpuUsage();
	
	res.json({
		status: 'healthy',
		pid: process.pid,
		uptime: process.uptime(),
		activeConnections,
		maxConnections: MAX_CONCURRENT_UPLOADS,
		memory: {
			rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
			heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
			heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
		},
		taskQueue: {
			// Add task queue stats if accessible
		}
	});
});

app.get('/metrics', (req, res) => {
	res.json({
		activeConnections,
		maxConnections: MAX_CONCURRENT_UPLOADS,
		serverLoad: activeConnections / MAX_CONCURRENT_UPLOADS,
		timestamp: new Date().toISOString()
	});
});

// Health check and monitoring endpoints
app.get("/health", (req, res) => {
	const memUsage = process.memoryUsage();
	
	res.json({
		status: "healthy",
		pid: process.pid,
		uptime: process.uptime(),
		activeConnections,
		maxConnections: MAX_CONCURRENT_UPLOADS,
		memory: {
			rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
			heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
			heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
		}
	});
});

app.get("/metrics", (req, res) => {
	res.json({
		activeConnections,
		maxConnections: MAX_CONCURRENT_UPLOADS,
		serverLoad: activeConnections / MAX_CONCURRENT_UPLOADS,
		timestamp: new Date().toISOString()
	});
});

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
				.send("Task limit exceeded!! Please try again later.")
				.set("Retry-After", "10");
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
		res.status(404)
			.send(`Task with taskId ${taskId} not found.`);
		return;
	}

	res.status(200)
		.json({
			taskId: taskId,
			taskStatus: task.taskStatus,
	});
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

// Create HTTP server with optimized settings
const server = createServer(app);

// Configure server for high load
server.maxConnections = MAX_CONCURRENT_UPLOADS * 2;
server.timeout = 30000; // 30 seconds
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // 66 seconds

server.listen(port, () => {
	console.log(`Task queue server listening on port ${port} (PID: ${process.pid})`);
	console.log(`Max connections: ${server.maxConnections}`);
	console.log(`Active workers: ${numOfActiveTaskWorkers} task, ${require("./constants").numOfActiveCompressWorkers} compression`);

	// Initialize worker pool
	for (let i = 0; i < numOfActiveTaskWorkers; i++) {
		createTaskWorker(taskWorkers, i);
	}
});

// Graceful shutdown
const shutdown = () => {
	console.log("Shutting down server...");
	server.close(() => {
		console.log("Server closed");
		process.exit(0);
	});
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

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
				taskWorkerPort: taskWorkerPort
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
