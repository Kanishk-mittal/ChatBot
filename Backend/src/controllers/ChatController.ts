import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/AuthMiddleware.js";
import { StorageManager } from "../storage/StorageManager.js";
import { GroqService } from "../services/Groq.js";
import { Message, MessageType } from "../models/Message.js";
import { Chat } from "../models/Chat.js";

export class ChatController {
  private storageManager: StorageManager;
  private llm: GroqService;

  constructor() {
    this.storageManager = StorageManager.getInstance();
    this.llm = new GroqService();
  }

  /**
   * Creates a new chat with an initial message and an AI response.
   */
  public createChat = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { message, model } = req.body;
      const userId = req.userId;

      if (!message || !userId) {
        return res.status(400).json({ error: "Message and authentication are required" });
      }

      if (model) {
        this.llm.setModel(model);
      }

      // 1. Create the user message
      const userMessage = new Message(message, MessageType.USER);

      // 2. Generate title using LLM
      const title = await this.llm.generateTitle(message);

      // 3. Create the chat object
      const newChat = new Chat(userId, title, userMessage);

      // 4. Save the initial chat to DB and Cache
      await this.storageManager.database.saveChat(newChat);
      await this.storageManager.cache.saveChat(newChat);

      // 5. Get response from LLM
      const aiResponseText = await this.llm.getResponse(newChat.messages);

      // 6. Convert response string to Message object
      const aiMessage = new Message(aiResponseText, MessageType.AI);

      // 7. Add AI message to storage
      await this.storageManager.addMessage(newChat.id, aiMessage);

      // 8. Return the specified response structure
      return res.status(201).json({
        reply: aiResponseText,
        chatID: newChat.id,
        title: newChat.title
      });
    } catch (error) {
      console.error("Create chat error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Sends a message to an existing chat and gets an AI response.
   */
  public sendMessage = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { chatID } = req.params;
      const { message, model } = req.body;
      const userId = req.userId;

      if (!chatID || typeof chatID !== "string" || !message || !userId) {
        return res.status(400).json({ error: "chatID (string), message, and authentication are required" });
      }

      // 1. Verify if chat exists and belongs to user
      const chat = await this.storageManager.database.getChat(chatID);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      if (chat.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized access to this chat" });
      }

      if (model) {
        this.llm.setModel(model);
      }

      // 2. Create user message (don't save yet)
      const userMessage = new Message(message, MessageType.USER);

      // 3. Load current message history for LLM context (without user message)
      const currentMessages = await this.storageManager.getMessages(chatID);

      // 4. Get AI response first (only save user message if this succeeds)
      const aiResponseText = await this.llm.getResponse([...currentMessages, userMessage]);

      // 5. If response succeeded, save user message
      await this.storageManager.addMessage(chatID, userMessage);

      // 6. Create and save AI response
      const aiMessage = new Message(aiResponseText, MessageType.AI);
      await this.storageManager.addMessage(chatID, aiMessage);

      // 7. Return only the AI response text as requested
      return res.status(200).json({
        reply: aiResponseText
      });
    } catch (error) {
      console.error("Send message error:", error);
      return res.status(503).json({ error: "Server is Busy please try again after some time" });
    }
  };

  /**
   * Retrieves all messages for a specific chat.
   */
  public getChatMessages = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { chatID } = req.params;
      const userId = req.userId;

      if (!chatID || typeof chatID !== "string" || !userId) {
        return res.status(400).json({ error: "chatID (string) and authentication are required" });
      }

      // 1. Verify chat existence and ownership
      const chat = await this.storageManager.database.getChat(chatID);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      if (chat.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized access to this chat" });
      }

      // 2. Fetch messages from storage (handles Cache-Aside)
      const messages = await this.storageManager.getMessages(chatID);
      return res.status(200).json(messages);
    } catch (error) {
      console.error("Get chat messages error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Retrieves all chats for the authenticated user.
   */
  public listChats = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const chats = await this.storageManager.getChats(userId);
      return res.status(200).json(chats);
    } catch (error) {
      console.error("List chats error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Returns a list of available LLM models.
   */
  public listModels = async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const models = await this.llm.listModels();
      return res.status(200).json(models);
    } catch (error) {
      console.error("List models error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}
