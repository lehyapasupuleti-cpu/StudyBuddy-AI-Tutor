import { useEffect, useRef } from "react";
import { useChat } from "../context/ChatContext.jsx";
import MessageBubble from "./MessageBubble.jsx";

const SUGGESTIONS = [
  "Explain React hooks",
  "Show me a JavaScript function example",
  "How do I revise for exams?",
];

export default function MessageList() {
  const { activeConvo, streamingId, sendMessage, isGenerating } = useChat();
  const bottomRef = useRef(null);
  const messages = activeConvo.messages;

  // auto-scroll to the latest message / token
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, activeConvo.id]);

  if (messages.length === 0) {
    return (
      <div className="messages messages--empty">
        <div className="welcome">
          <div className="welcome__emoji">🎓</div>
          <h2>How can I help you study today?</h2>
          <div className="chips">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="chip" disabled={isGenerating} onClick={() => sendMessage(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messages" role="log" aria-live="polite">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} streaming={m.id === streamingId} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
