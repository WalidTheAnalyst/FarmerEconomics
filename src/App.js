/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { ResponsiveContainer, LineChart, BarChart, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Bar, Area, ReferenceLine, ReferenceArea, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PieChart, Pie, ComposedChart } from 'recharts';

// ═══════════════════════════════════════════════════════════════════════════
// THEME — OCP green/white (unchanged from original)
// ═══════════════════════════════════════════════════════════════════════════
const T = {
  bg:      "#F7F9F7",
  panel:   "#F3F8F4",
  card:    "#FFFFFF",
  border:  "#D6E8DA",
  borderSubtle: "#E8F2EA",
  text:    "#0F2415",
  textMid: "#2C4A33",
  textMuted:"#6B8F72",
  textDim: "#9BB5A0",
  textFaint:"#B8D4BE",
  green:   "#2DB84B",
  greenDk: "#1A8A34",
  amber:   "#f59e0b",
  rose:    "#f43f5e",
  violet:  "#a78bfa",
  indigo:  "#818cf8",
  slate:   "#6B8F72",
};

const FX_BRL_USD = 5.05;

// ═══════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
      <p style={{ color: T.textMuted, marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}: <strong style={{ color: T.text }}>{typeof p.value === "number" ? p.value.toFixed(1) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

function KPICard({ label, value, sub, accent }) {
  return (
    <div style={{ background: `linear-gradient(135deg,${T.card},${T.bg})`, border: `1px solid ${accent}25`, borderRadius: 14, padding: "16px 18px", flex: 1, minWidth: 120, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -15, right: -15, width: 60, height: 60, borderRadius: "50%", background: accent + "08" }} />
      <p style={{ color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</p>
      <p style={{ color: accent, fontSize: 22, fontWeight: 800, fontFamily: "'DM Mono',monospace", margin: 0 }}>{value}</p>
      {sub && <p style={{ color: T.textMuted, fontSize: 11, marginTop: 4 }}>{sub}</p>}
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

function InsightCard({ item }) {
  const border = { positive: T.green, neutral: T.amber, risk: T.rose };
  const bg = { positive: "#EDF6EF", neutral: "#FFFBF0", risk: "#FFF5F5" };
  const c = border[item.type];
  return (
    <div style={{ background: bg[item.type] || T.panel, border: `1px solid ${c}30`, borderLeft: `3px solid ${c}`, borderRadius: 12, padding: "15px 16px", transition: "transform 0.15s,box-shadow 0.15s", cursor: "default" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${c}20`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
        <span style={{ fontSize: 15 }}>{item.icon}</span>
        <p style={{ fontSize: 11, color: c, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700, margin: 0 }}>{item.label}</p>
      </div>
      <p style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.7, margin: 0 }}>{item.text}</p>
    </div>
  );
}

function AnimBar({ label, val2022, val2023, maxVal, color }) {
  const isDown = val2023 < val2022;
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: T.textMuted, fontSize: 12, fontWeight: 500 }}>{label}</span>
        <span style={{ color: T.textMuted, fontSize: 11, fontFamily: "'DM Mono',monospace" }}>
          {val2022} → <span style={{ color: isDown ? T.rose : T.green, fontWeight: 700 }}>{val2023}</span>
          <span style={{ fontSize: 10, marginLeft: 3 }}>{isDown ? "▼" : "▲"}</span>
        </span>
      </div>
      <div style={{ position: "relative", height: 10, background: T.border, borderRadius: 5, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, height: "100%", width: `${(val2022 / maxVal) * 100}%`, background: color + "30", borderRadius: 5 }} />
        <div style={{ position: "absolute", left: 0, height: "100%", width: `${(val2023 / maxVal) * 100}%`, background: `linear-gradient(90deg,${color},${color}bb)`, borderRadius: 5 }} />
      </div>
    </div>
  );
}

function PersonaRadar({ persona }) {
  const data = [
    { axis: "Price Sensitivity", val: persona.priceScore },
    { axis: "Agronomy Focus", val: persona.agronomyScore },
    { axis: "Innovation", val: persona.innovationScore },
    { axis: "Sustainability", val: persona.sustainScore },
    { axis: "Coop Loyalty", val: persona.coopScore },
    { axis: "Digital Adoption", val: persona.digitalScore },
  ];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke={T.border} />
        <PolarAngleAxis dataKey="axis" tick={{ fill: T.textMuted, fontSize: 9 }} />
        <Radar name={persona.nickname} dataKey="val" stroke={persona.color} fill={persona.color} fillOpacity={0.25} strokeWidth={2} />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function ScoreBar({ label, val, color }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ color: T.textMuted, fontSize: 11 }}>{label}</span>
        <span style={{ color, fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>{val}/100</span>
      </div>
      <div style={{ height: 6, background: T.border, borderRadius: 3 }}>
        <div style={{ height: "100%", width: `${val}%`, background: `linear-gradient(90deg,${color},${color}88)`, borderRadius: 3, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function Segmented({ options, value, onChange, accent = T.green }) {
  return (
    <div style={{ display: "inline-flex", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 6, padding: 2 }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)}
          style={{
            padding: "5px 12px", borderRadius: 4,
            background: value === o.value ? accent + "22" : "transparent",
            color: value === o.value ? accent : T.textMuted,
            border: "none", cursor: "pointer", fontSize: 11,
            fontWeight: value === o.value ? 700 : 400, transition: "all 0.15s"
          }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function EditableNumber({ value, onChange, suffix = "", step = 1, min = 0, max = 999999, accent = T.green, width = 100 }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <input type="number" value={value} step={step} min={min} max={max}
        onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
        style={{ width, padding: "5px 8px", borderRadius: 5, background: T.bg, border: `1px solid ${T.border}`, color: T.text, fontFamily: "'DM Mono',monospace", fontSize: 12, textAlign: "right", outline: "none" }}
        onFocus={e => e.target.style.borderColor = accent}
        onBlur={e => e.target.style.borderColor = T.border}
      />
      {suffix && <span style={{ color: T.textMuted, fontSize: 11 }}>{suffix}</span>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FRANCE DATA (verbatim from original)
// ═══════════════════════════════════════════════════════════════════════════
const YEARS = [2017, 2018, 2019, 2020, 2021, 2022, 2023];

const REGIONAL_DATA = {
  "Île-de-France": {
    crops: ["Corn", "Triticale", "Rapeseed", "Sunflower", "Vegetables", "Wheat", "Barley", "Beet", "Potatoes", "Grapes"],
    area: { "Corn": [145952, 38775, 183575, 146032, 87175, 47755, 90593], "Triticale": [1920, 1865, 3190, 3575, 3605, 2940, 2384], "Rapeseed": [76140, 78800, 48655, 60705, 52260, 63495, 68226], "Sunflower": [1280, 1505, 3950, 6195, 8860, 12023, 12169], "Vegetables": [17446, 12707, 14910, 20194, 18961, 15979, 19207], "Wheat": [228570, 220430, 223090, 194290, 220885, 204590, 207427], "Barley": [88620, 87605, 104480, 100770, 84180, 89630, 89038], "Beet": [49635, 49505, 45950, 43415, 40750, 39095, 32162], "Potatoes": [4776, 4738, 4867, 5243, 4679, 4399, 4318], "Grapes": [30, 33, 33, 101, 101, 101, 109] },
    production: { "Corn": [372474, 322678, 364899, 354635, 472874, 388535, 467704], "Triticale": [11520, 11190, 19778, 19663, 23197, 18673, 15394], "Rapeseed": [313181, 266560, 149011, 204897, 190666, 266925, 234523], "Sunflower": [4280, 4286, 11915, 17686, 30608, 34047, 39293], "Vegetables": [64489, 42761, 62797, 60596, 57736, 59292, 67723], "Wheat": [1830659, 1687577, 1956693, 1469618, 1817216, 1732088, 1706559], "Barley": [645944, 606931, 820445, 583518, 634241, 634609, 676645], "Beet": [4588398, 3558810, 3610660, 1708580, 3342255, 2838325, 2641877], "Potatoes": [237401, 197707, 216780, 229578, 219131, 177437, 186358], "Grapes": [231, 474, 306, 352, 371, 735, 702] },
    yield: { "Corn": [11.1, 8.3, 8.2, 6.9, 20.4, 8.3, 17.4], "Triticale": [6.0, 6.0, 6.2, 5.5, 6.4, 6.4, 6.5], "Rapeseed": [4.1, 3.4, 3.1, 3.4, 3.6, 4.2, 3.4], "Sunflower": [3.3, 2.8, 3.0, 2.9, 3.5, 2.8, 3.2], "Vegetables": [13.5, 9.7, 12.1, 8.3, 8.9, 7.9, 8.1], "Wheat": [8.0, 7.7, 8.8, 7.6, 8.2, 8.5, 8.2], "Barley": [7.3, 6.9, 7.9, 5.8, 7.5, 7.1, 7.6], "Beet": [92.4, 71.9, 78.6, 39.4, 82.0, 72.6, 82.1], "Potatoes": [49.7, 41.7, 44.5, 43.8, 46.8, 40.3, 43.2], "Grapes": [7.7, 14.3, 9.3, 7.8, 6.2, 10.8, 7.5] },
  },
  "Centre-Val de Loire": {
    crops: ["Corn", "Triticale", "Rapeseed", "Sunflower", "Wheat", "Barley", "Beet", "Potatoes", "Grapes", "Vegetables"],
    area: { "Wheat": [620000, 600000, 595000, 520000, 590000, 565000, 575000], "Barley": [205000, 195000, 215000, 210000, 195000, 200000, 198000], "Rapeseed": [245000, 260000, 195000, 205000, 185000, 220000, 230000], "Corn": [118000, 120000, 115000, 125000, 113000, 118000, 115000], "Sunflower": [52000, 54000, 62000, 78000, 72000, 88000, 85000], "Beet": [87000, 85000, 78000, 74000, 71000, 69000, 65000], "Potatoes": [12000, 12500, 13000, 13500, 13000, 12800, 12500], "Grapes": [58000, 57000, 58000, 59000, 60000, 60000, 61000], "Vegetables": [18000, 17000, 18500, 19000, 18000, 17500, 18000], "Triticale": [48000, 44000, 50000, 47000, 52000, 48000, 45000] },
    production: { "Wheat": [4650000, 4200000, 4750000, 3700000, 4500000, 4300000, 4400000], "Barley": [1450000, 1280000, 1520000, 1250000, 1380000, 1380000, 1390000], "Rapeseed": [870000, 825000, 620000, 660000, 605000, 730000, 760000], "Corn": [1150000, 1020000, 1000000, 1050000, 990000, 970000, 1000000], "Beet": [7500000, 6700000, 6800000, 3400000, 6300000, 5700000, 5500000], "Potatoes": [530000, 480000, 520000, 540000, 525000, 460000, 480000], "Sunflower": [120000, 115000, 135000, 160000, 155000, 180000, 178000], "Triticale": [270000, 240000, 280000, 250000, 290000, 272000, 260000], "Grapes": [252000, 155000, 210000, 195000, 180000, 230000, 220000], "Vegetables": [90000, 78000, 88000, 92000, 86000, 84000, 87000] },
    yield: { "Wheat": [7.5, 7.0, 8.0, 7.1, 7.6, 7.6, 7.7], "Barley": [7.1, 6.6, 7.1, 6.0, 7.1, 6.9, 7.0], "Rapeseed": [3.6, 3.2, 3.2, 3.2, 3.3, 3.3, 3.3], "Corn": [9.7, 8.5, 8.7, 8.4, 8.8, 8.2, 8.7], "Beet": [86.2, 78.8, 87.2, 45.9, 88.6, 82.4, 84.6], "Potatoes": [44.2, 38.4, 40.0, 40.0, 40.4, 35.9, 38.4], "Sunflower": [2.3, 2.1, 2.2, 2.1, 2.2, 2.0, 2.1], "Triticale": [5.6, 5.5, 5.6, 5.3, 5.6, 5.7, 5.8], "Grapes": [4.3, 2.7, 3.6, 3.3, 3.0, 3.8, 3.6], "Vegetables": [5.0, 4.6, 4.8, 4.8, 4.8, 4.8, 4.8] },
  },
  "Hauts-de-France": {
    crops: ["Wheat", "Barley", "Rapeseed", "Beet", "Potatoes", "Corn", "Vegetables"],
    area: { "Wheat": [570000, 555000, 550000, 490000, 545000, 525000, 530000], "Barley": [190000, 180000, 195000, 190000, 178000, 182000, 180000], "Rapeseed": [195000, 205000, 155000, 165000, 148000, 175000, 185000], "Beet": [195000, 192000, 180000, 170000, 163000, 161000, 152000], "Potatoes": [86000, 87000, 90000, 93000, 90000, 89000, 87000], "Corn": [52000, 50000, 48000, 52000, 47000, 49000, 48000], "Vegetables": [45000, 43000, 46000, 48000, 45000, 44000, 45000] },
    production: { "Wheat": [4600000, 4100000, 4750000, 3600000, 4400000, 4200000, 4300000], "Barley": [1380000, 1210000, 1450000, 1200000, 1310000, 1300000, 1310000], "Rapeseed": [720000, 660000, 510000, 550000, 490000, 580000, 610000], "Beet": [17800000, 16200000, 17100000, 8200000, 15700000, 14300000, 13900000], "Potatoes": [4500000, 3900000, 4300000, 4400000, 4300000, 3800000, 3950000], "Corn": [490000, 420000, 425000, 440000, 415000, 405000, 418000], "Vegetables": [990000, 890000, 980000, 1030000, 960000, 940000, 975000] },
    yield: { "Wheat": [8.1, 7.4, 8.6, 7.3, 8.1, 8.0, 8.1], "Barley": [7.3, 6.7, 7.4, 6.3, 7.4, 7.1, 7.3], "Rapeseed": [3.7, 3.2, 3.3, 3.3, 3.3, 3.3, 3.3], "Beet": [91.3, 84.4, 95.0, 48.2, 96.3, 88.8, 91.4], "Potatoes": [52.3, 44.8, 47.8, 47.3, 47.8, 42.7, 45.4], "Corn": [9.4, 8.4, 8.9, 8.5, 8.8, 8.3, 8.7], "Vegetables": [22.0, 20.7, 21.3, 21.5, 21.3, 21.4, 21.7] },
  },
  "Grand Est": {
    crops: ["Wheat", "Barley", "Rapeseed", "Corn", "Beet", "Grapes", "Potatoes"],
    area: { "Wheat": [480000, 465000, 460000, 405000, 455000, 438000, 442000], "Barley": [175000, 162000, 178000, 175000, 162000, 168000, 165000], "Rapeseed": [210000, 220000, 170000, 178000, 160000, 190000, 200000], "Corn": [245000, 248000, 265000, 295000, 268000, 255000, 238000], "Beet": [89000, 88000, 80000, 76000, 73000, 72000, 68000], "Grapes": [138000, 138000, 138000, 138000, 138000, 138000, 138000], "Potatoes": [11000, 11200, 11500, 12000, 11500, 11200, 11000] },
    production: { "Wheat": [3700000, 3400000, 3800000, 3000000, 3600000, 3450000, 3500000], "Barley": [1260000, 1100000, 1310000, 1080000, 1175000, 1190000, 1185000], "Rapeseed": [760000, 700000, 560000, 590000, 525000, 625000, 660000], "Corn": [2350000, 2260000, 2450000, 2650000, 2400000, 2270000, 2190000], "Beet": [8100000, 7300000, 7600000, 3700000, 7200000, 6700000, 6500000], "Grapes": [950000, 700000, 850000, 780000, 820000, 920000, 880000], "Potatoes": [535000, 490000, 525000, 545000, 525000, 490000, 500000] },
    yield: { "Wheat": [7.7, 7.3, 8.3, 7.4, 7.9, 7.9, 7.9], "Barley": [7.2, 6.8, 7.4, 6.2, 7.3, 7.1, 7.2], "Rapeseed": [3.6, 3.2, 3.3, 3.3, 3.3, 3.3, 3.3], "Corn": [9.6, 9.1, 9.2, 9.0, 9.0, 8.9, 9.2], "Beet": [91.0, 83.0, 95.0, 48.7, 98.6, 93.1, 95.6], "Grapes": [6.9, 5.1, 6.2, 5.7, 5.9, 6.7, 6.4], "Potatoes": [48.6, 43.8, 45.7, 45.4, 45.7, 43.8, 45.5] },
  },
  "Bretagne": {
    crops: ["Wheat", "Barley", "Corn", "Rapeseed", "Potatoes", "Vegetables"],
    area: { "Wheat": [205000, 198000, 196000, 174000, 194000, 187000, 189000], "Barley": [220000, 208000, 225000, 222000, 205000, 212000, 209000], "Corn": [305000, 308000, 325000, 370000, 332000, 315000, 295000], "Rapeseed": [55000, 58000, 45000, 47000, 42000, 50000, 53000], "Potatoes": [27000, 27500, 28500, 30000, 28500, 28000, 27500], "Vegetables": [36000, 34000, 37000, 39000, 37000, 36000, 37000] },
    production: { "Wheat": [1380000, 1210000, 1440000, 1120000, 1330000, 1280000, 1300000], "Barley": [1470000, 1295000, 1570000, 1310000, 1390000, 1390000, 1395000], "Corn": [2700000, 2610000, 2890000, 3170000, 2840000, 2660000, 2590000], "Rapeseed": [175000, 165000, 140000, 148000, 132000, 158000, 168000], "Potatoes": [1090000, 980000, 1050000, 1090000, 1060000, 985000, 1005000], "Vegetables": [700000, 630000, 700000, 730000, 695000, 675000, 695000] },
    yield: { "Wheat": [6.7, 6.1, 7.3, 6.4, 6.9, 6.8, 6.9], "Barley": [6.7, 6.2, 7.0, 5.9, 6.8, 6.6, 6.7], "Corn": [8.9, 8.5, 8.9, 8.6, 8.6, 8.4, 8.8], "Rapeseed": [3.2, 2.8, 3.1, 3.1, 3.1, 3.2, 3.2], "Potatoes": [40.4, 35.6, 36.8, 36.3, 37.2, 35.2, 36.5], "Vegetables": [19.4, 18.5, 18.9, 18.7, 18.8, 18.8, 18.8] },
  },
  "Nouvelle-Aquitaine": {
    crops: ["Wheat", "Barley", "Corn", "Rapeseed", "Sunflower", "Grapes", "Potatoes"],
    area: { "Wheat": [490000, 475000, 470000, 418000, 465000, 447000, 451000], "Barley": [185000, 173000, 188000, 185000, 172000, 177000, 175000], "Corn": [320000, 323000, 345000, 395000, 353000, 335000, 313000], "Rapeseed": [198000, 208000, 163000, 170000, 152000, 180000, 190000], "Sunflower": [165000, 155000, 175000, 220000, 198000, 245000, 235000], "Grapes": [252000, 252000, 253000, 254000, 255000, 255000, 258000], "Potatoes": [18500, 18800, 19500, 20500, 19500, 19100, 18700] },
    production: { "Wheat": [3200000, 3000000, 3400000, 2700000, 3100000, 2980000, 3050000], "Barley": [1180000, 1050000, 1230000, 1090000, 1115000, 1125000, 1120000], "Corn": [2950000, 2820000, 3200000, 3540000, 3140000, 2970000, 2840000], "Rapeseed": [640000, 600000, 490000, 520000, 468000, 556000, 590000], "Sunflower": [360000, 320000, 370000, 430000, 390000, 450000, 440000], "Grapes": [1750000, 1320000, 1650000, 1600000, 1530000, 1790000, 1720000], "Potatoes": [700000, 640000, 680000, 710000, 680000, 620000, 640000] },
    yield: { "Wheat": [6.5, 6.3, 7.2, 6.5, 6.7, 6.7, 6.8], "Barley": [6.4, 6.1, 6.5, 5.9, 6.5, 6.4, 6.4], "Corn": [9.2, 8.7, 9.3, 9.0, 8.9, 8.9, 9.1], "Rapeseed": [3.2, 2.9, 3.0, 3.1, 3.1, 3.1, 3.1], "Sunflower": [2.2, 2.1, 2.1, 2.0, 2.0, 1.8, 1.9], "Grapes": [6.9, 5.2, 6.5, 6.3, 6.0, 7.0, 6.7], "Potatoes": [37.8, 34.0, 34.9, 34.6, 34.9, 32.5, 34.2] },
  },
  "Occitanie": {
    crops: ["Wheat", "Barley", "Corn", "Rapeseed", "Sunflower", "Grapes", "Potatoes"],
    area: { "Wheat": [380000, 368000, 364000, 323000, 360000, 346000, 349000], "Barley": [218000, 204000, 222000, 218000, 203000, 209000, 206000], "Corn": [195000, 197000, 210000, 240000, 215000, 204000, 191000], "Rapeseed": [88000, 93000, 73000, 76000, 68000, 81000, 85000], "Sunflower": [176000, 165000, 186000, 234000, 210000, 260000, 250000], "Grapes": [222000, 221000, 222000, 222000, 223000, 223000, 225000], "Potatoes": [5800, 5900, 6100, 6400, 6100, 5980, 5850] },
    production: { "Wheat": [2280000, 2100000, 2500000, 1970000, 2240000, 2150000, 2200000], "Barley": [1230000, 1085000, 1280000, 1100000, 1150000, 1155000, 1155000], "Corn": [1720000, 1660000, 1870000, 2050000, 1820000, 1715000, 1660000], "Rapeseed": [268000, 252000, 213000, 226000, 200000, 237000, 250000], "Sunflower": [380000, 340000, 385000, 455000, 408000, 470000, 455000], "Grapes": [1560000, 1190000, 1480000, 1440000, 1400000, 1580000, 1530000], "Potatoes": [210000, 195000, 205000, 215000, 208000, 190000, 196000] },
    yield: { "Wheat": [6.0, 5.7, 6.9, 6.1, 6.2, 6.2, 6.3], "Barley": [5.6, 5.3, 5.8, 5.0, 5.7, 5.5, 5.6], "Corn": [8.8, 8.4, 8.9, 8.5, 8.5, 8.4, 8.7], "Rapeseed": [3.0, 2.7, 2.9, 3.0, 2.9, 2.9, 2.9], "Sunflower": [2.2, 2.1, 2.1, 1.9, 1.9, 1.8, 1.8], "Grapes": [7.0, 5.4, 6.7, 6.5, 6.3, 7.1, 6.8], "Potatoes": [36.2, 33.1, 33.6, 33.6, 34.1, 31.8, 33.5] },
  },
};

const FARMER_PERSONAS = [
  { id: "price-fighter", nickname: "The Price Fighter", emoji: "💰", color: T.rose, tagline: "Prix d'abord, agronomie ensuite", share: 28, farmSize: "<40 ha", age: "55–70 yrs", region: "All regions", tenure: "Primarily lessee", structure: "Individual (EARL)", channel: "Direct distributor / price comparison", budget: "Minimises total input spend per ha", description: "Driven purely by invoice price. Will switch supplier for €2/tonne difference. Uses cooperative only if they have the cheapest quote that week. Often over-applies cheap N and under-applies P to save money.", fertiliserBehavior: "Buys cheapest NPK blend available. Defers P applications in tight years. Price spike = immediate P skip.", decisionDriver: "Price", innovationScore: 12, priceScore: 95, agronomyScore: 18, sustainScore: 8, coopScore: 40, digitalScore: 10, p2o5KgHa: 15, fertSpend: 285, ocpOpportunity: "Low — very price-sensitive. TSP pitch must lead with cost-per-unit, not agronomy.", stats: [{ label: "P2O5 applied", value: "~15 kg/ha", note: "vs 55 kg/ha recommended" }, { label: "Avg. farm size", value: "<40 ha", note: "75% operate on leased land" }, { label: "Coop loyalty", value: "Low", note: "Shops multiple distributors" }, { label: "Fert. spend", value: "€285/ha", note: "Below national avg of €340" }, { label: "P deferral rate", value: "~60%", note: "In years of price shocks" }, { label: "Digital tools", value: "None/rare", note: "Phone & paper records" }], segments: [{ label: "Price sensitivity", val: 95, color: T.rose }, { label: "Agronomy focus", val: 18, color: T.green }, { label: "Innovation adopt.", val: 12, color: T.green }, { label: "Sustainability", val: 8, color: T.violet }, { label: "Coop loyalty", val: 40, color: T.amber }] },
  { id: "coop-follower", nickname: "The Coop Follower", emoji: "🤝", color: T.amber, tagline: "Mon conseiller coopératif décide", share: 32, farmSize: "40–100 ha", age: "45–60 yrs", region: "Champagne, Beauce, Picardie", tenure: "Mixed (own + lease)", structure: "GAEC or EARL", channel: "Cooperative agronomist recommendation", budget: "Follows coop package — rarely compares", description: "The dominant profile in French arable farming. Trusts cooperative agronomist completely. Buys the recommended program without questioning it. Highly loyal — sticky once enrolled in a coop program.", fertiliserBehavior: "Buys the cooperative's recommended blend or TSP program verbatim. Does not comparison-shop.", decisionDriver: "Agronomist recommendation", innovationScore: 45, priceScore: 55, agronomyScore: 62, sustainScore: 40, coopScore: 90, digitalScore: 30, p2o5KgHa: 38, fertSpend: 330, ocpOpportunity: "HIGH — must target the coop agronomist, not the farmer. Win the agronomist, win 32% of the market.", stats: [{ label: "P2O5 applied", value: "~38 kg/ha", note: "Still below 55 kg/ha rec." }, { label: "Avg. farm size", value: "40–100 ha", note: "Core cereal zone farms" }, { label: "Coop loyalty", value: "Very high", note: "90% of inputs via coop" }, { label: "Fert. spend", value: "€330/ha", note: "Close to national avg" }, { label: "Decision speed", value: "Fast", note: "Once agronomist advises" }, { label: "TSP familiarity", value: "Low", note: "Mostly uses NPK blends" }], segments: [{ label: "Price sensitivity", val: 55, color: T.rose }, { label: "Agronomy focus", val: 62, color: T.green }, { label: "Innovation adopt.", val: 45, color: T.green }, { label: "Sustainability", val: 40, color: T.violet }, { label: "Coop loyalty", val: 90, color: T.amber }] },
  { id: "precision-pioneer", nickname: "The Precision Pioneer", emoji: "🛰️", color: T.green, tagline: "GPS, VRA, et données avant tout", share: 11, farmSize: ">150 ha", age: "30–45 yrs", region: "Île-de-France, Champagne, Eure-et-Loir", tenure: "Owner-operator or long-term lease", structure: "SAS/SCEA or large GAEC", channel: "Direct supplier + agronomic advisor", budget: "ROI-driven — will pay premium if data-justified", description: "Young, educated, data-driven. Uses GPS variable-rate application, yield mapping, soil sampling grids. Reads ARVALIS trial results. Open to separated P programs if agronomic evidence is clear.", fertiliserBehavior: "Uses VRA for P. Tests TSP vs MAP in on-farm trials. Willing to pay premium if justified by soil analysis.", decisionDriver: "Agronomic ROI + data evidence", innovationScore: 88, priceScore: 35, agronomyScore: 92, sustainScore: 65, coopScore: 55, digitalScore: 82, p2o5KgHa: 52, fertSpend: 410, ocpOpportunity: "VERY HIGH — early adopter. Lead with agronomic trial data and VRA compatibility.", stats: [{ label: "P2O5 applied", value: "~52 kg/ha", note: "Closest to Comifer rec." }, { label: "Avg. farm size", value: ">150 ha", note: "Some >300 ha SCEA" }, { label: "VRA adoption", value: "~80%", note: "GPS-guided P application" }, { label: "Fert. spend", value: "€410/ha", note: "Premium for quality" }, { label: "Trial willingness", value: "High", note: "Conducts own field trials" }, { label: "Digital tools", value: "Full stack", note: "FMIS + satellite imaging" }], segments: [{ label: "Price sensitivity", val: 35, color: T.rose }, { label: "Agronomy focus", val: 92, color: T.green }, { label: "Innovation adopt.", val: 88, color: T.green }, { label: "Sustainability", val: 65, color: T.violet }, { label: "Coop loyalty", val: 55, color: T.amber }] },
  { id: "green-convert", nickname: "The Green Convert", emoji: "🌱", color: T.green, tagline: "Bas carbone et certification HVE", share: 9, farmSize: "30–120 ha", age: "35–55 yrs", region: "Loire Valley, Normandie, Bretagne", tenure: "Owner or long-term tenant", structure: "Individual or GAEC", channel: "Cooperative bio / sustainable advisor", budget: "Will pay premium for certified low-carbon inputs", description: "HVE-certified or transitioning to organic. Actively reducing synthetic inputs. Interested in carbon credits and the Farm-to-Fork agenda.", fertiliserBehavior: "Prefers certified organic P or low-carbon mineral P. Actively seeks cadmium certificates.", decisionDriver: "Environmental certification + brand values", innovationScore: 72, priceScore: 42, agronomyScore: 70, sustainScore: 94, coopScore: 65, digitalScore: 55, p2o5KgHa: 28, fertSpend: 355, ocpOpportunity: "HIGH — lead with OCP's low-cadmium positioning and carbon footprint narrative.", stats: [{ label: "P2O5 applied", value: "~28 kg/ha", note: "Intentionally low-input" }, { label: "HVE certification", value: "14% of FR", note: "60k+ farms certified" }, { label: "Carbon program", value: "12%", note: "Enrolled in credit schemes" }, { label: "Fert. spend", value: "€355/ha", note: "Premium for green inputs" }, { label: "Biostimulant use", value: "High", note: "40%+ already using" }, { label: "Cadmium concern", value: "Very high", note: "EU regs primary motivator" }], segments: [{ label: "Price sensitivity", val: 42, color: T.rose }, { label: "Agronomy focus", val: 70, color: T.green }, { label: "Innovation adopt.", val: 72, color: T.green }, { label: "Sustainability", val: 94, color: T.violet }, { label: "Coop loyalty", val: 65, color: T.amber }] },
  { id: "sunset-farmer", nickname: "The Sunset Farmer", emoji: "🌅", color: T.violet, tagline: "Plus que 5 ans avant la retraite", share: 14, farmSize: "Any, often <60 ha", age: "60–70+ yrs", region: "All — concentrated in <20 ha segment", tenure: "Owner (often inherited)", structure: "Individual, no succession plan", channel: "Habit and inertia — same supplier for decades", budget: "Minimal capex, depleting soil P reserves", description: "Within 5–10 years of retirement. No identified successor. Investing minimally in soil fertility. Actively mining soil P reserves.", fertiliserBehavior: "Applies minimal fertilizer — often below agronomic requirements. Skips P entirely in some years.", decisionDriver: "Inertia and cost minimization", innovationScore: 5, priceScore: 78, agronomyScore: 22, sustainScore: 15, coopScore: 50, digitalScore: 5, p2o5KgHa: 10, fertSpend: 240, ocpOpportunity: "VERY LOW near-term. Long-term: their farms will transfer to Precision Pioneers and Coop Followers.", stats: [{ label: "P2O5 applied", value: "~10 kg/ha", note: "Actively mining soil P" }, { label: "Share of farms", value: "43%+", note: "Operators >55 yrs" }, { label: "Succession plan", value: "<30%", note: "Have identified successor" }, { label: "Fert. spend", value: "€240/ha", note: "Lowest of all segments" }, { label: "Investment horizon", value: "<5 yrs", note: "Near-term retirement" }, { label: "Soil P status", value: "Declining", note: "Building agronomic gap" }], segments: [{ label: "Price sensitivity", val: 78, color: T.rose }, { label: "Agronomy focus", val: 22, color: T.green }, { label: "Innovation adopt.", val: 5, color: T.green }, { label: "Sustainability", val: 15, color: T.violet }, { label: "Coop loyalty", val: 50, color: T.amber }] },
  { id: "consolidator", nickname: "The Consolidator", emoji: "🏗️", color: T.indigo, tagline: "J'agrandis, j'optimise, j'externalise", share: 6, farmSize: "200–500+ ha", age: "40–55 yrs", region: "Beauce, Champagne, Picardie, Bourgogne", tenure: "Primarily lessee — aggressive land accumulation", structure: "SAS, SCEA, or EARL with salaried workers", channel: "Negotiates direct with manufacturers or large distributors", budget: "Volume-driven — seeks best per-tonne delivered cost at scale", description: "Rapidly expanding operations through land leasing. Employs salaried agronomists. Buys at volume — directly from importers or large trading houses.", fertiliserBehavior: "Negotiates bulk contracts 6–12 months ahead. Already uses TSP on wheat. Aware of P separation.", decisionDriver: "Volume economics and operational efficiency", innovationScore: 75, priceScore: 70, agronomyScore: 78, sustainScore: 45, coopScore: 30, digitalScore: 68, p2o5KgHa: 48, fertSpend: 380, ocpOpportunity: "VERY HIGH volume leverage — but bypasses coop channel. Must be approached directly.", stats: [{ label: "P2O5 applied", value: "~48 kg/ha", note: "Near recommended levels" }, { label: "Farm size", value: "200–500+ ha", note: "Some >1,000 ha SAU" }, { label: "Volume share", value: "~20%", note: "Of total P2O5 volume" }, { label: "Fert. spend", value: "€380/ha", note: "Negotiated bulk pricing" }, { label: "Lead time", value: "6–12 mo", note: "Forward buying horizon" }, { label: "Coop bypass", value: "Yes", note: "Direct importer deals" }], segments: [{ label: "Price sensitivity", val: 70, color: T.rose }, { label: "Agronomy focus", val: 78, color: T.green }, { label: "Innovation adopt.", val: 75, color: T.green }, { label: "Sustainability", val: 45, color: T.violet }, { label: "Coop loyalty", val: 30, color: T.amber }] },
];

const MODEL1 = {
  intercept: 0.436, rSquared: 0.993,
  elasticities: { fertilisers: { coef: 0.0795, se: 0.0124, sig: "***", label: "Fertilizers" }, wages: { coef: 0.0702, se: 0.0077, sig: "***", label: "Labour" }, depreciation: { coef: 0.1046, se: 0.0208, sig: "***", label: "Machinery" }, intermediate: { coef: 0.8182, se: 0.0207, sig: "***", label: "Seeds & crop protection" } },
  regions: { "Île-de-France": 0, "(131) Champagne-Ardenne": 0.0291, "(132) Picardie": 0.0017, "(133) Haute-Normandie": -0.0288, "(134) Centre": -0.0863, "(135) Basse-Normandie": -0.0171, "(136) Bourgogne": 0.0041, "(141) Nord-Pas-de-Calais": -0.0339, "(151) Lorraine": -0.0280, "(152) Alsace": -0.0346, "(153) Franche-Comté": 0.0109, "(162) Pays de la Loire": -0.0560, "(163) Bretagne": 0.0019, "(164) Poitou-Charentes": -0.0622, "(182) Aquitaine": -0.1721, "(183) Midi-Pyrénées": -0.0987, "(184) Limousin": -0.0389, "(192) Rhône-Alpes": -0.0613, "(193) Auvergne": -0.0256, "(201) Languedoc-Roussillon": -0.1290, "(203) Provence-Alpes-Côte d'Azur": -0.0814, "(204) Corse": -0.1020, "(205) Guadeloupe": -0.1536, "(206) Martinique": -0.0010, "(207) La Réunion": -0.1631 },
  farmingTypes: { "(1) Fieldcrops": 0, "(2) Horticulture": 0.0239, "(3) Wine": 0.3328, "(4) Other permanent crops": 0.1975, "(5) Milk": 0.0049, "(6) Other grazing livestock": -0.0171, "(7) Granivores": -0.0041, "(8) Mixed": -0.0303 },
  years: { 2014: 0, 2015: 0.0171, 2016: 0.0291, 2017: 0.0340, 2018: 0.0265, 2019: 0.0243, 2020: 0.0056, 2021: 0.0404, 2022: 0.0323, 2023: -0.0530 },
};


// ═══════════════════════════════════════════════════════════════════════════
// BRAZIL DATA  (sourced from CVA × OCP Nutricrops Module A, July 2025)
// ═══════════════════════════════════════════════════════════════════════════
const BRAZIL_REGIONS = [
  { id: "cerrado", name: "Cerrado", states: "Mato Grosso · Goiás · Mato Grosso do Sul", sharePct: 38, color: T.green, soil: "Acidic oxisols, severe P-fixation, low OC", climate: "Tropical savanna — 1,300–1,600 mm rain Oct–Mar", logistics: "Improving via northern arc; Ferrogrão rail under development", blurb: "Brazil's grain powerhouse. Soy + safrinha corn double-crop dominates 83% of area. High-analysis fertilisers (MAP, TSP) preferred for logistics cost efficiency per nutrient unit.", cropMix: { Soybean: 54, Corn: 29, Cotton: 5, Sugarcane: 1, Coffee: 0, Other: 11 } },
  { id: "matopiba", name: "MATOPIBA-PA", states: "Maranhão · Tocantins · Piauí · Bahia · Pará", sharePct: 13, color: "#0ea5e9", soil: "Acidic, sandy oxisols — acute S-deficiency in newly cleared areas", climate: "Heavy rainfall, hot & humid; new agricultural frontier", logistics: "Long inland routes — 30–50% higher freight cost per P₂O₅ unit vs Cerrado", blurb: "Fastest-growing frontier. SSP demand surging 22% CAGR — driven by acute sulfur deficiency in newly cleared soils. Signals clear TSP+S opportunity.", cropMix: { Soybean: 52, Corn: 18, Cotton: 7, Sugarcane: 1, Coffee: 0, Other: 22 } },
  { id: "southeast", name: "Southeast", states: "São Paulo · Minas Gerais · Espírito Santo", sharePct: 18, color: T.amber, soil: "Weathered but fertile oxisols, acidic; higher OC than Cerrado", climate: "Humid (sub)tropical; best road & rail infrastructure", logistics: "Best in country — proximity to Santos port", blurb: "Sugarcane heartland, premium coffee, citrus. High-N blends dominate. Coffee at R$30,000/t creates the highest-margin crop equation in Brazil.", cropMix: { Soybean: 18, Corn: 24, Sugarcane: 28, Coffee: 9, Cotton: 0, Other: 21 } },
  { id: "south", name: "South", states: "Rio Grande do Sul · Paraná · Santa Catarina", sharePct: 25, color: T.violet, soil: "Fertile mollisols — lower acidity, higher OC than Cerrado", climate: "Cooler subtropical; winter wheat after summer soy/corn possible", logistics: "Dense roads, Paranaguá & Rio Grande ports", blurb: "Traditional heartland. Smaller family farms, strong cooperatives (Coamo, C.Vale). TSP visible in wheat P programs. Soy & wheat dominate — 50% / 8% of area.", cropMix: { Soybean: 50, Corn: 16, Sugarcane: 2, Coffee: 0, Cotton: 0, Other: 32 } },
  { id: "other", name: "Northeast & North", states: "Pernambuco · Alagoas · Ceará · Amazonas", sharePct: 6, color: T.slate, soil: "Mixed — neutral/alkaline coastal, acidic Amazon frontier", climate: "Semi-arid Sertão to equatorial Amazon", logistics: "Limited inland infrastructure; coastal ports only", blurb: "Smaller scale, drought-tolerant crops, coastal sugarcane. High dependency on irrigation. Limited strategic priority for TSP.", cropMix: { Soybean: 5, Corn: 15, Sugarcane: 12, Coffee: 8, Cotton: 2, Other: 58 } },
];

const BRAZIL_CROPS = [
  { id: "soybean",  name: "Soybean",        emoji: "🌱", color: T.green,  nationalArea: 47831, nationalYield: 3.4, globalYield: 2.7 },
  { id: "corn",     name: "Corn (Safrinha)", emoji: "🌽", color: T.amber,  nationalArea: 21977, nationalYield: 5.9, globalYield: 5.9 },
  { id: "sugarcane",name: "Sugarcane",       emoji: "🎋", color: T.violet, nationalArea: 8888,  nationalYield: 77.7, globalYield: 75.0 },
  { id: "coffee",   name: "Coffee",          emoji: "☕", color: "#92400e", nationalArea: 2241, nationalYield: 1.8, globalYield: 0.9 },
  { id: "cotton",   name: "Cotton",          emoji: "🌾", color: "#0ea5e9", nationalArea: 2044, nationalYield: 4.4, globalYield: 2.3 },
];

const BRAZIL_FARM_SIZES = [
  { id: "small",  label: "Small holder",  range: "<100 ha",    avgHa: 45,   color: T.slate,  sharePct: 91, landSharePct: 20, yieldPenaltyPct: -12, costInflationPct: +8,  profile: "Family-run, often co-op member, limited mechanisation, cash-flow tight, late ordering, high reliance on credit." },
  { id: "medium", label: "Medium farmer", range: "100–1,000 ha", avgHa: 350, color: "#0ea5e9", sharePct: 8, landSharePct: 35, yieldPenaltyPct: 0,   costInflationPct: 0,   profile: "Professionalized, mix of co-op and direct purchase, partially mechanised, balanced credit access, runs double-crop." },
  { id: "large",  label: "Large / Mega",  range: ">1,000 ha",  avgHa: 3200, color: T.green,  sharePct: 1, landSharePct: 45, yieldPenaltyPct: +6,  costInflationPct: -10, profile: "Vertically integrated, direct importer, GPS auto-steer + VRT, hedges via futures, owns drying & storage." },
];

const BRAZIL_ECON = {
  fertilizerPrices: { MAP: 3800, DAP: 3700, TSP: 3400, SSP: 1500, Urea: 2800, AS: 2200, MOP: 2500, SOP: 4200 },
  nutrientContent: {
    MAP:  { N: 0.11, P2O5: 0.52, K2O: 0,    S: 0.01 },
    DAP:  { N: 0.18, P2O5: 0.46, K2O: 0,    S: 0 },
    TSP:  { N: 0,    P2O5: 0.46, K2O: 0,    S: 0 },
    SSP:  { N: 0,    P2O5: 0.18, K2O: 0,    S: 0.11 },
    Urea: { N: 0.46, P2O5: 0,    K2O: 0,    S: 0 },
    AS:   { N: 0.21, P2O5: 0,    K2O: 0,    S: 0.24 },
    MOP:  { N: 0,    P2O5: 0,    K2O: 0.60, S: 0 },
    SOP:  { N: 0,    P2O5: 0,    K2O: 0.50, S: 0.18 },
  },
  crops: {
    soybean: {
      defaultMix: { MAP: 200, MOP: 130, Urea: 0, AS: 0, SSP: 0, TSP: 0, DAP: 0, SOP: 0 },
      regions: { cerrado: { yield: 3.7, price: 2120, n: 0, p: 80, k: 80 }, matopiba: { yield: 3.6, price: 2150, n: 0, p: 80, k: 80 }, southeast: { yield: 3.4, price: 2200, n: 0, p: 75, k: 75 }, south: { yield: 3.6, price: 2180, n: 0, p: 80, k: 85 }, other: { yield: 3.0, price: 2100, n: 0, p: 75, k: 75 } },
      otherCosts: { seeds: 850, agrochemicals: 1450, fuelMachinery: 720, labor: 240, landRent: 1800, drying: 180, freight: 280, financing: 320, insurance: 140, admin: 110 },
    },
    corn: {
      defaultMix: { MAP: 120, MOP: 100, Urea: 200, AS: 0, SSP: 0, TSP: 0, DAP: 0, SOP: 0 },
      regions: { cerrado: { yield: 6.2, price: 950, n: 73, p: 28, k: 53 }, matopiba: { yield: 5.5, price: 980, n: 73, p: 28, k: 53 }, southeast: { yield: 6.4, price: 1020, n: 73, p: 28, k: 53 }, south: { yield: 7.2, price: 1000, n: 80, p: 30, k: 55 }, other: { yield: 4.5, price: 980, n: 60, p: 25, k: 45 } },
      otherCosts: { seeds: 750, agrochemicals: 950, fuelMachinery: 680, labor: 220, landRent: 1500, drying: 220, freight: 240, financing: 280, insurance: 110, admin: 90 },
    },
    sugarcane: {
      defaultMix: { MAP: 100, MOP: 220, Urea: 220, AS: 0, SSP: 0, TSP: 0, DAP: 0, SOP: 0 },
      regions: { cerrado: { yield: 72, price: 130, n: 110, p: 50, k: 130 }, matopiba: { yield: 65, price: 130, n: 110, p: 50, k: 130 }, southeast: { yield: 82, price: 135, n: 110, p: 50, k: 130 }, south: { yield: 75, price: 130, n: 110, p: 50, k: 130 }, other: { yield: 60, price: 125, n: 95, p: 40, k: 110 } },
      otherCosts: { seeds: 1900, agrochemicals: 850, fuelMachinery: 950, labor: 1100, landRent: 1300, drying: 0, freight: 350, financing: 380, insurance: 90, admin: 120 },
    },
    coffee: {
      defaultMix: { MAP: 0, MOP: 350, Urea: 450, AS: 0, SSP: 0, TSP: 200, DAP: 0, SOP: 0 },
      regions: { cerrado: { yield: 1.8, price: 28000, n: 200, p: 50, k: 200 }, matopiba: { yield: 1.4, price: 28000, n: 200, p: 50, k: 200 }, southeast: { yield: 1.9, price: 30000, n: 200, p: 50, k: 200 }, south: { yield: 1.5, price: 28000, n: 200, p: 50, k: 200 }, other: { yield: 1.2, price: 27000, n: 180, p: 45, k: 180 } },
      otherCosts: { seeds: 0, agrochemicals: 4200, fuelMachinery: 2400, labor: 14500, landRent: 3500, drying: 1800, freight: 980, financing: 1850, insurance: 620, admin: 720 },
    },
    cotton: {
      defaultMix: { MAP: 250, MOP: 250, Urea: 280, AS: 0, SSP: 0, TSP: 0, DAP: 0, SOP: 0 },
      regions: { cerrado: { yield: 4.5, price: 11500, n: 130, p: 120, k: 150 }, matopiba: { yield: 4.6, price: 11500, n: 130, p: 120, k: 150 }, southeast: { yield: 4.0, price: 11500, n: 130, p: 120, k: 150 }, south: { yield: 3.8, price: 11500, n: 120, p: 110, k: 140 }, other: { yield: 3.5, price: 11200, n: 110, p: 100, k: 130 } },
      otherCosts: { seeds: 950, agrochemicals: 4200, fuelMachinery: 1100, labor: 580, landRent: 1900, drying: 0, freight: 420, financing: 580, insurance: 320, admin: 180 },
    },
  },
};

const BRAZIL_INSIGHTS = {
  soybean: {
    cerrado: [
      { type: "positive", icon: "🏆", label: "Brazil's P₂O₅ powerhouse", text: "54% of Cerrado area is soybean. The largest single P₂O₅ end-market in Brazil. Highly mechanised, double-cropped with safrinha corn, P-fixation in acidic oxisols is severe — only 2–30% of applied P is plant-available." },
      { type: "neutral",  icon: "🧪", label: "P-fixation — the chronic problem", text: "Cerrado oxisols fix 70–98% of applied P. Brazilian agriculture applies >30 Mt/yr lime to raise pH to 6–6.5 and improve availability. TSP's localised acidifying effect at the granule surface is actually beneficial in this context." },
      { type: "positive", icon: "🌱", label: "TSP is the agronomic fit", text: "Soybeans fix their own nitrogen via Bradyrhizobium inoculants — the entire crop's phosphorus need must be met without bundling unnecessary N. TSP (0-46-0) is the structurally correct product: high P density, no N waste." },
    ],
    matopiba: [
      { type: "positive", icon: "🌿", label: "S-rich blends opportunity", text: "MATOPIBA's newly cleared oxisols are acutely sulfur-deficient. SSP imports growing 22% CAGR despite lower nutrient density. TSP+S variants (e.g. 3-30-9S) could capture this demand at superior cost-efficiency per nutrient unit." },
      { type: "risk",     icon: "🚛", label: "Logistics cost penalty", text: "Long inland routes add 30–50% to freight cost per P₂O₅ unit vs Cerrado. High-analysis products (TSP, MAP) are structurally advantaged — lower weight per nutrient delivered reduces this penalty." },
    ],
    south: [
      { type: "positive", icon: "🤝", label: "Cooperative gateway", text: "Coamo, C.Vale, Cocamar dominate South distribution. Winning blender-cooperatives is the single most scalable commercial lever. TSP already appears in South wheat programs — soybean adoption is the next step." },
      { type: "neutral",  icon: "🌡️", label: "Mollisol advantage", text: "South mollisols are more fertile and less acidic than Cerrado. Recommended P rates are slightly lower; K demand is higher due to subtropical leaching." },
    ],
    southeast: [
      { type: "neutral",  icon: "🌾", label: "Diversified rotation", text: "Soybean shares acreage with sugarcane and coffee. Blend formulations must coexist in shared blender capacity — compatibility with high-N sugarcane programs is key." },
    ],
    other: [
      { type: "risk", icon: "📉", label: "Limited soy footprint", text: "Northeast and North have minimal soy area. Not a strategic TSP priority for soybean in this region." },
    ],
  },
  corn: {
    cerrado:  [{ type: "risk",     icon: "⚖️", label: "TSP–urea blend block", text: "Standard TSP cannot blend with urea (forms sticky urea-phosphate). For high-N safrinha corn programs, MAP remains the structural choice unless TSP is sold as a separated basal-dose starter." }, { type: "positive", icon: "🌽", label: "Safrinha structural demand", text: "Safrinha corn (off-season after soy) is ~16% of national area and growing. High N demand during V6–V12 means MAP/DAP dominate — but a separated TSP basal dose at sowing is agronomically valid." }],
    matopiba: [{ type: "neutral",  icon: "🚛", label: "Logistics efficiency driver", text: "High-analysis fertilisers strongly preferred in MATOPIBA for the same logistics reason as soybean. MAP dominant for corn given N demand profile." }],
    south:    [{ type: "positive", icon: "🌽", label: "Double-crop synergy",   text: "Winter corn after soy in the South can leverage soil N fixed by soy — reducing N requirements and making separated TSP more competitive as the P source." }],
    southeast:[{ type: "neutral",  icon: "🏭", label: "Industrial demand",     text: "Southeast corn feeds the ethanol and animal-feed complex. Yield stability is paramount — risk-averse farmers prefer proven MAP/NPK programs." }],
    other:    [{ type: "neutral",  icon: "📋", label: "Drought-tolerant varieties", text: "Northeast corn relies on drought-tolerant varieties and lower input intensity. TSP limited opportunity here." }],
  },
  sugarcane: {
    southeast:[{ type: "positive", icon: "🎋", label: "Cane belt heartland",   text: "São Paulo produces 64% of national sugarcane. Mill-coordinated agronomy — fertilisation is often dictated at mill/usina level. Vinasse & filter cake recycle partially substitute K and P, reducing net mineral need." }, { type: "neutral",  icon: "♻️", label: "Vinasse substitution",  text: "Mills return vinasse (K-rich) and filter cake (P & Ca-rich) to fields. Net mineral P demand per ha is below other regions. TSP competes best in plant cane planting rows, not ratoon cycles." }],
    matopiba: [{ type: "neutral",  icon: "🌱", label: "Expanding frontier cane", text: "New cane plantings in MATOPIBA for ethanol demand. Lower organic recycling than São Paulo mills — higher mineral P requirement per ha." }],
    cerrado:  [{ type: "neutral",  icon: "🔬", label: "Lower strategic priority",  text: "Cerrado sugarcane is limited; crop mix dominated by soy/corn/cotton. TSP has limited differentiation in this crop-region combination." }],
    south:    [{ type: "neutral",  icon: "📋", label: "Minor crop",              text: "Sugarcane is a minor crop in the South. Limited strategic priority." }],
    other:    [{ type: "positive", icon: "🌅", label: "Coastal cane",            text: "Pernambuco and Alagoas have mature coastal cane on well-established mills. Long-cycle P programs dominate — TSP in plant-cane furrows is standard practice." }],
  },
  coffee: {
    southeast:[{ type: "positive", icon: "☕", label: "Premium specialty market", text: "Minas Gerais arabica commands the global specialty premium. TSP is already recommended in coffee programs at early fruit set (\"chumbinho\" stage) — low salt index reduces soil salinity risk on sensitive coffee roots." }, { type: "positive", icon: "💧", label: "Fertigation growth",     text: "Drip fertigation expanding rapidly in irrigated Cerrado Mineiro. Soluble specialty products (TSP-based) capture the premium niche. OCP low-cadmium positioning is a strong fit for European export-oriented producers." }],
    cerrado:  [{ type: "positive", icon: "🌱", label: "Cerrado Mineiro coffee", text: "Specialty arabica in southern Minas Gerais — one of Brazil's most productive coffee regions. TSP in basal application and \"chumbinho\" stage is agronomically validated." }],
    matopiba: [{ type: "neutral",  icon: "📋", label: "Limited coffee area",    text: "Coffee is not a MATOPIBA priority crop." }],
    south:    [{ type: "neutral",  icon: "📋", label: "Minor crop",              text: "Coffee is minimal in the South." }],
    other:    [{ type: "positive", icon: "🌿", label: "Bahia & Rondônia coffee", text: "Bahia conillon and Rondônia robusta are growth markets. Lower specialty premiums but significant volume opportunity for TSP in planting programs." }],
  },
  cotton: {
    cerrado:  [{ type: "positive", icon: "🌾", label: "High-margin cash crop",  text: "Cotton in MT and BA is among Brazil's highest-margin row crops. Cost stack supports premium fertilisers — especially Zn/B/S micronutrient-fortified blends alongside TSP for P delivery." }, { type: "risk",     icon: "🐛", label: "Agrochem-intensive",     text: "Cotton's pest pressure is extreme — agrochemical spend often exceeds fertiliser spend. Total P&L is highly exposed to glyphosate and insecticide pricing volatility." }],
    matopiba: [{ type: "positive", icon: "📈", label: "Frontier expansion",     text: "Bahia is Brazil's second-largest cotton producer and still expanding. Irrigation projects in Oeste Baiano (Western Bahia) accelerate yield potential — creating demand for high-P starter programs." }],
    southeast:[{ type: "neutral",  icon: "📋", label: "Minor crop in region",   text: "Cotton not significant in Southeast." }],
    south:    [{ type: "neutral",  icon: "📋", label: "Minor crop",              text: "Cotton not grown meaningfully in the South." }],
    other:    [{ type: "neutral",  icon: "📋", label: "Limited area",            text: "Some cotton in Northeast (Bahia is counted in MATOPIBA). Limited." }],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// BRAZIL PROFITABILITY DATA  (source: Brazil_Recalculated_Profitability_Model.xlsx)
// ═══════════════════════════════════════════════════════════════════════════

// Application rates back-calculated from Scenario Waterfalls sheet at base prices
const BRAZIL_PROF_REGIONS = [
  { id: 'National',            label: 'National',             dapRate: 166.3, mapRate: 210.5 },
  { id: 'Mato Grosso',         label: 'Mato Grosso',          dapRate: 239.8, mapRate: 216.4 },
  { id: 'Paraná',              label: 'Paraná',               dapRate: 248.1, mapRate: 223.8 },
  { id: 'Rio Grande do Sul',   label: 'Rio Grande do Sul',    dapRate: 172.0, mapRate: 155.2 },
  { id: 'Goiás',               label: 'Goiás',                dapRate: 245.3, mapRate: 221.3 },
  { id: 'Mato Grosso do Sul',  label: 'Mato Grosso do Sul',   dapRate: 231.0, mapRate: 208.4 },
];

// 25/26 season baseline (USD/ha). "fertilizers" = full observed spend excl. DAP/MAP shock layer.
// DAP/MAP are modelled as separate cost layers on top of the base program.
const BRAZIL_PROF_BASELINE = {
  National:            { revenue:1336.24, seeds:81.17,  fertilizers:204.05, agrochemicals:260.06, labor:108.89, operations:45.95, maintenance:51.13, depreciation:86.43,  landRental:272.92, financialExpenses:40.99,  other:129.96 },
  'Mato Grosso':       { revenue:1267.84, seeds:76.13,  fertilizers:207.25, agrochemicals:252.54, labor:73.07,  operations:48.39, maintenance:28.45, depreciation:52.22,  landRental:256.59, financialExpenses:41.77,  other:159.47 },
  'Paraná':            { revenue:1450.85, seeds:83.92,  fertilizers:193.19, agrochemicals:265.83, labor:137.53, operations:48.79, maintenance:55.50, depreciation:78.65,  landRental:342.38, financialExpenses:39.85,  other:133.04 },
  'Rio Grande do Sul': { revenue:1060.75, seeds:83.92,  fertilizers:175.29, agrochemicals:258.92, labor:105.88, operations:45.92, maintenance:79.25, depreciation:127.52, landRental:298.78, financialExpenses:43.12,  other:105.54 },
  'Goiás':             { revenue:1372.81, seeds:79.44,  fertilizers:218.90, agrochemicals:254.80, labor:124.13, operations:40.07, maintenance:43.43, depreciation:72.82,  landRental:276.33, financialExpenses:38.63,  other:128.91 },
  'Mato Grosso do Sul':{ revenue:1272.37, seeds:79.44,  fertilizers:195.45, agrochemicals:274.28, labor:113.60, operations:41.66, maintenance:44.44, depreciation:79.67,  landRental:261.71, financialExpenses:40.54,  other:126.15 },
};

// Historical USD/ha from regional sheets (17/18 – 25/26)
const BRAZIL_PROF_HISTORICAL = {
  National: [
    {s:'17/18',rev:943.9, seeds:79.7, fert:92.9,  agro:152.5,labor:83.2, land:174.1,netInc:183.1},
    {s:'18/19',rev:886.5, seeds:77.5, fert:122.8, agro:165.8,labor:82.1, land:167.7,netInc:95.7 },
    {s:'19/20',rev:854.4, seeds:62.5, fert:102.7, agro:143.5,labor:67.1, land:157.7,netInc:179.0},
    {s:'20/21',rev:1306.6,seeds:66.6, fert:105.6, agro:174.8,labor:69.9, land:294.4,netInc:416.5},
    {s:'21/22',rev:1510.7,seeds:87.1, fert:169.8, agro:225.3,labor:81.3, land:387.8,netInc:303.4},
    {s:'22/23',rev:1577.3,seeds:111.2,fert:299.4, agro:326.3,labor:91.6, land:342.1,netInc:99.0 },
    {s:'23/24',rev:1224.8,seeds:94.9, fert:178.5, agro:275.5,labor:92.8, land:299.8,netInc:-6.5 },
    {s:'24/25',rev:1276.3,seeds:81.4, fert:172.8, agro:243.9,labor:98.4, land:293.7,netInc:77.6 },
    {s:'25/26',rev:1336.2,seeds:81.2, fert:204.1, agro:260.1,labor:108.9,land:272.9,netInc:54.7 },
  ],
  'Mato Grosso': [
    {s:'17/18',rev:864.6, seeds:74.3, fert:96.9,  agro:150.7,labor:55.8, land:150.4,netInc:177.7},
    {s:'18/19',rev:843.7, seeds:72.4, fert:125.4, agro:167.1,labor:55.1, land:148.5,netInc:114.0},
    {s:'19/20',rev:811.6, seeds:58.3, fert:107.8, agro:143.9,labor:45.0, land:135.8,netInc:188.6},
    {s:'20/21',rev:1153.6,seeds:62.1, fert:100.8, agro:167.0,labor:46.9, land:279.6,netInc:331.2},
    {s:'21/22',rev:1613.5,seeds:81.1, fert:140.7, agro:225.0,labor:54.6, land:370.5,netInc:496.2},
    {s:'22/23',rev:1562.9,seeds:103.4,fert:333.2, agro:306.2,labor:61.5, land:340.7,netInc:125.2},
    {s:'23/24',rev:1097.0,seeds:88.5, fert:206.8, agro:279.5,labor:62.3, land:292.0,netInc:-89.4},
    {s:'24/25',rev:1292.9,seeds:76.2, fert:172.3, agro:233.7,labor:66.0, land:281.0,netInc:174.2},
    {s:'25/26',rev:1267.8,seeds:76.1, fert:207.3, agro:252.5,labor:73.1, land:256.6,netInc:72.0 },
  ],
  'Paraná': [
    {s:'17/18',rev:1039.9,seeds:82.6, fert:86.2,  agro:149.8,labor:105.1,land:210.6,netInc:229.7},
    {s:'18/19',rev:883.9, seeds:80.4, fert:113.9, agro:158.2,labor:103.7,land:197.7,netInc:60.1 },
    {s:'19/20',rev:1028.5,seeds:64.8, fert:92.5,  agro:142.1,labor:84.8, land:188.7,netInc:314.0},
    {s:'20/21',rev:1454.2,seeds:69.0, fert:99.7,  agro:180.7,labor:88.2, land:371.4,netInc:467.2},
    {s:'21/22',rev:1254.9,seeds:90.4, fert:161.5, agro:218.7,labor:102.7,land:482.9,netInc:-43.1},
    {s:'22/23',rev:1744.1,seeds:115.5,fert:304.5, agro:337.9,labor:115.7,land:414.2,netInc:148.9},
    {s:'23/24',rev:1268.4,seeds:98.4, fert:157.9, agro:286.9,labor:117.2,land:369.2,netInc:-47.0},
    {s:'24/25',rev:1394.9,seeds:84.3, fert:161.5, agro:248.9,labor:124.3,land:361.1,netInc:107.2},
    {s:'25/26',rev:1450.9,seeds:83.9, fert:193.2, agro:265.8,labor:137.5,land:342.4,netInc:72.2 },
  ],
  'Rio Grande do Sul': [
    {s:'17/18',rev:927.1, seeds:82.6, fert:80.5,  agro:145.9,labor:80.9, land:204.1,netInc:107.5},
    {s:'18/19',rev:940.2, seeds:80.4, fert:109.3, agro:154.3,labor:79.9, land:192.7,netInc:99.2 },
    {s:'19/20',rev:622.5, seeds:64.8, fert:88.4,  agro:115.6,labor:65.2, land:196.4,netInc:-80.5},
    {s:'20/21',rev:1353.9,seeds:69.0, fert:94.9,  agro:154.6,labor:67.9, land:371.4,netInc:373.2},
    {s:'21/22',rev:804.7, seeds:90.4, fert:170.5, agro:192.8,labor:79.1, land:492.3,netInc:-501.5},
    {s:'22/23',rev:1040.8,seeds:115.5,fert:203.0, agro:330.7,labor:89.1, land:421.4,netInc:-457.1},
    {s:'23/24',rev:1255.4,seeds:98.4, fert:145.4, agro:286.1,labor:90.2, land:332.3,netInc:-49.8},
    {s:'24/25',rev:838.1, seeds:84.3, fert:164.2, agro:236.8,labor:95.7, land:329.0,netInc:-416.3},
    {s:'25/26',rev:1060.7,seeds:83.9, fert:175.3, agro:258.9,labor:105.9,land:298.8,netInc:-263.4},
  ],
  'Goiás': [
    {s:'17/18',rev:908.8, seeds:77.8, fert:97.7,  agro:151.7,labor:94.9, land:169.5,netInc:159.9},
    {s:'18/19',rev:957.2, seeds:75.8, fert:126.5, agro:168.7,labor:93.6, land:169.7,netInc:167.2},
    {s:'19/20',rev:866.0, seeds:61.1, fert:109.6, agro:145.8,labor:76.5, land:150.7,netInc:196.0},
    {s:'20/21',rev:1296.8,seeds:65.1, fert:108.3, agro:175.5,labor:79.6, land:295.3,netInc:413.7},
    {s:'21/22',rev:1848.4,seeds:85.0, fert:167.3, agro:233.5,labor:92.7, land:389.2,netInc:633.6},
    {s:'22/23',rev:1617.1,seeds:108.6,fert:345.8, agro:315.7,labor:104.5,land:342.7,netInc:111.4},
    {s:'23/24',rev:1331.1,seeds:92.7, fert:193.3, agro:262.6,labor:105.8,land:303.9,netInc:100.1},
    {s:'24/25',rev:1405.8,seeds:79.7, fert:179.9, agro:239.7,labor:112.2,land:299.0,netInc:205.8},
    {s:'25/26',rev:1372.8,seeds:79.4, fert:218.9, agro:254.8,labor:124.1,land:276.3,netInc:95.3 },
  ],
  'Mato Grosso do Sul': [
    {s:'17/18',rev:970.4, seeds:77.8, fert:99.4,  agro:166.6,labor:86.8, land:163.1,netInc:212.3},
    {s:'18/19',rev:870.4, seeds:75.8, fert:130.0, agro:187.5,labor:85.7, land:153.8,netInc:79.9 },
    {s:'19/20',rev:908.8, seeds:61.1, fert:104.9, agro:162.2,labor:70.0, land:143.3,netInc:236.7},
    {s:'20/21',rev:1263.9,seeds:65.1, fert:107.4, agro:185.2,labor:72.9, land:250.7,netInc:420.8},
    {s:'21/22',rev:1508.6,seeds:85.0, fert:166.8, agro:239.1,labor:84.9, land:346.5,netInc:353.9},
    {s:'22/23',rev:1662.5,seeds:108.6,fert:349.2, agro:346.2,labor:95.6, land:297.4,netInc:167.6},
    {s:'23/24',rev:1143.5,seeds:92.7, fert:175.8, agro:273.8,labor:96.8, land:286.9,netInc:-50.8},
    {s:'24/25',rev:1123.9,seeds:79.7, fert:171.7, agro:266.6,labor:102.6,land:280.5,netInc:-60.1},
    {s:'25/26',rev:1272.4,seeds:79.4, fert:195.4, agro:274.3,labor:113.6,land:261.7,netInc:15.4 },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// BRAZIL ECONOMICS ENGINE (pure functions — no UI)
// ═══════════════════════════════════════════════════════════════════════════
function buildBrazilBaseline(regionId, cropId, sizeId) {
  const cropDef = BRAZIL_ECON.crops[cropId];
  const region  = cropDef.regions[regionId];
  const size    = BRAZIL_FARM_SIZES.find(s => s.id === sizeId);
  const yieldT  = region.yield * (1 + size.yieldPenaltyPct / 100);
  const cInf    = 1 + size.costInflationPct / 100;
  const mix     = { ...cropDef.defaultMix };
  const other   = Object.fromEntries(Object.entries(cropDef.otherCosts).map(([k, v]) => [k, Math.round(v * cInf)]));
  return { regionId, cropId, sizeId, farmHa: size.avgHa, yieldT: +yieldT.toFixed(2), priceBRL: region.price, fertMix: mix, otherCosts: other };
}

function computeFertCost(mix) {
  const breakdown = Object.entries(mix).map(([prod, kg]) => {
    const cost = (kg * (BRAZIL_ECON.fertilizerPrices[prod] || 0)) / 1000;
    return { product: prod, kg, costBRL: Math.round(cost) };
  }).filter(r => r.kg > 0);
  return { breakdown, total: breakdown.reduce((s, r) => s + r.costBRL, 0) };
}

function computeNutrients(mix) {
  let N = 0, P2O5 = 0, K2O = 0, S = 0;
  Object.entries(mix).forEach(([prod, kg]) => {
    const c = BRAZIL_ECON.nutrientContent[prod]; if (!c) return;
    N += kg * c.N; P2O5 += kg * c.P2O5; K2O += kg * c.K2O; S += kg * c.S;
  });
  return { N: +N.toFixed(1), P2O5: +P2O5.toFixed(1), K2O: +K2O.toFixed(1), S: +S.toFixed(1) };
}

function computeBrazilPnL(state) {
  const { yieldT, priceBRL, fertMix, otherCosts, farmHa } = state;
  const fert = computeFertCost(fertMix);
  const revenuePerHa = yieldT * priceBRL;
  const variableCosts = { "Seeds": otherCosts.seeds || 0, "Fertilisers": fert.total, "Agrochemicals": otherCosts.agrochemicals || 0, "Fuel & Machinery": otherCosts.fuelMachinery || 0, "Labor": otherCosts.labor || 0, "Drying": otherCosts.drying || 0, "Freight to port": otherCosts.freight || 0 };
  const fixedCosts    = { "Land rent": otherCosts.landRent || 0, "Financing": otherCosts.financing || 0, "Insurance": otherCosts.insurance || 0, "Admin & overhead": otherCosts.admin || 0 };
  const totalVariable = Object.values(variableCosts).reduce((a, b) => a + b, 0);
  const totalFixed    = Object.values(fixedCosts).reduce((a, b) => a + b, 0);
  const contributionMargin = revenuePerHa - totalVariable;
  const netIncome          = revenuePerHa - totalVariable - totalFixed;
  return {
    revenuePerHa, totalVariable, totalFixed, contributionMargin, netIncome,
    variableCosts, fixedCosts, fertCostPerHa: fert.total, fertBreakdown: fert.breakdown,
    farmRevenue: revenuePerHa * farmHa, farmNetIncome: netIncome * farmHa,
    marginPct: revenuePerHa > 0 ? (netIncome / revenuePerHa) * 100 : 0,
    cmPct:     revenuePerHa > 0 ? (contributionMargin / revenuePerHa) * 100 : 0,
    breakEvenPrice: (totalVariable + totalFixed) / Math.max(yieldT, 0.001),
    breakEvenYield: (totalVariable + totalFixed) / Math.max(priceBRL, 0.001),
  };
}


// ═══════════════════════════════════════════════════════════════════════════
// LANDING PAGE (original — unchanged)
// ═══════════════════════════════════════════════════════════════════════════
function LandingPage({ onEnter }) {
  const [vis, setVis] = useState(false);
  const [sub, setSub] = useState(false);
  const [btn, setBtn] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 300); setTimeout(() => setSub(true), 1100); setTimeout(() => setBtn(true), 1900); }, []);
  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Segoe UI',sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{`@keyframes lFadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}} @keyframes lOrbit{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(45,184,75,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(45,184,75,0.04) 1px,transparent 1px)`, backgroundSize: "60px 60px" }} />
      <div style={{ position: "absolute", width: 480, height: 480, borderRadius: "50%", border: "1px solid rgba(45,184,75,0.06)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", animation: "lOrbit 30s linear infinite", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 340, height: 340, borderRadius: "50%", border: "1px solid rgba(45,184,75,0.05)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", animation: "lOrbit 20s linear infinite reverse", pointerEvents: "none" }} />
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(45,184,75,0.06) 0%,transparent 70%)", top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 32, left: 40, display: "flex", alignItems: "center", gap: 12, opacity: vis ? 1 : 0, transition: "opacity 0.8s ease" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#2DB84B,#1A8A34)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: "#FFFFFF", fontFamily: "'DM Mono',monospace", boxShadow: "0 0 16px #2DB84B30" }}>GMO</div>
        <span style={{ color: "rgba(15,36,21,0.3)", fontSize: 12, letterSpacing: "0.15em", textTransform: "uppercase" }}>OCP Nutricrops · Phosphorus Intelligence</span>
      </div>
      <div style={{ textAlign: "center", maxWidth: 720, padding: "0 32px", zIndex: 10 }}>
        <div style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(12px)", transition: "opacity 0.9s ease,transform 0.9s ease", marginBottom: 24 }}>
          <span style={{ background: "rgba(45,184,75,0.1)", border: "1px solid rgba(45,184,75,0.2)", borderRadius: 20, padding: "5px 16px", color: "rgba(45,184,75,0.9)", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>GMO · OCP Nutricrops</span>
        </div>
        <h1 style={{ opacity: vis ? 1 : 0, transform: vis ? "none" : "translateY(20px)", transition: "opacity 0.9s ease,transform 0.9s ease", fontSize: "clamp(26px,4vw,46px)", fontWeight: 300, color: "rgba(15,36,21,0.92)", lineHeight: 1.28, marginBottom: 32, letterSpacing: "-0.02em" }}>
          PhosStrat is GMO's quantitative<br />
          <span style={{ fontWeight: 700, color: T.text }}>platform to better understand</span><br />
          <span style={{ color: T.green, fontWeight: 600 }}>the farmer.</span>
        </h1>
        <div style={{ opacity: sub ? 1 : 0, transform: sub ? "none" : "translateY(10px)", transition: "opacity 0.8s ease,transform 0.8s ease", margin: "0 auto 28px", width: 48, height: 1, background: "linear-gradient(90deg,transparent,rgba(45,184,75,0.6),transparent)" }} />
        <p style={{ opacity: sub ? 1 : 0, transform: sub ? "none" : "translateY(10px)", transition: "opacity 0.8s ease,transform 0.8s ease", fontSize: 15, color: "rgba(15,36,21,0.45)", fontWeight: 300, lineHeight: 1.8, marginBottom: 48 }}>
          Farmer economics · P separation · Crop-level P&L · Regional intelligence
        </p>
        <button onClick={onEnter}
          style={{ opacity: btn ? 1 : 0, transform: btn ? "none" : "translateY(8px)", transition: "opacity 0.6s ease,transform 0.6s ease,background 0.2s,border-color 0.2s", background: "transparent", border: "1px solid rgba(45,184,75,0.5)", color: "rgba(45,184,75,0.9)", padding: "13px 40px", borderRadius: 4, fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(45,184,75,0.1)"; e.currentTarget.style.borderColor = "rgba(45,184,75,0.9)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(45,184,75,0.5)"; e.currentTarget.style.color = "rgba(45,184,75,0.9)"; }}>
          Enter Platform →
        </button>
      </div>
      <div style={{ position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)", opacity: btn ? 0.4 : 0, transition: "opacity 0.8s ease", fontSize: 11, color: "rgba(15,36,21,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", gap: 28 }}>
        <span>France · FADN 909 farms</span><span>·</span><span>Brazil · Embrapa / Conab / Cepea</span><span>·</span><span>OCP Field Intelligence</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COUNTRY SELECTOR
// ═══════════════════════════════════════════════════════════════════════════
function CountrySelector({ onSelect }) {
  const [hov, setHov] = useState(null);
  const countries = [
    { code: "France", flag: "🇫🇷", label: "France", subtitle: "Cereal heartland", accent: T.green, available: true, badge: "Quant Engine", desc: "Mathieu farms soft wheat in northern France. The model runs 909 FADN farms through a P-separation cost engine covering barley, rapeseed and corn across seven production regions with full balance sheet and five-season trajectory.", engine: "FADN France · 909 farms · R²=0.993", img: "/france.jpg", fallbackColors: ["#0055A4", "#FFFFFF", "#EF4135"] },
    { code: "Brazil", flag: "🇧🇷", label: "Brazil", subtitle: "Agricultural powerhouse", accent: "#10b981", available: true, badge: "Quant Engine", desc: "Soy, corn, sugarcane, coffee and cotton across five macro-regions. Every cost line is editable, the fertiliser mix toggleable, and the P&L updates in real time from the farmer's field to the port.", engine: "Embrapa · Conab / Cepea · CVA × OCP Module A 2025", img: "/brazil.jpg", fallbackColors: ["#009C3B", "#FFDF00", "#002776"] },
    { code: "Spain", flag: "🇪🇸", label: "Spain", subtitle: "Mediterranean cereal belt", accent: "#c60b1e", available: false, badge: "Quant Engine", desc: "Wheat, barley and sunflower across Castile, Aragon and Andalusia, with olive and vine adding a perennial layer unique in OCP's European book. Smallholders dominate the south while large irrigated estates run the river valleys.", engine: "MAPA · Red Contable Agraria Nacional · FEGA", img: "https://flagcdn.com/w1280/es.png", fallbackColors: ["#c60b1e", "#ffc400", "#c60b1e"] },
    { code: "USA", flag: "🇺🇸", label: "United States", subtitle: "Corn Belt and Great Plains", accent: "#3C3B6E", available: false, badge: "Quant Engine", desc: "The world's single largest phosphate market. Corn and soybean dominate the Midwest at scale while spring wheat and canola anchor the northern plains. P economics here set the reference price for every other market.", engine: "USDA-NASS · ERS · Corn Belt P&L model", img: "https://flagcdn.com/w1280/us.png", fallbackColors: ["#3C3B6E", "#FFFFFF", "#B22234"] },
    { code: "India", flag: "🇮🇳", label: "India", subtitle: "Smallholder heartland", accent: "#FF9933", available: false, badge: "Quant Engine", desc: "Rice, wheat, sugarcane and pulses farmed overwhelmingly in plots under two hectares. Subsidy architecture shapes every purchasing decision. What a Punjab farmer pays versus what he receives is a different calculus entirely.", engine: "ICRISAT · CACP · Kharif & Rabi panel data", img: "https://flagcdn.com/w1280/in.png", fallbackColors: ["#FF9933", "#FFFFFF", "#138808"] },
    { code: "Turkey", flag: "🇹🇷", label: "Turkey", subtitle: "Anatolian grain corridor", accent: "#E30A17", available: false, badge: "Quant Engine", desc: "Wheat, sunflower, cotton and hazelnut across some of the most diverse agro-ecological zones in OCP's coverage map. Turkey imports nearly all its phosphate and has historically been one of the most price-reactive markets in the Mediterranean basin.", engine: "TÜİK · TZOB · Grain Board of Turkey", img: "https://flagcdn.com/w1280/tr.png", fallbackColors: ["#E30A17", "#FFFFFF", "#E30A17"] },
    { code: "Canada", flag: "🇨🇦", label: "Canada", subtitle: "Prairie export corridor", accent: "#D80621", available: false, badge: "Quant Engine", desc: "Canola, spring wheat, lentils and peas across the three prairie provinces. Canadian farmers are among the most commercially sophisticated in OCP's portfolio and run tight per-bushel economics tied directly to futures markets.", engine: "Statistics Canada · AAFC · Farm Credit Canada", img: "https://flagcdn.com/w1280/ca.png", fallbackColors: ["#D80621", "#FFFFFF", "#D80621"] },
  ];
  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: "40px 24px", position: "relative" }}>
      <style>{`@keyframes cFadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}} .cc{transition:all 0.2s ease;} .cc:hover{transform:translateY(-4px)!important;}`}</style>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(45,184,75,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(45,184,75,0.025) 1px,transparent 1px)`, backgroundSize: "60px 60px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 28, left: 36, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#2DB84B,#1A8A34)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, color: "#0F2415", fontFamily: "'DM Mono',monospace" }}>GMO</div>
        <span style={{ color: "rgba(15,36,21,0.3)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" }}>PhosStratOS · OCP Nutricrops</span>
      </div>
      <div style={{ textAlign: "center", marginBottom: 48, animation: "cFadeUp 0.6s ease both" }}>
        <p style={{ color: T.green, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 700, marginBottom: 14 }}>Farmer Economics Engine</p>
        <h1 style={{ color: T.text, fontSize: "clamp(18px,2.8vw,32px)", fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.4, margin: 0 }}>
          Which farms do you want to<br /><span style={{ fontWeight: 800 }}>step inside?</span>
        </h1>
        <p style={{ color: T.textMuted, fontSize: 13, marginTop: 10, maxWidth: 480, margin: "10px auto 0" }}>Each country opens a separate quantitative engine calibrated to local crops, soils, cost structures and fertilisation practices.</p>
      </div>
      <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", maxWidth: 1220 }}>
        {countries.map((c, i) => (
          <div key={c.code} className="cc"
            onClick={() => c.available && onSelect(c.code)}
            onMouseEnter={() => c.available && setHov(c.code)}
            onMouseLeave={() => setHov(null)}
            style={{ width: 380, background: T.card, border: `1px solid ${hov === c.code ? c.accent + "60" : T.border}`, borderRadius: 16, overflow: "hidden", cursor: c.available ? "pointer" : "default", opacity: c.available ? 1 : 0.45, animation: `cFadeUp 0.6s ${i * 0.12 + 0.15}s ease both`, boxShadow: hov === c.code ? `0 20px 50px ${c.accent}18` : "none", position: "relative" }}>
            <div style={{ height: 160, overflow: "hidden", position: "relative", background: T.panel }}>
              <img src={c.img} alt={c.label} style={{ width: "100%", height: "100%", objectFit: "cover", filter: hov === c.code ? "brightness(1.05)" : "brightness(0.82)", transition: "filter 0.2s" }} onError={e => { e.target.style.display = "none"; }} />
              <div style={{ position: "absolute", inset: 0, background: hov === c.code ? `linear-gradient(to bottom,transparent 40%,${c.accent}20)` : "linear-gradient(to bottom,transparent 50%,rgba(247,249,247,0.5))" }} />
              <span style={{ position: "absolute", top: 12, right: 12, background: c.accent + "22", border: `1px solid ${c.accent}55`, color: c.accent, fontSize: 9, fontWeight: 700, padding: "3px 9px", borderRadius: 4, letterSpacing: "0.08em", textTransform: "uppercase" }}>{c.badge}</span>
            </div>
            <div style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <div>
                  <p style={{ color: c.accent, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, margin: 0 }}>{c.subtitle}</p>
                  <p style={{ color: T.text, fontSize: 20, fontWeight: 700, margin: "2px 0 0", letterSpacing: "-0.01em" }}>{c.flag} {c.label}</p>
                </div>
                {c.available && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={hov === c.code ? c.accent : T.textFaint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke 0.2s" }}><path d="M5 12h14M12 5l7 7-7 7" /></svg>}
              </div>
              <p style={{ color: T.textMid, fontSize: 12.5, lineHeight: 1.65, margin: "10px 0 12px" }}>{c.desc}</p>
              <p style={{ color: T.textFaint, fontSize: 10, borderTop: `1px solid ${T.border}`, paddingTop: 10, margin: 0 }}>{c.engine}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// FRANCE MAP + REGIONAL PAGE (verbatim from original)
// ═══════════════════════════════════════════════════════════════════════════
function heatColor(val, min, max) {
  if (val === undefined || val === null || max === min) return T.border;
  const t = Math.max(0, Math.min(1, (val - min) / (max - min)));
  const r = Math.round(38 + t * (180 - 38));
  const g = Math.round(60 + t * (210 - 60));
  const b = Math.round(140 + t * (80 - 140));
  return `rgb(${r},${g},${b})`;
}
function projectFeature(coords, bbox, W, H, pad) {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  const sx = (W - pad * 2) / (maxLon - minLon), sy = (H - pad * 2) / (maxLat - minLat), sc = Math.min(sx, sy);
  const ox = pad + (W - pad * 2 - (maxLon - minLon) * sc) / 2, oy = pad + (H - pad * 2 - (maxLat - minLat) * sc) / 2;
  const proj = ([lo, la]) => [ox + (lo - minLon) * sc, oy + (maxLat - la) * sc];
  const ring = r => r.map((p, i) => { const [x, y] = proj(p); return (i === 0 ? `M${x.toFixed(1)},${y.toFixed(1)}` : `L${x.toFixed(1)},${y.toFixed(1)}`); }).join(" ") + "Z";
  if (!coords) return "";
  if (typeof coords[0][0][0] === "number") return coords.map(ring).join(" ");
  return coords.map(poly => poly.map(ring).join(" ")).join(" ");
}
function FranceMap({ selectedRegion, onSelectRegion, heatValues }) {
  const [paths, setPaths] = useState({});
  const [cents, setCents] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [hovered, setHovered] = useState(null);
  const W = 520, H = 560, PAD = 18;
  useEffect(() => {
    fetch("https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/regions-version-simplifiee.geojson")
      .then(r => r.json()).then(gj => {
        let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
        gj.features.forEach(f => { const flat = f.geometry.type === "Polygon" ? f.geometry.coordinates.flat() : f.geometry.coordinates.flat(2); flat.forEach(([lo, la]) => { if (la < 40) return; if (lo < minLon) minLon = lo; if (lo > maxLon) maxLon = lo; if (la < minLat) minLat = la; if (la > maxLat) maxLat = la; }); });
        const bbox = [minLon - 0.3, minLat - 0.3, maxLon + 0.3, maxLat + 0.3];
        const np = {}, nc = {};
        gj.features.forEach(f => {
          const nom = f.properties.nom; const geo = f.geometry;
          const coords = geo.type === "Polygon" ? [geo.coordinates] : geo.coordinates;
          np[nom] = projectFeature(coords, bbox, W, H, PAD);
          const flat = (geo.type === "Polygon" ? geo.coordinates[0] : geo.coordinates[0][0]);
          const cLon = flat.reduce((s, [lo]) => s + lo, 0) / flat.length;
          const cLat = flat.reduce((s, [, la]) => s + la, 0) / flat.length;
          nc[nom] = [PAD + (cLon - bbox[0]) * (W - PAD * 2) / (bbox[2] - bbox[0]), PAD + (bbox[3] - cLat) * (H - PAD * 2) / (bbox[3] - bbox[1])];
        });
        setPaths(np); setCents(nc); setLoaded(true);
      }).catch(() => {});
  }, []);
  const hasData = r => Object.keys(REGIONAL_DATA).includes(r);
  const vals = Object.entries(heatValues || {}).filter(([r]) => hasData(r)).map(([, v]) => v);
  const minV = vals.length ? Math.min(...vals) : 0, maxV = vals.length ? Math.max(...vals) : 1;
  const fmt2 = v => v > 1000000 ? (v / 1000000).toFixed(1) + "M" : v > 1000 ? (v / 1000).toFixed(0) + "k" : Number(v).toFixed(v < 20 ? 1 : 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <defs><filter id="mGlow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      {!loaded && <text x={W / 2} y={H / 2} textAnchor="middle" fill={T.textFaint} fontSize={12} fontFamily="DM Sans,sans-serif">Loading map…</text>}
      {Object.entries(paths).map(([name, d]) => {
        const [cx, cy] = cents[name] || [0, 0];
        const isSel = selectedRegion === name, isHov = hovered === name, hasD = hasData(name);
        const hVal = heatValues?.[name];
        const fill = isSel ? "#ffffff" : isHov ? (hasD ? "#C8F0D0" : T.border) : (hasD ? heatColor(hVal, minV, maxV) : T.border);
        return (
          <g key={name} style={{ cursor: hasD ? "pointer" : "default", opacity: hasD ? 1 : 0.6 }} onClick={() => hasD && onSelectRegion(name)} onMouseEnter={() => setHovered(name)} onMouseLeave={() => setHovered(null)}>
            <path d={d} fill={fill} stroke={isSel ? "#fff" : isHov ? "#C8F0D0" : "#9BB5A0"} strokeWidth={isSel ? 2.5 : 1.2} filter={isSel ? "url(#mGlow)" : undefined} style={{ transition: "fill 0.18s" }} />
            {(isHov || isSel) && (<>
              <text x={cx} y={cy - (hVal !== undefined ? 6 : 0)} textAnchor="middle" dominantBaseline="middle" fontSize={isSel ? 8.5 : 8} fill={isSel ? "#FFFFFF" : T.text} fontWeight={700} fontFamily="DM Sans,sans-serif" style={{ pointerEvents: "none", userSelect: "none" }}>{name.substring(0, 18)}</text>
              {hVal !== undefined && <text x={cx} y={cy + 8} textAnchor="middle" dominantBaseline="middle" fontSize={7.5} fill={isSel ? "#FFFFFF" : "#C8F0D0"} fontFamily="DM Mono,monospace" style={{ pointerEvents: "none", userSelect: "none" }}>{fmt2(hVal)}</text>}
            </>)}
          </g>
        );
      })}
      {vals.length > 0 && (<g transform={`translate(12,${H - 26})`}>
        <defs><linearGradient id="scBar" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#0f2035" /><stop offset="50%" stopColor="#2DB84B" /><stop offset="100%" stopColor="#2DB84B" /></linearGradient></defs>
        <rect x={0} y={0} width={110} height={7} rx={3} fill="url(#scBar)" />
        <text x={0} y={17} fontSize={7} fill={T.textMuted} fontFamily="DM Mono,sans-serif">{fmt2(minV)}</text>
        <text x={55} y={17} fontSize={7} fill={T.textMuted} fontFamily="DM Mono,sans-serif" textAnchor="middle">low → high</text>
        <text x={110} y={17} fontSize={7} fill={T.textMuted} fontFamily="DM Mono,sans-serif" textAnchor="end">{fmt2(maxV)}</text>
      </g>)}
      <g transform={`translate(135,${H - 24})`}><rect x={0} y={0} width={9} height={7} rx={1} fill={T.bg} stroke={T.border} strokeWidth={0.7} /><text x={12} y={7} fontSize={7} fill={T.textDim} fontFamily="DM Sans,sans-serif">No data yet</text></g>
    </svg>
  );
}

function RegionalPage() {
  const availableRegions = Object.keys(REGIONAL_DATA);
  const [selectedRegion, setSelectedRegion] = useState(availableRegions[0]);
  const [selectedCrop, setSelectedCrop] = useState("Wheat");
  const [metric, setMetric] = useState("yield");
  const regionData = REGIONAL_DATA[selectedRegion];
  const availableCrops = regionData ? regionData.crops : [];
  const activeCrop = availableCrops.includes(selectedCrop) ? selectedCrop : availableCrops[0];
  const metricLabel = { area: "Harvested Area", production: "Production", yield: "Yield" };
  const metricUnit  = { area: "Ha", production: "tonnes", yield: "t/Ha" };
  const metricColor = { area: T.green, production: T.green, yield: T.amber };
  const chartData = regionData && regionData[metric] ? YEARS.map((y, i) => ({ year: y, value: regionData[metric][activeCrop]?.[i] ?? 0 })) : [];
  const heatValues = Object.fromEntries(availableRegions.map(r => { const rd = REGIONAL_DATA[r]; const c = rd?.crops.includes(activeCrop) ? activeCrop : rd?.crops[0]; const v = rd?.[metric]?.[c]?.[6] ?? null; return [r, v]; }).filter(([, v]) => v !== null));
  const cropColors = [T.green, T.green, T.amber, T.violet, T.rose];
  const multiChart = regionData ? YEARS.map((y, i) => ({ year: y, ...Object.fromEntries(availableCrops.slice(0, 5).map(c => [c, regionData[metric][c]?.[i] ?? 0])) })) : [];
  const tickFmt = v => v > 1000000 ? (v / 1000000).toFixed(1) + "M" : v > 1000 ? (v / 1000).toFixed(0) + "k" : Number(v).toFixed(v < 20 ? 1 : 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 16px", display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <p style={{ color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7, fontWeight: 600 }}>Metric</p>
          <div style={{ display: "flex", gap: 7 }}>{Object.entries(metricLabel).map(([k, l]) => (<button key={k} onClick={() => setMetric(k)} style={{ padding: "7px 16px", borderRadius: 8, border: `2px solid ${metric === k ? metricColor[k] : T.border}`, background: metric === k ? metricColor[k] + "22" : "transparent", color: metric === k ? metricColor[k] : T.textMuted, fontSize: 12, fontWeight: metric === k ? 700 : 400, cursor: "pointer" }}>{l} <span style={{ opacity: 0.6, fontSize: 10 }}>({metricUnit[k]})</span></button>))}</div>
        </div>
        <div>
          <p style={{ color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7, fontWeight: 600 }}>Crop</p>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{["Wheat", "Barley", "Rapeseed", "Corn", "Sunflower", "Beet", "Potatoes"].map(c => { const avail = regionData?.crops.includes(c); return (<button key={c} onClick={() => avail && setSelectedCrop(c)} style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${activeCrop === c ? T.text : avail ? "#B8D4BE" : T.border}`, background: activeCrop === c ? T.text : "transparent", color: activeCrop === c ? "#FFFFFF" : avail ? T.textMuted : "#2d3748", fontSize: 11, fontWeight: activeCrop === c ? 700 : 400, cursor: avail ? "pointer" : "default", opacity: avail ? 1 : 0.35 }}>{c}</button>); })}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div><h3 className="card-title" style={{ marginBottom: 1 }}>France — {metricLabel[metric]} · {activeCrop} · 2023</h3><p style={{ color: T.textMuted, fontSize: 10 }}>Click a region to see its time series →</p></div>
            {selectedRegion && <span style={{ background: metricColor[metric] + "20", border: `1px solid ${metricColor[metric]}40`, borderRadius: 8, padding: "3px 10px", color: metricColor[metric], fontSize: 11, fontWeight: 700 }}>{selectedRegion.substring(0, 16)}</span>}
          </div>
          <FranceMap selectedRegion={selectedRegion} onSelectRegion={r => { setSelectedRegion(r); setSelectedCrop(REGIONAL_DATA[r]?.crops.includes(activeCrop) ? activeCrop : REGIONAL_DATA[r]?.crops[0]); }} heatValues={heatValues} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>{availableRegions.map(r => (<button key={r} onClick={() => setSelectedRegion(r)} style={{ padding: "3px 8px", borderRadius: 5, border: `1px solid ${selectedRegion === r ? metricColor[metric] : T.border}`, background: selectedRegion === r ? metricColor[metric] + "20" : "transparent", color: selectedRegion === r ? metricColor[metric] : T.textDim, fontSize: 9, cursor: "pointer" }}>{r.split("-")[0].split("–")[0].trim().substring(0, 14)}</button>))}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ border: `1px solid ${metricColor[metric]}30` }}>
            <h3 className="card-title" style={{ color: metricColor[metric] }}>{activeCrop} — {metricLabel[metric]} ({metricUnit[metric]}) · {selectedRegion}</h3>
            <p style={{ color: T.textMuted, fontSize: 10, marginBottom: 10 }}>2017–2023 · Source: Agreste / Ministry of Agriculture</p>
            <ResponsiveContainer width="100%" height={185}>
              <BarChart data={chartData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                <XAxis dataKey="year" tick={{ fill: T.textMuted, fontSize: 9 }} />
                <YAxis tick={{ fill: T.textMuted, fontSize: 9 }} tickFormatter={tickFmt} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name={metricLabel[metric]} fill={metricColor[metric]} radius={[4, 4, 0, 0]}>{chartData.map((_, i) => <Cell key={i} fill={i === 6 ? "#ffffff" : metricColor[metric]} fillOpacity={i === 6 ? 1 : 0.7} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 className="card-title">All Crops — {metricLabel[metric]} ({metricUnit[metric]}) · {selectedRegion}</h3>
            <ResponsiveContainer width="100%" height={165}>
              <LineChart data={multiChart} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                <XAxis dataKey="year" tick={{ fill: T.textMuted, fontSize: 9 }} />
                <YAxis tick={{ fill: T.textMuted, fontSize: 9 }} tickFormatter={tickFmt} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 9 }} />
                {availableCrops.slice(0, 5).map((c, i) => <Line key={c} type="monotone" dataKey={c} stroke={cropColors[i]} strokeWidth={c === activeCrop ? 2.5 : 1.5} dot={false} strokeDasharray={c === activeCrop ? undefined : "3 2"} />)}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// FRANCE FARMER ARCHETYPES PAGE
// ═══════════════════════════════════════════════════════════════════════════
function FarmerArchetypesPage() {
  const [activePersona, setActivePersona] = useState(FARMER_PERSONAS[0].id);
  const [viewMode, setViewMode] = useState("grid");
  const persona = FARMER_PERSONAS.find(p => p.id === activePersona) || FARMER_PERSONAS[0];
  const p2o5Chart = FARMER_PERSONAS.map(p => ({ name: p.nickname.replace("The ", ""), value: p.p2o5KgHa, fill: p.color }));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {FARMER_PERSONAS.map(p => (<button key={p.id} onClick={() => setActivePersona(p.id)} style={{ padding: "8px 16px", borderRadius: 6, cursor: "pointer", background: activePersona === p.id ? p.color + "20" : "transparent", border: `1px solid ${activePersona === p.id ? p.color : T.border}`, color: activePersona === p.id ? p.color : T.textMuted, fontSize: 12, fontWeight: activePersona === p.id ? 700 : 400, transition: "all 0.15s" }}>{p.nickname} · <span style={{ fontFamily: "'DM Mono',monospace" }}>{p.share}%</span></button>))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>{[["grid", "Overview"], ["detail", "Deep Dive"]].map(([k, l]) => (<button key={k} onClick={() => setViewMode(k)} style={{ padding: "5px 14px", borderRadius: 6, border: `1px solid ${viewMode === k ? T.textMuted : T.border}`, background: "transparent", color: viewMode === k ? T.text : T.textMuted, fontSize: 11, cursor: "pointer" }}>{l}</button>))}</div>

      {viewMode === "grid" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="card">
              <p style={{ color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 4 }}>P₂O₅ Applied by Archetype (kg/ha)</p>
              <p style={{ color: T.textMuted, fontSize: 11, marginBottom: 10 }}>vs Comifer recommendation: 55 kg/ha</p>
              <ResponsiveContainer width="100%" height={200}><BarChart data={p2o5Chart} layout="vertical" margin={{ left: 90, right: 20 }}><CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} /><XAxis type="number" domain={[0, 60]} tick={{ fill: T.textMuted, fontSize: 9 }} /><YAxis type="category" dataKey="name" tick={{ fill: T.textMuted, fontSize: 10 }} width={90} /><Tooltip content={<CustomTooltip />} /><ReferenceLine x={55} stroke={T.amber + "60"} strokeDasharray="4 4" label={{ value: "Rec.", fill: T.amber, fontSize: 9 }} /><Bar dataKey="value" name="P₂O₅ kg/ha" radius={[0, 4, 4, 0]}>{p2o5Chart.map((d, i) => <Cell key={i} fill={d.fill} />)}</Bar></BarChart></ResponsiveContainer>
            </div>
            <div className="card">
              <p style={{ color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 10 }}>Segment Share (%)</p>
              <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={FARMER_PERSONAS.map(p => ({ name: p.nickname, value: p.share, color: p.color }))} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" paddingAngle={2}>{FARMER_PERSONAS.map((p, i) => <Cell key={i} fill={p.color} />)}</Pie><Tooltip formatter={(v, n) => [`${v}%`, n]} /></PieChart></ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>{FARMER_PERSONAS.map((p, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 6, height: 6, borderRadius: 1, background: p.color }} /><span style={{ color: T.textMuted, fontSize: 10 }}>{p.nickname.replace("The ", "")} {p.share}%</span></div>))}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(265px,1fr))", gap: 10 }}>
            {FARMER_PERSONAS.map((p, i) => (<div key={i} onClick={() => { setActivePersona(p.id); setViewMode("detail"); }} style={{ background: T.card, border: `1px solid ${T.border}`, borderTop: `2px solid ${p.color}`, borderRadius: 10, padding: "16px", cursor: "pointer", transition: "border-color 0.15s" }} onMouseEnter={e => e.currentTarget.style.borderColor = p.color + "40"} onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.borderTopColor = p.color; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}><div><p style={{ color: p.color, fontSize: 13, fontWeight: 700, margin: "0 0 2px" }}>{p.nickname}</p><p style={{ color: T.textMuted, fontSize: 10, fontStyle: "italic", margin: 0 }}>{p.tagline}</p></div><p style={{ color: p.color, fontSize: 19, fontWeight: 800, fontFamily: "'DM Mono',monospace", margin: 0 }}>{p.share}%</p></div>
              <p style={{ color: T.textMuted, fontSize: 11, lineHeight: 1.65, marginBottom: 10 }}>{p.description.slice(0, 105)}…</p>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px solid ${T.border}`, paddingTop: 10 }}><span style={{ color: T.textMuted, fontSize: 10 }}>P applied: <span style={{ color: p.color, fontFamily: "'DM Mono',monospace" }}>{p.p2o5KgHa} kg/ha</span></span><span style={{ color: T.textMuted, fontSize: 10 }}>€{p.fertSpend}/ha</span></div>
            </div>))}
          </div>
        </div>
      )}

      {viewMode === "detail" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: `linear-gradient(135deg,${persona.color}10,${T.card})`, border: `1px solid ${persona.color}25`, borderRadius: 14, padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}><h2 style={{ color: persona.color, fontSize: 20, fontWeight: 800, margin: 0 }}>{persona.nickname}</h2><span style={{ padding: "2px 10px", background: persona.color + "20", color: persona.color, borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{persona.share}% of French farmers</span></div>
                <p style={{ color: T.textMuted, fontSize: 12, fontStyle: "italic", marginBottom: 10 }}>"{persona.tagline}"</p>
                <p style={{ color: T.textMid, fontSize: 12, lineHeight: 1.8, margin: 0 }}>{persona.description}</p>
              </div>
              <div style={{ background: T.card, border: `1px solid ${persona.color}20`, borderRadius: 10, padding: "14px 18px", minWidth: 200 }}><p style={{ color: T.textMuted, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>OCP Opportunity</p><p style={{ color: T.textMid, fontSize: 11, lineHeight: 1.75 }}>{persona.ocpOpportunity}</p></div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div className="card"><p style={{ color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 14 }}>Behavioral Profile</p><PersonaRadar persona={persona} /><div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}><ScoreBar label="Price Sensitivity" val={persona.priceScore} color={T.rose} /><ScoreBar label="Agronomy Focus" val={persona.agronomyScore} color={T.green} /><ScoreBar label="Innovation" val={persona.innovationScore} color={T.green} /><ScoreBar label="Sustainability" val={persona.sustainScore} color={T.violet} /><ScoreBar label="Coop Loyalty" val={persona.coopScore} color={T.amber} /><ScoreBar label="Digital Adoption" val={persona.digitalScore} color={T.slate} /></div></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="card"><p style={{ color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 12 }}>Profile Facts</p><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>{[["Farm size", persona.farmSize], ["Age range", persona.age], ["Region", persona.region], ["Tenure", persona.tenure], ["Structure", persona.structure], ["Channel", persona.channel]].map(([k, v]) => (<div key={k} style={{ background: T.panel, borderRadius: 6, padding: "8px 10px" }}><p style={{ color: T.textMuted, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{k}</p><p style={{ color: T.textMid, fontSize: 11, fontWeight: 500 }}>{v}</p></div>))}</div></div>
              <div className="card"><p style={{ color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: 8 }}>Fertilizer Decision Logic</p><p style={{ color: persona.color, fontSize: 10, fontWeight: 700, marginBottom: 4 }}>Driver: {persona.decisionDriver}</p><p style={{ color: T.textMuted, fontSize: 11, lineHeight: 1.7 }}>{persona.fertiliserBehavior}</p></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 6 }}>{persona.stats.map((s, i) => (<div key={i} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px" }}><p style={{ color: T.textMuted, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{s.label}</p><p style={{ color: persona.color, fontSize: 15, fontWeight: 800, fontFamily: "'DM Mono',monospace", margin: 0 }}>{s.value}</p><p style={{ color: T.textMuted, fontSize: 9, marginTop: 3 }}>{s.note}</p></div>))}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// FRANCE QUANTITATIVE ENGINE (verbatim from original — Mathieu intro + farm)
// ═══════════════════════════════════════════════════════════════════════════
function QuantitativeEngineValuePage({ onContinue }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => { const t = [setTimeout(() => setPhase(1), 400), setTimeout(() => setPhase(2), 1200), setTimeout(() => setPhase(3), 2400), setTimeout(() => setPhase(4), 3600)]; return () => t.forEach(clearTimeout); }, []);
  const regions = [{ name: "Europe", color: T.green }, { name: "Brazil", color: T.green }, { name: "India", color: T.amber }, { name: "Africa", color: T.rose }, { name: "LATAM", color: T.violet }, { name: "APAC", color: "#5CC96E" }, { name: "North America", color: "#fb923c" }];
  const bus = [{ name: "Customization BU", role: "Tailor formulations to real purchasing power and local economics" }, { name: "Green Solutions BU", role: "Validate environmental claims with field level financial evidence" }, { name: "Nutrition Solutions BU", role: "Demonstrate the agronomic and economic case for nutrient separation" }];
  return (
    <div style={{ minHeight: "calc(100vh - 130px)", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", fontFamily: "'DM Sans',sans-serif", padding: "40px 32px" }}>
      <style>{`.value-cta{transition:all 0.3s ease;} .value-cta:hover{background:${T.text}!important;color:${T.bg}!important;transform:translateY(-2px)!important;}`}</style>
      <div style={{ maxWidth: 860, width: "100%", zIndex: 10 }}>
        <div style={{ opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? "none" : "translateY(20px)", transition: "opacity 0.8s ease,transform 0.8s ease", marginBottom: 40 }}>
          <p style={{ color: T.green, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.22em", fontWeight: 700, margin: "0 0 14px" }}>PhosStratOS · Quantitative Engine</p>
          <h1 style={{ color: T.text, fontSize: "clamp(32px,4vw,50px)", fontWeight: 300, letterSpacing: "-0.04em", lineHeight: 1.12, margin: "0 0 20px" }}>The <span style={{ fontWeight: 800 }}>P Doctrine</span> is not a claim that phosphorus separation always wins.</h1>
          <p style={{ color: T.textMid, fontSize: 15, lineHeight: 1.85, maxWidth: 720, margin: 0 }}>It is the claim that when a farmer buys phosphorus separately from nitrogen and potassium, the financial outcome is transparent and the input decision is auditable. In some crops and regions, that transparency reveals TSP as the highest margin option. In others, it reveals that a compound product with bundled nitrogen produces better economics because the crop genuinely needs both nutrients at the same time. The engine quantifies which case applies.</p>
        </div>
        <div style={{ opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? "none" : "translateY(20px)", transition: "opacity 0.8s ease 0.2s,transform 0.8s ease 0.2s", marginBottom: 32 }}>
          <p style={{ color: T.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600, margin: "0 0 14px" }}>Strategic regions</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{regions.map(r => (<span key={r.name} style={{ display: "inline-block", padding: "7px 16px", borderRadius: 20, background: r.color + "12", border: `1.5px solid ${r.color}40`, color: r.color, fontSize: 12, fontWeight: 700, letterSpacing: "0.04em" }}>{r.name}</span>))}</div>
        </div>
        <div style={{ opacity: phase >= 3 ? 1 : 0, transform: phase >= 3 ? "none" : "translateY(20px)", transition: "opacity 0.8s ease 0.3s,transform 0.8s ease 0.3s", marginBottom: 32 }}>
          <p style={{ color: T.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600, margin: "0 0 14px" }}>Business Units served</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>{bus.map(b => (<div key={b.name} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 18px" }}><p style={{ color: T.text, fontSize: 13, fontWeight: 700, margin: "0 0 6px" }}>{b.name}</p><p style={{ color: T.textMuted, fontSize: 11, lineHeight: 1.6, margin: 0 }}>{b.role}</p></div>))}</div>
        </div>
        <div style={{ opacity: phase >= 3 ? 1 : 0, transition: "opacity 0.8s ease 0.5s", marginBottom: 36 }}>
          <p style={{ color: T.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600, margin: "0 0 12px" }}>How the engine works</p>
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "18px 22px" }}><p style={{ color: T.textMid, fontSize: 13, lineHeight: 1.85, margin: 0 }}>The engine runs a log-log econometric production model trained on panel data from 909 real French farms observed annually between 2014 and 2023 (FADN France, R² = 0.993). It takes a farm's structural parameters (size, crop, region, tenure structure, farmer age) and computes the revenue, input cost, gross margin, and return on fertilizer investment for every major phosphorus product on the market.</p></div>
        </div>
        <div style={{ opacity: phase >= 4 ? 1 : 0, transition: "opacity 0.8s ease", display: "flex", justifyContent: "center" }}>
          <button className="value-cta" onClick={onContinue} style={{ background: "transparent", border: `2px solid ${T.text}`, color: T.text, padding: "16px 44px", borderRadius: 4, fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>Meet the farmer →</button>
        </div>
      </div>
    </div>
  );
}

function MathieuIntroPage({ onEnterFarm }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => { const t = [setTimeout(() => setPhase(1), 300), setTimeout(() => setPhase(2), 1200), setTimeout(() => setPhase(3), 2600)]; return () => t.forEach(clearTimeout); }, []);
  return (
    <div style={{ minHeight: "calc(100vh - 130px)", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`@keyframes breathe{0%,100%{transform:scale(1)}50%{transform:scale(1.01)}} @keyframes lineReveal{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} @keyframes riseUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}} .cta-btn{transition:all 0.3s ease;} .cta-btn:hover{transform:translateY(-2px)!important;}`}</style>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, maxWidth: 1000, width: "100%", padding: "0 40px", zIndex: 10, alignItems: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", opacity: phase >= 1 ? 1 : 0, transition: "opacity 1s ease" }}>
          <div style={{ position: "relative", width: 320, height: 420, borderRadius: 4, overflow: "hidden", animation: phase >= 1 ? "breathe 6s ease-in-out infinite" : "none", boxShadow: "0 40px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(45,184,75,0.1)" }}>
            <img src="/farmer.png" alt="Mathieu" style={{ position: "absolute", top: "-8%", left: "-4%", width: "108%", height: "108%", objectFit: "cover", objectPosition: "center 12%", display: "block", filter: "brightness(0.88) contrast(1.05)" }} onError={e => { e.target.style.display = "none"; }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 55%, rgba(247,249,247,0.85) 100%)" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "18px 20px" }}><p style={{ color: "rgba(15,36,21,0.5)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 4px" }}>Champagne-Ardenne · France</p><p style={{ color: T.text, fontSize: 18, fontWeight: 700, margin: 0 }}>Mathieu</p></div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28, paddingLeft: 48 }}>
          <div style={{ opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? "none" : "translateY(20px)", transition: "opacity 0.9s ease,transform 0.9s ease" }}>
            <p style={{ color: T.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 600, margin: "0 0 14px" }}>GMO Business Unit · OCP Nutricrops</p>
            <h1 style={{ color: T.text, fontSize: "clamp(28px,3.5vw,44px)", fontWeight: 300, letterSpacing: "-0.03em", lineHeight: 1.15, margin: 0 }}>This is <span style={{ fontWeight: 800 }}>Mathieu.</span></h1>
          </div>
          {phase >= 2 && (<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>{[{ text: "He farms soft wheat in northern France, on land he partly owns and partly rents.", delay: "0s" }, { text: "Every autumn, he commits capital to a fertilizer program before he knows what the season will bring. Every spring, he watches those costs compound while revenue stays months away.", delay: "0.3s" }, { text: "The question is whether a different phosphorus strategy would put more money in his pocket at harvest.", delay: "0.6s", accent: true }].map((line, i) => (<p key={i} style={{ color: line.accent ? T.textMid : T.textMuted, fontSize: line.accent ? 16 : 14, fontWeight: line.accent ? 600 : 400, lineHeight: 1.75, margin: 0, animation: `lineReveal 0.6s ${line.delay} ease both`, opacity: 0, fontStyle: line.accent ? "italic" : "normal" }}>{line.text}</p>))}</div>)}
          {phase >= 2 && (<p style={{ color: T.textFaint, fontSize: 12, lineHeight: 1.7, margin: 0, animation: "lineReveal 0.6s 1s ease both", opacity: 0 }}>Built on data from nearly a thousand real French farms, this simulator estimates what each input decision does to Mathieu's output and income in real numbers.</p>)}
          {phase >= 3 && (<div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "riseUp 0.7s ease both" }}>
            <button className="cta-btn" onClick={onEnterFarm} style={{ alignSelf: "flex-start", background: T.text, border: "none", color: T.bg, padding: "15px 40px", borderRadius: 4, fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 0 40px rgba(15,36,21,0.1)" }}>Enter Mathieu's Farm →</button>
            <p style={{ color: T.textFaint, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}>FADN France · 909 farms · Log-log production model</p>
          </div>)}
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// MATHIEU FARM PAGE (core France P-separation simulator — verbatim)
// ═══════════════════════════════════════════════════════════════════════════
function MathieuFarmPage() {
  const [phase, setPhase] = useState("configure");
  const [farmSize, setFarmSize] = useState(120);
  const [simRegion, setSimRegion] = useState("(131) Champagne-Ardenne");
  const [crop, setCrop] = useState("wheat");
  const [farmerAge, setFarmerAge] = useState(42);
  const [ownedPct, setOwnedPct] = useState(65);
  const [currentFerts, setCurrentFerts] = useState([]);
  const [tspNRate, setTspNRate] = useState(null);
  const [showBS, setShowBS] = useState(false);
  const [showPL, setShowPL] = useState(false);
  const [marginZoom, setMarginZoom] = useState(null);
  const [outputZoom, setOutputZoom] = useState(null);
  const [cashZoom, setCashZoom] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [activeChart, setActiveChart] = useState(null);

  const CROPS = [
    { id: "wheat",     label: "Soft wheat",  pDemand: "high",   nDemand: "high",      icon: "🌾", revenuePerHa: 1850, cropNReq: 180, note: "DAP and MAP benefit from N+P co-location at tillering. TSP competitive but not dominant.", yieldModByFert: { TSP: 0.97, MAP: 1.00, NPS: 0.91, DAP: 0.99, NPK1: 0.89, NPK2: 0.84, NPK3: 0.93 }, decayModByFert: { TSP: 0.010, MAP: 0.021, NPS: 0.028, DAP: 0.023, NPK1: 0.030, NPK2: 0.036, NPK3: 0.018 } },
    { id: "barley",    label: "Barley",       pDemand: "medium", nDemand: "medium",    icon: "🌾", revenuePerHa: 1520, cropNReq: 140, note: "Cost sensitive crop. MAP edges TSP because modest N aligns with moderate demand.", yieldModByFert: { TSP: 0.96, MAP: 1.00, NPS: 0.94, DAP: 0.97, NPK1: 0.93, NPK2: 0.87, NPK3: 0.95 }, decayModByFert: { TSP: 0.012, MAP: 0.019, NPS: 0.025, DAP: 0.020, NPK1: 0.028, NPK2: 0.034, NPK3: 0.016 } },
    { id: "maize",     label: "Maize / Corn", pDemand: "high",   nDemand: "very high", icon: "🌽", revenuePerHa: 1680, cropNReq: 220, note: "Very high N demand during V6 to V12. MAP and DAP decisively outperform TSP.", yieldModByFert: { TSP: 0.89, MAP: 1.00, NPS: 0.90, DAP: 0.98, NPK1: 0.88, NPK2: 0.82, NPK3: 0.93 }, decayModByFert: { TSP: 0.008, MAP: 0.020, NPS: 0.026, DAP: 0.018, NPK1: 0.030, NPK2: 0.036, NPK3: 0.019 } },
    { id: "potato",    label: "Potato",       pDemand: "high",   nDemand: "moderate",  icon: "🥔", revenuePerHa: 3200, cropNReq: 120, note: "Best case for separation. Excess N damages tuber quality and reduces price per tonne.", yieldModByFert: { TSP: 1.00, MAP: 0.92, NPS: 0.86, DAP: 0.89, NPK1: 0.84, NPK2: 0.78, NPK3: 0.88 }, decayModByFert: { TSP: 0.007, MAP: 0.024, NPS: 0.031, DAP: 0.027, NPK1: 0.033, NPK2: 0.042, NPK3: 0.022 } },
    { id: "sugarbeet", label: "Sugar beet",   pDemand: "medium", nDemand: "moderate",  icon: "🌱", revenuePerHa: 2400, cropNReq: 130, note: "Excess N reduces sugar content. Separation protects extraction rate and quality premium.", yieldModByFert: { TSP: 1.00, MAP: 0.93, NPS: 0.88, DAP: 0.91, NPK1: 0.89, NPK2: 0.83, NPK3: 0.91 }, decayModByFert: { TSP: 0.008, MAP: 0.020, NPS: 0.028, DAP: 0.024, NPK1: 0.030, NPK2: 0.036, NPK3: 0.018 } },
    { id: "tomato",    label: "Tomato",       pDemand: "high",   nDemand: "high",      icon: "🍅", revenuePerHa: 8500, cropNReq: 200, note: "High value crop. MAP wins on yield because N during fruit set is critical.", yieldModByFert: { TSP: 0.94, MAP: 1.00, NPS: 0.88, DAP: 0.98, NPK1: 0.86, NPK2: 0.80, NPK3: 0.94 }, decayModByFert: { TSP: 0.009, MAP: 0.017, NPS: 0.028, DAP: 0.019, NPK1: 0.032, NPK2: 0.039, NPK3: 0.018 } },
  ];
  const REGIONS = [
    { display: "Champagne-Ardenne", value: "(131) Champagne-Ardenne" }, { display: "Picardie", value: "(132) Picardie" }, { display: "Haute-Normandie", value: "(133) Haute-Normandie" }, { display: "Centre", value: "(134) Centre" }, { display: "Basse-Normandie", value: "(135) Basse-Normandie" }, { display: "Bourgogne", value: "(136) Bourgogne" }, { display: "Nord-Pas-de-Calais", value: "(141) Nord-Pas-de-Calais" }, { display: "Lorraine", value: "(142) Lorraine" }, { display: "Alsace", value: "(143) Alsace" }, { display: "Franche-Comté", value: "(144) Franche-Comté" }, { display: "Pays de la Loire", value: "(151) Pays de la Loire" }, { display: "Bretagne", value: "(152) Bretagne" }, { display: "Poitou-Charentes", value: "(153) Poitou-Charentes" }, { display: "Aquitaine", value: "(162) Aquitaine" }, { display: "Midi-Pyrénées", value: "(163) Midi-Pyrénées" }, { display: "Limousin", value: "(164) Limousin" }, { display: "Rhône-Alpes", value: "(171) Rhône-Alpes" }, { display: "Auvergne", value: "(172) Auvergne" }, { display: "Languedoc-Roussillon", value: "(181) Languedoc-Roussillon" }, { display: "PACA", value: "(182) PACA" }, { display: "Corse", value: "(183) Corse" }, { display: "Île-de-France", value: "(121) Île-de-France" },
  ];

  const selectedCrop = CROPS.find(c => c.id === crop) || CROPS[0];
  const regionDisplay = simRegion.replace(/^\(\d+\)\s*/, "");
  const sizeScale = farmSize / 120;
  const isHighValue = selectedCrop.revenuePerHa > 2500;
  const baseRentPerHa = isHighValue ? 260 : 180;
  const rentCostPerHa = ((100 - ownedPct) / 100) * baseRentPerHa;

  const UREA_COST_PER_KG_N = 0.65 / 0.46;
  const AN_COST_PER_KG_N = 0.85 / 0.335;
  const extraPassCost = farmSize > 200 ? 15 : farmSize > 100 ? 18 : 22;
  const effectiveTspNRate = tspNRate !== null ? tspNRate : selectedCrop.cropNReq;
  const cropNReq = selectedCrop.cropNReq;
  const nDelivered = { TSP: 0, MAP: 30, NPS: 55, DAP: 50, NPK1: 42, NPK2: 35, NPK3: 22 };
  const tspPCost = 135;
  const tspNCost = Math.round(effectiveTspNRate * UREA_COST_PER_KG_N);
  const tspProgramCost = tspPCost + tspNCost + extraPassCost;
  const calcProgramCost = (baseProductCost, productId) => {
    const nFromProduct = nDelivered[productId] || 0;
    const suppNNeeded = Math.max(0, cropNReq - nFromProduct);
    return baseProductCost + Math.round(suppNNeeded * AN_COST_PER_KG_N);
  };

  const FERTILIZERS = [
    { id: "TSP",  label: "TSP + N",     full: "TSP + " + Math.round(effectiveTspNRate) + " kg N/ha (urea)", p2o5: 46, n: effectiveTspNRate, color: T.green,  badge: "P Separation", costPerKg: 0.78, baseCostPerHa: tspProgramCost },
    { id: "MAP",  label: "MAP",         full: "MAP + supp. N (AN)", p2o5: 48, n: 11, color: T.green,  badge: "High P",     costPerKg: 0.90, baseCostPerHa: calcProgramCost(205, "MAP") },
    { id: "NPS",  label: "NPS",         full: "NPS + supp. N (AN)", p2o5: 20, n: 24, color: T.violet, badge: "With Sulphur", costPerKg: 0.72, baseCostPerHa: calcProgramCost(192, "NPS") },
    { id: "DAP",  label: "DAP",         full: "DAP + supp. N (AN)", p2o5: 46, n: 18, color: T.amber,  badge: "High N+P",   costPerKg: 0.95, baseCostPerHa: calcProgramCost(218, "DAP") },
    { id: "NPK1", label: "NPK 15-15-15",full: "NPK 15-15-15 + supp. N", p2o5: 15, n: 15, color: T.rose,   badge: "Blended",    costPerKg: 0.62, baseCostPerHa: calcProgramCost(230, "NPK1") },
    { id: "NPK2", label: "NPK 10-10-10",full: "NPK 10-10-10 + supp. N", p2o5: 10, n: 10, color: T.slate,  badge: "Economy",    costPerKg: 0.48, baseCostPerHa: calcProgramCost(195, "NPK2") },
    { id: "NPK3", label: "NPK 10-52-10",full: "High P Low N + supp. N", p2o5: 52, n: 10, color: T.indigo, badge: "High P Low N", costPerKg: 1.02, baseCostPerHa: calcProgramCost(245, "NPK3") },
  ];

  const TSP = FERTILIZERS[0];
  const NON_TSP = FERTILIZERS.filter(f => f.id !== "TSP");

  const REGION_YIELD_MOD = { "(131) Champagne-Ardenne": 1.029, "(132) Picardie": 1.002, "(133) Haute-Normandie": 0.972, "(134) Centre": 0.917, "(135) Basse-Normandie": 0.983, "(136) Bourgogne": 1.004, "(141) Nord-Pas-de-Calais": 0.967, "(142) Lorraine": 0.972, "(143) Alsace": 0.966, "(144) Franche-Comté": 1.011, "(151) Pays de la Loire": 0.946, "(152) Bretagne": 1.002, "(153) Poitou-Charentes": 0.940, "(162) Aquitaine": 0.842, "(163) Midi-Pyrénées": 0.906, "(164) Limousin": 0.962, "(171) Rhône-Alpes": 0.941, "(172) Auvergne": 0.975, "(181) Languedoc-Roussillon": 0.879, "(182) PACA": 0.922, "(183) Corse": 0.903, "(121) Île-de-France": 1.000 };
  const regionYieldMod = REGION_YIELD_MOD[simRegion] || 1.0;
  const sizeEfficiency = farmSize <= 50 ? 1.12 : farmSize <= 100 ? 1.04 : farmSize <= 200 ? 1.00 : farmSize <= 350 ? 0.96 : 0.93;
  const inputPriceDiscount = farmSize > 200 ? 0.96 : farmSize > 100 ? 0.98 : 1.00;
  const ageMod = farmerAge < 35 ? 1.04 : farmerAge < 45 ? 1.02 : farmerAge < 55 ? 1.00 : farmerAge < 65 ? 0.97 : 0.94;

  const computeFinancials = (fert, yearOffset = 0) => {
    const cropYieldMult = selectedCrop.yieldModByFert[fert.id] || 0.90;
    const cropDecay = selectedCrop.decayModByFert[fert.id] || 0.025;
    const yieldAdj = cropYieldMult * Math.pow(1 - cropDecay, yearOffset);
    const revenuePerHa = selectedCrop.revenuePerHa * yieldAdj * regionYieldMod * ageMod;
    const seedCost = Math.round((isHighValue ? 180 : 85) * inputPriceDiscount);
    const baseLabour = isHighValue ? 240 : 130;
    const labourCost = Math.round(baseLabour * sizeEfficiency * (farmerAge > 60 ? 1.08 : 1.0));
    const baseMachinery = isHighValue ? 120 : 95;
    const machineryCost = Math.round(baseMachinery * (farmSize < 50 ? 1.25 : farmSize < 100 ? 1.08 : farmSize < 200 ? 1.00 : 0.92));
    const insuranceCost = Math.round((isHighValue ? 85 : 52) * regionYieldMod);
    const miscCost = Math.round((isHighValue ? 45 : 28) * (farmSize < 80 ? 1.10 : 1.00));
    const fertCostPerHa = Math.round(fert.baseCostPerHa * inputPriceDiscount);
    const totalCostPerHa = fertCostPerHa + seedCost + labourCost + machineryCost + insuranceCost + miscCost + rentCostPerHa;
    return { output: revenuePerHa, inputCost: totalCostPerHa, fertCost: fertCostPerHa, seedCost, labourCost, machineryCost, insuranceCost, miscCost, grossMargin: revenuePerHa - totalCostPerHa, rofi: revenuePerHa / totalCostPerHa, totalFarmRevenue: revenuePerHa * farmSize, totalFarmCost: totalCostPerHa * farmSize, totalFarmMargin: (revenuePerHa - totalCostPerHa) * farmSize };
  };

  const YEARS_AHEAD = [0, 1, 2, 3, 4];
  const buildMultiYear = fert => YEARS_AHEAD.map(y => { const fin = computeFinancials(fert, y); return { year: "Season " + (y + 1), output: Math.round(fin.output), cost: Math.round(fin.inputCost), margin: Math.round(fin.grossMargin) }; });
  const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const buildTimeline = fert => MONTHS.map((m, i) => { const fin = computeFinancials(fert, 0); const costPct = Math.min(1, (1 / (1 + Math.exp(-0.8 * (i - 4))))); const revPct = Math.min(1, Math.pow(i / 9, 2.2)); return { month: m, cost: Math.round(fin.inputCost * costPct), revenue: Math.round(fin.output * revPct), cumCash: Math.round(fin.output * revPct - fin.inputCost * costPct) }; });
  const buildBalanceSheet = fert => {
    const fin = computeFinancials(fert);
    const baseLandVal = isHighValue ? 12000 : 8500; const landValue = Math.round(baseLandVal * regionYieldMod * (ownedPct / 100) * farmSize / 120);
    const machineryValue = Math.round((isHighValue ? 3200 : 2400) * Math.pow(sizeScale, 0.85));
    const inventoryValue = Math.round(fin.inputCost * sizeScale * 0.35);
    const cashMod = farmerAge < 40 ? 0.30 : farmerAge < 55 ? 0.45 : 0.55;
    const cashPosition = Math.round(Math.max(0, fin.grossMargin * sizeScale * cashMod));
    const receivables = Math.round(fin.output * sizeScale * 0.18);
    const totalAssets = landValue + machineryValue + inventoryValue + cashPosition + receivables;
    const ageLeverage = farmerAge < 40 ? 1.25 : farmerAge < 55 ? 1.0 : 0.75;
    const longTermDebt = Math.round((isHighValue ? 4200 : 3200) * sizeScale * ageLeverage);
    const rentObl = Math.round(rentCostPerHa * farmSize); const inputPayables = Math.round(fin.inputCost * sizeScale * 0.55); const operatingLoan = Math.round(fin.inputCost * sizeScale * (farmSize > 200 ? 0.22 : 0.30));
    const totalLiab = longTermDebt + rentObl + inputPayables + operatingLoan;
    return { assets: [{ label: "Owned land value", value: landValue }, { label: "Machinery and equipment", value: machineryValue }, { label: "Crop inventory (in ground)", value: inventoryValue }, { label: "Cash and equivalents", value: cashPosition }, { label: "Trade receivables", value: receivables }], totalAssets, liabilities: [{ label: "Long term debt", value: longTermDebt }, { label: "Annual rent obligations", value: rentObl }, { label: "Input supplier payables", value: inputPayables }, { label: "Operating line of credit", value: operatingLoan }], totalLiab, equity: totalAssets - totalLiab };
  };
  const buildPL = fert => {
    const fin = computeFinancials(fert);
    const subsidyPerHa = isHighValue ? fin.output * 0.04 : Math.min(270, fin.output * 0.08);
    const totalRevenue = Math.round(fin.output) + Math.round(subsidyPerHa);
    const expenses = [{ label: "Primary fertilizer program", value: fin.fertCost }, { label: "Seed and planting material", value: fin.seedCost }, { label: "Labour and field operations", value: fin.labourCost }, { label: "Machinery depreciation", value: fin.machineryCost }, { label: "Land rent", value: Math.round(rentCostPerHa) }, { label: "Crop insurance", value: fin.insuranceCost }, { label: "Administrative and miscellaneous", value: fin.miscCost }];
    const totalExpense = expenses.reduce((s, e) => s + e.value, 0);
    return { revenue: [{ label: "Crop sales (" + selectedCrop.label + ")", value: Math.round(fin.output) }, { label: "Direct payments and subsidies", value: Math.round(subsidyPerHa) }], totalRevenue, expenses, totalExpense, netIncome: totalRevenue - totalExpense };
  };

  const EUR = "€"; const MINUS = "−"; const MDASH = "—"; const LARR = "←"; const MIDDOT = "·";
  const fmtE = n => n < 0 ? (MINUS + EUR + Math.round(Math.abs(n)).toLocaleString()) : (EUR + Math.round(n).toLocaleString());
  const fmtK = n => n >= 0 ? ("+" + EUR + Math.round(n).toLocaleString()) : (MINUS + EUR + Math.round(Math.abs(n)).toLocaleString());
  const CHART_COLORS = { TSP: T.green, MAP: T.green, NPS: T.violet, DAP: T.amber, NPK1: T.rose, NPK2: T.slate, NPK3: T.indigo };

  const allTreatments = [TSP, ...FERTILIZERS.filter(f => currentFerts.includes(f.id) && f.id !== "TSP")];
  const tspFin = computeFinancials(TSP);
  const allRanked = FERTILIZERS.map(f => ({ ...f, margin: computeFinancials(f).grossMargin })).sort((a, b) => b.margin - a.margin);
  const bestTreatment = allRanked[0];
  const tspRank = allRanked.findIndex(f => f.id === "TSP") + 1;
  const tspIsBest = bestTreatment.id === "TSP";

  const handleDragStart = (chartId, e) => { if (e?.activeLabel) { setDragStart(e.activeLabel); setDragEnd(null); setActiveChart(chartId); } };
  const handleDragMove = (chartId, e) => { if (dragStart && activeChart === chartId && e?.activeLabel) setDragEnd(e.activeLabel); };
  const handleDragEnd = (chartId, rawLabels, setZoom) => { if (dragStart && dragEnd && activeChart === chartId && dragStart !== dragEnd) { const i1 = rawLabels.indexOf(dragStart), i2 = rawLabels.indexOf(dragEnd); if (i1 >= 0 && i2 >= 0) setZoom([Math.min(i1, i2), Math.max(i1, i2)]); } setDragStart(null); setDragEnd(null); setActiveChart(null); };
  const ResetZoomBtn = ({ zoom, setZoom }) => zoom ? (<button onClick={() => setZoom(null)} style={{ background: T.card, border: `1px solid ${T.green}40`, color: T.green, borderRadius: 6, padding: "4px 12px", fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>Reset zoom</button>) : null;
  const S = { card: { background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "18px 20px" } };

  // ─── CONFIGURE ─────────────────────────────────────────────────────────────
  if (phase === "configure") return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", gap: 0 }}>
      <style>{`.crop-btn:hover{border-color:${T.green}!important;background:${T.green}08!important;} .enter-farm-btn:hover{background:${T.text}!important;color:${T.bg}!important;transform:translateY(-2px);}`}</style>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <p style={{ color: T.green, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 700, margin: "0 0 8px" }}>PhosStratOS · Farm Financial Simulator</p>
        <h1 style={{ color: T.text, fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 8px" }}>Configure Mathieu's Farm</h1>
        <p style={{ color: T.textMid, fontSize: 13, margin: "0 auto", maxWidth: 580, lineHeight: 1.7 }}>Set the structural parameters. These determine baseline costs, revenue composition, and how input decisions translate into financial outcomes.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card"><p style={{ color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, margin: "0 0 12px" }}>Farm size (hectares)</p><input type="range" min={10} max={500} step={5} value={farmSize} onChange={e => setFarmSize(Number(e.target.value))} style={{ width: "100%", accentColor: T.green }} /><div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}><span style={{ color: T.textFaint, fontSize: 10 }}>10 ha</span><span style={{ color: T.green, fontSize: 18, fontWeight: 800, fontFamily: "'DM Mono',monospace" }}>{farmSize} ha</span><span style={{ color: T.textFaint, fontSize: 10 }}>500 ha</span></div></div>
          <div className="card"><p style={{ color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, margin: "0 0 12px" }}>Region</p><select value={simRegion} onChange={e => setSimRegion(e.target.value)} style={{ width: "100%", maxWidth: "100%", background: T.card, border: `1.5px solid ${T.border}`, color: T.text, borderRadius: 8, padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>{REGIONS.map(r => <option key={r.value} value={r.value}>{r.display}</option>)}</select></div>
          <div className="card"><p style={{ color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, margin: "0 0 12px" }}>Farmer age</p><input type="range" min={18} max={90} step={1} value={farmerAge} onChange={e => setFarmerAge(Number(e.target.value))} style={{ width: "100%", accentColor: T.green }} /><div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}><span style={{ color: T.textFaint, fontSize: 10 }}>18</span><span style={{ color: T.green, fontSize: 18, fontWeight: 800, fontFamily: "'DM Mono',monospace" }}>{farmerAge} years</span><span style={{ color: T.textFaint, fontSize: 10 }}>90</span></div></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card"><p style={{ color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, margin: "0 0 12px" }}>Crop</p><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>{CROPS.map(c => (<button key={c.id} className="crop-btn" onClick={() => setCrop(c.id)} style={{ background: crop === c.id ? T.green + "12" : T.card, border: `1.5px solid ${crop === c.id ? T.green : T.border}`, borderRadius: 10, padding: "12px 10px", cursor: "pointer", textAlign: "center" }}><span style={{ fontSize: 20, display: "block" }}>{c.icon}</span><span style={{ color: crop === c.id ? T.green : T.textMuted, fontSize: 11, fontWeight: crop === c.id ? 700 : 500, display: "block", marginTop: 4 }}>{c.label}</span><span style={{ color: T.textFaint, fontSize: 9, display: "block", marginTop: 2 }}>P:{c.pDemand} {MIDDOT} N:{c.nDemand}</span></button>))}</div>{selectedCrop && <p style={{ color: T.textDim, fontSize: 11, lineHeight: 1.6, margin: "10px 0 0" }}>{selectedCrop.note}</p>}</div>
          <div className="card"><p style={{ color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, margin: "0 0 12px" }}>Ownership structure</p><input type="range" min={0} max={100} step={5} value={ownedPct} onChange={e => setOwnedPct(Number(e.target.value))} style={{ width: "100%", accentColor: T.amber }} /><div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, alignItems: "center" }}><span style={{ color: T.amber, fontSize: 11, fontWeight: 600 }}>Owned: {ownedPct}%</span><span style={{ color: T.textMuted, fontSize: 11 }}>Rented: {100 - ownedPct}%</span></div><p style={{ color: T.textFaint, fontSize: 10, margin: "8px 0 0" }}>Rent cost: {EUR}{Math.round(rentCostPerHa)}/ha/year</p></div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 28 }}><button className="enter-farm-btn" style={{ background: "transparent", border: `2px solid ${T.text}`, color: T.text, padding: "16px 48px", borderRadius: 4, fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s" }} onClick={() => setPhase("narrative")}>Continue — Choose Treatments →</button></div>
    </div>
  );

  // ─── NARRATIVE ─────────────────────────────────────────────────────────────
  if (phase === "narrative") {
    const selectedFerts = currentFerts.map(id => FERTILIZERS.find(f => f.id === id)).filter(Boolean);
    return (
      <div style={{ fontFamily: "'DM Sans',sans-serif", maxWidth: 680, margin: "0 auto", padding: "20px 0" }}>
        <style>{`.fert-option{transition:all 0.15s;cursor:pointer;} .fert-option:hover{border-color:${T.green}!important;background:${T.green}08!important;} .run-btn:hover{background:${T.text}!important;color:${T.bg}!important;transform:translateY(-2px);}`}</style>
        <button onClick={() => setPhase("configure")} style={{ background: "none", border: "none", color: T.textDim, fontSize: 11, cursor: "pointer", padding: 0, marginBottom: 24 }}>{LARR} Back to farm configuration</button>
        <div>
          <p style={{ color: T.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 600, margin: "0 0 14px" }}>{selectedCrop.icon} {selectedCrop.label} {MIDDOT} {regionDisplay} {MIDDOT} {farmSize} ha</p>
          <h2 style={{ color: T.text, fontSize: 26, fontWeight: 300, letterSpacing: "-0.02em", lineHeight: 1.3, margin: "0 0 10px" }}>Today, Mathieu uses <span style={{ fontWeight: 800, color: selectedFerts.length > 0 ? T.green : T.textDim }}>{selectedFerts.length > 0 ? selectedFerts.map(f => f.label).join(" and ") : "..."}</span></h2>
          <p style={{ color: T.textMid, fontSize: 14, lineHeight: 1.7, margin: "0 0 24px" }}>Select one or more products that represent his current fertilizer program. TSP will always be included as the separation reference.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
          {NON_TSP.map(f => { const sel = currentFerts.includes(f.id); return (<div key={f.id} className="fert-option" onClick={() => setCurrentFerts(prev => sel ? prev.filter(x => x !== f.id) : [...prev, f.id])} style={{ background: sel ? f.color + "10" : T.card, border: `1.5px solid ${sel ? f.color : T.border}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: sel ? f.color : T.border, flexShrink: 0, transition: "all 0.15s" }} /><div><p style={{ color: sel ? T.text : T.textMuted, fontSize: 13, fontWeight: sel ? 700 : 500, margin: 0 }}>{f.label}</p><p style={{ color: T.textDim, fontSize: 10, margin: 0 }}>P₂O₅: {f.p2o5}% · N: {f.n}% · {EUR}{f.baseCostPerHa}/ha</p></div><span style={{ marginLeft: "auto", fontSize: 10, color: f.color, background: f.color + "18", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>{f.badge}</span></div>); })}
        </div>
        {currentFerts.length > 0 && (<div>
          <p style={{ color: T.textMid, fontSize: 18, fontWeight: 300, lineHeight: 1.5, margin: "0 0 24px" }}>But today, Mathieu wants to check if <span style={{ fontWeight: 700, color: T.green }}>switching to TSP</span> will benefit him {MDASH} or whether his current program is already the better choice.</p>
          <div style={{ display: "flex", justifyContent: "center" }}><button className="run-btn" onClick={() => setPhase("results")} style={{ background: "transparent", border: `2px solid ${T.green}`, color: T.green, padding: "16px 44px", borderRadius: 4, fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.25s" }}>Run the comparison →</button></div>
        </div>)}
      </div>
    );
  }

  // ─── RESULTS ───────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`.dropdown-toggle{cursor:pointer;transition:background 0.15s;} .dropdown-toggle:hover{background:${T.panel}!important;} .restart-btn:hover{background:${T.text}!important;color:${T.bg}!important;transform:translateY(-2px);}`}</style>

      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => setPhase("narrative")} style={{ background: "none", border: "none", color: T.textDim, fontSize: 11, cursor: "pointer", padding: 0 }}>{LARR} Change treatment</button>
        <button onClick={() => setPhase("configure")} style={{ background: "none", border: "none", color: T.textFaint, fontSize: 11, cursor: "pointer", padding: 0 }}>{LARR} Reconfigure farm</button>
      </div>

      {/* LIVE CONTROLS */}
      <div style={{ background: `linear-gradient(135deg,${T.card},${T.bg})`, border: `1.5px solid ${T.green}30`, borderRadius: 14, padding: "14px 18px", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}>
        <p style={{ color: T.green, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 700, margin: "0 0 10px" }}>Live parameters {MDASH} all results update instantly</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr", gap: 12 }}>
          {[["Farm size", farmSize, v => setFarmSize(v), 10, 500, 5, farmSize + " ha", T.green], ["Farmer age", farmerAge, v => setFarmerAge(v), 18, 90, 1, farmerAge + " yrs", T.green], ["Owned / Rented", ownedPct, v => setOwnedPct(v), 0, 100, 5, ownedPct + "% / " + (100 - ownedPct) + "%", T.amber]].map(([lbl, val, setter, mn, mx, step, disp, col]) => (
            <div key={lbl}><p style={{ color: T.textMuted, fontSize: 10, fontWeight: 600, margin: "0 0 5px" }}>{lbl}</p><input type="range" min={mn} max={mx} step={step} value={val} onChange={e => setter(Number(e.target.value))} style={{ width: "100%", accentColor: col }} /><p style={{ color: col, fontSize: 12, fontWeight: 800, fontFamily: "'DM Mono',monospace", margin: "3px 0 0", textAlign: "center" }}>{disp}</p></div>
          ))}
          <div><p style={{ color: T.textMuted, fontSize: 10, fontWeight: 600, margin: "0 0 5px" }}>Crop</p><select value={crop} onChange={e => { setCrop(e.target.value); setTspNRate(null); }} style={{ width: "100%", maxWidth: "100%", background: T.card, border: `1.5px solid ${T.border}`, color: T.text, borderRadius: 8, padding: "5px 8px", fontSize: 11, fontWeight: 600 }}>{CROPS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select></div>
          <div><p style={{ color: T.textMuted, fontSize: 10, fontWeight: 600, margin: "0 0 5px" }}>Region</p><select value={simRegion} onChange={e => setSimRegion(e.target.value)} style={{ width: "100%", maxWidth: "100%", background: T.card, border: `1.5px solid ${T.border}`, color: T.text, borderRadius: 8, padding: "5px 8px", fontSize: 11, fontWeight: 600 }}>{REGIONS.map(r => <option key={r.value} value={r.value}>{r.display}</option>)}</select></div>
          <div><p style={{ color: T.green, fontSize: 10, fontWeight: 600, margin: "0 0 5px" }}>TSP + N rate</p><input type="range" min={0} max={300} step={10} value={effectiveTspNRate} onChange={e => setTspNRate(Number(e.target.value))} style={{ width: "100%", accentColor: T.green }} /><p style={{ color: T.green, fontSize: 11, fontWeight: 800, fontFamily: "'DM Mono',monospace", margin: "3px 0 0", textAlign: "center" }}>{Math.round(effectiveTspNRate)} kg N/ha</p></div>
        </div>
      </div>

      {/* CONTEXT STRIP */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", background: T.card, border: `1.5px solid ${T.border}`, borderRadius: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.green + "15", border: `2px solid ${T.green}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" /></svg>
        </div>
        <div>
          <p style={{ color: T.textMid, fontSize: 13, fontWeight: 700, margin: 0 }}>{selectedCrop.label} {MIDDOT} {regionDisplay} {MDASH} {allTreatments.length} treatments compared</p>
          <p style={{ color: T.textMuted, fontSize: 11, margin: 0 }}>{farmSize} ha {MIDDOT} {farmerAge} y/o {MIDDOT} {ownedPct}% owned {MIDDOT} TSP program: {EUR}{Math.round(tspProgramCost)}/ha</p>
        </div>
      </div>

      {/* RANKING */}
      <div style={{ ...S.card, padding: 0, overflow: "hidden", border: `1.5px solid ${bestTreatment.color}30` }}>
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${T.border}`, background: `linear-gradient(135deg,${bestTreatment.color}08,${T.card})` }}>
          <p style={{ color: T.text, fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>Treatment ranking {MDASH} {selectedCrop.label} {MIDDOT} {regionDisplay}</p>
          <p style={{ color: T.textDim, fontSize: 10, margin: 0 }}>Ranked by gross margin ({EUR}/ha). TSP + N includes {Math.round(effectiveTspNRate)} kg N/ha via urea + extra pass cost.</p>
        </div>
        {allRanked.map((f, i) => { const isTSP = f.id === "TSP"; const isC = currentFerts.includes(f.id); const mD = f.margin - tspFin.grossMargin; return (<div key={f.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: i === 0 ? "14px 20px" : "11px 20px", background: i === 0 ? bestTreatment.color + "08" : isTSP ? T.green + "06" : isC ? f.color + "06" : "transparent", borderLeft: `3px solid ${i === 0 ? bestTreatment.color : isTSP ? T.green : isC ? f.color : "transparent"}`, borderBottom: i < allRanked.length - 1 ? `1px solid ${T.borderSubtle}` : "none" }}>
          <span style={{ color: i === 0 ? T.amber : i < 3 ? T.textMuted : T.textFaint, fontSize: i === 0 ? 14 : 11, width: 22, fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>#{i + 1}</span>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: f.color, flexShrink: 0 }} />
          <span style={{ color: isTSP ? T.green : i === 0 ? T.text : isC ? T.textMid : T.textMuted, fontSize: i === 0 ? 14 : 12, fontWeight: isTSP || isC || i === 0 ? 700 : 400, flex: 1 }}>{f.label}{i === 0 && <span style={{ marginLeft: 8, fontSize: 9, color: T.amber, background: T.amber + "18", padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>BEST</span>}{isTSP && i !== 0 && <span style={{ marginLeft: 8, fontSize: 9, color: T.green, background: T.green + "18", padding: "2px 8px", borderRadius: 4 }}>P SEPARATION</span>}{isC && !isTSP && <span style={{ marginLeft: 8, fontSize: 9, color: f.color, background: f.color + "18", padding: "2px 8px", borderRadius: 4 }}>COMPARED</span>}</span>
          <span style={{ color: i === 0 ? T.text : T.textMid, fontSize: i === 0 ? 15 : 12, fontFamily: "'DM Mono',monospace", fontWeight: i === 0 ? 800 : 600, width: 80, textAlign: "right" }}>{fmtE(f.margin)}</span>
          <span style={{ color: mD >= 0 ? T.green : T.rose, fontSize: 11, fontWeight: 700, fontFamily: "'DM Mono',monospace", width: 80, textAlign: "right" }}>{isTSP ? MDASH : fmtK(mD)}</span>
        </div>); })}
      </div>

      {/* KPI TABLE */}
      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}` }}><p style={{ color: T.textMid, fontSize: 13, fontWeight: 700, margin: 0 }}>Treatment comparison {MDASH} {EUR} per hectare</p></div>
        <div style={{ display: "grid", gridTemplateColumns: "180px repeat(" + allTreatments.length + ",1fr)", gap: 0 }}>
          {["Metric", ...allTreatments.map(t => t.id === "TSP" ? "TSP + N" : t.label)].map((h, j) => (<div key={j} style={{ padding: "10px 14px", background: T.card, borderBottom: `1px solid ${T.borderSubtle}`, fontSize: 10, fontWeight: 700, color: j === 1 ? T.green : j > 1 ? CHART_COLORS[allTreatments[j - 1]?.id] || T.textMuted : T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: j > 0 ? "right" : "left" }}>{h}</div>))}
          {[{ label: "Gross output", key: "output" }, { label: "Total input cost", key: "inputCost" }, { label: "Gross margin", key: "grossMargin" }].map((row, i) => (<div key={i} style={{ display: "contents" }}><div style={{ padding: "12px 14px", borderBottom: `1px solid ${T.borderSubtle}`, color: T.textMuted, fontSize: 12 }}>{row.label}</div>{allTreatments.map((t, j) => { const fin = computeFinancials(t); const val = fin[row.key]; const diff = val - tspFin[row.key]; const diffColor = row.key === "inputCost" ? (diff <= 0 ? T.green : T.rose) : (diff >= 0 ? T.green : T.rose); return (<div key={t.id} style={{ padding: "12px 14px", borderBottom: `1px solid ${T.borderSubtle}`, textAlign: "right" }}><span style={{ color: j === 0 ? T.green : T.textMid, fontSize: 13, fontWeight: j === 0 ? 700 : 600, fontFamily: "'DM Mono',monospace" }}>{fmtE(val)}</span>{j > 0 && <span style={{ color: diffColor, fontSize: 10, fontFamily: "'DM Mono',monospace", marginLeft: 8 }}>({fmtK(diff)})</span>}</div>); })}</div>))}
          <div style={{ display: "contents" }}><div style={{ padding: "12px 14px", background: T.panel, color: T.text, fontSize: 12, fontWeight: 700 }}>ROFI</div>{allTreatments.map((t, j) => { const fin = computeFinancials(t); return (<div key={t.id} style={{ padding: "12px 14px", background: T.panel, textAlign: "right" }}><span style={{ color: j === 0 ? T.green : T.textMid, fontSize: 14, fontWeight: j === 0 ? 800 : 700, fontFamily: "'DM Mono',monospace" }}>{fin.rofi.toFixed(2)}x</span>{j > 0 && <span style={{ color: fin.rofi >= tspFin.rofi ? T.green : T.rose, fontSize: 10, fontFamily: "'DM Mono',monospace", marginLeft: 8 }}>({fin.rofi >= tspFin.rofi ? "+" : MINUS}{Math.abs(fin.rofi - tspFin.rofi).toFixed(2)})</span>}</div>); })}</div>
          <div style={{ display: "contents" }}><div style={{ padding: "12px 14px", borderTop: `2px solid ${T.border}`, color: T.text, fontSize: 12, fontWeight: 700 }}>Total farm margin ({farmSize} ha)</div>{allTreatments.map((t, j) => { const fin = computeFinancials(t); const tfm = fin.totalFarmMargin; return (<div key={t.id} style={{ padding: "12px 14px", borderTop: `2px solid ${T.border}`, textAlign: "right" }}><span style={{ color: j === 0 ? T.green : T.textMid, fontSize: 14, fontWeight: 800, fontFamily: "'DM Mono',monospace" }}>{fmtE(tfm)}</span>{j > 0 && <span style={{ color: tfm >= tspFin.totalFarmMargin ? T.green : T.rose, fontSize: 10, fontFamily: "'DM Mono',monospace", marginLeft: 8 }}>({fmtK(tfm - tspFin.totalFarmMargin)})</span>}</div>); })}</div>
        </div>
      </div>

      {/* MARGIN TRAJECTORY */}
      {(() => {
        const rawData = buildMultiYear(TSP).map((r, i) => { const row = { year: r.year, TSP: r.margin }; currentFerts.forEach(id => { const f = FERTILIZERS.find(x => x.id === id); if (f) row[f.label] = buildMultiYear(f)[i].margin; }); return row; });
        const chartData = marginZoom ? rawData.slice(marginZoom[0], marginZoom[1] + 1) : rawData;
        return (
          <div style={{ ...S.card }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
              <div><p style={{ color: T.textMid, fontSize: 13, fontWeight: 700, margin: 0 }}>Gross margin trajectory — five seasons ({EUR}/ha)</p><p style={{ color: T.textDim, fontSize: 10, margin: "4px 0 0" }}>Click and drag to zoom</p></div>
              <ResetZoomBtn zoom={marginZoom} setZoom={setMarginZoom} />
            </div>
            <ResponsiveContainer width="100%" height={300}><LineChart data={chartData} onMouseDown={e => handleDragStart("margin", e)} onMouseMove={e => handleDragMove("margin", e)} onMouseUp={() => handleDragEnd("margin", rawData.map(d => d.year), setMarginZoom)}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} /><XAxis dataKey="year" tick={{ fill: T.textMuted, fontSize: 11 }} /><YAxis tick={{ fill: T.textMuted, fontSize: 10 }} tickFormatter={v => EUR + v} domain={["dataMin - 20", "dataMax + 20"]} allowDataOverflow /><Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 11 }} formatter={(v, name) => [EUR + Math.round(v).toLocaleString() + "/ha", name]} /><Legend wrapperStyle={{ fontSize: 11 }} />
              {(dragStart && dragEnd && activeChart === "margin") && <ReferenceArea x1={dragStart} x2={dragEnd} strokeOpacity={0.3} fill={T.green} fillOpacity={0.15} />}
              <Line type="monotone" dataKey="TSP" stroke={T.green} strokeWidth={3} dot={{ r: 5, fill: T.green, strokeWidth: 2, stroke: T.card }} activeDot={{ r: 7 }} />
              {currentFerts.map(id => { const f = FERTILIZERS.find(x => x.id === id); return f ? <Line key={id} type="monotone" dataKey={f.label} stroke={CHART_COLORS[id] || T.textMuted} strokeWidth={2} dot={{ r: 4, fill: CHART_COLORS[id] || T.textMuted, strokeWidth: 2, stroke: T.card }} activeDot={{ r: 6 }} strokeDasharray="6 3" /> : null; })}
            </LineChart></ResponsiveContainer>
          </div>
        );
      })()}

      {/* P&L */}
      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        <div className="dropdown-toggle" onClick={() => setShowPL(!showPL)} style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: T.card }}>
          <p style={{ color: T.text, fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>Profit & Loss Statement <span style={{ color: T.textDim, fontSize: 12, fontWeight: 400 }}>({EUR}/ha · {farmSize} ha · {regionDisplay})</span></p>
          <span style={{ color: T.textMuted, fontSize: 20, fontWeight: 300, transform: showPL ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
        </div>
        {showPL && (
          <div style={{ padding: "0 18px 18px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "200px repeat(" + allTreatments.length + ",1fr)", gap: 0 }}>
              {["", ...allTreatments.map(t => t.id === "TSP" ? "TSP" : t.label)].map((h, j) => (<div key={j} style={{ padding: "8px 12px", background: T.card, borderBottom: `2px solid ${T.border}`, fontSize: 10, fontWeight: 700, color: j === 1 ? T.green : j > 1 ? CHART_COLORS[allTreatments[j - 1]?.id] : T.textMuted, textTransform: "uppercase", textAlign: j > 0 ? "right" : "left" }}>{h}</div>))}
              <div style={{ display: "contents" }}><div style={{ padding: "8px 12px", background: T.panel, gridColumn: "1 / -1", color: T.green, fontSize: 10, fontWeight: 700, textTransform: "uppercase", borderBottom: `1px solid ${T.borderSubtle}` }}>Revenue</div></div>
              {buildPL(TSP).revenue.map((r, i) => (<div key={"r" + i} style={{ display: "contents" }}><div style={{ padding: "8px 12px", borderBottom: `1px solid ${T.borderSubtle}`, color: T.textMuted, fontSize: 11 }}>{r.label}</div>{allTreatments.map(t => <div key={t.id} style={{ padding: "8px 12px", borderBottom: `1px solid ${T.borderSubtle}`, color: T.textMid, fontSize: 12, fontFamily: "'DM Mono',monospace", textAlign: "right" }}>{fmtE(buildPL(t).revenue[i].value)}</div>)}</div>))}
              <div style={{ display: "contents" }}><div style={{ padding: "10px 12px", background: T.panel, borderBottom: `2px solid ${T.border}`, color: T.text, fontSize: 12, fontWeight: 700 }}>Total revenue</div>{allTreatments.map(t => <div key={t.id} style={{ padding: "10px 12px", background: T.panel, borderBottom: `2px solid ${T.border}`, color: t.id === "TSP" ? T.green : T.textMid, fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono',monospace", textAlign: "right" }}>{fmtE(buildPL(t).totalRevenue)}</div>)}</div>
              <div style={{ display: "contents" }}><div style={{ padding: "8px 12px", background: T.panel, gridColumn: "1 / -1", color: T.rose, fontSize: 10, fontWeight: 700, textTransform: "uppercase", borderBottom: `1px solid ${T.borderSubtle}` }}>Operating expenses</div></div>
              {buildPL(TSP).expenses.map((e, i) => (<div key={"e" + i} style={{ display: "contents" }}><div style={{ padding: "8px 12px", borderBottom: `1px solid ${T.borderSubtle}`, color: T.textMuted, fontSize: 11 }}>{e.label}</div>{allTreatments.map(t => <div key={t.id} style={{ padding: "8px 12px", borderBottom: `1px solid ${T.borderSubtle}`, color: T.textMid, fontSize: 12, fontFamily: "'DM Mono',monospace", textAlign: "right" }}>{fmtE(buildPL(t).expenses[i].value)}</div>)}</div>))}
              <div style={{ display: "contents" }}><div style={{ padding: "14px 12px", background: T.card, borderTop: `2px solid ${T.border}`, color: T.text, fontSize: 14, fontWeight: 800 }}>Net income</div>{allTreatments.map(t => { const ni = buildPL(t).netIncome; const tNI = buildPL(TSP).netIncome; return (<div key={t.id} style={{ padding: "14px 12px", background: T.card, borderTop: `2px solid ${T.border}`, textAlign: "right" }}><span style={{ color: t.id === "TSP" ? T.green : T.textMid, fontSize: 16, fontWeight: 800, fontFamily: "'DM Mono',monospace" }}>{fmtE(ni)}</span>{t.id !== "TSP" && <span style={{ color: ni >= tNI ? T.green : T.rose, fontSize: 11, fontFamily: "'DM Mono',monospace", marginLeft: 8 }}>({fmtK(ni - tNI)})</span>}</div>); })}</div>
            </div>
          </div>
        )}
      </div>

      {/* BALANCE SHEET */}
      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        <div className="dropdown-toggle" onClick={() => setShowBS(!showBS)} style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: T.card }}>
          <p style={{ color: T.text, fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>Balance Sheet <span style={{ color: T.textDim, fontSize: 12, fontWeight: 400 }}>({farmSize} ha · {ownedPct}% owned · {regionDisplay})</span></p>
          <span style={{ color: T.textMuted, fontSize: 20, fontWeight: 300, transform: showBS ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▾</span>
        </div>
        {showBS && (
          <div style={{ padding: "0 18px 18px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "180px repeat(" + allTreatments.length + ",1fr)", gap: 0 }}>
              {["", ...allTreatments.map(t => t.id === "TSP" ? "TSP" : t.label)].map((h, j) => (<div key={j} style={{ padding: "8px 12px", background: T.card, borderBottom: `2px solid ${T.border}`, fontSize: 10, fontWeight: 700, color: j === 1 ? T.green : j > 1 ? CHART_COLORS[allTreatments[j - 1]?.id] : T.textMuted, textTransform: "uppercase", textAlign: j > 0 ? "right" : "left" }}>{h}</div>))}
              <div style={{ display: "contents" }}><div style={{ padding: "8px 12px", background: T.panel, gridColumn: "1 / -1", color: T.green, fontSize: 10, fontWeight: 700, textTransform: "uppercase", borderBottom: `1px solid ${T.borderSubtle}` }}>Assets</div></div>
              {buildBalanceSheet(TSP).assets.map((a, i) => (<div key={"a" + i} style={{ display: "contents" }}><div style={{ padding: "8px 12px", borderBottom: `1px solid ${T.borderSubtle}`, color: T.textMuted, fontSize: 11 }}>{a.label}</div>{allTreatments.map(t => <div key={t.id} style={{ padding: "8px 12px", borderBottom: `1px solid ${T.borderSubtle}`, color: T.textMid, fontSize: 12, fontFamily: "'DM Mono',monospace", textAlign: "right" }}>{fmtE(buildBalanceSheet(t).assets[i].value)}</div>)}</div>))}
              <div style={{ display: "contents" }}><div style={{ padding: "10px 12px", background: T.panel, borderBottom: `2px solid ${T.border}`, color: T.text, fontSize: 12, fontWeight: 700 }}>Total assets</div>{allTreatments.map(t => <div key={t.id} style={{ padding: "10px 12px", background: T.panel, borderBottom: `2px solid ${T.border}`, color: T.green, fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono',monospace", textAlign: "right" }}>{fmtE(buildBalanceSheet(t).totalAssets)}</div>)}</div>
              <div style={{ display: "contents" }}><div style={{ padding: "8px 12px", background: T.panel, gridColumn: "1 / -1", color: T.rose, fontSize: 10, fontWeight: 700, textTransform: "uppercase", borderBottom: `1px solid ${T.borderSubtle}` }}>Liabilities</div></div>
              {buildBalanceSheet(TSP).liabilities.map((l, i) => (<div key={"l" + i} style={{ display: "contents" }}><div style={{ padding: "8px 12px", borderBottom: `1px solid ${T.borderSubtle}`, color: T.textMuted, fontSize: 11 }}>{l.label}</div>{allTreatments.map(t => <div key={t.id} style={{ padding: "8px 12px", borderBottom: `1px solid ${T.borderSubtle}`, color: T.textMid, fontSize: 12, fontFamily: "'DM Mono',monospace", textAlign: "right" }}>{fmtE(buildBalanceSheet(t).liabilities[i].value)}</div>)}</div>))}
              <div style={{ display: "contents" }}><div style={{ padding: "12px 12px", background: T.card, color: T.text, fontSize: 13, fontWeight: 800 }}>Owner's equity</div>{allTreatments.map(t => { const eq = buildBalanceSheet(t).equity; const tEq = buildBalanceSheet(TSP).equity; return (<div key={t.id} style={{ padding: "12px 12px", background: T.card, textAlign: "right" }}><span style={{ color: t.id === "TSP" ? T.green : T.textMid, fontSize: 14, fontWeight: 700, fontFamily: "'DM Mono',monospace" }}>{fmtE(eq)}</span>{t.id !== "TSP" && <span style={{ color: eq >= tEq ? T.green : T.rose, fontSize: 10, fontFamily: "'DM Mono',monospace", marginLeft: 8 }}>({fmtK(eq - tEq)})</span>}</div>); })}</div>
            </div>
          </div>
        )}
      </div>

      {/* OUTPUT + COST charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {(() => {
          const rawOut = buildMultiYear(TSP).map((r, i) => { const row = { year: r.year, TSP: r.output }; currentFerts.forEach(id => { const f = FERTILIZERS.find(x => x.id === id); if (f) row[f.label] = buildMultiYear(f)[i].output; }); return row; });
          const data = outputZoom ? rawOut.slice(outputZoom[0], outputZoom[1] + 1) : rawOut;
          return (
            <div style={{ ...S.card }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}><p style={{ color: T.green, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Gross output — five seasons</p><ResetZoomBtn zoom={outputZoom} setZoom={setOutputZoom} /></div>
              <ResponsiveContainer width="100%" height={240}><BarChart data={data} onMouseDown={e => handleDragStart("output", e)} onMouseMove={e => handleDragMove("output", e)} onMouseUp={() => handleDragEnd("output", rawOut.map(d => d.year), setOutputZoom)}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} /><XAxis dataKey="year" tick={{ fill: T.textMuted, fontSize: 9 }} /><YAxis tick={{ fill: T.textMuted, fontSize: 9 }} tickFormatter={v => EUR + v} domain={["dataMin - 40", "dataMax + 40"]} />
                <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 10 }} formatter={(v, name) => [EUR + Math.round(v).toLocaleString() + "/ha", name]} />{(dragStart && dragEnd && activeChart === "output") && <ReferenceArea x1={dragStart} x2={dragEnd} fill={T.green} fillOpacity={0.15} />}<Bar dataKey="TSP" fill={T.green} radius={[3, 3, 0, 0]} />{currentFerts.map(id => { const f = FERTILIZERS.find(x => x.id === id); return f ? <Bar key={id} dataKey={f.label} fill={CHART_COLORS[id] || T.textMuted} radius={[3, 3, 0, 0]} opacity={0.75} /> : null; })}
              </BarChart></ResponsiveContainer>
            </div>
          );
        })()}
        {(() => {
          const seasons = [1, 2, 3, 4, 5];
          const avgCompCost = allTreatments.filter(t => t.id !== "TSP" && currentFerts.includes(t.id)).reduce((s, t) => s + t.baseCostPerHa * inputPriceDiscount, 0) / Math.max(1, currentFerts.length) || FERTILIZERS[1].baseCostPerHa * inputPriceDiscount;
          const tspStartPremium = selectedCrop.nDemand === "moderate" ? 0.12 : selectedCrop.nDemand === "medium" ? 0.15 : 0.18;
          const tspStart = Math.round(avgCompCost * (1 + tspStartPremium));
          const tspDropRate = selectedCrop.nDemand === "moderate" ? 0.08 : selectedCrop.nDemand === "medium" ? 0.07 : 0.06;
          const regionWasteMod = regionYieldMod < 0.95 ? 1.2 : regionYieldMod > 1.01 ? 0.85 : 1.0;
          const costTrajectory = seasons.map(s => { const row = { season: "Season " + s }; row["TSP + N"] = Math.round(tspStart * Math.pow(1 - tspDropRate, s - 1)); allTreatments.filter(t => t.id !== "TSP").forEach(t => { const decay = selectedCrop.decayModByFert[t.id] || 0.025; const riseRate = (decay * 1.8 + 0.012) * regionWasteMod; row[t.label] = Math.round(t.baseCostPerHa * inputPriceDiscount * (1 + riseRate * (s - 1))); }); return row; });
          const tspS1 = costTrajectory[0]["TSP + N"]; const tspS5 = costTrajectory[4]["TSP + N"]; const tspDrop = Math.round((1 - tspS5 / tspS1) * 100);
          const compLabels = currentFerts.map(id => { const f = FERTILIZERS.find(x => x.id === id); return f ? f.label : null; }).filter(Boolean);
          let crossSeason = null; for (let s = 1; s < 5; s++) { const tspCost = costTrajectory[s]["TSP + N"]; if (compLabels.length > 0 && compLabels.every(l => costTrajectory[s][l] >= tspCost) && !crossSeason) crossSeason = s + 1; }
          return (
            <div style={{ ...S.card }}>
              <p style={{ color: T.rose, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>Fertiliser program cost trajectory ({EUR}/ha)</p>
              <p style={{ color: T.textDim, fontSize: 9, margin: "0 0 8px" }}>TSP + N starts higher (extra pass) but drops as the farmer optimises. Compounds start lower but rise as N waste accumulates.</p>
              <ResponsiveContainer width="100%" height={240}><LineChart data={costTrajectory} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} /><XAxis dataKey="season" tick={{ fill: T.textMuted, fontSize: 10 }} /><YAxis tick={{ fill: T.textMuted, fontSize: 9 }} tickFormatter={v => EUR + v} />
                <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 10 }} formatter={(v, name) => [EUR + v + "/ha", name]} /><Legend wrapperStyle={{ fontSize: 10 }} />
                {crossSeason && <ReferenceLine x={"Season " + crossSeason} stroke={T.green + "60"} strokeDasharray="4 4" label={{ value: "Crossover", fill: T.green, fontSize: 9, position: "top" }} />}
                <Line type="monotone" dataKey="TSP + N" stroke={T.green} strokeWidth={3} dot={{ r: 5, fill: T.green, strokeWidth: 2, stroke: T.card }} />
                {currentFerts.map(id => { const f = FERTILIZERS.find(x => x.id === id); return f ? <Line key={id} type="monotone" dataKey={f.label} stroke={CHART_COLORS[id] || T.textMuted} strokeWidth={2} dot={{ r: 4, fill: CHART_COLORS[id] || T.textMuted, strokeWidth: 2, stroke: T.card }} strokeDasharray="6 3" /> : null; })}
              </LineChart></ResponsiveContainer>
              <div style={{ marginTop: 8, padding: "10px 14px", background: T.panel, border: `1px solid ${T.green}30`, borderRadius: 8 }}>
                <p style={{ color: T.textMid, fontSize: 11, lineHeight: 1.75, margin: 0 }}>
                  <span style={{ color: T.green, fontWeight: 700 }}>TSP + N</span> drops {tspDrop}% over 5 seasons as the farmer optimises N rate and TSP efficiency compounds.{crossSeason && <> Lines cross at <span style={{ color: T.green, fontWeight: 700 }}>season {crossSeason}</span> — from that point TSP + N is the cheaper program.</>}
                </p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* CASH FLOW */}
      <div style={{ ...S.card }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div><p style={{ color: T.textMid, fontSize: 13, fontWeight: 700, margin: 0 }}>Growing season cumulative cash position ({EUR}/ha)</p><div style={{ margin: "8px 0", padding: "8px 14px", background: T.amber + "10", border: `1px solid ${T.amber}30`, borderRadius: 8, display: "inline-block" }}><p style={{ color: T.amber, fontSize: 11, fontWeight: 700, margin: 0 }}>This is NOT the final margin — it is the running cash position during the season.</p><p style={{ color: T.textMuted, fontSize: 10, margin: "4px 0 0" }}>Costs accumulate from sowing (October) while revenue arrives in summer. Every treatment ends positive.</p></div></div>
          <ResetZoomBtn zoom={cashZoom} setZoom={setCashZoom} />
        </div>
        {(() => {
          const rawCash = buildTimeline(TSP).map((d, i) => { const row = { month: d.month, TSP: d.cumCash }; currentFerts.forEach(id => { const f = FERTILIZERS.find(x => x.id === id); if (f) row[f.label] = buildTimeline(f)[i].cumCash; }); return row; });
          const data = cashZoom ? rawCash.slice(cashZoom[0], cashZoom[1] + 1) : rawCash;
          return (
            <ResponsiveContainer width="100%" height={280}><AreaChart data={data} onMouseDown={e => handleDragStart("cash", e)} onMouseMove={e => handleDragMove("cash", e)} onMouseUp={() => handleDragEnd("cash", rawCash.map(d => d.month), setCashZoom)}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} /><XAxis dataKey="month" tick={{ fill: T.textMuted, fontSize: 10 }} /><YAxis tick={{ fill: T.textMuted, fontSize: 10 }} tickFormatter={v => EUR + v} />
              <Tooltip contentStyle={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 10 }} formatter={(v, name) => [EUR + Math.round(v).toLocaleString() + "/ha (cumulative)", name]} /><Legend wrapperStyle={{ fontSize: 10 }} />
              <ReferenceLine y={0} stroke={T.rose + "50"} strokeDasharray="4 4" label={{ value: "breakeven", fill: T.rose + "80", fontSize: 9 }} />
              {(dragStart && dragEnd && activeChart === "cash") && <ReferenceArea x1={dragStart} x2={dragEnd} fill={T.green} fillOpacity={0.15} />}
              <Area type="monotone" dataKey="TSP" stroke={T.green} fill={T.green + "20"} strokeWidth={2} />
              {currentFerts.map(id => { const f = FERTILIZERS.find(x => x.id === id); return f ? <Area key={id} type="monotone" dataKey={f.label} stroke={CHART_COLORS[id] || T.textMuted} fill={(CHART_COLORS[id] || T.textMuted) + "15"} strokeWidth={1.5} strokeDasharray="4 3" /> : null; })}
            </AreaChart></ResponsiveContainer>
          );
        })()}
      </div>

      {/* ANALYSIS */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "18px 22px" }}>
        <p style={{ color: T.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, marginBottom: 10 }}>Financial analysis</p>
        <p style={{ color: T.textMid, fontSize: 13, lineHeight: 1.9, margin: 0 }}>
          Under current parameters ({regionDisplay}, {selectedCrop.label}, {farmSize} ha, {ownedPct}% owned), TSP achieves a gross margin of {fmtE(tspFin.grossMargin)}/ha with a ROFI of {tspFin.rofi.toFixed(2)}x. TSP ranks #{tspRank} out of {FERTILIZERS.length} treatments.{" "}
          {!tspIsBest ? `For ${selectedCrop.label.toLowerCase()}, ${bestTreatment.label} produces the highest gross margin at ${fmtE(bestTreatment.margin)}/ha — ${fmtE(bestTreatment.margin - tspFin.grossMargin)} more than TSP. This reflects the crop's ${selectedCrop.nDemand} nitrogen demand: the bundled N in ${bestTreatment.label} provides a yield contribution that offsets its higher cost. The P Doctrine does not claim universal superiority — it claims that separation is optimal when the crop's N demand does not justify paying for bundled N.` : `TSP produces the highest gross margin of all treatments. ${selectedCrop.label}'s ${selectedCrop.nDemand} nitrogen demand means bundled N in compound products does not provide proportional yield value.`}
          {ownedPct < 50 && ` With ${100 - ownedPct}% rented land adding ${EUR}${Math.round(rentCostPerHa)}/ha in fixed costs, every euro of margin difference is consequential to farm solvency.`}
        </p>
      </div>

      {/* CTA */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, paddingTop: 4 }}>
        <button className="restart-btn" onClick={() => setPhase("narrative")} style={{ background: "transparent", border: `1.5px solid ${T.green}`, color: T.green, padding: "14px 36px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>{LARR} Change treatment</button>
        <button className="restart-btn" onClick={() => { setPhase("configure"); setCurrentFerts([]); }} style={{ background: "transparent", border: `1.5px solid ${T.textMid}`, color: T.textMid, padding: "14px 36px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>{LARR} New farm configuration</button>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// BRAZIL DECK — McKinsey-style strategic phosphate research tool
// ═══════════════════════════════════════════════════════════════════════════

const DECK_CROPS = [
  { id: 'soybean', label: 'Soybeans', img: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Glycine_max_003.JPG' },
  { id: 'corn',    label: 'Corn',     img: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80&fit=crop' },
  { id: 'cotton',  label: 'Cotton',   img: 'https://images.unsplash.com/photo-N_Cg-5EsXog?w=1200&q=80&fit=crop' },
  { id: 'coffee',  label: 'Coffee',   img: 'https://images.unsplash.com/photo-F9Cb_QIe9GA?w=1200&q=80&fit=crop' },
];

const DECK_SLIDE_LABELS = ['Brazil Context', 'Snapshot', 'Cost Breakdown', 'Fert. Shock', 'So What'];

// Deck visual constants — OCP brand palette, flat grid, no shadows
const MCK = {
  bg:    '#FFFFFF',
  bgOff: T.bg,
  line:  T.border,
  text:  T.text,
  mid:   T.textMid,
  dim:   T.textMuted,
  blue:  T.green,
  teal:  T.greenDk,
  red:   '#C0392B',
  amber: '#C97A00',
  green: T.greenDk,
  // cost category palette (Tableau-inspired, distinct)
  seeds: '#4E79A7',
  fert:  '#F28E2B',
  agro:  '#E15759',
  labor: '#76B7B2',
  land:  '#59A14F',
};

// ─── Crop Landing Page ─────────────────────────────────────────────────────
function BrazilCropLanding({ onSelect }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 50px)', background: T.bg }}>
      {/* Header */}
      <div style={{ textAlign: 'center', padding: '52px 0 36px' }}>
        <p style={{ color: T.textMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 14 }}>Brazil · Farmer Economics</p>
        <h2 style={{ color: T.text, fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>Choose your crop</h2>
      </div>
      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gridTemplateRows: 'repeat(2,260px)', maxWidth: 960, width: '100%', margin: '0 auto', flex: 1 }}>
        {DECK_CROPS.map(c => (
          <div
            key={c.id}
            onClick={() => onSelect(c.id)}
            onMouseEnter={() => setHovered(c.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              position: 'relative',
              backgroundImage: `url(${c.img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              cursor: 'pointer',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              background: hovered === c.id ? 'rgba(0,0,0,0.52)' : 'rgba(0,0,0,0.3)',
              transition: 'background 0.25s',
            }} />
            <div style={{ position: 'absolute', bottom: 28, left: 32 }}>
              <p style={{
                color: '#FFFFFF', fontSize: 26, fontWeight: 700,
                letterSpacing: '-0.02em', margin: 0, lineHeight: 1,
              }}>{c.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Control Bar ───────────────────────────────────────────────────────────
function BrazilControlBar({ crop, setCrop, region, setRegion, currency, setCurrency }) {
  const bar = { display: 'flex', alignItems: 'center', gap: 0, background: T.text, color: '#FFF', height: 48, padding: '0 32px', fontSize: 12 };
  const lbl = { color: T.textMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', marginRight: 8 };
  const sel = { background: 'transparent', color: '#FFF', border: `1px solid ${T.textMid}`, borderRadius: 2, padding: '4px 8px', fontSize: 11, cursor: 'pointer', outline: 'none' };
  const div = <div style={{ width: 1, height: 24, background: T.textMid, margin: '0 24px' }} />;
  return (
    <div style={bar}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={lbl}>Crop</span>
        <select style={sel} value={crop} onChange={e => setCrop(e.target.value)}>
          {DECK_CROPS.map(c => <option key={c.id} value={c.id} style={{ background: '#1A1A1A' }}>{c.label}</option>)}
        </select>
      </div>
      {div}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={lbl}>Region</span>
        <select style={sel} value={region} onChange={e => setRegion(e.target.value)}>
          {BRAZIL_PROF_REGIONS.map(r => <option key={r.id} value={r.id} style={{ background: '#1A1A1A' }}>{r.label}</option>)}
        </select>
      </div>
      {div}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={lbl}>Currency</span>
        {['USD', 'BRL'].map((c, i) => (
          <button key={c} onClick={() => setCurrency(c)} style={{
            background: currency === c ? T.green : 'transparent',
            color: currency === c ? '#FFF' : T.textMuted,
            border: `1px solid ${T.textMid}`,
            borderRadius: 0,
            marginLeft: i === 0 ? 0 : -1,
            padding: '3px 11px', fontSize: 11, cursor: 'pointer',
            fontWeight: currency === c ? 700 : 400,
          }}>{c}</button>
        ))}
      </div>
      {div}
      <span style={{ color: '#777', fontSize: 11 }}>Season 2025/26</span>
    </div>
  );
}

// ─── Slide 1 — Brazil Market Context ──────────────────────────────────────
function Slide1() {
  const facts = [
    { stat: '#1', desc: 'Brazil is the world\'s largest soybean exporter, accounting for 53% of global trade — a position built on Cerrado expansion and aggressive input adoption since 2000.' },
    { stat: '9.2%', desc: 'Phosphate fertilizer consumption CAGR 2015–2024 in Brazil, outpacing all major agricultural economies — driven by soybean area expansion into MATOPIBA frontier zones.' },
    { stat: '84%', desc: 'Share of Brazil\'s phosphate requirements met by imports, with Morocco (OCP) as the dominant supplier — creating structural price transmission from CFR Brazil to farm gate.' },
    { stat: '39M ha', desc: 'Soybean planted area in the 2024/25 season — the world\'s largest single-crop footprint, intensifying demand for high-P starter programs across all major regions.' },
  ];
  const implications = [
    'Any CFR Brazil price spike transmits directly into farm-gate DAP/MAP costs within 2–3 weeks. Brazilian farmers have no buffer from domestic phosphate production — import dependency is structural, not cyclical.',
    'Mato Grosso and MATOPIBA account for 68% of new soybean area expansion. These frontier soils require heavier P loading than consolidated Cerrado farms, sustaining volume growth for OCP through the decade.',
    'With net margins compressed below $80/ha in 4 of the last 9 seasons, price-sensitive procurement windows are narrowing. OCP\'s value messaging must shift from cost to agronomic ROI to sustain premium positioning.',
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, height: '100%' }}>
      <div style={{ paddingRight: 48, borderRight: `1px solid ${MCK.line}` }}>
        <p style={{ color: MCK.dim, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 32 }}>BRAZIL — MARKET CONTEXT</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          {facts.map((f, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '72px 1fr', gap: 20, alignItems: 'start' }}>
              <p style={{ color: MCK.blue, fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, lineHeight: 1 }}>{f.stat}</p>
              <p style={{ color: MCK.mid, fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ paddingLeft: 48, display: 'flex', flexDirection: 'column' }}>
        <p style={{ color: MCK.dim, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 32 }}>STRATEGIC IMPLICATIONS</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26, flex: 1 }}>
          {implications.map((text, i) => (
            <div key={i} style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 3, minHeight: 20, flexShrink: 0, background: MCK.blue, marginTop: 3 }} />
              <p style={{ color: MCK.text, fontSize: 13.5, lineHeight: 1.65, margin: 0 }}>{text}</p>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${MCK.line}`, paddingTop: 16, marginTop: 24 }}>
          <p style={{ color: MCK.dim, fontSize: 11, lineHeight: 1.6, margin: 0 }}>
            Brazil's phosphate situation is structurally different from any other major agricultural market: no domestic reserves of consequence, one dominant import corridor, and a crop mix that is almost entirely P-hungry. That makes demand inelastic to moderate price moves — and OCP's positioning anchored in supply reliability matters more than many realise.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 2 — Snapshot ───────────────────────────────────────────────────
function Slide2({ region, currency }) {
  const b   = BRAZIL_PROF_BASELINE[region] || BRAZIL_PROF_BASELINE.National;
  const hist = BRAZIL_PROF_HISTORICAL[region] || BRAZIL_PROF_HISTORICAL.National;
  const fx  = currency === 'BRL' ? FX_BRL_USD : 1;
  const sym = currency === 'BRL' ? 'R$' : '$';
  const fixed = b.seeds + b.fertilizers + b.agrochemicals + b.labor + b.operations +
    b.maintenance + b.depreciation + b.landRental + b.financialExpenses + b.other;
  const netInc   = b.revenue - fixed;
  const refYield = 3.4;
  const breakEven = Math.round(fixed / refYield * fx);
  const fertPctRev = (b.fertilizers / b.revenue * 100).toFixed(1);
  const totalCost  = fixed;
  const prevNetInc = hist[hist.length - 2]?.netInc ?? null;
  const yoy = prevNetInc !== null ? netInc - prevNetInc : null;

  const big = [
    { label: 'Revenue / ha', value: sym + Math.round(b.revenue * fx).toLocaleString(), note: 'Soybean farm gate · 25/26', neg: false },
    { label: 'Net Income / ha', value: netInc < 0 ? '(' + sym + Math.round(Math.abs(netInc) * fx).toLocaleString() + ')' : sym + Math.round(netInc * fx).toLocaleString(), note: netInc >= 0 ? 'Positive — above break-even' : 'Loss-making season', neg: netInc < 0 },
    { label: 'Break-even Soy Price', value: sym + breakEven.toLocaleString() + '/t', note: 'At ' + refYield + ' t/ha yield · total cost basis', neg: false },
  ];
  const small = [
    { label: 'Total Cost / ha', value: sym + Math.round(totalCost * fx).toLocaleString(), note: 'All cost lines incl. land & depreciation' },
    { label: 'Fertilizer Cost / ha', value: sym + Math.round(b.fertilizers * fx).toLocaleString(), note: 'Observed program spend · excl. DAP/MAP shock' },
    { label: 'Fertilizer % of Revenue', value: fertPctRev + '%', note: 'Key leverage ratio — avg 13–22% over 9 seasons' },
    { label: 'Net Income vs Prior Season', value: yoy !== null ? (yoy >= 0 ? '+' : '') + sym + Math.round(Math.abs(yoy) * fx).toLocaleString() : '—', note: yoy !== null ? (yoy >= 0 ? 'Improvement vs 24/25' : 'Decline vs 24/25') : '', yoy },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <p style={{ color: MCK.dim, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 24 }}>FARMER ECONOMICS — SNAPSHOT · {region.toUpperCase()} · SOYBEANS · 25/26</p>

      {/* Big 3 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: `1px solid ${MCK.line}` }}>
        {big.map((k, i) => (
          <div key={i} style={{ padding: '24px 0', paddingRight: i < 2 ? 32 : 0, paddingLeft: i > 0 ? 32 : 0, borderRight: i < 2 ? `1px solid ${MCK.line}` : 'none' }}>
            <p style={{ color: MCK.dim, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>{k.label}</p>
            <p style={{ color: k.neg ? MCK.red : MCK.text, fontSize: 44, fontWeight: 800, letterSpacing: '-0.04em', margin: 0, lineHeight: 1, fontFamily: "'DM Mono',monospace" }}>{k.value}</p>
            <p style={{ color: k.neg ? MCK.red : MCK.dim, fontSize: 11, marginTop: 10 }}>{k.note}</p>
          </div>
        ))}
      </div>

      {/* Supporting metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', borderTop: `1px solid ${MCK.line}`, marginTop: 4 }}>
        {small.map((k, i) => (
          <div key={i} style={{ padding: '16px 0', paddingRight: i < 3 ? 24 : 0, paddingLeft: i > 0 ? 24 : 0, borderRight: i < 3 ? `1px solid ${MCK.line}` : 'none' }}>
            <p style={{ color: MCK.dim, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>{k.label}</p>
            <p style={{ color: k.yoy !== undefined ? (k.yoy >= 0 ? MCK.teal : MCK.red) : MCK.mid, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, fontFamily: "'DM Mono',monospace" }}>{k.value}</p>
            <p style={{ color: MCK.dim, fontSize: 10, marginTop: 6 }}>{k.note}</p>
          </div>
        ))}
      </div>

      {/* Analyst note */}
      <div style={{ borderTop: `2px solid ${MCK.blue}`, paddingTop: 16, marginTop: 'auto' }}>
        <p style={{ color: MCK.dim, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Key takeaway</p>
        <p style={{ color: MCK.mid, fontSize: 12.5, lineHeight: 1.6, margin: 0 }}>
          {netInc >= 0
            ? `${region} farmers are above water in 25/26 — but only just. Revenue covers costs with ${sym}${Math.round(netInc * fx).toLocaleString()}/ha to spare, leaving almost no room for a fertilizer price spike or a weather-driven yield shortfall. Fertilizer at ${fertPctRev}% of revenue is the single line item with the most leverage on the outcome.`
            : `${region} farmers are running at a loss in 25/26 — revenue doesn't cover full costs. Fertilizer at ${fertPctRev}% of revenue compounds the pressure. The path back to viability runs through either yield improvement or input cost management, not price recovery alone.`}
        </p>
      </div>

      <p style={{ color: MCK.dim, fontSize: 10, marginTop: 12, borderTop: `1px solid ${MCK.line}`, paddingTop: 10 }}>
        Source: CVA × OCP Brazil Profitability Model · Soybean · 25/26 baseline
      </p>
    </div>
  );
}

// ─── Slide 3 — Cost Breakdown ─────────────────────────────────────────────
function Slide3({ region, currency }) {
  const hist = BRAZIL_PROF_HISTORICAL[region] || BRAZIL_PROF_HISTORICAL.National;
  const fx   = currency === 'BRL' ? FX_BRL_USD : 1;
  const sym  = currency === 'BRL' ? 'R$' : '$';
  const chartData = hist.map(d => ({
    season: d.s,
    Seeds:           +(d.seeds * fx).toFixed(1),
    Fertilizers:     +(d.fert  * fx).toFixed(1),
    Agrochemicals:   +(d.agro  * fx).toFixed(1),
    Labor:           +(d.labor * fx).toFixed(1),
    'Land & Rental': +(d.land  * fx).toFixed(1),
    _netInc: d.netInc * fx,
  }));
  const COLORS = {
    Seeds:           MCK.seeds,
    Fertilizers:     MCK.fert,
    Agrochemicals:   MCK.agro,
    Labor:           MCK.labor,
    'Land & Rental': MCK.land,
  };
  const S3Tooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const row = chartData.find(d => d.season === label);
    return (
      <div style={{ background: '#fff', border: `1px solid ${MCK.line}`, padding: '12px 16px', fontSize: 12 }}>
        <p style={{ fontWeight: 700, marginBottom: 8, color: MCK.text }}>{label}</p>
        {payload.filter(p => COLORS[p.dataKey]).map((p, i) => (
          <p key={i} style={{ color: p.fill, margin: '2px 0' }}>{p.dataKey}: <strong>{sym}{p.value.toFixed(0)}</strong></p>
        ))}
        {row && <p style={{ color: row._netInc >= 0 ? MCK.green : MCK.red, marginTop: 6, fontWeight: 700, borderTop: `1px solid ${MCK.line}`, paddingTop: 6 }}>Net Income: {sym}{row._netInc.toFixed(0)}</p>}
      </div>
    );
  };
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <p style={{ color: MCK.dim, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>PRODUCTION COST STRUCTURE · {region.toUpperCase()} · {sym}/HA</p>
      <p style={{ color: MCK.mid, fontSize: 13, marginBottom: 8 }}>Stacked cost per hectare by season, 17/18 – 25/26 — five major categories</p>
      <p style={{ color: MCK.dim, fontSize: 11.5, lineHeight: 1.55, marginBottom: 16, borderLeft: `3px solid ${MCK.blue}`, paddingLeft: 12 }}>
        Fertilizer doubled from ~{sym}93 to ~{sym}349/ha between 2017 and 2022/23 — its share of total cost briefly exceeded 20%. The correction since then has been meaningful but fertilizer remains structurally above pre-2021 norms. Land rental has compressed too, but it's still the largest single fixed cost.
      </p>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }} barCategoryGap="38%">
            <CartesianGrid strokeDasharray="2 4" stroke={MCK.line} vertical={false} />
            <XAxis dataKey="season" tick={{ fill: MCK.dim, fontSize: 11 }} axisLine={{ stroke: MCK.line }} tickLine={false} />
            <YAxis tick={{ fill: MCK.dim, fontSize: 11 }} tickFormatter={v => sym + v} axisLine={false} tickLine={false} width={54} />
            <Tooltip content={<S3Tooltip />} />
            <Legend iconType="square" iconSize={10} wrapperStyle={{ fontSize: 11, color: MCK.dim, paddingTop: 8 }} />
            {Object.entries(COLORS).map(([k, c], idx, arr) => (
              <Bar key={k} dataKey={k} stackId="cost" fill={c} radius={idx === arr.length - 1 ? [2, 2, 0, 0] : [0, 0, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Slide 4 — Fertilizer Shock Scenario ─────────────────────────────────
function Slide4({ region, currency }) {
  const [dapCurrent, setDapCurrent] = useState(713);
  const [dapTarget,  setDapTarget]  = useState(1100);
  const [mapCurrent, setMapCurrent] = useState(699);
  const [mapTarget,  setMapTarget]  = useState(1100);

  const regionDef = BRAZIL_PROF_REGIONS.find(r => r.id === region) || BRAZIL_PROF_REGIONS[0];
  const baseline  = BRAZIL_PROF_BASELINE[region] || BRAZIL_PROF_BASELINE.National;
  const fx  = currency === 'BRL' ? FX_BRL_USD : 1;
  const sym = currency === 'BRL' ? 'R$' : '$';

  const shock = useMemo(() => {
    const bDap = regionDef.dapRate * dapCurrent / 1000;
    const aDap = regionDef.dapRate * dapTarget  / 1000;
    const bMap = regionDef.mapRate * mapCurrent / 1000;
    const aMap = regionDef.mapRate * mapTarget  / 1000;
    const fixed = baseline.seeds + baseline.fertilizers + baseline.agrochemicals +
      baseline.labor + baseline.operations + baseline.maintenance +
      baseline.depreciation + baseline.landRental + baseline.financialExpenses + baseline.other;
    const beforeGM = baseline.revenue - fixed - bDap - bMap;
    const afterGM  = baseline.revenue - fixed - aDap - aMap;
    const dapDelta = aDap - bDap;
    const mapDelta = aMap - bMap;
    return { beforeGM, afterGM, delta: afterGM - beforeGM, dapDelta, mapDelta };
  }, [regionDef, baseline, dapCurrent, dapTarget, mapCurrent, mapTarget]);

  const wfData = [
    { name: 'Current GM', val: shock.beforeGM * fx, fill: shock.beforeGM >= 0 ? MCK.green : MCK.red },
    { name: 'DAP Shock',  val: -shock.dapDelta * fx, fill: shock.dapDelta > 0 ? MCK.red : MCK.green },
    { name: 'MAP Shock',  val: -shock.mapDelta * fx, fill: shock.mapDelta > 0 ? '#880000' : MCK.teal },
    { name: 'Scenario GM', val: shock.afterGM * fx,  fill: shock.afterGM >= 0 ? MCK.teal : MCK.red },
  ];

  const inpS = (accent) => ({
    width: 80, background: '#fff', border: `1px solid ${accent}`,
    color: MCK.text, padding: '5px 8px',
    fontFamily: "'DM Mono',monospace", fontSize: 13, outline: 'none',
  });

  const WfTip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#fff', border: `1px solid ${MCK.line}`, padding: '10px 14px', fontSize: 12 }}>
        <p style={{ color: MCK.text, fontWeight: 700, marginBottom: 4 }}>{label}</p>
        <p style={{ color: payload[0].fill }}>{sym}{Math.abs(payload[0].value).toFixed(0)}/ha</p>
      </div>
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <p style={{ color: MCK.dim, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>FERTILIZER PRICE SHOCK · {region.toUpperCase()}</p>
      <p style={{
        color: shock.delta < 0 ? MCK.red : MCK.text,
        fontSize: 18, fontWeight: 700, marginBottom: 10, letterSpacing: '-0.01em', lineHeight: 1.3,
      }}>
        Gross margin moves from {sym}{Math.abs(shock.beforeGM * fx).toFixed(0)}/ha to {sym}{Math.abs(shock.afterGM * fx).toFixed(0)}/ha
        {shock.delta < 0 ? ` — a ${sym}${Math.abs(shock.delta * fx).toFixed(0)} erosion per hectare.` : ` — a ${sym}${Math.abs(shock.delta * fx).toFixed(0)} improvement per hectare.`}
      </p>
      <p style={{ color: MCK.dim, fontSize: 11.5, lineHeight: 1.55, marginBottom: 20, borderLeft: `3px solid ${MCK.blue}`, paddingLeft: 12 }}>
        CFR Brazil prices reach farm level in 3–4 weeks — faster than most farmers can hedge through forward purchases. The combined DAP+MAP exposure shown here is the realistic worst-case: both products move simultaneously when global supply tightens, as they did in 2021 and again in early 2022.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 48, flex: 1, minHeight: 0 }}>
        <div>
          <p style={{ color: MCK.dim, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Price inputs (USD/t)</p>
          {[
            { label: 'DAP', curr: dapCurrent, setCurr: setDapCurrent, target: dapTarget, setTarget: setDapTarget, rate: regionDef.dapRate },
            { label: 'MAP', curr: mapCurrent, setCurr: setMapCurrent, target: mapTarget, setTarget: setMapTarget, rate: regionDef.mapRate },
          ].map(({ label, curr, setCurr, target, setTarget, rate }) => (
            <div key={label} style={{ marginBottom: 24 }}>
              <p style={{ color: MCK.mid, fontSize: 12, fontWeight: 600, marginBottom: 10 }}>{label}</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div>
                  <p style={{ color: MCK.dim, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Current</p>
                  <input type="number" value={curr} min={100} max={3000} step={10} onChange={e => setCurr(+e.target.value)} style={inpS(MCK.line)} />
                </div>
                <span style={{ color: MCK.dim, fontSize: 14, paddingTop: 14 }}>→</span>
                <div>
                  <p style={{ color: MCK.red, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Scenario</p>
                  <input type="number" value={target} min={100} max={3000} step={10} onChange={e => setTarget(+e.target.value)} style={inpS(MCK.red)} />
                </div>
              </div>
              <p style={{ color: MCK.dim, fontSize: 10, marginTop: 5 }}>{rate.toFixed(0)} kg/ha applied</p>
            </div>
          ))}
        </div>
        <div style={{ minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wfData} margin={{ top: 8, right: 16, bottom: 8, left: 8 }} barCategoryGap="40%">
              <CartesianGrid strokeDasharray="2 4" stroke={MCK.line} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: MCK.dim, fontSize: 11 }} axisLine={{ stroke: MCK.line }} tickLine={false} />
              <YAxis tick={{ fill: MCK.dim, fontSize: 11 }} tickFormatter={v => sym + v.toFixed(0)} axisLine={false} tickLine={false} width={60} />
              <Tooltip content={<WfTip />} />
              <ReferenceLine y={0} stroke={MCK.line} strokeWidth={1.5} />
              <Bar dataKey="val" radius={[2, 2, 0, 0]}>
                {wfData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── Slide 5 — So What ────────────────────────────────────────────────────
function Slide5({ region, currency }) {
  const baseline  = BRAZIL_PROF_BASELINE[region] || BRAZIL_PROF_BASELINE.National;
  const hist      = BRAZIL_PROF_HISTORICAL[region] || BRAZIL_PROF_HISTORICAL.National;
  const regionDef = BRAZIL_PROF_REGIONS.find(r => r.id === region) || BRAZIL_PROF_REGIONS[0];
  const sym = currency === 'BRL' ? 'R$' : '$';
  const fx  = currency === 'BRL' ? FX_BRL_USD : 1;

  const fixed = baseline.seeds + baseline.fertilizers + baseline.agrochemicals +
    baseline.labor + baseline.operations + baseline.maintenance +
    baseline.depreciation + baseline.landRental + baseline.financialExpenses + baseline.other;
  const netInc25   = baseline.revenue - fixed;
  const profSeasons = hist.filter(d => d.netInc > 0).length;
  const lossSeasons = hist.filter(d => d.netInc < 0).length;
  const dapSpike300 = regionDef.dapRate * 300 / 1000;
  const gmErosionPct = netInc25 > 0 ? Math.round(dapSpike300 / netInc25 * 100) : '—';
  const worstLoss = Math.min(...hist.map(d => d.netInc));
  const worstSeason = hist.find(d => d.netInc === worstLoss)?.s || '—';

  const insights = [
    {
      label: 'Profitability remains structurally fragile',
      color: MCK.blue,
      text: `${region} soybean farmers posted positive net income in only ${profSeasons} of ${hist.length} seasons since 2017/18 — with ${lossSeasons} loss year${lossSeasons !== 1 ? 's' : ''}. The worst season (${worstSeason}) saw ${sym}${Math.round(Math.abs(worstLoss) * fx).toLocaleString()}/ha in losses. The structural margin is thin even at benchmark yields.`,
    },
    {
      label: 'Fertilizer cost is the swing factor',
      color: MCK.blue,
      text: `A $300/t DAP spike alone erodes ${sym}${Math.round(dapSpike300 * fx).toLocaleString()}/ha of gross margin — equivalent to ${gmErosionPct}% of the 2025/26 net income baseline at current prices. MAP shock compounds the effect proportionally, making combined DAP+MAP scenarios the primary P&L risk.`,
    },
    {
      label: 'Scale determines shock resilience',
      color: MCK.teal,
      text: `Large farms (>1,000 ha) absorb input price spikes through bulk procurement, direct import access, and logistics savings. Small and medium operations pay full CFR Brazil retail — the profitability gap between large and small farms widens sharply during price spikes.`,
    },
    {
      label: 'The value-based selling window is open',
      color: MCK.teal,
      text: `With 2023/24 net margins at ${sym}${Math.round(Math.abs(hist[hist.length - 3]?.netInc || 0) * fx).toLocaleString()}/ha, farmers are acutely cost-focused entering 2025/26. OCP's differentiation must centre on total P efficiency and agronomic ROI — not list price alone — to sustain positioning through the cycle.`,
    },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <p style={{ color: MCK.dim, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 32 }}>SO WHAT · ANALYST CONCLUSIONS · {region.toUpperCase()}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, flex: 1, minHeight: 0 }}>
        {insights.map((ins, i) => (
          <div key={i} style={{ borderTop: `2px solid ${ins.color}`, paddingTop: 20 }}>
            <p style={{ color: MCK.text, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{ins.label}</p>
            <p style={{ color: MCK.mid, fontSize: 13.5, lineHeight: 1.65, margin: 0 }}>{ins.text}</p>
          </div>
        ))}
      </div>
      <p style={{ color: MCK.dim, fontSize: 11, marginTop: 28, borderTop: `1px solid ${MCK.line}`, paddingTop: 14 }}>
        Exhibit source: PhosStratOS · CVA × OCP Brazil Profitability Model · Soybeans · {region} · 2025/26 baseline
      </p>
    </div>
  );
}

// ─── Brazil Deck ──────────────────────────────────────────────────────────
function BrazilDeck({ region, currency }) {
  const [slide, setSlide] = useState(0);
  const TOTAL = 5;
  const slides = [
    <Slide1 />,
    <Slide2 region={region} currency={currency} />,
    <Slide3 region={region} currency={currency} />,
    <Slide4 region={region} currency={currency} />,
    <Slide5 region={region} currency={currency} />,
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 50px - 48px)', background: '#FFFFFF', fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ flex: 1, overflow: 'hidden', padding: '40px 56px 24px' }}>
        {slides[slide]}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 56px', height: 56, borderTop: `1px solid ${MCK.line}`, background: MCK.bgOff, flexShrink: 0 }}>
        <button
          onClick={() => setSlide(s => Math.max(0, s - 1))}
          disabled={slide === 0}
          style={{ background: 'none', border: `1px solid ${slide === 0 ? MCK.line : MCK.text}`, color: slide === 0 ? MCK.dim : MCK.text, padding: '5px 18px', fontSize: 11, cursor: slide === 0 ? 'default' : 'pointer', letterSpacing: '0.1em', borderRadius: 0 }}
        >← PREV</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {DECK_SLIDE_LABELS.map((label, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: slide === i ? MCK.blue : MCK.line, transition: 'background 0.2s' }} />
              <span style={{ color: slide === i ? MCK.blue : MCK.dim, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: slide === i ? 700 : 400 }}>{label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setSlide(s => Math.min(TOTAL - 1, s + 1))}
          disabled={slide === TOTAL - 1}
          style={{ background: slide === TOTAL - 1 ? 'none' : T.green, border: `1px solid ${slide === TOTAL - 1 ? MCK.line : T.green}`, color: slide === TOTAL - 1 ? MCK.dim : '#fff', padding: '5px 18px', fontSize: 11, cursor: slide === TOTAL - 1 ? 'default' : 'pointer', letterSpacing: '0.1em', borderRadius: 0 }}
        >NEXT →</button>
      </div>
    </div>
  );
}

// ─── Brazil Page — top-level orchestrator ─────────────────────────────────
function BrazilPage() {
  const [cropSelected, setCropSelected] = useState(false);
  const [cropId,    setCropId]    = useState('soybean');
  const [regionKey, setRegionKey] = useState('National');
  const [currency,  setCurrency]  = useState('USD');

  if (!cropSelected) {
    return (
      <div style={{ margin: '-20px -28px', background: '#000' }}>
        <BrazilCropLanding onSelect={id => { setCropId(id); setCropSelected(true); }} />
      </div>
    );
  }
  return (
    <div style={{ margin: '-20px -28px', fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <BrazilControlBar
        crop={cropId} setCrop={setCropId}
        region={regionKey} setRegion={setRegionKey}
        currency={currency} setCurrency={setCurrency}
      />
      <BrazilDeck region={regionKey} currency={currency} />
    </div>
  );
}




// ═══════════════════════════════════════════════════════════════════════════
// FRANCE HUB + ROOT APP
// ═══════════════════════════════════════════════════════════════════════════
function FranceHub() {
  const [section, setSection] = useState("engine");
  const [mathieuPhase, setMathieuPhase] = useState("value");

  const tabs = [
    { key: "engine",     label: "Quantitative Engine", short: "Engine" },
    { key: "regions",    label: "Regional Analysis",   short: "Regions" },
    { key: "archetypes", label: "Farmer Archetypes",   short: "Archetypes" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ background: T.bg, borderBottom: `1px solid ${T.border}`, padding: "0 20px", display: "flex", alignItems: "center", gap: 4, overflowX: "auto" }}>
        {tabs.map(t => (<button key={t.key} onClick={() => { setSection(t.key); if (t.key === "engine") setMathieuPhase("value"); }} style={{ padding: "8px 14px", background: "transparent", border: "none", borderBottom: section === t.key ? `2px solid ${T.green}` : "2px solid transparent", color: section === t.key ? T.green : T.textMuted, fontSize: 12, fontWeight: section === t.key ? 600 : 400, cursor: "pointer", whiteSpace: "nowrap" }}>{t.short}</button>))}
      </div>
      <div style={{ padding: "20px 0 0" }}>
        {section === "regions"    && <RegionalPage />}
        {section === "archetypes" && <FarmerArchetypesPage />}
        {section === "engine" && (
          <>
            {mathieuPhase === "value" && (<QuantitativeEngineValuePage onContinue={() => setMathieuPhase("intro")} />)}
            {mathieuPhase === "intro" && (<MathieuIntroPage onEnterFarm={() => { setMathieuPhase("farm"); setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50); }} />)}
            {mathieuPhase === "farm" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <button onClick={() => setMathieuPhase("intro")} style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: "none", color: T.textMuted, fontSize: 12, cursor: "pointer", padding: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>Back to Mathieu
                  </button>
                  <div style={{ width: 1, height: 14, background: T.border }} />
                  <SectionBadge label="Quantitative Engine" color={T.green} />
                  <span style={{ color: T.text, fontSize: 14, fontWeight: 700 }}>Mathieu's Farm Simulation</span>
                </div>
                <MathieuFarmPage />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("landing"); // landing | country | app
  const [country, setCountry] = useState(null);

  if (page === "landing") return <LandingPage onEnter={() => setPage("country")} />;
  if (page === "country") return <CountrySelector onSelect={c => { setCountry(c); setPage("app"); }} />;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.textMid, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;height:4px;} ::-webkit-scrollbar-track{background:${T.bg};} ::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px;}
        input[type=range]{height:4px;}
        select{background:${T.card};color:${T.text};border:1px solid ${T.border};border-radius:6px;padding:6px 10px;font-size:13px;cursor:pointer;outline:none;}
        select:hover{border-color:${T.green};}
        .card{background:${T.card};border:1px solid ${T.border};border-radius:14px;padding:18px;}
        .card-title{color:${T.textMuted};font-size:11px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;}
        .kpi-row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px;}
        @media(max-width:640px){.chart-grid-2{grid-template-columns:1fr!important;}}
      `}</style>

      {/* HEADER */}
      <div style={{ borderBottom: `1px solid ${T.border}`, padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 50, background: T.card, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setPage("landing")}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#2DB84B,#1A8A34)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 11, color: "#FFFFFF", fontFamily: "'DM Mono',monospace", boxShadow: "0 0 10px #2DB84B30", flexShrink: 0 }}>GMO</div>
          <div>
            <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: "-0.03em", color: T.text }}>PhosStratOS</span>
            <span style={{ color: T.textMuted, fontSize: 11, marginLeft: 8 }}>Farmer Economics</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {[["France", "🇫🇷"], ["Brazil", "🇧🇷"]].map(([name, flag]) => (
            <button key={name} onClick={() => setCountry(name)}
              style={{ padding: "5px 12px", borderRadius: 6, background: country === name ? T.green + "20" : "transparent", border: `1px solid ${country === name ? T.green : T.border}`, color: country === name ? T.green : T.textMuted, fontSize: 12, fontWeight: country === name ? 700 : 400, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s" }}>
              <span>{flag}</span>{name}
            </button>
          ))}
          <button onClick={() => setPage("country")} style={{ padding: "5px 10px", background: "transparent", border: `1px solid ${T.border}`, color: T.textDim, borderRadius: 6, fontSize: 10, cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase" }}>Change country</button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ padding: "20px 28px 60px", maxWidth: 1400, margin: "0 auto" }}>
        {country === "France" && <FranceHub />}
        {country === "Brazil" && <BrazilPage />}
      </div>
    </div>
  );
}
