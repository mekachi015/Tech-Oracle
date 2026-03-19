"""
Groq AI Integration Module
Alternative to Ollama for cloud deployment

Groq provides free API access to Llama3 and other models.
Perfect for deployment without needing to host Ollama.
"""

import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    logger.warning("Groq library not installed. Install with: pip install groq")


def generate_ai_response(
    prompt: str,
    model: str = "llama3-70b-8192",
    temperature: float = 0.7,
    max_tokens: int = 4096
) -> str:
    """
    Generate AI response using Groq API (free tier alternative to Ollama)
    
    Args:
        prompt: The user prompt/question
        model: Model to use (default: llama3-70b-8192)
        temperature: Creativity level (0.0-1.0)
        max_tokens: Maximum response length
    
    Available models (as of 2026):
        - llama3-70b-8192 (recommended - 70B parameters, 8K context)
        - llama3-8b-8192 (faster, smaller model)
        - mixtral-8x7b-32768 (good for longer context)
        - gemma-7b-it (Google's model)
    
    Returns:
        Generated text response
    
    Raises:
        Exception: If Groq API fails or API key is missing
    """
    
    if not GROQ_AVAILABLE:
        raise ImportError(
            "Groq library not installed. "
            "Install it with: pip install groq"
        )
    
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError(
            "GROQ_API_KEY environment variable not set. "
            "Get your API key from: https://console.groq.com"
        )
    
    try:
        # Initialize Groq client
        client = Groq(api_key=api_key)
        
        logger.info(f"Generating AI response with model: {model}")
        
        # Create chat completion
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        
        response_text = chat_completion.choices[0].message.content
        logger.info(f"AI response generated successfully (length: {len(response_text)})")
        
        return response_text
        
    except Exception as e:
        logger.error(f"Groq API error: {str(e)}")
        raise


def check_groq_availability() -> dict:
    """
    Check if Groq is properly configured
    
    Returns:
        Dictionary with status information
    """
    status = {
        "library_installed": GROQ_AVAILABLE,
        "api_key_set": bool(os.getenv("GROQ_API_KEY")),
        "status": "unavailable"
    }
    
    if status["library_installed"] and status["api_key_set"]:
        status["status"] = "available"
    elif not status["library_installed"]:
        status["message"] = "Groq library not installed"
    elif not status["api_key_set"]:
        status["message"] = "GROQ_API_KEY not set"
    
    return status


# Example usage
if __name__ == "__main__":
    # Test the integration
    test_prompt = "Explain how to replace a laptop battery in 3 steps."
    
    try:
        response = generate_ai_response(test_prompt)
        print("AI Response:")
        print(response)
    except Exception as e:
        print(f"Error: {e}")
