// ControlButtons.jsx
import React, { useEffect, useState } from 'react';

const ControlButtons = ({
  isMuted,
  isVideoOn,
  onMuteToggle,
  onVideoToggle,
  disabled,
  onMicChange,    // callback to switch mics
  currentMicId,   // selected deviceId
}) => {
  const [mics, setMics] = useState([]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const audioInputs = devices.filter(d => d.kind === 'audioinput');
        setMics(audioInputs);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="border-2 border-gray-700 rounded-lg bg-base-200 p-4">
      <div className="flex justify-center gap-4">
        {/* Mute + mic selector */}
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={onMuteToggle}
            disabled={disabled}
            className={`btn rounded-lg ${
              isMuted ? 'btn-error' : 'btn-ghost'
            }`}
          >
            {isMuted ? 'Unmute' : 'Mute/Unmute'}
          </button>

          <select
            value={currentMicId || ''}
            onChange={e => onMicChange(e.target.value)}
            disabled={disabled}
            className="select select-bordered bg-base-100 text-sm"
          >
            <option value="">Default mic</option>
            {mics.map(mic => (
              <option key={mic.deviceId} value={mic.deviceId}>
                {mic.label || `Mic ${mic.deviceId}`}
              </option>
            ))}
          </select>
        </div>

        {/* Video toggle */}
        <button
          onClick={onVideoToggle}
          disabled={disabled}
          className="btn btn-ghost flex-1 rounded-lg"
        >
          {isVideoOn ? 'Hide Video' : 'Show Video'}
        </button>
      </div>
    </div>
  );
};

export default ControlButtons;
