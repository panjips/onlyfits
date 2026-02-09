import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  chatSessionsQuery,
  chatSessionQuery,
  chatMessagesQuery,
  createChatSession,
  deleteChatSession,
  sendChatMessage,
  assistantKeys,
} from "../api";
import type { CreateSessionRequest, SendMessageRequest } from "../types";

export const useChatSessions = () => {
  return useQuery(chatSessionsQuery());
};

export const useChatSession = (sessionId: string) => {
  return useQuery(chatSessionQuery(sessionId));
};

export const useChatMessages = (
  sessionId: string,
  page: number = 1,
  limit: number = 50,
) => {
  return useQuery(chatMessagesQuery(sessionId, page, limit));
};

export const useCreateChatSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req?: CreateSessionRequest) => createChatSession(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assistantKeys.sessions() });
    },
  });
};

export const useDeleteChatSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => deleteChatSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assistantKeys.sessions() });
    },
  });
};

export const useSendChatMessage = (sessionId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (req: SendMessageRequest) => sendChatMessage(req),
    onSuccess: () => {
      if (sessionId) {
        queryClient.invalidateQueries({
          queryKey: assistantKeys.session(sessionId),
        });
        queryClient.invalidateQueries({
          queryKey: assistantKeys.messages(sessionId),
        });
      }

      queryClient.invalidateQueries({ queryKey: assistantKeys.sessions() });
    },
  });
};
