/**
 * aiService - the abstraction layer between the UI and the "AI".
 *
 * The UI only ever calls:  send({ messages, signal, onToken })
 *   - messages: [{ role: "user" | "assistant", content: string }]
 *   - signal:   AbortSignal (Stop generating button)
 *   - onToken:  called with each new piece of text
 *
 * To use a real LLM later, replace the body of send() with a fetch() to YOUR
 * backend proxy (never put API keys in frontend code). Nothing else changes.
 */

const REPLIES = {
  greet: [
    "Hi there! 👋 I'm **StudyBuddy**, your AI tutor.",
    "",
    "Ask me about programming, maths or any topic you're studying. Try:",
    "",
    "- *Explain React hooks*",
    "- *Show me a JavaScript function example*",
    "- *How do I revise for exams?*",
  ].join("\n"),

  react: [
    "## React in a nutshell",
    "",
    "React builds UIs from small, reusable **components**. The key ideas:",
    "",
    "1. **Props** - data passed *down* to a component",
    "2. **State** - data a component owns and can change",
    "3. **Hooks** - functions like `useState` and `useEffect` that add features to function components",
    "",
    "Here is a tiny counter:",
    "",
    "```jsx",
    "import { useState } from 'react';",
    "",
    "export default function Counter() {",
    "  const [count, setCount] = useState(0);",
    "  return (",
    "    <button onClick={() => setCount(count + 1)}>",
    "      Clicked {count} times",
    "    </button>",
    "  );",
    "}",
    "```",
    "",
    "> Tip: never change state directly - always use the setter function.",
  ].join("\n"),

  code: [
    "Sure! Here's a simple JavaScript function:",
    "",
    "```js",
    "function average(numbers) {",
    "  const total = numbers.reduce((sum, n) => sum + n, 0);",
    "  return total / numbers.length;",
    "}",
    "",
    "console.log(average([80, 90, 100])); // 90",
    "```",
    "",
    "**How it works**",
    "",
    "- `reduce` adds up every number",
    "- dividing by `numbers.length` gives the average",
    "",
    "Want me to explain `reduce` in more detail?",
  ].join("\n"),

  study: [
    "## A simple revision plan",
    "",
    "1. **Plan** - list topics and rate each one 1-5",
    "2. **Study in blocks** - 25 minutes focus, 5 minutes break",
    "3. **Practise** - solve questions instead of only re-reading",
    "4. **Review** - revisit weak topics after 1 day, 3 days and 7 days",
    "",
    "Small daily effort beats one long night before the exam. 📚",
  ].join("\n"),
};

function buildReply(prompt) {
  const p = prompt.toLowerCase();
  if (/^(hi|hello|hey)\b/.test(p.trim())) return REPLIES.greet;
  if (/react|hook|state|component|props/.test(p)) return REPLIES.react;
  if (/code|function|javascript|js\b|python|loop|array/.test(p)) return REPLIES.code;
  if (/study|revise|revision|exam|learn/.test(p)) return REPLIES.study;
  return [
    "Good question! You asked:",
    "",
    `> ${prompt.slice(0, 120)}`,
    "",
    "This is a **mock AI**, so I can't answer everything yet - but the interface is ready for a real model.",
    "",
    "Try asking about *React*, *JavaScript code* or *how to study*.",
  ].join("\n");
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));
    const id = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(id);
      reject(new DOMException("Aborted", "AbortError"));
    }
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export async function send({ messages, signal, onToken }) {
  const last = messages[messages.length - 1]?.content ?? "";
  const reply = buildReply(last);

  await sleep(700, signal); // "thinking" delay so the typing indicator shows

  // split into words but keep spaces/newlines so Markdown still works
  const pieces = reply.split(/(\s+)/).filter(Boolean);
  for (const piece of pieces) {
    await sleep(piece.trim() ? 45 : 0, signal);
    onToken(piece);
  }
}
