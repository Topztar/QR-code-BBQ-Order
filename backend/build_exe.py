import PyInstaller.__main__
import os

def build():
    # Define paths
    script = os.path.join(os.path.dirname(__file__), "main.py")

    # PyInstaller arguments
    # --onefile: Create a single executable
    # --noconsole: Headless mode (no console window)
    # --name: Name of the output file
    # --hidden-import: Ensure all dependencies are included
    # --add-data: Include static data if any (though here we seed from code or local db)

    PyInstaller.__main__.run([
        script,
        '--onefile',
        '--noconsole',
        '--name=SabayBackend',
        '--hidden-import=uvicorn.logging',
        '--hidden-import=uvicorn.loops',
        '--hidden-import=uvicorn.loops.auto',
        '--hidden-import=uvicorn.protocols',
        '--hidden-import=uvicorn.protocols.http',
        '--hidden-import=uvicorn.protocols.http.auto',
        '--hidden-import=uvicorn.protocols.websockets',
        '--hidden-import=uvicorn.protocols.websockets.auto',
        '--hidden-import=uvicorn.lifespan',
        '--hidden-import=uvicorn.lifespan.on',
        '--hidden-import=engineio.async_drivers.asgi',
    ])

if __name__ == "__main__":
    print("Preparing Windows Standalone Build Script...")
    # Note: This script should be run in a Windows environment for best results.
    # In this Linux sandbox, it serves as the delivery for the user to execute.
    # build()
