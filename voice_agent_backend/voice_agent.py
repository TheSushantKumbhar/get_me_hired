import logging
import asyncio
from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    WorkerOptions,
    cli,
    RoomOutputOptions,
)
from livekit.plugins import deepgram, google, elevenlabs, silero

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice-agent")


class VoiceAssistant(Agent):
    """AI Voice Assistant with Real-Time Subtitle Transcription"""

    def __init__(self):
        super().__init__(
            instructions=(
                "You are an AI interviewer assistant created by LiveKit. "
                "Your role is to conduct professional interviews with candidates. "
                "Ask relevant questions, provide feedback, and maintain a professional tone. "
                "Keep your responses concise and conversational. "
                "Wait for the candidate to respond before asking the next question."
            )
        )


async def entrypoint(ctx: JobContext):
    """Main entrypoint for the voice agent with subtitle-like transcription"""
    logger.info(
        f"Starting AI Interview Agent with real-time subtitles in room: {ctx.room.name}"
    )

    await ctx.connect()

    session = AgentSession(
        vad=silero.VAD.load(),
        stt=deepgram.STT(model="nova-2", language="en-US", interim_results=True),
        llm=google.LLM(model="gemini-2.5-flash", temperature=0.7),
        tts=elevenlabs.TTS(
            model="eleven_multilingual_v2", voice_id="EXAVITQu4vr4xnSDxMaL"
        ),
        use_tts_aligned_transcript=True,
    )

    await session.start(
        agent=VoiceAssistant(),
        room=ctx.room,
        room_output_options=RoomOutputOptions(
            transcription_enabled=True,
            sync_transcription=True,
        ),
    )

    # Initial greeting
    await session.generate_reply(
        instructions=(
            "Greet the candidate warmly and introduce yourself as their AI interviewer. "
            "Ask them to introduce themselves and tell you about their background."
        )
    )

    logger.info("AI Interview Agent with real-time subtitles started successfully")


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
