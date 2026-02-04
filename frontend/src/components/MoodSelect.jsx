import { useState } from "react";
import "../styles/MoodSelect.css";

// Mood images
import justVibing from "../assets/moods/justvibing.png";
import lateNight from "../assets/moods/latenightthoughts.png";
import brainDump from "../assets/moods/braindump.png";
import distraction from "../assets/moods/needadistraction.png";
import lowKey from "../assets/moods/lowkeyserious.png";
import unfiltered from "../assets/moods/unfiltered.png";

// Filter images
import maleIcon from "../assets/filters/male.png";
import femaleIcon from "../assets/filters/female.png";
import anyIcon from "../assets/filters/any.png";

const moods = [
  {
    id: "just-vibing",
    title: "Just Vibing",
    subtitle: "Chill, no agenda",
    color: "#0B4322",
    image: justVibing,
  },
  {
    id: "late-night-thoughts",
    title: "Late-Night Thoughts",
    subtitle: "A little deep, a little messy",
    color: "#6593FF",
    image: lateNight,
  },
  {
    id: "brain-dump",
    title: "Brain Dump",
    subtitle: "Rants, spirals, unfiltered thoughts",
    color: "#670AC0",
    image: brainDump,
  },
  {
    id: "need-distraction",
    title: "Need a Distraction",
    subtitle: "Help me not think",
    color: "#FDAB01",
    image: distraction,
  },
  {
    id: "low-key-serious",
    title: "Low-Key Serious",
    subtitle: "Thoughtful, calm, honest",
    color: "#535353",
    image: lowKey,
  },
  {
    id: "unfiltered",
    title: "Unfiltered",
    subtitle: "No masks, no polish",
    color: "#8C0B0B",
    image: unfiltered,
  },
];

export default function MoodSelect({ onComplete }) {
  const [genderFilter, setGenderFilter] = useState("any");

  const handleSelect = (mood) => {
    sessionStorage.setItem("mood", mood.id);
    sessionStorage.setItem("filter", genderFilter);

    if (onComplete) {
      onComplete(mood);
    }
  };

  return (
    <div className="phone-frame">
      <div className="phone-screen">
        <div className="mood-page">
          {/* Header Tabs */}
          <div className="mood-header">
            <button className="mood-tab active">what’s your mood?</button>
            <button className="mood-tab disabled">create your situation</button>
          </div>

          {/* Gender Filter */}
          <div className="filter-section">
            <p className="filter-label">
              &gt; Select your filter and mood from below:
            </p>

            <div className="filter-options">
              <button
                className={`filter-chip ${genderFilter === "male" ? "active" : ""}`}
                onClick={() => setGenderFilter("male")}
              >
                <img src={maleIcon} alt="Male" />
                <span>MALE</span>
              </button>

              <button
                className={`filter-chip ${
                  genderFilter === "female" ? "active" : ""
                }`}
                onClick={() => setGenderFilter("female")}
              >
                <img src={femaleIcon} alt="Female" />
                <span>FEMALE</span>
              </button>

              <button
                className={`filter-chip ${genderFilter === "any" ? "active" : ""}`}
                onClick={() => setGenderFilter("any")}
              >
                <img src={anyIcon} alt="Any" />
                <span>ANY</span>
              </button>
            </div>
          </div>

          {/* Mood Cards */}
          <div className="mood-list">
            {moods.map((mood) => (
              <div
                key={mood.id}
                className="mood-card"
                style={{ backgroundColor: mood.color }}
                onClick={() => handleSelect(mood)}
              >
                <div className="mood-text">
                  <h3>{mood.title}</h3>
                  <p>{mood.subtitle}</p>
                </div>

                <img
                  src={mood.image}
                  alt={mood.title}
                  className="mood-image"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
