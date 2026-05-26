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

  constructor(
    id: string,
    userId: string,
    title: string,
    lastAccessed: string,
    messages: Message[] = []
  ) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.lastAccessed = lastAccessed;
    this.messages = messages;
  }
}


