"""
████████████████████████████████████████████████████████████████████████
█ C.H.A.O.S. PYTHON INTERFACE - API CLIENT                           █
█ Client library for interacting with the C.H.A.O.S. API              █
████████████████████████████████████████████████████████████████████████

[CODEX] This module provides a Python client for interacting with the C.H.A.O.S.
API. It handles authentication, WebSocket connections, and provides a clean
interface for all API endpoints. It's designed to work seamlessly across
Windows and Linux platforms, with proper error handling and retry logic.
"""

import os
import json
import time
import asyncio
import logging
from typing import Dict, List, Any, Optional, Union, Callable
from pathlib import Path

import aiohttp
import websockets

from .config import config

# [LOGGING] Set up logging based on configuration
logging.basicConfig(
    level=getattr(logging, config.get("logging.level", "INFO")),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.FileHandler(config.get("logging.file", "chaos_python.log")),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("chaos.api")

class ApiError(Exception):
    """[CODEX] Custom exception for API errors with status code and error details"""
    def __init__(self, status_code: int = 0, message: str = "", code: str = "", details: Any = None):
        self.status_code = status_code
        self.error_code = code
        self.details = details
        super().__init__(f"API Error {status_code}: {message}")


class ChaosApiClient:
    """
    [CODEX] Main client for the C.H.A.O.S. API
    Handles authentication, API requests, and WebSocket connections
    """
    def __init__(self, base_url: Optional[str] = None, token: Optional[str] = None):
        """
        Initialize the API client with optional base URL and token
        If not provided, values will be loaded from configuration
        """
        # [CONFIG] Use provided values or load from config
        self.base_url = base_url or config.get("api.url")
        self._token = token
        self._refresh_token = None
        self._ws_connection = None
        self._ws_callbacks = {}
        self._headers = {"Content-Type": "application/json"}
        
        # [AUTH] Load saved tokens if available
        if not self._token:
            self._load_tokens()
            
        # [SETUP] Update headers with auth token if available
        if self._token:
            self._headers["Authorization"] = f"Bearer {self._token}"
    
    def _load_tokens(self) -> None:
        """Load authentication tokens from file if available"""
        token_path = config.get_auth_token_path()
        if token_path.exists():
            try:
                with open(token_path, "r") as f:
                    data = json.load(f)
                    self._token = data.get("token")
                    self._refresh_token = data.get("refreshToken")
                    logger.debug("Loaded auth tokens from file")
            except Exception as e:
                logger.error(f"Error loading auth tokens: {e}")
    
    def _save_tokens(self) -> None:
        """Save authentication tokens to file"""
        if self._token and self._refresh_token:
            token_path = config.get_auth_token_path()
            try:
                with open(token_path, "w") as f:
                    json.dump({
                        "token": self._token,
                        "refreshToken": self._refresh_token
                    }, f)
                logger.debug("Saved auth tokens to file")
            except Exception as e:
                logger.error(f"Error saving auth tokens: {e}")
    
    async def login(self, email: str, password: str) -> Dict[str, Any]:
        """
        Log in to the C.H.A.O.S. platform and obtain authentication tokens
        
        Args:
            email: User's email address
            password: User's password
            
        Returns:
            User data including tokens
            
        Raises:
            ApiError: If authentication fails
        """
        url = f"{self.base_url}/api/auth/login"
        data = {"email": email, "password": password}
        
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data) as response:
                result = await response.json()
                
                if not response.ok:
                    error = result.get("error", {})
                    raise ApiError(
                        status_code=response.status,
                        message=error.get("message", "Authentication failed"),
                        code=error.get("code", "AUTH_ERROR"),
                        details=error
                    )
                
                # [TOKEN] Store tokens
                self._token = result.get("token")
                self._refresh_token = result.get("refreshToken")
                self._headers["Authorization"] = f"Bearer {self._token}"
                
                # [SAVE] Persist tokens
                self._save_tokens()
                
                return result
    
    async def refresh_token(self) -> bool:
        """
        Refresh the access token using the refresh token
        
        Returns:
            True if successful, False otherwise
        """
        if not self._refresh_token:
            logger.error("No refresh token available")
            return False
            
        url = f"{self.base_url}/api/auth/refresh"
        data = {"refreshToken": self._refresh_token}
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=data) as response:
                    if not response.ok:
                        logger.error(f"Failed to refresh token: {response.status}")
                        return False
                        
                    result = await response.json()
                    self._token = result.get("token")
                    self._headers["Authorization"] = f"Bearer {self._token}"
                    self._save_tokens()
                    logger.debug("Successfully refreshed token")
                    return True
        except Exception as e:
            logger.error(f"Error refreshing token: {e}")
            return False
    
    async def logout(self) -> bool:
        """
        Log out and invalidate the refresh token
        
        Returns:
            True if successful, False otherwise
        """
        if not self._refresh_token:
            return True
            
        url = f"{self.base_url}/api/auth/logout"
        data = {"refreshToken": self._refresh_token}
        
        try:
            async with aiohttp.ClientSession(headers=self._headers) as session:
                async with session.post(url, json=data) as response:
                    # Clear tokens regardless of response
                    self._token = None
                    self._refresh_token = None
                    self._headers.pop("Authorization", None)
                    
                    # Remove saved tokens
                    token_path = config.get_auth_token_path()
                    if token_path.exists():
                        os.remove(token_path)
                    
                    return response.ok
        except Exception as e:
            logger.error(f"Error logging out: {e}")
            # Still clear tokens on error
            self._token = None
            self._refresh_token = None
            self._headers.pop("Authorization", None)
            return False
    
    async def get_current_user(self) -> Dict[str, Any]:
        """
        Get the currently authenticated user's profile
        
        Returns:
            User profile data
            
        Raises:
            ApiError: If request fails
        """
        return await self._request("GET", "/api/users/me")
    
    async def update_user_status(self, status: str, status_message: Optional[str] = None) -> Dict[str, Any]:
        """
        Update the user's online status and message
        
        Args:
            status: One of 'ONLINE', 'IDLE', 'DO_NOT_DISTURB', 'INVISIBLE', 'OFFLINE', 'CUSTOM'
            status_message: Optional status message
            
        Returns:
            Updated status data
            
        Raises:
            ApiError: If request fails
        """
        data = {"status": status}
        if status_message:
            data["statusMessage"] = status_message
            
        return await self._request("POST", "/api/users/status", data)
    
    async def get_friends(self) -> List[Dict[str, Any]]:
        """
        Get the user's friends list
        
        Returns:
            List of friend objects
            
        Raises:
            ApiError: If request fails
        """
        result = await self._request("GET", "/api/friends")
        return result.get("friends", [])
    
    async def get_friend_requests(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get pending friend requests (both sent and received)
        
        Returns:
            Dictionary with 'sent' and 'received' lists
            
        Raises:
            ApiError: If request fails
        """
        result = await self._request("GET", "/api/friends/requests")
        return {
            "sent": result.get("sent", []),
            "received": result.get("received", [])
        }
    
    async def send_friend_request(self, user_id: str) -> Dict[str, Any]:
        """
        Send a friend request to another user
        
        Args:
            user_id: The ID of the user to send the request to
            
        Returns:
            Friend request data
            
        Raises:
            ApiError: If request fails
        """
        return await self._request("POST", "/api/friends/requests", {"userId": user_id})
    
    async def respond_to_friend_request(self, request_id: str, accept: bool) -> Dict[str, Any]:
        """
        Accept or decline a friend request
        
        Args:
            request_id: The ID of the friend request
            accept: True to accept, False to decline
            
        Returns:
            Response data
            
        Raises:
            ApiError: If request fails
        """
        return await self._request(
            "POST", 
            f"/api/friends/requests/{request_id}/respond", 
            {"accept": accept}
        )
    
    async def get_conversations(self, limit: int = 20) -> List[Dict[str, Any]]:
        """
        Get recent conversations
        
        Args:
            limit: Maximum number of conversations to return
            
        Returns:
            List of conversation objects
            
        Raises:
            ApiError: If request fails
        """
        result = await self._request("GET", f"/api/messages/conversations?limit={limit}")
        return result.get("conversations", [])
    
    async def get_messages(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get message history with a specific user
        
        Args:
            user_id: The ID of the other user
            limit: Maximum number of messages to return
            
        Returns:
            List of message objects
            
        Raises:
            ApiError: If request fails
        """
        result = await self._request("GET", f"/api/messages/{user_id}?limit={limit}")
        return result.get("messages", [])
    
    async def send_message(self, 
                         user_id: str, 
                         content: str, 
                         reply_to_id: Optional[str] = None, 
                         encrypted: bool = False) -> Dict[str, Any]:
        """
        Send a direct message to another user
        
        Args:
            user_id: The ID of the recipient
            content: Message content
            reply_to_id: Optional ID of the message being replied to
            encrypted: Whether the message is end-to-end encrypted
            
        Returns:
            Sent message data
            
        Raises:
            ApiError: If request fails
        """
        data = {
            "receiverId": user_id,
            "content": content,
            "encrypted": encrypted
        }
        
        if reply_to_id:
            data["replyToId"] = reply_to_id
            
        return await self._request("POST", "/api/messages", data)
    
    async def get_hubs(self) -> List[Dict[str, Any]]:
        """
        Get the list of hubs the user is a member of
        
        Returns:
            List of hub objects
            
        Raises:
            ApiError: If request fails
        """
        result = await self._request("GET", "/api/hubs")
        return result.get("hubs", [])
    
    async def create_hub(self, 
                        name: str, 
                        description: Optional[str] = None, 
                        icon_url: Optional[str] = None, 
                        is_public: bool = False) -> Dict[str, Any]:
        """
        Create a new hub
        
        Args:
            name: Hub name
            description: Optional hub description
            icon_url: Optional URL to hub icon
            is_public: Whether the hub is publicly discoverable
            
        Returns:
            Created hub data
            
        Raises:
            ApiError: If request fails
        """
        data = {"name": name, "isPublic": is_public}
        
        if description:
            data["description"] = description
            
        if icon_url:
            data["iconUrl"] = icon_url
            
        return await self._request("POST", "/api/hubs", data)
    
    async def get_hub_channels(self, hub_id: str) -> List[Dict[str, Any]]:
        """
        Get all channels in a hub
        
        Args:
            hub_id: The ID of the hub
            
        Returns:
            List of channel objects
            
        Raises:
            ApiError: If request fails
        """
        result = await self._request("GET", f"/api/channels/hub/{hub_id}")
        return result.get("channels", [])
    
    async def create_channel(self,
                           hub_id: str,
                           name: str,
                           description: Optional[str] = None,
                           channel_type: str = "TEXT") -> Dict[str, Any]:
        """
        Create a new channel in a hub
        
        Args:
            hub_id: The ID of the hub
            name: Channel name (lowercase, no spaces)
            description: Optional channel description
            channel_type: Channel type (TEXT, VOICE, VIDEO, ANNOUNCEMENT, STREAM)
            
        Returns:
            Created channel data
            
        Raises:
            ApiError: If request fails
        """
        data = {
            "hubId": hub_id,
            "name": name,
            "type": channel_type
        }
        
        if description:
            data["description"] = description
            
        return await self._request("POST", "/api/channels", data)
    
    async def get_channel_messages(self, channel_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get messages in a channel
        
        Args:
            channel_id: The ID of the channel
            limit: Maximum number of messages to return
            
        Returns:
            List of message objects
            
        Raises:
            ApiError: If request fails
        """
        result = await self._request("GET", f"/api/channels/{channel_id}/messages?limit={limit}")
        return result.get("messages", [])
    
    async def send_channel_message(self,
                                 channel_id: str,
                                 content: str,
                                 reply_to_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Send a message to a channel
        
        Args:
            channel_id: The ID of the channel
            content: Message content
            reply_to_id: Optional ID of the message being replied to
            
        Returns:
            Sent message data
            
        Raises:
            ApiError: If request fails
        """
        data = {"content": content}
        
        if reply_to_id:
            data["replyToId"] = reply_to_id
            
        return await self._request("POST", f"/api/channels/{channel_id}/messages", data)
    
    # [WEBSOCKET] WebSocket connection handling
    
    async def connect_websocket(self) -> None:
        """
        Establish a WebSocket connection to receive real-time events
        
        Raises:
            ConnectionError: If connection fails
        """
        if not self._token:
            raise ValueError("Authentication required before connecting to WebSocket")
            
        ws_url = config.get("api.websocket", "ws://localhost:3000/ws")
        
        try:
            self._ws_connection = await websockets.connect(
                f"{ws_url}?token={self._token}",
                extra_headers=self._headers
            )
            
            logger.info("WebSocket connection established")
            
            # Start listener task
            asyncio.create_task(self._ws_listener())
            
        except Exception as e:
            logger.error(f"Failed to connect to WebSocket: {e}")
            raise ConnectionError(f"WebSocket connection failed: {e}")
    
    async def _ws_listener(self) -> None:
        """Background task that listens for WebSocket messages"""
        if not self._ws_connection:
            return
            
        try:
            async for message in self._ws_connection:
                try:
                    data = json.loads(message)
                    event_type = data.get("event")
                    payload = data.get("data", {})
                    
                    # Handle connection established specially
                    if event_type == "connection:established":
                        logger.debug("WebSocket connection confirmed")
                        continue
                        
                    # Process callbacks for this event type
                    await self._process_event(event_type, payload)
                    
                except json.JSONDecodeError:
                    logger.error(f"Received invalid JSON from WebSocket: {message}")
                except Exception as e:
                    logger.error(f"Error processing WebSocket message: {e}")
        except websockets.ConnectionClosed:
            logger.info("WebSocket connection closed")
        except Exception as e:
            logger.error(f"WebSocket listener error: {e}")
        finally:
            self._ws_connection = None
    
    async def _process_event(self, event_type: str, data: Dict[str, Any]) -> None:
        """Process a WebSocket event and trigger callbacks"""
        if event_type in self._ws_callbacks:
            for callback in self._ws_callbacks[event_type]:
                try:
                    if asyncio.iscoroutinefunction(callback):
                        await callback(data)
                    else:
                        callback(data)
                except Exception as e:
                    logger.error(f"Error in WebSocket callback for {event_type}: {e}")
    
    def on_event(self, event_type: str, callback: Callable[[Dict[str, Any]], Any]) -> None:
        """
        Register a callback for a specific WebSocket event type
        
        Args:
            event_type: The event type to listen for
            callback: Function to call when event is received (can be async)
        """
        if event_type not in self._ws_callbacks:
            self._ws_callbacks[event_type] = []
            
        self._ws_callbacks[event_type].append(callback)
        logger.debug(f"Registered callback for event type: {event_type}")
    
    async def send_ws_event(self, event: str, payload: Dict[str, Any]) -> None:
        """
        Send an event through the WebSocket connection
        
        Args:
            event: Event type
            payload: Event data
            
        Raises:
            ConnectionError: If WebSocket is not connected
        """
        if not self._ws_connection:
            raise ConnectionError("WebSocket not connected")
            
        message = json.dumps({
            "event": event,
            "payload": payload
        })
        
        await self._ws_connection.send(message)
    
    async def close_websocket(self) -> None:
        """Close the WebSocket connection if open"""
        if self._ws_connection:
            await self._ws_connection.close()
            self._ws_connection = None
            logger.debug("WebSocket connection closed")
    
    # [HELPER] HTTP request utility
    
    async def _request(self, 
                     method: str, 
                     endpoint: str, 
                     data: Optional[Dict[str, Any]] = None, 
                     retry_auth: bool = True) -> Dict[str, Any]:
        """
        Send a request to the API
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint (starting with /)
            data: Optional request body
            retry_auth: Whether to retry with token refresh on auth failure
            
        Returns:
            Response data
            
        Raises:
            ApiError: If request fails
        """
        url = f"{self.base_url}{endpoint}"
        
        async with aiohttp.ClientSession() as session:
            # Prepare request arguments
            kwargs = {"headers": self._headers}
            if data:
                kwargs["json"] = data
                
            # Send request
            request_method = getattr(session, method.lower())
            async with request_method(url, **kwargs) as response:
                response_data = await response.json()
                
                # Handle authentication errors with token refresh
                if response.status == 401 and retry_auth and self._refresh_token:
                    logger.debug("Auth failed, attempting token refresh")
                    refresh_success = await self.refresh_token()
                    
                    if refresh_success:
                        # Retry the request with the new token
                        return await self._request(method, endpoint, data, False)
                
                # Handle other errors
                if not response.ok:
                    error = response_data.get("error", {})
                    raise ApiError(
                        status_code=response.status,
                        message=error.get("message", "Request failed"),
                        code=error.get("code", "API_ERROR"),
                        details=error
                    )
                
                return response_data


# [EXAMPLE] Example usage
async def example_usage():
    """Example demonstrating basic client usage"""
    client = ChaosApiClient()
    
    # Login
    user_data = await client.login("user@example.com", "password")
    print(f"Logged in as: {user_data['user']['username']}")
    
    # Get friends
    friends = await client.get_friends()
    print(f"You have {len(friends)} friends")
    
    # Set up WebSocket handlers
    await client.connect_websocket()
    
    client.on_event("message", lambda msg: print(f"New message: {msg['content']}"))
    client.on_event("user:online", lambda user: print(f"{user['username']} is now online"))
    
    # Send a message
    if friends:
        first_friend = friends[0]
        message = await client.send_message(
            first_friend["id"],
            "Hello from the Python API client!"
        )
        print(f"Sent message with ID: {message['id']}")
    
    # Wait for WebSocket events
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        print("Closing connection...")
    finally:
        await client.close_websocket()
        await client.logout()

if __name__ == "__main__":
    asyncio.run(example_usage())
