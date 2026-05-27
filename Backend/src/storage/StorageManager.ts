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
      console.log(`[STORAGE] Cache MISS for chat ${chatID}. Fetching from DATABASE...`);
      messages = await this.database.getMessages(chatID);
      console.log(`[STORAGE] Retrieved ${messages.length} messages from DATABASE for chat ${chatID}`);
      await this.cache.saveChat(chatID, messages); // Save to cache for future requests
      console.log(`[STORAGE] Saved ${messages.length} messages to CACHE for chat ${chatID}`);
    } else {
      console.log(`[STORAGE] Cache HIT for chat ${chatID}. Retrieved ${messages.length} messages from CACHE`);
    }

    return messages;
  }

  /**
   * Adds a new message to a chat.
   * Saves to database first, then updates/initializes cache.
   */
  async addMessage(chatID: string, message: Message): Promise<void> {
    // 1. Save to persistent database
    console.log(`[STORAGE] Saving message to DATABASE for chat ${chatID}`);
    await this.database.saveHistory(chatID, message);
    console.log(`[STORAGE] Message saved to DATABASE for chat ${chatID}`);

    // 2. Update cache
    try {
      // Try to update existing cache entry
      console.log(`[STORAGE] Adding message to CACHE for chat ${chatID}`);
      await this.cache.addMessage(chatID, message);
      console.log(`[STORAGE] Message added to CACHE for chat ${chatID}`);
    } catch (error) {
      // If cache update fails (chat not in cache), fetch full chat from DB and save to cache
      console.log(`[STORAGE] Cache update failed for chat ${chatID}. Fetching full chat from DATABASE...`);
      const chat = await this.database.getChat(chatID);
      if (chat) {
        await this.cache.saveChat(chat.id, chat.messages);
        console.log(`[STORAGE] Synced ${chat.messages.length} messages to CACHE for chat ${chatID}`);
      }
    }
  }
}
