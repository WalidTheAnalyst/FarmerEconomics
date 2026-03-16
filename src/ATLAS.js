import { useState, useRef, useEffect, useCallback } from "react";

const API_KEY = process.env.REACT_APP_wld;

const SYSTEM_PROMPT = `You are ATLAS — the Phosphorus Intelligence Advisor embedded inside PhosStratOS, a strategic commercial decision tool built for OCP (Office Chérifien des Phosphates), the world's largest phosphate exporter, headquartered in Morocco.

Your name ATLAS is deliberate: OCP's phosphate reserves lie in and around the Atlas Mountain range of Morocco. You carry the weight of that knowledge.

YOUR ROLE:
You are a senior agronomic strategist and market intelligence officer. You speak with authority, precision, and brevity. You do not hedge unnecessarily. You answer like someone who has spent 15 years in phosphate markets and agronomy consulting — direct, confident, occasionally blunt.

YOUR KNOWLEDGE DOMAIN:
1. FRANCE AGRONOMY & MARKET:
   - P2O5 consumption: 226 kt (2023), down 44% from 2017. Only ~50% of parcels receive mineral P.
   - Agronomic gap: ~157 kt P2O5 vs Comifer recommendations. Addressable market 511 kt by 2030 if 70% gap closed.
   - Product mix 2023: NPK/NP 66kt, DAP/MAP 55kt, PK 43kt, TSP 25kt, Other 33kt — all declining.
   - Import origins (DAP/MAP, 2024): Morocco 69.4kt (~62%), Russia 13kt, Egypt 11.5kt, Tunisia 2kt.
   - Distribution: 70% through cooperatives (Inoxa, Area, Axereal). 25% retailers. 5% marketplaces.
   - Key ports: Rouen, La Pallice, Bordeaux.
   - Farm structure: ~390k farms, avg 69 ha. 43% of operators over 55. ~75% of land under lease (bail rural 9-year).
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
   - In calcareous soils (pH > 7.5): Ca2+ precipitates MAP phosphate within hours. TSP maintains lower pH microzone.
   - NH4+ in blends suppresses root P uptake early season. Separation removes this interference.
   - Separation benefit: Spain Wheat +$32/ha, Morocco Wheat +$45/ha, Brazil Maize +$58/ha, Australia Wheat $0/ha.

4. OCP STRATEGIC POSITIONING:
   - OCP is the world's largest phosphate exporter. Mines in Khouribga and Youssoufia beneath the Atlas Mountains.
   - Morocco's P rock is low-cadmium — competitive advantage as EU tightens Cd limits.
   - TSP market entry in France requires co-design with cooperative purchasing groups, not direct farmer sales.
   - Key coops to target: Inoxa, Area, Axereal, InVivo group.

5. FARMER OWNERSHIP & BEHAVIOR:
   - Farm size bimodal: 38% under 20ha, 28% over 100ha. The >100ha segment drives fertilizer volume.
   - GAEC/EARL collective structures: ~30% of farms. More professional, more responsive to agronomy.
   - Generational transfer: 150-180k farms changing hands next 10-15 years.
   - Purchase timing: farmers buy P in Q3. Importers position TSP Q3-Q4, DAP Q4-Q1.

STYLE RULES:
- Be concise. Maximum 4-5 sentences for most answers.
- Never say "I think" or "I believe" — state facts and recommendations directly.
- Use numbers when you have them.
- Always respond in the same language the user spoke in (French or English).
- End strategic recommendations with a single sharp "Bottom line:" sentence.
- ONLY use web search when the question explicitly asks for live/current data (prices today, recent news, latest reports). For all agronomic, strategic, and market structure questions, answer directly from your knowledge — do not search.
- Never say "I think" or "I believe" — state facts and recommendations directly.
- Use numbers when you have them.
- Always respond in the same language the user spoke in (French or English).
- End strategic recommendations with a single sharp "Bottom line:" sentence.`;

// ── Pick best available voice ─────────────────────────────────────────────────
function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const preferred = [
    "Google UK English Male",
    "Google US English",
    "Daniel", "Alex", "Arthur", "Samantha",
    "Google UK English Female",
  ];
  for (const name of preferred) {
    const v = voices.find(v => v.name === name);
    if (v) return v;
  }
  return (
    voices.find(v => v.lang === "en-GB") ||
    voices.find(v => v.lang === "en-US") ||
    voices.find(v => v.lang.startsWith("en")) ||
    voices[0]
  );
}

// ── FACE CANVAS ───────────────────────────────────────────────────────────────
// state: "idle" | "listening" | "thinking" | "speaking"
// audioLevel: ref 0-1 driving mouth open amount
function AtlasFace({ state, audioLevel, size = 220 }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const tRef      = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    // All draw code uses logical 220x220 coords; ctx.scale handles sizing
    const sc = W / 220;
    const cx = 110;
    const cy = 110;

    // Color themes per state
    const theme = {
      idle:      { face: "#0ea5e9", faceD: "#0369a1", glow: "#0ea5e9", eye: "#ffffff", mouth: "#ffffff" },
      listening: { face: "#10b981", faceD: "#047857", glow: "#10b981", eye: "#ffffff", mouth: "#ffffff" },
      thinking:  { face: "#f59e0b", faceD: "#b45309", glow: "#f59e0b", eye: "#ffffff", mouth: "#ffffff" },
      speaking:  { face: "#818cf8", faceD: "#4f46e5", glow: "#818cf8", eye: "#ffffff", mouth: "#ffffff" },
    };

    function drawFrame() {
      tRef.current += 0.022;
      const t   = tRef.current;
      const lvl = Math.min(1, audioLevel?.current ?? 0);
      const col = theme[state] || theme.idle;

      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.scale(sc, sc);

      // ── 1. Outer wave rings (always present, more active when speaking/listening) ──
      const ringCount = state === "speaking" ? 4 : state === "listening" ? 3 : 2;
      for (let r = 0; r < ringCount; r++) {
        const pts   = 120;
        const baseR = 82 + r * 18;
        const amp   = (state === "speaking" ? 6 + lvl * 16 : state === "listening" ? 4 + lvl * 8 : 2) - r * 1.5;
        const speed = 1.2 + r * 0.4;
        const alpha = (0.22 - r * 0.04) * (state === "idle" ? 0.5 : 1);

        ctx.beginPath();
        for (let i = 0; i <= pts; i++) {
          const a = (i / pts) * Math.PI * 2;
          const wave =
            Math.sin(a * 6 + t * speed) * amp * 0.5 +
            Math.sin(a * 4 - t * speed * 1.3) * amp * 0.35 +
            Math.sin(a * 9 + t * speed * 0.7) * amp * 0.15;
          const rad = baseR + wave;
          const x   = cx + rad * Math.cos(a);
          const y   = cy + rad * Math.sin(a);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = col.glow + Math.floor(alpha * 255).toString(16).padStart(2, "0");
        ctx.lineWidth   = 1.8 - r * 0.3;
        ctx.stroke();
      }

      // ── 2. Glow halo behind face ──
      const haloR  = 60 + lvl * 8;
      const halo   = ctx.createRadialGradient(cx, cy, haloR * 0.3, cx, cy, haloR + 20);
      halo.addColorStop(0, col.glow + "30");
      halo.addColorStop(1, col.glow + "00");
      ctx.beginPath();
      ctx.arc(cx, cy, haloR + 20, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

      // ── 3. Face circle (slightly morphing blob) ──
      const faceR  = 52 + Math.sin(t * 0.9) * 1.5;
      const faceGrad = ctx.createRadialGradient(cx - 10, cy - 12, 6, cx, cy, faceR + 8);
      faceGrad.addColorStop(0, col.face);
      faceGrad.addColorStop(1, col.faceD);
      ctx.beginPath();
      ctx.arc(cx, cy, faceR, 0, Math.PI * 2);
      ctx.fillStyle   = faceGrad;
      ctx.shadowColor = col.glow;
      ctx.shadowBlur  = 20 + lvl * 20;
      ctx.fill();
      ctx.shadowBlur  = 0;

      // Face border
      ctx.beginPath();
      ctx.arc(cx, cy, faceR, 0, Math.PI * 2);
      ctx.strokeStyle = "#ffffff15";
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      // ── 4. Eyes ──
      const eyeY    = cy - 12;
      const eyeOffX = 14;
      const blink   = Math.abs(Math.sin(t * 0.7)) > 0.97; // rare blink

      if (state === "thinking") {
        // Thinking eyes — small dots moving left-right
        const shift = Math.sin(t * 3) * 4;
        [-1, 1].forEach(side => {
          ctx.beginPath();
          ctx.arc(cx + side * eyeOffX + shift * side, eyeY, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = col.eye + "dd";
          ctx.fill();
          // pupil
          ctx.beginPath();
          ctx.arc(cx + side * eyeOffX + shift * side + 1, eyeY + 1, 2, 0, Math.PI * 2);
          ctx.fillStyle = "#00000060";
          ctx.fill();
        });
      } else {
        // Normal eyes
        [-1, 1].forEach(side => {
          if (blink) {
            // Blink: thin line
            ctx.beginPath();
            ctx.ellipse(cx + side * eyeOffX, eyeY, 5, 1.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = col.eye + "cc";
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(cx + side * eyeOffX, eyeY, 5, 0, Math.PI * 2);
            ctx.fillStyle = col.eye;
            ctx.fill();
            // pupil
            ctx.beginPath();
            ctx.arc(cx + side * eyeOffX + 1.2, eyeY + 1.2, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = "#00000070";
            ctx.fill();
            // shine
            ctx.beginPath();
            ctx.arc(cx + side * eyeOffX - 1, eyeY - 1.5, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff90";
            ctx.fill();
          }
        });
      }

      // ── 5. Mouth ──
      const mouthCX = cx;
      const mouthCY = cy + 16;
      const mouthW  = 22;

      if (state === "speaking") {
        // Open mouth — height driven by audio level + natural flutter
        const flutter   = Math.abs(Math.sin(t * 14)) * 0.3 + Math.abs(Math.sin(t * 9.3)) * 0.2;
        const openH     = 4 + (lvl + flutter) * 14;
        const openH_top = openH * 0.6;

        // Outer lip (dark)
        ctx.beginPath();
        ctx.ellipse(mouthCX, mouthCY, mouthW, openH + 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#00000050";
        ctx.fill();

        // Inner mouth (dark cavity)
        ctx.beginPath();
        ctx.ellipse(mouthCX, mouthCY + 1, mouthW - 3, openH, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#0a0010";
        ctx.fill();

        // Upper lip
        ctx.beginPath();
        ctx.ellipse(mouthCX, mouthCY - openH_top + 1, mouthW, 4, 0, Math.PI, Math.PI * 2);
        ctx.fillStyle = "#ffffffcc";
        ctx.fill();

        // Lower lip
        ctx.beginPath();
        ctx.ellipse(mouthCX, mouthCY + openH - openH_top - 1, mouthW, 5, 0, 0, Math.PI);
        ctx.fillStyle = "#ffffffaa";
        ctx.fill();

      } else if (state === "listening") {
        // Slightly open "o" — attentive
        ctx.beginPath();
        ctx.ellipse(mouthCX, mouthCY, 10, 6, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#00000060";
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(mouthCX, mouthCY, 8, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#0a0010";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(mouthCX, mouthCY, 8, 0, Math.PI * 2);
        ctx.strokeStyle = "#ffffffaa";
        ctx.lineWidth = 1.5;
        ctx.stroke();

      } else if (state === "thinking") {
        // Wavy thinking mouth
        ctx.beginPath();
        ctx.moveTo(mouthCX - mouthW, mouthCY);
        for (let i = 0; i <= 20; i++) {
          const x   = mouthCX - mouthW + (i / 20) * mouthW * 2;
          const y   = mouthCY + Math.sin(i * 0.7 + t * 4) * 4;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = col.eye + "cc";
        ctx.lineWidth   = 2.5;
        ctx.lineCap     = "round";
        ctx.stroke();

      } else {
        // IDLE — gentle closed smile
        const smileY = mouthCY;
        ctx.beginPath();
        ctx.moveTo(mouthCX - mouthW, smileY);
        ctx.quadraticCurveTo(mouthCX, smileY + 10 + Math.sin(t * 0.8) * 1.5, mouthCX + mouthW, smileY);
        ctx.strokeStyle = col.eye + "cc";
        ctx.lineWidth   = 2.8;
        ctx.lineCap     = "round";
        ctx.stroke();
      }

      // ── 6. Thinking: rotating dots above head ──
      if (state === "thinking") {
        for (let i = 0; i < 3; i++) {
          const a = t * 2.5 + (i / 3) * Math.PI * 2;
          const r = 12;
          const x = cx + r * Math.cos(a);
          const y = (cy - faceR - 14) + r * 0.4 * Math.sin(a);
          const s = 2.5 + Math.sin(a) * 1;
          ctx.beginPath();
          ctx.arc(x, y, s, 0, Math.PI * 2);
          ctx.fillStyle = col.glow + "cc";
          ctx.fill();
        }
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(drawFrame);
    }

    rafRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [state, audioLevel]);

  return (
    <canvas
      ref={canvasRef}
      width={size} height={size}
      style={{ width: size, height: size, filter: `drop-shadow(0 0 24px ${
        state === "speaking" ? "rgba(129,140,248,0.5)" :
        state === "listening" ? "rgba(16,185,129,0.5)" :
        state === "thinking"  ? "rgba(245,158,11,0.5)" :
        "rgba(14,165,233,0.4)"
      })` }}
    />
  );
}

// ── Main ATLAS component ──────────────────────────────────────────────────────
export default function ATLASPage() {
  const [orbState,    setOrbState]    = useState("idle");
  const [transcript,  setTranscript]  = useState("");
  const [messages,    setMessages]    = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [statusText,  setStatusText]  = useState("Press the button and speak");
  const [error,       setError]       = useState(null);
  const [voiceName,   setVoiceName]   = useState("");

  const recognitionRef  = useRef(null);
  const convHistoryRef  = useRef([]);
  const messagesEndRef  = useRef(null);
  const audioLevelRef   = useRef(0);
  const isSpeakingRef   = useRef(false); // track if currently speaking for interrupt

  useEffect(() => {
    const load = () => { const v = pickVoice(); if (v) setVoiceName(v.name); };
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const prevListening = useRef(false);
  useEffect(() => {
    if (prevListening.current && !isListening && transcript.trim()) {
      askATLAS(transcript.trim());
      setTranscript("");
    }
    prevListening.current = isListening;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening]);

  // ── speakText ──────────────────────────────────────────────────────────────
  const speakText = useCallback((text) => {
    window.speechSynthesis.cancel();
    isSpeakingRef.current = true;

    const clean = text.replace(/[*_#`]/g, "").replace(/\n+/g, ". ");
    const voice = pickVoice();

    // Animate mouth level
    let frame = 0;
    const animLevel = () => {
      if (!isSpeakingRef.current) { audioLevelRef.current = 0; return; }
      frame++;
      audioLevelRef.current =
        0.25 +
        Math.abs(Math.sin(frame * 0.15)) * 0.3 +
        Math.abs(Math.sin(frame * 0.38)) * 0.2 +
        Math.random() * 0.12;
      requestAnimationFrame(animLevel);
    };

    // Done handler
    const onDone = () => {
      if (!isSpeakingRef.current) return;
      isSpeakingRef.current  = false;
      audioLevelRef.current  = 0;
      setOrbState("idle");
      setStatusText("Press the button and speak");
    };

    // Chunk into sentences to fix Chrome cutoff bug
    const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
    let idx = 0;

    setOrbState("speaking");
    setStatusText("Speaking…");
    requestAnimationFrame(animLevel);

    const next = () => {
      if (!isSpeakingRef.current || idx >= sentences.length) { onDone(); return; }
      const u    = new SpeechSynthesisUtterance(sentences[idx++].trim());
      u.rate     = 1.05;   // natural pace — not too slow, not rushed
      u.pitch    = 0.95;
      u.volume   = 1;
      if (voice) u.voice = voice;
      u.onend    = next;
      u.onerror  = next;
      window.speechSynthesis.speak(u);
    };
    next();
  }, []);

  // ── askATLAS ───────────────────────────────────────────────────────────────
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
          tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 1 }],
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

  // ── Interrupt: stop speaking immediately ───────────────────────────────────
  const interrupt = useCallback(() => {
    isSpeakingRef.current = false;
    audioLevelRef.current = 0;
    window.speechSynthesis.cancel();
    setOrbState("idle");
    setStatusText("Press the button and speak");
  }, []);

  const startListening = useCallback(() => {
    if (isListening || orbState === "thinking") return;
    interrupt(); // stop speaking if active
    setError(null);
    try { recognitionRef.current?.start(); }
    catch { setStatusText("Could not start mic — try again"); }
  }, [isListening, orbState, interrupt]);

  const clearConversation = useCallback(() => {
    interrupt();
    setMessages([]);
    convHistoryRef.current = [];
    setOrbState("idle");
    setStatusText("Press the button and speak");
    setError(null);
    setTranscript("");
  }, [interrupt]);

  const stateColor = {
    idle:      "#0ea5e9",
    listening: "#10b981",
    thinking:  "#f59e0b",
    speaking:  "#818cf8",
  };

  const suggested = [
    "What's the separation opportunity for wheat in Champagne?",
    "Which farmer segment should OCP prioritize first in France?",
    "How does OCP's cadmium profile compare to Russian competition?",
    "What's the commercial case for TSP vs MAP in French cereals?",
    "What are the latest phosphate price trends?",
    "How does the cooperative channel work in France?",
  ];

  // ── Reusable sub-components ────────────────────────────────────────────────
  const MicButton = ({ size = 76 }) => (
    <button
      onClick={
        orbState === "thinking" ? undefined :
        orbState === "speaking" ? interrupt :
        isListening             ? undefined : startListening
      }
      disabled={orbState === "thinking"}
      style={{
        width: size, height: size, borderRadius: "50%", border: "none",
        cursor: orbState === "thinking" ? "not-allowed" : "pointer",
        background:
          isListening             ? "linear-gradient(135deg,#10b981,#047857)" :
          orbState === "speaking" ? "linear-gradient(135deg,#f43f5e,#be123c)" :
          "linear-gradient(135deg,#0ea5e9,#0369a1)",
        boxShadow:
          isListening             ? `0 0 28px #10b98166,0 4px 16px #10b98133` :
          orbState === "speaking" ? `0 0 28px #f43f5e66,0 4px 16px #f43f5e33` :
          `0 0 28px #0ea5e966,0 4px 16px #0ea5e933`,
        fontSize: size * 0.34, transition: "all 0.2s",
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: isListening ? "scale(1.1)" : "scale(1)",
        flexShrink: 0,
      }}
    >
      {isListening ? "⏹" : orbState === "speaking" ? "⏸" : "🎙"}
    </button>
  );

  const StatusPill = () => (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      padding: "4px 12px", borderRadius: 20,
      background: stateColor[orbState] + "12",
      border: `1px solid ${stateColor[orbState]}35`,
    }}>
      <div style={{
        width: 6, height: 6, borderRadius: "50%",
        background: stateColor[orbState],
        animation: orbState !== "idle" ? "pulse 1.2s ease-in-out infinite" : "none",
      }} />
      <span style={{ fontSize: 11, color: stateColor[orbState], fontWeight: 500 }}>{statusText}</span>
    </div>
  );

  const MessageList = ({ mobilePad = false }) => (
    <div style={{ flex: 1, overflowY: "auto", padding: mobilePad ? "16px 16px" : "28px 30px", display: "flex", flexDirection: "column", gap: 16 }}>
      {messages.length === 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ padding: "14px 16px", background: "#0a0f1a", border: "1px solid #1e293b", borderRadius: 12 }}>
            <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
              Ask ATLAS anything about French P fertilizer markets, agronomy, OCP strategy, or competitive dynamics. He speaks back and can search the web for live data.
            </p>
          </div>
          <p style={{ color: "#334155", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>Suggested questions</p>
          <div style={{ display: "grid", gridTemplateColumns: mobilePad ? "1fr" : "1fr 1fr", gap: 8 }}>
            {suggested.map((q, i) => (
              <button key={i} onClick={() => askATLAS(q)}
                style={{
                  background: "#0a0f1a", border: "1px solid #1e293b",
                  borderRadius: 10, padding: "11px 14px", textAlign: "left",
                  color: "#64748b", fontSize: 12, cursor: "pointer", lineHeight: 1.6,
                  transition: "all 0.18s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#0ea5e940"; e.currentTarget.style.color = "#94a3b8"; e.currentTarget.style.background = "#0ea5e908"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b";   e.currentTarget.style.color = "#64748b";  e.currentTarget.style.background = "#0a0f1a"; }}
              >{q}</button>
            ))}
          </div>
        </div>
      )}

      {messages.map((msg, i) => (
        <div key={i} className="atlas-msg" style={{
          display: "flex",
          flexDirection: msg.role === "user" ? "row-reverse" : "row",
          gap: 10, alignItems: "flex-start",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
            background: msg.role === "user" ? "linear-gradient(135deg,#1e293b,#0f172a)" : "linear-gradient(135deg,#818cf8,#4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "#fff",
            boxShadow: msg.role === "assistant" ? "0 0 12px #818cf840" : "none",
            border: msg.role === "user" ? "1px solid #1e293b" : "none",
          }}>
            {msg.role === "user" ? "U" : "A"}
          </div>
          <div style={{
            maxWidth: mobilePad ? "85%" : "74%",
            background: msg.role === "user" ? "#0f172a" : "#080d18",
            border: `1px solid ${msg.role === "user" ? "#1e293b" : "#818cf820"}`,
            borderRadius: msg.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
            padding: "11px 14px",
          }}>
            {msg.role === "assistant" && (
              <p style={{ color: "#818cf8", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, fontWeight: 600 }}>ATLAS</p>
            )}
            <p style={{ color: msg.role === "user" ? "#94a3b8" : "#cbd5e1", fontSize: 13, lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap" }}>
              {msg.text}
            </p>
          </div>
        </div>
      ))}

      {orbState === "thinking" && (
        <div className="atlas-msg" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", boxShadow: "0 0 12px #f59e0b50" }}>A</div>
          <div style={{ background: "#080d18", border: "1px solid #f59e0b18", borderRadius: "4px 14px 14px 14px", padding: "14px 16px", display: "flex", gap: 5, alignItems: "center" }}>
            {[0,1,2].map(j => <div key={j} style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", animation: `pulse 0.9s ease-in-out ${j*0.2}s infinite` }} />)}
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );

  const TextInput = ({ mobilePad = false }) => {
    const inputRef = useRef(null);
    const send = () => {
      if (inputRef.current?.value.trim()) {
        askATLAS(inputRef.current.value.trim());
        inputRef.current.value = "";
      }
    };
    return (
      <div style={{ borderTop: "1px solid #1e293b", padding: mobilePad ? "10px 14px" : "13px 30px", background: "#080d18", display: "flex", gap: 8 }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a question…"
          onKeyDown={e => { if (e.key === "Enter") send(); }}
          style={{
            flex: 1, background: "#0f172a", border: "1px solid #1e293b",
            borderRadius: 10, padding: "10px 14px", color: "#e2e8f0",
            fontSize: 13, outline: "none", transition: "border-color 0.15s",
          }}
          onFocus={e => e.target.style.borderColor = "#818cf8"}
          onBlur={e  => e.target.style.borderColor = "#1e293b"}
        />
        <button onClick={send}
          style={{
            background: "linear-gradient(135deg,#818cf8,#4f46e5)",
            border: "none", borderRadius: 10, padding: "10px 18px",
            color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 2px 12px #818cf830",
          }}
        >Send</button>
      </div>
    );
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: "#060d1a", overflow: "hidden" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse  { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .atlas-msg        { animation: fadeUp 0.3s ease forwards; }

        /* ── DESKTOP layout ── */
        .atlas-root {
          display: flex;
          flex-direction: row;
          height: calc(100vh - 108px);
        }
        .atlas-left {
          width: 300px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 28px 20px 20px;
          gap: 14px;
          border-right: 1px solid #1e293b;
          background: linear-gradient(180deg,#0a0f1a 0%,#060b14 100%);
          position: relative;
          overflow: hidden;
          overflow-y: auto;
        }
        .atlas-right {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .atlas-mobile-header { display: none; }

        /* ── MOBILE layout (≤ 640px) ── */
        @media (max-width: 640px) {
          .atlas-root {
            flex-direction: column;
            height: calc(100dvh - 56px);
          }
          .atlas-left { display: none; }
          .atlas-right { flex: 1; overflow: hidden; }
          .atlas-mobile-header {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 12px;
            padding: 10px 14px;
            background: linear-gradient(90deg,#0a0f1a,#060b14);
            border-bottom: 1px solid #1e293b;
            flex-shrink: 0;
          }
        }
      `}</style>

      <div className="atlas-root">

        {/* ── DESKTOP LEFT PANEL ── */}
        <div className="atlas-left">
          <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "linear-gradient(#0ea5e9 1px,transparent 1px),linear-gradient(90deg,#0ea5e9 1px,transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <AtlasFace state={orbState} audioLevel={audioLevelRef} />
          </div>

          <div style={{ textAlign: "center", zIndex: 1, marginTop: -6 }}>
            <p style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>ATLAS</p>
            <p style={{ color: "#334155", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", marginTop: 2 }}>Phosphorus Intelligence Advisor</p>
          </div>

          <div style={{ zIndex: 1 }}><StatusPill /></div>

          {voiceName && <p style={{ color: "#334155", fontSize: 10, zIndex: 1 }}>Voice: <span style={{ color: "#475569" }}>{voiceName}</span></p>}

          {transcript && (
            <div style={{ background: "#0f172a", border: "1px solid #10b98130", borderRadius: 8, padding: "7px 12px", fontSize: 11, color: "#10b981", fontStyle: "italic", maxWidth: "100%", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", zIndex: 1 }}>
              "{transcript}"
            </div>
          )}

          <div style={{ zIndex: 1 }}><MicButton size={76} /></div>

          <p style={{ color: "#334155", fontSize: 11, textAlign: "center", zIndex: 1 }}>
            {isListening ? "Listening — speak now" : orbState === "speaking" ? "Tap to interrupt ATLAS" : orbState === "thinking" ? "Processing…" : "Tap mic to speak with ATLAS"}
          </p>

          {error && <div style={{ background: "#1a0808", border: "1px solid #f43f5e30", borderRadius: 8, padding: "9px 12px", fontSize: 11, color: "#f87171", lineHeight: 1.6, width: "100%", zIndex: 1 }}>{error}</div>}

          {messages.length > 0 && (
            <button onClick={clearConversation} style={{ background: "transparent", border: "1px solid #1e293b", color: "#334155", fontSize: 11, padding: "6px 0", borderRadius: 6, cursor: "pointer", width: "100%", zIndex: 1 }}
              onMouseEnter={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#334155"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#334155"; e.currentTarget.style.borderColor = "#1e293b"; }}
            >Clear conversation</button>
          )}
        </div>

        {/* ── MOBILE TOP BAR (hidden on desktop) ── */}
        <div className="atlas-mobile-header">
          {/* Mini face */}
          <AtlasFace state={orbState} audioLevel={audioLevelRef} size={80} />

          {/* Name + status */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>ATLAS</p>
            <StatusPill />
            {transcript && <p style={{ color: "#10b981", fontSize: 11, fontStyle: "italic", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{transcript}"</p>}
            {error && <p style={{ color: "#f87171", fontSize: 11, marginTop: 4 }}>{error}</p>}
          </div>

          {/* Mic button */}
          <MicButton size={52} />

          {/* Clear */}
          {messages.length > 0 && (
            <button onClick={clearConversation} style={{ background: "transparent", border: "1px solid #1e293b", color: "#475569", fontSize: 11, padding: "6px 10px", borderRadius: 6, cursor: "pointer", flexShrink: 0 }}>Clear</button>
          )}
        </div>

        {/* ── RIGHT / MAIN CONTENT ── */}
        <div className="atlas-right">
          <MessageList mobilePad={false} />
          <TextInput mobilePad={false} />
        </div>

      </div>
    </div>
  );
}
