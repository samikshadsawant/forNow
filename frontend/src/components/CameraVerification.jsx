import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CameraVerification() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ GUARANTEED session_id (never undefined)
  const sessionId =
    sessionStorage.getItem("session_id") ||
    (() => {
      const id = crypto.randomUUID();
      sessionStorage.setItem("session_id", id);
      return id;
    })();

  // -----------------------------
  // Start camera
  // -----------------------------
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        streamRef.current = stream;
        videoRef.current.srcObject = stream;
      } catch {
        setError("Camera access denied. Please allow camera permission.");
      }
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // -----------------------------
  // Capture & verify
  // -----------------------------
  const captureAndVerify = async () => {
    if (!videoRef.current || loading) return;

    setLoading(true);
    setError("");

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const MAX_WIDTH = 320;
    const scale = MAX_WIDTH / video.videoWidth;

    canvas.width = MAX_WIDTH;
    canvas.height = video.videoHeight * scale;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageBase64 = canvas.toDataURL("image/jpeg", 0.8);

    // 🔥 clear immediately (privacy)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      const res = await fetch("http://localhost:8000/verify-gender", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId, // ✅ FIXED
          image: imageBase64,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Verification failed");
      }

      navigate("/profile");
    } catch (err) {
      setError(err.message || "Verification error");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div style={{ textAlign: "center" }}>
      <h2>Camera Verification</h2>

      <p style={{ fontSize: "14px", opacity: 0.8 }}>
        We temporarily analyze a live selfie to verify you.
        Images are never stored.
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "320px",
          borderRadius: "8px",
          border: "1px solid #444",
        }}
      />

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div style={{ marginTop: "16px" }}>
        <button onClick={captureAndVerify} disabled={loading}>
          {loading ? "Verifying..." : "Capture & Verify"}
        </button>
      </div>
    </div>
  );
}