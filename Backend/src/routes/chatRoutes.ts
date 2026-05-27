import { Router } from "express";
import { ChatController } from "../controllers/ChatController.js";
import type { AuthMiddleware } from "../middlewares/AuthMiddleware.js";

export function getChatRoutes(auth: AuthMiddleware) {
  const router = Router();
  const chatController = new ChatController();

  // Create a new chat
  router.post("/", auth.authenticate, (req, res) => chatController.createChat(req as any, res));

  // List all chats for the user
  router.get("/", auth.authenticate, (req, res) => chatController.listChats(req as any, res));

  // List available models
  router.get("/models", auth.authenticate, (req, res) => chatController.listModels(req as any, res));

  // Get messages for a specific chat
  router.get("/:chatID", auth.authenticate, (req, res) => chatController.getChatMessages(req as any, res));

  // Send a message to an existing chat
  router.post("/:chatID", auth.authenticate, (req, res) => chatController.sendMessage(req as any, res));

  return router;
}
