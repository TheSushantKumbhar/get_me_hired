import json
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
    
    # Wait for participant to join
    participant = await ctx.wait_for_participant()
    
    # Parse job metadata from participant metadata
    job_metadata = {}
    if participant.metadata:
        try:
            job_metadata = json.loads(participant.metadata)
            logger.info(f"Loaded job metadata from participant: {job_metadata}")
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse participant metadata: {e}")
    
    # Extract job details with defaults
    company_name = job_metadata.get("companyName", "Unknown Company")
    job_title = job_metadata.get("title", "Software Developer")
    job_description = job_metadata.get("description", "General technical position")
    languages = job_metadata.get("languages", ["JavaScript", "Python"])

    logger.info(f"Interview for: {company_name} - {job_title}")
    logger.info(f"Required languages: {', '.join(languages)}")

    # CREATE THE AGENT WITH DYNAMIC INSTRUCTIONS
    agent = Agent(
        instructions=f"""
        You are an AI interview assistant conducting an interview for {company_name}.
        
        Position: {job_title}
        Job Description: {job_description}
        Required Programming Languages: {', '.join(languages)}
        
        Your role is to:
        1. Conduct a professional technical interview specifically for the {job_title} position
        2. Ask relevant questions based on the job requirements
        3. Focus your technical questions on {', '.join(languages)} programming skills
        4. Evaluate the candidate's experience with the technologies mentioned in the job description
        5. Listen carefully and provide thoughtful follow-up questions
        6. Probe deeper when necessary to assess true understanding
        7. Maintain a friendly but professional tone throughout
        8. Keep the conversation natural and engaging
        9. Ask about specific projects or experiences related to {', '.join(languages)}
        10. If you need time to formulate a response, briefly acknowledge with "Let me think about that..."
        
        Start by welcoming the candidate and asking them to introduce themselves.
        Then proceed with questions relevant to the {job_title} role.
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
            graph=create_workflow(
                languages=languages,
            ),
        ),
        tts=deepgram.TTS(
            model="aura-asteria-en",
            encoding="linear16",
            sample_rate=24000,
        ),
        # Performance optimizations
        preemptive_generation=True,
        # Interruption handling
        allow_interruptions=True,
        min_interruption_duration=1.0,
        min_interruption_words=2,
        resume_false_interruption=True,
        false_interruption_timeout=1.5,
        # Turn detection
        min_endpointing_delay=0.8,
        max_endpointing_delay=6.0,
        discard_audio_if_uninterruptible=True,
        user_away_timeout=15.0,
        max_tool_steps=3,
    )

    # START SESSION
    await session.start(
        room=ctx.room,
        agent=agent,
    )
    logger.info("AI Interview Agent started successfully")

    # Dynamic greeting based on job details
    await session.say(
        f"Hello! Welcome to your interview for the {job_title} position at {company_name}. "
        f"I'm excited to learn more about your experience, especially with {', '.join(languages[:2])}. "
        f"Please take a moment to introduce yourself and tell me about your background.",
        allow_interruptions=True,
    )

    logger.info("Initial greeting sent with job-specific context")


if __name__ == "__main__":  
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            num_idle_processes=1,
        )
    )
