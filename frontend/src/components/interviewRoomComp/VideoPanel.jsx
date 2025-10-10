import React from 'react';

const VideoPanel = ({ isConnected, videoRef }) => {
  return (
    <div className="flex-1 border-2 border-gray-700 rounded-lg bg-black flex items-center justify-center relative overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
        style={{ display: 'none' }}
      />
      <div className="text-center text-white">
        <p className="text-lg">Video</p>
        {!isConnected && (
          <p className="text-sm text-gray-500 mt-2">Connect to start video</p>
        )}
      </div>
    </div>
  );
};

export default VideoPanel;