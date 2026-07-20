"use client";

import { useState, useCallback, useEffect } from "react";
import { AlertCircle, WifiOff, CheckCircle2 } from "lucide-react";
import { ChatContainer } from "@/components/chat-container";
import { api, Message, ApiError } from "@/lib/api";

type ConnectionStatus = "checking" | "connected" | "disconnected" | "error";

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("checking");
  const [error, setError] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    setConnectionStatus("checking");
    try {
      const health = await api.healthCheck();
      setConnectionStatus(health.cloudflare_ai ? "connected" : "disconnected");
    } catch {
      setConnectionStatus("error");
    }
  }, []);

  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const handleSendMessage = async (userMessage: string) => {
    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setError(null);

    try {
      // Send to backend
      const response = await api.chat({
        message: userMessage,
        conversation_history: messages.slice(-10),
      });

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.response },
      ]);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : "Đã xảy ra lỗi. Vui lòng thử lại.";

      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Xin lỗi, mình gặp sự cố khi xử lý tin nhắn của bạn. ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    checkConnection();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between mx-auto px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">M</span>
            </div>
            <span className="font-semibold">Mindcare</span>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {connectionStatus === "checking" && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                <span>Đang kết nối...</span>
              </div>
            )}
            {connectionStatus === "connected" && (
              <div className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Đã kết nối</span>
              </div>
            )}
            {connectionStatus === "disconnected" && (
              <div className="flex items-center gap-1.5 text-sm text-yellow-600">
                <AlertCircle className="h-4 w-4" />
                <span>Cloudflare AI offline</span>
              </div>
            )}
            {connectionStatus === "error" && (
              <div className="flex items-center gap-1.5 text-sm text-red-600">
                <WifiOff className="h-4 w-4" />
                <span>Không thể kết nối</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container px-4 py-8 mx-auto">
        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 rounded-lg border border-destructive/50 bg-destructive/10 text-sm text-destructive">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Lỗi kết nối</p>
                <p className="text-destructive/80">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <ChatContainer
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onClearChat={handleClearChat}
        />

        {/* Disclaimer */}
        <p className="mt-6 text-center text-xs text-muted-foreground max-w-md mx-auto">
          Lưu ý: Đây là chatbot hỗ trợ tâm lý sơ cấp, không thay thế cho 
          chuyên gia tâm lý. Nếu bạn đang gặp khủng hoảng, vui lòng liên hệ 
          đường dây hỗ trợ tâm lý: 1900 1234 (miễn phí, 24/7).
        </p>
      </div>
    </main>
  );
}
