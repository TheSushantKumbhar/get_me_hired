import logging
from dotenv import load_dotenv
from livekit.agents import Agent, AgentSession, JobContext, WorkerOptions, cli, RoomOutputOptions
from livekit.plugins import deepgram, google, elevenlabs, silero

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice-agent")

class VoiceAssistant(Agent):
    def __init__(self):
        super().__init__(
            instructions=(
                "You are an AI interviewer assistant. "
                "Keep your responses concise and conversational. "
                "Wait for the candidate to finish speaking before responding."
            )
        )

async def entrypoint(ctx: JobContext):
    logger.info(f"Starting AI Interview Agent in room: {ctx.room.name}")
    await ctx.connect()

    session = AgentSession(
        
        vad=silero.VAD.load(
            min_speech_duration=0.3,     
            min_silence_duration=0.8,     
            padding_duration=0.2,        
            activation_threshold=0.6,    
        ),
        
        stt=deepgram.STT(
            model="nova-2",
            language="en-US",
            interim_results=True,
        ),
        
        llm=google.LLM(
            model="gemini-2.0-flash-exp",
            temperature=0.7,
        ),
        
        tts=elevenlabs.TTS(
            model="eleven_multilingual_v2",
            voice_id="EXAVITQu4vr4xnSDxMaL",
        ),
        
        use_tts_aligned_transcript=True,
    )

    await session.start(
        agent=VoiceAssistant(),
        room=ctx.room,
        room_output_options=RoomOutputOptions(
            transcription_enabled=True,
            sync_transcription=True,
        )
    )

    await session.generate_reply(
        instructions="Greet the candidate warmly and ask them to introduce themselves."
    )

    logger.info("AI Interview Agent started successfully")

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
