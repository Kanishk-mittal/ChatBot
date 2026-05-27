import mongoose from 'mongoose';
import type { IDatabase } from '../interfaces/IDatabase.js';
import type { Message } from '../models/Message.js';
import { Chat, schema as chatSchema } from '../models/Chat.js';
import { SchemaFactory } from '../factories/SchemaFactory.js';
import dotenv from 'dotenv';

dotenv.config();

export class MongoDB implements IDatabase {
  private static instance: MongoDB = new MongoDB();
  public dbModel: mongoose.Model<any>;
  public connection: mongoose.Connection | null = null;

  private constructor() {
    const mongooseSchemaDefinition = SchemaFactory.getMongooseSchema(chatSchema);
    const schema = new mongoose.Schema(mongooseSchemaDefinition);
    this.dbModel = mongoose.model('Chat', schema);
    this.connect();
  }

  public static getInstance(): MongoDB {
    return MongoDB.instance;
  }

  private async connect() {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/chatbot';
    try {
      await mongoose.connect(uri);
      this.connection = mongoose.connection;
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection error:', error);
    }
  }

  async getMessages(chatID: string): Promise<Message[]> {
    const chat = await this.dbModel.findOne({ id: chatID }).lean();
    return chat ? (chat as any).messages : [];
  }

  async getChat(chatID: string): Promise<Chat | null> {
    return await this.dbModel.findOne({ id: chatID }).lean() as Chat | null;
  }

  async saveChat(chat: Chat): Promise<void> {
    await this.dbModel.updateOne(
      { id: chat.id },
      { $set: chat },
      { upsert: true }
    );
  }

  async getChats(userID: string): Promise<Chat[]> {
    return await this.dbModel.find({ userId: userID }).lean() as Chat[];
  }

  async saveHistory(chatID: string, message: Message): Promise<void> {
    await this.dbModel.updateOne(
      { id: chatID },
      { $push: { messages: message }, $set: { lastAccessed: new Date().toISOString() } },
      { upsert: true }
    );
  }
}
