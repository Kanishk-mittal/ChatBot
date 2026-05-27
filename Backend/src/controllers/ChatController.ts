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

      console.log(`[CONTROLLER] Creating new chat for user ${userId}`);

      if (!message || !userId) {
        console.log(`[CONTROLLER] Invalid input: message=${!!message}, userId=${!!userId}`);
        return res.status(400).json({ error: "Message and authentication are required" });
      }

      if (model) {
        console.log(`[CONTROLLER] Setting LLM model to: ${model}`);
        this.llm.setModel(model);
      }

      // 1. Create the user message
      const userMessage = new Message(message, MessageType.USER);

      // 2. Generate title using LLM
      console.log(`[CONTROLLER] Generating title for new chat`);
      const title = await this.llm.generateTitle(message);
      console.log(`[CONTROLLER] Generated title: ${title}`);

      // 3. Create the chat object
      const newChat = new Chat(userId, title, userMessage);
      console.log(`[CONTROLLER] Created chat object with ID: ${newChat.id}`);

      // 4. Save the initial chat to DB and Cache
      await this.storageManager.saveNewChat(newChat);

      // 5. Get response from LLM
      console.log(`[CONTROLLER] Getting AI response for chat ${newChat.id}`);
      const aiResponseText = await this.llm.getResponse(newChat.messages);
      console.log(`[CONTROLLER] Received AI response (length: ${aiResponseText.length})`);

      // 6. Convert response string to Message object
      const aiMessage = new Message(aiResponseText, MessageType.AI);

      // 7. Add AI message to storage
      await this.storageManager.addMessage(newChat.id, aiMessage);

      // 8. Return the specified response structure
      console.log(`[CONTROLLER] Chat creation completed successfully for chat ${newChat.id}`);
      return res.status(201).json({
        reply: aiResponseText,
        chatID: newChat.id,
        title: newChat.title
      });
    } catch (error) {
      console.error("[CONTROLLER] Create chat error:", error);
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

      console.log(`[CONTROLLER] Sending message to chat ${chatID} from user ${userId}`);

      if (!chatID || typeof chatID !== "string" || !message || !userId) {
        console.log(`[CONTROLLER] Invalid input for sendMessage`);
        return res.status(400).json({ error: "chatID (string), message, and authentication are required" });
      }

      // 1. Verify if chat exists and belongs to user
      const chat = await this.storageManager.getChat(chatID);
      if (!chat) {
        console.log(`[CONTROLLER] Chat ${chatID} not found`);
        return res.status(404).json({ error: "Chat not found" });
      }

      if (chat.userId !== userId) {
        console.log(`[CONTROLLER] Unauthorized access to chat ${chatID}`);
        return res.status(403).json({ error: "Unauthorized access to this chat" });
      }

      if (model) {
        console.log(`[CONTROLLER] Setting LLM model to: ${model}`);
        this.llm.setModel(model);
      }

      // 2. Create user message (don't save yet)
      const userMessage = new Message(message, MessageType.USER);

      // 3. Load current message history for LLM context (without user message)
      console.log(`[CONTROLLER] Loading message history for chat ${chatID}`);
      const currentMessages = await this.storageManager.getMessages(chatID);
      console.log(`[CONTROLLER] Loaded ${currentMessages.length} messages from history`);

      // 4. Get AI response first (only save user message if this succeeds)
      console.log(`[CONTROLLER] Getting AI response for chat ${chatID}`);
      const aiResponseText = await this.llm.getResponse([...currentMessages, userMessage]);
      console.log(`[CONTROLLER] Received AI response (length: ${aiResponseText.length})`);

      // 5. If response succeeded, save user message
      await this.storageManager.addMessage(chatID, userMessage);

      // 6. Create and save AI response
      const aiMessage = new Message(aiResponseText, MessageType.AI);
      await this.storageManager.addMessage(chatID, aiMessage);

      // 7. Return only the AI response text as requested
      console.log(`[CONTROLLER] Message exchange completed for chat ${chatID}`);
      return res.status(200).json({
        reply: aiResponseText
      });
    } catch (error) {
      console.error("[CONTROLLER] Send message error:", error);
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

      console.log(`[CONTROLLER] Fetching messages for chat ${chatID} from user ${userId}`);

      if (!chatID || typeof chatID !== "string" || !userId) {
        console.log(`[CONTROLLER] Invalid input for getChatMessages`);
        return res.status(400).json({ error: "chatID (string) and authentication are required" });
      }

      // 1. Verify chat existence and ownership
      const chat = await this.storageManager.getChat(chatID);
      if (!chat) {
        console.log(`[CONTROLLER] Chat ${chatID} not found`);
        return res.status(404).json({ error: "Chat not found" });
      }

      if (chat.userId !== userId) {
        console.log(`[CONTROLLER] Unauthorized access to chat ${chatID}`);
        return res.status(403).json({ error: "Unauthorized access to this chat" });
      }

      // 2. Fetch messages from storage (handles Cache-Aside)
      const messages = await this.storageManager.getMessages(chatID);
      console.log(`[CONTROLLER] Retrieved ${messages.length} messages for chat ${chatID}`);
      return res.status(200).json(messages);
    } catch (error) {
      console.error("[CONTROLLER] Get chat messages error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Retrieves all chats for the authenticated user.
   */
  public listChats = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      console.log(`[CONTROLLER] Listing chats for user ${userId}`);

      if (!userId) {
        console.log(`[CONTROLLER] Authentication required for listChats`);
        return res.status(401).json({ error: "Authentication required" });
      }

      const chats = await this.storageManager.getChats(userId);
      console.log(`[CONTROLLER] Found ${chats.length} chats for user ${userId}`);
      return res.status(200).json(chats);
    } catch (error) {
      console.error("[CONTROLLER] List chats error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  /**
   * Returns a list of available LLM models.
   */
  public listModels = async (_req: AuthenticatedRequest, res: Response) => {
    try {
      console.log(`[CONTROLLER] Fetching available LLM models`);
      const models = await this.llm.listModels();
      console.log(`[CONTROLLER] Retrieved ${models.length} available models`);
      return res.status(200).json(models);
    } catch (error) {
      console.error("[CONTROLLER] List models error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}
