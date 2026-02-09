import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import type { ChatMessage } from "../types";
import { format } from "date-fns";

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isLatest?: boolean;
}

export const ChatMessageBubble = ({
  message,
  isLatest = false,
}: ChatMessageBubbleProps) => {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex gap-3 group",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <Avatar
        className={cn(
          "h-8 w-8 shrink-0 mt-1",
          isAssistant && "bg-primary text-primary-foreground",
          isUser && "bg-muted",
        )}
      >
        <AvatarFallback
          className={cn(
            isAssistant && "bg-primary text-primary-foreground",
            isUser && "bg-muted text-muted-foreground",
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex flex-col max-w-[80%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted rounded-bl-sm",
            isLatest &&
              isAssistant &&
              "animate-in fade-in-0 slide-in-from-left-2 duration-300",
          )}
        >
          <div className="whitespace-pre-wrap wrap-break-word">
            {message.content}
          </div>
        </div>

        {isAssistant &&
          message.suggestedActions &&
          message.suggestedActions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {message.suggestedActions.map((action, index) => (
                <span
                  key={index}
                  className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                >
                  {action}
                </span>
              ))}
            </div>
          )}

        <span
          className={cn(
            "text-[10px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
            isUser && "text-right",
          )}
        >
          {format(new Date(message.createdAt), "HH:mm")}
        </span>
      </div>
    </div>
  );
};
