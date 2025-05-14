"""
████████████████████████████████████████████████████████████████████████
█ C.H.A.O.S. PYTHON INTERFACE - OLLAMA CLIENT                         █
█ Integration with Ollama for AI-powered features                      █
████████████████████████████████████████████████████████████████████████

[CODEX] This module provides an interface to Ollama for AI capabilities in C.H.A.O.S.
It offers functionality for message analysis, response generation, content moderation,
and other AI features to enhance the communication platform.

Default model is configured as llama3.2 per application requirements.
"""

import os
import json
import aiohttp
import logging
from typing import Dict, List, Any, Optional, Union
from pathlib import Path

from .config import config

# [LOGGING] Set up logging
logger = logging.getLogger("chaos.ollama")

class OllamaClient:
    """
    [CODEX] Client for interacting with Ollama LLM services
    Provides AI capabilities for C.H.A.O.S with cross-platform support
    """
    def __init__(self, host: Optional[str] = None, model: Optional[str] = None):
        """Initialize the Ollama client with host and model"""
        self.host = host or config.get("ollama.host", "http://localhost:11434")
        self.model = model or config.get("ollama.model", "llama3.2")
        self.parameters = config.get("ollama.parameters", {
            "temperature": 0.7,
            "top_p": 0.9,
            "max_tokens": 2048
        })
        
        # [DEBUG] Log configuration
        logger.debug(f"Initialized Ollama client with model: {self.model}")
        logger.debug(f"Host: {self.host}")
    
    async def _call_api(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make an API call to Ollama"""
        url = f"{self.host}/{endpoint}"
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"Ollama API error ({response.status}): {error_text}")
                    raise RuntimeError(f"Ollama API error: {response.status} - {error_text}")
                
                return await response.json()
    
    async def generate(self, 
                     prompt: str, 
                     system_prompt: Optional[str] = None,
                     temperature: Optional[float] = None,
                     max_tokens: Optional[int] = None,
                     stream: bool = False) -> Union[str, List[str]]:
        """
        Generate a response from the Ollama model
        
        Args:
            prompt: The user prompt
            system_prompt: Optional system instructions
            temperature: Control randomness (0.0-1.0)
            max_tokens: Maximum tokens to generate
            stream: Whether to stream the response
            
        Returns:
            Generated text or list of text chunks if streaming
        """
        # [PARAMS] Build request parameters
        data = {
            "model": self.model,
            "prompt": prompt,
            "options": {
                "temperature": temperature or self.parameters.get("temperature", 0.7),
                "top_p": self.parameters.get("top_p", 0.9),
                "max_tokens": max_tokens or self.parameters.get("max_tokens", 2048),
            }
        }
        
        # [SYSTEM] Add system prompt if provided
        if system_prompt:
            data["system"] = system_prompt
        
        # [STREAM] Handle streaming responses
        if stream:
            return await self._stream_generate(data)
        
        # [GENERATE] Call the API for a complete response
        result = await self._call_api("api/generate", data)
        return result.get("response", "")
    
    async def _stream_generate(self, data: Dict[str, Any]) -> List[str]:
        """Handle streaming generation from Ollama"""
        url = f"{self.host}/api/generate"
        chunks = []
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"Ollama API error ({response.status}): {error_text}")
                    raise RuntimeError(f"Ollama API error: {response.status} - {error_text}")
                
                # Process the streaming response
                async for line in response.content:
                    if not line:
                        continue
                    
                    try:
                        chunk = json.loads(line)
                        response_chunk = chunk.get("response", "")
                        if response_chunk:
                            chunks.append(response_chunk)
                            
                        # Check for completion
                        if chunk.get("done", False):
                            break
                    except json.JSONDecodeError:
                        logger.warning(f"Failed to decode JSON from response: {line}")
        
        return chunks
    
    async def chat(self, 
                 messages: List[Dict[str, str]], 
                 system_prompt: Optional[str] = None,
                 temperature: Optional[float] = None,
                 max_tokens: Optional[int] = None) -> str:
        """
        Generate a response in chat format
        
        Args:
            messages: List of message objects with 'role' and 'content'
            system_prompt: Optional system instructions
            temperature: Control randomness (0.0-1.0)
            max_tokens: Maximum tokens to generate
            
        Returns:
            Generated response text
        """
        # [PARAMS] Build request parameters
        data = {
            "model": self.model,
            "messages": messages,
            "options": {
                "temperature": temperature or self.parameters.get("temperature", 0.7),
                "top_p": self.parameters.get("top_p", 0.9),
                "max_tokens": max_tokens or self.parameters.get("max_tokens", 2048),
            }
        }
        
        # [SYSTEM] Add system prompt if provided
        if system_prompt:
            data["system"] = system_prompt
        
        # [CHAT] Call the API
        result = await self._call_api("api/chat", data)
        return result.get("message", {}).get("content", "")
    
    async def embed(self, text: str) -> List[float]:
        """
        Generate embeddings for a text
        
        Args:
            text: The text to embed
            
        Returns:
            Vector embedding as a list of floats
        """
        data = {
            "model": self.model,
            "prompt": text,
        }
        
        result = await self._call_api("api/embeddings", data)
        return result.get("embedding", [])
    
    async def analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Analyze the sentiment of a message
        
        Args:
            text: The text to analyze
            
        Returns:
            Sentiment analysis results
        """
        system_prompt = """
        Analyze the sentiment of the following message and categorize it as:
        - POSITIVE: Happy, enthusiastic, friendly, etc.
        - NEUTRAL: Informational, neutral, etc.
        - NEGATIVE: Angry, sad, frustrated, etc.
        
        Respond with a JSON object with the following fields:
        - sentiment: The sentiment category (POSITIVE, NEUTRAL, NEGATIVE)
        - confidence: A number between 0 and 1 indicating confidence
        - emotional_tone: The specific emotion detected
        """
        
        prompt = f"Message to analyze: {text}"
        
        result = await self.generate(prompt, system_prompt, temperature=0.1)
        
        try:
            # Extract JSON from the response
            json_start = result.find('{')
            json_end = result.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = result[json_start:json_end]
                sentiment_data = json.loads(json_str)
                return sentiment_data
            
            # Fallback: Parse simplified response
            if "POSITIVE" in result:
                return {"sentiment": "POSITIVE", "confidence": 0.7, "emotional_tone": "positive"}
            elif "NEGATIVE" in result:
                return {"sentiment": "NEGATIVE", "confidence": 0.7, "emotional_tone": "negative"}
            else:
                return {"sentiment": "NEUTRAL", "confidence": 0.7, "emotional_tone": "neutral"}
        except Exception as e:
            logger.error(f"Error parsing sentiment analysis: {e}")
            return {"sentiment": "NEUTRAL", "confidence": 0.5, "emotional_tone": "unknown"}
    
    async def moderate_content(self, text: str) -> Dict[str, Any]:
        """
        Check if content violates community guidelines
        
        Args:
            text: The text to moderate
            
        Returns:
            Moderation results with flags
        """
        system_prompt = """
        You are a content moderator for a communication platform.
        Evaluate the following message and identify if it contains any of these violations:
        - hate_speech: Hateful content targeting identity
        - harassment: Bullying or harassing content
        - sexual: Explicit sexual content
        - violence: Violent or graphic content
        - self_harm: Content promoting self-harm
        - spam: Unsolicited commercial content

        Respond with a JSON object with the following structure:
        {
            "flagged": true/false,
            "reason": "Primary reason if flagged",
            "flags": {
                "hate_speech": true/false,
                "harassment": true/false,
                "sexual": true/false,
                "violence": true/false,
                "self_harm": true/false,
                "spam": true/false
            },
            "confidence": 0.0-1.0
        }
        """
        
        prompt = f"Message to moderate: {text}"
        
        result = await self.generate(prompt, system_prompt, temperature=0.1)
        
        try:
            # Extract JSON from the response
            json_start = result.find('{')
            json_end = result.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = result[json_start:json_end]
                moderation_data = json.loads(json_str)
                return moderation_data
            
            # Fallback for parsing errors
            if "flagged" in result.lower() and "true" in result.lower():
                return {
                    "flagged": True,
                    "reason": "Content potentially violates guidelines",
                    "flags": {
                        "hate_speech": False,
                        "harassment": False,
                        "sexual": False,
                        "violence": False,
                        "self_harm": False,
                        "spam": False
                    },
                    "confidence": 0.6
                }
            else:
                return {
                    "flagged": False,
                    "reason": None,
                    "flags": {
                        "hate_speech": False,
                        "harassment": False,
                        "sexual": False,
                        "violence": False,
                        "self_harm": False,
                        "spam": False
                    },
                    "confidence": 0.7
                }
        except Exception as e:
            logger.error(f"Error parsing moderation results: {e}")
            return {
                "flagged": False, 
                "reason": "Error processing content",
                "flags": {},
                "confidence": 0.5
            }
    
    async def suggest_reply(self, 
                         conversation_history: List[Dict[str, str]], 
                         user_context: Optional[Dict[str, Any]] = None) -> List[str]:
        """
        Generate suggested replies based on conversation history
        
        Args:
            conversation_history: List of previous messages
            user_context: Optional user preferences and context
            
        Returns:
            List of suggested replies
        """
        # [CONTEXT] Format user context
        context_str = ""
        if user_context:
            context_str = "User context:\n"
            for key, value in user_context.items():
                context_str += f"- {key}: {value}\n"
        
        # [HISTORY] Format conversation history
        history_str = "Conversation history:\n"
        for msg in conversation_history[-6:]:  # Last 6 messages for context
            role = msg.get("role", "user")
            name = msg.get("name", role)
            content = msg.get("content", "")
            history_str += f"{name}: {content}\n"
        
        system_prompt = """
        You are a helpful assistant generating suggested replies for a chat message.
        Generate 3 different suggested responses that are:
        1. Natural and conversational
        2. Concise (maximum 1-2 short sentences each)
        3. Contextually relevant to the conversation
        4. Varied in tone and content

        Format your response as a JSON array of strings, each containing a suggested reply.
        Example: ["Sounds great! When do you want to meet?", "I'm interested. Tell me more.", "Let's discuss this further tomorrow."]
        """
        
        prompt = f"{context_str}\n{history_str}\n\nGenerate 3 suggested replies:"
        
        result = await self.generate(prompt, system_prompt, temperature=0.7)
        
        try:
            # Extract JSON from the response
            json_start = result.find('[')
            json_end = result.rfind(']') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = result[json_start:json_end]
                suggestions = json.loads(json_str)
                return suggestions[:3]  # Ensure we have max 3 suggestions
            
            # Fallback for parsing errors
            suggestions = result.split('\n')
            cleaned_suggestions = []
            
            for suggestion in suggestions:
                # Remove quotes, numbers, and other formatting
                clean = suggestion.strip().strip('"\'').strip()
                if clean and not clean.startswith(('-', '*', '1.', '2.', '3.')):
                    cleaned_suggestions.append(clean)
            
            return cleaned_suggestions[:3]  # Return up to 3 suggestions
        except Exception as e:
            logger.error(f"Error parsing suggestions: {e}")
            return ["I see.", "Tell me more.", "Interesting!"]
    
    async def is_available(self) -> bool:
        """Check if Ollama service is available"""
        try:
            url = f"{self.host}/api/tags"
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    return response.status == 200
        except Exception as e:
            logger.error(f"Ollama availability check failed: {e}")
            return False
    
    async def list_models(self) -> List[str]:
        """List available models in Ollama"""
        try:
            url = f"{self.host}/api/tags"
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status != 200:
                        return []
                    
                    data = await response.json()
                    models = [model.get("name") for model in data.get("models", [])]
                    return models
        except Exception as e:
            logger.error(f"Error listing models: {e}")
            return []
            
    def set_model(self, model_name: str) -> None:
        """Change the active model"""
        self.model = model_name
        
        # Update configuration
        config.set("ollama.model", model_name)
        logger.info(f"Model changed to: {model_name}")
    
    def set_parameters(self, parameters: Dict[str, Any]) -> None:
        """Update generation parameters"""
        self.parameters.update(parameters)
        
        # Update configuration
        config.set("ollama.parameters", self.parameters)
        logger.debug(f"Parameters updated: {parameters}")


# [EXAMPLE] Example usage
async def example_usage():
    """Example demonstrating basic client usage"""
    # Initialize client with default settings (llama3.2)
    client = OllamaClient()
    
    # Check availability
    if not await client.is_available():
        print("Ollama service is not available")
        return
    
    # List available models
    models = await client.list_models()
    print(f"Available models: {models}")
    
    # Generate text
    response = await client.generate(
        "Write a short welcome message for a messaging app called C.H.A.O.S."
    )
    print("\nGenerated welcome message:")
    print(response)
    
    # Chat conversation
    chat_response = await client.chat([
        {"role": "user", "content": "What does C.H.A.O.S. stand for?"},
    ])
    print("\nChat response:")
    print(chat_response)
    
    # Sentiment analysis
    sentiment = await client.analyze_sentiment("I'm really enjoying this new messaging app!")
    print("\nSentiment analysis:")
    print(sentiment)
    
    # Content moderation
    moderation = await client.moderate_content("Let's meet up for coffee tomorrow!")
    print("\nModeration results:")
    print(moderation)
    
    # Suggested replies
    suggestions = await client.suggest_reply([
        {"role": "user", "content": "Hey, want to try out this new messaging app?"},
        {"role": "assistant", "content": "Sure, what's it called?"},
        {"role": "user", "content": "It's called C.H.A.O.S. - really cool retro design!"}
    ])
    print("\nSuggested replies:")
    for suggestion in suggestions:
        print(f"- {suggestion}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(example_usage())
