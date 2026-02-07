import subprocess
import sys
import os
import time
import signal

def run_backend():
    print(">>> Starting EquiLearn Backend...")
    # Try to use venv python if it exists
    venv_python = os.path.join("venv", "Scripts", "python.exe")
    if not os.path.exists(venv_python):
        venv_python = os.path.join("venv", "bin", "python")
        if not os.path.exists(venv_python):
            venv_python = "python"
    
    # Set environment variables
    env = os.environ.copy()
    env["FLASK_APP"] = "backend/run.py"
    env["FLASK_ENV"] = "development"
    
    # Run from root, assuming backend/run.py exists
    try:
        return subprocess.Popen([venv_python, "backend/run.py"], env=env)
    except Exception as e:
        print(f"Error starting backend: {e}")
        return None

def run_frontend():
    print(">>> Starting EquiLearn Frontend...")
    # Using shell=True for npm on Windows
    try:
        return subprocess.Popen(["npm", "run", "dev"], shell=True)
    except Exception as e:
        print(f"Error starting frontend: {e}")
        return None

if __name__ == "__main__":
    backend_proc = None
    frontend_proc = None
    
    try:
        backend_proc = run_backend()
        if not backend_proc:
            print("Failed to initiate backend process.")
            sys.exit(1)
            
        time.sleep(4) # Give backend sufficient time to start
        
        frontend_proc = run_frontend()
        if not frontend_proc:
            print("Failed to initiate frontend process.")
            if backend_proc: backend_proc.terminate()
            sys.exit(1)
            
        print("\n" + "="*40)
        print("EQUILEARN SYSTEM - ACTIVE")
        print("Frontend: http://localhost:5173")
        print("Backend:  http://localhost:5000")
        print("="*40)
        print("Press Ctrl+C to stop both servers safely.\n")
        
        while True:
            time.sleep(2)
            # Check if processes are still alive
            if backend_proc.poll() is not None:
                print("\nCRITICAL: Backend stopped unexpectedly.")
                break
            if frontend_proc.poll() is not None:
                print("\nCRITICAL: Frontend stopped unexpectedly.")
                break
                
    except KeyboardInterrupt:
        print("\nStopping servers gracefully...")
    finally:
        try:
            if backend_proc:
                print("Terminating backend...")
                backend_proc.terminate()
            if frontend_proc:
                print("Terminating frontend...")
                frontend_proc.terminate()
        except:
            pass
        print("System shutdown complete.")
