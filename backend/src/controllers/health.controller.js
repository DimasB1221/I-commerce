import mongoose from "mongoose";
import logger from "../middleware/logger.js";

export const healthCheck = async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1
      ? "connected"
      : dbState === 2
      ? "connecting"
      : dbState === 3
      ? "disconnecting"
      : "disconnected";

  // Log hasil health check (level info)
  logger.info(`Health check: server OK, DB ${dbStatus}`);

  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    db: dbStatus,
    timestamp: new Date().toISOString(),
  });
};
