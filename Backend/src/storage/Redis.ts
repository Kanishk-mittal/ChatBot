import { createClient, type RedisClientType } from 'redis';
import type { ICache } from '../interfaces/ICache.js';
import type { Message } from '../models/Message.js';

/**
 * Redis Stack implementation for caching chat messages and chat metadata.
 * Uses Redis Stack JSON module for efficient object storage and retrieval.
 * Supports complex data structures without serialization overhead.
 */
export class Redis implements ICache {
  private static instance: Redis;
  private client: RedisClientType;
  private readonly MESSAGES_KEY_PREFIX = 'messages:';
  private readonly DEFAULT_TTL = 3600; // 1 hour in seconds

  private constructor(private redisUrl: string = process.env.REDIS_URL || 'redis://:1234@localhost:6379') {
    this.client = createClient({
      url: this.redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      },
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Redis Stack Client Connected');
    });

    // Initialize connection
    this.client.connect().catch((err) => {
      console.error('Failed to connect to Redis:', err);
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
  }

  public static getInstance(redisUrl?: string): Redis {
    if (!Redis.instance) {
      Redis.instance = new Redis(redisUrl);
    }
    return Redis.instance;
  }

  /**
   * Cleanup Redis connection
   */
  private async cleanup(): Promise<void> {
    if (this.client) {
      await this.client.quit();
    }
    process.exit(0);
  }

  /**
   * Retrieve all messages for a chat from cache using JSON
   */
  async getMessages(chatID: string): Promise<Message[]> {
    try {
      const key = `${this.MESSAGES_KEY_PREFIX}${chatID}`;
      const cachedData = await (this.client as any).json.get(key);

      if (!cachedData) {
        return [];
      }

      return cachedData as Message[];
    } catch (error) {
      console.error(`Error retrieving messages from Redis for chat ${chatID}:`, error);
      return [];
    }
  }

  /**
   * Add a message to the chat history in cache using JSON
   */
  async addMessage(chatID: string, message: Message): Promise<void> {
    try {
      const key = `${this.MESSAGES_KEY_PREFIX}${chatID}`;

      try {
        // Try to append to existing array
        await (this.client as any).json.arrAppend(key, '$', message);
      } catch {
        // If key doesn't exist, create it with the first message
        await (this.client as any).json.set(key, '$', [message]);
      }

      // Set TTL on the key
      await this.client.expire(key, this.DEFAULT_TTL);
    } catch (error) {
      console.error(`Error saving message to Redis for chat ${chatID}:`, error);
      // Don't throw - allow graceful degradation to database
    }
  }

  /**
   * Save messages for a chat in cache using JSON
   */
  async saveChat(chatID: string, messages: Message[]): Promise<void> {
    try {
      const key = `${this.MESSAGES_KEY_PREFIX}${chatID}`;

      // Use JSON.SET to store the entire messages array
      await (this.client as any).json.set(key, '$', messages);

      // Set TTL on the key
      await this.client.expire(key, this.DEFAULT_TTL);
    } catch (error) {
      console.error(`Error saving chat to Redis:`, error);
      // Don't throw - allow graceful degradation to database
    }
  }
}
