import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PanelLeftClose, PanelLeft, Loader2, History } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useChatSessions,
  useChatSession,
  useCreateChatSession,
  useDeleteChatSession,
  useSendChatMessage,
} from "../hooks";
import {
  ChatInput,
  ChatMessageBubble,
  ChatSidebar,
  ChatWelcome,
} from "../components";
import type { ChatMessage } from "../types";

export const AssistantPage = () => {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>(
    [],
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: sessions = [], isLoading: isLoadingSessions } =
    useChatSessions();
  const { data: sessionData, isLoading: isLoadingSession } = useChatSession(
    activeSessionId || "",
  );

  const createSession = useCreateChatSession();
  const deleteSession = useDeleteChatSession();
  const sendMessage = useSendChatMessage(activeSessionId || undefined);

  const allMessages = [...(sessionData?.messages || []), ...optimisticMessages];

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [allMessages.length, scrollToBottom]);

  useEffect(() => {
    if (sessionData?.messages) {
      setOptimisticMessages([]);
    }
  }, [sessionData?.messages]);

  const handleNewSession = async () => {
    try {
      const session = await createSession.mutateAsync({});
      setActiveSessionId(session.id);
      setOptimisticMessages([]);
      setIsMobileSidebarOpen(false);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession.mutateAsync(sessionId);
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setOptimisticMessages([]);
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeSessionId) {
      try {
        const session = await createSession.mutateAsync({});
        setActiveSessionId(session.id);

        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error("Failed to create session:", error);
        return;
      }
    }

    const optimisticUserMessage: ChatMessage = {
      id: `optimistic-user-${Date.now()}`,
      sessionId: activeSessionId || "",
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };

    const optimisticLoadingMessage: ChatMessage = {
      id: `optimistic-loading-${Date.now()}`,
      sessionId: activeSessionId || "",
      role: "assistant",
      content: "Thinking...",
      createdAt: new Date().toISOString(),
    };

    setOptimisticMessages([optimisticUserMessage, optimisticLoadingMessage]);

    try {
      const response = await sendMessage.mutateAsync({ query: content });

      setOptimisticMessages([
        optimisticUserMessage,
        {
          id: `optimistic-response-${Date.now()}`,
          sessionId: activeSessionId || "",
          role: "assistant",
          content: response.answer,
          suggestedActions: response.suggested_actions,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Failed to send message:", error);

      setOptimisticMessages([
        optimisticUserMessage,
        {
          id: `optimistic-error-${Date.now()}`,
          sessionId: activeSessionId || "",
          role: "assistant",
          content: "Sorry, I couldn't process your message. Please try again.",
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] md:h-[calc(100vh-6rem)] relative overflow-hidden">
      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent
          side="left"
          className="p-0 w-80 inset-y-0 h-full border-r"
        >
          <div className="h-full pt-12">
            <ChatSidebar
              sessions={sessions}
              activeSessionId={activeSessionId || undefined}
              onSelectSession={(id) => {
                setActiveSessionId(id);
                setOptimisticMessages([]);
                setIsMobileSidebarOpen(false);
              }}
              onNewSession={handleNewSession}
              onDeleteSession={handleDeleteSession}
              isLoading={isLoadingSessions}
              isCreating={createSession.isPending}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar (Collapsible) */}
      <div
        className={cn(
          "hidden md:block border-r bg-card transition-all duration-300 ease-in-out relative z-20",
          isDesktopSidebarOpen ? "w-80" : "w-0 overflow-hidden",
        )}
      >
        <div className="w-80 h-full">
          <ChatSidebar
            sessions={sessions}
            activeSessionId={activeSessionId || undefined}
            onSelectSession={(id) => {
              setActiveSessionId(id);
              setOptimisticMessages([]);
            }}
            onNewSession={handleNewSession}
            onDeleteSession={handleDeleteSession}
            isLoading={isLoadingSessions}
            isCreating={createSession.isPending}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background w-full relative z-10 transition-all duration-300">
        {/* Header */}
        <div className="h-14 border-b flex items-center px-4 gap-3 shrink-0 bg-card/80 backdrop-blur-sm sticky top-0 z-30">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="md:hidden shrink-0"
          >
            <History className="h-5 w-5" />
          </Button>

          {/* Desktop Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
            className="hidden md:flex shrink-0"
          >
            {isDesktopSidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeft className="h-5 w-5" />
            )}
          </Button>

          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-foreground truncate text-sm md:text-base">
              {activeSessionId
                ? sessionData?.session?.name || "New Conversation"
                : "AI Assistant"}
            </h1>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden relative">
          {isLoadingSession && activeSessionId ? (
            <div className="flex flex-col gap-4 p-4 max-w-3xl mx-auto w-full">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <Skeleton className="h-20 flex-1 rounded-2xl" />
                </div>
              ))}
            </div>
          ) : !activeSessionId && allMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center p-4">
              <div className="max-w-md w-full">
                <ChatWelcome />
              </div>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-6 p-4 pb-4 max-w-3xl mx-auto w-full">
                {allMessages.map((message, index) => (
                  <ChatMessageBubble
                    key={message.id}
                    message={message}
                    isLatest={index === allMessages.length - 1}
                  />
                ))}

                {/* Typing Indicator */}
                {sendMessage.isPending &&
                  !optimisticMessages.some((m) =>
                    m.content.includes("Thinking"),
                  ) && (
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
                      </div>
                      <Card className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-muted inline-flex items-center">
                        <div className="flex gap-1">
                          <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                          <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                          <span className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                        </div>
                      </Card>
                    </div>
                  )}

                <div ref={messagesEndRef} className="h-1" />
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 md:p-4 border-t bg-card/80 backdrop-blur-sm z-20 w-full">
          <div className="max-w-3xl mx-auto w-full">
            <ChatInput
              onSend={handleSendMessage}
              isLoading={sendMessage.isPending || createSession.isPending}
              placeholder="Ask me about gym"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
