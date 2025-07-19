import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Play, Square } from "lucide-react";
import QRCode from "react-qr-code";
import { startAttendanceSession, generateNextQRCode, endAttendanceSession, submitAttendance } from "../api/attendance";

// Props:
// - subject: The subject object with { id, name, subject_code }
// - onBack: A function to call when the back button is clicked
// - onSubmit: A function to call when the form is submitted
const StartQR = ({ subject, onBack, onSubmit }) => {
  const [attendanceWeight, setAttendanceWeight] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [qrData, setQrData] = useState("");
  const [timeLeft, setTimeLeft] = useState(5);
  const [sessionId, setSessionId] = useState(null);
  const [qrSequence, setQrSequence] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const intervalRef = useRef(null);

  // Start attendance session
  const startSession = async () => {
    if (!subject) return;
    
    setIsLoading(true);
    try {
      const response = await startAttendanceSession(subject.id);
      
      if (response.session) {
        setSessionId(response.session.session_id);
        setQrData(response.session.qr_code_data);
        setQrSequence(1);
        setIsSessionActive(true);
        setTimeLeft(5);
      }
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Failed to start attendance session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate next QR code
  const generateNextQR = async () => {
    if (!sessionId) return;
    
    try {
      const response = await generateNextQRCode(sessionId);
      if (response.qr_data) {
        setQrData(response.qr_data);
        setQrSequence(response.sequence_number);
      }
    } catch (error) {
      console.error('Error generating next QR:', error);
    }
  };

  // Stop session
  const stopSession = async () => {
    if (!sessionId) return;
    
    try {
      await endAttendanceSession(sessionId);
      setIsSessionActive(false);
      setSessionId(null);
      setQrData("");
      setQrSequence(0);
    } catch (error) {
      console.error('Error stopping session:', error);
    }
  };

  // Timer effect for QR rotation
  useEffect(() => {
    if (isSessionActive && sessionId) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            generateNextQR();
            return 5;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [isSessionActive, sessionId]);

  const handleToggleSession = () => {
    if (isSessionActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  const handleSubmit = async () => {
    if (!attendanceWeight) {
      alert("Please select an attendance weight before submitting.");
      return;
    }

    if (!sessionId) {
      alert("No active session to submit attendance for.");
      return;
    }

    try {
      const response = await submitAttendance(sessionId, attendanceWeight);
      alert(`Attendance submitted successfully for ${subject.name} with weight ${attendanceWeight}`);
      console.log('Attendance submission response:', response);
      
      // Reset session state
      setIsSessionActive(false);
      setSessionId(null);
      setQrData("");
      setQrSequence(0);
      setAttendanceWeight(1);
      
      // Navigate back to dashboard
      onSubmit();
    } catch (error) {
      console.error('Error submitting attendance:', error);
      alert(`Failed to submit attendance: ${error.response?.data?.message || error.message}`);
    }
  };

  if (!subject) return <div>Loading subject...</div>;

  return (
    <div className="max-w-md mx-auto p-4 bg-white-200 text-black min-h-screen font-sans">
      <button onClick={onBack} className="mb-4 flex items-center text-Black-800 hover:text-blue-500">
        <ArrowLeft className="mr-2" size={18} />
        Back to Subjects
      </button>

      <div className="bg-white-700 rounded-xl p-6 shadow-2xl w-full max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-2 text-black">{subject.name}</h2>
        <p className="mb-4 text-black-200">
          {isSessionActive
            ? "Session is active. QR code regenerates every 5 seconds."
            : "Session paused. Set weight and submit."}
        </p>

        {/* --- Attendance Weight Dropdown --- */}
        <div className="mb-4">
          <label className="block font-medium mb-1">Attendance Weight:</label>
          <select
            value={attendanceWeight || ""}
            onChange={e => setAttendanceWeight(Number(e.target.value))}
            className="w-full p-2 border rounded"
            disabled={isSessionActive}
          >
            <option value="">Select Weight</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
          </select>
        </div>
        {/* --- End Attendance Weight Dropdown --- */}

        <div className="flex justify-center mb-6">
          <button
            onClick={handleToggleSession}
            disabled={isLoading}
            className={`flex items-center justify-center w-40 px-4 py-2 rounded-lg text-white font-bold transition-all transform hover:scale-105 ${
              isLoading
                ? "bg-gray-500 cursor-not-allowed"
                : isSessionActive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isLoading ? (
              "Loading..."
            ) : isSessionActive ? (
              <>
                <Square size={16} className="inline mr-2" />
                Stop Session
              </>
            ) : (
              <>
                <Play size={16} className="inline mr-2" />
                Start Session
              </>
            )}
          </button>
        </div>

        {/* QR Code Display Section */}
        {isSessionActive && (
          <div className="flex flex-col items-center bg-white p-6 rounded-lg">
            <div className="text-center mb-4">
              <p className="text-2xl font-bold text-gray-900 mb-2">
                QR Code #{qrSequence}
              </p>
              <p className="text-5xl font-mono text-gray-900 mb-4 animate-pulse">
                {timeLeft}
              </p>
              <p className="text-sm text-gray-600">
                Next QR in {timeLeft} seconds
              </p>
            </div>
            
            {qrData && (
              <div className="text-center">
                <QRCode value={qrData} size={256} />
                <p className="text-sm text-gray-600 mt-2 font-mono">
                  {qrData}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Attendance Weight Section */}
        {!isSessionActive && (
          <div className="mt-6">
            <label className="block mb-2 font-bold">
              Attendance Weight: {attendanceWeight ?? "Not Selected"}
            </label>
            <input
              type="range"
              min="1"
              max="4"
              value={attendanceWeight || 1}
              onChange={(e) => setAttendanceWeight(Number(e.target.value))}
              className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-cyan-500 mb-6"
            />

            <button
              onClick={handleSubmit}
              className={`w-full px-6 py-3 rounded-lg text-white font-bold transition-all ${
                attendanceWeight
                  ? "bg-primary hover:bg-cyan-700"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
              disabled={!attendanceWeight}
            >
              Submit Attendance
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StartQR;
