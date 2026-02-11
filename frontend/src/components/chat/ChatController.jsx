import { useEffect, useRef, useState } from "react";
import MatchWaiting from "./MatchWaiting";
import ChatScreen from "./ChatScreen";

export default function ChatController({ onExit }) {
  const wsRef = useRef(null);

  const [status, setStatus] = useState("waiting"); // waiting | matched | limit
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const device_id = sessionStorage.getItem("device_id");
    const mood = sessionStorage.getItem("mood");
    const filter = sessionStorage.getItem("filter") || "any";

    if (!device_id || !mood) {
      console.error("Missing matchmaking params");
      return;
    }

    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat?device_id=${device_id}&mood=${mood}&filter=${filter}`
    );

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("🟢 Matchmaking socket connected");
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      switch (data.type) {
        case "waiting":
          setStatus("waiting");
          break;

        case "matched":
          setStatus("matched");
          break;

        case "message":
          setMessages((prev) => [
            ...prev,
            { from: "partner", text: data.text },
          ]);
          break;

        case "partner_left":
          setMessages([]);
          setStatus("waiting");
          break;

        case "limit_reached":
          alert("Daily limit reached");
          setStatus("limit");
          break;

        default:
          break;
      }
    };

    ws.onclose = () => {
      console.log("🔴 Socket closed");
    };

    return () => ws.close();
  }, []);

  const send = (payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  };

  // ---------------- UI SWITCH ----------------

  if (status === "waiting") {
    return (
      <MatchWaiting
        onCancel={() => {
          send({ type: "leave" });
          onExit();
        }}
      />
    );
  }

  if (status === "matched") {
    return (
      <ChatScreen
        messages={messages}
        onSend={(text) => {
          setMessages((prev) => [...prev, { from: "me", text }]);
          send({ type: "message", text });
        }}
        onNext={() => {
          setMessages([]);
          send({ type: "leave" });
          setStatus("waiting");
        }}
        onLeave={() => {
          send({ type: "leave" });
          onExit();
        }}
        onReport={() =>
          send({ type: "report", payload: { reason: "abuse" } })
        }
      />
    );
  }

  return null;
}
