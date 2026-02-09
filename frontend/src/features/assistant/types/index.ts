// Chat Session Types
export interface ChatSession {
  id: string;
  userId: string;
  name?: string;
  summary?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant" | "system";
  content: string;
  context?: Record<string, unknown>;
  suggestedActions?: string[];
  createdAt: string;
}

export interface ChatSessionWithMessages {
  session: ChatSession;
  messages: ChatMessage[];
}

// Request Types
export interface CreateSessionRequest {
  name?: string;
  metadata?: Record<string, unknown>;
}

export interface SendMessageRequest {
  query: string;
}

// Response Types
export interface ChatbotResponse {
  answer: string;
  suggested_actions?: string[];
}
