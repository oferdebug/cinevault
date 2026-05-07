import "dotenv/config";
import pino from "pino";

const logger = pino({
	transport: { target: "pino-pretty" },
	name: "worker",
});

logger.info("Worker process started");
logger.info("Waiting for jobs… (queue not yet wired)");

setInterval(() => {
	logger.debug("worker heartbeat");
}, 30_000);

process.on("SIGINT", () => {
	logger.info("SIGINT received, Shutting Down Worker...");
	logger.info("Worker shut down");
	process.exit(0);
});
