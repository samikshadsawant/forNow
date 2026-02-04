import { useEffect, useRef, useState } from "react";
import ChatMessages from "./chat/ChatMessages";
import TypingIndicator from "./chat/TypingIndicator";

export default function Chat() {
  const wsRef = useRef(null);

  const [status, setStatus] = useState("connecting"); // connecting | waiting | matched
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [partnerTyping, setPartnerTyping] = useState(false);

  // -------------------------
  // WebSocket lifecycle
  // -------------------------
  useEffect(() => {
    // 🔒 prevent duplicate sockets
    if (wsRef.current) return;

    const ws = new WebSocket("ws://127.0.0.1:8000/ws/chat");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("🟢 Matchmaking socket connected");
      setStatus("waiting");
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      console.log("📩 WS EVENT:", data);

      switch (data.type) {
        case "waiting":
          setStatus("waiting");
          setMessages([]);
          break;

        case "matched":
          setStatus("matched");
          setMessages([]);
          break;

        case "message":
          setPartnerTyping(false);
          setMessages((prev) => [
            ...prev,
            { from: "theirs", text: data.text },
          ]);
          break;

        case "partner_typing":
          setPartnerTyping(true);
          break;

        case "partner_left":
        case "partner_disconnected":
          setStatus("waiting");
          setMessages([]);
          break;

        default:
          break;
      }
    };

    ws.onclose = () => {
      console.log("🔴 Matchmaking socket closed");
    };

    // ❗ DO NOT AUTO CLOSE SOCKET HERE
    return () => {};
  }, []);

  // -------------------------
  // Actions
  // -------------------------
  const sendMessage = () => {
    if (!input.trim()) return;
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(
      JSON.stringify({ type: "message", text: input })
    );

    setMessages((prev) => [
      ...prev,
      { from: "me", text: input },
    ]);

    setInput("");
  };

  const sendTyping = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "typing" }));
    }
  };

  const nextChat = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "next" }));
      setStatus("waiting");
      setMessages([]);
    }
  };

  const leaveChat = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "leave" }));
      wsRef.current.close(); // explicit close ONLY here
      wsRef.current = null;
    }
  };

  const reportUser = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "report",
          payload: { reason: "abuse" },
        })
      );
      alert("User reported");
    }
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: 12 }}>
      <h3>Status: {status}</h3>

      {/* Messages */}
      <div
        style={{
          height: 360,
          border: "1px solid #ddd",
          borderRadius: 12,
          overflowY: "auto",
          background: "#f7f7f7",
          marginBottom: 10,
        }}
      >
        <ChatMessages messages={messages} />
        {partnerTyping && <TypingIndicator />}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            sendTyping();
          }}
          disabled={status !== "matched"}
          placeholder={
            status === "matched"
              ? "Type your message…"
              : "Waiting for match…"
          }
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 10,
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={sendMessage}
          disabled={status !== "matched"}
        >
          Send
        </button>
      </div>

      {/* Controls */}
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button onClick={nextChat}>Next</button>
        <button onClick={leaveChat}>Leave</button>
        <button onClick={reportUser}>Report</button>
      </div>
    </div>
  );
}
