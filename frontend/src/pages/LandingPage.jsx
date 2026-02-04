import React, { useEffect, useState } from "react";
import { testBackendConnection } from "../utils/api";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const phrases = [
    "Be heard",
    "Let it out",
    "Connect without labels",
    "Just for now",
  ];

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % phrases.length);
        setVisible(true);
      }, 400);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f6f3] pt-24">
      <section className="flex flex-col items-center text-center px-6">
        <h1
          className={`text-4xl md:text-5xl font-semibold transition ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          {phrases[index]}
        </h1>

        <p className="mt-4 text-2xl font-semibold">
          ANONYMOUS, but HUMAN
        </p>

        <div className="mt-10">
          <button
            onClick={async () => {
              await testBackendConnection();
              navigate("/camera");
            }}
            className="px-10 py-4 rounded-full bg-[#ffce6a]"
          >
            Start conversation
          </button>
        </div>
      </section>
    </main>
  );
}
