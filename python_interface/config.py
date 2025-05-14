"""
████████████████████████████████████████████████████████████████████████
█ C.H.A.O.S. PYTHON INTERFACE - CONFIGURATION                         █
█ Cross-platform configuration module for Python components            █
████████████████████████████████████████████████████████████████████████

[CODEX] This module provides a unified configuration interface for the Python
components of C.H.A.O.S. It handles loading environment variables, setting
defaults, and providing a consistent interface for both Windows and Linux.

It's designed to be the first module imported by any Python component, ensuring
proper configuration regardless of the platform.
"""

import os
import sys
import json
import platform
from pathlib import Path
from typing import Dict, Any, Optional, Union

# [CONSTANTS] Default configuration values
DEFAULT_CONFIG = {
    "api": {
        "url": "http://localhost:3000",
        "websocket": "ws://localhost:3000/ws"
    },
    "ollama": {
        "enabled": True,
        "host": "http://localhost:11434",
        "model": "llama3.2",  # Default model as per requirements
        "parameters": {
            "temperature": 0.7,
            "top_p": 0.9,
            "max_tokens": 2048
        }
    },
    "logging": {
        "level": "INFO",
        "file": "chaos_python.log"
    },
    "auth": {
        "token_file": ".auth_token"
    }
}

class ConfigManager:
    """
    [CODEX] Configuration manager for C.H.A.O.S. Python components.
    Handles loading from environment variables, config files, and defaults.
    Provides platform-specific paths and settings.
    """
    def __init__(self):
        # [PLATFORM] Detect operating system
        self.is_windows = platform.system() == "Windows"
        self.is_linux = platform.system() == "Linux"
        self.is_macos = platform.system() == "Darwin"
        
        # [PATHS] Set up platform-specific paths
        if self.is_windows:
            self.config_dir = Path(os.getenv("APPDATA", "")) / "CHAOS"
        elif self.is_macos:
            self.config_dir = Path.home() / "Library" / "Application Support" / "CHAOS"
        else:  # Linux or other
            self.config_dir = Path.home() / ".config" / "chaos"
        
        # [ENSURE] Create config directory if it doesn't exist
        self.config_dir.mkdir(parents=True, exist_ok=True)
        
        # [CONFIG] Load configuration
        self.config_file = self.config_dir / "config.json"
        self.config = self._load_config()
        
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from file or create with defaults"""
        config = DEFAULT_CONFIG.copy()
        
        # [FILE] Try to load from config file
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r') as f:
                    loaded_config = json.load(f)
                    self._merge_configs(config, loaded_config)
            except Exception as e:
                print(f"Error loading config file: {e}")
                
        # [ENV] Override with environment variables
        self._apply_env_vars(config)
        
        # [SAVE] Save updated config
        self.save_config(config)
        
        return config
    
    def _merge_configs(self, base: Dict[str, Any], overlay: Dict[str, Any]) -> None:
        """Recursively merge overlay config into base config"""
        for key, value in overlay.items():
            if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                self._merge_configs(base[key], value)
            else:
                base[key] = value
    
    def _apply_env_vars(self, config: Dict[str, Any]) -> None:
        """Apply environment variables to override config"""
        # [API] API configuration
        if os.getenv("CHAOS_API_URL"):
            config["api"]["url"] = os.getenv("CHAOS_API_URL")
        if os.getenv("CHAOS_WS_URL"):
            config["api"]["websocket"] = os.getenv("CHAOS_WS_URL")
            
        # [OLLAMA] Ollama configuration
        if os.getenv("CHAOS_OLLAMA_ENABLED"):
            config["ollama"]["enabled"] = os.getenv("CHAOS_OLLAMA_ENABLED").lower() in ("true", "1", "yes")
        if os.getenv("CHAOS_OLLAMA_HOST"):
            config["ollama"]["host"] = os.getenv("CHAOS_OLLAMA_HOST")
        if os.getenv("CHAOS_OLLAMA_MODEL"):
            config["ollama"]["model"] = os.getenv("CHAOS_OLLAMA_MODEL")
            
        # [LOGGING] Logging configuration
        if os.getenv("CHAOS_LOG_LEVEL"):
            config["logging"]["level"] = os.getenv("CHAOS_LOG_LEVEL")
        if os.getenv("CHAOS_LOG_FILE"):
            config["logging"]["file"] = os.getenv("CHAOS_LOG_FILE")
    
    def save_config(self, config: Optional[Dict[str, Any]] = None) -> None:
        """Save current configuration to file"""
        if config is None:
            config = self.config
            
        try:
            with open(self.config_file, 'w') as f:
                json.dump(config, f, indent=2)
        except Exception as e:
            print(f"Error saving config file: {e}")
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get a configuration value by dot notation key"""
        parts = key.split('.')
        current = self.config
        
        for part in parts:
            if part not in current:
                return default
            current = current[part]
            
        return current
    
    def set(self, key: str, value: Any) -> None:
        """Set a configuration value by dot notation key"""
        parts = key.split('.')
        current = self.config
        
        # Navigate to the correct nested dictionary
        for i, part in enumerate(parts[:-1]):
            if part not in current:
                current[part] = {}
            current = current[part]
            
        # Set the value
        current[parts[-1]] = value
        
        # Save the updated config
        self.save_config()
    
    def get_auth_token_path(self) -> Path:
        """Get platform-specific path to auth token file"""
        return self.config_dir / self.config["auth"]["token_file"]


# [SINGLETON] Global configuration instance
config = ConfigManager()
