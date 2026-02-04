import "../../styles/chat/bubbles.css";

export default function ChatMessages({ messages }) {
  return (
    <div className="messages-container">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`message-bubble ${
            msg.from === "me" ? "mine" : "theirs"
          }`}
        >
          {msg.text}
        </div>
      ))}
    </div>
  );
}
