import { MongoDB } from './MongoDB.js';
import { Redis } from './Redis.js';
import type { IDatabase } from '../interfaces/IDatabase.js';
import type { ICache } from '../interfaces/ICache.js';
import type { Message } from '../models/Message.js';
import type { Chat } from '../models/Chat.js';

export class StorageManager {
  private static instance: StorageManager = new StorageManager();
  public database: IDatabase;
  public cache: ICache;

  private constructor() {
    this.database = MongoDB.getInstance();
    this.cache = Redis.getInstance();
  }

  public static getInstance(): StorageManager {
    return StorageManager.instance;
  }

  /**
   * Fetches all chats for a given user.
   * This is always fetched from the database as per requirement.
   */
  async getChats(userID: string): Promise<Chat[]> {
    return await this.database.getChats(userID);
  }

  /**
   * Fetches messages for a specific chat.
   * Checks cache first, then database.
   */
  async getMessages(chatID: string): Promise<Message[]> {
    // Try cache first
    let messages = await this.cache.getMessages(chatID);
    
    if (messages.length === 0) {
      // If not in cache, fetch from database
      messages = await this.database.getMessages(chatID);
    }
    
    return messages;
  }

  /**
   * Adds a new message to a chat.
   * Saves to database first, then updates/initializes cache.
   */
  async addMessage(chatID: string, message: Message): Promise<void> {
    // 1. Save to persistent database
    await this.database.saveHistory(chatID, message);

    // 2. Update cache
    try {
      // Try to update existing cache entry
      await this.cache.saveHistory(chatID, message);
    } catch (error) {
      // If cache update fails (chat not in cache), fetch full chat from DB and save to cache
      const chat = await this.database.getChat(chatID);
      if (chat) {
        await this.cache.saveChat(chat);
      }
    }
  }
}
