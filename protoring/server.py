from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_socketio import join_room
import hmac
import hashlib
import json

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# ------------------------
# Hardcoded HMAC secret
# ------------------------
API_KEY = "supersecretkey123"  # Must match watcher


# ------------------------
# Verify HMAC signature
# ------------------------
def verify_signature(body_bytes, signature):
    expected = hmac.new(API_KEY.encode(), body_bytes, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


# ------------------------
# API endpoint for watcher
# ------------------------
@app.route("/api/alert", methods=["POST"])
def alert():
    signature = request.headers.get("X-Watcher-Signature", "")
    body = request.get_data()
    if not verify_signature(body, signature):
        return jsonify({"error": "invalid signature"}), 401

    payload = request.get_json()
    room_id = payload.get("roomId")  # get roomId from watcher
    if not room_id:
        room_id = "default_room"  # fallback
    process = payload.get("process", "unknown_process")
    ts = payload.get("ts")

    print(f"[!] ALERT for room {room_id}: {process} at {ts}")

    # emit to the correct room in frontend
    socketio.emit(
        "violation_detected",
        {"roomId": room_id, "process": process, "ts": ts},
        room=room_id,
    )

    return jsonify({"status": "ok"}), 200


# ------------------------
# Socket.IO handlers
# ------------------------


@socketio.on("join_room")
def handle_join(data):
    room_id = data.get("roomId")  # frontend sends roomId
    if room_id:
        join_room(room_id)  # properly join the current client to the room
        print(f"[+] Client joined room {room_id}.")


# ------------------------
# Run server on localhost
# ------------------------
if __name__ == "__main__":
    socketio.run(app, host="127.0.0.1", port=6969)
