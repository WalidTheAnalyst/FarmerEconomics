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
   - In calcareous soils (pH > 7.5): Ca2+ precipitates MAP phosphate within hours. TSP maintains lower pH microzone, delays fixation.
   - NH4+ in blends suppresses root P uptake early season. Separation removes this interference.
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

// ── Pick the best available voice ────────────────────────────────────────────
function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  // Preference order: natural-sounding English voices
  const preferred = [
    "Google UK English Male",
    "Google US English",
    "Daniel",           // macOS
    "Alex",             // macOS
    "Arthur",           // macOS Ventura+
    "Google UK English Female",
    "Samantha",         // iOS/macOS
  ];
  for (const name of preferred) {
    const v = voices.find(v => v.name === name);
    if (v) return v;
  }
  // Fallback: any en-GB, then any en-US, then any English
  return (
    voices.find(v => v.lang === "en-GB") ||
    voices.find(v => v.lang === "en-US") ||
    voices.find(v => v.lang.startsWith("en")) ||
    voices[0]
  );
}

// ── Audio-reactive orb — drawn on canvas ────────────────────────────────────
function AtlasCanvas({ state, audioLevel }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const timeRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    const stateColors = {
      idle:      { inner: "#0ea5e9", outer: "#0369a1", glow: "#0ea5e930" },
      listening: { inner: "#10b981", outer: "#059669", glow: "#10b98140" },
      thinking:  { inner: "#f59e0b", outer: "#d97706", glow: "#f59e0b30" },
      speaking:  { inner: "#a78bfa", outer: "#7c3aed", glow: "#a78bfa40" },
    };

    function draw() {
      timeRef.current += 0.018;
      const t    = timeRef.current;
      const lvl  = audioLevel?.current ?? 0;
      const cols = stateColors[state] || stateColors.idle;

      ctx.clearRect(0, 0, W, H);

      // ── outer glow rings ──
      const numRings = state === "speaking" ? 3 : state === "listening" ? 2 : 1;
      for (let r = 0; r < numRings; r++) {
        const phase    = t * (0.6 + r * 0.3) + r * 1.2;
        const ringSize = 60 + r * 22 + Math.sin(phase) * (6 + lvl * 18);
        const alpha    = (0.18 - r * 0.05) * (1 + lvl);
        const grad     = ctx.createRadialGradient(cx, cy, ringSize * 0.4, cx, cy, ringSize);
        grad.addColorStop(0, cols.inner + "00");
        grad.addColorStop(1, cols.inner + Math.floor(alpha * 255).toString(16).padStart(2, "0"));
        ctx.beginPath();
        ctx.arc(cx, cy, ringSize, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // ── morphing blob (organic shape) ──
      const baseR  = 52 + lvl * 14;
      const points = 180;
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        // Layer multiple sine waves for organic feel
        const noise =
          Math.sin(angle * 3 + t * 1.8) * (3 + lvl * 8) +
          Math.sin(angle * 5 - t * 2.4) * (2 + lvl * 5) +
          Math.sin(angle * 7 + t * 1.1) * (1 + lvl * 3) +
          Math.sin(angle * 2 - t * 0.7) * (4 + lvl * 6);
        const r = baseR + noise;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Gradient fill
      const blobGrad = ctx.createRadialGradient(cx - 12, cy - 14, 4, cx, cy, baseR + 20);
      blobGrad.addColorStop(0, cols.inner);
      blobGrad.addColorStop(0.6, cols.outer);
      blobGrad.addColorStop(1, cols.outer + "cc");
      ctx.fillStyle   = blobGrad;
      ctx.shadowColor = cols.inner;
      ctx.shadowBlur  = 24 + lvl * 30;
      ctx.fill();
      ctx.shadowBlur  = 0;

      // ── inner shimmer ring ──
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 0.72, 0, Math.PI * 2);
      ctx.strokeStyle = "#ffffff18";
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      // ── "A" glyph ──
      ctx.font        = `700 ${state === "thinking" ? 22 : 26}px 'DM Sans', sans-serif`;
      ctx.fillStyle   = state === "thinking" ? "#ffffff80" : "#ffffffee";
      ctx.textAlign   = "center";
      ctx.textBaseline= "middle";
      ctx.fillText(state === "thinking" ? "◌" : "A", cx, cy + 1);

      // ── speaking: extra frequency bars around the orb ──
      if (state === "speaking") {
        const bars = 32;
        for (let i = 0; i < bars; i++) {
          const angle  = (i / bars) * Math.PI * 2 - Math.PI / 2;
          const barH   = 6 + Math.abs(Math.sin(angle * 4 + t * 8)) * (10 + lvl * 24);
          const innerR = baseR + 8;
          const outerR = innerR + barH;
          const x1 = cx + innerR * Math.cos(angle);
          const y1 = cy + innerR * Math.sin(angle);
          const x2 = cx + outerR * Math.cos(angle);
          const y2 = cy + outerR * Math.sin(angle);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = cols.inner + "99";
          ctx.lineWidth   = 2.5;
          ctx.lineCap     = "round";
          ctx.stroke();
        }
      }

      // ── listening: ripple circles ──
      if (state === "listening") {
        for (let i = 0; i < 2; i++) {
          const rippleR = baseR + 20 + i * 20 + ((t * 60 + i * 30) % 40);
          const alpha   = Math.max(0, 0.4 - ((t * 60 + i * 30) % 40) / 40 * 0.4);
          ctx.beginPath();
          ctx.arc(cx, cy, rippleR, 0, Math.PI * 2);
          ctx.strokeStyle = cols.inner + Math.floor(alpha * 255).toString(16).padStart(2, "0");
          ctx.lineWidth   = 1.5;
          ctx.stroke();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [state, audioLevel]);

  return (
    <canvas
      ref={canvasRef}
      width={200} height={200}
      style={{ filter: "drop-shadow(0 0 20px rgba(14,165,233,0.3))" }}
    />
  );
}

// ── Animated transcript ticker ───────────────────────────────────────────────
function TranscriptTicker({ text }) {
  if (!text) return null;
  return (
    <div style={{
      background: "#0f172a", border: "1px solid #10b98140",
      borderRadius: 8, padding: "8px 14px",
      fontSize: 12, color: "#10b981", fontStyle: "italic",
      maxWidth: "100%", overflow: "hidden",
      whiteSpace: "nowrap", textOverflow: "ellipsis",
    }}>
      "{text}"
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
  const [voiceName,   setVoiceName]   = useState("");

  const recognitionRef = useRef(null);
  const convHistoryRef = useRef([]);
  const messagesEndRef = useRef(null);
  const audioLevelRef  = useRef(0);  // live audio amplitude 0-1

  // Voices load asynchronously — pick best once loaded
  useEffect(() => {
    const load = () => {
      const v = pickVoice();
      if (v) setVoiceName(v.name);
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Init speech recognition
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError("Speech recognition requires Chrome or Edge."); return; }
    const rec          = new SR();
    rec.continuous     = false;
    rec.interimResults = true;
    rec.lang           = "en-US";

    rec.onstart  = () => { setOrbState("listening"); setStatusText("Listening…"); setIsListening(true); };
    rec.onresult = e  => setTranscript(Array.from(e.results).map(r => r[0].transcript).join(""));
    rec.onend    = () => setIsListening(false);
    rec.onerror  = e  => {
      setIsListening(false); setOrbState("idle");
      setStatusText(e.error === "no-speech" ? "No speech detected — try again" : "Mic error: " + e.error);
    };
    recognitionRef.current = rec;
  }, []);

  // Fire API when recognition ends with transcript
  const prevListening = useRef(false);
  useEffect(() => {
    if (prevListening.current && !isListening && transcript.trim()) {
      askATLAS(transcript.trim());
      setTranscript("");
    }
    prevListening.current = isListening;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  // ── Speak with Web Audio API analyser for live amplitude ──
  const speakText = useCallback((text) => {
    const synth = window.speechSynthesis;
    synth.cancel();

    const clean      = text.replace(/[*_#`]/g, "").replace(/\n+/g, ". ");
    const utterance  = new SpeechSynthesisUtterance(clean);
    utterance.rate   = 0.88;   // slightly slower = more natural
    utterance.pitch  = 0.92;
    utterance.volume = 1;

    // Load voices fresh each time (needed on some browsers)
    const voice = pickVoice();
    if (voice) utterance.voice = voice;

    // Animate audio level via a simple sine approximation
    // (Web Audio API can't tap into SpeechSynthesis directly in most browsers)
    let frame = 0;
    const animateLevel = () => {
      frame++;
      // Simulate natural speech amplitude — rises and falls organically
      audioLevelRef.current =
        0.3 +
        Math.abs(Math.sin(frame * 0.12)) * 0.35 +
        Math.abs(Math.sin(frame * 0.31)) * 0.2 +
        Math.random() * 0.15;
      if (window.speechSynthesis.speaking) {
        requestAnimationFrame(animateLevel);
      } else {
        audioLevelRef.current = 0;
      }
    };

    utterance.onstart = () => {
      setOrbState("speaking");
      setStatusText("Speaking…");
      requestAnimationFrame(animateLevel);
    };
    utterance.onend = () => {
      audioLevelRef.current = 0;
      setOrbState("idle");
      setStatusText("Press the button and speak");
    };
    utterance.onerror = () => {
      audioLevelRef.current = 0;
      setOrbState("idle");
      setStatusText("Press the button and speak");
    };

    // Chrome bug: long utterances get cut off — chunk into sentences
    const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
    if (sentences.length > 1) {
      let i = 0;
      const speakNext = () => {
        if (i >= sentences.length) {
          audioLevelRef.current = 0;
          setOrbState("idle");
          setStatusText("Press the button and speak");
          return;
        }
        const u   = new SpeechSynthesisUtterance(sentences[i++]);
        u.rate    = 0.88;
        u.pitch   = 0.92;
        u.volume  = 1;
        if (voice) u.voice = voice;
        u.onend   = speakNext;
        u.onerror = speakNext;
        window.speechSynthesis.speak(u);
      };
      setOrbState("speaking");
      setStatusText("Speaking…");
      requestAnimationFrame(animateLevel);
      speakNext();
    } else {
      synth.speak(utterance);
    }
  }, []);

  // ── Ask ATLAS ──
  const askATLAS = useCallback(async (userText) => {
    if (!userText) return;
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setOrbState("thinking");
    setStatusText("Thinking…");

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
          tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 2 }],
          messages: newHistory,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "API error");
      }

      const data          = await response.json();
      const assistantText = data.content.filter(b => b.type === "text").map(b => b.text).join(" ").trim();

      convHistoryRef.current = [...newHistory, { role: "assistant", content: assistantText }];
      setMessages(prev => [...prev, { role: "assistant", text: assistantText }]);
      speakText(assistantText);

    } catch (err) {
      console.error(err);
      setError("ATLAS: " + err.message);
      setOrbState("idle");
      setStatusText("Press the button and speak");
    }
  }, [speakText]);

  const startListening = useCallback(() => {
    if (isListening || orbState === "thinking") return;
    window.speechSynthesis.cancel();
    audioLevelRef.current = 0;
    setError(null);
    try { recognitionRef.current?.start(); }
    catch { setStatusText("Could not start mic — try again"); }
  }, [isListening, orbState]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    audioLevelRef.current = 0;
    setOrbState("idle");
    setStatusText("Press the button and speak");
  }, []);

  const clearConversation = useCallback(() => {
    window.speechSynthesis.cancel();
    audioLevelRef.current = 0;
    setMessages([]);
    convHistoryRef.current = [];
    setOrbState("idle");
    setStatusText("Press the button and speak");
    setError(null);
    setTranscript("");
  }, []);

  const orbStateColor = {
    idle:      "#0ea5e9",
    listening: "#10b981",
    thinking:  "#f59e0b",
    speaking:  "#a78bfa",
  };

  const suggested = [
    "What's the separation opportunity for wheat in Champagne?",
    "Which farmer segment should OCP prioritize first in France?",
    "How does OCP's cadmium profile compare to Russian competition?",
    "What's the commercial case for TSP vs MAP in French cereals?",
    "What are the latest phosphate price trends?",
    "How does the cooperative channel work in France?",
  ];

  return (
    <div style={{ display: "flex", height: "calc(100vh - 108px)", background: "#060d1a", overflow: "hidden" }}>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.03); }
        }
        .atlas-msg  { animation: fadeSlideIn 0.35s ease forwards; }
        .atlas-orb  { animation: breathe 4s ease-in-out infinite; }
      `}</style>

      {/* ── LEFT: Avatar panel ── */}
      <div style={{
        width: 300, flexShrink: 0,
        background: "linear-gradient(180deg, #0a0f1a 0%, #060d1a 100%)",
        borderRight: "1px solid #1e293b",
        display: "flex", flexDirection: "column",
        alignItems: "center", padding: "32px 20px 24px",
        gap: 18, position: "relative", overflow: "hidden",
      }}>
        {/* Background grid */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }} />

        {/* Orb */}
        <div className="atlas-orb" style={{ position: "relative", zIndex: 1 }}>
          <AtlasCanvas state={orbState} audioLevel={audioLevelRef} />
        </div>

        {/* Name */}
        <div style={{ textAlign: "center", zIndex: 1 }}>
          <p style={{ color: "#f1f5f9", fontSize: 24, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>ATLAS</p>
          <p style={{ color: "#334155", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", marginTop: 3 }}>
            Phosphorus Intelligence Advisor
          </p>
        </div>

        {/* Status pill */}
        <div style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "5px 14px", borderRadius: 20,
          background: orbStateColor[orbState] + "12",
          border: `1px solid ${orbStateColor[orbState]}35`,
          zIndex: 1,
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: orbStateColor[orbState],
            boxShadow: `0 0 8px ${orbStateColor[orbState]}`,
            animation: orbState !== "idle" ? "breathe 1s ease-in-out infinite" : "none",
          }} />
          <span style={{ fontSize: 11, color: orbStateColor[orbState], fontWeight: 500 }}>{statusText}</span>
        </div>

        {/* Voice badge */}
        {voiceName && (
          <div style={{ fontSize: 10, color: "#334155", zIndex: 1 }}>
            Voice: <span style={{ color: "#475569" }}>{voiceName}</span>
          </div>
        )}

        {/* Transcript live preview */}
        {transcript && <TranscriptTicker text={transcript} />}

        {/* Mic button */}
        <button
          onClick={
            orbState === "thinking" ? undefined :
            orbState === "speaking" ? stopSpeaking :
            isListening             ? undefined   : startListening
          }
          disabled={orbState === "thinking"}
          style={{
            width: 80, height: 80, borderRadius: "50%", border: "none",
            cursor: orbState === "thinking" ? "not-allowed" : "pointer",
            background:
              isListening      ? "linear-gradient(135deg, #10b981, #059669)" :
              orbState === "speaking" ? "linear-gradient(135deg, #f43f5e, #be123c)" :
              "linear-gradient(135deg, #0ea5e9, #0369a1)",
            boxShadow:
              isListening      ? "0 0 32px #10b98170, 0 4px 20px #10b98140" :
              orbState === "speaking" ? "0 0 32px #f43f5e70, 0 4px 20px #f43f5e40" :
              "0 0 32px #0ea5e970, 0 4px 20px #0ea5e940",
            fontSize: 28, transition: "all 0.25s ease",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1,
            transform: isListening ? "scale(1.08)" : "scale(1)",
          }}
        >
          {isListening ? "⏹" : orbState === "speaking" ? "⏸" : "🎙"}
        </button>

        <p style={{ color: "#334155", fontSize: 11, textAlign: "center", lineHeight: 1.6, zIndex: 1 }}>
          {isListening ? "Listening — speak now"
            : orbState === "speaking" ? "Tap to interrupt"
            : orbState === "thinking" ? "Processing…"
            : "Tap to speak with ATLAS"}
        </p>

        {/* Error */}
        {error && (
          <div style={{
            background: "#1a0808", border: "1px solid #f43f5e40",
            borderRadius: 8, padding: "10px 12px",
            fontSize: 11, color: "#f87171", lineHeight: 1.6,
            width: "100%", zIndex: 1,
          }}>
            {error}
          </div>
        )}

        {/* Clear */}
        {messages.length > 0 && (
          <button onClick={clearConversation} style={{
            background: "transparent", border: "1px solid #1e293b",
            color: "#334155", fontSize: 11, padding: "6px 16px",
            borderRadius: 6, cursor: "pointer", width: "100%", zIndex: 1,
            transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#475569"; e.currentTarget.style.color = "#64748b"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.color = "#334155"; }}
          >
            Clear conversation
          </button>
        )}
      </div>

      {/* ── RIGHT: Conversation ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Empty state */}
          {messages.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ padding: "20px 24px", background: "#0a0f1a", border: "1px solid #1e293b", borderRadius: 12 }}>
                <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.8, margin: 0 }}>
                  Ask ATLAS anything about French P fertilizer markets, agronomy, OCP strategy, or competitive dynamics.
                  He speaks back to you and can search the web for live data.
                </p>
              </div>
              <p style={{ color: "#334155", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>Suggested questions</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {suggested.map((q, i) => (
                  <button key={i} onClick={() => askATLAS(q)}
                    style={{
                      background: "#0a0f1a", border: "1px solid #1e293b",
                      borderRadius: 10, padding: "13px 16px", textAlign: "left",
                      color: "#64748b", fontSize: 12, cursor: "pointer",
                      lineHeight: 1.6, transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#0ea5e950"; e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "#0ea5e908"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b";   e.currentTarget.style.color = "#64748b";  e.currentTarget.style.background = "#0a0f1a"; }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={i} className="atlas-msg" style={{
              display: "flex",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              gap: 12, alignItems: "flex-start",
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #1e293b, #0f172a)"
                  : "linear-gradient(135deg, #0ea5e9, #0369a1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "#fff",
                boxShadow: msg.role === "assistant" ? "0 0 14px #0ea5e940" : "none",
                border: msg.role === "user" ? "1px solid #1e293b" : "none",
              }}>
                {msg.role === "user" ? "U" : "A"}
              </div>

              <div style={{
                maxWidth: "74%",
                background: msg.role === "user" ? "#0f172a" : "#080d18",
                border: `1px solid ${msg.role === "user" ? "#1e293b" : "#0ea5e918"}`,
                borderRadius: msg.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                padding: "13px 17px",
              }}>
                {msg.role === "assistant" && (
                  <p style={{ color: "#0ea5e9", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7, fontWeight: 600 }}>ATLAS</p>
                )}
                <p style={{
                  color: msg.role === "user" ? "#94a3b8" : "#cbd5e1",
                  fontSize: 13, lineHeight: 1.8, margin: 0, whiteSpace: "pre-wrap",
                }}>
                  {msg.text}
                </p>
              </div>
            </div>
          ))}

          {/* Thinking dots */}
          {orbState === "thinking" && (
            <div className="atlas-msg" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "#fff",
                boxShadow: "0 0 14px #f59e0b50",
              }}>A</div>
              <div style={{
                background: "#080d18", border: "1px solid #f59e0b18",
                borderRadius: "4px 14px 14px 14px", padding: "16px 20px",
                display: "flex", gap: 6, alignItems: "center",
              }}>
                {[0, 1, 2].map(j => (
                  <div key={j} style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#f59e0b",
                    animation: `breathe 0.8s ease-in-out ${j * 0.18}s infinite alternate`,
                  }} />
                ))}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Text input */}
        <div style={{
          borderTop: "1px solid #1e293b",
          padding: "14px 32px",
          background: "#080d18",
          display: "flex", gap: 10,
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
              flex: 1, background: "#0f172a",
              border: "1px solid #1e293b", borderRadius: 10,
              padding: "11px 16px", color: "#e2e8f0",
              fontSize: 13, outline: "none",
              transition: "border-color 0.15s",
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
              border: "none", borderRadius: 10,
              padding: "11px 22px", color: "#fff",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              boxShadow: "0 2px 12px #0ea5e940",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px #0ea5e960"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 12px #0ea5e940"}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
