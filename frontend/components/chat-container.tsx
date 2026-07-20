"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Message } from "@/lib/api";

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
}

export function ChatContainer({
  messages,
  isLoading,
  onSendMessage,
  onClearChat,
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto rounded-2xl border bg-card shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">Mindcare Chatbot</h2>
            <p className="text-[10px] text-muted-foreground">
              Hỗ trợ tâm lý học đường
            </p>
          </div>
        </div>
        <button
          onClick={onClearChat}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Mới
        </button>
      </div>

      {/* Messages Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-medium text-lg mb-2">Chào bạn!</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Mình là chatbot tư vấn tâm lý học đường. Bạn có thể chia sẻ 
              những lo lắng, stress hay vấn đề tâm lý nào không?
              Mình sẽ lắng nghe và hỗ trợ bạn.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                content={message.content}
                isUser={message.role === "user"}
              />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
                    </div>
                    <span>Đang trả lời...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-card">
        <ChatInput
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          disabled={false}
        />
      </div>
    </div>
  );
}
