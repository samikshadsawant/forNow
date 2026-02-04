import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileSetup.css";
import profilebg from "../assets/profile-bg.png";

export default function ProfileSetup() {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");

  const gender = sessionStorage.getItem("gender");

  // 🚨 Guard: must come from camera verification
  useEffect(() => {
    if (!gender) {
      setError("Camera verification required.");
    }
  }, [gender]);

  const handleContinue = () => {
    if (!nickname.trim()) {
      setError("Nickname is required.");
      return;
    }

    const profile = {
      nickname: nickname.trim(),
      bio: bio.trim(),
      gender,
    };

    sessionStorage.setItem("profile", JSON.stringify(profile));

    // ✅ MOVE FORWARD IN FLOW
    navigate("/mood");
  };

  return (
    <div
      className="profile-bg"
      style={{ backgroundImage: `url(${profilebg})` }}
    >
      <div className="profile-card">
        <h1 className="title">Welcome to forNow!</h1>
        <p className="subtitle">Anonymous, but HUMAN.</p>

        {error && <div className="error">{error}</div>}

        {/* Nickname */}
        <div className="field">
          <label>Nickname *</label>
          <input
            type="text"
            placeholder="nightowl_23"
            value={nickname}
            maxLength={20}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        {/* Bio */}
        <div className="field">
          <label>Bio (optional)</label>
          <textarea
            placeholder="Just here for a chill conversation…"
            value={bio}
            maxLength={140}
            onChange={(e) => setBio(e.target.value)}
          />
          <span className="char-count">{bio.length}/140</span>
        </div>

        {/* Gender */}
        <div className="gender-box">
          Detected gender: <strong>{gender?.toUpperCase()}</strong>
        </div>

        <button className="continue-btn" onClick={handleContinue}>
          Continue
        </button>

        <p className="privacy-note">
          Anonymous • Session-only • No data stored
        </p>
      </div>
    </div>
  );
}
