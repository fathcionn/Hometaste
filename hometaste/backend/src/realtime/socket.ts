import type http from "node:http";
import { Server } from "socket.io";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { registerChatHandlers } from "./chat.handler.js";
import { applySocketAuth } from "./middleware.js";
import { registerOrderHandlers } from "./order.handler.js";

/**
 * Attaches Socket.io to the HTTP server and authenticates sockets with JWT.
 */
export function createSocketServer(server: http.Server): Server {
  const io = new Server(server, {
    cors: {
      origin: env.CLIENT_ORIGIN,
      credentials: true
    }
  });

  applySocketAuth(io);

  io.on("connection", (socket) => {
    logger.info("Socket connected", { socketId: socket.id });
    socket.on("join:support", () => {
      const userId = socket.data.userId as string | undefined;
      if (userId) socket.join(`support:${userId}`);
    });
    registerChatHandlers(io, socket);
    registerOrderHandlers(io, socket);
  });

  return io;
}
