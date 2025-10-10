from flask import Flask, jsonify, request
from flask_cors import CORS
from livekit import api
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  

@app.route('/token', methods=['POST'])
def generate_token():
    """Generate LiveKit access token for frontend clients"""
    data = request.json
    room_name = data.get('room', 'interview-room')
    participant_name = data.get('participant', 'user')
    
    # Create access token
    token = api.AccessToken(
        api_key=os.getenv('LIVEKIT_API_KEY'),
        api_secret=os.getenv('LIVEKIT_API_SECRET'),
    )
    
    # Set permissions
    token.with_identity(participant_name).with_name(participant_name).with_grants(
        api.VideoGrants(
            room_join=True,
            room=room_name,
            can_publish=True,
            can_subscribe=True,
        )
    )
    
    return jsonify({
        'token': token.to_jwt(),
        'url': os.getenv('LIVEKIT_URL')  
    })

@app.route('/rooms', methods=['GET'])
def list_rooms():
    """Optional: List active rooms"""
    return jsonify({'rooms': []})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)