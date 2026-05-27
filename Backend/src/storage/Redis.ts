import type { ICache } from '../interfaces/ICache.js';
import type { Message } from '../models/Message.js';
import type { Chat } from '../models/Chat.js';

/**
 * Dummy Redis implementation that performs no-op for saves 
 * and always returns empty results for fetches.
 * Used temporarily to rely solely on the database.
 */
export class Redis implements ICache {
  private static instance: Redis = new Redis();

  private constructor() {}

  public static getInstance(): Redis {
    return Redis.instance;
  }

  async getMessages(_chatID: string): Promise<Message[]> {
    // Always return empty array to force fallback to DB
    return [];
  }

  async saveHistory(_chatID: string, _message: Message): Promise<void> {
    // No-op: Do nothing, don't throw error
    return;
  }

  async saveChat(_chat: Chat): Promise<void> {
    // No-op: Do nothing, don't throw error
    return;
  }
}
