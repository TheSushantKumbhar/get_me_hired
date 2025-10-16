import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const FeedbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState([]);
  const [interviewData, setInterviewData] = useState({});

  useEffect(() => {
    // Get transcript data passed from InterviewRoom
    const data = location.state;
    
    if (!data || !data.transcript) {
      // If no data, redirect back
      navigate('/');
      return;
    }

    setTranscript(data.transcript);
    setInterviewData({
      roomId: data.roomId || '',
      interviewName: data.interviewName || 'Interview Session',
      duration: data.duration || 'N/A',
    });
  }, [location.state, navigate]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleDownloadTranscript = () => {
    const transcriptText = transcript
      .map(msg => `[${msg.timestamp}] ${msg.speaker}: ${msg.text}`)
      .join('\n\n');
    
    const blob = new Blob([transcriptText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transcript-${Date.now()}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <div className="navbar bg-base-200 shadow-lg">
        <div className="flex-1">
          <h1 className="text-xl font-bold px-4">Interview Feedback</h1>
        </div>
        <div className="flex-none gap-2">
          <button 
            onClick={handleDownloadTranscript}
            className="btn btn-ghost btn-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
          <button 
            onClick={handleBackToHome}
            className="btn btn-primary btn-sm"
          >
            Back to Home
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 lg:p-6">
        {/* Interview Info */}
        <div className="mb-6 p-4 bg-base-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">{interviewData.interviewName}</h2>
          <div className="text-sm opacity-70">
            <span className="mr-4">Room ID: {interviewData.roomId}</span>
            <span>Duration: {interviewData.duration}</span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Left Side - Transcript */}
          <div className="bg-base-200 rounded-lg shadow-xl p-4 lg:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Transcript</h2>
              <span className="badge badge-primary">{transcript.length} messages</span>
            </div>
            
            <div className="divider my-2"></div>

            <div className="overflow-y-auto max-h-[calc(100vh-300px)] space-y-3">
              {transcript.length === 0 ? (
                <div className="text-center py-8 text-base-content opacity-50">
                  No transcript available
                </div>
              ) : (
                transcript.map((msg, idx) => (
                  <div 
                    key={`${msg.speaker}-${idx}-${msg.timestamp}`}
                    className={`p-3 rounded-lg ${
                      msg.speaker === 'You' 
                        ? 'bg-primary bg-opacity-20 ml-4' 
                        : 'bg-secondary bg-opacity-20 mr-4'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-semibold text-sm ${
                        msg.speaker === 'You' ? 'text-primary' : 'text-secondary'
                      }`}>
                        {msg.speaker}
                      </span>
                      <span className="text-xs opacity-60">{msg.timestamp}</span>
                    </div>
                    <p className="text-sm leading-relaxed break-words">
                      {msg.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Side - Feedback */}
          <div className="bg-base-200 rounded-lg shadow-xl p-4 lg:p-6">
            <h2 className="text-xl font-bold mb-4">AI Feedback</h2>
            
            <div className="divider my-2"></div>

            <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
              {/* Placeholder for feedback */}
              <div className="text-center py-12">
                <div className="mb-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-16 w-16 mx-auto opacity-30" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-base-content opacity-50 mb-2">Feedback analysis coming soon</p>
                <p className="text-sm opacity-40">AI-powered interview feedback will appear here</p>
              </div>

              {/* Future feedback sections - currently empty */}
              <div className="space-y-4 hidden">
                <div className="card bg-base-100 shadow-sm">
                  <div className="card-body p-4">
                    <h3 className="card-title text-base">Overall Performance</h3>
                    <p className="text-sm opacity-70">Feedback content here...</p>
                  </div>
                </div>

                <div className="card bg-base-100 shadow-sm">
                  <div className="card-body p-4">
                    <h3 className="card-title text-base">Communication Skills</h3>
                    <p className="text-sm opacity-70">Feedback content here...</p>
                  </div>
                </div>

                <div className="card bg-base-100 shadow-sm">
                  <div className="card-body p-4">
                    <h3 className="card-title text-base">Technical Knowledge</h3>
                    <p className="text-sm opacity-70">Feedback content here...</p>
                  </div>
                </div>

                <div className="card bg-base-100 shadow-sm">
                  <div className="card-body p-4">
                    <h3 className="card-title text-base">Areas for Improvement</h3>
                    <p className="text-sm opacity-70">Feedback content here...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
