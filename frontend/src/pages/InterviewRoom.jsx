import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/InterviewRoom/Header";
import TranscriptPanel from "../components/InterviewRoom/TranscriptPanel";
import VideoPanel from "../components/InterviewRoom/VideoPanel";
import ControlButtons from "../components/InterviewRoom/ControlButtons";
import SplineAnimation from "../components/InterviewRoom/SplineAnimation";

const InterviewRoom = () => {
  const location = useLocation();
  
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [status, setStatus] = useState("Disconnected");
  const [interviewName] = useState("AI Interview Session");
  const [hasVideo, setHasVideo] = useState(false);
  const [currentMicId, setCurrentMicId] = useState("");
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);

  const roomRef = useRef(null);
  const videoRef = useRef(null);
  const agentSpeakingTimeoutRef = useRef(null);
  const audioContextsRef = useRef([]);
  const audioElementsRef = useRef([]);
  const animationFrameIdsRef = useRef([]);
  const isConnectingRef = useRef(false);

  const cleanupResources = () => {
    if (agentSpeakingTimeoutRef.current) {
      clearTimeout(agentSpeakingTimeoutRef.current);
      agentSpeakingTimeoutRef.current = null;
    }

    animationFrameIdsRef.current.forEach((id) => {
      try {
        cancelAnimationFrame(id);
      } catch (e) {
        console.error("Error canceling animation frame:", e);
      }
    });
    animationFrameIdsRef.current = [];

    audioContextsRef.current.forEach((context) => {
      try {
        if (context.state !== "closed") {
          context.close();
        }
      } catch (e) {
        console.error("Error closing audio context:", e);
      }
    });
    audioContextsRef.current = [];

    audioElementsRef.current.forEach((element) => {
      try {
        element.pause();
        element.srcObject = null;
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      } catch (e) {
        console.error("Error removing audio element:", e);
      }
    });
    audioElementsRef.current = [];

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const addFinalTranscript = (speaker, text, segmentId) => {
    if (!text || !text.trim()) return;

    setTranscript((prev) => {
      const filtered = prev.filter((msg) => msg.segmentId !== segmentId);
      return [
        ...filtered,
        {
          speaker,
          text: text.trim(),
          timestamp: new Date().toLocaleTimeString(),
          isFinal: true,
          segmentId,
        },
      ];
    });
  };

  const addInterimTranscript = (speaker, text, segmentId) => {
    if (!text || !text.trim()) return;

    setTranscript((prev) => {
      const filtered = prev.filter((msg) => msg.segmentId !== segmentId);
      return [
        ...filtered,
        {
          speaker,
          text: text.trim(),
          timestamp: new Date().toLocaleTimeString(),
          isFinal: false,
          segmentId,
          isStreaming: speaker === "Agent",
        },
      ];
    });
  };

  const connectToRoom = async () => {
    if (isConnectingRef.current || roomRef.current) {
      return;
    }

    try {
      isConnectingRef.current = true;
      setStatus("Connecting...");

      const jobData = location.state?.jobData || {
        companyName: "Default Company",
        title: "Default Position",
        description: "General technical interview",
        languages: ["JavaScript"]
      };

      const participantName = "User-" + Math.random().toString(36).substr(2, 9);

      const response = await fetch("http://localhost:5000/create-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participant: participantName,
          jobData: jobData
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create room. Make sure backend is running.");
      }

      const { token, url, room_name } = await response.json();
      const LiveKit = await import("livekit-client");

      const room = new LiveKit.Room({
        adaptiveStream: true,
        dynacast: true,
        audioCaptureDefaults: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      roomRef.current = room;

      const attachVideoTrack = (track) => {
        if (videoRef.current && track) {
          track.attach(videoRef.current);
          setHasVideo(true);
        }
      };

      room.on(LiveKit.RoomEvent.Connected, () => {
        setIsConnected(true);
        setStatus("Connected");
        setRoomId(room.name);
        isConnectingRef.current = false;

        room.remoteParticipants.forEach((participant) => {
          participant.videoTracks.forEach((publication) => {
            if (publication.isSubscribed && publication.videoTrack) {
              attachVideoTrack(publication.videoTrack);
            }
          });
        });

        room.registerTextStreamHandler(
          "lk.transcription",
          async (reader, participantInfo) => {
            try {
              const message = await reader.readAll();
              const isTranscription =
                reader.info.attributes["lk.transcribed_track_id"] != null;
              const isFinal =
                reader.info.attributes["lk.transcription_final"] === "true";
              const segmentId = reader.info.attributes["lk.segment_id"];

              if (isTranscription && message.trim()) {
                const speaker =
                  participantInfo.identity.toLowerCase().includes("agent") ||
                  participantInfo.identity.toLowerCase().includes("ai") ||
                  participantInfo.identity
                    .toLowerCase()
                    .includes("voice-assistant")
                    ? "Agent"
                    : "You";

                if (speaker === "Agent") {
                  setIsAgentSpeaking(true);

                  if (agentSpeakingTimeoutRef.current) {
                    clearTimeout(agentSpeakingTimeoutRef.current);
                  }

                  agentSpeakingTimeoutRef.current = setTimeout(
                    () => {
                      setIsAgentSpeaking(false);
                    },
                    isFinal ? 1000 : 2000,
                  );
                }

                if (isFinal) {
                  addFinalTranscript(speaker, message, segmentId);
                } else {
                  addInterimTranscript(speaker, message, segmentId);
                }
              }
            } catch (error) {
              console.error("Error processing transcription:", error);
            }
          },
        );
      });

      room.on(LiveKit.RoomEvent.Disconnected, () => {
        cleanupResources();
        setIsConnected(false);
        setHasVideo(false);
        setStatus("Disconnected");
        setIsAgentSpeaking(false);
        roomRef.current = null;
        isConnectingRef.current = false;
      });

      room.on(LiveKit.RoomEvent.ParticipantConnected, (participant) => {
        console.log(`${participant.identity} joined`);
      });

      room.on(
        LiveKit.RoomEvent.TrackSubscribed,
        (track, publication, participant) => {
          if (track.kind === "audio") {
            const audioElement = track.attach();
            audioElement.volume = 1.0;
            document.body.appendChild(audioElement);
            audioElementsRef.current.push(audioElement);

            if (participant.identity.toLowerCase().includes("agent")) {
              try {
                const audioContext = new (window.AudioContext ||
                  window.webkitAudioContext)();
                audioContextsRef.current.push(audioContext);

                const source = audioContext.createMediaStreamSource(
                  new MediaStream([track.mediaStreamTrack]),
                );
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 256;
                source.connect(analyser);

                const dataArray = new Uint8Array(analyser.frequencyBinCount);

                const checkAudioLevel = () => {
                  if (audioContext.state === "closed") return;

                  analyser.getByteFrequencyData(dataArray);
                  const average =
                    dataArray.reduce((a, b) => a + b) / dataArray.length;

                  if (average > 10) {
                    setIsAgentSpeaking(true);
                  }

                  const frameId = requestAnimationFrame(checkAudioLevel);
                  if (!animationFrameIdsRef.current.includes(frameId)) {
                    animationFrameIdsRef.current.push(frameId);
                  }
                };

                checkAudioLevel();
              } catch (error) {
                console.error("Error setting up audio analysis:", error);
              }
            }
          }

          if (track.kind === "video") {
            attachVideoTrack(track);
          }
        },
      );

      room.on(LiveKit.RoomEvent.TrackUnsubscribed, (track) => {
        if (track.kind === "video") {
          track.detach();
          setHasVideo(false);
        }
        if (track.kind === "audio") {
          track.detach();
        }
      });

      await room.connect(url, token);
      await room.localParticipant.setMicrophoneEnabled(true);
    } catch (error) {
      console.error("Connection error:", error);
      setStatus("Error: " + error.message);
      cleanupResources();
      roomRef.current = null;
      isConnectingRef.current = false;
    }
  };

  const disconnectFromRoom = async () => {
    if (!roomRef.current) {
      return;
    }

    try {
      const room = roomRef.current;
      roomRef.current = null;

      cleanupResources();
      await room.disconnect();

      setIsConnected(false);
      setIsAgentSpeaking(false);
      setHasVideo(false);
      setIsVideoOn(false);
      setStatus("Disconnected");
      setTranscript([]);
      isConnectingRef.current = false;
    } catch (error) {
      console.error("Error during disconnect:", error);
      roomRef.current = null;
      isConnectingRef.current = false;
    }
  };

  const handleMuteToggle = async () => {
    if (roomRef.current) {
      const newState = !isMuted;
      await roomRef.current.localParticipant.setMicrophoneEnabled(!newState);
      setIsMuted(newState);
    }
  };

  const handleMicChange = async (deviceId) => {
    if (!roomRef.current) {
      return;
    }

    try {
      const wasMuted = isMuted;

      if (!wasMuted) {
        await roomRef.current.localParticipant.setMicrophoneEnabled(false);
      }

      await roomRef.current.switchActiveDevice("audioinput", deviceId);
      setCurrentMicId(deviceId);

      await new Promise((resolve) => setTimeout(resolve, 200));

      if (!wasMuted) {
        await roomRef.current.localParticipant.setMicrophoneEnabled(true);
      }
    } catch (error) {
      console.error("Error switching microphone:", error);
      if (!isMuted) {
        await roomRef.current?.localParticipant.setMicrophoneEnabled(true);
      }
    }
  };

  const handleVideoToggle = async () => {
    if (!roomRef.current) {
      return;
    }

    const newState = !isVideoOn;

    try {
      if (newState) {
        const publication =
          await roomRef.current.localParticipant.setCameraEnabled(true);

        if (publication && publication.track && videoRef.current) {
          publication.track.attach(videoRef.current);
          setHasVideo(true);
          setIsVideoOn(true);
        }
      } else {
        await roomRef.current.localParticipant.setCameraEnabled(false);
        setHasVideo(false);
        setIsVideoOn(false);

        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    } catch (error) {
      console.error("Error toggling video:", error);
      setIsVideoOn(false);
      setHasVideo(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleSendMessage = async (message) => {
    if (!roomRef.current || !message.trim()) {
      return;
    }

    try {
      if (typeof roomRef.current.localParticipant.sendText === 'function') {
        await roomRef.current.localParticipant.sendText(message, {
          topic: 'lk.chat',
        });
      } else {
        const encoder = new TextEncoder();
        const data = encoder.encode(message);
        
        await roomRef.current.localParticipant.publishData(data, {
          reliable: true,
          topic: 'lk.chat',
        });
      }

      setTranscript((prev) => [
        ...prev,
        {
          speaker: "You",
          text: message.trim(),
          timestamp: new Date().toLocaleTimeString(),
          isFinal: true,
        },
      ]);
    } catch (error) {
      console.error('Failed to send text message:', error);
    }
  };

  useEffect(() => {
    return () => {
      cleanupResources();
      if (roomRef.current) {
        roomRef.current
          .disconnect()
          .catch((e) => console.error("Cleanup disconnect error:", e));
      }
    };
  }, []);

  return (
    <div className="h-screen bg-base text-white flex flex-col overflow-hidden">
      <Header
        interviewName={interviewName}
        isRecording={isRecording}
        onRecordToggle={toggleRecording}
        isConnected={isConnected}
        onDisconnect={disconnectFromRoom}
        onConnect={connectToRoom}
      />

      <div className="flex-1 flex gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 overflow-hidden">
        
        <div className="w-full lg:w-[55vw] xl:w-[900px] flex flex-col min-w-0">
          <TranscriptPanel
            transcript={transcript}
            isAgentSpeaking={isAgentSpeaking}
            onSendMessage={handleSendMessage}
            messageInputDisabled={!isConnected}
          />
        </div>

        <div className="flex-1 flex flex-col gap-2 sm:gap-3 md:gap-4 overflow-y-auto min-w-0">
          
          <div className="flex justify-center items-center bg-black rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
            <div className="w-full max-w-[400px] aspect-[10/7]">
              <SplineAnimation />
            </div>
          </div>

          <VideoPanel
            isConnected={isConnected}
            videoRef={videoRef}
            hasVideo={hasVideo}
          />

          <ControlButtons
            isMuted={isMuted}
            isVideoOn={isVideoOn}
            onMuteToggle={handleMuteToggle}
            onVideoToggle={handleVideoToggle}
            disabled={!isConnected}
            onMicChange={handleMicChange}
            currentMicId={currentMicId}
            room={roomRef.current}
            isAgentSpeaking={isAgentSpeaking}
          />
        </div>
      </div>
    </div>
  );
};

export default InterviewRoom;
