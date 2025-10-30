import json
import logging
import os
from dotenv import load_dotenv
from livekit.agents import (
    JobContext,
    WorkerOptions,
    cli,
    RoomInputOptions,
    RoomOutputOptions,
)
from livekit.agents.voice import AgentSession, Agent
from livekit.plugins import (
    deepgram,
    silero,
    langchain as lk_langchain,
    bey,  # Correct import name
)
from llm.livekit_llm import create_workflow


load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice-agent")


async def entrypoint(ctx: JobContext):
    logger.info(f"Starting AI Interview Agent in room: {ctx.room.name}")

    await ctx.connect()
    logger.info(f"Connected to room: {ctx.room.name}")

    participant = await ctx.wait_for_participant()

    job_metadata = {}
    resume = ""
    if participant.metadata:
        try:
            metadata = json.loads(participant.metadata)
            job_metadata = metadata.get("jobData", {})
            resume = metadata.get("resumeData", "")
            logger.info(f"Loaded job metadata from participant: {job_metadata}")
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse participant metadata: {e}")

    company_name = job_metadata.get("companyName", "Unknown Company")
    job_title = job_metadata.get("title", "Software Developer")
    job_description = job_metadata.get("description", "General technical position")
    languages = job_metadata.get("languages", ["JavaScript", "Python"])

    logger.info(f"Interview for: {company_name} - {job_title}")
    logger.info(f"Required languages: {', '.join(languages)}")
    logger.info(f"participant resume details: {resume[:100]}....")

    # Create Agent
    agent = Agent(
        instructions=f"""
        You are an AI interview assistant conducting an interview for {company_name}.
        
        Below is the candidate's Resume (in Markdown format):
        {resume}
        
        Position: {job_title}
        Job Description: {job_description}
        Required Programming Languages: {", ".join(languages)}
        
        Your role is to:
        1. Conduct a professional technical interview specifically for the {job_title} position
        2. Ask relevant questions based on the job requirements
        3. Focus your technical questions on {", ".join(languages)} programming skills
        4. Evaluate the candidate's experience with the technologies mentioned in the job description
        5. Listen carefully and provide thoughtful follow-up questions
        6. Probe deeper when necessary to assess true understanding
        7. Maintain a friendly but professional tone throughout
        8. Keep the conversation natural and engaging
        9. Ask about specific projects or experiences related to {", ".join(languages)}
        10. Respond naturally to both voice and text messages from the candidate
        11. If you need time to formulate a response, briefly acknowledge with "Let me think about that..."
        
        When the candidate sends a text message, respond conversationally as you would to voice input.
        Start by welcoming the candidate and asking them to introduce themselves.
        Then proceed with questions relevant to the {job_title} role.
        """,
    )

    # Create Agent Session
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
                job_title=job_title,
                company_name=company_name,
                job_description=job_description,
            ),
        ),
        tts=deepgram.TTS(
            model="aura-asteria-en",
            encoding="linear16",
            sample_rate=24000,
        ),
        preemptive_generation=True,
        allow_interruptions=True,
        min_interruption_duration=1.0,
        min_interruption_words=2,
        resume_false_interruption=True,
        false_interruption_timeout=1.5,
        min_endpointing_delay=0.8,
        max_endpointing_delay=6.0,
        discard_audio_if_uninterruptible=True,
        user_away_timeout=15.0,
        max_tool_steps=3,
    )

    # ========== BEYOND PRESENCE (BEY) AVATAR INTEGRATION ==========
    # Get Beyond Presence credentials from environment
    bey_api_key = os.getenv("BEY_API_KEY")
    bey_avatar_id = os.getenv("BEY_AVATAR_ID")

    logger.info(f"Initializing Beyond Presence avatar with avatar_id: {bey_avatar_id}")

    # Create Beyond Presence Avatar Session
    avatar = bey.AvatarSession(
        api_key=bey_api_key,
        avatar_id=bey_avatar_id,
        avatar_participant_name="AI-Interviewer-Avatar",  # Optional: Custom name
    )

    # Start the avatar first (it joins as a separate participant)
    await avatar.start(session, room=ctx.room)
    logger.info("Beyond Presence avatar started and joined the room")
    # ===============================================

    # Start the agent session with audio OUTPUT disabled (avatar handles it)
    await session.start(
        room=ctx.room,
        agent=agent,
        room_input_options=RoomInputOptions(
            text_enabled=True,
            audio_enabled=True,  # Keep audio INPUT enabled to hear candidate
        ),
        room_output_options=RoomOutputOptions(
            audio_enabled=False,  # Disable audio OUTPUT (avatar provides audio+video)
        ),
    )
    logger.info("AI Interview Agent started successfully with Beyond Presence avatar")

    # Initial greeting
    await session.say(
        f"Welcome to your interview for the {job_title} role at {company_name}. "
        f"I’ve gone through your resume and noticed your background in {', '.join(languages[:2])}. "
        f"Let’s start with a quick introduction could you tell me a bit about yourself and your professional journey?",
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
