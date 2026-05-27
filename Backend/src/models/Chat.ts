import { v4 as uuidv4 } from 'uuid';
import { Message, schema as messageSchema } from "./Message.js";

export const schema = {
  id: { type: 'string', required: true },
  userId: { type: 'string', required: true },
  title: { type: 'string', required: true },
  lastAccessed: { type: 'string', required: true },
  messages: { type: 'array', items: messageSchema, required: true },
};

export class Chat {
  public id: string;
  public userId: string;
  public title: string;
  public lastAccessed: string;
  public messages: Message[];

  constructor(userId: string, title: string, initialMessage?: Message) {
    this.id = uuidv4();
    this.userId = userId;
    this.title = title;
    this.lastAccessed = new Date().toISOString();
    this.messages = initialMessage ? [initialMessage] : [];
  }
}
