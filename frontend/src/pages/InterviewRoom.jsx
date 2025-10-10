import React, { useState, useRef } from "react";
import Header from "../components/interviewRoomComp/Header";
import TranscriptPanel from "../components/interviewRoomComp/TranscriptPanel";
import MessageBox from "../components/interviewRoomComp/MessageBox";
import VideoPanel from "../components/interviewRoomComp/VideoPanel";
import ParticipantIndicators from "../components/interviewRoomComp/ParticipantIndicators";
import InfoPanel from "../components/interviewRoomComp/InfoPanel";
import ControlButtons from "../components/interviewRoomComp/ControlButtons";

const InterviewRoom = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [status, setStatus] = useState("Disconnected");
  const [interviewName] = useState("Interview name");
  const [participants, setParticipants] = useState([
    { id: 1, active: false },
    { id: 2, active: false },
    { id: 3, active: false },
    { id: 4, active: false },
    { id: 5, active: false },
  ]);

  const roomRef = useRef(null);
  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  // Connect to LiveKit Room
  const connectToRoom = async () => {
    try {
      setStatus("Connecting...");

      // Step 1: Get token from backend
      const response = await fetch("http://localhost:5000/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: "interview-room",
          participant: "User-" + Math.random().toString(36).substr(2, 9),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get token. Make sure backend is running.");
      }

      const { token, url } = await response.json();

      // Step 2: Import LiveKit
      const LiveKit = await import("livekit-client");

      // Step 3: Create room
      const room = new LiveKit.Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      // Event handlers
      room.on(LiveKit.RoomEvent.Connected, () => {
        setIsConnected(true);
        setStatus("Connected");
        setRoomId(room.name);
        addTranscript("System", "Connected to interview room");
        updateParticipant(0, true);
      });

      room.on(LiveKit.RoomEvent.Disconnected, () => {
        setIsConnected(false);
        setStatus("Disconnected");
        addTranscript("System", "Disconnected");
        resetParticipants();
      });

      room.on(LiveKit.RoomEvent.ParticipantConnected, (participant) => {
        addTranscript("System", `${participant.identity} joined`);
        updateNextParticipant(true);
      });

      room.on(
        LiveKit.RoomEvent.TrackSubscribed,
        (track, publication, participant) => {
          if (track.kind === "audio") {
            const audioElement = track.attach();
            document.body.appendChild(audioElement);
            addTranscript("Agent", "Speaking...");
          }
          if (track.kind === "video" && videoRef.current) {
            track.attach(videoRef.current);
            videoRef.current.style.display = "block";
          }
        },
      );

      // Connect
      await room.connect(url, token);
      await room.localParticipant.setMicrophoneEnabled(true);

      roomRef.current = room;
      startSpeechRecognition();
    } catch (error) {
      console.error("Connection error:", error);
      setStatus("Error: " + error.message);
      addTranscript("System", `Error: ${error.message}`);
    }
  };

  const disconnectFromRoom = async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
      stopSpeechRecognition();
    }
  };

  const toggleMute = async () => {
    if (roomRef.current) {
      const newState = !isMuted;
      await roomRef.current.localParticipant.setMicrophoneEnabled(!newState);
      setIsMuted(newState);
      addTranscript("System", newState ? "Muted" : "Unmuted");
    }
  };

  const toggleVideo = async () => {
    if (roomRef.current) {
      const newState = !isVideoOn;
      await roomRef.current.localParticipant.setCameraEnabled(newState);
      setIsVideoOn(newState);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    addTranscript(
      "System",
      isRecording ? "Recording stopped" : "Recording started",
    );
  };

  const handleSendMessage = (message) => {
    if (roomRef.current && message.trim()) {
      const encoder = new TextEncoder();
      const data = encoder.encode(
        JSON.stringify({ type: "message", text: message }),
      );
      roomRef.current.localParticipant.publishData(data, { reliable: true });
      addTranscript("You", message);
    }
  };

  const startSpeechRecognition = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript =
          event.results[event.results.length - 1][0].transcript;
        addTranscript("You", transcript);
      };

      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  const addTranscript = (speaker, text) => {
    setTranscript((prev) => [
      ...prev,
      {
        speaker,
        text,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const updateParticipant = (index, active) => {
    setParticipants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], active };
      return updated;
    });
  };

  const updateNextParticipant = (active) => {
    setParticipants((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((p) => !p.active);
      if (index !== -1) {
        updated[index] = { ...updated[index], active };
      }
      return updated;
    });
  };

  const resetParticipants = () => {
    setParticipants((prev) => prev.map((p) => ({ ...p, active: false })));
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      <Header
        interviewName={interviewName}
        isRecording={isRecording}
        onRecordToggle={toggleRecording}
        isConnected={isConnected}
        onDisconnect={disconnectFromRoom}
        onConnect={connectToRoom}
      />

      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Left Panel */}
        <div className="flex-1 flex flex-col gap-4">
          <TranscriptPanel transcript={transcript} />
          <MessageBox
            onSendMessage={handleSendMessage}
            disabled={!isConnected}
          />
        </div>

        {/* Right Panel */}
        <div className="w-96 flex flex-col gap-4">
          <VideoPanel isConnected={isConnected} videoRef={videoRef} />
          <ParticipantIndicators participants={participants} />
          <InfoPanel roomId={roomId} status={status} />
          <ControlButtons
            isMuted={isMuted}
            isVideoOn={isVideoOn}
            onMuteToggle={toggleMute}
            onVideoToggle={toggleVideo}
            disabled={!isConnected}
          />
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
