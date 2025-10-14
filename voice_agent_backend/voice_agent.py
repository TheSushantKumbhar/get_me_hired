import logging
from dotenv import load_dotenv
from livekit.agents import (
    JobContext,
    WorkerOptions,
    cli,
)
from livekit.agents.voice import AgentSession, Agent
from livekit.plugins import (
    deepgram,
    silero,
    langchain as lk_langchain,
)
from llm.livekit_llm import create_workflow

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice-agent")

async def entrypoint(ctx: JobContext):
    logger.info(f"Starting AI Interview Agent in room: {ctx.room.name}")
    await ctx.connect()
    logger.info(f"Connected to room: {ctx.room.name}")

    # CREATE THE AGENT WITH INSTRUCTIONS
    agent = Agent(
        instructions="""
        You are an AI interview assistant. Your role is to:
        1. Conduct a professional technical interview
        2. Ask relevant questions based on the candidate's background
        3. Listen carefully and provide thoughtful follow-up questions
        4. Evaluate responses and probe deeper when necessary
        5. Maintain a friendly but professional tone throughout
        6. Keep the conversation natural and engaging
        7. If you need time to think, briefly acknowledge with "Let me think about that..." before your full response
        """,
    )

    # Create session with optimized settings
    session = AgentSession(
        vad=silero.VAD.load(
            min_speech_duration=0.5,
            min_silence_duration=0.8,
            prefix_padding_duration=0.2,
            activation_threshold=0.65,
        ),
        stt=deepgram.STT(
            model="nova-2",
            language="en-IN",
            interim_results=True,
        ),
        llm=lk_langchain.LLMAdapter(
            graph=create_workflow(),
        ),
        tts=deepgram.TTS(
            model="aura-asteria-en",
            encoding="linear16",
            sample_rate=24000,
        ),
        # Performance optimizations
        preemptive_generation=True,  # Start generating before end of speech
        
        # Interruption handling
        allow_interruptions=True,
        min_interruption_duration=1.0,
        min_interruption_words=2,
        resume_false_interruption=True,
        false_interruption_timeout=1.5,
        
        # Turn detection
        min_endpointing_delay=0.8,
        max_endpointing_delay=6.0,
        
        discard_audio_if_uninterruptible=True,  # Drop audio during non-interruptible speech
        user_away_timeout=15.0,  # Timeout if user is silent
        max_tool_steps=3,  # Limit tool calling loops
    )

    # START SESSION WITH BOTH room AND agent
    await session.start(
        room=ctx.room,
        agent=agent,
    )
    logger.info("AI Interview Agent started successfully")

    await session.say(
        "Hello! Welcome to the interview. I'm excited to learn more about you. "
        "Please take a moment to introduce yourself and tell me about your background.",
        allow_interruptions=True,
    )

    logger.info("Initial greeting sent")

if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            num_idle_processes=1,
        )
    )
