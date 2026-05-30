import jwt from "jsonwebtoken";
import type { Server } from "socket.io";
import { env } from "../config/env.js";

interface TokenPayload {
  id?: string;
  sub?: string;
  email?: string;
  role: string;
}

/**
 * Requires a valid JWT before a socket can subscribe to realtime events.
 */
export function applySocketAuth(io: Server): void {
  io.use((socket, next) => {
    const authHeader = socket.handshake.headers.authorization;
    const token = (socket.handshake.auth?.token as string | undefined)
      ?? (Array.isArray(authHeader) ? authHeader[0] : authHeader)?.replace("Bearer ", "");

    if (!token) return next(new Error("SOCKET_UNAUTHORIZED"));

    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
      const userId = payload.sub ?? payload.id;
      if (!userId) return next(new Error("SOCKET_INVALID_TOKEN"));

      socket.data.userId = userId;
      socket.data.userRole = payload.role;
      return next();
    } catch {
      return next(new Error("SOCKET_INVALID_TOKEN"));
    }
  });
}
