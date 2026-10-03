import { useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import ChatWindow from "./components/ChatWindow.jsx";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="backdrop" onClick={() => setSidebarOpen(false)} />}
      <ChatWindow onMenu={() => setSidebarOpen(true)} />
    </div>
  );
}
