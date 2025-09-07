import os
import asyncio
import aiohttp
import json
from dotenv import load_dotenv

load_dotenv()

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

async def test_deepgram():
    """Test Deepgram connection"""
    
    if not DEEPGRAM_API_KEY:
        print("❌ DEEPGRAM_API_KEY not found in .env file")
        return
    
    print(f"🔑 Using API Key: {DEEPGRAM_API_KEY[:8]}...")
    
    # Test 1: Check API key with REST API
    print("\n1️⃣ Testing REST API...")
    try:
        url = "https://api.deepgram.com/v1/projects"
        headers = {"Authorization": f"Token {DEEPGRAM_API_KEY}"}
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    print("✅ REST API connection successful")
                else:
                    print(f"❌ REST API failed: {response.status}")
                    text = await response.text()
                    print(f"Error: {text}")
                    return
    except Exception as e:
        print(f"❌ REST API error: {e}")
        return
    
    # Test 2: Check WebSocket connection
    print("\n2️⃣ Testing WebSocket connection...")
    try:
        ws_url = "wss://api.deepgram.com/v1/listen"
        params = {
            "encoding": "linear16",
            "sample_rate": "16000",
            "channels": "1",
            "punctuate": "true",
            "interim_results": "false"
        }
        
        headers = {"Authorization": f"Token {DEEPGRAM_API_KEY}"}
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        full_url = f"{ws_url}?{query_string}"
        
        print(f"🔗 Connecting to: {full_url}")
        
        timeout = aiohttp.ClientTimeout(total=10)
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.ws_connect(full_url, headers=headers) as ws:
                print("✅ WebSocket connection successful")
                
                # Send a test message
                test_message = {"type": "KeepAlive"}
                await ws.send_str(json.dumps(test_message))
                print("✅ Test message sent")
                
                # Wait for response
                try:
                    async with asyncio.timeout(5):
                        async for msg in ws:
                            if msg.type == aiohttp.WSMsgType.TEXT:
                                print(f"📨 Received: {msg.data}")
                                break
                            elif msg.type == aiohttp.WSMsgType.ERROR:
                                print(f"❌ WebSocket error: {msg.data}")
                                break
                except asyncio.TimeoutError:
                    print("⏰ No response received (this is normal for keepalive)")
                
    except Exception as e:
        print(f"❌ WebSocket connection failed: {e}")
        return
    
    print("\n✅ All Deepgram tests passed!")

if __name__ == "__main__":
    asyncio.run(test_deepgram())