import "../../styles/chat/MatchWaiting.css";

const MOOD_META = {
  "just-vibing": { label: "Just Vibing", color: "#0B4322" },
  "late-night-thoughts": { label: "Late-Night Thoughts", color: "#6593FF" },
  "brain-dump": { label: "Brain Dump", color: "#670AC0" },
  "need-distraction": { label: "Need a Distraction", color: "#FDAB01" },
  "low-key-serious": { label: "Low-Key Serious", color: "#535353" },
  "unfiltered": { label: "Unfiltered", color: "#8C0B0B" },
};

export default function MatchWaiting({ onCancel }) {
  const moodId = sessionStorage.getItem("mood");
  const filter = sessionStorage.getItem("filter") || "ANY";

  const mood = MOOD_META[moodId] || {
    label: "Unknown",
    color: "#999",
  };

  return (
    <div className="phone-frame">
      <div className="phone-screen">
        <div
          className="waiting-screen"
          style={{ "--mood-color": mood.color }}
        >
          {/* Report */}
          <button className="report-btn">report this user!</button>

          {/* Center content */}
          <div className="waiting-center">
            <div className="loader">
              <span></span>
              <span></span>
              <span></span>
            </div>

            <h2>Looking for your match…</h2>
            <p>
              Mode: <strong>{mood.label}</strong>
            </p>
            <p>
              Filter: <strong>{filter}</strong>
            </p>
          </div>

          {/* Cancel */}
          <button className="cancel-btn" onClick={onCancel}>
            ✕ Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
