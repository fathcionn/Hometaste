import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.routes.js";
import { cooksRouter } from "./routes/cooks.routes.js";
import { dishesRouter } from "./routes/dishes.routes.js";
import { ordersRouter } from "./routes/orders.routes.js";
import { messagesRouter } from "./routes/messages.routes.js";
import { paymentsRouter, paymentsWebhookRouter } from "./routes/payments.routes.js";
import { reviewsRouter } from "./routes/reviews.routes.js";
import { refundRouter } from "./routes/refund.routes.js";
import { studioRouter } from "./routes/studio.routes.js";
import { supportRouter } from "./routes/support.routes.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use("/api/payments", express.raw({ type: "application/json" }), paymentsWebhookRouter);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "1.0.0",
    service: "hometaste-api",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/cooks", cooksRouter);
app.use("/api/dishes", dishesRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/orders", messagesRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/support", supportRouter);
app.use("/api", refundRouter);
app.use("/api", reviewsRouter);
app.use("/api", studioRouter);
app.use(errorHandler);
