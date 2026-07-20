"""
Cloudflare Workers AI client wrapper for Mindcare Chatbot.
Uses the REST API to interact with Cloudflare Workers AI models.
"""

import os
from typing import List, Optional
from dataclasses import dataclass

import httpx
from dotenv import load_dotenv

load_dotenv()


@dataclass
class ChatMessage:
    role: str
    content: str


class CloudflareAIClient:
    """Client for Cloudflare Workers AI REST API."""

    BASE_URL = "https://api.cloudflare.com/client/v4/accounts/{account_id}/ai"

    def __init__(self, api_token: Optional[str] = None, account_id: Optional[str] = None):
        self.api_token = api_token or os.getenv("CLOUDFLARE_API_TOKEN")
        self.account_id = account_id or os.getenv("CLOUDFLARE_ACCOUNT_ID")

        if not self.api_token or not self.account_id:
            raise ValueError(
                "CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID must be set"
            )

        self.headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json",
        }

    def chat(
        self,
        model: str,
        messages: List[ChatMessage],
        system_prompt: Optional[str] = None,
        max_tokens: int = 512,
        temperature: float = 0.7,
    ) -> str:
        """
        Send a chat request to Cloudflare Workers AI.

        Args:
            model: The model ID (e.g., "@cf/meta/llama-3.3-70b-instruct-fp8-fast")
            messages: List of chat messages
            system_prompt: Optional system prompt to prepend
            max_tokens: Maximum tokens in response
            temperature: Sampling temperature

        Returns:
            The model's response text
        """
        # Build messages array with system prompt if provided
        api_messages = []
        if system_prompt:
            api_messages.append({"role": "system", "content": system_prompt})
        api_messages.extend([{"role": m.role, "content": m.content} for m in messages])

        payload = {
            "messages": api_messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "model": model,  # Required for @cf/ models
        }

        url = f"{self.BASE_URL}/v1/chat/completions"
        full_url = url.format(account_id=self.account_id)

        with httpx.Client(timeout=60.0) as client:
            response = client.post(
                full_url,
                headers=self.headers,
                json=payload,
            )
            response.raise_for_status()
            data = response.json()

        # Extract response from OpenAI-compatible format
        choices = data.get("choices", [])
        if not choices:
            raise ValueError("No response from Cloudflare AI")

        return choices[0]["message"]["content"]

    def health_check(self) -> bool:
        """Check if the API is accessible."""
        url = f"{self.BASE_URL}/models"
        full_url = url.format(account_id=self.account_id)

        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.get(full_url, headers=self.headers)
                return response.status_code == 200
        except Exception:
            return False


# Default system prompt for Vietnamese mental health counseling
VIETNAMESE_MENTAL_HEALTH_PROMPT = """Bạn là một chatbot tư vấn tâm lý học đường tại Việt Nam.
Nhiệm vụ của bạn là lắng nghe, thấu hiểu và đưa ra lời khuyên hữu ích cho học sinh.

Nguyên tắc:
1. Thể hiện sự đồng cảm và không phán xét
2. Sử dụng ngôn ngữ dễ hiểu, gần gũi với học sinh
3. Đưa ra lời khuyên thực tế và khả thi
4. Khuyến khích học sinh chia sẻ thêm cảm xúc
5. Nếu phát hiện dấu hiệu khủng hoảng (tự tử, tự gây thương tích), hãy:
   - Thể hiện sự quan tâm chân thành
   - Khuyên học sinh liên hệ đường dây nóng hỗ trợ tâm lý
   - Gợi ý gặp chuyên gia tâm lý

Luôn trả lời bằng tiếng Việt."""


def get_default_client() -> CloudflareAIClient:
    """Factory function to get a configured Cloudflare AI client."""
    return CloudflareAIClient()
