import type { Message } from "../models/Message.js";
import type { Chat } from "../models/Chat.js";

export interface IDatabase {
  getMessages(chatID: string): Promise<Message[]>;
  getChats(userID: string): Promise<Chat[]>;
  getChat(chatID: string): Promise<Chat | null>;
  saveChat(chat: Chat): Promise<void>;
  saveHistory(chatID: string, message: Message): Promise<void>;
}
