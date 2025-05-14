"""
████████████████████████████████████████████████████████████████████████
█ C.H.A.O.S. PYTHON INTERFACE - SETUP                               █
█ Cross-platform setup script for Python components                  █
████████████████████████████████████████████████████████████████████████

[CODEX] This module handles the setup of the Python environment for C.H.A.O.S.
It creates a virtual environment, installs dependencies, and configures 
the environment for cross-platform compatibility between Windows and Linux.
"""

import os
import sys
import platform
import subprocess
import argparse
from pathlib import Path

# [CONSTANTS] Configuration
MIN_PYTHON_VERSION = (3, 8)
DEFAULT_VENV_NAME = "venv"
REQUIREMENTS_FILE = "requirements.txt"

def print_banner():
    """Display a cool ASCII banner"""
    banner = """
    ██████╗   ██╗  ██╗    █████╗    ██████╗   ███████╗
    ██╔════╝   ██║  ██║   ██╔══██╗   ██╔══██╗  ██╔════╝
    ██║        ███████║   ███████║   ██████╔╝  ███████╗
    ██║        ██╔══██║   ██╔══██║   ██╔══██╗  ╚════██║
    ╚██████╗   ██║  ██║   ██║  ██║   ██║  ██║  ███████║
     ╚═════╝   ╚═╝  ╚═╝   ╚═╝  ╚═╝   ╚═╝  ╚═╝  ╚══════╝
                                                       
    Communication Hub for Animated Online Socializing
    Python Interface Setup - Cross-Platform Integration
    """
    print(banner)
    print(f"Platform detected: {platform.system()} {platform.release()}")
    print(f"Python version: {sys.version.split()[0]}")
    print("=" * 60)

def check_python_version():
    """[CODEX] Verify Python version meets minimum requirements"""
    current_version = sys.version_info
    if current_version < MIN_PYTHON_VERSION:
        print(f"[ERROR] Python {MIN_PYTHON_VERSION[0]}.{MIN_PYTHON_VERSION[1]} or higher is required.")
        print(f"        Current version is {current_version.major}.{current_version.minor}")
        return False
    
    print(f"[OK] Python version {current_version.major}.{current_version.minor}.{current_version.micro} is supported.")
    return True

def get_venv_paths(venv_name):
    """[CODEX] Get platform-specific virtual environment paths"""
    is_windows = platform.system() == "Windows"
    base_path = Path(venv_name)
    
    if is_windows:
        python_path = base_path / "Scripts" / "python.exe"
        pip_path = base_path / "Scripts" / "pip.exe"
        activate_path = base_path / "Scripts" / "activate.bat"
    else:  # Linux/macOS
        python_path = base_path / "bin" / "python"
        pip_path = base_path / "bin" / "pip"
        activate_path = base_path / "bin" / "activate"
    
    return {
        "base": base_path,
        "python": python_path,
        "pip": pip_path,
        "activate": activate_path
    }

def create_virtual_environment(venv_name):
    """[CODEX] Create a virtual environment with platform detection"""
    print(f"[*] Creating virtual environment '{venv_name}'...")
    
    try:
        subprocess.run([sys.executable, "-m", "venv", venv_name], check=True)
        print(f"[OK] Virtual environment created successfully at '{venv_name}'")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Failed to create virtual environment: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] An unexpected error occurred: {e}")
        return False

def install_requirements(venv_paths):
    """[CODEX] Install required packages within the virtual environment"""
    if not Path(REQUIREMENTS_FILE).exists():
        print(f"[ERROR] Requirements file '{REQUIREMENTS_FILE}' not found")
        return False
    
    print(f"[*] Installing dependencies from '{REQUIREMENTS_FILE}'...")
    
    try:
        # Ensure pip is upgraded
        subprocess.run([str(venv_paths["python"]), "-m", "pip", "install", "--upgrade", "pip"], check=True)
        
        # Install requirements
        subprocess.run([str(venv_paths["pip"]), "install", "-r", REQUIREMENTS_FILE], check=True)
        
        print("[OK] Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Failed to install dependencies: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] An unexpected error occurred: {e}")
        return False

def setup_ollama_model(venv_paths, model="llama3.2"):
    """[CODEX] Configure default Ollama model for AI features"""
    print(f"[*] Setting up Ollama integration with model '{model}'...")
    
    # Create a test script to verify Ollama configuration
    test_script = "from config import config\n"
    test_script += f"print(f\"Ollama configured with model: {{config.get('ollama.model')}}\")\n"
    test_script += f"config.set('ollama.model', '{model}')\n"
    test_script += "config.save_config()\n"
    test_script += f"print(f\"Ollama model set to: {{config.get('ollama.model')}}\")\n"
    
    with open("test_ollama_config.py", "w") as f:
        f.write(test_script)
    
    try:
        # Run the test script to verify configuration
        subprocess.run([str(venv_paths["python"]), "test_ollama_config.py"], check=True)
        
        # Clean up
        os.remove("test_ollama_config.py")
        
        print(f"[OK] Ollama configured with model '{model}'")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Failed to configure Ollama: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] An unexpected error occurred: {e}")
        return False
    finally:
        # Ensure cleanup even if an error occurs
        if os.path.exists("test_ollama_config.py"):
            os.remove("test_ollama_config.py")

def create_activation_scripts(venv_paths):
    """[CODEX] Create platform-specific activation scripts for convenience"""
    is_windows = platform.system() == "Windows"
    
    if is_windows:
        # Windows batch script
        with open("activate.bat", "w") as f:
            f.write(f"@echo off\n")
            f.write(f"echo Activating C.H.A.O.S. Python environment...\n")
            f.write(f"call {venv_paths['activate']}\n")
            f.write(f"echo Environment activated! Run 'deactivate' to exit.\n")
    else:
        # Bash script for Linux/macOS
        with open("activate.sh", "w") as f:
            f.write("#!/bin/bash\n")
            f.write("echo \"Activating C.H.A.O.S. Python environment...\"\n")
            f.write(f"source {venv_paths['activate']}\n")
            f.write("echo \"Environment activated! Run 'deactivate' to exit.\"\n")
        
        # Make it executable
        os.chmod("activate.sh", 0o755)
    
    print(f"[OK] Created activation scripts for {platform.system()}")
    
    # Create a simple README with instructions
    with open("README.txt", "w") as f:
        f.write("C.H.A.O.S. Python Interface\n")
        f.write("===========================\n\n")
        f.write("To activate the virtual environment:\n\n")
        
        if is_windows:
            f.write("    Run activate.bat\n\n")
        else:
            f.write("    Run source activate.sh\n\n")
            
        f.write("To deactivate:\n\n")
        f.write("    Run deactivate\n\n")
        
        f.write("Available modules:\n")
        f.write("  - config: Configuration management\n")
        f.write("  - api_client: Interface to C.H.A.O.S. API\n\n")
        
        f.write("Example usage:\n\n")
        f.write("    from config import config\n")
        f.write("    from api_client import ChaosApiClient\n\n")
        
        f.write("    # Get configuration\n")
        f.write("    api_url = config.get(\"api.url\")\n\n")
        
        f.write("    # Use the client\n")
        f.write("    client = ChaosApiClient()\n")
        f.write("    # ... and so on\n")

def main():
    """[CODEX] Main setup function with cross-platform compatibility"""
    parser = argparse.ArgumentParser(description="Set up C.H.A.O.S. Python environment")
    parser.add_argument("--venv", default=DEFAULT_VENV_NAME, help=f"Virtual environment name (default: {DEFAULT_VENV_NAME})")
    parser.add_argument("--ollama-model", default="llama3.2", help="Ollama model to use (default: llama3.2)")
    args = parser.parse_args()
    
    # [INIT] Startup
    print_banner()
    
    # [CHECK] Verify Python version
    if not check_python_version():
        sys.exit(1)
    
    # [VENV] Get paths for the virtual environment
    venv_paths = get_venv_paths(args.venv)
    
    # [CREATE] Create virtual environment if it doesn't exist
    if not venv_paths["base"].exists():
        if not create_virtual_environment(args.venv):
            sys.exit(1)
    else:
        print(f"[INFO] Virtual environment '{args.venv}' already exists")
    
    # [DEPS] Install dependencies
    if not install_requirements(venv_paths):
        sys.exit(1)
    
    # [OLLAMA] Configure Ollama integration
    if not setup_ollama_model(venv_paths, args.ollama_model):
        print("[WARN] Ollama configuration skipped or failed. You can configure it manually later.")
    
    # [SCRIPTS] Create activation scripts
    create_activation_scripts(venv_paths)
    
    # [COMPLETE] Setup complete
    print("\n" + "=" * 60)
    print("C.H.A.O.S. Python Interface setup complete!")
    print(f"To activate, run: {'activate.bat' if platform.system() == 'Windows' else 'source activate.sh'}")
    print("=" * 60)

if __name__ == "__main__":
    main()
