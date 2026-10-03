import { useState } from "react";

export default function ConvoItem({ convo, active, onSelect, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(convo.title);

  function save() {
    onRename(draft);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="convo convo--editing">
        <input
          className="convo__input"
          value={draft}
          autoFocus
          maxLength={40}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className={`convo ${active ? "convo--active" : ""}`}>
      <button className="convo__title" onClick={onSelect} title={convo.title}>
        {convo.title}
      </button>
      <button
        className="icon-btn"
        aria-label="Rename conversation"
        onClick={() => {
          setDraft(convo.title);
          setEditing(true);
        }}
      >
        ✏️
      </button>
      <button
        className="icon-btn"
        aria-label="Delete conversation"
        onClick={() => {
          if (window.confirm("Delete this conversation?")) onDelete();
        }}
      >
        🗑️
      </button>
    </div>
  );
}
