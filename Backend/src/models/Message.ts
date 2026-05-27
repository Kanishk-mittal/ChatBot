import { v4 as uuidv4 } from 'uuid';

export enum MessageType {
  USER = "User",
  AI = "AI",
}

export const schema = {
  id: { type: 'string', required: true },
  type: { type: 'string', enum: [MessageType.USER, MessageType.AI], required: true },
  message: { type: 'string', required: true },
};

export class Message {
  public id: string;
  public type: MessageType;
  public message: string;

  constructor(message: string, type: MessageType) {
    this.id = uuidv4();
    this.message = message;
    this.type = type;
  }
}
