"""
████████████████████████████████████████████████████████████████████████
█ C.H.A.O.S. PYTHON INTERFACE - DEMO APPLICATION                      █
█ Demonstration of Python interface capabilities                       █
████████████████████████████████████████████████████████████████████████

[CODEX] This module demonstrates how to use the C.H.A.O.S. Python interface
to interact with the C.H.A.O.S. backend services. It provides examples of 
authentication, messaging, friend management, and AI-powered features.
"""

import os
import sys
import json
import asyncio
import logging
from getpass import getpass
from typing import Dict, List, Any, Optional

# [IMPORTS] C.H.A.O.S modules
from config import config
from api_client import ChaosApiClient
from ollama_client import OllamaClient

# [LOGGING] Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("chaos.demo")

# [CONSTANTS] Configuration
DEFAULT_SERVER = "http://localhost:3000"
CONFIG_FILE = "demo_config.json"


class ChaosDemoApp:
    """
    [CODEX] Demo application for showcasing C.H.A.O.S. Python interface
    Presents a text-based interface with various examples of API usage
    """
    def __init__(self):
        """Initialize the demo application"""
        self.api_client = ChaosApiClient()
        self.ollama_client = OllamaClient()
        self.user_token = None
        self.user_info = None
        self.connected = False
        
        # [CONFIG] Load saved configuration if exists
        self.load_config()
        
        # [ASYNCIO] Event loop
        self.loop = asyncio.get_event_loop()
    
    def load_config(self) -> None:
        """[CODEX] Load demo configuration from file"""
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r') as f:
                    saved_config = json.load(f)
                
                # Apply saved server URL
                if 'server_url' in saved_config:
                    self.api_client.base_url = saved_config['server_url']
                    logger.info(f"Using saved server URL: {self.api_client.base_url}")
                
                # Load token if exists
                if 'token' in saved_config:
                    self.user_token = saved_config['token']
                    self.api_client.set_token(self.user_token)
                    logger.info("Found saved authentication token")
            except Exception as e:
                logger.error(f"Error loading configuration: {e}")
    
    def save_config(self) -> None:
        """[CODEX] Save demo configuration to file"""
        config_data = {
            'server_url': self.api_client.base_url
        }
        
        # Save token if exists and user consented
        if self.user_token and config.get('demo.save_token', False):
            config_data['token'] = self.user_token
        
        try:
            with open(CONFIG_FILE, 'w') as f:
                json.dump(config_data, f, indent=2)
            logger.info("Configuration saved")
        except Exception as e:
            logger.error(f"Error saving configuration: {e}")
    
    async def check_connection(self) -> bool:
        """[CODEX] Check if the C.H.A.O.S. server is reachable"""
        try:
            health = await self.api_client.get_health()
            logger.info(f"Server health check: {health}")
            self.connected = True
            return True
        except Exception as e:
            logger.error(f"Server connection failed: {e}")
            self.connected = False
            return False
    
    async def check_authentication(self) -> bool:
        """[CODEX] Check if the current token is valid"""
        if not self.user_token:
            logger.warning("No authentication token found")
            return False
        
        try:
            response = await self.api_client.validate_token()
            if response.get('valid', False):
                self.user_info = response.get('user')
                logger.info(f"Authenticated as: {self.user_info.get('username')}")
                return True
            else:
                logger.warning("Invalid or expired token")
                return False
        except Exception as e:
            logger.error(f"Authentication check failed: {e}")
            return False
    
    async def register_user(self) -> bool:
        """[CODEX] Register a new user account"""
        print("\n=== REGISTER NEW USER ===")
        username = input("Username: ")
        email = input("Email: ")
        password = getpass("Password: ")
        confirm_password = getpass("Confirm password: ")
        
        if password != confirm_password:
            print("Passwords do not match!")
            return False
        
        try:
            result = await self.api_client.register(username, email, password)
            print(f"Registration successful! User ID: {result.get('id')}")
            return True
        except Exception as e:
            print(f"Registration failed: {e}")
            return False
    
    async def login(self) -> bool:
        """[CODEX] Login to existing user account"""
        print("\n=== LOGIN ===")
        username = input("Username or email: ")
        password = getpass("Password: ")
        
        try:
            result = await self.api_client.login(username, password)
            self.user_token = result.get('token')
            self.api_client.set_token(self.user_token)
            self.user_info = result.get('user')
            
            # Save token if configured
            save_token = input("Save token for future sessions? (y/n): ").lower() == 'y'
            config.set('demo.save_token', save_token)
            self.save_config()
            
            print(f"Login successful! Welcome, {self.user_info.get('username')}!")
            return True
        except Exception as e:
            print(f"Login failed: {e}")
            return False
    
    async def show_user_profile(self) -> None:
        """[CODEX] Display the current user's profile"""
        if not self.user_info:
            print("Not logged in!")
            return
        
        try:
            # Get the latest user profile
            profile = await self.api_client.get_user_profile()
            
            print("\n=== YOUR PROFILE ===")
            print(f"Username: {profile.get('username')}")
            print(f"Email: {profile.get('email')}")
            print(f"Status: {profile.get('status', 'No status')}")
            print(f"Created: {profile.get('createdAt')}")
            
            # Show friends count
            friends = await self.api_client.get_friends()
            print(f"Friends: {len(friends)}")
            
            # Show hubs count
            hubs = await self.api_client.get_user_hubs()
            print(f"Hubs: {len(hubs)}")
        except Exception as e:
            print(f"Error retrieving profile: {e}")
    
    async def update_status(self) -> None:
        """[CODEX] Update the user's status message"""
        print("\n=== UPDATE STATUS ===")
        status = input("New status message: ")
        
        try:
            result = await self.api_client.update_status(status)
            print(f"Status updated to: {result.get('status')}")
        except Exception as e:
            print(f"Failed to update status: {e}")
    
    async def list_friends(self) -> None:
        """[CODEX] List all friends and pending requests"""
        print("\n=== FRIENDS LIST ===")
        
        try:
            # Get friends
            friends = await self.api_client.get_friends()
            print(f"Total friends: {len(friends)}")
            
            if friends:
                print("\nYour friends:")
                for idx, friend in enumerate(friends, 1):
                    status = "Online" if friend.get('isOnline') else "Offline"
                    print(f"{idx}. {friend.get('username')} - {status} - {friend.get('status', 'No status')}")
            
            # Get pending requests
            pending = await self.api_client.get_friend_requests()
            
            if pending:
                print("\nPending friend requests:")
                for idx, request in enumerate(pending, 1):
                    print(f"{idx}. {request.get('sender').get('username')} - {request.get('createdAt')}")
        except Exception as e:
            print(f"Error retrieving friends: {e}")
    
    async def send_friend_request(self) -> None:
        """[CODEX] Send a friend request to another user"""
        print("\n=== SEND FRIEND REQUEST ===")
        username = input("Enter username: ")
        
        try:
            result = await self.api_client.send_friend_request(username)
            print(f"Friend request sent to {username}")
        except Exception as e:
            print(f"Failed to send friend request: {e}")
    
    async def list_hubs(self) -> None:
        """[CODEX] List all hubs the user is a member of"""
        print("\n=== YOUR HUBS ===")
        
        try:
            hubs = await self.api_client.get_user_hubs()
            print(f"You are a member of {len(hubs)} hubs")
            
            if hubs:
                for idx, hub in enumerate(hubs, 1):
                    role = hub.get('role', 'Member')
                    print(f"{idx}. {hub.get('name')} - {hub.get('description')} - Role: {role}")
                    
                    # Get channels in this hub
                    hub_id = hub.get('id')
                    channels = await self.api_client.get_hub_channels(hub_id)
                    
                    if channels:
                        print("   Channels:")
                        for channel in channels:
                            print(f"   - {channel.get('name')} - {channel.get('type')}")
        except Exception as e:
            print(f"Error retrieving hubs: {e}")
    
    async def create_hub(self) -> None:
        """[CODEX] Create a new community hub"""
        print("\n=== CREATE NEW HUB ===")
        name = input("Hub name: ")
        description = input("Description: ")
        
        try:
            result = await self.api_client.create_hub(name, description)
            print(f"Hub created! ID: {result.get('id')}")
            
            # Create initial channels
            hub_id = result.get('id')
            await self.api_client.create_channel(hub_id, "general", "TEXT", "General discussion")
            await self.api_client.create_channel(hub_id, "welcome", "TEXT", "Welcome new members")
            
            print("Created default channels: general, welcome")
        except Exception as e:
            print(f"Failed to create hub: {e}")
    
    async def send_message_demo(self) -> None:
        """[CODEX] Demonstrate sending messages"""
        print("\n=== MESSAGING DEMO ===")
        
        # Get friends for private messaging
        try:
            friends = await self.api_client.get_friends()
            
            if not friends:
                print("You need to add friends first to send messages!")
                return
            
            print("Your friends:")
            for idx, friend in enumerate(friends, 1):
                print(f"{idx}. {friend.get('username')}")
            
            selection = int(input("Select a friend to message (number): ")) - 1
            if selection < 0 or selection >= len(friends):
                print("Invalid selection!")
                return
            
            friend = friends[selection]
            friend_id = friend.get('id')
            
            # Send a message
            message = input(f"Message to {friend.get('username')}: ")
            
            # Check for AI assistance if available
            ai_available = await self.ollama_client.is_available()
            if ai_available and input("Would you like AI to analyze your message sentiment? (y/n): ").lower() == 'y':
                sentiment = await self.ollama_client.analyze_sentiment(message)
                print(f"Message sentiment: {sentiment.get('sentiment')} ({sentiment.get('emotional_tone')})")
                
                # Content moderation
                moderation = await self.ollama_client.moderate_content(message)
                if moderation.get('flagged', False):
                    print(f"⚠️ Message flagged by content moderation: {moderation.get('reason')}")
                    if input("Still send this message? (y/n): ").lower() != 'y':
                        return
            
            # Send the message
            result = await self.api_client.send_direct_message(friend_id, message)
            print(f"Message sent! ID: {result.get('id')}")
            
            # Get conversation history
            history = await self.api_client.get_conversation_history(friend_id)
            
            print("\nConversation history:")
            for msg in history[-5:]:  # Show last 5 messages
                sender = "You" if msg.get('senderId') == self.user_info.get('id') else friend.get('username')
                print(f"{sender}: {msg.get('content')} - {msg.get('createdAt')}")
            
            # AI suggested replies
            if ai_available and input("Would you like AI to suggest replies? (y/n): ").lower() == 'y':
                # Format conversation history for the AI
                ai_history = []
                for msg in history[-6:]:
                    role = "user" if msg.get('senderId') == friend_id else "assistant"
                    ai_history.append({
                        "role": role,
                        "content": msg.get('content')
                    })
                
                suggestions = await self.ollama_client.suggest_reply(ai_history)
                
                print("\nSuggested replies:")
                for idx, suggestion in enumerate(suggestions, 1):
                    print(f"{idx}. {suggestion}")
                
                if input("Would you like to use a suggestion? (y/n): ").lower() == 'y':
                    selection = int(input("Which suggestion? (number): ")) - 1
                    if 0 <= selection < len(suggestions):
                        reply = suggestions[selection]
                        result = await self.api_client.send_direct_message(friend_id, reply)
                        print(f"Reply sent! ID: {result.get('id')}")
        except Exception as e:
            print(f"Error in messaging demo: {e}")
    
    async def run_demo(self) -> None:
        """[CODEX] Run the main demo application"""
        print("""
        ██████╗   ██╗  ██╗    █████╗    ██████╗   ███████╗
        ██╔════╝   ██║  ██║   ██╔══██╗   ██╔══██╗  ██╔════╝
        ██║        ███████║   ███████║   ██████╔╝  ███████╗
        ██║        ██╔══██║   ██╔══██║   ██╔══██╗  ╚════██║
        ╚██████╗   ██║  ██║   ██║  ██║   ██║  ██║  ███████║
         ╚═════╝   ╚═╝  ╚═╝   ╚═╝  ╚═╝   ╚═╝  ╚═╝  ╚══════╝
                                                       
        Communication Hub for Animated Online Socializing
        Python Interface Demo
        """)
        
        # Setup server connection
        print("\n=== SERVER SETUP ===")
        server_url = input(f"C.H.A.O.S. Server URL [{self.api_client.base_url}]: ")
        if server_url:
            self.api_client.base_url = server_url
        
        # Test connection
        connected = await self.check_connection()
        if not connected:
            print("Unable to connect to the server. Please check the URL and try again.")
            if input("Continue anyway? (y/n): ").lower() != 'y':
                return
        
        # Check authentication
        authenticated = await self.check_authentication()
        
        # Main loop
        while True:
            print("\n=== C.H.A.O.S. PYTHON INTERFACE DEMO ===")
            
            # Show authentication status
            if authenticated:
                print(f"Logged in as: {self.user_info.get('username')}")
            else:
                print("Not logged in")
            
            print("\nOptions:")
            
            if not authenticated:
                print("1. Register new user")
                print("2. Login")
                print("9. Exit")
                
                choice = input("\nEnter option: ")
                
                if choice == '1':
                    await self.register_user()
                elif choice == '2':
                    authenticated = await self.login()
                elif choice == '9':
                    break
                else:
                    print("Invalid option")
            else:
                print("1. View my profile")
                print("2. Update status")
                print("3. Friends list")
                print("4. Send friend request")
                print("5. List my hubs")
                print("6. Create new hub")
                print("7. Messaging demo")
                print("8. Logout")
                print("9. Exit")
                
                choice = input("\nEnter option: ")
                
                if choice == '1':
                    await self.show_user_profile()
                elif choice == '2':
                    await self.update_status()
                elif choice == '3':
                    await self.list_friends()
                elif choice == '4':
                    await self.send_friend_request()
                elif choice == '5':
                    await self.list_hubs()
                elif choice == '6':
                    await self.create_hub()
                elif choice == '7':
                    await self.send_message_demo()
                elif choice == '8':
                    self.user_token = None
                    self.user_info = None
                    self.api_client.set_token(None)
                    authenticated = False
                    print("Logged out successfully")
                elif choice == '9':
                    break
                else:
                    print("Invalid option")
        
        # Save configuration before exiting
        self.save_config()
        print("Thank you for trying C.H.A.O.S.!")

def main():
    """[CODEX] Main entry point for demo application"""
    app = ChaosDemoApp()
    
    try:
        asyncio.run(app.run_demo())
    except KeyboardInterrupt:
        print("\nDemo terminated by user")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    main()
