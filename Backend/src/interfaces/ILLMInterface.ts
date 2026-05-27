import type { Message } from "../models/Message.js";

export interface ILLMInterface {
  /**
   * Generates a response from the LLM based on the provided messages.
   * @param messages The conversation history.
   * @returns A Promise resolving to the AI's response text as a string.
   */
  getResponse(messages: Message[]): Promise<string>;

  /**
   * Generates a concise title for a chat based on the first message.
   * @param firstMessage The content of the first message.
   * @returns A Promise resolving to a short title string.
   */
  generateTitle(firstMessage: string): Promise<string>;

  /**
   * Returns a list of available model identifiers.
   * @returns A Promise resolving to an array of model names.
   */
  listModels(): Promise<string[]>;

  /**
   * Sets the model to be used by the LLM service.
   * @param model The model identifier (e.g., 'llama-3.3-70b-versatile').
   */
  setModel(model: string): void;
}
