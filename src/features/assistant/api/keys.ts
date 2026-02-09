export const assistantKeys = {
  all: ["assistant"] as const,
  sessions: () => [...assistantKeys.all, "sessions"] as const,
  session: (sessionId: string) =>
    [...assistantKeys.all, "session", sessionId] as const,
  messages: (sessionId: string, page?: number) =>
    [...assistantKeys.all, "messages", sessionId, page] as const,
};
