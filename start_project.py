#!/usr/bin/env python3
"""
Gym Management System Startup Script
=====================================
Starts backend, frontend, and optional cloudflared tunnels for public access.

Usage:
    python start_project.py              # Local only (localhost)
    python start_project.py --public     # With public URLs via cloudflared
    python start_project.py --vscode     # Open terminals in VS Code (default)
    python start_project.py --external   # Open terminals in external Terminal app
"""

import os
import subprocess
import sys
import argparse
import time
import json

def check_cloudflared():
    """Check if cloudflared is installed"""
    try:
        result = subprocess.run(["cloudflared", "--version"], capture_output=True, text=True)
        return result.returncode == 0
    except FileNotFoundError:
        return False

def install_cloudflared():
    """Install cloudflared via Homebrew"""
    print("📦 Installing cloudflared...")
    result = subprocess.run(["brew", "install", "cloudflared"], capture_output=True, text=True)
    if result.returncode != 0:
        print("❌ Failed to install cloudflared. Please install manually:")
        print("   brew install cloudflared")
        return False
    print("✅ cloudflared installed successfully!")
    return True

def run_in_vscode_terminal(name: str, command: str, pwd: str):
    """
    Open a new terminal in VS Code and run the command.
    Uses VS Code's 'code' CLI to create integrated terminals.
    """
    # Create a shell script that VS Code will execute
    script_path = f"/tmp/gym_startup_{name.replace(' ', '_')}.sh"
    with open(script_path, 'w') as f:
        f.write(f"#!/bin/bash\ncd \"{pwd}\"\n{command}\n")
    os.chmod(script_path, 0o755)
    
    # Use osascript to send keyboard commands to VS Code to open new terminal
    # This approach uses VS Code's command palette
    apple_script = f'''
    tell application "Visual Studio Code"
        activate
    end tell
    delay 0.5
    tell application "System Events"
        tell process "Code"
            -- Open new terminal: Cmd+Shift+`
            keystroke "`" using {{command down, shift down}}
            delay 0.3
            -- Type the command
            keystroke "cd \\"{pwd}\\" && {command}"
            delay 0.1
            keystroke return
        end tell
    end tell
    '''
    
    subprocess.run(["osascript", "-e", apple_script], capture_output=True)

def run_in_external_terminal(name: str, command: str, pwd: str):
    """Open a new terminal window in macOS Terminal app"""
    escaped_cmd = command.replace('"', '\\"')
    apple_script = f'''
    tell application "Terminal"
        activate
        do script "cd \\"{pwd}\\" && {escaped_cmd}"
    end tell
    '''
    subprocess.run(["osascript", "-e", apple_script])

def main():
    parser = argparse.ArgumentParser(description="Start Gym Management System")
    parser.add_argument("--public", action="store_true", 
                        help="Enable public URLs via cloudflared tunnels")
    parser.add_argument("--vscode", action="store_true", default=True,
                        help="Open terminals in VS Code (default)")
    parser.add_argument("--external", action="store_true",
                        help="Open terminals in external Terminal app")
    args = parser.parse_args()
    
    # Type hints for mypy/pyre
    public_mode: bool = args.public
    use_vscode: bool = not args.external
    
    if sys.platform != "darwin":
        print("This script is designed for macOS.")
        return

    pwd = os.getcwd()
    
    # Ensure we're in the project root
    if not os.path.exists(os.path.join(pwd, "backend")) or not os.path.exists(os.path.join(pwd, "frontend")):
        print("❌ Please run this script from the project root directory")
        return

    print("🚀 Starting Gym Management System...")
    print(f"   Mode: {'Public (cloudflared)' if public_mode else 'Local only'}")
    print(f"   Terminals: {'VS Code integrated' if use_vscode else 'External Terminal app'}")
    print()

    # Check cloudflared if public mode requested
    if public_mode:
        if not check_cloudflared():
            print("⚠️  cloudflared not found.")
            response = input("   Install via Homebrew? (y/n): ").strip().lower()
            if response == 'y':
                if not install_cloudflared():
                    return
            else:
                print("   Continuing without public URLs...")
                public_mode = False

    # Terminal runner function
    run_terminal = run_in_vscode_terminal if use_vscode else run_in_external_terminal

    # ===== Terminal 1: Database + Backend =====
    print("📦 Starting Database & Backend...")
    backend_cmd = "echo '🗄️  Initializing Database...' && colima start && docker start oracle-db && sleep 5 && echo '☕ Starting Backend...' && cd backend && mvn spring-boot:run"
    run_terminal("Backend", backend_cmd, pwd)
    
    # Wait for backend to start
    print("   Waiting for backend to initialize...")
    time.sleep(3)

    # ===== Terminal 2: Frontend =====
    print("🎨 Starting Frontend (3 portals)...")
    frontend_cmd = "cd frontend && echo '🎨 Starting Frontend Portals...' && npm run dev:all"
    run_terminal("Frontend", frontend_cmd, pwd)

    # ===== Tunnels (if public mode) =====
    if public_mode:
        print()
        print("🌐 Setting up cloudflared tunnels...")
        print("   (Public URLs will appear in each terminal)")
        
        time.sleep(2)
        
        # Terminal 3: Backend tunnel (port 8081)
        print("   🔗 Backend API tunnel (port 8081)...")
        tunnel_backend_cmd = "echo '🌐 Creating Backend API Tunnel...' && cloudflared tunnel --url http://localhost:8081"
        run_terminal("Tunnel-Backend", tunnel_backend_cmd, pwd)
        
        time.sleep(1)
        
        # Terminal 4: Owner Portal tunnel (port 5173)
        print("   🔗 Owner Portal tunnel (port 5173)...")
        tunnel_owner_cmd = "echo '🌐 Creating Owner Portal Tunnel...' && cloudflared tunnel --url http://localhost:5173"
        run_terminal("Tunnel-Owner", tunnel_owner_cmd, pwd)
        
        time.sleep(1)
        
        # Terminal 5: Trainer Portal tunnel (port 5174)
        print("   🔗 Trainer Portal tunnel (port 5174)...")
        tunnel_trainer_cmd = "echo '🌐 Creating Trainer Portal Tunnel...' && cloudflared tunnel --url http://localhost:5174"
        run_terminal("Tunnel-Trainer", tunnel_trainer_cmd, pwd)
        
        time.sleep(1)
        
        # Terminal 6: Member Portal tunnel (port 5175)
        print("   🔗 Member Portal tunnel (port 5175)...")
        tunnel_member_cmd = "echo '🌐 Creating Member Portal Tunnel...' && cloudflared tunnel --url http://localhost:5175"
        run_terminal("Tunnel-Member", tunnel_member_cmd, pwd)

    print()
    print("=" * 50)
    print("✅ All processes started!")
    print("=" * 50)
    print()
    print("📍 Local URLs:")
    print("   Backend API:    http://localhost:8081")
    print("   Owner Portal:   http://localhost:5173")
    print("   Trainer Portal: http://localhost:5174")
    print("   Member Portal:  http://localhost:5175")
    
    if public_mode:
        print()
        print("🌐 Public URLs: Check each tunnel terminal for the")
        print("   cloudflared URLs (*.trycloudflare.com)")
    
    print()
    print("💡 Tips:")
    print("   - Backend takes ~30-60 seconds to fully start")
    print("   - Wait for 'Started GymApplication' in backend terminal")
    if public_mode:
        print("   - Share the *.trycloudflare.com URLs with beta testers")
        print("   - Tunnels are temporary and change on restart")

if __name__ == "__main__":
    main()
