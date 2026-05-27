import type { Chat, NewChatResponse, Message } from '../types/chat';

const BASE_URL = 'http://localhost:3000/api';

const getHeaders = () => {
  const token = localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export async function createChat(message: string, model?: string): Promise<NewChatResponse> {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ message, model })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to create chat');
  }

  return response.json();
}

export async function sendMessage(chatID: string, message: string, model?: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/chat/${chatID}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ message, model })
  });


  return response.json().then((data) => {
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to send message');
    }
    return data.reply;
  }).catch((error) => {
    console.error('Error sending message:', error);
    throw error;
  });
}

export async function getChatMessages(chatID: string): Promise<Message[]> {
  const response = await fetch(`${BASE_URL}/chat/${chatID}`, {
    method: 'GET',
    headers: getHeaders()
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to get chat messages');
  }

  return response.json();
}

export async function listChats(): Promise<Chat[]> {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: 'GET',
    headers: getHeaders()
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to list chats');
  }

  return response.json();
}

export async function listModels(): Promise<string[]> {
  const response = await fetch(`${BASE_URL}/chat/models`, {
    method: 'GET',
    headers: getHeaders()
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || 'Failed to list models');
  }

  return response.json();
}
