import React, { useEffect, useRef, useState } from "react";

const VideoPanel = ({ 
  isConnected, 
  videoRef, 
  hasVideo,
  onParticipantCountChange,
  onEyeViolationCountChange
}) => {
  const canvasRef = useRef(null);
  const [numPeople, setNumPeople] = useState(0);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [violationDetected, setViolationDetected] = useState(false);
  const [eyeViolation, setEyeViolation] = useState(null);
  const [eyeViolationCount, setEyeViolationCount] = useState(0);
  const humanRef = useRef(null);
  const animationFrameRef = useRef(null);

  const detectionHistoryRef = useRef([]);
  const eyeHistoryRef = useRef([]);
  const previousViolationRef = useRef(null);
  const HISTORY_SIZE = 3;
  const EYE_HISTORY_SIZE = 10;

  // Initialize Human.js with iris tracking for eye gaze
  useEffect(() => {
    const initHuman = async () => {
      try {
        const HumanModule = await import(
          "https://cdn.jsdelivr.net/npm/@vladmandic/human@3.0.2/dist/human.esm.js"
        );
        const Human = HumanModule.default;
        humanRef.current = new Human({
          modelBasePath:
            "https://cdn.jsdelivr.net/npm/@vladmandic/human@3.0.2/models",
          backend: "webgl",
          async: true,
          face: {
            enabled: true,
            detector: {
              rotation: true,
              maxDetected: 20,
              minConfidence: 0.2,
              iouThreshold: 0.1,
              return: true,
            },
            mesh: { enabled: true },
            iris: { enabled: true },
            description: { enabled: false },
            emotion: { enabled: false },
            age: { enabled: false },
            gender: { enabled: false },
            antispoof: { enabled: false },
            liveness: { enabled: false },
          },
          body: { 
            enabled: true,
            maxDetected: 20,
            minConfidence: 0.2,
            iouThreshold: 0.1,
          },
          hand: { enabled: false },
          gesture: { enabled: false },
          object: { enabled: false },
          segmentation: { enabled: false },
          filter: { 
            enabled: false,
            equalization: false, 
            flip: false 
          },
        });
        
        await humanRef.current.load();
        await humanRef.current.warmup();
        setIsModelLoaded(true);
      } catch (err) {
        console.error("Failed to initialize Human.js:", err);
        setError("Failed to load detection models");
      }
    };
    initHuman();
    return () => {
      if (humanRef.current) {
        humanRef.current = null;
      }
    };
  }, []);

  // Detection loop with eye tracking
  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !isModelLoaded || !hasVideo) {
      return;
    }
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext("2d");
    let isRunning = true;

    const runDetection = async () => {
      if (!isRunning || !humanRef.current) return;
      
      try {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
        }

        const result = await humanRef.current.detect(video);
        
        // Person counting
        const validFaces = (result.face || []).filter(f => 
          f.box && f.box.length === 4 && f.box[2] > 10 && f.box[3] > 10 && f.score >= 0.15
        );
        const validBodies = (result.body || []).filter(b => 
          b.box && b.box.length === 4 && b.box[2] > 20 && b.box[3] > 30 && b.score >= 0.15
        );

        const detectedPeople = Math.max(validFaces.length, validBodies.length);

        detectionHistoryRef.current.push(detectedPeople);
        if (detectionHistoryRef.current.length > HISTORY_SIZE) {
          detectionHistoryRef.current.shift();
        }
        const stableCount = Math.max(...detectionHistoryRef.current);
        setNumPeople(stableCount);
        
        // Notify parent of participant count
        if (onParticipantCountChange) {
          onParticipantCountChange(stableCount);
        }

        // EYE TRACKING LOGIC
        let currentEyeViolation = null;

        if (validFaces.length > 0 && result.face[0].annotations) {
          const face = result.face[0];
          const annotations = face.annotations;
          
          if (annotations.leftEyeIris && annotations.rightEyeIris && 
              annotations.leftEyeLower0 && annotations.rightEyeLower0) {
            
            const leftIris = annotations.leftEyeIris;
            const leftEyeBox = annotations.leftEyeLower0;
            const leftEyeCenter = leftEyeBox.reduce((acc, pt) => {
              acc[0] += pt[0];
              acc[1] += pt[1];
              return acc;
            }, [0, 0]).map(v => v / leftEyeBox.length);
            
            const leftIrisCenter = leftIris.reduce((acc, pt) => {
              acc[0] += pt[0];
              acc[1] += pt[1];
              return acc;
            }, [0, 0]).map(v => v / leftIris.length);

            const rightIris = annotations.rightEyeIris;
            const rightEyeBox = annotations.rightEyeLower0;
            const rightEyeCenter = rightEyeBox.reduce((acc, pt) => {
              acc[0] += pt[0];
              acc[1] += pt[1];
              return acc;
            }, [0, 0]).map(v => v / rightEyeBox.length);
            
            const rightIrisCenter = rightIris.reduce((acc, pt) => {
              acc[0] += pt[0];
              acc[1] += pt[1];
              return acc;
            }, [0, 0]).map(v => v / rightIris.length);

            // Calculate gaze offset - INVERTED for mirrored video
            const leftGazeX = -(leftIrisCenter[0] - leftEyeCenter[0]);
            const rightGazeX = -(rightIrisCenter[0] - rightEyeCenter[0]);
            const leftGazeY = leftIrisCenter[1] - leftEyeCenter[1];
            const rightGazeY = rightIrisCenter[1] - rightEyeCenter[1];

            const avgGazeX = (leftGazeX + rightGazeX) / 2;
            const avgGazeY = (leftGazeY + rightGazeY) / 2;

            const leftEyeWidth = Math.max(...leftEyeBox.map(pt => pt[0])) - Math.min(...leftEyeBox.map(pt => pt[0]));
            const rightEyeWidth = Math.max(...rightEyeBox.map(pt => pt[0])) - Math.min(...rightEyeBox.map(pt => pt[0]));
            const avgEyeWidth = (leftEyeWidth + rightEyeWidth) / 2;

            const gazeRatioX = avgGazeX / avgEyeWidth;
            const gazeRatioY = avgGazeY / avgEyeWidth;

            // Moderate and extreme thresholds
            const MODERATE_THRESHOLD = 0.08;
            const EXTREME_THRESHOLD = 0.18;
            
            const isLookingAway = Math.abs(gazeRatioX) > MODERATE_THRESHOLD || 
                                   Math.abs(gazeRatioY) > MODERATE_THRESHOLD;
            
            const isExtremeGaze = Math.abs(gazeRatioX) > EXTREME_THRESHOLD || 
                                   Math.abs(gazeRatioY) > EXTREME_THRESHOLD;

            if (isLookingAway) {
              const absX = Math.abs(gazeRatioX);
              const absY = Math.abs(gazeRatioY);
              
              if (absX > absY) {
                if (gazeRatioX < -MODERATE_THRESHOLD) {
                  currentEyeViolation = isExtremeGaze && gazeRatioX < -EXTREME_THRESHOLD ? 
                    "LOOKING EXTREME LEFT" : "LOOKING LEFT";
                } else if (gazeRatioX > MODERATE_THRESHOLD) {
                  currentEyeViolation = isExtremeGaze && gazeRatioX > EXTREME_THRESHOLD ? 
                    "LOOKING EXTREME RIGHT" : "LOOKING RIGHT";
                }
              } else {
                if (gazeRatioY < -MODERATE_THRESHOLD) {
                  currentEyeViolation = isExtremeGaze && gazeRatioY < -EXTREME_THRESHOLD ? 
                    "LOOKING EXTREME UP" : "LOOKING UP";
                } else if (gazeRatioY > MODERATE_THRESHOLD) {
                  currentEyeViolation = isExtremeGaze && gazeRatioY > EXTREME_THRESHOLD ? 
                    "LOOKING EXTREME DOWN" : "LOOKING DOWN";
                }
              }
            }
          }
        }

        // Smooth eye violations
        eyeHistoryRef.current.push(currentEyeViolation);
        if (eyeHistoryRef.current.length > EYE_HISTORY_SIZE) {
          eyeHistoryRef.current.shift();
        }
        
        const REQUIRED_FRAMES = 6;
        const violationCounts = {};
        eyeHistoryRef.current.forEach(v => {
          if (v) violationCounts[v] = (violationCounts[v] || 0) + 1;
        });
        
        let persistentViolation = null;
        for (const [v, count] of Object.entries(violationCounts)) {
          if (count >= REQUIRED_FRAMES) {
            persistentViolation = v;
            break;
          }
        }
        
        // Count violations - increment when a NEW violation is detected
        if (persistentViolation && !previousViolationRef.current) {
          const newCount = eyeViolationCount + 1;
          setEyeViolationCount(newCount);
          
          // Notify parent of eye violation count
          if (onEyeViolationCountChange) {
            onEyeViolationCountChange(newCount);
          }
        }
        previousViolationRef.current = persistentViolation;
        
        setEyeViolation(persistentViolation);
        setViolationDetected(stableCount !== 1 || persistentViolation !== null);

        // Clear and draw
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const hasPersonViolation = stableCount !== 1;
        const color = (hasPersonViolation || persistentViolation) ? "#ff0000" : "#00ff00";

        // Draw bodies
        validBodies.forEach((body, idx) => {
          const [x, y, w, h] = body.box;
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 4]);
          ctx.strokeRect(x, y, w, h);
          ctx.setLineDash([]);
        });

        // Draw faces and eyes
        validFaces.forEach((face, idx) => {
          if (!face.box) return;
          const [x, y, w, h] = face.box;
          
          // Face box
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, w, h);

          // Draw eye tracking points
          if (face.annotations) {
            const ann = face.annotations;
            
            // Draw iris circles
            if (ann.leftEyeIris) {
              const leftIrisCenter = ann.leftEyeIris.reduce((acc, pt) => {
                acc[0] += pt[0];
                acc[1] += pt[1];
                return acc;
              }, [0, 0]).map(v => v / ann.leftEyeIris.length);
              
              ctx.fillStyle = persistentViolation ? "#ff0000" : "#00ff00";
              ctx.beginPath();
              ctx.arc(leftIrisCenter[0], leftIrisCenter[1], 4, 0, 2 * Math.PI);
              ctx.fill();
              
              // Eye outline
              ctx.strokeStyle = persistentViolation ? "#ff0000" : "#00ff00";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ann.leftEyeUpper0.forEach((pt, i) => {
                if (i === 0) ctx.moveTo(pt[0], pt[1]);
                else ctx.lineTo(pt[0], pt[1]);
              });
              ctx.stroke();
            }
            
            if (ann.rightEyeIris) {
              const rightIrisCenter = ann.rightEyeIris.reduce((acc, pt) => {
                acc[0] += pt[0];
                acc[1] += pt[1];
                return acc;
              }, [0, 0]).map(v => v / ann.rightEyeIris.length);
              
              ctx.fillStyle = persistentViolation ? "#ff0000" : "#00ff00";
              ctx.beginPath();
              ctx.arc(rightIrisCenter[0], rightIrisCenter[1], 4, 0, 2 * Math.PI);
              ctx.fill();
              
              // Eye outline
              ctx.strokeStyle = persistentViolation ? "#ff0000" : "#00ff00";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ann.rightEyeUpper0.forEach((pt, i) => {
                if (i === 0) ctx.moveTo(pt[0], pt[1]);
                else ctx.lineTo(pt[0], pt[1]);
              });
              ctx.stroke();
            }
          }
        });

      } catch (err) {
        console.error("Detection error:", err);
      }
      
      animationFrameRef.current = requestAnimationFrame(runDetection);
    };

    runDetection();
    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoRef, hasVideo, isModelLoaded, onParticipantCountChange, onEyeViolationCountChange, eyeViolationCount]);

  return (
    <div className="border-2 border-gray-700 rounded-lg bg-black overflow-hidden h-[280px] p-3 relative">
      <div className="w-full h-full bg-black rounded-lg overflow-hidden shadow-2xl border-2 border-gray-600 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover ${hasVideo ? "block" : "hidden"}`}
          style={{ transform: "scaleX(-1)" }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ transform: "scaleX(-1)" }}
        />

        {/* Placeholder */}
        {!hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-3"></div>
              <p className="text-lg font-bold">AI Eye Tracking + Proctoring</p>
              <p className="text-sm text-gray-500 mt-2">
                {!isConnected ? "Connect to start" : !isModelLoaded ? "Loading models..." : "Waiting for video..."}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-3 left-3 bg-red-900 text-white px-4 py-2 rounded-lg font-bold z-20">
            ❌ {error}
          </div>
        )}

        {!isModelLoaded && !error && hasVideo && (
          <div className="absolute top-3 right-3 bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm font-bold animate-pulse z-20">
           Loading AI...
          </div>
        )}
      </div>

      {/* Clean Stats Display - Only 2 numbers */}
      {hasVideo && isModelLoaded && (
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center z-20">
          {/* Participants Count */}
          <div className={`px-6 py-3 rounded-lg font-bold shadow-lg text-lg ${
            numPeople === 1 ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">👤</span>
              <div>
                <div className="text-xs opacity-80">Participants</div>
                <div className="text-2xl font-bold">{numPeople}</div>
              </div>
            </div>
          </div>

          {/* Eye Movement Count */}
          <div className={`px-6 py-3 rounded-lg font-bold shadow-lg text-lg ${
            eyeViolationCount === 0 ? "bg-green-600 text-white" : 
            eyeViolationCount >= 5 ? "bg-red-600 text-white animate-pulse" : 
            "bg-orange-600 text-white"
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl"></span>
              <div>
                <div className="text-xs opacity-80">Eye Movements</div>
                <div className="text-2xl font-bold">{eyeViolationCount}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPanel;
