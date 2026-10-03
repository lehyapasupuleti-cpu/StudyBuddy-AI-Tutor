import Markdown from "./Markdown.jsx";

function TypingIndicator() {
  return (
    <span className="typing" aria-label="Typing">
      <span /> <span /> <span />
    </span>
  );
}

export default function MessageBubble({ message, streaming }) {
  const isUser = message.role === "user";
  const waiting = streaming && message.content === "";

  return (
    <div className={`row ${isUser ? "row--user" : "row--bot"}`}>
      {!isUser && <div className="avatar">🎓</div>}
      <div className={`bubble ${isUser ? "bubble--user" : "bubble--bot"}`}>
        {isUser ? (
          <p className="plain">{message.content}</p>
        ) : waiting ? (
          <TypingIndicator />
        ) : (
          <Markdown>{message.content}</Markdown>
        )}
      </div>
    </div>
  );
}
