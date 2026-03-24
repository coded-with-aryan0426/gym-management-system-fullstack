import os
import subprocess
import sys

def main():
    if sys.platform != "darwin":
        print("This script is designed for macOS.")
        return

    # Get the current working directory to ensure correct paths
    pwd = os.getcwd()

    print("🚀 Starting Gym Management System...")

    # Terminal 1: Database Initialization + Backend Server
    # Executes: colima start -> docker start -> cd backend -> mvn spring-boot:run
    term1_cmd = f"cd \\\"{pwd}\\\" && echo 'Initializing Database...' && colima start && docker start oracle-db && echo 'Starting Backend...' && cd backend && mvn spring-boot:run"
    apple_script_1 = f'''
    tell application "Terminal"
        activate
        do script "{term1_cmd}"
    end tell
    '''

    # Terminal 2: Frontend Client
    # Executes: cd frontend -> npm run dev:all
    term2_cmd = f"cd \\\"{pwd}/frontend\\\" && echo 'Starting Frontend...' && npm run dev:all"
    apple_script_2 = f'''
    tell application "Terminal"
        activate
        do script "{term2_cmd}"
    end tell
    '''

    # Open Terminal 1
    print("Opening Terminal 1 for Database & Backend...")
    subprocess.run(["osascript", "-e", apple_script_1])

    # Open Terminal 2
    print("Opening Terminal 2 for Frontend...")
    subprocess.run(["osascript", "-e", apple_script_2])

    print("✅ All processes started in new terminal windows!")

if __name__ == "__main__":
    main()
