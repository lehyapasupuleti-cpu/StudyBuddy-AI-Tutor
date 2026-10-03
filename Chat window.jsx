import { useChat } from "../context/ChatContext.jsx";
import MessageList from "./MessageList.jsx";
import Composer from "./Composer.jsx";

export default function ChatWindow({ onMenu }) {
  const { activeConvo } = useChat();

  return (
    <main className="chat">
      <header className="chat__header">
        <button className="icon-btn menu-btn" aria-label="Open conversations" onClick={onMenu}>
          ☰
        </button>
        <h1 className="chat__title">{activeConvo.title}</h1>
      </header>
      <MessageList />
      <Composer />
    </main>
  );
}
