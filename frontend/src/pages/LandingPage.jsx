import { ArrowRight } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <Toaster />
      <div className="hero bg-base-200 min-h-[95vh] font-work-sans">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-6xl font-bold font-space-mono">Get Me Hired</h1>
            <p className="py-6">
              Get ready for your next interview with guided practice sessions
              and practical insights to help you improve.
            </p>
            <button
              className="btn btn-primary italic m-1"
              onClick={() => navigate("/job")}
            >
              Browse Jobs <ArrowRight />{" "}
            </button>
            <button
              className="btn btn-secondary text-secondary-content italic m-1"
              onClick={() => navigate("/interview")}
            >
              Try Interview <ArrowRight />{" "}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default LandingPage;
