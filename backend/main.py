"""
Mindcare Student Bot - FastAPI Backend
Connects to Cloudflare Workers AI for Vietnamese mental health counseling chatbot.
"""

import os
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, HTTPException, CORSException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from cloudflare_client import (
    CloudflareAIClient,
    ChatMessage,
    VIETNAMESE_MENTAL_HEALTH_PROMPT,
)

load_dotenv()


# Pydantic models
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    session_id: Optional[str] = None
    conversation_history: Optional[List[dict]] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str
    model: str = "@cf/meta/llama-3.3-70b-instruct-fp8-fast"


class HealthResponse(BaseModel):
    status: str
    cloudflare_ai: bool
    model: str


# Global client instance
cloudflare_client: Optional[CloudflareAIClient] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    global cloudflare_client
    try:
        cloudflare_client = CloudflareAIClient()
        print("Cloudflare AI client initialized successfully")
    except ValueError as e:
        print(f"Warning: Could not initialize Cloudflare AI client: {e}")
        cloudflare_client = None
    yield
    print("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Mindcare Student Bot API",
    description="Vietnamese mental health counseling chatbot backend powered by Cloudflare AI",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://*.vercel.app",
        "https://*.netlify.app",
        "*",  # Allow all origins in development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint for Render keep-alive and monitoring.
    """
    cloudflare_status = False
    if cloudflare_client:
        try:
            cloudflare_status = cloudflare_client.health_check()
        except Exception:
            cloudflare_status = False

    return HealthResponse(
        status="healthy" if cloudflare_status else "degraded",
        cloudflare_ai=cloudflare_status,
        model="@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    )


@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat(request: ChatRequest):
    """
    Chat endpoint - receives user message and returns AI response.
    """
    if not cloudflare_client:
        raise HTTPException(
            status_code=503,
            detail="Cloudflare AI client not configured. Please set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID."
        )

    try:
        # Build conversation history for context
        messages = []
        if request.conversation_history:
            for msg in request.conversation_history[-10:]:  # Limit to last 10 messages
                messages.append(ChatMessage(
                    role=msg.get("role", "user"),
                    content=msg.get("content", "")
                ))

        # Add current message
        messages.append(ChatMessage(role="user", content=request.message))

        # Call Cloudflare AI
        response_text = cloudflare_client.chat(
            model="@cf/meta/llama-3.3-70b-instruct-fp8-fast",
            messages=messages,
            system_prompt=VIETNAMESE_MENTAL_HEALTH_PROMPT,
            max_tokens=512,
            temperature=0.7,
        )

        # Generate or use session_id
        session_id = request.session_id or f"session_{hash(request.message) % 1000000}"

        return ChatResponse(
            response=response_text,
            session_id=session_id,
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat request: {str(e)}"
        )


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - API information."""
    return {
        "name": "Mindcare Student Bot API",
        "version": "1.0.0",
        "description": "Vietnamese mental health counseling chatbot",
        "endpoints": {
            "health": "/health",
            "chat": "POST /chat",
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
