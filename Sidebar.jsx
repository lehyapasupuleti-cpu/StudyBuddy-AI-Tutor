import { useChat } from "../context/ChatContext.jsx";
import ConvoItem from "./ConvoItem.jsx";

export default function Sidebar({ open, onClose }) {
  const { conversations, activeConvo, newChat, selectChat, renameChat, deleteChat } = useChat();

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <div className="sidebar__top">
        <div className="brand">🎓 StudyBuddy</div>
        <button
          className="btn btn--primary btn--block"
          onClick={() => {
            newChat();
            onClose();
          }}
        >
          + New chat
        </button>
      </div>

      <nav className="convo-list" aria-label="Conversations">
        {conversations.map((c) => (
          <ConvoItem
            key={c.id}
            convo={c}
            active={c.id === activeConvo.id}
            onSelect={() => {
              selectChat(c.id);
              onClose();
            }}
            onRename={(title) => renameChat(c.id, title)}
            onDelete={() => deleteChat(c.id)}
          />
        ))}
      </nav>

      <div className="sidebar__foot">Mock AI · swap in a real API via aiService.js</div>
    </aside>
  );
}
