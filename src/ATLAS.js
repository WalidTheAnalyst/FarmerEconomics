import { useState, useRef, useEffect, useCallback } from "react";

const API_KEY = process.env.REACT_APP_wld;

const SYSTEM_PROMPT = `You are ATLAS — the Phosphorus Intelligence Advisor embedded inside PhosStratOS, a strategic commercial decision tool built for OCP (Office Chérifien des Phosphates), the world's largest phosphate exporter, headquartered in Morocco.

Your name ATLAS is deliberate: OCP's phosphate reserves lie in and around the Atlas Mountain range of Morocco. You carry the weight of that knowledge.

YOUR ROLE:
You are a senior agronomic strategist and market intelligence officer. You speak with authority, precision, and brevity. You do not hedge unnecessarily. You answer like someone who has spent 15 years in phosphate markets and agronomy consulting — direct, confident, occasionally blunt.

YOUR KNOWLEDGE DOMAIN (answer questions across all of these):
1. FRANCE AGRONOMY & MARKET:
   - P2O5 consumption: 226 kt (2023), down 44% from 2017. Only ~50% of parcels receive mineral P.
   - Agronomic gap: ~157 kt P2O5 vs Comifer recommendations. Addressable market 511 kt by 2030 if 70% gap closed.
   - Product mix 2023: NPK/NP 66kt, DAP/MAP 55kt, PK 43kt, TSP 25kt, Other 33kt — all declining.
   - Import origins (DAP/MAP, 2024): Morocco 69.4kt (~62%), Russia 13kt, Egypt 11.5kt, Tunisia 2kt.
   - Distribution: 70% through cooperatives (Inoxa, Area, Axereal). 25% retailers. 5% marketplaces.
   - Key ports: Rouen, La Pallice, Bordeaux.
   - Farm structure: ~390k farms, avg 69 ha. 43% of operators over 55. ~75% of land under lease (bail rural 9-year).
   - Cooperative agronomists drive product selection. Farmers decide timing and quantity.
   - 2022 price spike caused scissors effect — farmers defer P&K, prioritize N.
   - Competitors: ICL, Timac, Yara dominate specialty/NPK+ segment.
   - EU heavy metal/carbon regulations tightening — tailwind for low-cadmium Moroccan P.

2. CROP AGRONOMY (France):
   - Wheat (4,950 kha): current P 18 kg/ha, recommended 55 kg/ha. Gap: -37. Priority: TSP.
   - Barley (1,867 kha): current 27, rec 55, gap -28. Priority: TSP.
   - Rapeseed (1,230 kha): current 34, rec 55, gap -21. Priority: TSP/PK.
   - Corn (1,456 kha): current 39, rec 65, gap -26. Priority: DAP.
   - Sunflower (871 kha): current 25, rec 55, gap -30. Priority: TSP/PK.
   - Potatoes (211 kha): balanced at 40/40. Priority: PK.
   - Beet (402 kha): current 35, rec 60, gap -25. Priority: PK.

3. P SEPARATION ECONOMICS:
   - Separation = applying TSP and N separately vs blended MAP/DAP.
   - In calcareous soils (pH > 7.5): Ca²⁺ precipitates MAP phosphate within hours. TSP maintains lower pH microzone, delays fixation.
   - NH₄⁺ in blends suppresses root P uptake early season. Separation removes this interference.
   - Banded TSP subsurface outperforms broadcast MAP (15-35% less fixation loss).
   - France pH 6.2-6.8 in cereal zones — moderate fixation risk. Calcareous pockets in Champagne and Languedoc favour TSP strongly.
   - Separation benefit varies: Spain Wheat +$32/ha, Morocco Wheat +$45/ha, Brazil Maize +$58/ha, Australia Wheat $0/ha.

4. OCP STRATEGIC POSITIONING:
   - OCP is the world's largest phosphate exporter. Mines in Khouribga (beneath Atlas Mountains) and Youssoufia.
   - Morocco's P rock is low-cadmium — a competitive advantage as EU tightens Cd limits.
   - OCP's carbon footprint per tonne is among the lowest globally due to proximity to renewable energy investments.
   - TSP market entry in France requires co-design with cooperative purchasing groups, not direct farmer sales.
   - Key coops to target: Inoxa, Area, Axereal, InVivo group.
   - Blending JV or tolling arrangement with French NPK manufacturers needed for NPK+ penetration.

5. FARMER OWNERSHIP & BEHAVIOR:
   - Farm size bimodal: 38% under 20ha, 28% over 100ha. The >100ha segment drives fertilizer volume.
   - GAEC/EARL collective structures: ~30% of farms. More professional, more responsive to agronomy.
   - Generational transfer: 150-180k farms changing hands next 10-15 years. New operators = higher agronomy adoption.
   - Purchase timing: farmers buy P in Q3. Importers position TSP Q3-Q4, DAP Q4-Q1.
   - Green premium: nascent but growing. Biostimulant adoption already high.

STYLE RULES:
- Be concise. Maximum 4-5 sentences for most answers unless a deep question warrants more.
- Never say "I think" or "I believe" — state facts and recommendations directly.
- Use numbers when you have them. Vague answers are not acceptable.
- If asked something outside your domain, say so in one sentence and redirect.
- You may use web search for live market data, recent news, current prices, or anything time-sensitive.
- Always respond in the same language the user spoke in (French or English).
- End strategic recommendations with a single sharp "Bottom line:" sentence.`;

// ── Waveform visualizer ──────────────────────────────────────────────────────
function Waveform({ active, speaking }) {
  const bars = 28;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 40 }}>
      {Array.from({ length: bars }).map((_, i) => {
        const delay  = (i * 0.07) % 0.8;
        const height = active || speaking ? `${18 + Math.sin(i * 0.8) * 14}px` : "4px";
        return (
          <div key={i} style={{
            width: 3, borderRadius: 2,
            height,
            background: speaking
              ? `hsl(${160 + i * 2}, 80%, ${45 + i}%)`
              : active
              ? `hsl(${200 + i * 2}, 90%, ${50 + i}%)`
              : "#1e293b",
            transition: "height 0.15s ease",
            animation: (active || speaking) ? `wave 0.9s ease-in-out ${delay}s infinite alternate` : "none",
          }} />
        );
      })}
      <style>{`
        @keyframes wave {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1.4); }
        }
      `}</style>
    </div>
  );
}

// ── Orb avatar ───────────────────────────────────────────────────────────────
function AtlasOrb({ state }) {
  // state: idle | listening | thinking | speaking
  const colors = {
    idle:      ["#0ea5e9", "#0369a1"],
    listening: ["#10b981", "#059669"],
    thinking:  ["#f59e0b", "#d97706"],
    speaking:  ["#a78bfa", "#7c3aed"],
  };
  const [c1, c2] = colors[state] || colors.idle;
  return (
    <div style={{ position: "relative", width: 90, height: 90 }}>
      {/* outer pulse ring */}
      {(state === "listening" || state === "speaking") && (
        <div style={{
          position: "absolute", inset: -10, borderRadius: "50%",
          border: `2px solid ${c1}40`,
          animation: "pulse-ring 1.5s ease-out infinite",
        }} />
      )}
      {/* main orb */}
      <div style={{
        width: 90, height: 90, borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${c1}, ${c2})`,
        boxShadow: `0 0 30px ${c1}60, 0 0 60px ${c1}20`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.4s ease",
        animation: state === "thinking" ? "spin-slow 3s linear infinite" : "none",
      }}>
        {/* inner glyph */}
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, color: "#fff", fontWeight: 700,
          letterSpacing: "-0.02em", fontFamily: "'DM Mono', monospace",
        }}>
          {state === "thinking" ? "◌" : "A"}
        </div>
      </div>
      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ── Main ATLAS component ─────────────────────────────────────────────────────
export default function ATLASPage() {
  const [orbState,    setOrbState]    = useState("idle");
  const [transcript,  setTranscript]  = useState("");
  const [messages,    setMessages]    = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [statusText,  setStatusText]  = useState("Press the button and speak");
  const [error,       setError]       = useState(null);

  const recognitionRef = useRef(null);
  const synthRef       = useRef(window.speechSynthesis);
  const messagesEndRef = useRef(null);
  const convHistoryRef = useRef([]); // keeps full conversation for context

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Init speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition not supported. Use Chrome or Edge.");
      return;
    }
    const rec = new SpeechRecognition();
    rec.continuous      = false;
    rec.interimResults  = true;
    rec.lang            = "en-US"; // auto-detects FR too in practice
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setOrbState("listening");
      setStatusText("Listening…");
      setIsListening(true);
    };
    rec.onresult = (e) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join("");
      setTranscript(t);
    };
    rec.onend = () => {
      setIsListening(false);
    };
    rec.onerror = (e) => {
      setIsListening(false);
      setOrbState("idle");
      if (e.error !== "no-speech") setStatusText("Mic error: " + e.error);
      else setStatusText("No speech detected. Try again.");
    };
    recognitionRef.current = rec;
  }, []);

  // When transcript finalises (recognition ends), fire the API
  const prevListening = useRef(false);
  useEffect(() => {
    if (prevListening.current && !isListening && transcript.trim()) {
      askATLAS(transcript.trim());
      setTranscript("");
    }
    prevListening.current = isListening;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  const startListening = useCallback(() => {
    if (isListening) return;
    synthRef.current?.cancel(); // stop any ongoing speech
    setError(null);
    try { recognitionRef.current?.start(); }
    catch (e) { setStatusText("Could not start mic. Try again."); }
  }, [isListening]);

  const askATLAS = useCallback(async (userText) => {
    if (!userText) return;

    // Add user message to UI
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setOrbState("thinking");
    setStatusText("Thinking…");

    // Build conversation history for API
    const newHistory = [...convHistoryRef.current, { role: "user", content: userText }];

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          tools: [{
            type: "web_search_20250305",
            name: "web_search",
            max_uses: 2,
          }],
          messages: newHistory,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "API error");
      }

      const data = await response.json();

      // Extract text from response (may include tool use blocks)
      const assistantText = data.content
        .filter(b => b.type === "text")
        .map(b => b.text)
        .join(" ")
        .trim();

      // Update conversation history
      convHistoryRef.current = [
        ...newHistory,
        { role: "assistant", content: assistantText },
      ];

      // Add to UI
      setMessages(prev => [...prev, { role: "assistant", text: assistantText }]);
      setOrbState("speaking");
      setStatusText("Speaking…");

      // Speak the response
      speakText(assistantText);

    } catch (err) {
      console.error(err);
      setError("ATLAS encountered an error: " + err.message);
      setOrbState("idle");
      setStatusText("Press the button and speak");
    }
  }, []);

  const speakText = useCallback((text) => {
    const synth = synthRef.current;
    synth.cancel();

    // Clean text for speech (remove markdown symbols)
    const clean = text.replace(/[*_#`]/g, "").replace(/\n+/g, ". ");

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate   = 0.95;
    utterance.pitch  = 0.9;
    utterance.volume = 1;

    // Try to pick a good voice
    const voices = synth.getVoices();
    const preferred = voices.find(v =>
      v.name.includes("Daniel") ||
      v.name.includes("Google UK") ||
      v.name.includes("Alex") ||
      v.lang === "en-GB"
    ) || voices.find(v => v.lang.startsWith("en")) || voices[0];
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      setOrbState("idle");
      setStatusText("Press the button and speak");
    };
    utterance.onerror = () => {
      setOrbState("idle");
      setStatusText("Press the button and speak");
    };

    synth.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel();
    setOrbState("idle");
    setStatusText("Press the button and speak");
  }, []);

  const clearConversation = useCallback(() => {
    synthRef.current?.cancel();
    setMessages([]);
    convHistoryRef.current = [];
    setOrbState("idle");
    setStatusText("Press the button and speak");
    setError(null);
  }, []);

  const suggestedQuestions = [
    "What's the separation opportunity for wheat in Champagne?",
    "Which farmer segment should OCP prioritize first in France?",
    "How does OCP's cadmium profile compare to Russian competition?",
    "What's the commercial case for TSP vs MAP in French cereals?",
    "What are the latest phosphate price trends?",
    "How does the cooperative channel work in France?",
  ];

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "calc(100vh - 160px)",
      background: "#060d1a", fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .atlas-msg { animation: fadeIn 0.3s ease forwards; }
      `}</style>

      <div style={{ display: "flex", flex: 1, overflow: "hidden", gap: 0 }}>

        {/* ── LEFT PANEL: Orb + controls ── */}
        <div style={{
          width: 280, flexShrink: 0,
          background: "#0a0f1a",
          borderRight: "1px solid #1e293b",
          display: "flex", flexDirection: "column",
          alignItems: "center", padding: "36px 24px", gap: 24,
        }}>
          {/* Orb */}
          <AtlasOrb state={orbState} />

          {/* Name + status */}
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>ATLAS</p>
            <p style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>
              Phosphorus Intelligence Advisor
            </p>
            <div style={{
              marginTop: 10, display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 20,
              background: orbState === "idle" ? "#1e293b" :
                          orbState === "listening" ? "#10b98120" :
                          orbState === "thinking"  ? "#f59e0b20" : "#a78bfa20",
              border: `1px solid ${
                orbState === "idle"      ? "#334155" :
                orbState === "listening" ? "#10b981" :
                orbState === "thinking"  ? "#f59e0b" : "#a78bfa"
              }`,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: orbState === "idle"      ? "#334155" :
                            orbState === "listening" ? "#10b981" :
                            orbState === "thinking"  ? "#f59e0b" : "#a78bfa",
                animation: orbState !== "idle" ? "pulse-ring 1s ease-out infinite" : "none",
              }} />
              <span style={{
                fontSize: 11, fontWeight: 500,
                color: orbState === "idle"      ? "#64748b" :
                       orbState === "listening" ? "#10b981" :
                       orbState === "thinking"  ? "#f59e0b" : "#a78bfa",
              }}>
                {statusText}
              </span>
            </div>
          </div>

          {/* Waveform */}
          <Waveform active={isListening} speaking={orbState === "speaking"} />

          {/* Mic button */}
          <button
            onClick={isListening ? undefined : orbState === "speaking" ? stopSpeaking : startListening}
            disabled={orbState === "thinking"}
            style={{
              width: 72, height: 72, borderRadius: "50%", border: "none", cursor: orbState === "thinking" ? "not-allowed" : "pointer",
              background: isListening
                ? "linear-gradient(135deg, #10b981, #059669)"
                : orbState === "speaking"
                ? "linear-gradient(135deg, #f43f5e, #be123c)"
                : "linear-gradient(135deg, #0ea5e9, #0369a1)",
              boxShadow: isListening
                ? "0 0 24px #10b98160"
                : orbState === "speaking"
                ? "0 0 24px #f43f5e60"
                : "0 0 24px #0ea5e960",
              fontSize: 28, transition: "all 0.2s ease",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {isListening ? "⏹" : orbState === "speaking" ? "⏸" : "🎙"}
          </button>

          <p style={{ color: "#334155", fontSize: 11, textAlign: "center", lineHeight: 1.6 }}>
            {isListening
              ? "Listening — speak now"
              : orbState === "speaking"
              ? "Tap to stop"
              : "Tap to speak with ATLAS"}
          </p>

          {/* Live transcript preview */}
          {transcript && (
            <div style={{
              background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8,
              padding: "10px 12px", fontSize: 12, color: "#10b981",
              width: "100%", fontStyle: "italic",
            }}>
              "{transcript}"
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              background: "#1a0a0a", border: "1px solid #f43f5e40",
              borderRadius: 8, padding: "10px 12px", fontSize: 11,
              color: "#f43f5e", width: "100%", lineHeight: 1.5,
            }}>
              {error}
            </div>
          )}

          {/* Clear button */}
          {messages.length > 0 && (
            <button onClick={clearConversation} style={{
              background: "transparent", border: "1px solid #1e293b",
              color: "#475569", fontSize: 11, padding: "6px 16px",
              borderRadius: 6, cursor: "pointer", width: "100%",
            }}>
              Clear conversation
            </button>
          )}
        </div>

        {/* ── RIGHT PANEL: conversation + suggestions ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

            {messages.length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 8 }}>
                <div style={{ textAlign: "center", paddingBottom: 8 }}>
                  <p style={{ color: "#334155", fontSize: 13, lineHeight: 1.7 }}>
                    Ask ATLAS anything about French P fertilizer markets, agronomy, OCP strategy, or competitive dynamics. He can also search the web for live data.
                  </p>
                </div>
                <p style={{ color: "#475569", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Suggested questions</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {suggestedQuestions.map((q, i) => (
                    <button key={i} onClick={() => askATLAS(q)}
                      style={{
                        background: "#0a0f1a", border: "1px solid #1e293b",
                        borderRadius: 10, padding: "12px 14px", textAlign: "left",
                        color: "#94a3b8", fontSize: 12, cursor: "pointer",
                        lineHeight: 1.5, transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#0ea5e9"; e.currentTarget.style.color = "#e2e8f0"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.color = "#94a3b8"; }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className="atlas-msg" style={{
                display: "flex",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                gap: 12, alignItems: "flex-start",
              }}>
                {/* Avatar */}
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: msg.role === "user"
                    ? "linear-gradient(135deg, #334155, #1e293b)"
                    : "linear-gradient(135deg, #0ea5e9, #0369a1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "#fff",
                  boxShadow: msg.role === "assistant" ? "0 0 12px #0ea5e940" : "none",
                }}>
                  {msg.role === "user" ? "U" : "A"}
                </div>

                {/* Bubble */}
                <div style={{
                  maxWidth: "75%",
                  background: msg.role === "user" ? "#0f172a" : "#080e1a",
                  border: msg.role === "user"
                    ? "1px solid #1e293b"
                    : "1px solid #0ea5e920",
                  borderRadius: msg.role === "user" ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                  padding: "12px 16px",
                }}>
                  {msg.role === "assistant" && (
                    <p style={{ color: "#0ea5e9", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 600 }}>ATLAS</p>
                  )}
                  <p style={{
                    color: msg.role === "user" ? "#94a3b8" : "#cbd5e1",
                    fontSize: 13, lineHeight: 1.75, margin: 0,
                    whiteSpace: "pre-wrap",
                  }}>
                    {msg.text}
                  </p>
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {orbState === "thinking" && (
              <div className="atlas-msg" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "#fff",
                  boxShadow: "0 0 12px #f59e0b40",
                  animation: "spin-slow 3s linear infinite",
                }}>A</div>
                <div style={{
                  background: "#080e1a", border: "1px solid #f59e0b20",
                  borderRadius: "4px 12px 12px 12px", padding: "12px 16px",
                }}>
                  <p style={{ color: "#f59e0b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>ATLAS</p>
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    {[0, 1, 2].map(j => (
                      <div key={j} style={{
                        width: 7, height: 7, borderRadius: "50%", background: "#f59e0b",
                        animation: `wave 0.8s ease-in-out ${j * 0.15}s infinite alternate`,
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Text input fallback */}
          <div style={{
            borderTop: "1px solid #1e293b", padding: "14px 28px",
            background: "#0a0f1a", display: "flex", gap: 10,
          }}>
            <input
              type="text"
              placeholder="Or type your question here…"
              onKeyDown={e => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  askATLAS(e.target.value.trim());
                  e.target.value = "";
                }
              }}
              style={{
                flex: 1, background: "#0f172a", border: "1px solid #1e293b",
                borderRadius: 8, padding: "10px 14px", color: "#e2e8f0",
                fontSize: 13, outline: "none",
              }}
              onFocus={e => e.target.style.borderColor = "#0ea5e9"}
              onBlur={e  => e.target.style.borderColor = "#1e293b"}
            />
            <button
              onClick={e => {
                const input = e.currentTarget.previousSibling;
                if (input.value.trim()) { askATLAS(input.value.trim()); input.value = ""; }
              }}
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #0369a1)",
                border: "none", borderRadius: 8, padding: "10px 20px",
                color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
