import { ArrowRight } from "lucide-react";

function LandingPage() {
  return (
    <div className="hero bg-base-200 min-h-screen font-work-sans">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold font-space-mono">Get-Me-Hired</h1>
          <p className="py-6">
            Get ready for your next interview with guided practice sessions and
            practical insights to help you improve.
          </p>
          <button className="btn btn-primary">
            Browse Jobs <ArrowRight />{" "}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
