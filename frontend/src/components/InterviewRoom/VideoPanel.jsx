import React from 'react';

const VideoPanel = ({ isConnected, videoRef, hasVideo }) => {
  return (
    <div className="flex-1 border-2 border-gray-700 rounded-lg bg-base-200 flex items-center justify-center relative overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${hasVideo ? 'block' : 'hidden'}`}
      />
      {!hasVideo && (
        <div className="text-center text-white absolute">
          <p className="text-lg">Video</p>
          {!isConnected && (
            <p className="text-sm text-gray-500 mt-2">Connect to start video</p>
          )}
          {isConnected && (
            <p className="text-sm text-gray-500 mt-2">Waiting for video stream...</p>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPanel;
