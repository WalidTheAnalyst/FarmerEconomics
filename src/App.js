import { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, Area, AreaChart, Cell
} from "recharts";

// ─── SAMPLE DATA ────────────────────────────────────────────────────────────
const SAMPLE_DATA = [
  { region: "Spain", crop: "Wheat", soil_ph: 7.8, om: 1.2, strategy: "Blended (MAP)", yield: 4.2, fert_cost: 310, op_cost: 820, revenue: 1050, margin: 230 },
  { region: "Spain", crop: "Wheat", soil_ph: 7.8, om: 1.2, strategy: "Separated (TSP+N)", yield: 4.55, fert_cost: 295, op_cost: 875, revenue: 1137, margin: 262 },
  { region: "Spain", crop: "Wheat", soil_ph: 7.8, om: 1.2, strategy: "Optimized", yield: 4.7, fert_cost: 285, op_cost: 860, revenue: 1175, margin: 315 },
  { region: "France", crop: "Wheat", soil_ph: 6.5, om: 2.1, strategy: "Blended (MAP)", yield: 7.1, fert_cost: 340, op_cost: 980, revenue: 1775, margin: 795 },
  { region: "France", crop: "Wheat", soil_ph: 6.5, om: 2.1, strategy: "Separated (TSP+N)", yield: 7.2, fert_cost: 330, op_cost: 1030, revenue: 1800, margin: 770 },
  { region: "France", crop: "Wheat", soil_ph: 6.5, om: 2.1, strategy: "Optimized", yield: 7.4, fert_cost: 320, op_cost: 1010, revenue: 1850, margin: 840 },
  { region: "Brazil", crop: "Maize", soil_ph: 5.4, om: 2.8, strategy: "Blended (MAP)", yield: 7.8, fert_cost: 420, op_cost: 1100, revenue: 1248, margin: 148 },
  { region: "Brazil", crop: "Maize", soil_ph: 5.4, om: 2.8, strategy: "Separated (TSP+N)", yield: 8.6, fert_cost: 400, op_cost: 1170, revenue: 1376, margin: 206 },
  { region: "Brazil", crop: "Maize", soil_ph: 5.4, om: 2.8, strategy: "Optimized", yield: 9.1, fert_cost: 390, op_cost: 1150, revenue: 1456, margin: 306 },
  { region: "Australia", crop: "Wheat", soil_ph: 6.1, om: 1.5, strategy: "Blended (MAP)", yield: 3.8, fert_cost: 280, op_cost: 760, revenue: 950, margin: 190 },
  { region: "Australia", crop: "Wheat", soil_ph: 6.1, om: 1.5, strategy: "Separated (TSP+N)", yield: 4.0, fert_cost: 270, op_cost: 810, revenue: 1000, margin: 190 },
  { region: "Australia", crop: "Wheat", soil_ph: 6.1, om: 1.5, strategy: "Optimized", yield: 4.2, fert_cost: 265, op_cost: 795, revenue: 1050, margin: 255 },
  { region: "Morocco", crop: "Wheat", soil_ph: 8.1, om: 0.8, strategy: "Blended (MAP)", yield: 2.9, fert_cost: 260, op_cost: 620, revenue: 725, margin: 105 },
  { region: "Morocco", crop: "Wheat", soil_ph: 8.1, om: 0.8, strategy: "Separated (TSP+N)", yield: 3.3, fert_cost: 245, op_cost: 675, revenue: 825, margin: 150 },
  { region: "Morocco", crop: "Wheat", soil_ph: 8.1, om: 0.8, strategy: "Optimized", yield: 3.5, fert_cost: 240, op_cost: 658, revenue: 875, margin: 217 },
  { region: "Spain", crop: "Olives", soil_ph: 7.5, om: 1.0, strategy: "Blended (MAP)", yield: 3.1, fert_cost: 290, op_cost: 1100, revenue: 1550, margin: 450 },
  { region: "Spain", crop: "Olives", soil_ph: 7.5, om: 1.0, strategy: "Separated (TSP+N)", yield: 3.3, fert_cost: 275, op_cost: 1155, revenue: 1650, margin: 495 },
  { region: "Spain", crop: "Olives", soil_ph: 7.5, om: 1.0, strategy: "Optimized", yield: 3.5, fert_cost: 265, op_cost: 1135, revenue: 1750, margin: 615 },
];

const REGIONS = [...new Set(SAMPLE_DATA.map(d => d.region))];
const CROPS = [...new Set(SAMPLE_DATA.map(d => d.crop))];

const REGION_META = {
  Spain: { lat: 40, lng: -3, label: "Spain", highlight: true },
  France: { lat: 46, lng: 2, label: "France", highlight: false },
  Brazil: { lat: -15, lng: -48, label: "Brazil", highlight: true },
  Australia: { lat: -25, lng: 133, label: "Australia", highlight: false },
  Morocco: { lat: 32, lng: -5, label: "Morocco", highlight: true },
};

const STRATEGY_COLORS = {
  "Blended (MAP)": "#64748b",
  "Separated (TSP+N)": "#0ea5e9",
  "Optimized": "#10b981",
};

// ─── UTILITY ─────────────────────────────────────────────────────────────────
function fmt(n, prefix = "$", suffix = "") {
  if (n === undefined || n === null) return "—";
  return `${prefix}${Number(n).toFixed(0)}${suffix}`;
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

// ─── INSIGHTS ENGINE ─────────────────────────────────────────────────────────
function generateInsights(data, region, crop) {
  const filtered = data.filter(d => d.region === region && d.crop === crop);
  if (!filtered.length) return [];
  const base = filtered.find(d => d.strategy === "Blended (MAP)");
  const sep = filtered.find(d => d.strategy === "Separated (TSP+N)");
  const opt = filtered.find(d => d.strategy === "Optimized");
  if (!base || !sep) return [];
  const ph = base.soil_ph;
  const marginDelta = sep.margin - base.margin;
  const yieldGain = ((sep.yield - base.yield) / base.yield * 100).toFixed(1);
  const extraOpCost = sep.op_cost - base.op_cost;
  const breakEvenYield = (extraOpCost / (base.revenue / base.yield)).toFixed(2);
  const insights = [];
  if (ph > 7.5) insights.push(`In calcareous soils (pH ${ph}), P fixation is high — separation improves net margin by ~$${marginDelta}/ha by reducing P tie-up.`);
  else if (ph < 6.0) insights.push(`Acidic soils (pH ${ph}) show strong response to TSP separation due to Al/Fe competition for P — a ${yieldGain}% yield gain is modeled here.`);
  else insights.push(`Moderate pH (${ph}) limits the soil-driven case for separation — agronomic benefit is smaller but still net positive at $${marginDelta}/ha.`);
  insights.push(`Separation requires an additional $${extraOpCost}/ha in operational cost (extra passes, labor). Break-even at a ${breakEvenYield}t/ha yield gain.`);
  if (marginDelta > 0) insights.push(`Under current ${crop.toLowerCase()} prices in ${region}, separation increases profit per hectare once all incremental costs are included.`);
  else insights.push(`With current fuel and labor costs in ${region}, separation is margin-neutral. Reduction in pass cost or higher crop prices would tip the balance.`);
  if (opt) insights.push(`An optimized program could yield $${(opt.margin - base.margin).toFixed(0)}/ha above baseline — ${((opt.margin - sep.margin)).toFixed(0)} more than standard separation.`);
  return insights;
}

// ─── PAGES ───────────────────────────────────────────────────────────────────

function KPICard({ label, value, sub, accent }) {
  return (
    <div style={{ background: "#0f172a", border: `1px solid ${accent}30`, borderRadius: 12, padding: "18px 22px", minWidth: 160, flex: 1 }}>
      <p style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</p>
      <p style={{ color: accent, fontSize: 26, fontWeight: 700, fontFamily: "'DM Mono', monospace", margin: 0 }}>{value}</p>
      {sub && <p style={{ color: "#475569", fontSize: 11, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

function OverviewPage({ data, region, crop }) {
  const filtered = data.filter(d => d.region === region && d.crop === crop);
  const base = filtered.find(d => d.strategy === "Blended (MAP)");
  const sep = filtered.find(d => d.strategy === "Separated (TSP+N)");

  const regionAttractive = REGIONS.map(r => {
    const crops = [...new Set(data.filter(d => d.region === r).map(d => d.crop))];
    const deltas = crops.map(c => {
      const b = data.find(d => d.region === r && d.crop === c && d.strategy === "Blended (MAP)");
      const s = data.find(d => d.region === r && d.crop === c && d.strategy === "Separated (TSP+N)");
      return b && s ? s.margin - b.margin : 0;
    });
    const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    return { region: r, avg };
  });

  const marginDelta = base && sep ? (sep.margin - base.margin) : 0;
  const fertShare = base ? ((base.fert_cost / base.op_cost) * 100) : 0;

  return (
    <div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
        <KPICard label="Net Margin (Separated)" value={sep ? fmt(sep.margin) + "/ha" : "—"} sub={`vs ${fmt(base?.margin)}/ha baseline`} accent="#0ea5e9" />
        <KPICard label="Separation Benefit" value={marginDelta >= 0 ? `+${fmt(marginDelta, "$")}/ha` : fmt(marginDelta) + "/ha"} sub="vs blended program" accent={marginDelta >= 0 ? "#10b981" : "#f43f5e"} />
        <KPICard label="Yield (Separated)" value={sep ? sep.yield + " t/ha" : "—"} sub={base ? `vs ${base.yield} t/ha baseline` : ""} accent="#a78bfa" />
        <KPICard label="Fert. Cost Share" value={pct(fertShare)} sub="of total production cost" accent="#f59e0b" />
        <KPICard label="Total Prod. Cost" value={base ? fmt(base.op_cost) + "/ha" : "—"} sub="blended baseline" accent="#64748b" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
          <h3 style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Separation Attractiveness by Region</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={regionAttractive} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="region" tick={{ fill: "#64748b", fontSize: 11 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#334155" />
              <Bar dataKey="avg" name="Avg Margin Delta ($/ha)" radius={[4, 4, 0, 0]}>
                {regionAttractive.map((entry, i) => (
                  <Cell key={i} fill={entry.avg > 30 ? "#10b981" : entry.avg > 0 ? "#0ea5e9" : "#f43f5e"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
          <h3 style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Margin by Strategy — {crop} in {region}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={filtered} margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="strategy" tick={{ fill: "#64748b", fontSize: 10 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="margin" name="Gross Margin ($/ha)" radius={[4, 4, 0, 0]}>
                {filtered.map((entry, i) => (
                  <Cell key={i} fill={STRATEGY_COLORS[entry.strategy] || "#64748b"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SimulatorPage({ data, region, crop }) {
  const [cropPrice, setCropPrice] = useState(250);
  const [mapPrice, setMapPrice] = useState(520);
  const [tspPrice, setTspPrice] = useState(480);
  const [baseYield, setBaseYield] = useState(4.5);
  const [yieldBoost, setYieldBoost] = useState(8);
  const [extraPasses, setExtraPasses] = useState(1);
  const [costPerPass, setCostPerPass] = useState(55);
  const [appRateN, setAppRateN] = useState(150);
  const [appRateP, setAppRateP] = useState(80);

  const scenarios = useMemo(() => {
    const fertCostBlended = (appRateP * mapPrice) / 1000 + (appRateN * 280) / 1000;
    const fertCostSep = (appRateP * tspPrice) / 1000 + (appRateN * 280) / 1000;
    const extraOpCost = extraPasses * costPerPass;
    const yieldSep = baseYield * (1 + yieldBoost / 100);
    const yieldOpt = baseYield * (1 + (yieldBoost * 1.3) / 100);
    const baseOpCost = 750;

    return [
      {
        strategy: "Blended (MAP)", yield: baseYield,
        revenue: baseYield * cropPrice, fertCost: fertCostBlended,
        opCost: baseOpCost, totalCost: baseOpCost + fertCostBlended,
        margin: baseYield * cropPrice - baseOpCost - fertCostBlended,
      },
      {
        strategy: "Separated (TSP+N)", yield: yieldSep,
        revenue: yieldSep * cropPrice, fertCost: fertCostSep,
        opCost: baseOpCost + extraOpCost, totalCost: baseOpCost + extraOpCost + fertCostSep,
        margin: yieldSep * cropPrice - (baseOpCost + extraOpCost) - fertCostSep,
      },
      {
        strategy: "Optimized", yield: yieldOpt,
        revenue: yieldOpt * cropPrice, fertCost: fertCostSep * 0.95,
        opCost: baseOpCost + extraOpCost * 0.85, totalCost: baseOpCost + extraOpCost * 0.85 + fertCostSep * 0.95,
        margin: yieldOpt * cropPrice - (baseOpCost + extraOpCost * 0.85) - fertCostSep * 0.95,
      }
    ];
  }, [cropPrice, mapPrice, tspPrice, baseYield, yieldBoost, extraPasses, costPerPass, appRateN, appRateP]);

  const base = scenarios[0];
  const sep = scenarios[1];
  const breakEven = ((extraPasses * costPerPass) / cropPrice).toFixed(2);

  const waterfallData = [
    { name: "Base Margin", value: base.margin, fill: "#64748b" },
    { name: "+ Yield Gain", value: sep.revenue - base.revenue, fill: "#10b981" },
    { name: "- Extra Passes", value: -(extraPasses * costPerPass), fill: "#f43f5e" },
    { name: "- Fert Δ", value: -(sep.fertCost - base.fertCost), fill: "#f59e0b" },
    { name: "= Sep. Margin", value: sep.margin, fill: "#0ea5e9" },
  ];

  const SliderRow = ({ label, min, max, step, value, onChange, unit }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: "#94a3b8", fontSize: 12 }}>{label}</span>
        <span style={{ color: "#f1f5f9", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#0ea5e9", cursor: "pointer" }} />
    </div>
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
          <h3 style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>Scenario Inputs</h3>
          <SliderRow label="Crop Price ($/t)" min={100} max={600} step={10} value={cropPrice} onChange={setCropPrice} unit=" $/t" />
          <SliderRow label="MAP Price ($/t)" min={300} max={900} step={10} value={mapPrice} onChange={setMapPrice} unit=" $/t" />
          <SliderRow label="TSP Price ($/t)" min={280} max={850} step={10} value={tspPrice} onChange={setTspPrice} unit=" $/t" />
          <SliderRow label="Base Yield" min={1} max={15} step={0.1} value={baseYield} onChange={setBaseYield} unit=" t/ha" />
          <SliderRow label="Yield Boost (Sep.)" min={0} max={30} step={0.5} value={yieldBoost} onChange={setYieldBoost} unit="%" />
          <SliderRow label="Extra Passes" min={0} max={4} step={1} value={extraPasses} onChange={setExtraPasses} unit="" />
          <SliderRow label="Cost per Pass" min={20} max={150} step={5} value={costPerPass} onChange={setCostPerPass} unit=" $/ha" />
          <SliderRow label="N Rate" min={50} max={300} step={5} value={appRateN} onChange={setAppRateN} unit=" kg/ha" />
          <SliderRow label="P Rate" min={20} max={200} step={5} value={appRateP} onChange={setAppRateP} unit=" kg/ha" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1e293b" }}>
                  {["Metric", ...scenarios.map(s => s.strategy)].map((h, i) => (
                    <th key={i} style={{ padding: "12px 16px", textAlign: i === 0 ? "left" : "right", color: i === 0 ? "#64748b" : Object.values(STRATEGY_COLORS)[i - 1], fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Yield (t/ha)", s => s.yield.toFixed(2)],
                  ["Revenue ($/ha)", s => fmt(s.revenue)],
                  ["Fertilizer Cost ($/ha)", s => fmt(s.fertCost)],
                  ["Operational Cost ($/ha)", s => fmt(s.opCost)],
                  ["Total Cost ($/ha)", s => fmt(s.totalCost)],
                  ["Gross Margin ($/ha)", s => fmt(s.margin)],
                ].map(([label, fn], ri) => (
                  <tr key={ri} style={{ borderBottom: "1px solid #0f1929", background: ri % 2 === 0 ? "#0a0f1a" : "#0f172a" }}>
                    <td style={{ padding: "10px 16px", color: "#94a3b8", fontSize: 12 }}>{label}</td>
                    {scenarios.map((s, si) => (
                      <td key={si} style={{ padding: "10px 16px", textAlign: "right", color: "#f1f5f9", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{fn(s)}</td>
                    ))}
                  </tr>
                ))}
                <tr style={{ background: "#0a1628", borderTop: "2px solid #1e293b" }}>
                  <td style={{ padding: "10px 16px", color: "#64748b", fontSize: 12 }}>Δ vs Baseline</td>
                  {scenarios.map((s, si) => {
                    const delta = s.margin - base.margin;
                    return (
                      <td key={si} style={{ padding: "10px 16px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700, color: si === 0 ? "#475569" : delta >= 0 ? "#10b981" : "#f43f5e" }}>
                        {si === 0 ? "—" : (delta >= 0 ? "+" : "") + fmt(delta)}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 16 }}>
              <h3 style={{ color: "#94a3b8", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Profit Waterfall</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={waterfallData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 9 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="$/ha" radius={[3, 3, 0, 0]}>
                    {waterfallData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 12 }}>
              <h3 style={{ color: "#94a3b8", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Break-Even Analysis</h3>
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "#64748b", fontSize: 12, marginBottom: 4 }}>Min yield gain to break even</p>
                <p style={{ color: "#f59e0b", fontSize: 36, fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{breakEven} t/ha</p>
                <p style={{ color: "#475569", fontSize: 11 }}>({((breakEven / baseYield) * 100).toFixed(1)}% of base yield)</p>
              </div>
              <div style={{ width: "100%", background: "#1e293b", borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
                <p style={{ color: yieldBoost / 100 * baseYield >= breakEven ? "#10b981" : "#f43f5e", fontWeight: 700, fontSize: 14 }}>
                  {yieldBoost / 100 * baseYield >= breakEven ? "✓ SEPARATION PAYS OFF" : "✗ DOES NOT BREAK EVEN"}
                </p>
                <p style={{ color: "#475569", fontSize: 11, marginTop: 4 }}>Modeled yield gain: {(yieldBoost / 100 * baseYield).toFixed(2)} t/ha</p>
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
  const filtered = data.filter(d => d.region === region && d.crop === crop);
  const base = filtered.find(d => d.strategy === "Blended (MAP)");

  const categories = [
    { key: "seed", label: "Seed", value: 95, share: 11, color: "#a78bfa" },
    { key: "fert", label: "Fertilizer", value: base?.fert_cost || 310, share: Math.round((base?.fert_cost || 310) / (base?.op_cost || 900) * 100), color: "#f59e0b" },
    { key: "cp", label: "Crop Protection", value: 120, share: 14, color: "#0ea5e9" },
    { key: "mach", label: "Machinery", value: 180, share: 21, color: "#64748b" },
    { key: "labor", label: "Labor", value: 95, share: 11, color: "#10b981" },
    { key: "fuel", label: "Fuel", value: 65, share: 8, color: "#f43f5e" },
    { key: "land", label: "Land / Rent", value: 145, share: 17, color: "#e2e8f0" },
  ];

  const sensitivityData = [200, 300, 400, 500, 600, 700, 800].map(fp => ({
    price: fp,
    "Blended": (base?.revenue || 1050) - (base?.op_cost || 900 - (base?.fert_cost || 310)) - fp,
    "Separated": (base?.revenue || 1050) * 1.08 - ((base?.op_cost || 900) + 55 - ((base?.fert_cost || 310) * 0.95)) - fp * 0.95,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
        <h3 style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Farm Cost Structure — {crop} in {region}</h3>
        {categories.map(cat => (
          <div key={cat.key} style={{ marginBottom: 8 }}>
            <div onClick={() => setExpanded(e => ({ ...e, [cat.key]: !e[cat.key] }))}
              style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "8px 10px", borderRadius: 8, background: expanded[cat.key] ? "#1e293b" : "transparent" }}>
              <span style={{ color: cat.color, fontSize: 14 }}>{expanded[cat.key] ? "▼" : "▶"}</span>
              <span style={{ color: "#e2e8f0", fontSize: 13, flex: 1 }}>{cat.label}</span>
              <div style={{ width: 160, background: "#1e293b", borderRadius: 4, height: 6 }}>
                <div style={{ width: `${cat.share}%`, background: cat.color, borderRadius: 4, height: "100%" }} />
              </div>
              <span style={{ color: "#94a3b8", fontSize: 12, width: 40, textAlign: "right" }}>{cat.share}%</span>
              <span style={{ color: "#f1f5f9", fontFamily: "'DM Mono', monospace", fontSize: 13, width: 70, textAlign: "right" }}>${cat.value}/ha</span>
            </div>
            {expanded[cat.key] && (
              <div style={{ marginLeft: 32, padding: "8px 10px", background: "#0a0f1a", borderRadius: 8, fontSize: 12, color: "#64748b" }}>
                {cat.key === "fert" ? `Blended (MAP/DAP): $${cat.value}/ha → Separated (TSP+N): $${Math.round(cat.value * 0.95)}/ha (≈5% reduction from TSP price differential)` : `Standard allocation for ${crop.toLowerCase()} production in ${region}.`}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
        <h3 style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Margin Sensitivity to Fertilizer Price</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={sensitivityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="price" label={{ value: "Fert Price ($/t)", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 10 }} tick={{ fill: "#64748b", fontSize: 11 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
            <ReferenceLine y={0} stroke="#334155" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="Blended" stroke="#64748b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Separated" stroke="#0ea5e9" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function AgronomyPage() {
  const phData = Array.from({ length: 30 }, (_, i) => {
    const ph = 5.0 + i * 0.15;
    return {
      ph: ph.toFixed(1),
      "MAP/DAP": Math.max(0, 6.5 - Math.abs(ph - 6.2) * 1.8 + (ph > 7.0 ? -(ph - 7.0) * 2 : 0)),
      "TSP Sep.": Math.max(0, 7.0 - Math.abs(ph - 6.5) * 1.2 + (ph > 7.5 ? -(ph - 7.5) * 1.5 : 0)),
      "Optimized": Math.max(0, 7.5 - Math.abs(ph - 6.8) * 1.0),
    };
  });

  const pRateData = Array.from({ length: 10 }, (_, i) => {
    const rate = i * 20 + 20;
    return {
      rate,
      "MAP/DAP": Math.min(8, 3 + Math.sqrt(rate) * 0.65),
      "TSP Sep.": Math.min(9, 3.2 + Math.sqrt(rate) * 0.72),
      "Optimized": Math.min(9.5, 3.4 + Math.sqrt(rate) * 0.78),
    };
  });

  const omData = Array.from({ length: 8 }, (_, i) => {
    const om = 0.5 + i * 0.5;
    return {
      om: om.toFixed(1),
      "P Efficiency (MAP)": Math.min(85, 40 + om * 18),
      "P Efficiency (TSP)": Math.min(92, 45 + om * 20),
    };
  });

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
        <h3 style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Yield vs Soil pH</h3>
        <p style={{ color: "#475569", fontSize: 11, marginBottom: 14 }}>Separation advantage is highest in calcareous soils (pH &gt; 7.5) where MAP P-fixation is strong</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={phData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="ph" tick={{ fill: "#64748b", fontSize: 10 }} label={{ value: "Soil pH", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 10 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} label={{ value: "Yield t/ha", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {["MAP/DAP", "TSP Sep.", "Optimized"].map((k, i) => (
              <Line key={k} type="monotone" dataKey={k} stroke={Object.values(STRATEGY_COLORS)[i]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
        <h3 style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Yield vs P Application Rate</h3>
        <p style={{ color: "#475569", fontSize: 11, marginBottom: 14 }}>Diminishing returns curve — separation shifts the plateau upward via improved uptake efficiency</p>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={pRateData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="rate" tick={{ fill: "#64748b", fontSize: 10 }} label={{ value: "P Rate (kg/ha)", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 10 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {["MAP/DAP", "TSP Sep.", "Optimized"].map((k, i) => (
              <Line key={k} type="monotone" dataKey={k} stroke={Object.values(STRATEGY_COLORS)[i]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
        <h3 style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>P Uptake Efficiency vs Organic Matter</h3>
        <p style={{ color: "#475569", fontSize: 11, marginBottom: 14 }}>Higher OM buffers pH and reduces P fixation — gap between strategies narrows above 2.5% OM</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={omData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="om" tick={{ fill: "#64748b", fontSize: 10 }} label={{ value: "Organic Matter (%)", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 10 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Area type="monotone" dataKey="P Efficiency (MAP)" stroke="#64748b" fill="#64748b20" strokeWidth={2} />
            <Area type="monotone" dataKey="P Efficiency (TSP)" stroke="#0ea5e9" fill="#0ea5e920" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
        <h3 style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Key Mechanisms</h3>
        {[
          { title: "P Fixation in Calcareous Soils", body: "At pH > 7.5, Ca²⁺ precipitates MAP-released phosphate as dicalcium phosphate within hours. TSP applied separately maintains lower pH microzone around granule, delaying fixation.", accent: "#f59e0b" },
          { title: "NH₄⁺ Interference in Blends", body: "MAP/DAP release both N and P simultaneously. High NH₄⁺ concentration suppresses root P uptake early in the season. Separation allows P uptake to proceed independently.", accent: "#a78bfa" },
          { title: "Placement & Timing", body: "Separated TSP can be banded subsurface, putting P directly into root zone. MAP broadcast loses 15–35% to surface fixation in many soils.", accent: "#0ea5e9" },
        ].map((item, i) => (
          <div key={i} style={{ borderLeft: `2px solid ${item.accent}`, paddingLeft: 12, marginBottom: 14 }}>
            <p style={{ color: item.accent, fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{item.title}</p>
            <p style={{ color: "#64748b", fontSize: 11, lineHeight: 1.6 }}>{item.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightsPage({ data, region, crop }) {
  const insights = generateInsights(data, region, crop);
  const allInsights = REGIONS.flatMap(r =>
    CROPS.filter(c => data.some(d => d.region === r && d.crop === c)).map(c => {
      const b = data.find(d => d.region === r && d.crop === c && d.strategy === "Blended (MAP)");
      const s = data.find(d => d.region === r && d.crop === c && d.strategy === "Separated (TSP+N)");
      if (!b || !s) return null;
      return { region: r, crop: c, delta: s.margin - b.margin, ph: b.soil_ph };
    }).filter(Boolean)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ background: "#0f172a", border: "1px solid #0ea5e930", borderRadius: 12, padding: 22 }}>
        <h3 style={{ color: "#0ea5e9", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 18 }}>
          ◈ Strategy Insights — {crop} in {region}
        </h3>
        {insights.length ? insights.map((ins, i) => (
          <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14, padding: "12px 14px", background: "#0a0f1a", borderRadius: 8 }}>
            <span style={{ color: "#0ea5e9", fontSize: 16, marginTop: 1 }}>→</span>
            <p style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.7, margin: 0 }}>{ins}</p>
          </div>
        )) : <p style={{ color: "#475569" }}>No data for selected context.</p>}
      </div>

      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
        <h3 style={{ color: "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Full Context Matrix — Separation Benefit ($/ha)</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #1e293b" }}>
              <th style={{ padding: "8px 12px", textAlign: "left", color: "#64748b", fontSize: 11 }}>Region</th>
              <th style={{ padding: "8px 12px", textAlign: "left", color: "#64748b", fontSize: 11 }}>Crop</th>
              <th style={{ padding: "8px 12px", textAlign: "right", color: "#64748b", fontSize: 11 }}>Soil pH</th>
              <th style={{ padding: "8px 12px", textAlign: "right", color: "#64748b", fontSize: 11 }}>Δ Margin ($/ha)</th>
              <th style={{ padding: "8px 12px", textAlign: "center", color: "#64748b", fontSize: 11 }}>Verdict</th>
            </tr>
          </thead>
          <tbody>
            {allInsights.sort((a, b) => b.delta - a.delta).map((row, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #0f1929", background: i % 2 === 0 ? "#0a0f1a" : "#0f172a" }}>
                <td style={{ padding: "8px 12px", color: "#94a3b8" }}>{row.region}</td>
                <td style={{ padding: "8px 12px", color: "#94a3b8" }}>{row.crop}</td>
                <td style={{ padding: "8px 12px", textAlign: "right", color: "#64748b", fontFamily: "'DM Mono', monospace" }}>{row.ph}</td>
                <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontWeight: 700, color: row.delta > 0 ? "#10b981" : row.delta === 0 ? "#f59e0b" : "#f43f5e" }}>
                  {row.delta > 0 ? "+" : ""}{row.delta}
                </td>
                <td style={{ padding: "8px 12px", textAlign: "center" }}>
                  <span style={{ padding: "2px 8px", borderRadius: 20, fontSize: 10, background: row.delta > 30 ? "#10b98120" : row.delta > 0 ? "#0ea5e920" : "#f43f5e20", color: row.delta > 30 ? "#10b981" : row.delta > 0 ? "#0ea5e9" : "#f43f5e" }}>
                    {row.delta > 30 ? "STRONG" : row.delta > 0 ? "MARGINAL" : "NEUTRAL"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("overview");
  const [region, setRegion] = useState("Morocco");
  const [crop, setCrop] = useState("Wheat");
  const [savedScenarios, setSavedScenarios] = useState([
    { name: "Spain Wheat Baseline", region: "Spain", crop: "Wheat" },
    { name: "Brazil Maize High pH", region: "Brazil", crop: "Maize" },
  ]);
  const [scenarioName, setScenarioName] = useState("");

  const pages = [
    { key: "overview", label: "Overview" },
    { key: "simulator", label: "Scenario Simulator" },
    { key: "pl", label: "P&L Explorer" },
    { key: "agronomy", label: "Agronomic Response" },
    { key: "insights", label: "Insights" },
  ];

  const saveScenario = () => {
    if (!scenarioName) return;
    setSavedScenarios(s => [...s, { name: scenarioName, region, crop }]);
    setScenarioName("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060d1a", color: "#e2e8f0", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0f172a; } ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
        input[type=range] { height: 4px; }
        select { background: #1e293b; color: #e2e8f0; border: 1px solid #334155; border-radius: 6px; padding: 6px 10px; font-size: 13px; cursor: pointer; outline: none; }
        select:hover { border-color: #0ea5e9; }
      `}</style>

      {/* HEADER */}
      <div style={{ borderBottom: "1px solid #1e293b", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, background: "#0a0f1a" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0ea5e9", boxShadow: "0 0 10px #0ea5e9" }} />
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em", color: "#f1f5f9" }}>PhosStratOS</span>
          <span style={{ color: "#334155", fontSize: 12 }}>|</span>
          <span style={{ color: "#475569", fontSize: 12 }}>P Separation Economics Dashboard</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select value={region} onChange={e => setRegion(e.target.value)}>
            {REGIONS.map(r => <option key={r}>{r}</option>)}
          </select>
          <select value={crop} onChange={e => setCrop(e.target.value)}>
            {CROPS.map(c => <option key={c}>{c}</option>)}
          </select>
          <button onClick={() => { const csv = "Strategy,Yield,Revenue,FertCost,OpCost,Margin\n" + SAMPLE_DATA.filter(d => d.region === region && d.crop === crop).map(d => `${d.strategy},${d.yield},${d.revenue},${d.fert_cost},${d.op_cost},${d.margin}`).join("\n"); const b = new Blob([csv], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `phosstratos_${region}_${crop}.csv`; a.click(); }}
            style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", padding: "6px 14px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>
            ↓ Export
          </button>
        </div>
      </div>

      {/* NAV */}
      <div style={{ borderBottom: "1px solid #1e293b", padding: "0 32px", display: "flex", gap: 0, background: "#0a0f1a" }}>
        {pages.map(p => (
          <button key={p.key} onClick={() => setPage(p.key)}
            style={{ padding: "12px 20px", background: "transparent", border: "none", borderBottom: page === p.key ? "2px solid #0ea5e9" : "2px solid transparent", color: page === p.key ? "#0ea5e9" : "#64748b", fontSize: 13, fontWeight: page === p.key ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* BODY */}
      <div style={{ display: "flex", minHeight: "calc(100vh - 113px)" }}>
        <div style={{ flex: 1, padding: 28, overflow: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.03em" }}>{pages.find(p => p.key === page)?.label}</h1>
              <p style={{ color: "#475569", fontSize: 13, marginTop: 3 }}>{crop} · {region} · Blended vs Separated P Program</p>
            </div>
          </div>

          {page === "overview" && <OverviewPage data={SAMPLE_DATA} region={region} crop={crop} />}
          {page === "simulator" && <SimulatorPage data={SAMPLE_DATA} region={region} crop={crop} />}
          {page === "pl" && <PLPage data={SAMPLE_DATA} region={region} crop={crop} />}
          {page === "agronomy" && <AgronomyPage />}
          {page === "insights" && <InsightsPage data={SAMPLE_DATA} region={region} crop={crop} />}
        </div>

        {/* SIDEBAR */}
        <div style={{ width: 220, borderLeft: "1px solid #1e293b", padding: 18, background: "#0a0f1a", flexShrink: 0 }}>
          <h3 style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>Saved Scenarios</h3>
          {savedScenarios.map((s, i) => (
            <div key={i} onClick={() => { setRegion(s.region); setCrop(s.crop); }}
              style={{ padding: "8px 10px", borderRadius: 6, marginBottom: 6, cursor: "pointer", background: region === s.region && crop === s.crop ? "#1e293b" : "transparent", border: "1px solid transparent" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#334155"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}>
              <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 500 }}>{s.name}</p>
              <p style={{ color: "#475569", fontSize: 10, marginTop: 2 }}>{s.crop} · {s.region}</p>
            </div>
          ))}
          <div style={{ marginTop: 16, borderTop: "1px solid #1e293b", paddingTop: 14 }}>
            <input value={scenarioName} onChange={e => setScenarioName(e.target.value)} placeholder="Scenario name..." style={{ width: "100%", background: "#1e293b", border: "1px solid #334155", borderRadius: 6, padding: "6px 8px", color: "#e2e8f0", fontSize: 12, marginBottom: 8, outline: "none" }} />
            <button onClick={saveScenario} style={{ width: "100%", background: "#0ea5e910", border: "1px solid #0ea5e940", color: "#0ea5e9", padding: "7px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>+ Save Current</button>
          </div>
        </div>
      </div>
    </div>
  );
}
