from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from redis_client import redis_client
import json

# -------------------------
# App setup
# -------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SESSION_TTL = 1800
ONLINE_SET = "online_users"

connections = {}  # session_id -> websocket


# =========================
# WebSocket Chat
# =========================
@app.websocket("/ws/chat/{session_id}")
async def websocket_chat(ws: WebSocket, session_id: str):
    await ws.accept()

    key = f"session:{session_id}"
    if not redis_client.exists(key):
        await ws.close()
        return

    connections[session_id] = ws
    redis_client.sadd(ONLINE_SET, session_id)

    print("🟢 ONLINE:", session_id)

    try:
        await try_match(session_id)

        while True:
            data = await ws.receive_text()

            partner = redis_client.get(f"match:{session_id}")

            if partner:
                partner_ws = connections.get(partner)
                if partner_ws:
                    await partner_ws.send_text(data)

    except WebSocketDisconnect:
        print("🔴 DISCONNECTED:", session_id)
        await cleanup_user(session_id)


async def try_match(session_id: str):
    users = redis_client.smembers(ONLINE_SET)

    for user in users:
        if user == session_id:
            continue

        if not redis_client.exists(f"match:{user}"):
            redis_client.set(f"match:{session_id}", user)
            redis_client.set(f"match:{user}", session_id)

            print("🤝 MATCH:", session_id, "<->", user)

            ws1 = connections.get(session_id)
            ws2 = connections.get(user)

            if ws1:
                await ws1.send_text("Matched!")
            if ws2:
                await ws2.send_text("Matched!")

            return


async def cleanup_user(session_id: str):
    redis_client.srem(ONLINE_SET, session_id)

    partner = redis_client.get(f"match:{session_id}")

    if partner:
        redis_client.delete(f"match:{partner}")
        redis_client.delete(f"match:{session_id}")

        partner_ws = connections.get(partner)
        if partner_ws:
            await partner_ws.send_text("Partner disconnected")

    redis_client.delete(f"match:{session_id}")
    connections.pop(session_id, None)


# =========================
# HTTP APIs
# =========================

class VerifyRequest(BaseModel):
    session_id: str
    image: str


class ProfileRequest(BaseModel):
    session_id: str
    nickname: str
    bio: str = ""


@app.get("/")
def health():
    return {"status": "ok"}


@app.post("/verify-gender")
def verify_gender(data: VerifyRequest):
    if not data.session_id:
        raise HTTPException(status_code=400, detail="Missing session ID")

    if not data.image.startswith("data:image"):
        raise HTTPException(status_code=400, detail="Invalid image format")

    key = f"session:{data.session_id}"

    redis_client.setex(
        key,
        SESSION_TTL,
        json.dumps({"status": "verified"})
    )

    print("✅ VERIFIED (redis):", data.session_id)

    return {"verified": True}


@app.post("/profile")
def setup_profile(data: ProfileRequest):
    key = f"session:{data.session_id}"

    raw = redis_client.get(key)
    if not raw:
        raise HTTPException(status_code=403, detail="Session expired or not verified")

    session = json.loads(raw)

    if not data.nickname.strip():
        raise HTTPException(status_code=400, detail="Nickname required")

    session["nickname"] = data.nickname.strip()
    session["bio"] = data.bio.strip()

    redis_client.setex(
        key,
        SESSION_TTL,
        json.dumps(session)
    )

    print("👤 PROFILE (redis):", data.session_id, session)

    return {"success": True}