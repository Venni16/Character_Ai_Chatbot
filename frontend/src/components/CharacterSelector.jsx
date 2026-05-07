export default function CharacterSelector({ characters, selected, onSelect }) {
  return (
    <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col bg-black/30 backdrop-blur-sm">
      {/* Header */}
      <div className="px-5 py-5 border-b border-white/10">
        <h1 className="font-[Cinzel_Decorative] text-xl sm:text-2xl text-white tracking-wide">
          Character<span className="accent-text"> AI</span>
        </h1>
        <p className="text-white/40 text-sm mt-1">Choose who to speak with</p>
      </div>

      {/* Character Grid */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 sm:gap-3">
          {characters.map((char) => {
            const isSelected = selected?.name === char.name;
            return (
              <button
                key={char.name}
                onClick={() => onSelect(char)}
                className="relative group flex flex-col items-start gap-2 p-3 sm:p-4 rounded-2xl border transition-all duration-300 text-left cursor-pointer hover:-translate-y-0.5"
                style={{
                  borderColor: isSelected ? char.accent : "rgba(255,255,255,0.08)",
                  backgroundColor: isSelected
                    ? `color-mix(in srgb, ${char.accent} 12%, transparent)`
                    : "rgba(255,255,255,0.03)",
                  boxShadow: isSelected
                    ? `0 0 20px color-mix(in srgb, ${char.accent} 25%, transparent)`
                    : "none",
                }}
              >
                <div className="text-3xl sm:text-4xl">{char.emoji}</div>
                <div>
                  <p
                    className="font-semibold text-sm sm:text-base leading-tight"
                    style={{ color: isSelected ? char.accent : "rgba(255,255,255,0.85)" }}
                  >
                    {char.name}
                  </p>
                  <p className="text-white/35 text-xs mt-0.5 leading-tight line-clamp-2">
                    {char.tagline}
                  </p>
                </div>
                {isSelected && (
                  <span
                    className="absolute top-2 right-2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: char.accent }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
