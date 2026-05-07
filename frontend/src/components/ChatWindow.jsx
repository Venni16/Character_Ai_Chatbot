import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function ChatWindow({ messages, isTyping, character, accentColor }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 min-h-0">
      {messages.length === 0 && !isTyping && (
        <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16 select-none">
          <div className="text-6xl">{character?.emoji}</div>
          <p
            className="font-[Cinzel_Decorative] text-lg"
            style={{ color: accentColor }}
          >
            {character?.name}
          </p>
          <p className="text-white/30 text-sm max-w-xs">
            Say something to begin your conversation.
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          msg={msg}
          characterEmoji={character?.emoji}
          accentColor={accentColor}
        />
      ))}

      {isTyping && <TypingIndicator character={character} />}
      <div ref={bottomRef} />
    </div>
  );
}
