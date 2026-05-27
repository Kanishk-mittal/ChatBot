import type { Message } from "../models/Message.js";
import type { Chat } from "../models/Chat.js";

export interface ICache {
  getMessages(chatID: string): Promise<Message[]>;
  saveHistory(chatID: string, message: Message): Promise<void>;
  saveChat(chat: Chat): Promise<void>;
}
