import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { send } from "../services/aiService.js";

const STORAGE_KEY = "studybuddy:v1";
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const newConvo = () => ({ id: uid(), title: "New chat", messages: [] });

function init() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.conversations?.length) return saved;
  } catch {
    /* ignore corrupted storage */
  }
  const c = newConvo();
  return { conversations: [c], activeId: c.id };
}

function reducer(state, action) {
  switch (action.type) {
    case "NEW": {
      const c = newConvo();
      return { conversations: [c, ...state.conversations], activeId: c.id };
    }
    case "SELECT":
      return { ...state, activeId: action.id };

    case "RENAME":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.id ? { ...c, title: action.title.trim() || c.title } : c
        ),
      };

    case "DELETE": {
      const rest = state.conversations.filter((c) => c.id !== action.id);
      if (!rest.length) {
        const c = newConvo();
        return { conversations: [c], activeId: c.id };
      }
      return {
        conversations: rest,
        activeId: state.activeId === action.id ? rest[0].id : state.activeId,
      };
    }

    case "ADD_MESSAGES":
      return {
        ...state,
        conversations: state.conversations.map((c) => {
          if (c.id !== action.id) return c;
          const isFirst = c.messages.length === 0 && c.title === "New chat";
          const first = action.messages[0];
          return {
            ...c,
            title: isFirst ? first.content.slice(0, 32) : c.title,
            messages: [...c.messages, ...action.messages],
          };
        }),
      };

    case "APPEND_TOKEN":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id !== action.id
            ? c
            : {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === action.messageId ? { ...m, content: m.content + action.token } : m
                ),
              }
        ),
      };

    default:
      return state;
  }
}

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingId, setStreamingId] = useState(null); // id of the message being streamed

  const stateRef = useRef(state);
  stateRef.current = state;
  const abortRef = useRef(null);
  const streamConvoRef = useRef(null);

  // persist conversations
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked */
    }
  }, [state]);

  const activeConvo =
    state.conversations.find((c) => c.id === state.activeId) ?? state.conversations[0];

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const sendMessage = useCallback(async (text) => {
    const content = text.trim();
    if (!content || abortRef.current) return;

    const { conversations, activeId } = stateRef.current;
    const convo = conversations.find((c) => c.id === activeId);
    if (!convo) return;

    const userMsg = { id: uid(), role: "user", content };
    const botMsg = { id: uid(), role: "assistant", content: "" };
    dispatch({ type: "ADD_MESSAGES", id: convo.id, messages: [userMsg, botMsg] });

    const controller = new AbortController();
    abortRef.current = controller;
    streamConvoRef.current = convo.id;
    setIsGenerating(true);
    setStreamingId(botMsg.id);

    try {
      await send({
        messages: [...convo.messages, userMsg].map(({ role, content }) => ({ role, content })),
        signal: controller.signal,
        onToken: (token) =>
          dispatch({ type: "APPEND_TOKEN", id: convo.id, messageId: botMsg.id, token }),
      });
    } catch (err) {
      if (err.name !== "AbortError") {
        dispatch({
          type: "APPEND_TOKEN",
          id: convo.id,
          messageId: botMsg.id,
          token: "\n\n⚠️ Something went wrong. Please try again.",
        });
      }
    } finally {
      abortRef.current = null;
      streamConvoRef.current = null;
      setIsGenerating(false);
      setStreamingId(null);
    }
  }, []);

  const newChat = useCallback(() => dispatch({ type: "NEW" }), []);
  const selectChat = useCallback((id) => dispatch({ type: "SELECT", id }), []);
  const renameChat = useCallback((id, title) => dispatch({ type: "RENAME", id, title }), []);
  const deleteChat = useCallback((id) => {
    if (streamConvoRef.current === id) abortRef.current?.abort();
    dispatch({ type: "DELETE", id });
  }, []);

  const value = {
    conversations: state.conversations,
    activeConvo,
    isGenerating,
    streamingId,
    sendMessage,
    stop,
    newChat,
    selectChat,
    renameChat,
    deleteChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}
