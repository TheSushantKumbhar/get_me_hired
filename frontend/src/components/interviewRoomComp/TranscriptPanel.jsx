import React, { useRef, useEffect } from 'react';

const TranscriptPanel = ({ transcript }) => {
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  return (
    <div className="flex-1 border-2 border-gray-700 rounded-lg bg-black p-4 overflow-y-auto">
      {transcript.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-500 text-center">AI conversation and human reply texts</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transcript.map((msg, idx) => (
            <div key={idx} className="text-sm">
              <p className={`font-medium mb-1 ${
                msg.speaker === 'You' ? 'text-blue-400' :
                msg.speaker === 'Agent' ? 'text-green-400' :
                'text-cyan-400'
              }`}>
                {msg.speaker} <span className="text-gray-500 text-xs">{msg.timestamp}</span>
              </p>
              <p className="text-gray-300">{msg.text}</p>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>
      )}
    </div>
  );
};

export default TranscriptPanel;