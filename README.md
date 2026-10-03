# 🎓 StudyBuddy - AI Tutor Chat Interface

A ChatGPT-style chat UI built with **React + Vite**. The AI is a **mock service that streams replies word by word**, so it can be swapped for a real API later **without touching the UI**.

## Features
- Sidebar with conversations: **new / rename / delete**, saved in `localStorage`
- User and assistant message bubbles with **auto-scroll** (`useRef`)
- Mock AI that **streams text word by word**
- **Markdown + code block** rendering (`react-markdown`)
- "Typing..." indicator and **Stop generating** button (`AbortController`)
- Responsive: sidebar becomes a slide-in drawer on phones

## Run locally
```bash
npm install
npm run dev
```
Build for production: `npm run build`

## Project structure
```
src/
  services/aiService.js     <- the ONLY file that talks to the "AI"
  context/ChatContext.jsx   <- useReducer state + persistence + streaming logic
  components/
    Sidebar.jsx, ConvoItem.jsx
    ChatWindow.jsx, MessageList.jsx, MessageBubble.jsx
    Markdown.jsx, Composer.jsx
```
Component tree: `App > ChatProvider > Sidebar > ConvoItem` and `ChatWindow > MessageList > MessageBubble > Markdown`, `Composer`.

## Swap the mock for a real LLM
Replace the body of `send()` in `src/services/aiService.js` with a `fetch()` to **your own backend proxy** that calls the model and streams tokens back. Call `onToken(text)` for each chunk and pass `signal` to `fetch` so Stop keeps working. **Never put API keys in frontend code.**

## What I learned
- Designing state as conversations -> messages with `useReducer`
- Async streaming with `AbortController`
- Keeping an API abstraction layer so the UI stays unchanged
- Persisting state and auto-scrolling with `useRef`

## Deploy
Push to GitHub, then import the repo on **Vercel** or **Netlify** (build command `npm run build`, output folder `dist`).
