import { useState } from "react";
import "../../styles/chat/ChatScreen.css";

export default function ChatScreen({
  onLeave,
  onNext,
  onReport,
}) {
  const [messages, setMessages] = useState([
    { from: "partner", text: "Hey 👋" },
    { from: "me", text: "Hi…" },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { from: "me", text: input },
    ]);
    setInput("");
  };

  return (
    <div className="phone-frame">
      <div className="phone-screen chat-screen">
        {/* Top actions */}
        <button className="report-btn" onClick={onReport}>
          report this user!
        </button>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`bubble ${m.from}`}
            >
              {m.text}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="chat-bottom">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="talk w ANONYMOUS, but HUMAN…"
          />
          <button className="send-btn" onClick={sendMessage}>
            send →
          </button>
        </div>

        {/* Footer actions */}
        <div className="chat-actions">
          <button className="leave-btn" onClick={onLeave}>
            leave chat.
          </button>
          <button className="next-btn" onClick={onNext}>
            next chat →
          </button>
        </div>
      </div>
    </div>
  );
}
