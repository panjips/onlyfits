import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogIn, LogOut, Clock, Users } from "lucide-react";
import type { CheckInLogEntry } from "../types";

interface CheckInLogProps {
  entries: CheckInLogEntry[];
  isLoading?: boolean;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return formatTime(date);
};

export function CheckInLog({ entries, isLoading = false }: CheckInLogProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-ld">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />
            Activity Log
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-ld">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4" />
            Activity Log
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Clock className="w-12 h-12 opacity-50" />
            <span className="text-sm">No activity yet</span>
            <span className="text-xs">Scan a member's QR code to begin</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-ld">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Users className="w-4 h-4" />
          Activity Log
        </h3>
        <Badge variant="gray" className="text-xs">
          {entries.length} entries
        </Badge>
      </div>

      {/* Log Entries */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-border">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 p-4 hover:bg-muted/20 transition-colors"
            >
              {/* Avatar */}
              <Avatar className="w-10 h-10 border-2 border-border">
                <AvatarImage src={entry.avatarUrl} alt={entry.memberName} />
                <AvatarFallback className="bg-lightprimary text-primary text-xs font-medium">
                  {getInitials(entry.memberName)}
                </AvatarFallback>
              </Avatar>

              {/* Member Info */}
              <div className="flex-1 min-w-0 max-w-full">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground truncate max-w-[150px] sm:max-w-[200px]">
                    {entry.memberName}
                  </span>
                  {entry.type === "check-in" ? (
                    <Badge variant="lightSuccess" className="text-[10px] px-1.5 py-0.5 shrink-0">
                      <LogIn className="w-3 h-3 mr-0.5" />
                      IN
                    </Badge>
                  ) : (
                    <Badge variant="lightError" className="text-[10px] px-1.5 py-0.5 shrink-0">
                      <LogOut className="w-3 h-3 mr-0.5" />
                      OUT
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground truncate block max-w-[200px] sm:max-w-xs">
                  {entry.memberEmail}
                </span>
              </div>

              {/* Time */}
              <div className="flex flex-col items-end text-right shrink-0">
                <span className="text-sm font-medium text-foreground">
                  {formatTime(entry.timestamp)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(entry.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
