"use client";

import { cn } from "@/lib/utils";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp?: Date;
}

export function ChatMessage({ content, isUser, timestamp }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-muted-foreground rounded-bl-md"
        )}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {timestamp && (
          <span
            className={cn(
              "block text-[10px] mt-1 opacity-60",
              isUser ? "text-right" : "text-left"
            )}
          >
            {timestamp.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </div>
  );
}
