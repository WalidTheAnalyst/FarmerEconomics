/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import ATLASPage from "./ATLAS";
import {
  ResponsiveContainer, LineChart, BarChart, AreaChart,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  Line, Bar, Area, ReferenceLine, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, ComposedChart
} from "recharts";

/* ═══════════════════════════════════════════════════════════════════════════
   FARMER ECONOMICS — BRAZIL DEEP DIVE
   ───────────────────────────────────────────────────────────────────────────
   Architecture
     • Countries:    France (existing market-intel layer) + Brazil (new farmer-
                     centric quantitative engine).
     • Brazil layer: Region → Farm size → Crop drives a per-hectare P&L engine
                     with editable cost structure, yield/price assumptions,
                     break-even, sensitivity, and scenario comparison.
     • All Brazil assumptions live in BRAZIL_DATA so they are easy to swap
       for real data later. Where ranges exist they are commented inline.
   Sources for Brazil baselines (from CVA / OCP Nutricrops Module A, July 2025
   deep dive): Embrapa, IBGE, ANDA, FAO, IFA, OCP Brazil team field data,
   Conab/Cepea pricing references, plus operator-side cost benchmarks.
   ═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   1. THEME TOKENS  (unchanged from original — single source of truth)
   ═══════════════════════════════════════════════════════════════════════════ */

const C = {
  bg:        "#04080f",
  panel:     "#080e18",
  card:      "#0a0f1a",
  border:    "#1e293b",
  borderSubtle: "#1a2436",
  text:      "#f1f5f9",
  textMuted: "#94a3b8",
  textDim:   "#64748b",
  textFaint: "#475569",

  cyan:      "#0ea5e9",
  emerald:   "#10b981",
  amber:     "#f59e0b",
  violet:    "#a78bfa",
  rose:      "#f43f5e",
  indigo:    "#818cf8",
  slate:     "#94a3b8",
};

const FX_BRL_USD = 5.05; // Avg 2024–25 reference. Editable by user in app.


/* ═══════════════════════════════════════════════════════════════════════════
   2. BRAZIL FARMER ECONOMICS DATA MODEL
   ───────────────────────────────────────────────────────────────────────────
   Five regions × five focus crops × three farm-size archetypes.
   Every numeric value is a placeholder anchored to the deck or public data,
   structured so a single field can be replaced without touching logic.
   ═══════════════════════════════════════════════════════════════════════════ */

const BRAZIL_REGIONS = [
  {
    id: "matopiba",
    name: "MATOPIBA-PA",
    states: "Maranhão · Tocantins · Piauí · Bahia · Pará",
    sharePct: 13,
    flagColor: C.cyan,
    soil:    "Acidic, nutrient-poor, sandy oxisols",
    climate: "Heavy rainfall, hot & humid; new agricultural frontier",
    logistics: "Long inland routes — 30–50% higher freight to port vs Cerrado",
    blurb: "Newest agricultural frontier. Large-scale soy/corn/cotton expansion. High SSP demand due to acute sulfur deficiency in newly cleared soils.",
    cropMix: { Soybean: 52, Corn: 18, Cotton: 7, Sugarcane: 1, Coffee: 0, Other: 22 },
  },
  {
    id: "cerrado",
    name: "Cerrado",
    states: "Mato Grosso · Goiás · Mato Grosso do Sul · Minas Gerais (north)",
    sharePct: 38,
    flagColor: C.emerald,
    soil:    "Acidic oxisols, low organic carbon, severe P-fixation",
    climate: "Tropical savanna; 1,300–1,600 mm rain Oct–Mar",
    logistics: "Improving — Ferrogrão & northern arc reducing port costs",
    blurb: "Brazil's grain powerhouse. Soy + safrinha corn double-crop dominates. High-analysis fertilizers (MAP, TSP) preferred for logistics efficiency.",
    cropMix: { Soybean: 54, Corn: 29, Cotton: 5, Sugarcane: 1, Coffee: 0, Other: 11 },
  },
  {
    id: "southeast",
    name: "Southeast",
    states: "São Paulo · Minas Gerais (south) · Espírito Santo · Rio de Janeiro",
    sharePct: 18,
    flagColor: C.amber,
    soil:    "Weathered but fertile, acidic; pockets of higher OC",
    climate: "Humid (sub)tropical; reliable rainfall",
    logistics: "Best in country — proximity to Santos port, rail & paved roads",
    blurb: "Sugarcane heartland, premium coffee, citrus belt. Diversified, agro-industrial. High-N blends dominate due to sugarcane's nitrogen demand.",
    cropMix: { Soybean: 18, Corn: 24, Sugarcane: 28, Coffee: 9, Cotton: 0, Other: 21 },
  },
  {
    id: "south",
    name: "South",
    states: "Rio Grande do Sul · Paraná · Santa Catarina",
    sharePct: 25,
    flagColor: C.violet,
    soil:    "Fertile mollisols, lower acidity, higher OC than Cerrado",
    climate: "Cooler subtropical; allows winter wheat after summer soy/corn",
    logistics: "Dense road network, multiple ports (Paranaguá, Rio Grande)",
    blurb: "Traditional heartland. Smaller, more diversified family farms. Strong cooperative networks (Coamo, C.Vale, Cocamar) dominate distribution.",
    cropMix: { Soybean: 50, Corn: 16, Sugarcane: 2, Coffee: 0, Cotton: 0, Other: 32 },
  },
  {
    id: "other",
    name: "Northeast & North",
    states: "Pernambuco · Alagoas · Ceará · Amazonas · Roraima",
    sharePct: 6,
    flagColor: C.slate,
    soil:    "Mixed — neutral/alkaline coastal, acidic Amazon",
    climate: "Semi-arid (Sertão) to equatorial (Amazon)",
    logistics: "Limited inland infrastructure; coastal ports only",
    blurb: "Smaller scale, drought-tolerant crops, sugarcane on coast. High dependency on irrigation for productivity gains.",
    cropMix: { Soybean: 5, Corn: 15, Sugarcane: 12, Coffee: 8, Cotton: 2, Other: 58 },
  },
];

const BRAZIL_CROPS = [
  {
    id: "soybean", name: "Soybean", emoji: "🌱", color: C.emerald,
    nationalShare: 45,        // % of harvested area
    nationalArea: 47831,      // '000 ha (2024)
    nationalYield: 3.4,       // t/ha (deck p.19)
    globalYield: 2.7,
  },
  {
    id: "corn", name: "Corn (Safrinha)", emoji: "🌽", color: C.amber,
    nationalShare: 21, nationalArea: 21977, nationalYield: 5.9, globalYield: 5.9,
  },
  {
    id: "sugarcane", name: "Sugarcane", emoji: "🎋", color: C.violet,
    nationalShare: 8, nationalArea: 8888, nationalYield: 77.7, globalYield: 75.0,
  },
  {
    id: "coffee", name: "Coffee", emoji: "☕", color: "#92400e",
    nationalShare: 2, nationalArea: 2241, nationalYield: 1.8, globalYield: 0.9,
  },
  {
    id: "cotton", name: "Cotton", emoji: "🌾", color: C.cyan,
    nationalShare: 2, nationalArea: 2044, nationalYield: 4.4, globalYield: 2.3,
  },
];

const BRAZIL_FARM_SIZES = [
  {
    id: "small",  label: "Small holder",  range: "<100 ha", avgHa: 45,
    color: C.slate,
    sharePct: 91,            // share of farms
    landSharePct: 20,         // share of land
    profile: "Family-run, often co-op member, limited mechanization, cash-flow tight, late ordering, high reliance on credit and crop hedging.",
    techAdoption: "Low (15–30%)", coopReliance: "High (70–80%)",
    yieldPenaltyPct: -12,     // vs national avg yield
    costInflationPct:  +8,     // vs avg cost (smaller orders → higher unit cost)
  },
  {
    id: "medium", label: "Medium farmer", range: "100–1,000 ha", avgHa: 350,
    color: C.cyan,
    sharePct: 8, landSharePct: 35,
    profile: "Professionalized operation, mix of co-op and direct purchase, partially mechanized, balanced credit access, often runs double-crop.",
    techAdoption: "Medium (35–55%)", coopReliance: "Medium (50–60%)",
    yieldPenaltyPct: 0,
    costInflationPct:  0,
  },
  {
    id: "large",  label: "Large grower / Mega-farm", range: ">1,000 ha", avgHa: 3200,
    color: C.emerald,
    sharePct: 1, landSharePct: 45,
    profile: "Vertically integrated, direct importer of inputs, GPS auto-steer + VRT, hedges via futures, owns drying & storage, lowest unit cost.",
    techAdoption: "High (60–85%)", coopReliance: "Low (15–30%)",
    yieldPenaltyPct: +6,
    costInflationPct: -10,
  },
];

/* Crop × Region baseline economics (per hectare, BRL).
   Numbers are calibrated to 2024–25 Brazilian reality drawing on the deck:
   - Recommended N/P/K from Embrapa (deck p.19 & nutrient slides p.23–29)
   - Nutrient prices: MAP ~R$3,800/t, Urea ~R$2,800/t, MOP ~R$2,500/t,
     TSP ~R$3,400/t, SSP ~R$1,500/t, AS ~R$2,200/t (avg 2024 CIF + freight)
   - Crop prices: Soy ~R$130/sc60 (~R$2,170/t), Corn ~R$60/sc60 (~R$1,000/t),
     Sugarcane ~R$130/t, Coffee arabica ~R$1,800/sc60 (~R$30,000/t),
     Cotton lint ~R$11,500/t.
   These are PLACEHOLDERS — easy to overwrite with live Cepea/Conab feeds. */

const BRAZIL_ECON = {
  /* Fertilizer unit costs — BRL per tonne of product, all-in delivered to farm */
  fertilizerPrices: {
    MAP:  3800, DAP: 3700, TSP: 3400, SSP: 1500,
    Urea: 2800, AS:  2200, MOP: 2500, SOP: 4200,
    Lime:  220, Gypsum: 180,  // soil amendments, R$/t
  },

  /* Nutrient-content reference for cost calculations */
  nutrientContent: {
    MAP:  { N: 0.11, P2O5: 0.52, K2O: 0,    S: 0.01 },
    DAP:  { N: 0.18, P2O5: 0.46, K2O: 0,    S: 0    },
    TSP:  { N: 0,    P2O5: 0.46, K2O: 0,    S: 0    },
    SSP:  { N: 0,    P2O5: 0.18, K2O: 0,    S: 0.11 },
    Urea: { N: 0.46, P2O5: 0,    K2O: 0,    S: 0    },
    AS:   { N: 0.21, P2O5: 0,    K2O: 0,    S: 0.24 },
    MOP:  { N: 0,    P2O5: 0,    K2O: 0.60, S: 0    },
    SOP:  { N: 0,    P2O5: 0,    K2O: 0.50, S: 0.18 },
  },

  /* Per-crop, per-region defaults: yield (t/ha), farm-gate price (BRL/t),
     and a recommended fertilizer mix in kg of product per hectare. */
  crops: {
    soybean: {
      defaultMix: { MAP: 200, MOP: 130, Urea: 0,  AS: 0,   SSP: 0,  TSP: 0 },
      // Same recommended N/P/K (kg nutrient/ha) per Embrapa: 0-5 N, 80 P2O5, 80 K2O
      regions: {
        matopiba:  { yield: 3.6, price: 2150, n: 0,  p: 80, k: 80 },
        cerrado:   { yield: 3.7, price: 2120, n: 0,  p: 80, k: 80 },
        southeast: { yield: 3.4, price: 2200, n: 0,  p: 75, k: 75 },
        south:     { yield: 3.6, price: 2180, n: 0,  p: 80, k: 85 },
        other:     { yield: 3.0, price: 2100, n: 0,  p: 75, k: 75 },
      },
      otherCosts: {  // R$/ha — see notes below
        seeds: 850, agrochemicals: 1450, fuelMachinery: 720,
        labor: 240, landRent: 1800, drying: 180, freight: 280,
        financing: 320, insurance: 140, admin: 110,
      },
      // Notes: seeds = inoculated GMO ~R$700–1000; agrochem = soy is herbicide
      // & insecticide intensive (~R$1.2–1.7k); land rent in MT/GO ~12–15
      // sacas/ha = ~R$1.5–2.0k; freight to port averages R$250–350/ha.
    },
    corn: {
      defaultMix: { MAP: 120, MOP: 100, Urea: 200, AS: 0, SSP: 0, TSP: 0 },
      regions: {
        matopiba:  { yield: 5.5, price: 980,  n: 73, p: 28, k: 53 },
        cerrado:   { yield: 6.2, price: 950,  n: 73, p: 28, k: 53 },
        southeast: { yield: 6.4, price: 1020, n: 73, p: 28, k: 53 },
        south:     { yield: 7.2, price: 1000, n: 80, p: 30, k: 55 },
        other:     { yield: 4.5, price: 980,  n: 60, p: 25, k: 45 },
      },
      otherCosts: {
        seeds: 750, agrochemicals: 950, fuelMachinery: 680,
        labor: 220, landRent: 1500, drying: 220, freight: 240,
        financing: 280, insurance: 110, admin: 90,
      },
    },
    sugarcane: {
      defaultMix: { MAP: 100, MOP: 220, Urea: 220, AS: 0, SSP: 0, TSP: 0 },
      regions: {
        matopiba:  { yield: 65, price: 130, n: 110, p: 50, k: 130 },
        cerrado:   { yield: 72, price: 130, n: 110, p: 50, k: 130 },
        southeast: { yield: 82, price: 135, n: 110, p: 50, k: 130 },
        south:     { yield: 75, price: 130, n: 110, p: 50, k: 130 },
        other:     { yield: 60, price: 125, n:  95, p: 40, k: 110 },
      },
      otherCosts: {
        seeds: 1900, agrochemicals: 850, fuelMachinery: 950,   // setts amortized over ~5 cuts
        labor: 1100, landRent: 1300, drying: 0, freight: 350,
        financing: 380, insurance: 90, admin: 120,
      },
    },
    coffee: {
      defaultMix: { MAP: 0, MOP: 350, Urea: 450, AS: 0, SSP: 0, TSP: 200 },
      regions: {
        matopiba:  { yield: 1.4, price: 28000, n: 200, p: 50, k: 200 },
        cerrado:   { yield: 1.8, price: 28000, n: 200, p: 50, k: 200 },
        southeast: { yield: 1.9, price: 30000, n: 200, p: 50, k: 200 },
        south:     { yield: 1.5, price: 28000, n: 200, p: 50, k: 200 },
        other:     { yield: 1.2, price: 27000, n: 180, p: 45, k: 180 },
      },
      otherCosts: {
        seeds: 0, agrochemicals: 4200, fuelMachinery: 2400,    // perennial: no annual seeds; high spray load
        labor: 14500, landRent: 3500, drying: 1800, freight: 980,
        financing: 1850, insurance: 620, admin: 720,
      },
      // Notes: coffee is labor-intensive (manual or semi-mechanical picking,
      // pruning, weed control). Total annual cost in MG/ES averages
      // R$28-38k/ha for arabica per Cepea / IAC studies (2024).
    },
    cotton: {
      defaultMix: { MAP: 250, MOP: 250, Urea: 280, AS: 0, SSP: 0, TSP: 0 },
      regions: {
        matopiba:  { yield: 4.6, price: 11500, n: 130, p: 120, k: 150 },
        cerrado:   { yield: 4.5, price: 11500, n: 130, p: 120, k: 150 },
        southeast: { yield: 4.0, price: 11500, n: 130, p: 120, k: 150 },
        south:     { yield: 3.8, price: 11500, n: 120, p: 110, k: 140 },
        other:     { yield: 3.5, price: 11200, n: 110, p: 100, k: 130 },
      },
      otherCosts: {
        seeds: 950, agrochemicals: 4200, fuelMachinery: 1100,   // cotton is the most agrochem-intensive
        labor: 580, landRent: 1900, drying: 0, freight: 420,
        financing: 580, insurance: 320, admin: 180,
      },
    },
  },
};

const BRAZIL_KPIS = [
  { label: "Harvested area",     value: "108 M ha", sub: "2024 total",                 accent: C.emerald },
  { label: "Soy share",          value: "45%",      sub: "of national area",           accent: C.cyan },
  { label: "Land concentration", value: "9% own 80%", sub: "land ownership inequality",accent: C.amber },
  { label: "Blends share",       value: "~70%",     sub: "of fertilizer consumed",     accent: C.violet },
  { label: "P import dependency",value: "85%",      sub: "of phosphate is imported",   accent: C.rose  },
];


/* ═══════════════════════════════════════════════════════════════════════════
   3. UTILITY HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

const fmtBRL = v => "R$ " + Math.round(v).toLocaleString("pt-BR");
const fmtUSD = v => "US$ " + Math.round(v).toLocaleString("en-US");
const fmtMoney = (v, ccy) => ccy === "USD" ? fmtUSD(v / FX_BRL_USD) : fmtBRL(v);
const fmtPct = (v, d=1) => (v >= 0 ? "+" : "") + v.toFixed(d) + "%";
const fmtNum = (v, d=0) => Number(v).toLocaleString("en-US", {
  minimumFractionDigits: d, maximumFractionDigits: d
});

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: C.bg, border: `1px solid ${C.border}`,
      borderRadius: 8, padding: "10px 14px", fontSize: 12
    }}>
      <p style={{ color: C.textMuted, marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}: <strong style={{ color: C.text }}>
            {typeof p.value === "number" ? fmtNum(p.value, 1) : p.value}
          </strong>
        </p>
      ))}
    </div>
  );
};


/* ═══════════════════════════════════════════════════════════════════════════
   4. SHARED VISUAL COMPONENTS  (kept identical to original API)
   ═══════════════════════════════════════════════════════════════════════════ */

function KPICard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: `linear-gradient(135deg,${C.card},#0a1020)`,
      border: `1px solid ${accent}25`, borderRadius: 14,
      padding: "16px 18px", flex: 1, minWidth: 120,
      position: "relative", overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", top: -15, right: -15,
        width: 60, height: 60, borderRadius: "50%", background: accent + "08"
      }}/>
      <p style={{
        color: C.textMuted, fontSize: 10, textTransform: "uppercase",
        letterSpacing: "0.1em", marginBottom: 6
      }}>{label}</p>
      <p style={{
        color: accent, fontSize: 22, fontWeight: 800,
        fontFamily: "'DM Mono',monospace", margin: 0
      }}>{value}</p>
      {sub && <p style={{ color: C.textMuted, fontSize: 11, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

function SectionBadge({ label, color }) {
  return (
    <span style={{
      padding: "3px 12px", borderRadius: 20, fontSize: 10, fontWeight: 700,
      letterSpacing: "0.08em", textTransform: "uppercase",
      background: color + "18", color, border: `1px solid ${color}40`
    }}>{label}</span>
  );
}

function InsightCard({ item }) {
  const border = { positive: C.emerald, neutral: C.amber, risk: C.rose };
  const bg     = { positive: "#0a1e14", neutral: "#1a1200", risk: "#1a0808" };
  const c = border[item.type];
  return (
    <div style={{
      background: bg[item.type] || C.card,
      border: `1px solid ${c}30`, borderLeft: `3px solid ${c}`,
      borderRadius: 12, padding: "15px 16px",
      transition: "transform 0.15s, box-shadow 0.15s", cursor: "default"
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${c}20`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "none";              e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
        <span style={{ fontSize: 15 }}>{item.icon}</span>
        <p style={{
          fontSize: 11, color: c, textTransform: "uppercase",
          letterSpacing: "0.06em", fontWeight: 700, margin: 0
        }}>{item.label}</p>
      </div>
      <p style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.7, margin: 0 }}>{item.text}</p>
    </div>
  );
}

/* Subtle, reusable section divider */
function SectionTitle({ eyebrow, title, accent = C.cyan, right = null }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
      <div>
        {eyebrow && (
          <p style={{
            color: accent, fontSize: 10, letterSpacing: "0.16em",
            textTransform: "uppercase", fontWeight: 700, marginBottom: 6
          }}>{eyebrow}</p>
        )}
        <h2 style={{
          color: C.text, fontSize: 19, fontWeight: 700,
          letterSpacing: "-0.015em", margin: 0
        }}>{title}</h2>
      </div>
      {right}
    </div>
  );
}

/* Editable numeric field — used heavily in the cost editor */
function EditableNumber({ value, onChange, suffix = "", step = 1, min = 0, max = 999999, accent = C.cyan, width = 100 }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <input
        type="number" value={value} step={step} min={min} max={max}
        onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
        style={{
          width, padding: "5px 8px", borderRadius: 5,
          background: C.bg, border: `1px solid ${C.border}`,
          color: C.text, fontFamily: "'DM Mono',monospace",
          fontSize: 12, textAlign: "right", outline: "none"
        }}
        onFocus={e => e.target.style.borderColor = accent}
        onBlur={ e => e.target.style.borderColor = C.border}
      />
      {suffix && <span style={{ color: C.textDim, fontSize: 11 }}>{suffix}</span>}
    </div>
  );
}

/* Compact toggle group */
function Segmented({ options, value, onChange, accent = C.cyan }) {
  return (
    <div style={{ display: "inline-flex", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: 2 }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)}
          style={{
            padding: "5px 12px", borderRadius: 4,
            background: value === o.value ? accent + "22" : "transparent",
            color:      value === o.value ? accent       : C.textMuted,
            border: "none", cursor: "pointer", fontSize: 11,
            fontWeight: value === o.value ? 700 : 400,
            transition: "all 0.15s"
          }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   5. LANDING PAGE  (extended with country chooser)
   ═══════════════════════════════════════════════════════════════════════════ */

function LandingPage({ onEnter }) {
  const [vis, setVis] = useState(false);
  const [sub, setSub] = useState(false);
  const [btn, setBtn] = useState(false);

  useEffect(() => {
    setTimeout(() => setVis(true), 300);
    setTimeout(() => setSub(true), 1100);
    setTimeout(() => setBtn(true), 1900);
  }, []);

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
      position: "relative", overflow: "hidden"
    }}>
      <style>{`
        @keyframes lFadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes lOrbit{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>

      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(14,165,233,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.04) 1px,transparent 1px)",
        backgroundSize: "60px 60px"
      }}/>
      <div style={{ position:"absolute", width:480, height:480, borderRadius:"50%", border:"1px solid rgba(14,165,233,0.06)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", animation:"lOrbit 30s linear infinite", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", width:340, height:340, borderRadius:"50%", border:"1px solid rgba(16,185,129,0.05)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", animation:"lOrbit 20s linear infinite reverse", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(14,165,233,0.06) 0%,transparent 70%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none" }}/>

      <div style={{ position:"absolute", top:32, left:40, display:"flex", alignItems:"center", gap:12, opacity:vis?1:0, transition:"opacity 0.8s ease" }}>
        <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#0ea5e9,#0369a1)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:12, color:"#fff", fontFamily:"'DM Mono',monospace", boxShadow:"0 0 16px #0ea5e930" }}>GMO</div>
        <span style={{ color:"rgba(255,255,255,0.15)", fontSize:12, letterSpacing:"0.15em", textTransform:"uppercase" }}>OCP Nutricrops · Phosphorus Intelligence</span>
      </div>

      <div style={{ textAlign:"center", maxWidth:760, padding:"0 32px", zIndex:10 }}>
        <div style={{ opacity:vis?1:0, transform:vis?"none":"translateY(12px)", transition:"opacity 0.9s ease,transform 0.9s ease", marginBottom:24 }}>
          <span style={{ background:"rgba(14,165,233,0.1)", border:"1px solid rgba(14,165,233,0.2)", borderRadius:20, padding:"5px 16px", color:"rgba(14,165,233,0.9)", fontSize:11, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase" }}>GMO · OCP Nutricrops</span>
        </div>

        <h1 style={{ opacity:vis?1:0, transform:vis?"none":"translateY(20px)", transition:"opacity 0.9s ease,transform 0.9s ease", fontSize:"clamp(26px,4vw,46px)", fontWeight:300, color:"rgba(255,255,255,0.92)", lineHeight:1.28, marginBottom:24, letterSpacing:"-0.02em" }}>
          A quantitative platform to<br/>
          <span style={{ fontWeight:700, color:C.text }}>step inside the farmer's economics</span><br/>
          <span style={{ color:C.cyan, fontWeight:600 }}>and run the math.</span>
        </h1>

        <div style={{ opacity:sub?1:0, transform:sub?"none":"translateY(10px)", transition:"opacity 0.8s ease,transform 0.8s ease", margin:"0 auto 22px", width:48, height:1, background:"linear-gradient(90deg,transparent,rgba(14,165,233,0.6),transparent)" }}/>

        <p style={{ opacity:sub?1:0, transform:sub?"none":"translateY(10px)", transition:"opacity 0.8s ease,transform 0.8s ease", fontSize:14, color:"rgba(255,255,255,0.42)", fontWeight:300, lineHeight:1.8, marginBottom:36 }}>
          Region · Crop · Cost structure · Yield · P&amp;L · Sensitivity · Scenarios
        </p>

        <button onClick={onEnter}
          style={{ opacity:btn?1:0, transform:btn?"none":"translateY(8px)", transition:"opacity 0.6s ease,transform 0.6s ease,background 0.2s,border-color 0.2s", background:"transparent", border:"1px solid rgba(14,165,233,0.5)", color:"rgba(14,165,233,0.9)", padding:"13px 40px", borderRadius:4, fontSize:13, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(14,165,233,0.1)"; e.currentTarget.style.borderColor = "rgba(14,165,233,0.9)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(14,165,233,0.5)"; e.currentTarget.style.color = "rgba(14,165,233,0.9)"; }}>
          Enter Platform →
        </button>
      </div>

      <div style={{ position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)", opacity:btn?0.4:0, transition:"opacity 0.8s ease", fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em", textTransform:"uppercase", display:"flex", gap:20, flexWrap:"wrap", justifyContent:"center" }}>
        <span>Embrapa</span><span>·</span><span>IBGE</span><span>·</span><span>Conab / Cepea</span><span>·</span><span>OCP Field Intelligence</span><span>·</span><span>Agreste</span>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   6. COUNTRY CHOOSER  (FR vs BR, with brazil.jpg flag from public/)
   ═══════════════════════════════════════════════════════════════════════════ */

function CountryChooser({ onPick }) {
  const [hovered, setHovered] = useState(null);

  const Tile = ({ id, name, tagline, accent, available, badge, render }) => (
    <button
      onClick={() => available && onPick(id)}
      onMouseEnter={() => setHovered(id)}
      onMouseLeave={() => setHovered(null)}
      style={{
        background: C.panel,
        border: `1px solid ${hovered === id && available ? accent + "60" : C.borderSubtle}`,
        borderRadius: 16, padding: 0, cursor: available ? "pointer" : "default",
        textAlign: "left", overflow: "hidden",
        opacity: available ? 1 : 0.5,
        transform: hovered === id && available ? "translateY(-3px)" : "none",
        transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
        boxShadow: hovered === id && available ? `0 16px 40px ${accent}25` : "none",
        display: "flex", flexDirection: "column", minHeight: 360
      }}>
      <div style={{ height: 180, position: "relative", overflow: "hidden", background: C.bg }}>
        {render}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg,transparent 40%,rgba(8,14,24,0.95) 100%)"
        }}/>
        {badge && (
          <span style={{
            position: "absolute", top: 14, right: 14,
            background: accent + "22", border: `1px solid ${accent}55`,
            color: accent, fontSize: 10, fontWeight: 700,
            padding: "4px 10px", borderRadius: 4,
            letterSpacing: "0.08em", textTransform: "uppercase"
          }}>{badge}</span>
        )}
      </div>
      <div style={{ padding: "20px 22px 22px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <p style={{ color: accent, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, margin: 0 }}>{id === "BR" ? "Brasil" : "France"}</p>
        <p style={{ color: C.text, fontSize: 22, fontWeight: 700, margin: "2px 0 4px", letterSpacing: "-0.01em" }}>{name}</p>
        <p style={{ color: C.textMuted, fontSize: 12.5, lineHeight: 1.65, margin: 0, flex: 1 }}>{tagline}</p>
        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${C.borderSubtle}`, paddingTop: 12 }}>
          <span style={{ color: C.textDim, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {available ? "Open Country" : "Coming Soon"}
          </span>
          {available && <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
        </div>
      </div>
    </button>
  );

  return (
    <div style={{ padding: "28px 32px 60px", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: C.cyan, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
          Country selector
        </p>
        <h1 style={{ color: C.text, fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
          Which farmer do you want to step inside?
        </h1>
        <p style={{ color: C.textMuted, fontSize: 13, marginTop: 8, maxWidth: 620 }}>
          Each country opens a fully separate analytical engine, calibrated to local crops, soils, prices, cost structures and fertilization practices.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 18 }}>
        <Tile id="FR" name="France · Cereal heartland"
              tagline="Wheat, barley, rapeseed and corn across 7 administrative regions. Market-intelligence layer with farmer archetypes, P2O5 demand, and cooperative-channel mapping."
              accent={C.cyan} available={true} badge="Market intelligence"
              render={
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#001a4d 0%,#002395 50%,#001a4d 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {/* Stylized FR tricolor */}
                  <div style={{ display: "flex", height: "60%", borderRadius: 4, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                    <div style={{ width: 64, background: "#0055A4" }}/>
                    <div style={{ width: 64, background: "#FFFFFF" }}/>
                    <div style={{ width: 64, background: "#EF4135" }}/>
                  </div>
                </div>
              }/>

        <Tile id="BR" name="Brazil · Agricultural powerhouse"
              tagline="Soy, corn, sugarcane, coffee and cotton across 5 macro-regions. Step inside the farmer: cost structure, yield, fertilization choices, and a live P&L engine driven by your inputs."
              accent={C.emerald} available={true} badge="Farmer economics engine"
              render={
                <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
                  <img src="/brazil.jpg" alt="" style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    filter: "saturate(1.1) brightness(0.95)"
                  }}
                  onError={e => {
                    /* graceful fallback if brazil.jpg not in public/ */
                    e.currentTarget.style.display = "none";
                  }}/>
                  {/* Fallback brazil "flag" if image missing */}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,#009C3B 0%,#00723A 100%)", zIndex: -1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "60%", height: "55%", background: "#FFDF00", clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#002776" }}/>
                    </div>
                  </div>
                </div>
              }/>
      </div>

      <div style={{ marginTop: 32, padding: "16px 18px", background: C.card, border: `1px dashed ${C.border}`, borderRadius: 10 }}>
        <p style={{ color: C.textMuted, fontSize: 11.5, lineHeight: 1.7, margin: 0 }}>
          <span style={{ color: C.cyan, fontWeight: 700 }}>Note · </span>
          Brazil is the new flagship engine. France remains accessible in a separate legacy path; the Brazil module is built ground-up around the farmer rather than the market — every input you toggle flows through the cost stack, the P&amp;L and the sensitivity tornado.
        </p>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   7. BRAZIL — REGION & FARM PICKER
   ═══════════════════════════════════════════════════════════════════════════ */

function BrazilRegionPicker({ region, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 8 }}>
      {BRAZIL_REGIONS.map(r => {
        const active = r.id === region;
        return (
          <button key={r.id} onClick={() => onChange(r.id)}
            style={{
              background: active ? r.flagColor + "12" : C.panel,
              border: `1px solid ${active ? r.flagColor : C.borderSubtle}`,
              borderRadius: 10, padding: "12px 14px",
              cursor: "pointer", textAlign: "left",
              transition: "all 0.15s"
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <p style={{ color: active ? r.flagColor : C.text, fontSize: 13, fontWeight: 700, margin: 0 }}>{r.name}</p>
              <span style={{ color: r.flagColor, fontSize: 11, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{r.sharePct}%</span>
            </div>
            <p style={{ color: C.textDim, fontSize: 10, margin: 0, lineHeight: 1.4 }}>{r.states}</p>
          </button>
        );
      })}
    </div>
  );
}

function BrazilCropPicker({ crop, onChange }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {BRAZIL_CROPS.map(c => {
        const active = c.id === crop;
        return (
          <button key={c.id} onClick={() => onChange(c.id)}
            style={{
              padding: "7px 14px", borderRadius: 7,
              background: active ? c.color + "18" : "transparent",
              border: `1px solid ${active ? c.color : C.border}`,
              color:  active ? c.color : C.textMuted,
              fontSize: 12, fontWeight: active ? 700 : 400, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6
            }}>
            <span>{c.emoji}</span>
            {c.name}
          </button>
        );
      })}
    </div>
  );
}

function BrazilFarmSizePicker({ size, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
      {BRAZIL_FARM_SIZES.map(s => {
        const active = s.id === size;
        return (
          <button key={s.id} onClick={() => onChange(s.id)}
            style={{
              background: active ? s.color + "12" : C.panel,
              border: `1px solid ${active ? s.color : C.borderSubtle}`,
              borderRadius: 10, padding: "11px 13px",
              cursor: "pointer", textAlign: "left", transition: "all 0.15s"
            }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <span style={{ color: active ? s.color : C.text, fontSize: 12.5, fontWeight: 700 }}>{s.label}</span>
              <span style={{ color: s.color, fontSize: 10, fontFamily: "'DM Mono',monospace" }}>{s.range}</span>
            </div>
            <p style={{ color: C.textDim, fontSize: 10, margin: 0 }}>
              ≈ {fmtNum(s.avgHa)} ha typical · {s.sharePct}% of farms · {s.landSharePct}% of land
            </p>
          </button>
        );
      })}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   8. ECONOMICS ENGINE  (pure functions, no UI)
   ───────────────────────────────────────────────────────────────────────────
   These are the calculations that drive every visual on the Brazil page.
   ═══════════════════════════════════════════════════════════════════════════ */

function buildBaseline(regionId, cropId, sizeId) {
  const cropDef = BRAZIL_ECON.crops[cropId];
  const region  = cropDef.regions[regionId];
  const size    = BRAZIL_FARM_SIZES.find(s => s.id === sizeId);
  const yieldT  = region.yield  * (1 + size.yieldPenaltyPct / 100);
  const cInf    = 1 + size.costInflationPct / 100;

  // Build editable mix from defaults — kg of product per hectare
  const mix = { ...cropDef.defaultMix };

  // Other costs: scale by farm-size cost inflation
  const other = Object.fromEntries(
    Object.entries(cropDef.otherCosts).map(([k, v]) => [k, Math.round(v * cInf)])
  );

  return {
    regionId, cropId, sizeId,
    farmHa:   size.avgHa,
    yieldT:   Number(yieldT.toFixed(2)),
    priceBRL: region.price,
    fertMix:  mix,
    otherCosts: other,
  };
}

function computeFertCost(mix) {
  // Returns total R$/ha and per-product breakdown
  const breakdown = Object.entries(mix).map(([prod, kg]) => {
    const pricePerT = BRAZIL_ECON.fertilizerPrices[prod] || 0;
    const cost = (kg * pricePerT) / 1000;
    return { product: prod, kg, costBRL: Math.round(cost) };
  }).filter(r => r.kg > 0);
  const total = breakdown.reduce((s, r) => s + r.costBRL, 0);
  return { breakdown, total };
}

function computeNutrientsApplied(mix) {
  let N = 0, P2O5 = 0, K2O = 0, S = 0;
  Object.entries(mix).forEach(([prod, kg]) => {
    const c = BRAZIL_ECON.nutrientContent[prod];
    if (!c) return;
    N    += kg * c.N;
    P2O5 += kg * c.P2O5;
    K2O  += kg * c.K2O;
    S    += kg * c.S;
  });
  return { N: +N.toFixed(1), P2O5: +P2O5.toFixed(1), K2O: +K2O.toFixed(1), S: +S.toFixed(1) };
}

function computePnL(state) {
  const { yieldT, priceBRL, fertMix, otherCosts, farmHa } = state;
  const fert = computeFertCost(fertMix);

  const revenuePerHa = yieldT * priceBRL;
  const fertCostPerHa = fert.total;

  // Cost categories
  const variableCosts = {
    "Seeds":          otherCosts.seeds          || 0,
    "Fertilizers":    fertCostPerHa,
    "Agrochemicals":  otherCosts.agrochemicals  || 0,
    "Fuel & Machinery": otherCosts.fuelMachinery|| 0,
    "Labor":          otherCosts.labor          || 0,
    "Drying":         otherCosts.drying         || 0,
    "Freight to port":otherCosts.freight        || 0,
  };
  const fixedCosts = {
    "Land rent":   otherCosts.landRent  || 0,
    "Financing":   otherCosts.financing || 0,
    "Insurance":   otherCosts.insurance || 0,
    "Admin & overhead": otherCosts.admin || 0,
  };

  const totalVariable = Object.values(variableCosts).reduce((a, b) => a + b, 0);
  const totalFixed    = Object.values(fixedCosts).reduce((a, b) => a + b, 0);
  const contributionMargin = revenuePerHa - totalVariable;
  const ebitda             = contributionMargin - (fixedCosts["Land rent"] + fixedCosts["Insurance"] + fixedCosts["Admin & overhead"]);
  const netIncome          = revenuePerHa - totalVariable - totalFixed;

  // Per farm
  const farmRevenue   = revenuePerHa * farmHa;
  const farmNetIncome = netIncome     * farmHa;

  // Break-even
  const breakEvenPrice = (totalVariable + totalFixed) / Math.max(yieldT, 0.0001); // R$/t
  const breakEvenYield = (totalVariable + totalFixed) / Math.max(priceBRL, 0.0001); // t/ha

  return {
    revenuePerHa, totalVariable, totalFixed,
    contributionMargin, ebitda, netIncome,
    farmRevenue, farmNetIncome,
    variableCosts, fixedCosts,
    breakEvenPrice, breakEvenYield,
    fertBreakdown: fert.breakdown, fertCostPerHa,
    marginPct: revenuePerHa > 0 ? (netIncome / revenuePerHa) * 100 : 0,
    cmPct:     revenuePerHa > 0 ? (contributionMargin / revenuePerHa) * 100 : 0,
  };
}


/* ═══════════════════════════════════════════════════════════════════════════
   9. BRAZIL PAGE — main farmer-economics interface
   ═══════════════════════════════════════════════════════════════════════════ */

function BrazilPage() {
  /* ── State ───────────────────────────────────────────────────────────── */
  const [regionId, setRegionId] = useState("cerrado");
  const [cropId,   setCropId]   = useState("soybean");
  const [sizeId,   setSizeId]   = useState("medium");
  const [ccy,      setCcy]      = useState("BRL");

  // Editable baseline — re-derived when keys change but user can override
  const [baseline, setBaseline] = useState(() => buildBaseline("cerrado", "soybean", "medium"));

  // Saved scenarios
  const [scenarios, setScenarios] = useState([]);

  // Reset baseline whenever R/C/S changes
  useEffect(() => {
    setBaseline(buildBaseline(regionId, cropId, sizeId));
  }, [regionId, cropId, sizeId]);

  /* ── Derived ─────────────────────────────────────────────────────────── */
  const region = BRAZIL_REGIONS.find(r => r.id === regionId);
  const crop   = BRAZIL_CROPS.find(c => c.id === cropId);
  const size   = BRAZIL_FARM_SIZES.find(s => s.id === sizeId);

  const pnl = useMemo(() => computePnL(baseline), [baseline]);
  const nutrients = useMemo(() => computeNutrientsApplied(baseline.fertMix), [baseline.fertMix]);
  const recNutrients = BRAZIL_ECON.crops[cropId].regions[regionId];

  /* ── Helper updaters ─────────────────────────────────────────────────── */
  const updateMix = (prod, kg) => setBaseline(b => ({ ...b, fertMix: { ...b.fertMix, [prod]: kg } }));
  const updateOther = (k,  v)  => setBaseline(b => ({ ...b, otherCosts: { ...b.otherCosts, [k]: v } }));
  const updateField = (k,  v)  => setBaseline(b => ({ ...b, [k]: v }));

  /* ── Sensitivity (±20 % swing on each driver, holding others constant)  */
  const sensitivity = useMemo(() => {
    const drivers = [
      { key: "Crop price",    apply: x => ({ ...baseline, priceBRL: baseline.priceBRL * x }) },
      { key: "Yield",         apply: x => ({ ...baseline, yieldT: baseline.yieldT * x }) },
      { key: "Fertilizer cost", apply: x => ({ ...baseline,
            fertMix: Object.fromEntries(Object.entries(baseline.fertMix).map(([k,v]) => [k, v * x])) }) },
      { key: "Other variable",  apply: x => ({ ...baseline,
            otherCosts: { ...baseline.otherCosts,
              seeds:         baseline.otherCosts.seeds         * x,
              agrochemicals: baseline.otherCosts.agrochemicals * x,
              fuelMachinery: baseline.otherCosts.fuelMachinery * x } }) },
      { key: "Land rent",       apply: x => ({ ...baseline,
            otherCosts: { ...baseline.otherCosts, landRent: baseline.otherCosts.landRent * x } }) },
    ];
    const base = pnl.netIncome;
    return drivers.map(d => {
      const lo = computePnL(d.apply(0.8)).netIncome;
      const hi = computePnL(d.apply(1.2)).netIncome;
      return {
        driver: d.key,
        low:  lo - base,        // negative when -20% swing reduces NI
        high: hi - base,
        absRange: Math.abs(hi - lo),
      };
    }).sort((a, b) => b.absRange - a.absRange);
  }, [baseline, pnl.netIncome]);

  /* ── Save scenario ───────────────────────────────────────────────────── */
  const saveScenario = () => {
    if (scenarios.length >= 4) return;
    setScenarios([...scenarios, {
      id: Date.now(),
      label: `${region.name.split(" ")[0]} · ${crop.name.split(" ")[0]} · ${size.label}`,
      regionId, cropId, sizeId,
      baseline: JSON.parse(JSON.stringify(baseline)),
      pnl: { ...pnl },
    }]);
  };
  const removeScenario = id => setScenarios(scenarios.filter(s => s.id !== id));

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Header strip with Brazil flag image as subtle banner */}
      <div style={{
        position: "relative", borderRadius: 14, overflow: "hidden",
        border: `1px solid ${C.borderSubtle}`, background: C.panel
      }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <img src="/brazil.jpg" alt="" style={{
            width: "100%", height: "100%", objectFit: "cover",
            opacity: 0.18, filter: "saturate(1.2)"
          }}
          onError={e => e.currentTarget.style.display = "none"}/>
          <div style={{ position: "absolute", inset: 0,
            background: "linear-gradient(90deg,rgba(8,14,24,0.96) 0%,rgba(8,14,24,0.55) 100%)"
          }}/>
        </div>
        <div style={{ position: "relative", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div>
            <p style={{ color: C.emerald, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>
              Brazil · Farmer Economics Engine
            </p>
            <h1 style={{ color: C.text, fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", margin: 0 }}>
              Step inside a {size.label.toLowerCase()} growing {crop.name.toLowerCase()} in {region.name}.
            </h1>
            <p style={{ color: C.textMuted, fontSize: 12, marginTop: 6 }}>
              Every input below feeds the cost stack, the P&amp;L and the break-even — change anything and watch the farmer's economics move in real time.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Segmented value={ccy} onChange={setCcy} accent={C.emerald}
              options={[{ label: "R$ BRL", value: "BRL" }, { label: "US$", value: "USD" }]}/>
          </div>
        </div>
      </div>

      {/* National KPIs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {BRAZIL_KPIS.map((k, i) => <KPICard key={i} {...k}/>)}
      </div>

      {/* ─── Pickers ───────────────────────────────────────────────────── */}
      <div className="card" style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: "16px 18px"
      }}>
        <SectionTitle eyebrow="Step 1 — Choose your farm" title="Region · Crop · Farm size"
          accent={C.emerald}/>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <p style={{ color: C.textDim, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Region</p>
            <BrazilRegionPicker region={regionId} onChange={setRegionId}/>
          </div>
          <div>
            <p style={{ color: C.textDim, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Crop</p>
            <BrazilCropPicker crop={cropId} onChange={setCropId}/>
          </div>
          <div>
            <p style={{ color: C.textDim, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Farm size archetype</p>
            <BrazilFarmSizePicker size={sizeId} onChange={setSizeId}/>
          </div>
        </div>

        {/* Region & farm context strip */}
        <div style={{
          marginTop: 16, padding: "12px 14px", background: C.bg,
          border: `1px solid ${region.flagColor}25`, borderLeft: `3px solid ${region.flagColor}`,
          borderRadius: 8
        }}>
          <p style={{ color: region.flagColor, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>
            {region.name} · context
          </p>
          <p style={{ color: C.text, fontSize: 12.5, lineHeight: 1.65, margin: "0 0 8px" }}>{region.blurb}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10, marginTop: 6 }}>
            <div><span style={{ color: C.textDim, fontSize: 10 }}>SOIL · </span><span style={{ color: C.textMuted, fontSize: 11 }}>{region.soil}</span></div>
            <div><span style={{ color: C.textDim, fontSize: 10 }}>CLIMATE · </span><span style={{ color: C.textMuted, fontSize: 11 }}>{region.climate}</span></div>
            <div><span style={{ color: C.textDim, fontSize: 10 }}>LOGISTICS · </span><span style={{ color: C.textMuted, fontSize: 11 }}>{region.logistics}</span></div>
          </div>
          <p style={{ color: C.textDim, fontSize: 10.5, marginTop: 10 }}>
            <strong style={{ color: C.textMuted }}>{size.label} profile · </strong>
            {size.profile} <em style={{ color: C.textFaint }}>Tech adoption: {size.techAdoption} · Coop reliance: {size.coopReliance}</em>
          </p>
        </div>
      </div>

      {/* ─── Yield & price + farm-level summary ───────────────────────── */}
      <div className="card" style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: "16px 18px"
      }}>
        <SectionTitle eyebrow="Step 2 — Set the farmer's reality"
          title="Yield, price, and farm size"
          accent={C.cyan}
          right={
            <span style={{ color: C.textDim, fontSize: 11 }}>
              National avg: <strong style={{ color: crop.color }}>{crop.nationalYield} t/ha</strong> · Global: {crop.globalYield} t/ha
            </span>
          }/>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
          <FieldBlock label="Yield"  hint={`Reg. baseline ${BRAZIL_ECON.crops[cropId].regions[regionId].yield.toFixed(1)} t/ha`}>
            <EditableNumber value={baseline.yieldT} step={0.1} min={0} max={500}
              onChange={v => updateField("yieldT", v)} suffix="t/ha" accent={crop.color} width={110}/>
          </FieldBlock>
          <FieldBlock label="Farm-gate price" hint={`Reg. baseline ${fmtBRL(BRAZIL_ECON.crops[cropId].regions[regionId].price)} /t`}>
            <EditableNumber value={baseline.priceBRL} step={10} min={0} max={1000000}
              onChange={v => updateField("priceBRL", v)} suffix="R$/t" accent={crop.color} width={130}/>
          </FieldBlock>
          <FieldBlock label="Farm size" hint={`Archetype default ${fmtNum(size.avgHa)} ha`}>
            <EditableNumber value={baseline.farmHa} step={10} min={1} max={100000}
              onChange={v => updateField("farmHa", v)} suffix="ha" accent={size.color} width={110}/>
          </FieldBlock>
          <FieldBlock label="FX (R$/US$)" hint="Avg 2024–25 reference">
            <span style={{ color: C.textMuted, fontFamily: "'DM Mono',monospace", fontSize: 13 }}>{FX_BRL_USD.toFixed(2)}</span>
          </FieldBlock>
        </div>
      </div>

      {/* ─── Fertilization ──────────────────────────────────────────────── */}
      <div className="card" style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: "16px 18px"
      }}>
        <SectionTitle eyebrow="Step 3 — Build the fertilization program"
          title="Product mix · nutrient delivery · cost per hectare"
          accent={C.violet}/>

        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
          {/* Editable mix */}
          <div>
            <p style={{ color: C.textDim, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              Application rate (kg of product per hectare)
            </p>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  <th style={{ textAlign: "left",  padding: "6px 4px", color: C.textDim, fontSize: 10, fontWeight: 600 }}>Product</th>
                  <th style={{ textAlign: "right", padding: "6px 4px", color: C.textDim, fontSize: 10, fontWeight: 600 }}>Rate</th>
                  <th style={{ textAlign: "right", padding: "6px 4px", color: C.textDim, fontSize: 10, fontWeight: 600 }}>R$/t</th>
                  <th style={{ textAlign: "right", padding: "6px 4px", color: C.textDim, fontSize: 10, fontWeight: 600 }}>Cost R$/ha</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(BRAZIL_ECON.nutrientContent).map(prod => {
                  const kg = baseline.fertMix[prod] || 0;
                  const price = BRAZIL_ECON.fertilizerPrices[prod];
                  const cost = (kg * price) / 1000;
                  return (
                    <tr key={prod} style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
                      <td style={{ padding: "8px 4px", color: C.text, fontWeight: 600 }}>
                        {prod}
                        <span style={{ color: C.textFaint, fontSize: 9, marginLeft: 6, fontFamily: "'DM Mono',monospace" }}>
                          {Math.round(BRAZIL_ECON.nutrientContent[prod].N*100)}-
                          {Math.round(BRAZIL_ECON.nutrientContent[prod].P2O5*100)}-
                          {Math.round(BRAZIL_ECON.nutrientContent[prod].K2O*100)}
                          {BRAZIL_ECON.nutrientContent[prod].S > 0 ? `+${Math.round(BRAZIL_ECON.nutrientContent[prod].S*100)}S` : ""}
                        </span>
                      </td>
                      <td style={{ padding: "6px 4px", textAlign: "right" }}>
                        <EditableNumber value={kg} step={10} min={0} max={2000}
                          onChange={v => updateMix(prod, v)} suffix="kg" width={90} accent={C.violet}/>
                      </td>
                      <td style={{ padding: "6px 4px", textAlign: "right", color: C.textMuted, fontFamily: "'DM Mono',monospace" }}>
                        {fmtNum(price)}
                      </td>
                      <td style={{ padding: "6px 4px", textAlign: "right", color: kg > 0 ? C.text : C.textFaint, fontFamily: "'DM Mono',monospace", fontWeight: 600 }}>
                        {fmtNum(cost)}
                      </td>
                    </tr>
                  );
                })}
                <tr>
                  <td colSpan={3} style={{ padding: "10px 4px", textAlign: "right", color: C.textMuted, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Total fertilizer cost</td>
                  <td style={{ padding: "10px 4px", textAlign: "right", color: C.violet, fontFamily: "'DM Mono',monospace", fontWeight: 700, fontSize: 14 }}>{fmtBRL(pnl.fertCostPerHa)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Nutrient delivered vs recommended */}
          <div>
            <p style={{ color: C.textDim, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
              Nutrient delivery vs Embrapa recommendation
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart layout="vertical" data={[
                { nutrient: "N",    applied: nutrients.N,    recommended: recNutrients.n },
                { nutrient: "P₂O₅", applied: nutrients.P2O5, recommended: recNutrients.p },
                { nutrient: "K₂O",  applied: nutrients.K2O,  recommended: recNutrients.k },
                { nutrient: "S",    applied: nutrients.S,    recommended: 20 },
              ]} margin={{ left: 30, right: 18 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false}/>
                <XAxis type="number" tick={{ fill: C.textDim, fontSize: 10 }}/>
                <YAxis type="category" dataKey="nutrient" tick={{ fill: C.textMuted, fontSize: 11, fontWeight: 700 }} width={45}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend wrapperStyle={{ fontSize: 10 }}/>
                <Bar dataKey="applied"     name="Applied (kg/ha)"      fill={C.cyan}  radius={[0,4,4,0]}/>
                <Bar dataKey="recommended" name="Recommended (kg/ha)" fill={C.amber} radius={[0,4,4,0]} fillOpacity={0.55}/>
              </BarChart>
            </ResponsiveContainer>
            <p style={{ color: C.textFaint, fontSize: 10.5, marginTop: 6, lineHeight: 1.55 }}>
              Per Embrapa nutrient guidance (Module A, p.19, p.23–29). S target of 20 kg/ha is a typical Brazilian deficiency-correction baseline; sandy oxisols and newly cleared frontier soils may need more.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Other costs editor ─────────────────────────────────────────── */}
      <div className="card" style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: "16px 18px"
      }}>
        <SectionTitle eyebrow="Step 4 — Edit the rest of the cost stack"
          title="Variable & fixed costs (R$/ha)"
          accent={C.amber}/>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <CostBlock title="Variable costs" color={C.amber} items={[
            ["seeds",         "Seeds"],
            ["agrochemicals", "Agrochemicals (herbicide / insecticide / fungicide)"],
            ["fuelMachinery", "Fuel & machinery operation"],
            ["labor",         "Labor"],
            ["drying",        "Drying"],
            ["freight",       "Freight to port"],
          ]} costs={baseline.otherCosts} onChange={updateOther}/>

          <CostBlock title="Fixed costs" color={C.indigo} items={[
            ["landRent",  "Land rent"],
            ["financing", "Financing (rural credit interest)"],
            ["insurance", "Crop insurance"],
            ["admin",     "Admin & overhead"],
          ]} costs={baseline.otherCosts} onChange={updateOther}/>
        </div>
      </div>

      {/* ─── P&L Waterfall + KPIs ───────────────────────────────────────── */}
      <PnLSection pnl={pnl} ccy={ccy} crop={crop} farmHa={baseline.farmHa}/>

      {/* ─── Break-even & sensitivity ───────────────────────────────────── */}
      <div className="card" style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: "16px 18px"
      }}>
        <SectionTitle eyebrow="Step 6 — Stress test"
          title="Break-even economics & sensitivity tornado"
          accent={C.rose}/>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16 }}>
          <BreakEvenPanel pnl={pnl} crop={crop} baseline={baseline} ccy={ccy}/>
          <SensitivityTornado data={sensitivity} ccy={ccy}/>
        </div>
      </div>

      {/* ─── Scenario comparison ────────────────────────────────────────── */}
      <ScenarioPanel scenarios={scenarios} onSave={saveScenario} onRemove={removeScenario}
        currentLabel={`${region.name.split(" ")[0]} · ${crop.name.split(" ")[0]} · ${size.label}`}
        currentPnl={pnl} currentFarmHa={baseline.farmHa} ccy={ccy}/>

      {/* ─── Strategic insights drawn from the deck ─────────────────────── */}
      <BrazilStrategicCorner regionId={regionId} cropId={cropId}/>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   10. SUPPORTING SUB-COMPONENTS for Brazil page
   ═══════════════════════════════════════════════════════════════════════════ */

function FieldBlock({ label, hint, children }) {
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px" }}>
      <p style={{ color: C.textDim, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{label}</p>
      <div>{children}</div>
      {hint && <p style={{ color: C.textFaint, fontSize: 10, marginTop: 6 }}>{hint}</p>}
    </div>
  );
}

function CostBlock({ title, color, items, costs, onChange }) {
  const total = items.reduce((s, [k]) => s + (costs[k] || 0), 0);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <p style={{ color: color, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700, margin: 0 }}>{title}</p>
        <p style={{ color: color, fontSize: 13, fontFamily: "'DM Mono',monospace", fontWeight: 700, margin: 0 }}>
          R$ {fmtNum(total)} <span style={{ color: C.textDim, fontSize: 10, fontWeight: 400 }}>/ ha</span>
        </p>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <tbody>
          {items.map(([key, label]) => (
            <tr key={key} style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
              <td style={{ padding: "8px 4px", color: C.text, lineHeight: 1.3 }}>{label}</td>
              <td style={{ padding: "6px 4px", textAlign: "right", width: 130 }}>
                <EditableNumber value={costs[key] || 0} step={20} min={0} max={50000}
                  onChange={v => onChange(key, v)} suffix="R$" accent={color} width={100}/>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PnLSection({ pnl, ccy, crop, farmHa }) {
  const fmt = v => ccy === "USD" ? fmtUSD(v / FX_BRL_USD) : fmtBRL(v);

  // Build waterfall data
  const waterfall = [
    { name: "Revenue",          value:  pnl.revenuePerHa,   fill: C.emerald, type: "in" },
    ...Object.entries(pnl.variableCosts).map(([n, v]) => ({ name: n, value: -v, fill: C.amber, type: "out" })),
    { name: "Contribution margin", value: pnl.contributionMargin, fill: C.cyan, type: "subtotal" },
    ...Object.entries(pnl.fixedCosts).map(([n, v]) => ({ name: n, value: -v, fill: C.violet, type: "out" })),
    { name: "Net income / ha", value: pnl.netIncome, fill: pnl.netIncome >= 0 ? C.emerald : C.rose, type: "total" },
  ];

  // Cumulative for waterfall positioning
  let cum = 0;
  const wf = waterfall.map(w => {
    if (w.type === "in" || w.type === "subtotal" || w.type === "total") {
      const start = w.type === "in" ? 0 : cum;
      if (w.type !== "in") cum = w.value;     // subtotal/total reset baseline
      else cum = w.value;
      return { ...w, base: w.type === "in" ? 0 : (w.type === "subtotal" ? 0 : 0), display: w.value };
    } else {
      const newCum = cum + w.value;            // value is negative
      const item = { ...w, base: newCum, display: -w.value };
      cum = newCum;
      return item;
    }
  });

  return (
    <div className="card" style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "16px 18px"
    }}>
      <SectionTitle eyebrow="Step 5 — The farmer's P&L"
        title="From revenue to net income — per hectare and per farm"
        accent={C.emerald}
        right={
          <span style={{ color: C.textDim, fontSize: 11 }}>
            Per ha · Farm: <strong style={{ color: C.text }}>{fmtNum(farmHa)} ha</strong>
          </span>
        }/>

      {/* Headline KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8, marginBottom: 16 }}>
        <PnlKpi label="Revenue / ha"    value={fmt(pnl.revenuePerHa)}      accent={C.emerald}/>
        <PnlKpi label="Variable costs"  value={fmt(pnl.totalVariable)}     accent={C.amber}/>
        <PnlKpi label="Contribution"    value={fmt(pnl.contributionMargin)} sub={`${pnl.cmPct.toFixed(0)}% margin`} accent={C.cyan}/>
        <PnlKpi label="Fixed costs"     value={fmt(pnl.totalFixed)}        accent={C.violet}/>
        <PnlKpi label="Net income / ha" value={fmt(pnl.netIncome)}         sub={`${pnl.marginPct.toFixed(0)}% margin`}
          accent={pnl.netIncome >= 0 ? C.emerald : C.rose}/>
        <PnlKpi label="Farm net income" value={fmt(pnl.netIncome * farmHa)} sub={`${fmtNum(farmHa)} ha total`}
          accent={pnl.netIncome >= 0 ? C.emerald : C.rose}/>
      </div>

      {/* Waterfall */}
      <p style={{ color: C.textDim, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Waterfall · R$/ha</p>
      <ResponsiveContainer width="100%" height={310}>
        <BarChart data={wf} margin={{ top: 8, right: 16, bottom: 60, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
          <XAxis dataKey="name" tick={{ fill: C.textDim, fontSize: 9 }} angle={-30} textAnchor="end" height={60} interval={0}/>
          <YAxis tick={{ fill: C.textDim, fontSize: 10 }} tickFormatter={v => v >= 1000 ? (v/1000).toFixed(1) + "k" : v.toString()}/>
          <Tooltip content={<CustomTooltip/>}/>
          <Bar dataKey="base" stackId="a" fill="transparent"/>
          <Bar dataKey="display" stackId="a" radius={[3,3,0,0]}>
            {wf.map((d, i) => <Cell key={i} fill={d.fill}/>)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Cost composition (donut alt — actually a horizontal stack) */}
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <CostMixDonut title="Variable cost composition" data={pnl.variableCosts} palette={[C.amber, C.violet, C.cyan, C.indigo, C.emerald, C.rose, C.slate]}/>
        <CostMixDonut title="Fixed cost composition"    data={pnl.fixedCosts}    palette={[C.indigo, C.violet, C.cyan, C.amber]}/>
      </div>
    </div>
  );
}

function PnlKpi({ label, value, sub, accent }) {
  return (
    <div style={{
      background: C.bg, border: `1px solid ${accent}25`,
      borderTop: `2px solid ${accent}`, borderRadius: 8,
      padding: "10px 12px"
    }}>
      <p style={{ color: C.textDim, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{label}</p>
      <p style={{ color: accent, fontSize: 16, fontWeight: 700, fontFamily: "'DM Mono',monospace", margin: 0 }}>{value}</p>
      {sub && <p style={{ color: C.textFaint, fontSize: 10, marginTop: 2 }}>{sub}</p>}
    </div>
  );
}

function CostMixDonut({ title, data, palette }) {
  const arr = Object.entries(data)
    .filter(([_, v]) => v > 0)
    .map(([n, v], i) => ({ name: n, value: v, color: palette[i % palette.length] }));
  const total = arr.reduce((s, x) => s + x.value, 0);

  return (
    <div>
      <p style={{ color: C.textDim, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>{title}</p>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ width: 130, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={arr} cx="50%" cy="50%" innerRadius={36} outerRadius={60} dataKey="value" paddingAngle={1}>
                {arr.map((d, i) => <Cell key={i} fill={d.color}/>)}
              </Pie>
              <Tooltip formatter={(v, n) => [fmtBRL(v), n]}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1 }}>
          {arr.map((d, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 11, borderBottom: `1px solid ${C.borderSubtle}` }}>
              <span style={{ color: C.textMuted, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, background: d.color, borderRadius: 2 }}/>
                {d.name}
              </span>
              <span style={{ color: C.text, fontFamily: "'DM Mono',monospace" }}>
                {((d.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BreakEvenPanel({ pnl, crop, baseline, ccy }) {
  const fmt = v => ccy === "USD" ? fmtUSD(v / FX_BRL_USD) : fmtBRL(v);
  const priceMargin = baseline.priceBRL > 0 ? ((baseline.priceBRL - pnl.breakEvenPrice) / baseline.priceBRL) * 100 : 0;
  const yieldMargin = baseline.yieldT  > 0 ? ((baseline.yieldT  - pnl.breakEvenYield) / baseline.yieldT)  * 100 : 0;

  return (
    <div>
      <p style={{ color: C.textDim, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Break-even economics</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <BreakEvenRow label="Break-even price" value={fmt(pnl.breakEvenPrice) + " /t"}
          current={fmt(baseline.priceBRL) + " /t"} margin={priceMargin}/>
        <BreakEvenRow label="Break-even yield" value={pnl.breakEvenYield.toFixed(2) + " t/ha"}
          current={baseline.yieldT.toFixed(2) + " t/ha"} margin={yieldMargin}/>
      </div>

      <div style={{ marginTop: 14, padding: "12px 14px", background: C.bg, borderRadius: 8, border: `1px solid ${pnl.netIncome >= 0 ? C.emerald + "30" : C.rose + "30"}` }}>
        <p style={{ color: pnl.netIncome >= 0 ? C.emerald : C.rose, fontSize: 11, fontWeight: 700, marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {pnl.netIncome >= 0 ? "Above water" : "Below break-even"}
        </p>
        <p style={{ color: C.textMuted, fontSize: 11.5, lineHeight: 1.6, margin: 0 }}>
          At <strong style={{ color: C.text }}>{fmt(baseline.priceBRL)}/t</strong> and <strong style={{ color: C.text }}>{baseline.yieldT.toFixed(2)} t/ha</strong>, the farmer earns <strong style={{ color: pnl.netIncome >= 0 ? C.emerald : C.rose }}>{fmt(pnl.netIncome)}/ha</strong>.
          Yield could fall <strong style={{ color: C.text }}>{Math.max(yieldMargin, 0).toFixed(0)}%</strong> or price could fall <strong style={{ color: C.text }}>{Math.max(priceMargin, 0).toFixed(0)}%</strong> before the operation goes into the red.
        </p>
      </div>
    </div>
  );
}

function BreakEvenRow({ label, value, current, margin }) {
  const safe = margin >= 0;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7 }}>
      <div>
        <p style={{ color: C.textDim, fontSize: 10, margin: 0, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
        <p style={{ color: C.text, fontSize: 14, fontWeight: 700, fontFamily: "'DM Mono',monospace", margin: "2px 0 0" }}>{value}</p>
      </div>
      <div style={{ textAlign: "right" }}>
        <p style={{ color: C.textDim, fontSize: 10, margin: 0 }}>Current</p>
        <p style={{ color: C.textMuted, fontSize: 12, fontFamily: "'DM Mono',monospace", margin: "2px 0 0" }}>{current}</p>
        <p style={{ color: safe ? C.emerald : C.rose, fontSize: 11, fontWeight: 700, margin: "3px 0 0", fontFamily: "'DM Mono',monospace" }}>
          {safe ? "+" : ""}{margin.toFixed(0)}% buffer
        </p>
      </div>
    </div>
  );
}

function SensitivityTornado({ data, ccy }) {
  const max = Math.max(...data.map(d => Math.max(Math.abs(d.low), Math.abs(d.high))));
  const fmt = v => ccy === "USD" ? "US$" + Math.round(v / FX_BRL_USD).toLocaleString() : "R$" + Math.round(v).toLocaleString();

  return (
    <div>
      <p style={{ color: C.textDim, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
        Sensitivity tornado · ±20% on each driver, holding others constant
      </p>
      <p style={{ color: C.textFaint, fontSize: 10, marginBottom: 8 }}>
        Bars show change in <strong style={{ color: C.textMuted }}>net income / ha</strong> when driver moves ±20%. Sorted by impact magnitude.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {data.map((d, i) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span style={{ color: C.text, fontSize: 11, fontWeight: 600 }}>{d.driver}</span>
              <span style={{ color: C.textDim, fontSize: 10, fontFamily: "'DM Mono',monospace" }}>
                Δ {fmt(d.absRange)}
              </span>
            </div>
            <div style={{ position: "relative", height: 20, background: C.bg, borderRadius: 4, border: `1px solid ${C.borderSubtle}` }}>
              {/* Center line */}
              <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: C.textDim, opacity: 0.5 }}/>
              {/* Negative bar (low) */}
              {d.low < 0 && (
                <div style={{
                  position: "absolute", right: "50%", top: 2, bottom: 2,
                  width: `${(Math.abs(d.low) / max) * 50}%`,
                  background: `linear-gradient(90deg,${C.rose},${C.rose}88)`, borderRadius: "3px 0 0 3px"
                }}>
                  <span style={{ position: "absolute", left: 4, top: 1, color: "#fff", fontSize: 9, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>
                    {fmt(d.low)}
                  </span>
                </div>
              )}
              {d.high > 0 && (
                <div style={{
                  position: "absolute", left: "50%", top: 2, bottom: 2,
                  width: `${(Math.abs(d.high) / max) * 50}%`,
                  background: `linear-gradient(90deg,${C.emerald}88,${C.emerald})`, borderRadius: "0 3px 3px 0"
                }}>
                  <span style={{ position: "absolute", right: 4, top: 1, color: "#fff", fontSize: 9, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>
                    +{fmt(d.high)}
                  </span>
                </div>
              )}
              {/* Inverse cases (when -20% boosts NI, e.g. cost reductions) */}
              {d.low > 0 && (
                <div style={{
                  position: "absolute", left: "50%", top: 2, bottom: 2,
                  width: `${(d.low / max) * 50}%`,
                  background: `linear-gradient(90deg,${C.emerald}55,${C.emerald}88)`, borderRadius: "0 3px 3px 0"
                }}/>
              )}
              {d.high < 0 && (
                <div style={{
                  position: "absolute", right: "50%", top: 2, bottom: 2,
                  width: `${(Math.abs(d.high) / max) * 50}%`,
                  background: `linear-gradient(90deg,${C.rose}88,${C.rose}55)`, borderRadius: "3px 0 0 3px"
                }}/>
              )}
            </div>
          </div>
        ))}
      </div>

      <p style={{ color: C.textFaint, fontSize: 10, marginTop: 12, lineHeight: 1.6 }}>
        <span style={{ color: C.rose }}>■</span> Adverse swing (NI falls) &nbsp;
        <span style={{ color: C.emerald }}>■</span> Favourable swing (NI rises) — read against the centre line.
      </p>
    </div>
  );
}

function ScenarioPanel({ scenarios, onSave, onRemove, currentLabel, currentPnl, currentFarmHa, ccy }) {
  const fmt = v => ccy === "USD" ? fmtUSD(v / FX_BRL_USD) : fmtBRL(v);

  return (
    <div className="card" style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "16px 18px"
    }}>
      <SectionTitle eyebrow="Step 7 — Compare scenarios"
        title="Save up to 4 farmer profiles and benchmark them side-by-side"
        accent={C.indigo}
        right={
          <button onClick={onSave} disabled={scenarios.length >= 4}
            style={{
              padding: "6px 14px", borderRadius: 6,
              background: scenarios.length >= 4 ? C.bg : C.indigo + "22",
              border: `1px solid ${scenarios.length >= 4 ? C.border : C.indigo}`,
              color: scenarios.length >= 4 ? C.textFaint : C.indigo,
              cursor: scenarios.length >= 4 ? "default" : "pointer",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase"
            }}>
            + Save current scenario
          </button>
        }/>

      {scenarios.length === 0 ? (
        <div style={{ padding: "24px 16px", textAlign: "center", border: `1px dashed ${C.border}`, borderRadius: 8 }}>
          <p style={{ color: C.textMuted, fontSize: 12, margin: "0 0 4px" }}>No scenarios saved yet.</p>
          <p style={{ color: C.textFaint, fontSize: 11, margin: 0 }}>
            Adjust the inputs above, then save the current setup. Build a second one (different region, crop or fert mix) to see the delta.
          </p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <th style={{ textAlign: "left",  padding: "8px 10px", color: C.textDim, fontSize: 10, fontWeight: 600 }}>Scenario</th>
                <th style={{ textAlign: "right", padding: "8px 10px", color: C.textDim, fontSize: 10, fontWeight: 600 }}>Yield (t/ha)</th>
                <th style={{ textAlign: "right", padding: "8px 10px", color: C.textDim, fontSize: 10, fontWeight: 600 }}>Price (R$/t)</th>
                <th style={{ textAlign: "right", padding: "8px 10px", color: C.textDim, fontSize: 10, fontWeight: 600 }}>Revenue/ha</th>
                <th style={{ textAlign: "right", padding: "8px 10px", color: C.textDim, fontSize: 10, fontWeight: 600 }}>Fert cost/ha</th>
                <th style={{ textAlign: "right", padding: "8px 10px", color: C.textDim, fontSize: 10, fontWeight: 600 }}>Net income/ha</th>
                <th style={{ textAlign: "right", padding: "8px 10px", color: C.textDim, fontSize: 10, fontWeight: 600 }}>Farm NI</th>
                <th style={{ textAlign: "right", padding: "8px 10px", color: C.textDim, fontSize: 10, fontWeight: 600 }}>vs Current</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {/* Current row */}
              <tr style={{ background: C.cyan + "08", borderBottom: `1px solid ${C.borderSubtle}` }}>
                <td style={{ padding: "10px", color: C.cyan, fontWeight: 700 }}>● {currentLabel} <span style={{ color: C.textDim, fontSize: 10, fontWeight: 400 }}>(live)</span></td>
                <td style={{ padding: "10px", textAlign: "right", color: C.textMuted, fontFamily: "'DM Mono',monospace" }}>—</td>
                <td style={{ padding: "10px", textAlign: "right", color: C.textMuted, fontFamily: "'DM Mono',monospace" }}>—</td>
                <td style={{ padding: "10px", textAlign: "right", color: C.text, fontFamily: "'DM Mono',monospace" }}>{fmt(currentPnl.revenuePerHa)}</td>
                <td style={{ padding: "10px", textAlign: "right", color: C.text, fontFamily: "'DM Mono',monospace" }}>{fmt(currentPnl.fertCostPerHa)}</td>
                <td style={{ padding: "10px", textAlign: "right", color: currentPnl.netIncome >= 0 ? C.emerald : C.rose, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{fmt(currentPnl.netIncome)}</td>
                <td style={{ padding: "10px", textAlign: "right", color: currentPnl.netIncome >= 0 ? C.emerald : C.rose, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{fmt(currentPnl.netIncome * currentFarmHa)}</td>
                <td style={{ padding: "10px", textAlign: "right", color: C.textFaint, fontFamily: "'DM Mono',monospace" }}>baseline</td>
                <td></td>
              </tr>
              {scenarios.map(s => {
                const delta = s.pnl.netIncome - currentPnl.netIncome;
                const better = delta >= 0;
                return (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
                    <td style={{ padding: "10px", color: C.text }}>{s.label}</td>
                    <td style={{ padding: "10px", textAlign: "right", color: C.textMuted, fontFamily: "'DM Mono',monospace" }}>{s.baseline.yieldT.toFixed(2)}</td>
                    <td style={{ padding: "10px", textAlign: "right", color: C.textMuted, fontFamily: "'DM Mono',monospace" }}>{fmtNum(s.baseline.priceBRL)}</td>
                    <td style={{ padding: "10px", textAlign: "right", color: C.text, fontFamily: "'DM Mono',monospace" }}>{fmt(s.pnl.revenuePerHa)}</td>
                    <td style={{ padding: "10px", textAlign: "right", color: C.text, fontFamily: "'DM Mono',monospace" }}>{fmt(s.pnl.fertCostPerHa)}</td>
                    <td style={{ padding: "10px", textAlign: "right", color: s.pnl.netIncome >= 0 ? C.emerald : C.rose, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{fmt(s.pnl.netIncome)}</td>
                    <td style={{ padding: "10px", textAlign: "right", color: s.pnl.farmNetIncome >= 0 ? C.emerald : C.rose, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{fmt(s.pnl.farmNetIncome)}</td>
                    <td style={{ padding: "10px", textAlign: "right", color: better ? C.emerald : C.rose, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>
                      {better ? "+" : ""}{fmt(delta)}
                    </td>
                    <td style={{ padding: "10px" }}>
                      <button onClick={() => onRemove(s.id)} style={{
                        background: "transparent", border: `1px solid ${C.border}`,
                        color: C.textDim, fontSize: 10, padding: "3px 8px",
                        borderRadius: 4, cursor: "pointer"
                      }}>×</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   11. STRATEGIC INSIGHTS (drawn directly from the deck)
   ═══════════════════════════════════════════════════════════════════════════ */

const BRAZIL_INSIGHTS = {
  soybean: {
    matopiba: [
      { type: "positive", icon: "🌱", label: "S-rich blends fit", text: "MATOPIBA's newly cleared sandy oxisols are acutely S-deficient. Soybean in this region uniquely benefits from S-enriched products (e.g. SSP today, TSP+S fortified blends tomorrow)." },
      { type: "neutral", icon: "🚛", label: "Logistics cost",   text: "Long inland routes mean every fertilizer tonne carries 30–50% more freight per P₂O₅ unit than Cerrado. High-analysis products (TSP, MAP) are structurally advantaged here." },
      { type: "risk", icon: "🌦️", label: "Climate risk", text: "Erratic rainfall in the eastern frontier creates above-average yield volatility. Crop insurance load and financing costs are notably higher than Cerrado." },
    ],
    cerrado: [
      { type: "positive", icon: "🏆", label: "Brazil's powerhouse",  text: "54% of regional area is soybean. Highly mechanized, double-cropped with safrinha corn, and in nutrient terms the largest single P₂O₅ end-market in Brazil." },
      { type: "neutral", icon: "🧪", label: "P-fixation problem", text: "Acidic oxisols fix 70–98% of applied P. Liming is mandatory, and farmers progressively build soil P over years — only ~2% of legacy P is plant-available at any time." },
      { type: "positive", icon: "🛰️", label: "Tech adoption",     text: "Highest GPS / VRT / yield-monitor adoption in Brazil. Premium positioning for differentiated TSP-based blends has the strongest agronomic and operational fit here." },
    ],
    south: [
      { type: "positive", icon: "🤝", label: "Cooperative gateway",  text: "Coamo, C.Vale, Cocamar dominate distribution. Winning these blender-cooperatives is the single most scalable commercial lever in southern Brazil." },
      { type: "neutral", icon: "🌡️", label: "Soil & climate fit",   text: "Mollisols are more fertile and less acidic than Cerrado. Recommended P rates are slightly lower; K demand is higher due to subtropical leaching dynamics." },
    ],
    southeast: [
      { type: "neutral", icon: "🌾", label: "Diversified rotation", text: "Soybean shares acreage with sugarcane and coffee. Blend formulations must coexist in shared blender capacity, raising premium for compatibility." },
    ],
    other: [
      { type: "risk", icon: "📉", label: "Limited soy footprint",   text: "Northeast and North have minimal soy area. Strategic priority is opportunistic — soybean is not the right entry product here." },
    ],
  },
  corn: {
    cerrado: [
      { type: "positive", icon: "🌽", label: "Safrinha dominance", text: "Off-season corn after soy is now ~16% of national area and growing. Demand for high-N blends (NPK with urea or AS as N source) is structural here." },
      { type: "risk", icon: "⚖️", label: "TSP–urea blend block", text: "Standard TSP cannot blend with urea (forms sticky urea-phosphate). For high-N corn programs, MAP or DAP remain the structural choice unless TSP is sold as a separated starter dose." },
    ],
    matopiba: [
      { type: "neutral", icon: "🚛", label: "Inland freight tax", text: "Same logistics penalty as soy. High-analysis fertilizers (MAP, ammoniated NPK) are preferred over SSP for tonne-efficiency." },
    ],
  },
  sugarcane: {
    southeast: [
      { type: "positive", icon: "🎋", label: "Heart of the cane belt", text: "São Paulo alone produces 64% of national sugarcane. Mill-coordinated agronomy — fertilization is often dictated at mill / usina level, not individual farm." },
      { type: "neutral", icon: "♻️", label: "Vinasse & filter cake", text: "Mills recycle vinasse and filter cake to fields, partially substituting K and P. Net mineral K demand per ha is below other regions." },
    ],
    other: [
      { type: "neutral", icon: "🌅", label: "Coastal cane",  text: "Pernambuco and Alagoas have mature, smaller-scale cane on coastal plains. Slower modernization; long-cycle nutrient programs dominate." },
    ],
  },
  coffee: {
    southeast: [
      { type: "positive", icon: "☕", label: "Premium specialty market", text: "Minas Gerais arabica commands the largest specialty coffee premium globally. Farmers willingly pay for low-Cd, micronutrient-fortified P." },
      { type: "neutral", icon: "💧", label: "Fertigation growth",       text: "Drip fertigation is expanding rapidly in irrigated Cerrado Mineiro. Soluble specialty products (TSP-based, KNO₃, NPK water-soluble) capture the premium niche." },
    ],
  },
  cotton: {
    cerrado: [
      { type: "positive", icon: "🌾", label: "High-margin cash crop", text: "Cotton in MT and BA is among Brazil's highest-margin row crops. Cost stack supports premium fertilizers — especially Zn / B / S micronutrient-fortified blends." },
      { type: "risk", icon: "🐛", label: "Agrochemical-intensive",   text: "Cotton's pest pressure is extreme; agrochemical spend often exceeds fertilizer spend. Total P&L is highly exposed to glyphosate / insecticide pricing." },
    ],
    matopiba: [
      { type: "positive", icon: "📈", label: "Frontier expansion", text: "Bahia is the second-largest cotton producer and is still growing. New irrigation projects (Oeste Baiano) accelerate yield potential." },
    ],
  },
};

function BrazilStrategicCorner({ regionId, cropId }) {
  const insights = BRAZIL_INSIGHTS[cropId]?.[regionId] || [
    { type: "neutral", icon: "📋", label: "Limited deck coverage",
      text: `Strategic notes for ${cropId} in this region are still being built. Use the engine above to model the economics; the qualitative layer will follow as more field data lands.` }
  ];

  return (
    <div className="card" style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "16px 18px"
    }}>
      <SectionTitle eyebrow="Strategic context"
        title="What the CVA × OCP Brazil deep dive says about this farmer"
        accent={C.cyan}/>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 10 }}>
        {insights.map((it, i) => <InsightCard key={i} item={it}/>)}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   12. FRANCE WRAPPER (legacy — keep accessible without full port)
   ───────────────────────────────────────────────────────────────────────────
   Keeps the user's existing France work safe behind a "view legacy" path.
   The full original components (REGIONAL_DATA, MARKET_INTEL, FranceMap,
   RegionalPage, MIFarmerBehaviorPage, ATLASPage) continue to live in their
   original modules; this wrapper just provides a placeholder so the redesign
   can be merged cleanly. Re-attach the real components when integrating.
   ═══════════════════════════════════════════════════════════════════════════ */

function FrancePlaceholder({ onBack }) {
  return (
    <div style={{ padding: "28px 32px", maxWidth: 1280, margin: "0 auto" }}>
      <button onClick={onBack} style={{
        background: "transparent", border: `1px solid ${C.border}`,
        color: C.textMuted, padding: "6px 14px", borderRadius: 6,
        fontSize: 11, cursor: "pointer", marginBottom: 18
      }}>← Back to country selector</button>
      <SectionTitle eyebrow="France · Existing module"
        title="Your previous France build remains untouched"
        accent={C.cyan}/>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 22px" }}>
        <p style={{ color: C.textMuted, fontSize: 13, lineHeight: 1.7 }}>
          When you merge this file into your repo, re-attach your existing France pages here:
        </p>
        <ul style={{ color: C.textMuted, fontSize: 12.5, lineHeight: 1.9, marginTop: 8 }}>
          <li><code style={{ color: C.cyan }}>RegionalPage</code> — France map + regional crop time series</li>
          <li><code style={{ color: C.cyan }}>MIFarmerBehaviorPage</code> — farmer archetypes &amp; decision drivers</li>
          <li><code style={{ color: C.cyan }}>ATLASPage</code> — your imported ATLAS module</li>
        </ul>
        <p style={{ color: C.textFaint, fontSize: 11.5, lineHeight: 1.7, marginTop: 12 }}>
          The redesign keeps the visual theme and component library identical (same KPICard, InsightCard, SectionBadge, palette and fonts), so dropping your existing pages back in requires no styling work.
        </p>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   13. ROOT APP — landing → country chooser → country page
   ═══════════════════════════════════════════════════════════════════════════ */

export default function App() {
  const [stage,   setStage]   = useState("landing");      // landing | chooser | country
  const [country, setCountry] = useState(null);            // 'BR' | 'FR'

  if (stage === "landing") {
    return <LandingPage onEnter={() => setStage("chooser")}/>;
  }

  if (stage === "chooser") {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
        <TopNav onHome={() => setStage("landing")} country={null} onCountry={() => {}}/>
        <CountryChooser onPick={c => { setCountry(c); setStage("country"); }}/>
      </div>
    );
  }

  // Country stage
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif", color: C.text }}>
      <style>{`
        .card { background: ${C.card}; border: 1px solid ${C.border}; border-radius: 12px; padding: 16px 18px; }
        .card-title { color: ${C.text}; font-size: 13px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.005em; }
        .chart-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.textFaint}; }
      `}</style>

      <TopNav onHome={() => setStage("chooser")} country={country}
        onCountry={c => setCountry(c)}/>

      <div style={{ padding: "20px 28px 60px", maxWidth: 1400, margin: "0 auto" }}>
        {country === "BR" ? <BrazilPage/> : <FrancePlaceholder onBack={() => setStage("chooser")}/>}
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   14. TOP NAVIGATION
   ═══════════════════════════════════════════════════════════════════════════ */

function TopNav({ onHome, country, onCountry }) {
  return (
    <div style={{
      borderBottom: `1px solid ${C.border}`,
      background: C.bg, padding: "12px 28px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      position: "sticky", top: 0, zIndex: 50, backdropFilter: "blur(8px)"
    }}>
      <button onClick={onHome} style={{
        background: "transparent", border: "none", display: "flex",
        alignItems: "center", gap: 10, cursor: "pointer", padding: 0
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: "linear-gradient(135deg,#0ea5e9,#0369a1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: 10, color: "#fff", fontFamily: "'DM Mono',monospace"
        }}>GMO</div>
        <span style={{ color: C.textMuted, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Farmer Economics · OCP Nutricrops
        </span>
      </button>
      {country && (
        <div style={{ display: "flex", gap: 6 }}>
          {[["FR", "France"], ["BR", "Brasil"]].map(([id, name]) => (
            <button key={id} onClick={() => onCountry(id)}
              style={{
                padding: "5px 12px", borderRadius: 5,
                background: country === id ? (id === "BR" ? C.emerald : C.cyan) + "22" : "transparent",
                border: `1px solid ${country === id ? (id === "BR" ? C.emerald : C.cyan) : C.border}`,
                color:  country === id ? (id === "BR" ? C.emerald : C.cyan) : C.textMuted,
                fontSize: 11, fontWeight: country === id ? 700 : 400, cursor: "pointer"
              }}>
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
