import morgan from "morgan";
import logger from "../middleware/logger.js";
import path from "path";
import fs from "fs";
import "dotenv/config";

// Create a write stream untuk access logs
const logsDir = path.join(process.cwd(), "logs");

// Cek apakah folder logs sudah ada, kalau belum buat
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const accessLogStream = fs.createWriteStream(
  path.join(logsDir, "access.log"),
  { flags: "a" } // append mode
);

// Custom Morgan token untuk response time yang lebih readable
morgan.token("response-time-ms", (req, res) => {
  const responseTime = res.getHeader("X-Response-Time");
  return responseTime ? `${responseTime}ms` : "-";
});

// Custom format string
const morganFormat =
  ":method :url :status :res[content-length] - :response-time ms";

// Stream untuk Winston (HTTP level)
const stream = {
  write: (message) => {
    // Remove trailing newline
    logger.http(message.trim());
  },
};

// Morgan middleware untuk development (colorized console)
const morganDev = morgan("dev", { stream });

// Morgan middleware untuk production (file + structured)
const morganProd = morgan(morganFormat, {
  stream: accessLogStream,
  skip: (req, res) => {
    // Skip logging untuk health check endpoint (optional)
    return req.url === "/health" || req.url === "/api/health";
  },
});

// Morgan middleware untuk Winston stream
const morganWinston = morgan(morganFormat, { stream });

// Export berdasarkan environment
const setupMorgan = () => {
  const env = process.env.NODE_ENV || "development";

  if (env === "development") {
    return [morganDev, morganWinston];
  }

  return [morganProd, morganWinston];
};

export default setupMorgan;
