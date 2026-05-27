import type { Message } from "../models/Message.js";
import type { Chat } from "../models/Chat.js";

export interface ICache {
  getMessages(chatID: string): Promise<Message[]>;
  addMessage(chatID: string, message: Message): Promise<void>;
  saveChat(chatID: string, messages: Message[]): Promise<void>;
}
