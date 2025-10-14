// VideoPanel.jsx - Video fills entire panel
import React from 'react';

const VideoPanel = ({ isConnected, videoRef, hasVideo }) => {
  return (
    <div className="border-2 border-gray-700 rounded-lg bg-black overflow-hidden h-[280px] p-3">
      <div className="w-full h-full bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-gray-600 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${hasVideo ? 'block' : 'hidden'}`}
          style={{ transform: 'scaleX(-1)' }}
        />
        {!hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center text-gray-400">
              <div className="text-5xl mb-2">📹</div>
              <p className="text-sm font-semibold">Video Feed</p>
              {!isConnected && (
                <p className="text-xs text-gray-500 mt-1">Connect to start video</p>
              )}
              {isConnected && (
                <p className="text-xs text-gray-500 mt-1">Waiting for video stream...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPanel;
