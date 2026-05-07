export default function TypingIndicator({ character }) {
  return (
    <div className="flex items-end gap-2 mb-4 msg-in-left">
      <div
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-md"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        {character?.emoji}
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
        <span className="w-2 h-2 rounded-full bg-white/50 dot-1 inline-block" />
        <span className="w-2 h-2 rounded-full bg-white/50 dot-2 inline-block" />
        <span className="w-2 h-2 rounded-full bg-white/50 dot-3 inline-block" />
      </div>
    </div>
  );
}
