import React from 'react';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

const ControlButtons = ({ isMuted, isVideoOn, onMuteToggle, onVideoToggle, disabled }) => {
  return (
    <div className="border border-gray-700 rounded-2xl bg-base-200 p-4 shadow-md">
      <div className="flex justify-center gap-6">
        
        {/* Mute / Unmute Button */}
        <button
          onClick={onMuteToggle}
          disabled={disabled}
          className={`btn ${
            isMuted ? 'btn-error' : 'btn-success'
          } rounded-full px-6`}
        >
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          <span className="ml-2">{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        {/* Video On / Off Button */}
        <button
          onClick={onVideoToggle}
          disabled={disabled}
          className={`btn ${
            isVideoOn ? 'btn-primary' : 'btn-neutral'
          } rounded-full px-6`}
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          <span className="ml-2">{isVideoOn ? 'Hide Video' : 'Show Video'}</span>
        </button>

      </div>
    </div>
  );
};

export default ControlButtons;
