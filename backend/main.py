from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import date, datetime
import json
import asyncio
import base64
import io

from transformers import pipeline
from PIL import Image

from redis_client import redis_client

# -------------------------
# App setup
# -------------------------
app = FastAPI()

# -------------------------
# Load Lua script
# -------------------------
with open("match.lua", "r") as f:
    MATCH_SCRIPT = redis_client.register_script(f.read())

# -------------------------
# Safe send helper
# -------------------------
async def safe_send(ws: WebSocket, payload: dict):
    try:
        await ws.send_json(payload)
    except Exception:
        pass

# -------------------------
# Pub/Sub listener
# -------------------------
async def listen_partner(ws: WebSocket, device_id: str):
    pubsub = redis_client.pubsub()
    pubsub.subscribe(f"channel:{device_id}")

    for msg in pubsub.listen():
        if msg["type"] == "message":
            await safe_send(ws, json.loads(msg["data"]))

# -------------------------
# WebSocket: Matchmaking
# -------------------------
@app.websocket("/ws/chat")
async def chat(ws: WebSocket):
    await ws.accept()

    device_id = ws.query_params.get("device_id")
    mood = ws.query_params.get("mood")
    filter_pref = ws.query_params.get("filter", "any")

    if not device_id or not mood:
        await safe_send(ws, {"type": "error", "message": "Missing params"})
        await ws.close()
        return

    today = date.today().isoformat()
    limit_key = f"limit:{device_id}:{today}"
    queue = f"queue:{mood}:{filter_pref}"

    result = MATCH_SCRIPT(
        keys=[queue],
        args=[device_id, limit_key, 5],  # daily limit = 5
    )

    status = result[0]

    if status == "LIMIT":
        await safe_send(ws, {"type": "limit_reached"})
        await ws.close()
        return

    if status == "WAIT":
        await safe_send(ws, {"type": "waiting"})

    if status == "MATCH":
        partner = result[1]
        await safe_send(ws, {"type": "matched"})
        redis_client.publish(
            f"channel:{partner}",
            json.dumps({"type": "matched"}),
        )

    asyncio.create_task(listen_partner(ws, device_id))

    try:
        while True:
            data = await ws.receive_json()

            if data["type"] == "message":
                partner = redis_client.get(f"pair:{device_id}")
                if partner:
                    redis_client.publish(
                        f"channel:{partner}",
                        json.dumps({"type": "message", "text": data["text"]}),
                    )

            elif data["type"] == "leave":
                partner = redis_client.get(f"pair:{device_id}")
                redis_client.delete(f"pair:{device_id}")
                if partner:
                    redis_client.delete(f"pair:{partner}")
                    redis_client.publish(
                        f"channel:{partner}",
                        json.dumps({"type": "partner_left"}),
                    )
                break

    except WebSocketDisconnect:
        redis_client.delete(f"pair:{device_id}")

# -------------------------
# CORS
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Gender verification
# -------------------------
print("⏳ Loading gender classification model...")
gender_classifier = pipeline("image-classification", model="rizvandwiki/gender-classification")
print("✅ Gender classification model loaded")

class VerifyRequest(BaseModel):
    device_id: str
    image: str

def classify_gender_from_base64(base64_image: str) -> str:
    image_data = base64_image.split(",")[1]
    image_bytes = base64.b64decode(image_data)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    result = gender_classifier(image)
    return result[0]["label"]

@app.post("/verify-gender")
def verify_gender(data: VerifyRequest):
    if not data.device_id:
        raise HTTPException(400, "Missing device ID")
    gender = classify_gender_from_base64(data.image)
    return {"verified": True, "gender": gender}
