export default function ModelSelector({ models, selectedModel, onSelect, accentColor }) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <div className="relative group shrink min-w-0">
        <select
          value={selectedModel?.id || ""}
          onChange={(e) => {
            const model = models.find((m) => m.id === e.target.value);
            if (model) onSelect(model);
          }}
          className="appearance-none bg-white/5 border border-white/10 hover:border-white/20 text-white/70 text-[10px] sm:text-xs rounded-lg pl-2 sm:pl-3 pr-6 sm:pr-8 py-1 sm:py-1.5 outline-none transition-all cursor-pointer focus:border-white/30 truncate max-w-[100px] xs:max-w-[140px] sm:max-w-none"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {models.length === 0 && <option value="">Loading...</option>}
          {models.map((model) => (
            <option key={model.id} value={model.id} className="bg-[#111118] text-white">
              {model.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-1.5 sm:px-2 pointer-events-none text-white/20">
          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {selectedModel?.provider === "lmstudio" && (
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" title="Local Model Active"></span>
        </span>
      )}
    </div>
  );
}
