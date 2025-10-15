// ControlButtons.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, Video, VideoOff, ChevronDown } from 'lucide-react';

const ControlButtons = ({
  isMuted,
  isVideoOn,
  onMuteToggle,
  onVideoToggle,
  disabled,
  onMicChange,
  currentMicId,
  room,
  isAgentSpeaking,
}) => {
  const [mics, setMics] = useState([]);
  const [showMicDropdown, setShowMicDropdown] = useState(false);
  const [userAudioLevel, setUserAudioLevel] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Get available microphones
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const audioInputs = devices.filter(d => d.kind === 'audioinput');
        setMics(audioInputs);
      })
      .catch(console.error);
  }, []);

  // Monitor user's audio level
  useEffect(() => {
    let mounted = true;

    const setupAudioAnalyser = async () => {
      try {
        // Get user's microphone stream
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: currentMicId || undefined },
          video: false
        });
        
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;

        // Create audio context and analyser
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        
        analyser.fftSize = 256;
        microphone.connect(analyser);
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        // Analyze audio levels
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const updateAudioLevel = () => {
          if (!mounted || !analyserRef.current) return;
          
          analyserRef.current.getByteFrequencyData(dataArray);
          
          // Calculate average audio level
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          const normalizedLevel = Math.min(average / 128, 1); // Normalize to 0-1
          
          setUserAudioLevel(isMuted ? 0 : normalizedLevel);
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        };
        
        updateAudioLevel();
      } catch (error) {
        console.error('Error setting up audio analyser:', error);
      }
    };

    setupAudioAnalyser();

    return () => {
      mounted = false;
      
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [currentMicId, isMuted]);

  const handleMicChange = async (deviceId) => {
    try {
      await room.switchActiveDevice('audioinput', deviceId);
      onMicChange?.(deviceId);
      setShowMicDropdown(false);
    } catch (error) {
      console.error('Error switching microphone:', error);
    }
  };

  // Generate bar heights based on audio level
  const generateBars = () => {
    const bars = [];
    const numBars = 15;
    const activeBars = Math.floor(userAudioLevel * numBars);

    for (let i = 0; i < numBars; i++) {
      const isActive = i < activeBars && !isMuted;
      const baseHeight = 8;
      const maxHeight = 24;
      const height = isActive 
        ? baseHeight + Math.random() * (maxHeight - baseHeight)
        : baseHeight;

      bars.push(
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-100 ${
            isActive ? 'bg-green-500' : 'bg-gray-600'
          }`}
          style={{
            height: `${height}px`,
            animationDelay: isActive ? `${i * 0.05}s` : '0s',
          }}
        />
      );
    }
    return bars;
  };

  return (
    <div className="border-2 border-gray-700 rounded-lg bg-black p-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: User Voice Audio Indicator */}
        <div className="flex items-center gap-1.5 min-w-[140px] h-8">
          {generateBars()}
        </div>

        {/* Center: Microphone Button with Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={onMuteToggle}
              disabled={disabled}
              className={`btn btn-sm h-12 px-4 rounded-lg border-2 transition-all ${
                isMuted
                  ? 'bg-red-600 hover:bg-red-700 border-red-500 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 border-gray-600 text-white'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMicDropdown(!showMicDropdown)}
              disabled={disabled || isAgentSpeaking}
              className={`btn btn-sm h-12 px-3 rounded-lg border-2 bg-gray-800 hover:bg-gray-700 border-gray-600 text-white transition-all ${
                (disabled || isAgentSpeaking) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title={isAgentSpeaking ? "Cannot change mic while agent is speaking" : "Select microphone"}
            >
              <ChevronDown 
                className={`h-4 w-4 transition-transform ${showMicDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Microphone Dropdown */}
            {showMicDropdown && !disabled && !isAgentSpeaking && (
              <div className="absolute bottom-full mb-2 right-0 w-64 bg-gray-900 border-2 border-gray-700 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                <div className="py-2">
                  <div className="px-4 py-2 text-xs text-gray-400 font-semibold uppercase">
                    Select Microphone
                  </div>
                  <div
                    onClick={() => handleMicChange('')}
                    className={`px-4 py-2 hover:bg-gray-800 cursor-pointer transition-colors ${
                      !currentMicId ? 'bg-gray-800 text-white' : 'text-gray-300'
                    }`}
                  >
                    <div className="text-sm">Default Microphone</div>
                  </div>
                  {mics.map((mic) => (
                    <div
                      key={mic.deviceId}
                      onClick={() => handleMicChange(mic.deviceId)}
                      className={`px-4 py-2 hover:bg-gray-800 cursor-pointer transition-colors ${
                        currentMicId === mic.deviceId ? 'bg-gray-800 text-white' : 'text-gray-300'
                      }`}
                    >
                      <div className="text-sm">
                        {mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-gray-700" />

        {/* Right: Video Button */}
        <button
          onClick={onVideoToggle}
          disabled={disabled}
          className={`btn btn-sm h-12 px-4 rounded-lg border-2 transition-all ${
            isVideoOn
              ? 'bg-gray-800 hover:bg-gray-700 border-gray-600 text-white'
              : 'bg-red-600 hover:bg-red-700 border-red-500 text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoOn ? (
            <Video className="h-5 w-5" />
          ) : (
            <VideoOff className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Click outside to close dropdown */}
      {showMicDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMicDropdown(false)}
        />
      )}
    </div>
  );
};

export default ControlButtons;
