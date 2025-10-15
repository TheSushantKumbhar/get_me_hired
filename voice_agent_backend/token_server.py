from flask import Flask, jsonify, request
from flask_cors import CORS
from livekit import api
import os
import time
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route("/create-room", methods=["POST"])
def create_room_with_metadata():
    """Generate token with job metadata in participant metadata"""
    try:
        data = request.json
        participant_name = data.get("participant", "user")
        job_data = data.get("jobData", {})
        
        # Create unique room name
        room_name = f"interview-{participant_name}-{int(time.time())}"
        
        print(f"Creating token for room: {room_name}")
        print(f"Job data: {job_data}")

        # Create access token with metadata
        token = api.AccessToken(
            api_key=os.getenv("LIVEKIT_API_KEY"),
            api_secret=os.getenv("LIVEKIT_API_SECRET"),
        )

        # Add job data as participant metadata
        token.with_identity(participant_name)\
            .with_name(participant_name)\
            .with_metadata(json.dumps(job_data))\
            .with_grants(
                api.VideoGrants(
                    room_join=True,
                    room=room_name,
                    can_publish=True,
                    can_subscribe=True,
                )
            )

        jwt_token = token.to_jwt()
        
        print(f"Token generated successfully for room: {room_name}")
        
        return jsonify({
            "token": jwt_token,
            "url": os.getenv("LIVEKIT_URL"),
            "room_name": room_name
        })
        
    except Exception as e:
        print(f"Error in create_room_with_metadata: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "Backend is running"})


if __name__ == "__main__":
    print("Starting Flask server...")
    print(f"LiveKit URL: {os.getenv('LIVEKIT_URL')}")
    app.run(host="0.0.0.0", port=5000, debug=True)
