import React, { useRef, useEffect, useState } from 'react';

// Enhanced hook for real-time streaming text (subtitle-like)
const useStreamingText = (text, isStreaming = false, speed = 20) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      setIsActive(false);
      return;
    }

    // If it's a streaming message (interim), show character by character
    if (isStreaming) {
      setIsActive(true);
      let index = 0;
      setDisplayedText('');
      
      const timer = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          setIsActive(false);
          clearInterval(timer);
        }
      }, speed);

      return () => clearInterval(timer);
    } else {
      // For final messages, show immediately
      setDisplayedText(text);
      setIsActive(false);
    }
  }, [text, isStreaming, speed]);

  return { displayedText, isActive };
};

// Message component with streaming effect
const MessageBubble = ({ msg, isLatestStreaming = false }) => {
  const { displayedText, isActive } = useStreamingText(
    msg.text, 
    isLatestStreaming && !msg.isFinal,
    msg.speaker === 'Agent' ? 15 : 25 
  );

  return (
    <div className={`flex ${msg.speaker === 'You' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${
        msg.speaker === 'You' ? 'bg-black' : 'bg-black'
      } rounded-2xl px-4 py-3 relative`}>
        <p className={`font-medium text-xs mb-1 ${
          msg.speaker === 'You' ? 'text-blue-200' : 'text-green-200'
        }`}>
          {msg.speaker} • {msg.timestamp}
          {isActive && msg.speaker === 'Agent' && (
            <span className="ml-2 text-xs text-green-300">● LIVE</span>
          )}
        </p>
        <p className="text-white text-sm leading-relaxed">
          {displayedText}
          {isActive && (
            <span className="animate-pulse ml-1 text-gray-300 font-bold">|</span>
          )}
        </p>
      </div>
    </div>
  );
};

const TranscriptPanel = ({ transcript, isAgentSpeaking = false }) => {
  const transcriptEndRef = useRef(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Filter out system messages - only show Agent and You
  const filteredTranscript = transcript.filter(
    msg => msg.speaker === 'You' || msg.speaker === 'Agent'
  );

  return (
    <div className="flex-1 border-2 border-gray-700 rounded-lg bg-base-200 p-4 overflow-y-auto">
      {filteredTranscript.length === 0 ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-2">AI Interview Ready</p>
            <p className="text-gray-400 text-sm">Start speaking to see live transcription</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTranscript.map((msg, idx) => {
            const isLatest = idx === filteredTranscript.length - 1;
            const isLatestAgent = isLatest && msg.speaker === 'Agent';
            
            return (
              <MessageBubble 
                key={`${msg.speaker}-${idx}-${msg.timestamp}-${msg.segmentId || ''}`}
                msg={msg}
                isLatestStreaming={isLatestAgent && isAgentSpeaking}
              />
            );
          })}
          <div ref={transcriptEndRef} />
        </div>
      )}
    </div>
  );
};

export default TranscriptPanel;
