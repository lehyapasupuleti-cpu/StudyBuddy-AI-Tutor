import { useRef, useState } from "react";
import { useChat } from "../context/ChatContext.jsx";

export default function Composer() {
  const { sendMessage, stop, isGenerating } = useChat();
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  function submit() {
    if (!text.trim() || isGenerating) return;
    sendMessage(text);
    setText("");
    if (inputRef.current) inputRef.current.style.height = "auto";
  }

  function handleChange(e) {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="composer">
      <div className="composer__box">
        <textarea
          ref={inputRef}
          rows={1}
          value={text}
          placeholder="Ask StudyBuddy anything…"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        {isGenerating ? (
          <button className="btn btn--stop" onClick={stop}>
            ■ Stop
          </button>
        ) : (
          <button className="btn btn--primary" onClick={submit} disabled={!text.trim()}>
            Send
          </button>
        )}
      </div>
      <p className="composer__hint">Enter to send · Shift+Enter for a new line</p>
    </div>
  );
}
