import socketio
from typing import Any

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
sio_app = socketio.ASGIApp(sio, socketio_path='/ws/socket.io')

@sio.event
async def connect(sid, environ):
    print(f"[Socket] Client connected: {sid}")
    # Basic logic to join rooms could be added here or via specific join event

@sio.event
async def join_room(sid, data):
    room = data.get("room")
    if room in ["orders", "admin"]:
        await sio.enter_room(sid, room)
        print(f"[Socket] Client {sid} joined room: {room}")

@sio.event
async def disconnect(sid):
    print(f"[Socket] Client disconnected: {sid}")

async def broadcast_status(event: str, data: Any = None, room: str = "orders"):
    await sio.emit(event, data, room=room)
    print(f"[Socket] Broadcasted {event} to room {room}")
