import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CameraVerification.css";

export default function CameraVerification() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
      })
      .catch(() => setError("Camera access denied"));

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const captureImage = async () => {
    setIsCapturing(true);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/jpeg");

    await fetch("http://127.0.0.1:8000/verify-gender", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_id: sessionStorage.getItem("device_id"),
        image,
      }),
    });

    streamRef.current.getTracks().forEach((t) => t.stop());
    navigate("/profile");
  };

  return (
  <div className="camera-container">
    {error && <div className="error">{error}</div>}

    <div className="camera-wrapper">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="camera-video"
      />
    </div>

    <canvas ref={canvasRef} className="hidden-canvas" />

    {/* ✅ FIXED BUTTON */}
    <div className="camera-controls">
      <button
        className="capture-button"
        onClick={captureImage}
        disabled={isCapturing}
      >
        {isCapturing ? "Verifying..." : "Capture"}
      </button>
    </div>
  </div>
);

}
