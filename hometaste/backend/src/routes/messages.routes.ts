import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import * as messageService from "../services/message.service.js";

export const messagesRouter = Router({ mergeParams: true });

messagesRouter.use(requireAuth);

messagesRouter.get("/:id/messages", validate(z.object({ params: z.object({ id: z.string() }) })), async (req, res, next) => {
  try {
    res.json({ messages: await messageService.listMessages(req.params.id!) });
  } catch (error) {
    next(error);
  }
});

messagesRouter.post("/:id/messages", validate(z.object({ params: z.object({ id: z.string() }), body: messageService.createMessageSchema })), async (req, res, next) => {
  try {
    res.status(201).json(await messageService.createMessage(req.params.id!, req.user!.id, req.body));
  } catch (error) {
    next(error);
  }
});

messagesRouter.patch("/:id/messages/read", validate(z.object({ params: z.object({ id: z.string() }) })), async (req, res, next) => {
  try {
    await messageService.markOrderMessagesRead(req.params.id!, req.user!.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
