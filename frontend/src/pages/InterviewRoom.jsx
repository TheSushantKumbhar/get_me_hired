<<<<<<< Updated upstream
import React, { useState, useRef, useEffect } from "react";
import Header from "../components/InterviewRoom/Header";
import TranscriptPanel from "../components/InterviewRoom/TranscriptPanel";
import MessageBox from "../components/InterviewRoom/MessageBox";
import VideoPanel from "../components/InterviewRoom/VideoPanel";
import ParticipantIndicators from "../components/InterviewRoom/ParticipantIndicators";
import InfoPanel from "../components/InterviewRoom/InfoPanel";
import ControlButtons from "../components/InterviewRoom/ControlButtons";
=======
import React, { useState, useRef, useEffect } from 'react';
import Header from '../components/InterviewRoom/Header';
import TranscriptPanel from '../components/InterviewRoom/TranscriptPanel';
import MessageBox from '../components/InterviewRoom/MessageBox';
import VideoPanel from '../components/InterviewRoom/VideoPanel';
import ParticipantIndicators from '../components/InterviewRoom/ParticipantIndicators';
import InfoPanel from '../components/InterviewRoom/InfoPanel';
import ControlButtons from '../components/InterviewRoom/ControlButtons';
import SplineAnimation from '../components/InterviewRoom/SplineAnimation';
>>>>>>> Stashed changes

const InterviewRoom = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [status, setStatus] = useState("Disconnected");
  const [interviewName] = useState("AI Interview Session");
  const [hasVideo, setHasVideo] = useState(false);
  const [currentMic, setCurrentMic] = useState("");
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false); // Track agent speaking state
  const [participants, setParticipants] = useState([
    { id: 1, active: false },
    { id: 2, active: false },
    { id: 3, active: false },
    { id: 4, active: false },
    { id: 5, active: false },
  ]);

  const roomRef = useRef(null);
  const videoRef = useRef(null);
  const agentSpeakingTimeoutRef = useRef(null);

  // Connect to LiveKit Room
  const connectToRoom = async () => {
    try {
      setStatus("Connecting...");

      const response = await fetch("http://localhost:5000/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
<<<<<<< Updated upstream
          room: "interview-room",
          participant: "User-" + Math.random().toString(36).substr(2, 9),
        }),
=======
          room: 'interview-room',

          participant: 'User-' + Math.random().toString(36).substr(2, 9)
        })
>>>>>>> Stashed changes
      });

      if (!response.ok) {
        throw new Error("Failed to get token. Make sure backend is running.");
      }

      const { token, url } = await response.json();
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

      // Event handlers
      room.on(LiveKit.RoomEvent.Connected, () => {
        setIsConnected(true);
        setStatus("Connected");
        setRoomId(room.name);
        updateParticipant(0, true);

        // Register transcription handler for real-time subtitle-like transcripts
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
                  // Agent is speaking - enable live subtitle effect
                  setIsAgentSpeaking(true);

                  // Clear any existing timeout
                  if (agentSpeakingTimeoutRef.current) {
                    clearTimeout(agentSpeakingTimeoutRef.current);
                  }

                  // Set timeout to stop agent speaking indicator
                  agentSpeakingTimeoutRef.current = setTimeout(
                    () => {
                      setIsAgentSpeaking(false);
                    },
                    isFinal ? 1000 : 2000,
                  ); // Longer timeout for interim
                }

                if (isFinal) {
                  // Final transcription - replace any interim
                  addFinalTranscript(speaker, message, segmentId);
                } else {
                  // Interim transcription - show with streaming effect
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
        setIsConnected(false);
        setStatus("Disconnected");
        setIsAgentSpeaking(false);
        resetParticipants();
      });

      room.on(LiveKit.RoomEvent.ParticipantConnected, (participant) => {
        console.log(`${participant.identity} joined`);
        updateNextParticipant(true);
      });

      room.on(
        LiveKit.RoomEvent.TrackSubscribed,
        (track, publication, participant) => {
          if (track.kind === "audio") {
            const audioElement = track.attach();
            audioElement.volume = 1.0;
            document.body.appendChild(audioElement);

            // Detect when agent starts/stops speaking
            if (participant.identity.toLowerCase().includes("agent")) {
              // Monitor audio levels to detect when agent is actually speaking
              const audioContext = new AudioContext();
              const source = audioContext.createMediaStreamSource(
                new MediaStream([track.mediaStreamTrack]),
              );
              const analyser = audioContext.createAnalyser();
              source.connect(analyser);

              const dataArray = new Uint8Array(analyser.frequencyBinCount);

              const checkAudioLevel = () => {
                analyser.getByteFrequencyData(dataArray);
                const average =
                  dataArray.reduce((a, b) => a + b) / dataArray.length;

                if (average > 10) {
                  // Threshold for speech detection
                  setIsAgentSpeaking(true);
                }

                requestAnimationFrame(checkAudioLevel);
              };

              checkAudioLevel();
            }
          }

          if (track.kind === "video") {
            if (videoRef.current) {
              track.attach(videoRef.current);
              setHasVideo(true);
            }
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

      // Connect to room
      await room.connect(url, token);
      await room.localParticipant.setMicrophoneEnabled(true);
      roomRef.current = room;
    } catch (error) {
      console.error("Connection error:", error);
      setStatus("Error: " + error.message);
    }
  };

  // Add final transcript (replaces interim)
  const addFinalTranscript = (speaker, text, segmentId) => {
    if (!text || !text.trim()) return;

    setTranscript((prev) => {
      // Remove any interim message with same segmentId
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

  // Add interim transcript (for streaming effect)
  const addInterimTranscript = (speaker, text, segmentId) => {
    if (!text || !text.trim()) return;

    setTranscript((prev) => {
      // Remove any previous interim message with same segmentId
      const filtered = prev.filter((msg) => msg.segmentId !== segmentId);

      return [
        ...filtered,
        {
          speaker,
          text: text.trim(),
          timestamp: new Date().toLocaleTimeString(),
          isFinal: false,
          segmentId,
          isStreaming: speaker === "Agent", // Enable streaming for agent
        },
      ];
    });
  };

  const disconnectFromRoom = async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
    }
    setIsAgentSpeaking(false);
    if (agentSpeakingTimeoutRef.current) {
      clearTimeout(agentSpeakingTimeoutRef.current);
    }
  };

  const toggleMute = async () => {
    if (roomRef.current) {
      const newState = !isMuted;
      await roomRef.current.localParticipant.setMicrophoneEnabled(!newState);
      setIsMuted(newState);
    }
  };

  const onMicChange = async (deviceId) => {
    setCurrentMic(deviceId);
    if (roomRef.current) {
      // disable current mic
      await roomRef.current.localParticipant.setMicrophoneEnabled(false);

      // unpublish old track
      const oldPublication = Array.from(
<<<<<<< Updated upstream
        roomRef.current.localParticipant.audioTracks.values(),
      )[0];
      if (oldPublication) {
        await roomRef.current.localParticipant.unpublishTrack(
          oldPublication.track,
        );
=======
        roomRef.current.localParticipant.audioTracks.values()
      )[0];
      if (oldPublication) {
        await roomRef.current.localParticipant.unpublishTrack(oldPublication.track);
>>>>>>> Stashed changes
      }

      // get new MediaStream from selected device
      const newStream = await navigator.mediaDevices.getUserMedia({
<<<<<<< Updated upstream
        audio: { deviceId: deviceId || undefined },
=======
        audio: { deviceId: deviceId || undefined }
>>>>>>> Stashed changes
      });
      const newTrack = newStream.getAudioTracks()[0];
      // publish new track
      await roomRef.current.localParticipant.publishTrack(newTrack);
      // re-enable mic if not muted
      await roomRef.current.localParticipant.setMicrophoneEnabled(!isMuted);
    }
  };

  const toggleVideo = async () => {
    if (roomRef.current) {
      const newState = !isVideoOn;
      await roomRef.current.localParticipant.setCameraEnabled(newState);
      setIsVideoOn(newState);

      if (newState && videoRef.current) {
        const tracks = Array.from(
          roomRef.current.localParticipant.videoTracks.values(),
        );
        if (tracks.length > 0) {
          const videoTrack = tracks[0].videoTrack;
          if (videoTrack) {
            videoTrack.attach(videoRef.current);
            setHasVideo(true);
          }
        }
      } else {
        setHasVideo(false);
      }
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleSendMessage = (message) => {
    if (roomRef.current && message.trim()) {
      const encoder = new TextEncoder();
      const data = encoder.encode(
        JSON.stringify({
          type: "chat_message",
          text: message,
          timestamp: Date.now(),
        }),
      );
      roomRef.current.localParticipant.publishData(data, { reliable: true });

      // Add to transcript immediately
      setTranscript((prev) => [
        ...prev,
        {
          speaker: "You",
          text: message.trim(),
          timestamp: new Date().toLocaleTimeString(),
          isFinal: true,
        },
      ]);
    }
  };

  const updateParticipant = (index, active) => {
    setParticipants((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], active };
      }
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
      if (agentSpeakingTimeoutRef.current) {
        clearTimeout(agentSpeakingTimeoutRef.current);
      }
    };
  }, []);

  return (
    // <div className="h-screen bg-black text-white flex flex-col">
    //   <Header
    //     interviewName={interviewName}
    //     isRecording={isRecording}
    //     onRecordToggle={toggleRecording}
    //     isConnected={isConnected}
    //     onDisconnect={disconnectFromRoom}
    //     onConnect={connectToRoom}
    //   />

    //   <div className="flex-1 flex gap-4 p-4 overflow-hidden">
    //     {/* Left Panel */}
    //     <div className="flex-1 flex flex-col gap-4">
    //       <TranscriptPanel
    //         transcript={transcript}
    //         isAgentSpeaking={isAgentSpeaking}
    //       />
    //       <MessageBox onSendMessage={handleSendMessage} disabled={!isConnected} />
    //     </div>

    //     {/* Right Panel */}
    //     <div className="w-96 flex flex-col gap-4">
    //       {/* <VideoPanel isConnected={isConnected} videoRef={videoRef} hasVideo={hasVideo} /> */}
    //       <div className="w-full h-screen flex items-center justify-center bg-black">
    //         <div className="w-[600px] h-[400px]">
    //           <SplineAnimation />
    //         </div>
    //       </div>
    //       <ParticipantIndicators participants={participants} />
    //       <InfoPanel roomId={roomId} status={status} />
    //       <ControlButtons
    //         isMuted={isMuted}
    //         isVideoOn={isVideoOn}
    //         onMuteToggle={toggleMute}
    //         onVideoToggle={toggleVideo}
    //         disabled={!isConnected}
    //         onMicChange={onMicChange}
    //         currentMicId={currentMic}
    //       />
    //     </div>
    //   </div>
    // </div>

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
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          <TranscriptPanel
            transcript={transcript}
            isAgentSpeaking={isAgentSpeaking}
          />
          <MessageBox
            onSendMessage={handleSendMessage}
            disabled={!isConnected}
          />
        </div>

        {/* Right Panel */}
<<<<<<< Updated upstream
        <div className="w-96 flex flex-col gap-4">
          <VideoPanel
            isConnected={isConnected}
            videoRef={videoRef}
            hasVideo={hasVideo}
          />
=======
        <div className="w-96 flex flex-col gap-4 overflow-y-auto">
          <div className="flex justify-center items-center bg-black rounded-xl shadow-lg overflow-hidden">
            <div className="w-[400px] h-[400px] mx-auto">
              <SplineAnimation />
            </div>
          </div>

>>>>>>> Stashed changes
          <ParticipantIndicators participants={participants} />
          <InfoPanel roomId={roomId} status={status} />
          <ControlButtons
            isMuted={isMuted}
            isVideoOn={isVideoOn}
            onMuteToggle={toggleMute}
            onVideoToggle={toggleVideo}
            disabled={!isConnected}
            onMicChange={onMicChange}
            currentMicId={currentMic}
          />
        </div>

      </div>
    </div>

  );
};

export default InterviewRoom;
