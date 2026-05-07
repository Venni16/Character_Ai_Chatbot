import { useState, useRef } from "react";

export default function ChatInput({ onSend, isLoading, accentColor }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setText("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-white/10 p-3 sm:p-4">
      <div className="flex items-end gap-2 sm:gap-3 bg-white/5 border border-white/10 rounded-2xl px-3 sm:px-4 py-2 sm:py-3 focus-within:border-white/25 transition-colors">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
          rows={1}
          className="flex-1 bg-transparent text-white/90 placeholder-white/25 resize-none outline-none text-base leading-relaxed max-h-32 overflow-y-auto disabled:opacity-40"
          style={{ fontFamily: "'Crimson Pro', serif" }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || isLoading}
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          style={{ backgroundColor: accentColor }}
          title="Send message"
        >
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
      <p className="text-white/20 text-xs text-center mt-2 hidden sm:block">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
