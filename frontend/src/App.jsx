import { useState, useEffect, useRef } from "react";
import CharacterSelector from "./components/CharacterSelector";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";
import ModelSelector from "./components/ModelSelector";
import { getCharacters, streamChat, getModels } from "./api";

export default function App() {
  const [characters, setCharacters] = useState([]);
  const [selected, setSelected] = useState(null);
  // history keyed by character name so each character has its own chat
  const [allHistory, setAllHistory] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const msgIdRef = useRef(0);

  // ── Load characters and models on mount ──────────────────────────────────
  useEffect(() => {
    getCharacters()
      .then((data) => {
        setCharacters(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch(() => setError("Could not connect to backend. Please ensure the server is running."));

    getModels()
      .then((data) => {
        setModels(data);
        if (data.length > 0) setSelectedModel(data[0]);
      })
      .catch(() => console.error("Could not fetch models"));
  }, []);

  // ── Update CSS accent variable whenever character changes ─────────────────
  useEffect(() => {
    if (selected?.accent) {
      document.documentElement.style.setProperty("--char-accent", selected.accent);
    }
  }, [selected]);

  const currentHistory = selected ? (allHistory[selected.name] ?? []) : [];

  // ── Send a message ────────────────────────────────────────────────────────
  const handleSend = async (text) => {
    if (!selected || isTyping) return;
    setError("");

    const userMsg = {
      id: msgIdRef.current++,
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    // Add user message immediately
    setAllHistory((prev) => ({
      ...prev,
      [selected.name]: [...(prev[selected.name] ?? []), userMsg],
    }));

    setIsTyping(true);

    try {
      const historyPayload = currentHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Create a placeholder for the AI message
      const aiMsgId = msgIdRef.current++;
      const aiMsg = {
        id: aiMsgId,
        role: "model",
        content: "",
        timestamp: Date.now(),
      };

      setAllHistory((prev) => ({
        ...prev,
        [selected.name]: [...(prev[selected.name] ?? []), aiMsg],
      }));

      let fullText = "";
      await streamChat(
        selected.name,
        text,
        historyPayload,
        selectedModel?.id,
        selectedModel?.provider,
        (chunk) => {
          fullText += chunk;
          setAllHistory((prev) => {
            const hist = [...(prev[selected.name] ?? [])];
            const idx = hist.findIndex((m) => m.id === aiMsgId);
            if (idx !== -1) {
              hist[idx] = { ...hist[idx], content: fullText };
            }
            return { ...prev, [selected.name]: hist };
          });
        }
      );
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  // ── Select character ──────────────────────────────────────────────────────
  const handleSelectCharacter = (char) => {
    setSelected(char);
    setError("");
    setSidebarOpen(false);
  };

  // ── Clear chat ────────────────────────────────────────────────────────────
  const handleClear = () => {
    if (!selected) return;
    setAllHistory((prev) => ({ ...prev, [selected.name]: [] }));
    setError("");
  };

  const accentColor = selected?.accent ?? "#f39c12";

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0a0a0f]">
      {/* ── Mobile top bar ── */}
      <header className="lg:hidden flex items-center justify-between px-3 h-14 border-b border-white/10 bg-black/40 backdrop-blur-sm flex-shrink-0 gap-2">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-xs font-medium max-w-[80px] truncate">
            {selected ? selected.name : "Menu"}
          </span>
        </button>

        <div className="flex-1 flex justify-center min-w-0">
          <ModelSelector 
            models={models} 
            selectedModel={selectedModel} 
            onSelect={setSelectedModel} 
            accentColor={accentColor}
          />
        </div>

        {selected && (
          <button
            onClick={handleClear}
            className="text-white/30 hover:text-white/70 transition-colors text-[10px] uppercase tracking-wider font-bold shrink-0"
          >
            Clear
          </button>
        )}
      </header>

      {/* ── Main layout ── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="absolute inset-0 bg-black/60 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            absolute lg:static z-30 h-full
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
          `}
        >
          <CharacterSelector
            characters={characters}
            selected={selected}
            onSelect={handleSelectCharacter}
          />
        </aside>

        {/* Chat area */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Chat header (desktop only) */}
          <div className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
            {selected ? (
              <>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selected.emoji}</span>
                  <div>
                    <h2 className="font-[Cinzel_Decorative] text-lg" style={{ color: accentColor }}>
                      {selected.name}
                    </h2>
                    <p className="text-white/35 text-xs">{selected.tagline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <ModelSelector 
                    models={models} 
                    selectedModel={selectedModel} 
                    onSelect={setSelectedModel} 
                    accentColor={accentColor}
                  />
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/70 transition-colors border border-white/10 hover:border-white/25 rounded-lg px-3 py-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear chat
                  </button>
                </div>
              </>
            ) : (
              <p className="text-white/30 text-sm">Select a character to begin</p>
            )}
          </div>

          {/* Error banner */}
          {error && (
            <div className="mx-4 mt-3 px-4 py-2.5 rounded-xl bg-red-900/30 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Messages */}
          {selected ? (
            <>
              <ChatWindow
                messages={currentHistory}
                isTyping={isTyping}
                character={selected}
                accentColor={accentColor}
              />
              <ChatInput
                onSend={handleSend}
                isLoading={isTyping}
                accentColor={accentColor}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/20 text-sm">
              {characters.length === 0
                ? "Connecting to server…"
                : "Select a character to start chatting"}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
