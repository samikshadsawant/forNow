import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfileSetup() {
  const navigate = useNavigate();

  const sessionId = sessionStorage.getItem("session_id");

  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!sessionId) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!nickname.trim()) {
      setError("Nickname is required");
      return;
    }

    if (bio.length > 120) {
      setError("Bio must be 1–2 lines (max 120 chars)");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          nickname: nickname.trim(),
          bio: bio.trim()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Profile setup failed");
      }

      navigate("/chat");
    } catch (err) {
      setError(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", maxWidth: "360px", margin: "auto" }}>
      <h2>Set up your profile</h2>

      <p style={{ fontSize: "14px", opacity: 0.8 }}>
        Choose a temporary nickname and a short bio.
        No photos. No history. Session-only.
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nickname"
          maxLength={20}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />

        <textarea
          placeholder="Short bio (optional)"
          maxLength={120}
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          style={{ width: "100%", padding: "10px" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: "16px", padding: "10px", width: "100%" }}
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </form>
    </div>
  );
}