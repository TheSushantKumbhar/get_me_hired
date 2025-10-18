import { ArrowRight, Mic, FileText, BarChart3, Building2, MessageSquare } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";


function LandingPage() {
  const navigate = useNavigate();
  const featuresRef = useRef([]);
  const [visibleCards, setVisibleCards] = useState([]);


  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = featuresRef.current.indexOf(entry.target);
            setVisibleCards((prev) => [...prev, index]);
          }
        });
      },
      { threshold: 0.2 }
    );


    featuresRef.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });


    return () => observer.disconnect();
  }, []);


  return (
    <div className="overflow-x-hidden">

      <Toaster />
      <div className="hero bg-base-200 min-h-[95vh] font-work-sans relative">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-6xl font-bold font-space-mono">Get Me Hired</h1>
            <p className="py-6 text-lg">
              Get ready for your next interview with guided practice sessions
              and practical insights to help you improve.
            </p>
            <button
              className="btn btn-primary italic m-1"
              onClick={() => navigate("/job")}
            >
              Browse Jobs <ArrowRight />
            </button>
          </div>
        </div>
        
        {/* Scroll Down Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
               onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
            <span className="text-sm font-medium">Scroll Down</span>
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
          </div>
        </div>
      </div>


      {/* Features Section */}
      <div className="bg-base-100 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4 font-space-mono">
              What We Offer
            </h2>
            <p className="text-base-content/60 text-lg">
              Everything you need to ace your next interview
            </p>
          </div>


          {/* First Row - 3 Items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
            {/* Item 1 */}
            <div
              ref={(el) => (featuresRef.current[0] = el)}
              className={`text-center transition-all duration-700 ${
                visibleCards.includes(0)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg hover:scale-110 transition-transform duration-300">
                <Mic className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold mb-3">Voice Interview Practice</h3>
              <p className="text-base-content/70 leading-relaxed max-w-xs mx-auto">
                Practice with AI voice interviews that feel real and help you improve
              </p>
            </div>


            {/* Item 2 */}
            <div
              ref={(el) => (featuresRef.current[1] = el)}
              className={`text-center transition-all duration-700 ${
                visibleCards.includes(1)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "150ms" }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-secondary to-secondary/70 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg hover:scale-110 transition-transform duration-300">
                <FileText className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold mb-3">Custom Questions</h3>
              <p className="text-base-content/70 leading-relaxed max-w-xs mx-auto">
                Questions matched to your background and the job you want
              </p>
            </div>


            {/* Item 3 */}
            <div
              ref={(el) => (featuresRef.current[2] = el)}
              className={`text-center transition-all duration-700 ${
                visibleCards.includes(2)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "300ms" }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold mb-3">Track Your Progress</h3>
              <p className="text-base-content/70 leading-relaxed max-w-xs mx-auto">
                Get instant feedback and see how you improve over time
              </p>
            </div>
          </div>


          {/* Second Row - 2 Items Centered */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-3xl mx-auto">
            {/* Item 4 */}
            <div
              ref={(el) => (featuresRef.current[3] = el)}
              className={`text-center transition-all duration-700 ${
                visibleCards.includes(3)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-success to-success/70 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg hover:scale-110 transition-transform duration-300">
                <Building2 className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold mb-3">Company Interviews</h3>
              <p className="text-base-content/70 leading-relaxed max-w-xs mx-auto">
                Practice with real interview questions from actual companies
              </p>
            </div>


            {/* Item 5 */}
            <div
              ref={(el) => (featuresRef.current[4] = el)}
              className={`text-center transition-all duration-700 ${
                visibleCards.includes(4)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: "150ms" }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-bold mb-3">Join the Community</h3>
              <p className="text-base-content/70 leading-relaxed max-w-xs mx-auto">
                Share tips, learn from others, and get support from job seekers
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Footer */}
      <footer className="footer footer-center bg-base-300 text-base-content p-10">
        <nav className="grid grid-flow-col gap-4">
          <a className="link link-hover">About</a>
          <a className="link link-hover">Contact</a>
          <a className="link link-hover">Privacy Policy</a>
          <a className="link link-hover">Terms of Service</a>
        </nav>
        <nav>
          <div className="grid grid-flow-col gap-4">
            <a className="cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
              </svg>
            </a>
            <a className="cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
              </svg>
            </a>
            <a className="cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
              </svg>
            </a>
          </div>
        </nav>
        <aside>
          <p className="font-semibold">
            Get Me Hired
            <br />
            Your Career, Our Mission
          </p>
          <p className="text-sm opacity-70">
            Copyright © {new Date().getFullYear()} - All rights reserved
          </p>
        </aside>
      </footer>
    </div>
  );
}


export default LandingPage;
