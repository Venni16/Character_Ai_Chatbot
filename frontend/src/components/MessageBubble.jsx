import { useState } from "react";

export default function MessageBubble({ msg, characterEmoji, accentColor }) {
  const [showThought, setShowThought] = useState(false);
  const isUser = msg.role === "user";
  const time = new Date(msg.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 msg-in-right">
        <div className="max-w-[80%] sm:max-w-[65%]">
          <div
            className="px-4 py-3 rounded-2xl rounded-br-sm text-white text-base leading-relaxed shadow-lg"
            style={{ backgroundColor: accentColor, opacity: 0.9 }}
          >
            {msg.content}
          </div>
          <p className="text-xs text-white/30 text-right mt-1 font-mono">{time}</p>
        </div>
      </div>
    );
  }

  // ── Parsers for AI thinking blocks ────────────────────────────────────────
  let thought = null;
  let reply = msg.content;

  // 1. Check for <thought> tags (common in reasoning models)
  const tagMatch = msg.content.match(/<thought>([\s\S]*?)<\/thought>/i);
  if (tagMatch) {
    thought = tagMatch[1];
    reply = msg.content.replace(tagMatch[0], "").trim();
  } 
  // 2. Check for "thinking process" prefixes
  else if (msg.content.startsWith("Here's a thinking process")) {
    const splitPoint = msg.content.indexOf("\n\n") !== -1 
      ? msg.content.indexOf("\n\n") 
      : msg.content.indexOf("---\n");
    
    if (splitPoint !== -1) {
      thought = msg.content.substring(0, splitPoint);
      reply = msg.content.substring(splitPoint).trim();
    }
  }

  const renderContent = (text) => {
    return text.split("\n").map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="flex items-end gap-2 mb-4 msg-in-left">
      <div
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-md mb-1"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        {characterEmoji}
      </div>
      <div className="max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]">
        {thought && (
          <div className="mb-2">
            <button
              onClick={() => setShowThought(!showThought)}
              className="text-[10px] font-mono uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors flex items-center gap-1 mb-1"
            >
              <svg 
                className={`w-2.5 h-2.5 transition-transform ${showThought ? 'rotate-90' : ''}`} 
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
              {showThought ? 'Hide Reasoning' : 'View Reasoning'}
            </button>
            {showThought && (
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-xs text-white/40 italic leading-relaxed font-mono">
                {renderContent(thought)}
              </div>
            )}
          </div>
        )}
        
        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 text-base leading-relaxed text-white/90 shadow-sm">
          {renderContent(reply)}
        </div>
        <p className="text-xs text-white/30 mt-1 ml-1 font-mono">{time}</p>
      </div>
    </div>
  );
}
