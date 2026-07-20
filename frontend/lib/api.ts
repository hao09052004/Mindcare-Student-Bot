/**
 * API client for Mindcare Chatbot Backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  conversation_history?: Message[];
}

export interface ChatResponse {
  response: string;
  session_id: string;
  model: string;
}

export interface HealthResponse {
  status: string;
  cloudflare_ai: boolean;
  model: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new ApiError(
      error.detail || `HTTP error ${response.status}`,
      response.status
    );
  }
  return response.json();
}

export const api = {
  async healthCheck(): Promise<HealthResponse> {
    const response = await fetch(`${API_URL}/health`);
    return handleResponse<HealthResponse>(response);
  },

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    return handleResponse<ChatResponse>(response);
  },

  getApiUrl(): string {
    return API_URL;
  },
};
