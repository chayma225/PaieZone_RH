export interface ChatSession {
  id: number;
  sessionTitle: string;
  userLogin: string;
  createdAt: string;
  lastActivity: string;
  active: boolean;
  messages?: ChatMessage[];
  messageCount?: number;
}

export interface ChatMessage {
  id: number;
  sessionId: number;
  role: 'user' | 'assistant';
  content: string;
  sentAt: string;
  escalatedToHuman: boolean;
  intent?: string;
}

export interface ChatRequest {
  message: string;
}

export interface ChatbotHealth {
  status: string;
  model: string;
}
