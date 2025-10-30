import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const FeedbackPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState([]);
  const [interviewData, setInterviewData] = useState({});
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = location.state;

    if (!data || !data.transcript) {
      navigate("/");
      return;
    }

    setTranscript(data.transcript);
    setInterviewData({
      roomId: data.roomId || "",
      interviewName: data.interviewName || "Interview Session",
      duration: data.duration || "N/A",
    });

    const fetchFeedback = async () => {
      try {
        const res = await fetch("http://localhost:5000/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: data.transcript }),
        });

        const result = await res.json();
        setFeedback(result.feedback || []);
      } catch (err) {
        console.error("Error fetching feedback:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [location.state, navigate]);

  const handleBackToHome = () => navigate("/");

  const handleDownloadTranscript = () => {
    const transcriptText = transcript
      .map((msg) => `[${msg.timestamp}] ${msg.speaker}: ${msg.text}`)
      .join("\n\n");

    const blob = new Blob([transcriptText], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transcript-${Date.now()}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen font-work-sans bg-base-100 pt-10">
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </button>
          <button onClick={handleBackToHome} className="btn btn-primary btn-sm">
            Back to Home
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 lg:p-6">
        {/* Interview Info */}
        <div className="mb-6 p-4 bg-base-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">
            {interviewData.interviewName}
          </h2>
          <div className="text-sm opacity-70">
            <span className="mr-4">Room ID: {interviewData.roomId}</span>
            <span>Duration: {interviewData.duration}</span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Left - Transcript */}
          <div className="bg-base-200 rounded-lg shadow-xl p-4 lg:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Transcript</h2>
              <span className="badge badge-primary">
                {transcript.length} messages
              </span>
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
                      msg.speaker === "You"
                        ? "bg-primary bg-opacity-20 ml-4"
                        : "bg-secondary bg-opacity-20 mr-4"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`font-semibold text-sm ${
                          msg.speaker === "You"
                            ? "text-primary"
                            : "text-secondary"
                        }`}
                      >
                        {msg.speaker}
                      </span>
                      <span className="text-xs opacity-60">
                        {msg.timestamp}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed break-words">
                      {msg.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right - Feedback */}
          <div className="bg-base-200 rounded-lg shadow-xl p-4 lg:p-6">
            <h2 className="text-xl font-bold mb-4">AI Feedback</h2>
            <div className="divider my-2"></div>

            <div className="overflow-y-auto max-h-[calc(100vh-300px)] space-y-4">
              {loading ? (
                <div className="text-center py-12 opacity-60">
                  <span className="loading loading-spinner loading-lg"></span>
                  <p className="mt-4">Analyzing your interview...</p>
                </div>
              ) : feedback.length === 0 ? (
                <div className="text-center py-12 opacity-60">
                  No feedback available.
                </div>
              ) : (
                feedback.map((item, idx) => (
                  <div
                    key={idx}
                    className="card bg-base-100 shadow-sm border border-base-300"
                  >
                    <div className="card-body p-4">
                      <h3 className="font-semibold text-base mb-2">
                        Q{idx + 1}: {item.question}
                      </h3>
                      <p className="text-sm mb-3">
                        <span className="font-semibold">Answer:</span>{" "}
                        {item.answer}
                      </p>

                      <div className="bg-base-200 rounded-md p-3">
                        <p className="text-sm mb-1">
                          <span className="font-semibold text-success">
                            Strengths:
                          </span>{" "}
                          {item.feedback?.strengths || "N/A"}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold text-warning">
                            Improvements:
                          </span>{" "}
                          {item.feedback?.improvements || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
