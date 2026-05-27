export interface Message {
  id: string;
  type: 'User' | 'AI';
  message: string;
}

export interface Chat {
  id: string;
  title: string;
  lastAccessed: string;
}

export interface NewChatResponse {
  reply: string;
  chatID: string;
  title: string;
}