export enum MessageType {
  USER = "User",
  AI = "AI",
}

export const schema = {
  id: { type: 'string', required: true },
  type: { type: 'string', enum: [MessageType.USER, MessageType.AI], required: true },
  message: { type: 'string', required: true },
  chatId: { type: 'string', required: true },
};

export class Message {
  public id: string;
  public type: MessageType;
  public message: string;
  public chatId: string;

  constructor(id: string, type: MessageType, message: string, chatId: string) {
    this.id = id;
    this.type = type;
    this.message = message;
    this.chatId = chatId;
  }
}
