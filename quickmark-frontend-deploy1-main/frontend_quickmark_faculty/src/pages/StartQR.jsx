import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Play, Square, Pause, Users, Clock, AlertCircle, CheckCircle } from "lucide-react";
import QRCode from "react-qr-code";
import { startAttendanceSession, generateNextQRCode, endAttendanceSession, submitAttendance, getSessionLiveCount } from "../api/attendance";
import { api } from "../utils/api";

const StartQR = ({ subject, onBack, onSubmit }) => {
  const [attendanceWeight, setAttendanceWeight] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [qrData, setQrData] = useState("");
  const [timeLeft, setTimeLeft] = useState(5);
  const [sessionId, setSessionId] = useState(null);
  const [qrSequence, setQrSequence] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [liveCount, setLiveCount] = useState({ total_students: 0, marked_count: 0, present_count: 0 });
  const [showSummary, setShowSummary] = useState(false);
  const [isSessionPaused, setIsSessionPaused] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const intervalRef = useRef(null);
  const liveCountIntervalRef = useRef(null);
  const timeIntervalRef = useRef(null);

  // Update current time every second
  useEffect(() => {
    timeIntervalRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, []);

  // Format time in IST
  const formatISTTime = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };

  // Poll live count when session is active
  useEffect(() => {
    if (isSessionActive && sessionId && !isSessionPaused) {
      const fetchLiveCount = async () => {
        try {
          const count = await getSessionLiveCount(sessionId);
          setLiveCount(count);
        } catch (error) {
          console.error('Error fetching live count:', error);
          if (error.response?.status !== 404) {
            console.error('Live count error:', error);
          }
        }
      };
      
      fetchLiveCount();
      liveCountIntervalRef.current = setInterval(fetchLiveCount, 2000);
    }

    return () => {
      if (liveCountIntervalRef.current) {
        clearInterval(liveCountIntervalRef.current);
      }
    };
  }, [isSessionActive, sessionId, isSessionPaused]);

  // Fetch total students for this subject
  useEffect(() => {
    const fetchTotalStudents = async () => {
      if (subject?.id) {
        try {
          // Use the correct backend route for total students count
          const response = await api.get(`/subjects/${subject.id}/students/count`);
          if (response.data && typeof response.data.count === 'number') {
            setTotalStudents(response.data.count);
          } else {
            setTotalStudents(0);
          }
        } catch (error) {
          console.error('Error fetching total students:', error);
          setTotalStudents(0);
        }
      }
    };
    fetchTotalStudents();
  }, [subject]);

  // Start attendance session
  const startSession = async () => {
    if (!subject || !attendanceWeight) {
      alert("Please select an attendance weight before starting the session.");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await startAttendanceSession(subject.id);
      
      if (response.session) {
        setSessionId(response.session.session_id);
        setQrData(response.session.qr_code_data);
        setQrSequence(1);
        setIsSessionActive(true);
        setIsSessionPaused(false);
        setTimeLeft(5);
        setSessionStartTime(new Date());
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

  // Pause session
  const pauseSession = async () => {
    if (!sessionId) return;
    
    try {
      await api.post(`/attendance/${sessionId}/pause`);
      setIsSessionPaused(true);
    } catch (error) {
      console.error('Error pausing session:', error);
      alert('Failed to pause session. Please try again.');
    }
  };

  // Resume session
  const resumeSession = async () => {
    if (!sessionId) return;
    
    try {
      await api.post(`/attendance/${sessionId}/resume`);
      setIsSessionPaused(false);
    } catch (error) {
      console.error('Error resuming session:', error);
      alert('Failed to resume session. Please try again.');
    }
  };

  // Stop session
  const stopSession = async () => {
    if (!sessionId) return;
    
    try {
      await endAttendanceSession(sessionId);
      setIsSessionActive(false);
      setIsSessionPaused(false);
      setShowSummary(true);
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Failed to end session. Please try again.');
    }
  };

  // Timer effect for QR rotation
  useEffect(() => {
    if (isSessionActive && sessionId && !isSessionPaused) {
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
  }, [isSessionActive, sessionId, isSessionPaused]);

  const handleToggleSession = () => {
    if (isSessionActive) {
      if (isSessionPaused) {
        resumeSession();
      } else {
        pauseSession();
      }
    } else {
      startSession();
    }
  };

  const handleSubmitAttendance = async () => {
    if (!sessionId) {
      alert("No active session to submit attendance for.");
      return;
    }

    try {
      const response = await submitAttendance(sessionId, attendanceWeight);
      alert(`${liveCount.marked_count} students' attendance has been marked successfully!`);
      
      // Reset session state
      setIsSessionActive(false);
      setIsSessionPaused(false);
      setSessionId(null);
      setQrData("");
      setQrSequence(0);
      setAttendanceWeight(null);
      setShowSummary(false);
      setLiveCount({ total_students: 0, marked_count: 0, present_count: 0 });
      setSessionStartTime(null);
      
      // Navigate back to dashboard
      onSubmit();
    } catch (error) {
      console.error('Error submitting attendance:', error);
      alert(`Failed to submit attendance: ${error.response?.data?.message || error.message}`);
    }
  };

  if (!subject) return <div>Loading subject...</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-50 text-black min-h-screen font-sans">
      <button onClick={onBack} className="mb-4 flex items-center text-gray-600 hover:text-blue-500 transition-colors">
        <ArrowLeft className="mr-2" size={18} />
        Back to Subjects
      </button>

      <div className="bg-white rounded-xl p-6 shadow-lg w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{subject.name}</h2>
          <p className="text-gray-600">
            {isSessionActive
              ? isSessionPaused 
                ? "Session is paused. Resume to continue."
                : "Session is active. QR code regenerates every 5 seconds."
              : showSummary
              ? "Session ended. Review and submit attendance."
              : "Select weight and start a new attendance session."}
          </p>
        </div>

        {/* Current Time Display */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
            <Clock className="mr-2" size={16} />
            <span className="font-mono text-lg">{formatISTTime(currentTime)} IST</span>
          </div>
        </div>

        {/* Session Duration */}
        {sessionStartTime && (
          <div className="text-center mb-4">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-lg">
              <Clock className="mr-2" size={16} />
              <span>Session Duration: {Math.floor((currentTime - sessionStartTime) / 1000 / 60)}m {Math.floor((currentTime - sessionStartTime) / 1000) % 60}s</span>
            </div>
          </div>
        )}

        {/* Live Count Display */}
        {isSessionActive && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <Users className="text-blue-600 mr-2" size={20} />
                  <span className="text-lg font-bold text-blue-800">
                    {liveCount.marked_count} / {totalStudents}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Students Marked</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="text-green-600 mr-2" size={20} />
                  <span className="text-lg font-bold text-green-800">
                    {liveCount.present_count}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Present</p>
              </div>
              
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <AlertCircle className="text-red-600 mr-2" size={20} />
                  <span className="text-lg font-bold text-red-800">
                    {liveCount.absent_count}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Absent</p>
              </div>
            </div>
            
            {isSessionPaused && (
              <div className="mt-3 text-center">
                <div className="inline-flex items-center bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                  <Pause className="mr-1" size={14} />
                  Session Paused
                </div>
              </div>
            )}
          </div>
        )}

        {/* Summary Display */}
        {showSummary && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border">
            <div className="text-center">
              <h3 className="text-xl font-bold text-blue-800 mb-3">Session Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-2xl font-bold text-blue-600">{totalStudents}</p>
                  <p className="text-sm text-gray-600">Total Students</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-2xl font-bold text-green-600">{liveCount.marked_count}</p>
                  <p className="text-sm text-gray-600">Marked Attendance</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-2xl font-bold text-red-600">{totalStudents - liveCount.marked_count}</p>
                  <p className="text-sm text-gray-600">Not Marked</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Display - LARGER AND CENTERED */}
        {isSessionActive && !isSessionPaused && qrData && (
          <div className="mb-6 text-center">
            <div className="bg-white p-8 rounded-lg shadow-lg inline-block">
              <QRCode value={qrData} size={400} /> {/* Increased from 200 to 400 */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-1">QR Code: {qrData}</p>
                <p className="text-sm text-gray-600">Sequence: {qrSequence}</p>
                <div className="mt-3">
                  <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-lg font-bold">
                    <Clock className="mr-2" size={18} />
                    Next QR in: {timeLeft}s
                  </div>
                </div>
              </div>
            </div>
          </div>
   
        )}

        {/* Attendance Weightage Display */}
        {isSessionActive && (
          <div className="mb-4 text-center">
            <span className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold">
              Attendance Weightage: {attendanceWeight}
            </span>
          </div>
        )}

        {/* Attendance Weightage Display on Summary */}
        {showSummary && (
          <div className="mb-4 text-center">
            <span className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold">
              Attendance Weightage: {attendanceWeight}
            </span>
          </div>
        )}

        {/* Attendance Weight Dropdown (ONLY on initial page) */}
        {!isSessionActive && !showSummary && (
          <div className="mb-4">
            <label className="block font-medium mb-1">Attendance Weight:</label>
            <select
              value={attendanceWeight || ""}
              onChange={e => setAttendanceWeight(Number(e.target.value))}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Weight</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
            </select>
          </div>
        )}

        {/* Session Controls */}
        {!showSummary && (
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={handleToggleSession}
              disabled={isLoading}
              className={`flex items-center justify-center px-4 py-2 rounded-lg text-white font-bold transition-all transform hover:scale-105 ${
                isLoading
                  ? "bg-gray-500 cursor-not-allowed"
                  : isSessionActive
                  ? isSessionPaused
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-orange-600 hover:bg-orange-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : isSessionActive ? (
                isSessionPaused ? (
                  <>
                    <Play className="mr-2" size={16} />
                    Resume Session
                  </>
                ) : (
                  <>
                    <Pause className="mr-2" size={16} />
                    Pause Session
                  </>
                )
              ) : (
                <>
                  <Play className="mr-2" size={16} />
                  Start Session
                </>
              )}
            </button>

            {isSessionActive && (
              <button
                onClick={stopSession}
                className="flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-bold transition-all transform hover:scale-105"
              >
                <Square className="mr-2" size={16} />
                End Session
              </button>
            )}
          </div>
        )}

        {/* Submit Attendance Button */}
        {showSummary && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleSubmitAttendance}
              className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg shadow transition-all"
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
