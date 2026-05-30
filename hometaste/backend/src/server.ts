import http from "node:http";
import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { setSocketServer } from "./realtime/bus.js";
import { createSocketServer } from "./realtime/socket.js";

const server = http.createServer(app);
setSocketServer(createSocketServer(server));

server.listen(env.PORT, () => {
  logger.info(`HomeTaste API listening on port ${env.PORT}`);
});
