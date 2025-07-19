import React, { useEffect, useState } from "react";
import QRCode from "qrcode.react";
import { v4 as uuidv4 } from "uuid"; // npm install uuid

const RotatingQR = ({ sessionId, subjectId, facultyId }) => {
  const [qrData, setQrData] = useState("");

  useEffect(() => {
    const generateQR = () => {
      const now = new Date();

      const qrPayload = {
          session_id: sessionId, // passed from backend or generated once per class
          subject_id: subjectId,
          faculty_id: facultyId,
          session_date: now.toISOString().split("T")[0], // 'YYYY-MM-DD'
          start_time: now.toISOString() // full ISO timestamp
        
  // "session_id": "a4b88c3e-2b0e-4d71-a9fe-6d9e3e5371ef",
  // "subject_id": "b99f12d7-3775-4c58-9c41-f0ea462b4532",
  // "faculty_id": "fbe8a7b6-c5cd-4e1c-8104-f0f849315927",
  // "session_date": "2025-06-18",
  // "start_time": "2025-06-18T21:45:30.123Z"

      };

      setQrData(JSON.stringify(qrPayload));

      // Optional: log each generated QR to backend
      // fetch("/api/log-qr", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(qrPayload)
      // });
    };

    generateQR();
    const interval = setInterval(generateQR, 5000);
    return () => clearInterval(interval);
  }, [sessionId, subjectId, facultyId]);

  return (
    <div className="flex flex-col items-center">
      <QRCode value={qrData} size={256} />
      <p className="text-sm text-gray-600 mt-2">QR refreshes every 5 seconds</p>
    </div>
  );
};

export default RotatingQR;

/*  ###Backend API###
app.post("/api/verify-qr", (req, res) => {
  try {
    const { qrData } = req.body;
    const { session_id, subject_id, faculty_id, session_date, start_time } = JSON.parse(qrData);

    // Basic checks
    if (!session_id || !subject_id || !faculty_id || !session_date || !start_time) {
      return res.status(400).json({ success: false, error: "Incomplete QR data" });
    }

    const now = new Date();
    const qrTimestamp = new Date(start_time);
    const diffSeconds = (now - qrTimestamp) / 1000;

    if (diffSeconds < 0 || diffSeconds > 10) {
      return res.status(400).json({ success: false, error: "QR code expired" });
    }

    // Check if session_id exists and is active (optional)
    // DB.query("SELECT * FROM sessions WHERE id = ?", [session_id])

    // Proceed with attendance logic...
    return res.status(200).json({ success: true, message: "QR valid", session_id });
  } catch (error) {
    return res.status(400).json({ success: false, error: "Invalid QR data" });
  }
});
*/