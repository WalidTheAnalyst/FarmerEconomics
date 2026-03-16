import { useState, useMemo } from "react";
import ATLASPage from "./ATLAS";
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, Area, AreaChart, Cell, PieChart, Pie
} from "recharts";

// ─── DATA ────────────────────────────────────────────────────────────────────
const SAMPLE_DATA = [
  { region: "Spain",     crop: "Wheat",  soil_ph: 7.8, om: 1.2, strategy: "Blended (MAP)",     yield: 4.2,  fert_cost: 310, op_cost: 820,  revenue: 1050, margin: 230 },
  { region: "Spain",     crop: "Wheat",  soil_ph: 7.8, om: 1.2, strategy: "Separated (TSP+N)", yield: 4.55, fert_cost: 295, op_cost: 875,  revenue: 1137, margin: 262 },
  { region: "Spain",     crop: "Wheat",  soil_ph: 7.8, om: 1.2, strategy: "Optimized",         yield: 4.7,  fert_cost: 285, op_cost: 860,  revenue: 1175, margin: 315 },
  { region: "France",    crop: "Wheat",  soil_ph: 6.5, om: 2.1, strategy: "Blended (MAP)",     yield: 7.1,  fert_cost: 340, op_cost: 980,  revenue: 1775, margin: 795 },
  { region: "France",    crop: "Wheat",  soil_ph: 6.5, om: 2.1, strategy: "Separated (TSP+N)", yield: 7.2,  fert_cost: 330, op_cost: 1030, revenue: 1800, margin: 770 },
  { region: "France",    crop: "Wheat",  soil_ph: 6.5, om: 2.1, strategy: "Optimized",         yield: 7.4,  fert_cost: 320, op_cost: 1010, revenue: 1850, margin: 840 },
  { region: "Brazil",    crop: "Maize",  soil_ph: 5.4, om: 2.8, strategy: "Blended (MAP)",     yield: 7.8,  fert_cost: 420, op_cost: 1100, revenue: 1248, margin: 148 },
  { region: "Brazil",    crop: "Maize",  soil_ph: 5.4, om: 2.8, strategy: "Separated (TSP+N)", yield: 8.6,  fert_cost: 400, op_cost: 1170, revenue: 1376, margin: 206 },
  { region: "Brazil",    crop: "Maize",  soil_ph: 5.4, om: 2.8, strategy: "Optimized",         yield: 9.1,  fert_cost: 390, op_cost: 1150, revenue: 1456, margin: 306 },
  { region: "Australia", crop: "Wheat",  soil_ph: 6.1, om: 1.5, strategy: "Blended (MAP)",     yield: 3.8,  fert_cost: 280, op_cost: 760,  revenue: 950,  margin: 190 },
  { region: "Australia", crop: "Wheat",  soil_ph: 6.1, om: 1.5, strategy: "Separated (TSP+N)", yield: 4.0,  fert_cost: 270, op_cost: 810,  revenue: 1000, margin: 190 },
  { region: "Australia", crop: "Wheat",  soil_ph: 6.1, om: 1.5, strategy: "Optimized",         yield: 4.2,  fert_cost: 265, op_cost: 795,  revenue: 1050, margin: 255 },
  { region: "Morocco",   crop: "Wheat",  soil_ph: 8.1, om: 0.8, strategy: "Blended (MAP)",     yield: 2.9,  fert_cost: 260, op_cost: 620,  revenue: 725,  margin: 105 },
  { region: "Morocco",   crop: "Wheat",  soil_ph: 8.1, om: 0.8, strategy: "Separated (TSP+N)", yield: 3.3,  fert_cost: 245, op_cost: 675,  revenue: 825,  margin: 150 },
  { region: "Morocco",   crop: "Wheat",  soil_ph: 8.1, om: 0.8, strategy: "Optimized",         yield: 3.5,  fert_cost: 240, op_cost: 658,  revenue: 875,  margin: 217 },
  { region: "Spain",     crop: "Olives", soil_ph: 7.5, om: 1.0, strategy: "Blended (MAP)",     yield: 3.1,  fert_cost: 290, op_cost: 1100, revenue: 1550, margin: 450 },
  { region: "Spain",     crop: "Olives", soil_ph: 7.5, om: 1.0, strategy: "Separated (TSP+N)", yield: 3.3,  fert_cost: 275, op_cost: 1155, revenue: 1650, margin: 495 },
  { region: "Spain",     crop: "Olives", soil_ph: 7.5, om: 1.0, strategy: "Optimized",         yield: 3.5,  fert_cost: 265, op_cost: 1135, revenue: 1750, margin: 615 },
];

const REGIONS = [...new Set(SAMPLE_DATA.map(d => d.region))];
const CROPS   = [...new Set(SAMPLE_DATA.map(d => d.crop))];
const STRATEGY_COLORS = { "Blended (MAP)": "#64748b", "Separated (TSP+N)": "#0ea5e9", "Optimized": "#10b981" };

// ─── MARKET INTELLIGENCE DATA ─────────────────────────────────────────────────
const MARKET_INTEL = {
  France: {
    kpis: [
      { label: "P2O5 consumed",     value: "226 kt",  sub: "−44% vs 2017",      accent: "#0ea5e9" },
      { label: "Agronomic gap",     value: "−157 kt", sub: "vs Comifer rec.",    accent: "#f59e0b" },
      { label: "Addressable mkt",   value: "511 kt",  sub: "P2O5 by 2030",      accent: "#10b981" },
      { label: "Fert. cost share",  value: "14–16%",  sub: "of variable costs", accent: "#a78bfa" },
      { label: "Morocco mkt share", value: "~62%",    sub: "DAP/MAP imports",   accent: "#10b981" },
    ],
    productMix: [
      { name: "NPK/NP",  val2022: 103, val2023: 66, color: "#a78bfa" },
      { name: "PK",      val2022: 74,  val2023: 43, color: "#f59e0b" },
      { name: "DAP/MAP", val2022: 72,  val2023: 55, color: "#0ea5e9" },
      { name: "TSP",     val2022: 54,  val2023: 25, color: "#10b981" },
      { name: "Other P", val2022: 39,  val2023: 33, color: "#64748b" },
    ],
    importOrigin: [
      { name: "Morocco", value: 69.4, color: "#10b981" },
      { name: "Russia",  value: 13.0, color: "#f87171" },
      { name: "Egypt",   value: 11.5, color: "#f59e0b" },
      { name: "Tunisia", value: 2.0,  color: "#64748b" },
      { name: "Other",   value: 1.0,  color: "#334155" },
    ],
    dynamics: [
      { type: "risk",     icon: "📉", label: "Consumption decline",        text: "P2O5 use fell ~44% from 2017 to 2023. Only ~50% of parcels receive mineral P — a structural agronomic gap versus Comifer recommendations." },
      { type: "risk",     icon: "✂️", label: "Price shock & substitution", text: "The 2022 price spike created a scissors effect. Farmers systematically prioritize nitrogen and defer P & K when budgets are tight." },
      { type: "neutral",  icon: "🚢", label: "Import dependency",          text: "70% of P consumption is imported. No domestic TSP or DAP capacity — structurally favoring Moroccan and Russian exporters." },
      { type: "positive", icon: "📈", label: "Addressable market recovery", text: "If France closes 70% of the agronomic gap, the addressable P2O5 market reaches 511 kt by 2030." },
    ],
    farmer: [
      { type: "neutral",  icon: "🤝", label: "Decision architecture",   text: "Cooperative agronomists drive product-type selection. Farmers retain autonomy over timing and quantity." },
      { type: "positive", icon: "🎯", label: "Sophistication gradient", text: "Large, younger farms adopt precision tools — GPS, yield mapping, soil testing. Older farms remain price-driven." },
      { type: "neutral",  icon: "📅", label: "Purchase timing",         text: "Farmers concentrate P purchases in Q3. Importers position TSP Q3–Q4, DAP Q4–Q1." },
      { type: "positive", icon: "🌱", label: "Green premium emerging",  text: "Willingness to pay for low-carbon P is nascent but growing. Biostimulant adoption already high." },
    ],
    strategy: [
      { type: "positive", icon: "🏆", label: "TSP positioning",       text: "TSP is agronomically optimal for French winter cereals and rapeseed — decouples N and P, aligns with low-carbon narrative." },
      { type: "positive", icon: "🌾", label: "Coop channel leverage", text: "70% of fertilizer flows through cooperatives. Co-designing blends with Inoxa, Area, Axereal is the critical entry mechanism." },
      { type: "neutral",  icon: "⚔️", label: "Competitive landscape", text: "ICL, Timac, Yara dominate NPK+. Entry requires JV blending or differentiated low-cadmium positioning." },
      { type: "risk",     icon: "⚖️", label: "Regulatory headwinds",  text: "EU heavy metal/carbon rules tighten — risk for high-cadmium sources, opportunity for OCP's low-cadmium Moroccan P." },
    ],
    agronomy: [
      { type: "positive", icon: "🌾", label: "TSP & cereal synergy",     text: "Winter wheat, barley, and rapeseed benefit from pre-sowing TSP — P placed in root zone before tillering without N interference." },
      { type: "neutral",  icon: "🧪", label: "Soil pH buffering",         text: "French soils average pH 6.2–6.8 across cereal zones. Calcareous pockets in Champagne and Languedoc favour TSP strongly." },
      { type: "risk",     icon: "🌍", label: "Organic matter depletion",  text: "Reduced organic inputs are increasing P fixation risk, raising the agronomic argument for separated P application." },
      { type: "positive", icon: "🛰️", label: "Precision agronomy uptake", text: "VRA P application is growing on large cereal farms. Separated P programs are more compatible with VRA than blended NPK." },
    ],
    cropAgronomy: [
      { crop: "Wheat",     area: 4950, currentP: 18, recP: 55, product: "TSP",      color: "#0ea5e9" },
      { crop: "Barley",    area: 1867, currentP: 27, recP: 55, product: "TSP",      color: "#0ea5e9" },
      { crop: "Rapeseed",  area: 1230, currentP: 34, recP: 55, product: "TSP/PK",   color: "#a78bfa" },
      { crop: "Corn",      area: 1456, currentP: 39, recP: 65, product: "DAP",      color: "#f59e0b" },
      { crop: "Sunflower", area: 871,  currentP: 25, recP: 55, product: "TSP/PK",   color: "#a78bfa" },
      { crop: "Potatoes",  area: 211,  currentP: 40, recP: 40, product: "PK",       color: "#10b981" },
      { crop: "Beet",      area: 402,  currentP: 35, recP: 60, product: "PK",       color: "#10b981" },
    ],
    ownership: {
      kpis: [
        { label: "Total farms",      value: "390k",  sub: "−19% since 2010",       accent: "#0ea5e9" },
        { label: "Avg. farm size",   value: "69 ha", sub: "up from 53 ha in 2010", accent: "#10b981" },
        { label: "Operators >55 yrs",value: "43%",   sub: "succession risk",       accent: "#f43f5e" },
        { label: "Land leased",      value: "~75%",  sub: "of utilized agri. area",accent: "#f59e0b" },
        { label: "Coop volumes",     value: "~70%",  sub: "of fertilizer flows",   accent: "#a78bfa" },
      ],
      farmSize: [
        { label: "<20 ha",     pct: 38, count: 148,  color: "#334155" },
        { label: "20–50 ha",   pct: 18, count: 70,   color: "#475569" },
        { label: "50–100 ha",  pct: 16, count: 62,   color: "#64748b" },
        { label: "100–200 ha", pct: 14, count: 55,   color: "#0ea5e9" },
        { label: ">200 ha",    pct: 14, count: 55,   color: "#10b981" },
      ],
      tenure: [
        { name: "Primarily lessee", value: 40, color: "#f59e0b" },
        { name: "Mixed",            value: 35, color: "#0ea5e9" },
        { name: "Owner-operator",   value: 25, color: "#10b981" },
      ],
      implications: [
        { type: "risk",     icon: "⏱️", label: "Short lease horizons",            text: "~75% of land under lease. Tenants on 9-year bail rural leases have limited incentive to invest in long-term soil P building." },
        { type: "risk",     icon: "👴", label: "Aging farmer profile",             text: "43% of operators over 55, many approaching retirement without identified successors. This cohort is characteristically price-sensitive." },
        { type: "neutral",  icon: "📐", label: "Consolidation dynamic",            text: "Average farm size grew from 53 ha in 2010 to 69 ha in 2020. Larger successor farms are the addressable segment for precision P programs." },
        { type: "positive", icon: "🏛️", label: "Cooperative as aggregator",        text: "Given fragmented ownership, cooperatives are the de facto purchasing aggregator. Effective strategy must run through the coop channel." },
        { type: "positive", icon: "🤝", label: "GAEC & EARL structures",           text: "~30% of farms operate through collective structures. These are larger, more professionally managed, more responsive to agronomy." },
        { type: "neutral",  icon: "🔄", label: "Generational transfer window",     text: "150–180k farms will change hands over the next 10–15 years. New operators are more likely to adopt evidence-based agronomy." },
      ],
    },
  },
};

// ─── UTILITY ─────────────────────────────────────────────────────────────────
function fmt(n, prefix = "$") {
  if (n === undefined || n === null) return "—";
  return `${prefix}${Number(n).toFixed(0)}`;
}
function pct(n) { return `${Number(n).toFixed(1)}%`; }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
      <p style={{ color: "#94a3b8", marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: "2px 0" }}>{p.name}: <strong style={{ color: "#f1f5f9" }}>{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</strong></p>
      ))}
    </div>
  );
};

function generateInsights(data, region, crop) {
  const filtered = data.filter(d => d.region === region && d.crop === crop);
  if (!filtered.length) return [];
  const base = filtered.find(d => d.strategy === "Blended (MAP)");
  const sep  = filtered.find(d => d.strategy === "Separated (TSP+N)");
  const opt  = filtered.find(d => d.strategy === "Optimized");
  if (!base || !sep) return [];
  const ph = base.soil_ph;
  const marginDelta = sep.margin - base.margin;
  const yieldGain = ((sep.yield - base.yield) / base.yield * 100).toFixed(1);
  const extraOpCost = sep.op_cost - base.op_cost;
  const breakEvenYield = (extraOpCost / (base.revenue / base.yield)).toFixed(2);
  const insights = [];
  if (ph > 7.5) insights.push(`In calcareous soils (pH ${ph}), P fixation is high — separation improves net margin by ~$${marginDelta}/ha.`);
  else if (ph < 6.0) insights.push(`Acidic soils (pH ${ph}) show strong response to TSP separation — a ${yieldGain}% yield gain modeled.`);
  else insights.push(`Moderate pH (${ph}) limits the soil-driven case — agronomic benefit is net positive at $${marginDelta}/ha.`);
  insights.push(`Separation requires $${extraOpCost}/ha extra. Break-even at ${breakEvenYield} t/ha yield gain.`);
  if (marginDelta > 0) insights.push(`Separation increases profit per hectare once all incremental costs are included.`);
  else insights.push(`Separation is margin-neutral here. Lower pass costs or higher crop prices would tip the balance.`);
  if (opt) insights.push(`Optimized program: $${(opt.margin - base.margin).toFixed(0)}/ha above baseline.`);
  return insights;
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
function KPICard({ label, value, sub, accent }) {
  return (
    <div style={{ background: "linear-gradient(135deg, #0f172a, #0a1020)", border: `1px solid ${accent}25`, borderRadius: 14, padding: "18px 20px", flex: 1, minWidth: 130, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -20, right: -20, width: 70, height: 70, borderRadius: "50%", background: accent + "08" }} />
      <p style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{label}</p>
      <p style={{ color: accent, fontSize: 24, fontWeight: 800, fontFamily: "'DM Mono', monospace", margin: 0, letterSpacing: "-0.02em" }}>{value}</p>
      {sub && <p style={{ color: "#475569", fontSize: 11, marginTop: 5 }}>{sub}</p>}
    </div>
  );
}

function SectionBadge({ label, color }) {
  return (
    <span style={{ padding: "3px 12px", borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: color + "18", color, border: `1px solid ${color}40` }}>
      {label}
    </span>
  );
}

// Visual insight card with icon, color-coded border, hover
function InsightCard({ item }) {
  const border = { positive: "#10b981", neutral: "#f59e0b", risk: "#f43f5e" };
  const bg     = { positive: "#0a1e14", neutral: "#1a1200", risk: "#1a0808" };
  const c = border[item.type];
  return (
    <div style={{
      background: bg[item.type] || "#0a0f1a",
      border: `1px solid ${c}30`,
      borderLeft: `3px solid ${c}`,
      borderRadius: 12, padding: "16px 18px",
      transition: "transform 0.15s, box-shadow 0.15s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${c}20`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 16 }}>{item.icon}</span>
        <p style={{ fontSize: 11, color: c, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, margin: 0 }}>{item.label}</p>
      </div>
      <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>{item.text}</p>
    </div>
  );
}

// Animated horizontal bar
function AnimBar({ label, val2022, val2023, maxVal, color }) {
  const pct22 = (val2022 / maxVal) * 100;
  const pct23 = (val2023 / maxVal) * 100;
  const isDown = val2023 < val2022;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 500 }}>{label}</span>
        <span style={{ color: "#64748b", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
          {val2022} → <span style={{ color: isDown ? "#f43f5e" : "#10b981", fontWeight: 700 }}>{val2023}</span>
          <span style={{ color: isDown ? "#f43f5e80" : "#10b98180", fontSize: 10, marginLeft: 4 }}>{isDown ? "▼" : "▲"}</span>
        </span>
      </div>
      <div style={{ position: "relative", height: 10, background: "#1e293b", borderRadius: 5, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, height: "100%", width: `${pct22}%`, background: color + "30", borderRadius: 5 }} />
        <div style={{ position: "absolute", left: 0, height: "100%", width: `${pct23}%`, background: `linear-gradient(90deg, ${color}, ${color}bb)`, borderRadius: 5 }} />
      </div>
    </div>
  );
}

// ─── QUANTITATIVE PAGES ───────────────────────────────────────────────────────

function OverviewPage({ data, region }) {
  const regionCrops = [...new Set(data.filter(d => d.region === region).map(d => d.crop))];
  const cropSummary = regionCrops.map(c => {
    const b = data.find(d => d.region === region && d.crop === c && d.strategy === "Blended (MAP)");
    const s = data.find(d => d.region === region && d.crop === c && d.strategy === "Separated (TSP+N)");
    const o = data.find(d => d.region === region && d.crop === c && d.strategy === "Optimized");
    return { crop: c, blended: b?.margin ?? 0, separated: s?.margin ?? 0, optimized: o?.margin ?? 0, delta: (s?.margin ?? 0) - (b?.margin ?? 0) };
  });

  const regionAttractive = REGIONS.map(r => {
    const crops = [...new Set(data.filter(d => d.region === r).map(d => d.crop))];
    const deltas = crops.map(c => {
      const b = data.find(d => d.region === r && d.crop === c && d.strategy === "Blended (MAP)");
      const s = data.find(d => d.region === r && d.crop === c && d.strategy === "Separated (TSP+N)");
      return b && s ? s.margin - b.margin : 0;
    });
    return { region: r, avg: deltas.reduce((a, x) => a + x, 0) / deltas.length };
  });

  const allBase = data.filter(d => d.region === region && d.strategy === "Blended (MAP)");
  const allSep  = data.filter(d => d.region === region && d.strategy === "Separated (TSP+N)");
  const avgBlended = allBase.reduce((a,d) => a+d.margin,0)/(allBase.length||1);
  const avgSep     = allSep.reduce((a,d) => a+d.margin,0)/(allSep.length||1);
  const avgDelta   = avgSep - avgBlended;
  const avgFert    = allBase.reduce((a,d) => a+(d.fert_cost/d.op_cost)*100,0)/(allBase.length||1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="kpi-row">
        <KPICard label="Avg. Margin — Blended"  value={fmt(avgBlended)+"/ha"} sub={`all crops · ${region}`}    accent="#64748b" />
        <KPICard label="Avg. Margin — Separated" value={fmt(avgSep)+"/ha"}    sub={`all crops · ${region}`}    accent="#0ea5e9" />
        <KPICard label="Avg. Separation Benefit" value={(avgDelta>=0?"+":"")+fmt(avgDelta)+"/ha"} sub="vs blended baseline" accent={avgDelta>=0?"#10b981":"#f43f5e"} />
        <KPICard label="Avg. Fert. Cost Share"   value={pct(avgFert)}         sub="of production cost"         accent="#f59e0b" />
        <KPICard label="Crops modelled"          value={regionCrops.length}   sub={`in ${region}`}             accent="#a78bfa" />
      </div>

      <div className="chart-grid-2">
        <div className="card">
          <h3 className="card-title">Gross Margin by Crop & Strategy — {region}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cropSummary} margin={{ left:0, right:10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="crop" tick={{ fill:"#64748b", fontSize:11 }} />
              <YAxis tick={{ fill:"#64748b", fontSize:10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize:10 }} />
              <Bar dataKey="blended"   name="Blended"   fill="#64748b" radius={[3,3,0,0]} />
              <Bar dataKey="separated" name="Separated" fill="#0ea5e9" radius={[3,3,0,0]} />
              <Bar dataKey="optimized" name="Optimized" fill="#10b981" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="card-title">Separation Attractiveness by Region</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={regionAttractive} margin={{ left:0, right:10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="region" tick={{ fill:"#64748b", fontSize:10 }} />
              <YAxis tick={{ fill:"#64748b", fontSize:10 }} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#334155" />
              <Bar dataKey="avg" name="Avg Δ Margin ($/ha)" radius={[4,4,0,0]}>
                {regionAttractive.map((e,i) => <Cell key={i} fill={e.avg>30?"#10b981":e.avg>0?"#0ea5e9":"#f43f5e"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visual delta matrix */}
      <div className="card">
        <h3 className="card-title">Separation Delta — {region}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {cropSummary.map((row, i) => {
            const max = Math.max(...cropSummary.map(r => r.separated));
            const w = (row.separated / max) * 100;
            const dcolor = row.delta > 30 ? "#10b981" : row.delta > 0 ? "#0ea5e9" : "#f43f5e";
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: "#94a3b8", fontSize: 12, width: 72, flexShrink: 0 }}>{row.crop}</span>
                <div style={{ flex: 1, background: "#1e293b", borderRadius: 4, height: 24, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${w}%`, background: `linear-gradient(90deg, ${dcolor}40, ${dcolor}20)`, borderRadius: 4 }} />
                  <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${(row.blended / max) * 100}%`, background: "#64748b30", borderRadius: 4 }} />
                  <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#e2e8f0", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>${row.separated}/ha</span>
                </div>
                <span style={{ color: dcolor, fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono', monospace", width: 56, textAlign: "right", flexShrink: 0 }}>
                  {row.delta > 0 ? "+" : ""}{row.delta}
                </span>
                <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, background: dcolor+"20", color: dcolor, width: 68, textAlign: "center", flexShrink: 0 }}>
                  {row.delta > 30 ? "STRONG" : row.delta > 0 ? "MARGINAL" : "NEUTRAL"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SimulatorPage({ data, region, crop }) {
  const [cropPrice,   setCropPrice]   = useState(250);
  const [mapPrice,    setMapPrice]    = useState(520);
  const [tspPrice,    setTspPrice]    = useState(480);
  const [baseYield,   setBaseYield]   = useState(4.5);
  const [yieldBoost,  setYieldBoost]  = useState(8);
  const [extraPasses, setExtraPasses] = useState(1);
  const [costPerPass, setCostPerPass] = useState(55);
  const [appRateN,    setAppRateN]    = useState(150);
  const [appRateP,    setAppRateP]    = useState(80);

  const realBase = data.find(d => d.region === region && d.crop === crop && d.strategy === "Blended (MAP)");

  const scenarios = useMemo(() => {
    const fertBlended = (appRateP * mapPrice)/1000 + (appRateN*280)/1000;
    const fertSep     = (appRateP * tspPrice)/1000 + (appRateN*280)/1000;
    const extra       = extraPasses * costPerPass;
    const yS = baseYield*(1+yieldBoost/100);
    const yO = baseYield*(1+(yieldBoost*1.3)/100);
    const boc = realBase?.op_cost ?? 750;
    return [
      { strategy:"Blended (MAP)",     yield:baseYield, revenue:baseYield*cropPrice, fertCost:fertBlended, opCost:boc,       totalCost:boc+fertBlended,             margin:baseYield*cropPrice-boc-fertBlended },
      { strategy:"Separated (TSP+N)", yield:yS,        revenue:yS*cropPrice,        fertCost:fertSep,     opCost:boc+extra, totalCost:boc+extra+fertSep,            margin:yS*cropPrice-(boc+extra)-fertSep },
      { strategy:"Optimized",         yield:yO,        revenue:yO*cropPrice,        fertCost:fertSep*0.95,opCost:boc+extra*0.85,totalCost:boc+extra*0.85+fertSep*0.95,margin:yO*cropPrice-(boc+extra*0.85)-fertSep*0.95 },
    ];
  }, [cropPrice,mapPrice,tspPrice,baseYield,yieldBoost,extraPasses,costPerPass,appRateN,appRateP,realBase]);

  const base      = scenarios[0];
  const sep       = scenarios[1];
  const breakEven = ((extraPasses * costPerPass) / cropPrice).toFixed(2);
  const passes    = yieldBoost/100*baseYield >= breakEven;

  const waterfallData = [
    { name:"Base",    value:base.margin,                  fill:"#64748b" },
    { name:"+Yield",  value:sep.revenue-base.revenue,     fill:"#10b981" },
    { name:"-Passes", value:-(extraPasses*costPerPass),   fill:"#f43f5e" },
    { name:"-FertΔ",  value:-(sep.fertCost-base.fertCost),fill:"#f59e0b" },
    { name:"=Sep.",   value:sep.margin,                   fill:"#0ea5e9" },
  ];

  const Slider = ({ label, min, max, step, value, onChange, unit }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
        <span style={{ color:"#94a3b8", fontSize:12 }}>{label}</span>
        <span style={{ color:"#f1f5f9", fontSize:12, fontFamily:"'DM Mono',monospace" }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width:"100%", accentColor:"#0ea5e9", cursor:"pointer" }} />
    </div>
  );

  return (
    <div>
      <div className="simulator-grid">
        <div className="card">
          <h3 className="card-title">Inputs — {crop} · {region}</h3>
          {realBase && <p style={{ color:"#10b981", fontSize:11, marginBottom:12, background:"#10b98110", borderRadius:6, padding:"5px 10px", border:"1px solid #10b98120" }}>Base op. cost: ${realBase.op_cost}/ha</p>}
          <Slider label="Crop Price ($/t)"   min={100} max={600} step={10}  value={cropPrice}   onChange={setCropPrice}   unit=" $/t"  />
          <Slider label="MAP Price ($/t)"    min={300} max={900} step={10}  value={mapPrice}    onChange={setMapPrice}    unit=" $/t"  />
          <Slider label="TSP Price ($/t)"    min={280} max={850} step={10}  value={tspPrice}    onChange={setTspPrice}    unit=" $/t"  />
          <Slider label="Base Yield"         min={1}   max={15}  step={0.1} value={baseYield}   onChange={setBaseYield}   unit=" t/ha" />
          <Slider label="Yield Boost (Sep.)" min={0}   max={30}  step={0.5} value={yieldBoost}  onChange={setYieldBoost}  unit="%"    />
          <Slider label="Extra Passes"       min={0}   max={4}   step={1}   value={extraPasses} onChange={setExtraPasses} unit=""     />
          <Slider label="Cost per Pass"      min={20}  max={150} step={5}   value={costPerPass} onChange={setCostPerPass} unit=" $/ha"/>
          <Slider label="N Rate"             min={50}  max={300} step={5}   value={appRateN}    onChange={setAppRateN}    unit=" kg/ha"/>
          <Slider label="P Rate"             min={20}  max={200} step={5}   value={appRateP}    onChange={setAppRateP}    unit=" kg/ha"/>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Strategy comparison — visual cards */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            {scenarios.map((s, si) => {
              const delta = s.margin - base.margin;
              const col   = Object.values(STRATEGY_COLORS)[si];
              const isWinner = s.margin === Math.max(...scenarios.map(x=>x.margin));
              return (
                <div key={si} style={{ background:`linear-gradient(135deg, #0f172a, #0a1020)`, border:`1px solid ${col}${isWinner?"80":"30"}`, borderRadius:14, padding:"16px 14px", position:"relative", overflow:"hidden" }}>
                  {isWinner && <div style={{ position:"absolute", top:8, right:10, fontSize:14 }}>🏆</div>}
                  <div style={{ width:10, height:10, borderRadius:"50%", background:col, marginBottom:8, boxShadow:`0 0 8px ${col}` }} />
                  <p style={{ color:col, fontSize:10, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10, fontWeight:700 }}>{s.strategy}</p>
                  <p style={{ color:"#f1f5f9", fontSize:22, fontWeight:800, fontFamily:"'DM Mono',monospace", margin:0 }}>{fmt(s.margin)}</p>
                  <p style={{ color:"#64748b", fontSize:11, marginTop:2 }}>$/ha margin</p>
                  {si > 0 && (
                    <div style={{ marginTop:10, padding:"4px 8px", borderRadius:6, background: delta>=0?"#10b98120":"#f43f5e20", display:"inline-block" }}>
                      <span style={{ color:delta>=0?"#10b981":"#f43f5e", fontSize:12, fontWeight:700, fontFamily:"'DM Mono',monospace" }}>{delta>=0?"+":""}{fmt(delta)}</span>
                    </div>
                  )}
                  <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:4 }}>
                    {[["Yield", s.yield.toFixed(1)+" t/ha"], ["Revenue", fmt(s.revenue)], ["Fert.", fmt(s.fertCost)]].map(([k,v])=>(
                      <div key={k} style={{ display:"flex", justifyContent:"space-between" }}>
                        <span style={{ color:"#475569", fontSize:10 }}>{k}</span>
                        <span style={{ color:"#94a3b8", fontSize:10, fontFamily:"'DM Mono',monospace" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="chart-grid-2">
            <div className="card">
              <h3 className="card-title">Profit Waterfall</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={waterfallData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:9 }} />
                  <YAxis tick={{ fill:"#64748b", fontSize:9 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="$/ha" radius={[3,3,0,0]}>
                    {waterfallData.map((d,i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{ display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", gap:10 }}>
              <h3 className="card-title">Break-Even</h3>
              <p style={{ color:"#f59e0b", fontSize:32, fontWeight:800, fontFamily:"'DM Mono',monospace" }}>{breakEven} t/ha</p>
              <div style={{ width:"100%", background: passes?"#10b98120":"#f43f5e20", borderRadius:10, padding:"12px", textAlign:"center", border:`1px solid ${passes?"#10b98140":"#f43f5e40"}` }}>
                <p style={{ color:passes?"#10b981":"#f43f5e", fontWeight:700, fontSize:13 }}>{passes?"✓ SEPARATION PAYS OFF":"✗ DOES NOT BREAK EVEN"}</p>
                <p style={{ color:"#475569", fontSize:11, marginTop:4 }}>Modeled gain: {(yieldBoost/100*baseYield).toFixed(2)} t/ha</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PLPage({ data, region, crop }) {
  const [expanded, setExpanded] = useState({});
  const base = data.find(d => d.region===region && d.crop===crop && d.strategy==="Blended (MAP)");
  const categories = [
    { key:"seed",  label:"Seed",           value:95,                     share:11, color:"#a78bfa" },
    { key:"fert",  label:"Fertilizer",      value:base?.fert_cost||310,   share:Math.round((base?.fert_cost||310)/(base?.op_cost||900)*100), color:"#f59e0b" },
    { key:"cp",    label:"Crop Protection", value:120,                    share:14, color:"#0ea5e9" },
    { key:"mach",  label:"Machinery",       value:180,                    share:21, color:"#64748b" },
    { key:"labor", label:"Labor",           value:95,                     share:11, color:"#10b981" },
    { key:"fuel",  label:"Fuel",            value:65,                     share:8,  color:"#f43f5e" },
    { key:"land",  label:"Land / Rent",     value:145,                    share:17, color:"#e2e8f0" },
  ];
  const sensData = [200,300,400,500,600,700,800].map(fp => ({
    price:fp,
    "Blended":   (base?.revenue||1050) - (base?.op_cost||900 - (base?.fert_cost||310)) - fp,
    "Separated": (base?.revenue||1050)*1.08 - ((base?.op_cost||900)+55-((base?.fert_cost||310)*0.95)) - fp*0.95,
  }));
  const donutData = categories.map(c => ({ name:c.label, value:c.share, color:c.color }));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div className="chart-grid-2">
        <div className="card">
          <h3 className="card-title">Cost Breakdown — {crop} in {region}</h3>
          {/* Donut chart */}
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                {donutData.map((d,i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}%`, n]} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend bars */}
          {categories.map(cat => (
            <div key={cat.key} style={{ marginBottom:6 }}>
              <div onClick={() => setExpanded(e => ({...e,[cat.key]:!e[cat.key]}))}
                style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"6px 8px", borderRadius:8, background:expanded[cat.key]?"#1e293b":"transparent" }}>
                <div style={{ width:10, height:10, borderRadius:2, background:cat.color, flexShrink:0 }} />
                <span style={{ color:"#e2e8f0", fontSize:12, flex:1 }}>{cat.label}</span>
                <div style={{ width:80, background:"#1e293b", borderRadius:3, height:4 }}>
                  <div style={{ width:`${cat.share}%`, background:cat.color, borderRadius:3, height:"100%" }} />
                </div>
                <span style={{ color:"#94a3b8", fontSize:11, width:30, textAlign:"right" }}>{cat.share}%</span>
                <span style={{ color:"#f1f5f9", fontSize:11, fontFamily:"'DM Mono',monospace", width:55, textAlign:"right" }}>${cat.value}</span>
              </div>
              {expanded[cat.key] && (
                <div style={{ marginLeft:26, padding:"6px 10px", background:"#0a0f1a", borderRadius:8, fontSize:11, color:"#64748b" }}>
                  {cat.key==="fert" ? `Blended: $${cat.value}/ha → Sep.: $${Math.round(cat.value*0.95)}/ha (≈5% reduction)` : `Standard allocation for ${crop.toLowerCase()} in ${region}.`}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="card">
          <h3 className="card-title">Margin Sensitivity to Fertilizer Price</h3>
          <p style={{ color:"#475569", fontSize:11, marginBottom:12 }}>{crop} · {region}</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sensData}>
              <defs>
                <linearGradient id="gbFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="price" tick={{ fill:"#64748b", fontSize:10 }} label={{ value:"Fert $/t", position:"insideBottom", offset:-2, fill:"#64748b", fontSize:10 }} />
              <YAxis tick={{ fill:"#64748b", fontSize:10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize:11 }} />
              <ReferenceLine y={0} stroke="#334155" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="Blended"   stroke="#64748b" fill="url(#gbFill)" strokeWidth={2} />
              <Area type="monotone" dataKey="Separated" stroke="#0ea5e9" fill="url(#gsFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function AgronomyPage({ data, region, crop }) {
  const base = data.find(d => d.region===region && d.crop===crop && d.strategy==="Blended (MAP)");
  const ph   = base?.soil_ph ?? 6.5;
  const phData = Array.from({length:30},(_,i)=>{const p=5.0+i*0.15;return{ph:p.toFixed(1),"MAP/DAP":Math.max(0,6.5-Math.abs(p-6.2)*1.8+(p>7.0?-(p-7.0)*2:0)),"TSP Sep.":Math.max(0,7.0-Math.abs(p-6.5)*1.2+(p>7.5?-(p-7.5)*1.5:0)),"Optimized":Math.max(0,7.5-Math.abs(p-6.8)*1.0)};});
  const pRateData = Array.from({length:10},(_,i)=>{const r=i*20+20;return{rate:r,"MAP/DAP":Math.min(8,3+Math.sqrt(r)*0.65),"TSP Sep.":Math.min(9,3.2+Math.sqrt(r)*0.72),"Optimized":Math.min(9.5,3.4+Math.sqrt(r)*0.78)};});
  const omData = Array.from({length:8},(_,i)=>{const om=0.5+i*0.5;return{om:om.toFixed(1),"P Eff. MAP":Math.min(85,40+om*18),"P Eff. TSP":Math.min(92,45+om*20)};});

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {base && (
        <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
          {[
            { label:"Crop", val:crop, color:"#0ea5e9" },
            { label:"Region", val:region, color:"#a78bfa" },
            { label:"Soil pH", val:ph, color:"#f59e0b" },
            { label:"Org. Matter", val:base.om+"%", color:"#10b981" },
          ].map((item,i) => (
            <div key={i} style={{ background:`linear-gradient(135deg, #0f172a, #0a1020)`, border:`1px solid ${item.color}25`, borderRadius:12, padding:"12px 18px", flex:1, minWidth:100 }}>
              <p style={{ color:"#64748b", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>{item.label}</p>
              <p style={{ color:item.color, fontSize:18, fontWeight:700, fontFamily:"'DM Mono',monospace" }}>{item.val}</p>
            </div>
          ))}
        </div>
      )}
      <div className="chart-grid-2">
        <div className="card">
          <h3 className="card-title">Yield vs Soil pH</h3>
          <p style={{ color:"#475569", fontSize:11, marginBottom:10 }}>Separation advantage highest at pH &gt; 7.5</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={phData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="ph" tick={{ fill:"#64748b", fontSize:9 }} />
              <YAxis tick={{ fill:"#64748b", fontSize:9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize:9 }} />
              <ReferenceLine x={String(ph.toFixed(1))} stroke="#f59e0b80" strokeDasharray="4 4" label={{ value:"↑ now", fill:"#f59e0b", fontSize:9 }} />
              {["MAP/DAP","TSP Sep.","Optimized"].map((k,i)=><Line key={k} type="monotone" dataKey={k} stroke={Object.values(STRATEGY_COLORS)[i]} strokeWidth={2} dot={false} />)}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="card-title">Yield vs P Rate</h3>
          <p style={{ color:"#475569", fontSize:11, marginBottom:10 }}>Separation shifts the plateau upward</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={pRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="rate" tick={{ fill:"#64748b", fontSize:9 }} />
              <YAxis tick={{ fill:"#64748b", fontSize:9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize:9 }} />
              {["MAP/DAP","TSP Sep.","Optimized"].map((k,i)=><Line key={k} type="monotone" dataKey={k} stroke={Object.values(STRATEGY_COLORS)[i]} strokeWidth={2} dot={false} />)}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="card-title">P Uptake Efficiency vs Organic Matter</h3>
          <p style={{ color:"#475569", fontSize:11, marginBottom:10 }}>Gap narrows above 2.5% OM</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={omData}>
              <defs>
                <linearGradient id="mapFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#64748b" stopOpacity={0.4}/><stop offset="95%" stopColor="#64748b" stopOpacity={0}/></linearGradient>
                <linearGradient id="tspFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="om" tick={{ fill:"#64748b", fontSize:9 }} />
              <YAxis tick={{ fill:"#64748b", fontSize:9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize:9 }} />
              <Area type="monotone" dataKey="P Eff. MAP" stroke="#64748b" fill="url(#mapFill)" strokeWidth={2} />
              <Area type="monotone" dataKey="P Eff. TSP" stroke="#0ea5e9" fill="url(#tspFill)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="card-title">Biochemical Mechanisms</h3>
          {[
            { title:"P Fixation in Calcareous Soils", body:"At pH > 7.5, Ca²⁺ precipitates MAP phosphate within hours. TSP maintains a lower pH microzone, delaying fixation.", accent:"#f59e0b", icon:"🧲" },
            { title:"NH₄⁺ Interference in Blends",   body:"MAP/DAP release N and P simultaneously. High NH₄⁺ suppresses root P uptake. Separation removes this competition.", accent:"#a78bfa", icon:"⚗️" },
            { title:"Placement & Timing",             body:"Banded TSP subsurface puts P directly in the root zone. Broadcast MAP loses 15–35% to surface fixation.", accent:"#0ea5e9", icon:"📍" },
          ].map((item,i) => (
            <div key={i} style={{ borderLeft:`3px solid ${item.accent}`, paddingLeft:12, marginBottom:14, paddingTop:2 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                <span style={{ fontSize:14 }}>{item.icon}</span>
                <p style={{ color:item.accent, fontSize:11, fontWeight:700 }}>{item.title}</p>
              </div>
              <p style={{ color:"#64748b", fontSize:11, lineHeight:1.6 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InsightsPage({ data, region, crop }) {
  const insights = generateInsights(data, region, crop);
  const allInsights = REGIONS.flatMap(r =>
    CROPS.filter(c => data.some(d=>d.region===r&&d.crop===c)).map(c => {
      const b = data.find(d=>d.region===r&&d.crop===c&&d.strategy==="Blended (MAP)");
      const s = data.find(d=>d.region===r&&d.crop===c&&d.strategy==="Separated (TSP+N)");
      if (!b||!s) return null;
      return { region:r, crop:c, delta:s.margin-b.margin, ph:b.soil_ph };
    }).filter(Boolean)
  );

  // Radar for current crop/region
  const base = data.find(d=>d.region===region&&d.crop===crop&&d.strategy==="Blended (MAP)");
  const sep  = data.find(d=>d.region===region&&d.crop===crop&&d.strategy==="Separated (TSP+N)");
  const radarData = base && sep ? [
    { metric:"Yield",    blended:base.yield/0.1,  separated:sep.yield/0.1 },
    { metric:"Margin",   blended:base.margin/10,  separated:sep.margin/10 },
    { metric:"P Effic.", blended:60,              separated:80 },
    { metric:"Revenue",  blended:base.revenue/20, separated:sep.revenue/20 },
    { metric:"Cost Eff.",blended:50,              separated:70 },
  ] : [];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div className="chart-grid-2">
        <div className="card" style={{ border:"1px solid #0ea5e930" }}>
          <h3 style={{ color:"#0ea5e9", fontSize:11, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:16 }}>◈ Model Insights — {crop} · {region}</h3>
          {insights.length ? insights.map((ins,i) => (
            <div key={i} style={{ display:"flex", gap:10, marginBottom:12, padding:"10px 12px", background:"#0a0f1a", borderRadius:8, borderLeft:"2px solid #0ea5e940" }}>
              <span style={{ color:"#0ea5e9", fontSize:14, marginTop:1, flexShrink:0 }}>→</span>
              <p style={{ color:"#cbd5e1", fontSize:12, lineHeight:1.7, margin:0 }}>{ins}</p>
            </div>
          )) : <p style={{ color:"#475569" }}>No data for selected context.</p>}
        </div>
        {radarData.length > 0 && (
          <div className="card">
            <h3 className="card-title">Strategy Radar — {crop} · {region}</h3>
            <ResponsiveContainer width="100%" height={230}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="metric" tick={{ fill:"#64748b", fontSize:10 }} />
                <Radar name="Blended"   dataKey="blended"   stroke="#64748b" fill="#64748b" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Separated" dataKey="separated" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.25} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize:10 }} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Visual matrix */}
      <div className="card" style={{ overflow:"auto" }}>
        <h3 className="card-title">Full Separation Benefit Matrix</h3>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, minWidth:360 }}>
          <thead>
            <tr style={{ borderBottom:"1px solid #1e293b" }}>
              {["Region","Crop","pH","Δ Margin","Verdict"].map((h,i)=>(
                <th key={i} style={{ padding:"8px 12px", textAlign:i>1?"right":"left", color:"#64748b", fontSize:10, textTransform:"uppercase", fontWeight:500, whiteSpace:"nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allInsights.sort((a,b)=>b.delta-a.delta).map((row,i)=>{
              const dc = row.delta>30?"#10b981":row.delta>0?"#0ea5e9":"#f43f5e";
              return (
                <tr key={i} style={{ borderBottom:"1px solid #0f1929", background:i%2===0?"#0a0f1a":"#0f172a" }}>
                  <td style={{ padding:"8px 12px", color:"#94a3b8" }}>{row.region}</td>
                  <td style={{ padding:"8px 12px", color:"#94a3b8" }}>{row.crop}</td>
                  <td style={{ padding:"8px 12px", textAlign:"right", color:"#64748b", fontFamily:"'DM Mono',monospace" }}>{row.ph}</td>
                  <td style={{ padding:"8px 12px", textAlign:"right", fontFamily:"'DM Mono',monospace", fontWeight:700, color:dc }}>{row.delta>0?"+":""}{row.delta}</td>
                  <td style={{ padding:"8px 12px", textAlign:"right" }}>
                    <span style={{ padding:"2px 8px", borderRadius:20, fontSize:10, background:dc+"20", color:dc, whiteSpace:"nowrap" }}>
                      {row.delta>30?"STRONG":row.delta>0?"MARGINAL":"NEUTRAL"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MARKET INTELLIGENCE PAGES ────────────────────────────────────────────────

function MIPlaceholder({ region }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:300, gap:12 }}>
      <p style={{ fontSize:40 }}>🌍</p>
      <p style={{ fontSize:15, color:"#64748b" }}>No market intelligence data for {region}.</p>
      <p style={{ fontSize:12, color:"#334155" }}>Available: {Object.keys(MARKET_INTEL).join(", ")}</p>
    </div>
  );
}

function MIMarketDynamicsPage({ region }) {
  const intel = MARKET_INTEL[region];
  if (!intel) return <MIPlaceholder region={region} />;
  const maxMix = Math.max(...intel.productMix.map(r => r.val2022));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div className="kpi-row">
        {intel.kpis.map((k,i) => <KPICard key={i} {...k} />)}
      </div>
      <div className="chart-grid-2">
        <div className="card">
          <h3 className="card-title">P2O5 Consumption by Product — kt (2022 → 2023)</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:4 }}>
            {intel.productMix.map((row,i) => (
              <AnimBar key={i} label={row.name} val2022={row.val2022} val2023={row.val2023} maxVal={maxMix} color={row.color} />
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="card-title">DAP/MAP Import Origin — kt P2O5 (2024)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={intel.importOrigin} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value})=>`${name} ${value}kt`} labelLine={false}>
                {intel.importOrigin.map((d,i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip formatter={(v,n) => [`${v} kt`, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:8 }}>
            {intel.importOrigin.map((d,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:8, height:8, borderRadius:2, background:d.color }} />
                <span style={{ color:"#94a3b8", fontSize:11 }}>{d.name} {d.value}kt</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <h3 style={{ color:"#94a3b8", fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14 }}>Market Dynamics</h3>
        <div className="chart-grid-2">
          {intel.dynamics.map((item,i) => <InsightCard key={i} item={item} />)}
        </div>
      </div>
    </div>
  );
}

function MIFarmerBehaviorPage({ region }) {
  const intel = MARKET_INTEL[region];
  if (!intel) return <MIPlaceholder region={region} />;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h3 style={{ color:"#94a3b8", fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14 }}>Farmer Behavior — {region}</h3>
        <div className="chart-grid-2">
          {intel.farmer.map((item,i) => <InsightCard key={i} item={item} />)}
        </div>
      </div>
    </div>
  );
}

function MIStrategyPage({ region }) {
  const intel = MARKET_INTEL[region];
  if (!intel) return <MIPlaceholder region={region} />;
  // Competitive positioning radar
  const compRadar = [
    { axis:"Price Competitiveness", OCP:72, ICL:65, Yara:55 },
    { axis:"Low Cadmium",           OCP:95, ICL:60, Yara:70 },
    { axis:"Carbon Footprint",      OCP:80, ICL:55, Yara:65 },
    { axis:"Coop Penetration",      OCP:45, ICL:70, Yara:75 },
    { axis:"Agro. Support",         OCP:50, ICL:75, Yara:80 },
    { axis:"TSP Capability",        OCP:90, ICL:60, Yara:50 },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div className="chart-grid-2">
        <div className="card">
          <h3 className="card-title">Competitive Positioning Radar — France</h3>
          <p style={{ color:"#475569", fontSize:11, marginBottom:10 }}>OCP vs key competitors across strategic axes</p>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={compRadar}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="axis" tick={{ fill:"#64748b", fontSize:9 }} />
              <Radar name="OCP"  dataKey="OCP"  stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="ICL"  dataKey="ICL"  stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={1.5} />
              <Radar name="Yara" dataKey="Yara" stroke="#64748b" fill="#64748b" fillOpacity={0.1}  strokeWidth={1.5} />
              <Legend wrapperStyle={{ fontSize:10 }} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {intel.strategy.slice(0,2).map((item,i) => <InsightCard key={i} item={item} />)}
        </div>
      </div>
      <div className="chart-grid-2">
        {intel.strategy.slice(2).map((item,i) => <InsightCard key={i} item={item} />)}
      </div>
    </div>
  );
}

function MIAgronomyPage({ region }) {
  const intel = MARKET_INTEL[region];
  if (!intel) return <MIPlaceholder region={region} />;
  const tagColor = { "TSP":{ bg:"#0e2a38", text:"#0ea5e9" }, "TSP/PK":{ bg:"#0e2a38", text:"#0ea5e9" }, "DAP":{ bg:"#1e1030", text:"#a78bfa" }, "PK":{ bg:"#0e2218", text:"#10b981" } };
  const maxArea = Math.max(...intel.cropAgronomy.map(r=>r.area));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h3 style={{ color:"#94a3b8", fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14 }}>Agronomic Insights</h3>
        <div className="chart-grid-2">
          {intel.agronomy.map((item,i) => <InsightCard key={i} item={item} />)}
        </div>
      </div>

      {/* Visual crop agronomy bars */}
      <div className="card">
        <h3 className="card-title">Crop Agronomy — Current vs Recommended P2O5 (kg/ha)</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:14, marginTop:4 }}>
          {intel.cropAgronomy.map((row,i) => {
            const gap     = row.currentP - row.recP;
            const gapColor= gap >= 0 ? "#10b981" : gap > -15 ? "#f59e0b" : "#f43f5e";
            const tc      = tagColor[row.product] || { bg:"#1e293b", text:"#94a3b8" };
            const areaW   = (row.area / maxArea) * 100;
            return (
              <div key={i} style={{ background:"#0a0f1a", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8, flexWrap:"wrap" }}>
                  <span style={{ color:"#e2e8f0", fontSize:13, fontWeight:600, minWidth:80 }}>{row.crop}</span>
                  <span style={{ padding:"2px 8px", borderRadius:4, fontSize:10, fontWeight:600, background:tc.bg, color:tc.text }}>{row.product}</span>
                  <span style={{ color:gapColor, fontSize:12, fontFamily:"'DM Mono',monospace", fontWeight:700 }}>Gap: {gap >= 0 ? "0" : gap} kg/ha</span>
                  <span style={{ color:"#475569", fontSize:11, marginLeft:"auto" }}>{row.area.toLocaleString()} kha</span>
                </div>
                {/* Current vs Rec bar */}
                <div style={{ position:"relative", height:8, background:"#1e293b", borderRadius:4, overflow:"hidden", marginBottom:6 }}>
                  <div style={{ position:"absolute", left:0, height:"100%", width:`${(row.recP/100)*100}%`, background:gapColor+"30", borderRadius:4 }} />
                  <div style={{ position:"absolute", left:0, height:"100%", width:`${(row.currentP/100)*100}%`, background:gapColor, borderRadius:4 }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ color:"#475569", fontSize:10 }}>Current: <span style={{ color:gapColor, fontFamily:"'DM Mono',monospace" }}>{row.currentP}</span> kg/ha</span>
                  <span style={{ color:"#475569", fontSize:10 }}>Rec: <span style={{ color:"#94a3b8", fontFamily:"'DM Mono',monospace" }}>{row.recP}</span> kg/ha</span>
                </div>
                {/* Area size indicator */}
                <div style={{ marginTop:6, height:3, background:"#1e293b", borderRadius:2 }}>
                  <div style={{ width:`${areaW}%`, height:"100%", background:row.color+"60", borderRadius:2 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MIOwnershipPage({ region }) {
  const intel = MARKET_INTEL[region];
  if (!intel?.ownership) return <MIPlaceholder region={region} />;
  const own = intel.ownership;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div className="kpi-row">
        {own.kpis.map((k,i) => <KPICard key={i} {...k} />)}
      </div>
      <div className="chart-grid-2">
        {/* Farm size visual */}
        <div className="card">
          <h3 className="card-title">Farm Size Distribution</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:4 }}>
            {own.farmSize.map((row,i) => (
              <div key={i}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ color:"#94a3b8", fontSize:12 }}>{row.label}</span>
                  <span style={{ color:row.color, fontSize:12, fontWeight:700, fontFamily:"'DM Mono',monospace" }}>{row.pct}% · ~{row.count}k farms</span>
                </div>
                <div style={{ height:12, background:"#1e293b", borderRadius:6, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${row.pct}%`, background:`linear-gradient(90deg, ${row.color}, ${row.color}88)`, borderRadius:6, transition:"width 0.5s ease" }} />
                </div>
              </div>
            ))}
          </div>
          <p style={{ color:"#334155", fontSize:11, marginTop:14, lineHeight:1.6 }}>
            The &gt;100 ha segment (~28% of farms) drives the majority of fertilizer volume and is the primary addressable segment for precision P programs.
          </p>
        </div>
        {/* Tenure donut */}
        <div className="card">
          <h3 className="card-title">Land Tenure Structure</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={own.tenure} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                {own.tenure.map((d,i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip formatter={(v,n) => [`${v}%`, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {own.tenure.map((d,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:10, height:10, borderRadius:2, background:d.color, flexShrink:0 }} />
                <span style={{ color:"#94a3b8", fontSize:12, flex:1 }}>{d.name}</span>
                <span style={{ color:d.color, fontSize:13, fontWeight:700, fontFamily:"'DM Mono',monospace" }}>{d.value}%</span>
              </div>
            ))}
          </div>
          <p style={{ color:"#334155", fontSize:11, marginTop:12, lineHeight:1.6 }}>
            ~75% of agricultural land is operated under lease. The French bail rural (9-year leases) compresses investment horizons and suppresses soil P building.
          </p>
        </div>
      </div>

      {/* Implications grid */}
      <div>
        <h3 style={{ color:"#94a3b8", fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14 }}>Structural Implications for Fertilizer Demand</h3>
        <div className="chart-grid-2">
          {own.implications.map((item,i) => <InsightCard key={i} item={item} />)}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [section,      setSection]      = useState("quant");
  const [quantPage,    setQuantPage]    = useState("overview");
  const [intelPage,    setIntelPage]    = useState("dynamics");
  const [region,       setRegion]       = useState("Morocco");
  const [crop,         setCrop]         = useState("Wheat");
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [savedScenarios, setSavedScenarios] = useState([
    { name: "Spain Wheat Baseline", region: "Spain",  crop: "Wheat" },
    { name: "Brazil Maize High pH", region: "Brazil", crop: "Maize" },
  ]);
  const [scenarioName, setScenarioName] = useState("");

  const quantPages = [
    { key:"overview",  label:"Overview",   short:"Overview"  },
    { key:"simulator", label:"Simulator",  short:"Simulator" },
    { key:"pl",        label:"P&L",        short:"P&L"       },
    { key:"agronomy",  label:"Agronomy",   short:"Agronomy"  },
    { key:"insights",  label:"Insights",   short:"Insights"  },
  ];

  const intelPages = [
    { key:"dynamics",  label:"Market Dynamics",  short:"Dynamics"  },
    { key:"farmer",    label:"Farmer Behavior",  short:"Behavior"  },
    { key:"strategy",  label:"Strategic Outlook",short:"Strategy"  },
    { key:"agronomy",  label:"Agronomic Insights",short:"Agronomy" },
    { key:"ownership", label:"Farm Ownership",   short:"Ownership" },
  ];

  const subPages    = section === "quant" ? quantPages : intelPages;
  const activePage  = section === "quant" ? quantPage  : intelPage;
  const setPage     = section === "quant" ? setQuantPage : setIntelPage;
  const isOverview  = section === "quant" && quantPage === "overview";
  const availableCrops = [...new Set(SAMPLE_DATA.filter(d=>d.region===region).map(d=>d.crop))];

  const saveScenario = () => {
    if (!scenarioName) return;
    setSavedScenarios(s => [...s, { name:scenarioName, region, crop }]);
    setScenarioName("");
  };

  const sectionColor = section === "quant" ? "#0ea5e9" : section === "intel" ? "#10b981" : "#a78bfa";

  return (
    <div style={{ minHeight:"100vh", background:"#060d1a", color:"#e2e8f0", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:#0f172a; }
        ::-webkit-scrollbar-thumb { background:#1e293b; border-radius:3px; }
        input[type=range] { height:4px; }
        select { background:#1e293b; color:#e2e8f0; border:1px solid #334155; border-radius:6px; padding:6px 10px; font-size:13px; cursor:pointer; outline:none; max-width:130px; }
        select:hover { border-color:#0ea5e9; }

        .card { background:#0f172a; border:1px solid #1e293b; border-radius:14px; padding:18px; }
        .card-title { color:#94a3b8; font-size:11px; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:14px; }
        .kpi-row { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:20px; }
        .chart-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .simulator-grid { display:grid; grid-template-columns:280px 1fr; gap:20px; }

        .app-sidebar { width:210px; flex-shrink:0; border-left:1px solid #1e293b; padding:16px; background:#0a0f1a; }
        .sidebar-overlay { display:none; }
        .subnav { background:#080e1a; border-bottom:1px solid #0f1929; padding:0 16px; display:flex; overflow-x:auto; }
        .subnav::-webkit-scrollbar { height:0; }
        .sec-label-full { display:inline; }
        .sec-label-short { display:none; }

        @media (max-width:640px) {
          .chart-grid-2 { grid-template-columns:1fr; }
          .simulator-grid { grid-template-columns:1fr; }
          .kpi-row { gap:8px; }
          .kpi-row > div { min-width:calc(50% - 4px); flex:1 1 calc(50% - 4px); }
          .app-sidebar { position:fixed; top:0; right:0; bottom:0; z-index:200; width:240px; transform:translateX(100%); transition:transform 0.25s ease; overflow-y:auto; }
          .app-sidebar.open { transform:translateX(0); box-shadow:-4px 0 24px #000a; }
          .sidebar-overlay { display:block; position:fixed; inset:0; z-index:199; background:#00000080; opacity:0; pointer-events:none; transition:opacity 0.25s; }
          .sidebar-overlay.open { opacity:1; pointer-events:all; }
          .sec-label-full { display:none; }
          .sec-label-short { display:inline; }
          .page-content { padding:14px !important; }
        }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ borderBottom:"1px solid #1e293b", padding:"0 16px", display:"flex", alignItems:"center", justifyContent:"space-between", height:50, background:"#0a0f1a", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#0ea5e9", boxShadow:"0 0 10px #0ea5e9" }} />
          <span style={{ fontWeight:800, fontSize:14, letterSpacing:"-0.03em", color:"#f1f5f9" }}>PhosStratOS</span>
          <span style={{ color:"#334155", fontSize:11 }} className="sec-label-full">| P Separation Intelligence</span>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {section !== "atlas" && (
            <select value={region} onChange={e => { setRegion(e.target.value); setCrop("Wheat"); }}>
              {REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          )}
          {section === "quant" && !isOverview && (
            <select value={crop} onChange={e => setCrop(e.target.value)}>
              {availableCrops.map(c => <option key={c}>{c}</option>)}
            </select>
          )}
          {section !== "atlas" && (
            <button onClick={() => setSidebarOpen(o => !o)}
              style={{ background:"#1e293b", border:"1px solid #334155", color:"#94a3b8", padding:"6px 10px", borderRadius:6, fontSize:18, cursor:"pointer", lineHeight:1 }}>
              ☰
            </button>
          )}
        </div>
      </div>

      {/* ── SECTION SWITCHER ── */}
      <div style={{ background:"#080e1a", borderBottom:"1px solid #1e293b", padding:"0 16px", display:"flex", alignItems:"center", overflowX:"auto" }}>
        {[
          { key:"quant", icon:"⚙", full:"Quantitative Engine", short:"Quant", color:"#0ea5e9" },
          { key:"intel", icon:"◎", full:"Market Intelligence", short:"Intel",  color:"#10b981" },
        ].map(s => (
          <button key={s.key} onClick={() => setSection(s.key)}
            style={{ padding:"11px 16px", background:"transparent", border:"none", borderBottom:section===s.key?`2px solid ${s.color}`:"2px solid transparent", color:section===s.key?"#f1f5f9":"#475569", fontSize:12, fontWeight:section===s.key?700:400, cursor:"pointer", display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
            <span style={{ color:section===s.key?s.color:"#334155" }}>{s.icon}</span>
            <span className="sec-label-full">{s.full}</span>
            <span className="sec-label-short">{s.short}</span>
          </button>
        ))}
        <button onClick={() => setSection("atlas")}
          style={{ marginLeft:"auto", padding:"11px 16px", background:"transparent", border:"none", borderBottom:section==="atlas"?"2px solid #a78bfa":"2px solid transparent", color:section==="atlas"?"#f1f5f9":"#475569", fontSize:12, fontWeight:section==="atlas"?700:400, cursor:"pointer", display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap" }}>
          <span style={{ color:section==="atlas"?"#a78bfa":"#334155" }}>◈</span>
          ATLAS
          <span style={{ padding:"1px 6px", borderRadius:20, fontSize:9, fontWeight:700, background:"#a78bfa20", color:"#a78bfa", border:"1px solid #a78bfa40" }}>AI</span>
        </button>
      </div>

      {/* ── ATLAS ── */}
      {section === "atlas" && <ATLASPage />}

      {/* ── QUANT / INTEL ── */}
      {section !== "atlas" && (
        <>
          {/* Sub-nav */}
          <div className="subnav">
            {subPages.map(p => {
              const active = activePage === p.key;
              return (
                <button key={p.key} onClick={() => setPage(p.key)}
                  style={{ padding:"8px 14px", background:"transparent", border:"none", borderBottom:active?`2px solid ${sectionColor}`:"2px solid transparent", color:active?sectionColor:"#64748b", fontSize:12, fontWeight:active?600:400, cursor:"pointer", whiteSpace:"nowrap" }}>
                  {p.short}
                </button>
              );
            })}
          </div>

          {/* Body */}
          <div style={{ display:"flex", minHeight:"calc(100dvh - 130px)" }}>
            <div className="page-content" style={{ flex:1, padding:20, overflow:"auto", minWidth:0 }}>
              {/* Page header */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, flexWrap:"wrap" }}>
                <SectionBadge label={section==="quant"?"Quantitative Engine":"Market Intelligence"} color={sectionColor} />
                <h1 style={{ fontSize:17, fontWeight:800, color:"#f1f5f9", letterSpacing:"-0.02em" }}>
                  {subPages.find(p=>p.key===activePage)?.label}
                </h1>
                <span style={{ color:"#334155", fontSize:12 }}>
                  {isOverview ? `all crops · ${region}` : section==="intel" ? region : `${crop} · ${region}`}
                </span>
              </div>

              {/* Quantitative Engine pages */}
              {section==="quant" && quantPage==="overview"  && <OverviewPage  data={SAMPLE_DATA} region={region} />}
              {section==="quant" && quantPage==="simulator" && <SimulatorPage data={SAMPLE_DATA} region={region} crop={crop} />}
              {section==="quant" && quantPage==="pl"        && <PLPage        data={SAMPLE_DATA} region={region} crop={crop} />}
              {section==="quant" && quantPage==="agronomy"  && <AgronomyPage  data={SAMPLE_DATA} region={region} crop={crop} />}
              {section==="quant" && quantPage==="insights"  && <InsightsPage  data={SAMPLE_DATA} region={region} crop={crop} />}

              {/* Market Intelligence pages */}
              {section==="intel" && intelPage==="dynamics"  && <MIMarketDynamicsPage region={region} />}
              {section==="intel" && intelPage==="farmer"    && <MIFarmerBehaviorPage region={region} />}
              {section==="intel" && intelPage==="strategy"  && <MIStrategyPage       region={region} />}
              {section==="intel" && intelPage==="agronomy"  && <MIAgronomyPage       region={region} />}
              {section==="intel" && intelPage==="ownership" && <MIOwnershipPage      region={region} />}
            </div>

            <div className={`sidebar-overlay ${sidebarOpen?"open":""}`} onClick={() => setSidebarOpen(false)} />
            <div className={`app-sidebar ${sidebarOpen?"open":""}`}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <h3 style={{ color:"#64748b", fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em" }}>Saved Scenarios</h3>
                <button onClick={() => setSidebarOpen(false)} style={{ background:"transparent", border:"none", color:"#475569", fontSize:16, cursor:"pointer" }}>✕</button>
              </div>
              {savedScenarios.map((s,i) => (
                <div key={i} onClick={() => { setRegion(s.region); setCrop(s.crop); setSidebarOpen(false); }}
                  style={{ padding:"8px 10px", borderRadius:6, marginBottom:6, cursor:"pointer", background:region===s.region&&crop===s.crop?"#1e293b":"transparent", border:"1px solid transparent" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor="#334155"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="transparent"}>
                  <p style={{ color:"#94a3b8", fontSize:12, fontWeight:500 }}>{s.name}</p>
                  <p style={{ color:"#475569", fontSize:10, marginTop:2 }}>{s.crop} · {s.region}</p>
                </div>
              ))}
              <div style={{ marginTop:14, borderTop:"1px solid #1e293b", paddingTop:14 }}>
                <input value={scenarioName} onChange={e => setScenarioName(e.target.value)} placeholder="Scenario name..."
                  style={{ width:"100%", background:"#1e293b", border:"1px solid #334155", borderRadius:6, padding:"6px 8px", color:"#e2e8f0", fontSize:12, marginBottom:8, outline:"none" }} />
                <button onClick={saveScenario}
                  style={{ width:"100%", background:"#0ea5e910", border:"1px solid #0ea5e940", color:"#0ea5e9", padding:"7px", borderRadius:6, fontSize:12, cursor:"pointer" }}>
                  + Save Current
                </button>
              </div>
              <div style={{ marginTop:16, borderTop:"1px solid #1e293b", paddingTop:14 }}>
                <button onClick={() => { setSection("atlas"); setSidebarOpen(false); }}
                  style={{ width:"100%", background:"#a78bfa10", border:"1px solid #a78bfa30", color:"#a78bfa", padding:"8px", borderRadius:8, fontSize:12, cursor:"pointer" }}>
                  ◈ Open ATLAS
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
