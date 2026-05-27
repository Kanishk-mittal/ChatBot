import Groq from "groq-sdk";
import type { ILLMInterface } from "../interfaces/ILLMInterface.js";
import { Message, MessageType } from "../models/Message.js";
import dotenv from "dotenv";

dotenv.config();

export class GroqService implements ILLMInterface {
  private groq: Groq;
  private apiKey: string;
  private modelName: string;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("GROQ_API_KEY is not defined in environment variables");
    }
    this.groq = new Groq({ apiKey: this.apiKey });
    this.modelName = "llama-3.1-8b-instant"; // Default model
  }

  public setModel(model: string): void {
    this.modelName = model;
  }

  /**
   * Lists all available Groq models.
   */
  public async listModels(): Promise<string[]> {
    try {
      const response = await this.groq.models.list();
      return response.data.map((model) => model.id);
    } catch (error) {
      console.error("Error listing available models:", error);
      return [];
    }
  }

  /**
   * Helper method to retry LLM calls with exponential backoff.
   */
  private async retry<T>(fn: () => Promise<T>, retries: number = 3, delay: number = 1000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      // Don't retry on authentication or permission errors
      if (error.status === 401 || error.status === 403) {
        console.error(`Auth/Permission error (${error.status}): ${error.message}`);
        throw error;
      }

      // Retry on rate limit errors or server errors
      if (retries > 0 && (error.status === 429 || error.status >= 500)) {
        console.warn(`Error (${error.status}). Retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retry(fn, retries - 1, delay * 2); // Exponential backoff
      }

      throw error;
    }
  }

  /**
   * Generates a concise title for the chat based on the first message.
   */
  public async generateTitle(firstMessage: string): Promise<string> {
    return this.retry(async () => {
      try {
        const prompt = `Generate a concise, catchy title (maximum 5 words) for a chat that starts with this message: "${firstMessage}". Return only the title text, no quotes or extra formatting.`;

        const response = await this.groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: this.modelName,
        });

        const title = response.choices[0]?.message?.content?.trim();
        return title || "New Chat";
      } catch (error) {
        console.error("Groq Title Generation attempt failed:", error);
        throw error;
      }
    }).catch((error) => {
      console.error("Groq Title Generation final failure:", error);
      return firstMessage.length > 30 ? firstMessage.substring(0, 27) + "..." : firstMessage;
    });
  }

  /**
   * Generates a response from Groq based on the message history.
   */
  public async getResponse(messages: Message[]): Promise<string> {
    return this.retry(async () => {
      try {
        const groqMessages = messages.map((msg) => ({
          role: msg.type === MessageType.USER ? "user" as const : "assistant" as const,
          content: msg.message,
        }));

        const response = await this.groq.chat.completions.create({
          messages: groqMessages,
          model: this.modelName,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error("No content received from Groq");
        }

        console.log("Groq response received");
        return content;
      } catch (error) {
        console.error("Groq API attempt failed:", error);
        throw error;
      }
    }).catch((error) => {
      console.error("Groq API final failure:", error);
      throw new Error("Failed to get response from Groq after multiple retries");
    });
  }
}
