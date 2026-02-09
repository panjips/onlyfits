import api from "@/lib/apitool/axios";
import { ENDPOINTS } from "@/lib/apitool/endpoints";
import type { BaseResponse } from "@/lib/apitool/response";
import type {
  ChatSession,
  ChatSessionWithMessages,
  ChatMessage,
  ChatbotResponse,
  CreateSessionRequest,
  SendMessageRequest,
} from "../types";
import { assistantKeys } from "./keys";

export const chatSessionsQuery = () => ({
  queryKey: assistantKeys.sessions(),
  queryFn: async (): Promise<ChatSession[]> => {
    const { data } = await api.get<BaseResponse<ChatSession[]>>(
      ENDPOINTS.CHAT_SESSIONS,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch chat sessions");
    }

    return data.data;
  },
});

export const chatSessionQuery = (sessionId: string) => ({
  queryKey: assistantKeys.session(sessionId),
  queryFn: async (): Promise<ChatSessionWithMessages> => {
    const endpoint = ENDPOINTS.CHAT_SESSION_DETAIL.replace(
      ":sessionId",
      sessionId,
    );
    const { data } =
      await api.get<BaseResponse<ChatSessionWithMessages>>(endpoint);

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch chat session");
    }

    return data.data;
  },
  enabled: !!sessionId,
});

export const chatMessagesQuery = (
  sessionId: string,
  page: number = 1,
  limit: number = 50,
) => ({
  queryKey: assistantKeys.messages(sessionId, page),
  queryFn: async (): Promise<ChatMessage[]> => {
    const endpoint = ENDPOINTS.CHAT_MESSAGES.replace(":sessionId", sessionId);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const { data } = await api.get<BaseResponse<ChatMessage[]>>(
      `${endpoint}?${params.toString()}`,
    );

    if (!data.success || !data.data) {
      throw new Error(data.message || "Failed to fetch chat messages");
    }

    return data.data;
  },
  enabled: !!sessionId,
});

export const createChatSession = async (
  req?: CreateSessionRequest,
): Promise<ChatSession> => {
  const { data } = await api.post<BaseResponse<ChatSession>>(
    ENDPOINTS.CHAT_SESSIONS,
    req || {},
  );

  if (!data.success || !data.data) {
    throw new Error(data.message || "Failed to create chat session");
  }

  return data.data;
};

export const deleteChatSession = async (sessionId: string): Promise<void> => {
  const endpoint = ENDPOINTS.CHAT_SESSION_DETAIL.replace(
    ":sessionId",
    sessionId,
  );
  const { data } = await api.delete<BaseResponse<null>>(endpoint);

  if (!data.success) {
    throw new Error(data.message || "Failed to delete chat session");
  }
};

export const sendChatMessage = async (
  req: SendMessageRequest,
): Promise<ChatbotResponse> => {
  const { data } = await api.post<BaseResponse<ChatbotResponse>>(
    ENDPOINTS.CHAT,
    req,
  );

  if (!data.success || !data.data) {
    throw new Error(data.message || "Failed to send message");
  }

  return data.data;
};
