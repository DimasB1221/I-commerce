import { Server } from "socket.io";
import logger from "../middleware/logger.js";

let io; // Global variable for this module

/**
 * Initialize the Socket.IO server using the main HTTP server.
 * Should be called only once from server.js.
 */
export const initSocket = (server) => {
  if (io) {
    logger.warn("⚠️ Socket.IO is already initialized — skipping initSocket.");
    return io;
  }

  io = new Server(server, {
    cors: {
      origin: "*", // Adjust this to match your frontend origin
      methods: ["GET", "POST"],
    },
  });

  logger.info("✅ Socket.IO initialized successfully");

  // Basic event listeners for debugging and monitoring
  io.on("connection", (socket) => {
    logger.info(`🟢 Client connected: ${socket.id}`);

    socket.on("disconnect", (reason) => {
      logger.info(`🔴 Client disconnected: ${socket.id} (reason: ${reason})`);
    });
  });

  return io;
};

/**
 * Retrieve the current Socket.IO instance (for example, inside a controller).
 * Throws an error if Socket.IO has not been initialized yet.
 */
export const getIO = () => {
  if (!io) {
    throw new Error(
      "❌ Socket.IO has not been initialized. Run initSocket(server) first in server.js"
    );
  }
  return io;
};
