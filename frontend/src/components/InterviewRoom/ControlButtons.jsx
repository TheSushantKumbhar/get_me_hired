// ControlButtons.jsx
import React, { useEffect, useState } from 'react';

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

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const audioInputs = devices.filter(d => d.kind === 'audioinput');
        setMics(audioInputs);
      })
      .catch(console.error);
  }, []);

  const handleMicChange = async (deviceId) => {
    try {
      await room.switchActiveDevice('audioinput', deviceId);
      onMicChange?.(deviceId);
      setShowMicDropdown(false);
    } catch (error) {
      console.error('Error switching microphone:', error);
    }
  };

  return (
    <div className="border-2 border-gray-700 rounded-lg bg-black p-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Voice Audio Indicator */}
        <div className="flex items-center gap-2 min-w-[120px]">
          {isAgentSpeaking ? (
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-green-500 rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 16 + 8}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.6s',
                  }}
                />
              ))}
              {[...Array(10)].map((_, i) => (
                <div
                  key={i + 5}
                  className="w-1 h-2 bg-gray-500 rounded-full"
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 h-2 bg-gray-600 rounded-full"
                />
              ))}
            </div>
          )}
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                {isMuted ? (
                  <path
                    fillRule="evenodd"
                    d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
                )}
              </svg>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform ${showMicDropdown ? 'rotate-180' : ''}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            {isVideoOn ? (
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            ) : (
              <path
                fillRule="evenodd"
                d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                clipRule="evenodd"
              />
            )}
          </svg>
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
