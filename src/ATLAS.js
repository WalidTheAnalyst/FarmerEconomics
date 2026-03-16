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
- ONLY use web search when the question explicitly asks for live/current data (prices today, recent news, latest reports). For all agronomic, strategic, and market structure questions, answer directly from your knowledge — do not search.`;

// ── Pick best available voice ─────────────────────────────────────────────────
function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  // Strict English-only list — best natural voices first
  const preferred = [
    "Daniel",                  // macOS / iOS — best quality
    "Arthur",                  // macOS Ventura+
    "Alex",                    // macOS
    "Google UK English Male",  // Chrome desktop
    "Google US English",       // Chrome desktop
    "Samantha",                // iOS
    "Karen",                   // iOS AU
    "Moira",                   // iOS IE
    "Google UK English Female",
  ];
  for (const name of preferred) {
    const v = voices.find(v => v.name === name);
    if (v) return v;
  }
  // Fallback: any English voice — NEVER fall through to non-English
  return (
    voices.find(v => v.lang === "en-GB") ||
    voices.find(v => v.lang === "en-US") ||
    voices.find(v => v.lang === "en-AU") ||
    voices.find(v => v.lang.startsWith("en"))
    // deliberately no voices[0] fallback — if no English voice, return null
  ) || null;
}

// ── FACE CANVAS ───────────────────────────────────────────────────────────────
function AtlasFace({ state, audioLevel, size = 220 }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const tRef      = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W   = canvas.width;
    const sc  = W / 220;
    const cx  = 110;
    const cy  = 110;

    const theme = {
      idle:      { face: "#0ea5e9", faceD: "#0369a1", glow: "#0ea5e9", eye: "#ffffff" },
      listening: { face: "#10b981", faceD: "#047857", glow: "#10b981", eye: "#ffffff" },
      thinking:  { face: "#f59e0b", faceD: "#b45309", glow: "#f59e0b", eye: "#ffffff" },
      speaking:  { face: "#818cf8", faceD: "#4f46e5", glow: "#818cf8", eye: "#ffffff" },
    };

    function draw() {
      tRef.current += 0.022;
      const t   = tRef.current;
      const lvl = Math.min(1, audioLevel?.current ?? 0);
      const col = theme[state] || theme.idle;

      ctx.clearRect(0, 0, W, W);
      ctx.save();
      ctx.scale(sc, sc);

      // Wave rings
      const ringCount = state === "speaking" ? 4 : state === "listening" ? 3 : 2;
      for (let r = 0; r < ringCount; r++) {
        const baseR = 82 + r * 18;
        const amp   = ((state === "speaking" ? 6 + lvl * 16 : state === "listening" ? 4 + lvl * 8 : 2) - r * 1.5);
        const speed = 1.2 + r * 0.4;
        const alpha = (0.22 - r * 0.04) * (state === "idle" ? 0.5 : 1);
        ctx.beginPath();
        for (let i = 0; i <= 120; i++) {
          const a    = (i / 120) * Math.PI * 2;
          const wave = Math.sin(a * 6 + t * speed) * amp * 0.5 + Math.sin(a * 4 - t * speed * 1.3) * amp * 0.35 + Math.sin(a * 9 + t * speed * 0.7) * amp * 0.15;
          const rad  = baseR + wave;
          i === 0 ? ctx.moveTo(cx + rad * Math.cos(a), cy + rad * Math.sin(a)) : ctx.lineTo(cx + rad * Math.cos(a), cy + rad * Math.sin(a));
        }
        ctx.closePath();
        ctx.strokeStyle = col.glow + Math.floor(alpha * 255).toString(16).padStart(2, "0");
        ctx.lineWidth   = 1.8 - r * 0.3;
        ctx.stroke();
      }

      // Glow halo
      const haloR = 60 + lvl * 8;
      const halo  = ctx.createRadialGradient(cx, cy, haloR * 0.3, cx, cy, haloR + 20);
      halo.addColorStop(0, col.glow + "30"); halo.addColorStop(1, col.glow + "00");
      ctx.beginPath(); ctx.arc(cx, cy, haloR + 20, 0, Math.PI * 2);
      ctx.fillStyle = halo; ctx.fill();

      // Face circle
      const faceR    = 52 + Math.sin(t * 0.9) * 1.5;
      const faceGrad = ctx.createRadialGradient(cx - 10, cy - 12, 6, cx, cy, faceR + 8);
      faceGrad.addColorStop(0, col.face); faceGrad.addColorStop(1, col.faceD);
      ctx.beginPath(); ctx.arc(cx, cy, faceR, 0, Math.PI * 2);
      ctx.fillStyle = faceGrad; ctx.shadowColor = col.glow; ctx.shadowBlur = 20 + lvl * 20; ctx.fill();
      ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(cx, cy, faceR, 0, Math.PI * 2);
      ctx.strokeStyle = "#ffffff15"; ctx.lineWidth = 1.5; ctx.stroke();

      // Eyes
      const eyeY = cy - 12; const eyeOffX = 14;
      const blink = Math.abs(Math.sin(t * 0.7)) > 0.97;
      if (state === "thinking") {
        const shift = Math.sin(t * 3) * 4;
        [-1, 1].forEach(side => {
          ctx.beginPath(); ctx.arc(cx + side * eyeOffX + shift * side, eyeY, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = col.eye + "dd"; ctx.fill();
          ctx.beginPath(); ctx.arc(cx + side * eyeOffX + shift * side + 1, eyeY + 1, 2, 0, Math.PI * 2);
          ctx.fillStyle = "#00000060"; ctx.fill();
        });
      } else {
        [-1, 1].forEach(side => {
          if (blink) {
            ctx.beginPath(); ctx.ellipse(cx + side * eyeOffX, eyeY, 5, 1.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = col.eye + "cc"; ctx.fill();
          } else {
            ctx.beginPath(); ctx.arc(cx + side * eyeOffX, eyeY, 5, 0, Math.PI * 2);
            ctx.fillStyle = col.eye; ctx.fill();
            ctx.beginPath(); ctx.arc(cx + side * eyeOffX + 1.2, eyeY + 1.2, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = "#00000070"; ctx.fill();
            ctx.beginPath(); ctx.arc(cx + side * eyeOffX - 1, eyeY - 1.5, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff90"; ctx.fill();
          }
        });
      }

      // Mouth
      const mouthCX = cx; const mouthCY = cy + 16; const mouthW = 22;
      if (state === "speaking") {
        const flutter = Math.abs(Math.sin(t * 14)) * 0.3 + Math.abs(Math.sin(t * 9.3)) * 0.2;
        const openH   = 4 + (lvl + flutter) * 14;
        const topH    = openH * 0.6;
        ctx.beginPath(); ctx.ellipse(mouthCX, mouthCY, mouthW, openH + 2, 0, 0, Math.PI * 2); ctx.fillStyle = "#00000050"; ctx.fill();
        ctx.beginPath(); ctx.ellipse(mouthCX, mouthCY + 1, mouthW - 3, openH, 0, 0, Math.PI * 2); ctx.fillStyle = "#0a0010"; ctx.fill();
        ctx.beginPath(); ctx.ellipse(mouthCX, mouthCY - topH + 1, mouthW, 4, 0, Math.PI, Math.PI * 2); ctx.fillStyle = "#ffffffcc"; ctx.fill();
        ctx.beginPath(); ctx.ellipse(mouthCX, mouthCY + openH - topH - 1, mouthW, 5, 0, 0, Math.PI); ctx.fillStyle = "#ffffffaa"; ctx.fill();
      } else if (state === "listening") {
        ctx.beginPath(); ctx.ellipse(mouthCX, mouthCY, 10, 6, 0, 0, Math.PI * 2); ctx.fillStyle = "#00000060"; ctx.fill();
        ctx.beginPath(); ctx.ellipse(mouthCX, mouthCY, 8, 4, 0, 0, Math.PI * 2); ctx.fillStyle = "#0a0010"; ctx.fill();
        ctx.beginPath(); ctx.arc(mouthCX, mouthCY, 8, 0, Math.PI * 2); ctx.strokeStyle = "#ffffffaa"; ctx.lineWidth = 1.5; ctx.stroke();
      } else if (state === "thinking") {
        // Wavy mouth
        ctx.beginPath(); ctx.moveTo(mouthCX - mouthW, mouthCY);
        for (let i = 0; i <= 20; i++) ctx.lineTo(mouthCX - mouthW + (i / 20) * mouthW * 2, mouthCY + Math.sin(i * 0.7 + t * 4) * 4);
        ctx.strokeStyle = col.eye + "cc"; ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.stroke();

        // ── Brain above the face ──
        const brainX  = cx;
        const brainY  = cy - faceR - 30;
        const brainR  = 18;

        // Brain glow
        const brainGlow = ctx.createRadialGradient(brainX, brainY, 2, brainX, brainY, brainR + 10);
        brainGlow.addColorStop(0, col.glow + "50");
        brainGlow.addColorStop(1, col.glow + "00");
        ctx.beginPath(); ctx.arc(brainX, brainY, brainR + 10, 0, Math.PI * 2);
        ctx.fillStyle = brainGlow; ctx.fill();

        // Brain left lobe
        ctx.beginPath();
        ctx.arc(brainX - 5, brainY - 2, brainR * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = col.face + "cc"; ctx.fill();
        ctx.strokeStyle = col.eye + "80"; ctx.lineWidth = 1; ctx.stroke();

        // Brain right lobe
        ctx.beginPath();
        ctx.arc(brainX + 5, brainY - 2, brainR * 0.65, 0, Math.PI * 2);
        ctx.fillStyle = col.faceD + "cc"; ctx.fill();
        ctx.strokeStyle = col.eye + "80"; ctx.lineWidth = 1; ctx.stroke();

        // Brain fold lines
        ctx.strokeStyle = col.eye + "50"; ctx.lineWidth = 1.5; ctx.lineCap = "round";
        [[brainX - 6, brainY - 8, brainX - 4, brainY + 2],
         [brainX - 10, brainY - 2, brainX - 8, brainY + 6],
         [brainX + 4, brainY - 7, brainX + 6, brainY + 2],
         [brainX + 8, brainY - 3, brainX + 10, brainY + 5]].forEach(([x1,y1,x2,y2]) => {
          ctx.beginPath(); ctx.moveTo(x1, y1); ctx.quadraticCurveTo((x1+x2)/2 - 3, (y1+y2)/2, x2, y2); ctx.stroke();
        });

        // Dividing groove
        ctx.beginPath(); ctx.moveTo(brainX, brainY - brainR * 0.6); ctx.lineTo(brainX, brainY + brainR * 0.4);
        ctx.strokeStyle = col.eye + "40"; ctx.lineWidth = 2; ctx.stroke();

        // Rotating orbit ring around brain
        const orbitR = brainR + 14;
        ctx.beginPath(); ctx.ellipse(brainX, brainY, orbitR, orbitR * 0.35, t * 0.8, 0, Math.PI * 2);
        ctx.strokeStyle = col.glow + "40"; ctx.lineWidth = 1; ctx.stroke();

        // Orbiting particles (ideas)
        const particles = [
          { speed: 1.4, offset: 0,             r: 3,   color: col.glow },
          { speed: 1.4, offset: Math.PI,        r: 2.5, color: "#f59e0b" },
          { speed: 0.9, offset: Math.PI * 0.5,  r: 2,   color: "#10b981" },
          { speed: 0.9, offset: Math.PI * 1.5,  r: 1.8, color: "#818cf8" },
        ];
        particles.forEach(p => {
          const angle = t * p.speed + p.offset;
          const px    = brainX + orbitR * Math.cos(angle);
          const py    = brainY + orbitR * 0.35 * Math.sin(angle) * Math.cos(t * 0.8) - orbitR * 0.35 * Math.cos(angle) * Math.sin(t * 0.8) * 0.4;
          // Glow trail
          const trail = ctx.createRadialGradient(px, py, 0, px, py, p.r * 3);
          trail.addColorStop(0, p.color + "80"); trail.addColorStop(1, p.color + "00");
          ctx.beginPath(); ctx.arc(px, py, p.r * 3, 0, Math.PI * 2); ctx.fillStyle = trail; ctx.fill();
          // Particle dot
          ctx.beginPath(); ctx.arc(px, py, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 6; ctx.fill();
          ctx.shadowBlur = 0;
        });

        // "..." thought bubble connector between brain and face
        const connX = cx; const connStartY = cy - faceR - 4;
        [4, 8, 12].forEach((offset, i) => {
          const dotY = connStartY - offset * 1.4;
          const dotR = 1.2 + i * 0.4;
          ctx.beginPath(); ctx.arc(connX, dotY, dotR, 0, Math.PI * 2);
          ctx.fillStyle = col.glow + "99"; ctx.fill();
        });

      } else {
        ctx.beginPath(); ctx.moveTo(mouthCX - mouthW, mouthCY);
        ctx.quadraticCurveTo(mouthCX, mouthCY + 10 + Math.sin(t * 0.8) * 1.5, mouthCX + mouthW, mouthCY);
        ctx.strokeStyle = col.eye + "cc"; ctx.lineWidth = 2.8; ctx.lineCap = "round"; ctx.stroke();
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [state, audioLevel]);

  return (
    <canvas ref={canvasRef} width={size} height={size}
      style={{ width: size, height: size, filter: `drop-shadow(0 0 ${size * 0.1}px ${
        state === "speaking" ? "rgba(129,140,248,0.5)" : state === "listening" ? "rgba(16,185,129,0.5)" : state === "thinking" ? "rgba(245,158,11,0.5)" : "rgba(14,165,233,0.4)"
      })` }}
    />
  );
}

// ── Live typewriter text (streams words as he speaks) ─────────────────────────
function LiveBubble({ text, isExpanded, onExpand, onCollapse, state }) {
  const [displayed, setDisplayed] = useState("");
  const [wordIdx,   setWordIdx]   = useState(0);
  const bubbleRef  = useRef(null);

  // Reset when new text arrives
  useEffect(() => {
    setDisplayed("");
    setWordIdx(0);
  }, [text]);

  // Stream words progressively when speaking
  useEffect(() => {
    if (state !== "speaking" || !text) return;
    const words = text.split(" ");
    if (wordIdx >= words.length) return;
    const timer = setTimeout(() => {
      setDisplayed(words.slice(0, wordIdx + 1).join(" "));
      setWordIdx(i => i + 1);
    }, 120); // ~120ms per word ≈ natural reading pace
    return () => clearTimeout(timer);
  }, [state, text, wordIdx]);

  // When done speaking, show full text
  useEffect(() => {
    if (state === "idle" && text) setDisplayed(text);
  }, [state, text]);

  // Auto-scroll bubble
  useEffect(() => {
    if (bubbleRef.current) bubbleRef.current.scrollTop = bubbleRef.current.scrollHeight;
  }, [displayed]);

  if (!text && state !== "speaking" && state !== "thinking") return null;

  return (
    <div style={{
      position: "relative",
      background: "linear-gradient(135deg, #12102a, #0d0d20)",
      border: "1px solid #818cf840",
      borderRadius: isExpanded ? "16px" : "16px 16px 16px 4px",
      padding: isExpanded ? "16px 18px" : "12px 16px",
      boxShadow: "0 8px 32px #00000060, 0 0 0 1px #818cf820",
      transition: "all 0.3s ease",
      maxHeight: isExpanded ? "50vh" : "120px",
      overflow: "hidden",
      cursor: isExpanded ? "default" : "pointer",
    }}
      onClick={!isExpanded ? onExpand : undefined}
    >
      {/* ATLAS label */}
      <p style={{ color: "#818cf8", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 600 }}>ATLAS</p>

      {/* Text area */}
      <div ref={bubbleRef} style={{ overflowY: isExpanded ? "auto" : "hidden", maxHeight: isExpanded ? "calc(50vh - 80px)" : "72px" }}>
        {state === "thinking" && !text ? (
          <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
            {[0,1,2].map(j => <div key={j} style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", animation: `atlPulse 0.9s ease-in-out ${j*0.2}s infinite` }} />)}
          </div>
        ) : (
          <p style={{ color: "#e2e8f0", fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
            {displayed}
            {state === "speaking" && wordIdx < (text || "").split(" ").length && (
              <span style={{ display: "inline-block", width: 2, height: "1em", background: "#818cf8", marginLeft: 3, animation: "atlBlink 0.8s step-end infinite", verticalAlign: "text-bottom" }} />
            )}
          </p>
        )}
      </div>

      {/* Tap-to-expand hint */}
      {!isExpanded && displayed && displayed.length > 80 && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 36, background: "linear-gradient(transparent, #12102a)", borderRadius: "0 0 16px 4px", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 6, pointerEvents: "none" }}>
          <span style={{ color: "#818cf870", fontSize: 10 }}>tap to read more ↓</span>
        </div>
      )}

      {/* Collapse button when expanded */}
      {isExpanded && (
        <button onClick={onCollapse}
          style={{ position: "absolute", top: 10, right: 12, background: "#1e293b", border: "none", color: "#64748b", borderRadius: 20, padding: "3px 10px", fontSize: 11, cursor: "pointer" }}>
          ↑ collapse
        </button>
      )}
    </div>
  );
}

// ── Main ATLAS component ──────────────────────────────────────────────────────
export default function ATLASPage() {
  const [orbState,       setOrbState]       = useState("idle");
  const [transcript,     setTranscript]     = useState("");
  const [messages,       setMessages]       = useState([]);
  const [isListening,    setIsListening]    = useState(false);
  const [statusText,     setStatusText]     = useState("Tap the mic to speak");
  const [error,          setError]          = useState(null);
  const [voiceName,      setVoiceName]      = useState("");
  const [liveSpeech,     setLiveSpeech]     = useState(""); // current spoken text
  const [bubbleExpanded, setBubbleExpanded] = useState(false);
  const [mobileView,     setMobileView]     = useState("avatar"); // "avatar" | "chat"

  const recognitionRef  = useRef(null);
  const convHistoryRef  = useRef([]);
  const messagesEndRef  = useRef(null);
  const audioLevelRef   = useRef(0);
  const isSpeakingRef   = useRef(false);

  useEffect(() => {
    const load = () => { const v = pickVoice(); if (v) setVoiceName(v.name); };
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError("Speech recognition requires Chrome or Edge."); return; }
    const rec      = new SR();
    rec.continuous = false; rec.interimResults = true; rec.lang = "en-US";
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

  // ── speakText — iOS + Android audio fix ──────────────────────────────────
  // iOS Safari: speechSynthesis gets suspended after ~30s of inactivity.
  // Fix: call resume() before speaking, force lang="en-US" on every utterance,
  // and use a short silence utterance to "unlock" audio on first call.
  const speakText = useCallback((text) => {
    const synth = window.speechSynthesis;
    synth.cancel();

    // iOS: resume in case synth was suspended
    if (synth.paused) synth.resume();

    isSpeakingRef.current = true;
    setLiveSpeech(text);
    setBubbleExpanded(false);

    const clean = text.replace(/[*_#`]/g, "").replace(/\n+/g, ". ");

    // Reload voices — iOS sometimes needs this after a delay
    let voice = pickVoice();
    if (!voice) {
      // Force voice reload and try again after a tick
      window.speechSynthesis.getVoices();
      setTimeout(() => { voice = pickVoice(); }, 100);
    }

    let frame = 0;
    const animLevel = () => {
      if (!isSpeakingRef.current) { audioLevelRef.current = 0; return; }
      frame++;
      audioLevelRef.current = 0.25 + Math.abs(Math.sin(frame * 0.15)) * 0.3 + Math.abs(Math.sin(frame * 0.38)) * 0.2 + Math.random() * 0.12;
      requestAnimationFrame(animLevel);
    };

    const onDone = () => {
      if (!isSpeakingRef.current) return;
      isSpeakingRef.current = false;
      audioLevelRef.current = 0;
      setOrbState("idle");
      setStatusText("Tap the mic to speak");
    };

    const makeUtterance = (str) => {
      const u   = new SpeechSynthesisUtterance(str);
      u.lang    = "en-US";   // FORCE English — overrides device language
      u.rate    = 1.05;
      u.pitch   = 0.95;
      u.volume  = 1;
      if (voice) u.voice = voice;
      return u;
    };

    const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
    let idx = 0;

    setOrbState("speaking");
    setStatusText("Speaking…");
    requestAnimationFrame(animLevel);

    // iOS workaround: speak a zero-length utterance first to unblock audio
    const unlock = makeUtterance(" ");
    unlock.volume = 0;
    unlock.onend  = () => {
      const next = () => {
        if (!isSpeakingRef.current || idx >= sentences.length) { onDone(); return; }
        const u = makeUtterance(sentences[idx++].trim());
        u.onend   = next;
        u.onerror = next;
        // iOS: keep synth awake — resume before each sentence
        if (synth.paused) synth.resume();
        synth.speak(u);
      };
      next();
    };
    synth.speak(unlock);
  }, []);

  const askATLAS = useCallback(async (userText) => {
    if (!userText) return;
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setOrbState("thinking");
    setStatusText("Thinking…");
    setLiveSpeech("");

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
      if (!response.ok) { const e = await response.json(); throw new Error(e.error?.message || "API error"); }
      const data          = await response.json();
      const assistantText = data.content.filter(b => b.type === "text").map(b => b.text).join(" ").trim();
      convHistoryRef.current = [...newHistory, { role: "assistant", content: assistantText }];
      setMessages(prev => [...prev, { role: "assistant", text: assistantText }]);
      speakText(assistantText);
    } catch (err) {
      console.error(err);
      setError("ATLAS: " + err.message);
      setOrbState("idle");
      setStatusText("Tap the mic to speak");
    }
  }, [speakText]);

  const interrupt = useCallback(() => {
    isSpeakingRef.current = false;
    audioLevelRef.current = 0;
    window.speechSynthesis.cancel();
    setOrbState("idle");
    setStatusText("Tap the mic to speak");
  }, []);

  const startListening = useCallback(() => {
    if (isListening || orbState === "thinking") return;
    interrupt();
    setError(null);
    try { recognitionRef.current?.start(); }
    catch { setStatusText("Could not start mic — try again"); }
  }, [isListening, orbState, interrupt]);

  const clearConversation = useCallback(() => {
    interrupt();
    setMessages([]); convHistoryRef.current = [];
    setOrbState("idle"); setStatusText("Tap the mic to speak");
    setError(null); setTranscript(""); setLiveSpeech("");
  }, [interrupt]);

  const stateColor = { idle: "#0ea5e9", listening: "#10b981", thinking: "#f59e0b", speaking: "#818cf8" };

  const MicButton = ({ size = 76 }) => (
    <button
      onClick={orbState === "thinking" ? undefined : orbState === "speaking" ? interrupt : isListening ? undefined : startListening}
      disabled={orbState === "thinking"}
      style={{
        width: size, height: size, borderRadius: "50%", border: "none",
        cursor: orbState === "thinking" ? "not-allowed" : "pointer",
        background: isListening ? "linear-gradient(135deg,#10b981,#047857)" : orbState === "speaking" ? "linear-gradient(135deg,#f43f5e,#be123c)" : "linear-gradient(135deg,#0ea5e9,#0369a1)",
        boxShadow: isListening ? "0 0 28px #10b98166,0 4px 16px #10b98133" : orbState === "speaking" ? "0 0 28px #f43f5e66,0 4px 16px #f43f5e33" : "0 0 28px #0ea5e966,0 4px 16px #0ea5e933",
        fontSize: size * 0.34, transition: "all 0.2s",
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: isListening ? "scale(1.1)" : "scale(1)", flexShrink: 0,
      }}
    >
      {isListening ? "⏹" : orbState === "speaking" ? "⏸" : "🎙"}
    </button>
  );

  const StatusPill = ({ fontSize = 11 }) => (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: stateColor[orbState] + "12", border: `1px solid ${stateColor[orbState]}35` }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: stateColor[orbState], animation: orbState !== "idle" ? "atlPulse 1.2s ease-in-out infinite" : "none" }} />
      <span style={{ fontSize, color: stateColor[orbState], fontWeight: 500 }}>{statusText}</span>
    </div>
  );

  const suggested = [
    "What's the separation opportunity for wheat in Champagne?",
    "Which farmer segment should OCP prioritize?",
    "How does OCP's cadmium profile compare to Russian competition?",
    "What's the case for TSP vs MAP in French cereals?",
    "What are the latest phosphate price trends?",
    "How does the cooperative channel work in France?",
  ];

  // ── Chat panel (shared desktop right + mobile chat view) ─────────────────
  const ChatPanel = ({ padded = false }) => (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: padded ? "14px" : "24px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ padding: "14px 16px", background: "#0a0f1a", border: "1px solid #1e293b", borderRadius: 12 }}>
              <p style={{ color: "#475569", fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                Ask ATLAS anything about French P fertilizer markets, agronomy, OCP strategy, or competitive dynamics.
              </p>
            </div>
            <p style={{ color: "#334155", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>Suggested</p>
            <div style={{ display: "grid", gridTemplateColumns: padded ? "1fr" : "1fr 1fr", gap: 8 }}>
              {suggested.map((q, i) => (
                <button key={i} onClick={() => askATLAS(q)}
                  style={{ background: "#0a0f1a", border: "1px solid #1e293b", borderRadius: 10, padding: "11px 14px", textAlign: "left", color: "#64748b", fontSize: 12, cursor: "pointer", lineHeight: 1.6, transition: "all 0.18s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#0ea5e940"; e.currentTarget.style.color = "#94a3b8"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b";   e.currentTarget.style.color = "#64748b"; }}
                >{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="atlMsg" style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, background: msg.role === "user" ? "linear-gradient(135deg,#1e293b,#0f172a)" : "linear-gradient(135deg,#818cf8,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", boxShadow: msg.role === "assistant" ? "0 0 10px #818cf840" : "none", border: msg.role === "user" ? "1px solid #1e293b" : "none" }}>
              {msg.role === "user" ? "U" : "A"}
            </div>
            <div style={{ maxWidth: padded ? "85%" : "74%", background: msg.role === "user" ? "#0f172a" : "#080d18", border: `1px solid ${msg.role === "user" ? "#1e293b" : "#818cf820"}`, borderRadius: msg.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px", padding: "11px 14px" }}>
              {msg.role === "assistant" && <p style={{ color: "#818cf8", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5, fontWeight: 600 }}>ATLAS</p>}
              <p style={{ color: msg.role === "user" ? "#94a3b8" : "#cbd5e1", fontSize: 13, lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap" }}>{msg.text}</p>
            </div>
          </div>
        ))}
        {orbState === "thinking" && (
          <div className="atlMsg" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", boxShadow: "0 0 10px #f59e0b50" }}>A</div>
            <div style={{ background: "#080d18", border: "1px solid #f59e0b18", borderRadius: "4px 14px 14px 14px", padding: "13px 16px", display: "flex", gap: 5, alignItems: "center" }}>
              {[0,1,2].map(j => <div key={j} style={{ width: 7, height: 7, borderRadius: "50%", background: "#f59e0b", animation: `atlPulse 0.9s ease-in-out ${j*0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Text input */}
      <div style={{ borderTop: "1px solid #1e293b", padding: padded ? "10px 14px" : "12px 28px", background: "#080d18", display: "flex", gap: 8 }}>
        <input type="text" placeholder="Type a question…"
          onKeyDown={e => { if (e.key === "Enter" && e.target.value.trim()) { askATLAS(e.target.value.trim()); e.target.value = ""; } }}
          style={{ flex: 1, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: "10px 14px", color: "#e2e8f0", fontSize: 13, outline: "none" }}
          onFocus={e => e.target.style.borderColor = "#818cf8"}
          onBlur={e  => e.target.style.borderColor = "#1e293b"}
        />
        <button
          onClick={e => { const inp = e.currentTarget.previousSibling; if (inp.value.trim()) { askATLAS(inp.value.trim()); inp.value = ""; } }}
          style={{ background: "linear-gradient(135deg,#818cf8,#4f46e5)", border: "none", borderRadius: 10, padding: "10px 18px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Send
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#060d1a", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @keyframes atlFadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes atlPulse   { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes atlBlink   { 0%,100% { opacity:1; } 50% { opacity:0; } }
        .atlMsg               { animation: atlFadeUp 0.3s ease forwards; }

        /* ── DESKTOP: side-by-side ── */
        .atlas-shell     { display:flex; flex-direction:row; height:calc(100vh - 108px); }
        .atlas-panel-l   { width:300px; flex-shrink:0; display:flex; flex-direction:column; align-items:center; padding:28px 20px 20px; gap:14px; border-right:1px solid #1e293b; background:linear-gradient(180deg,#0a0f1a 0%,#060b14 100%); position:relative; overflow:hidden; overflow-y:auto; }
        .atlas-panel-r   { flex:1; display:flex; flex-direction:column; overflow:hidden; }
        .atlas-mob-wrap  { display:none; }

        /* ── MOBILE: avatar-first fullscreen ── */
        @media (max-width: 640px) {
          .atlas-shell   { display:none; }
          .atlas-mob-wrap {
            display: flex;
            flex-direction: column;
            height: calc(100dvh - 56px);
            position: relative;
            overflow: hidden;
          }

          /* Avatar view */
          .mob-avatar-view {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            padding: 20px 20px 100px;
            background: radial-gradient(ellipse at 50% 40%, #0d1a2e 0%, #060d1a 70%);
            position: relative;
          }

          /* Bubble positioned below avatar */
          .mob-bubble-wrap {
            position: absolute;
            bottom: 24px;
            left: 16px;
            right: 16px;
          }

          /* Bottom bar with mic + toggle */
          .mob-bottom-bar {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 20px 16px;
            background: linear-gradient(transparent, #060d1a 40%);
            pointer-events: none;
          }
          .mob-bottom-bar > * { pointer-events: all; }

          /* Chat view */
          .mob-chat-view {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          .mob-chat-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 14px;
            background: #0a0f1a;
            border-bottom: 1px solid #1e293b;
            flex-shrink: 0;
          }
        }
      `}</style>

      {/* ════════════════ DESKTOP ════════════════ */}
      <div className="atlas-shell">
        <div className="atlas-panel-l">
          <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "linear-gradient(#0ea5e9 1px,transparent 1px),linear-gradient(90deg,#0ea5e9 1px,transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
          <AtlasFace state={orbState} audioLevel={audioLevelRef} size={220} />
          <div style={{ textAlign: "center", zIndex: 1, marginTop: -6 }}>
            <p style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>ATLAS</p>
            <p style={{ color: "#334155", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", marginTop: 2 }}>Phosphorus Intelligence Advisor</p>
          </div>
          <StatusPill />
          {voiceName && <p style={{ color: "#334155", fontSize: 10 }}>Voice: <span style={{ color: "#475569" }}>{voiceName}</span></p>}
          {transcript && <div style={{ background: "#0f172a", border: "1px solid #10b98130", borderRadius: 8, padding: "7px 12px", fontSize: 11, color: "#10b981", fontStyle: "italic", maxWidth: "100%", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>"{transcript}"</div>}
          <MicButton size={76} />
          <p style={{ color: "#334155", fontSize: 11, textAlign: "center" }}>
            {isListening ? "Listening — speak now" : orbState === "speaking" ? "Tap to interrupt" : orbState === "thinking" ? "Processing…" : "Tap mic to speak"}
          </p>
          {error && <div style={{ background: "#1a0808", border: "1px solid #f43f5e30", borderRadius: 8, padding: "9px 12px", fontSize: 11, color: "#f87171", lineHeight: 1.6, width: "100%" }}>{error}</div>}
          {messages.length > 0 && (
            <button onClick={clearConversation} style={{ background: "transparent", border: "1px solid #1e293b", color: "#334155", fontSize: 11, padding: "6px 0", borderRadius: 6, cursor: "pointer", width: "100%" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.borderColor = "#334155"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#334155"; e.currentTarget.style.borderColor = "#1e293b"; }}
            >Clear conversation</button>
          )}
        </div>
        <div className="atlas-panel-r">
          <ChatPanel padded={false} />
        </div>
      </div>

      {/* ════════════════ MOBILE ════════════════ */}
      <div className="atlas-mob-wrap">

        {/* ── AVATAR VIEW ── */}
        {mobileView === "avatar" && (
          <div className="mob-avatar-view">
            {/* Background grid */}
            <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "linear-gradient(#0ea5e9 1px,transparent 1px),linear-gradient(90deg,#0ea5e9 1px,transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none" }} />

            {/* Face — big and centered */}
            <AtlasFace state={orbState} audioLevel={audioLevelRef} size={200} />

            {/* Name + status */}
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#f1f5f9", fontSize: 20, fontWeight: 800, letterSpacing: "-0.03em", margin: 0 }}>ATLAS</p>
              <p style={{ color: "#475569", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 2 }}>Phosphorus Intelligence Advisor</p>
            </div>

            <StatusPill fontSize={12} />

            {/* Live transcript */}
            {transcript && (
              <div style={{ background: "#0f172a", border: "1px solid #10b98130", borderRadius: 8, padding: "7px 14px", fontSize: 12, color: "#10b981", fontStyle: "italic", maxWidth: "100%", textAlign: "center" }}>
                "{transcript}"
              </div>
            )}

            {/* Error */}
            {error && <div style={{ background: "#1a0808", border: "1px solid #f43f5e30", borderRadius: 8, padding: "8px 14px", fontSize: 12, color: "#f87171", textAlign: "center" }}>{error}</div>}

            {/* Speech bubble */}
            <div className="mob-bubble-wrap">
              <LiveBubble
                text={liveSpeech}
                isExpanded={bubbleExpanded}
                onExpand={() => setBubbleExpanded(true)}
                onCollapse={() => setBubbleExpanded(false)}
                state={orbState}
              />
            </div>

            {/* Bottom bar: clear | mic | chat toggle */}
            <div className="mob-bottom-bar">
              <button onClick={clearConversation}
                style={{ background: "transparent", border: "1px solid #1e293b", color: "#475569", fontSize: 11, padding: "7px 12px", borderRadius: 8, cursor: "pointer" }}>
                Clear
              </button>

              <MicButton size={64} />

              <button onClick={() => setMobileView("chat")}
                style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", fontSize: 11, padding: "7px 12px", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                💬 {messages.length > 0 ? messages.length : "Chat"}
              </button>
            </div>
          </div>
        )}

        {/* ── CHAT VIEW ── */}
        {mobileView === "chat" && (
          <div className="mob-chat-view">
            {/* Chat header with back button */}
            <div className="mob-chat-header">
              <button onClick={() => setMobileView("avatar")}
                style={{ background: "transparent", border: "none", color: "#0ea5e9", fontSize: 13, cursor: "pointer", padding: "4px 0", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                ← ATLAS
              </button>
              <div style={{ flex: 1 }} />
              <MicButton size={40} />
            </div>
            <ChatPanel padded={true} />
          </div>
        )}

      </div>
    </div>
  );
}
