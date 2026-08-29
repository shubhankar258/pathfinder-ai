import subprocess
import sys
import time

def main():
    print("=" * 60)
    print("Starting Pathfinder Prototype Services")
    print("=" * 60)
    print("[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd="backend"
    )

    print("[2/2] Starting Vite Frontend on http://127.0.0.1:5173 ...")
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev", "--", "--host", "127.0.0.1", "--port", "5173"],
        cwd="frontend",
        shell=True
    )

    print("\n[OK] Both services launched successfully!")
    print("  Backend API:  http://127.0.0.1:8000/docs")
    print("  Frontend UI:  http://127.0.0.1:5173\n")
    print("Press Ctrl+C to stop all services.")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down services...")
        backend_proc.terminate()
        frontend_proc.terminate()

if __name__ == "__main__":
    main()
