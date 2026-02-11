import { useEffect, useRef, useState } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const wsRef = useRef(null);

  const sessionId = sessionStorage.getItem("session_id");

  useEffect(() => {
    const ws = new WebSocket(
      `ws://localhost:8000/ws/chat/${sessionId}`
    );

    wsRef.current = ws;

    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    ws.onclose = () => {
      console.log("Disconnected");
    };

    return () => {
      ws.close();
    };
  }, [sessionId]);

  const sendMessage = () => {
    if (!input.trim()) return;

    wsRef.current.send(input);
    setMessages((prev) => [...prev, "You: " + input]);
    setInput("");
  };

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h2>Chat Room</h2>

      <div style={{ height: 200, overflowY: "auto", border: "1px solid gray", padding: 10 }}>
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}