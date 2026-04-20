/* eslint-disable no-unused-vars -- setSimYear, selectedAlts, REGION_KEYS, YEAR_KEYS, FARMTYPE_KEYS, rofiDiff reserved for future use */
import { useState, useEffect } from "react";
import ATLASPage from "./ATLAS";
import { ResponsiveContainer, LineChart, BarChart, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, Bar, Area, ReferenceLine, ReferenceArea, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PieChart, Pie } from 'recharts';
// ─── DATA ────────────────────────────────────────────────────────────────────


// ─── EXCEL DATA (Farmer Analytics factsheets v5 — France) ────────────────────
const YEARS       = [2017,2018,2019,2020,2021,2022,2023];




const REGIONAL_DATA = {
  "Île-de-France":{
    crops:["Corn","Triticale","Rapeseed","Sunflower","Vegetables","Wheat","Barley","Beet","Potatoes","Grapes"],
    area:{"Corn":[145952,38775,183575,146032,87175,47755,90593],"Triticale":[1920,1865,3190,3575,3605,2940,2384],"Rapeseed":[76140,78800,48655,60705,52260,63495,68226],"Sunflower":[1280,1505,3950,6195,8860,12023,12169],"Vegetables":[17446,12707,14910,20194,18961,15979,19207],"Wheat":[228570,220430,223090,194290,220885,204590,207427],"Barley":[88620,87605,104480,100770,84180,89630,89038],"Beet":[49635,49505,45950,43415,40750,39095,32162],"Potatoes":[4776,4738,4867,5243,4679,4399,4318],"Grapes":[30,33,33,101,101,101,109]},
    production:{"Corn":[372474,322678,364899,354635,472874,388535,467704],"Triticale":[11520,11190,19778,19663,23197,18673,15394],"Rapeseed":[313181,266560,149011,204897,190666,266925,234523],"Sunflower":[4280,4286,11915,17686,30608,34047,39293],"Vegetables":[64489,42761,62797,60596,57736,59292,67723],"Wheat":[1830659,1687577,1956693,1469618,1817216,1732088,1706559],"Barley":[645944,606931,820445,583518,634241,634609,676645],"Beet":[4588398,3558810,3610660,1708580,3342255,2838325,2641877],"Potatoes":[237401,197707,216780,229578,219131,177437,186358],"Grapes":[231,474,306,352,371,735,702]},
    yield:{"Corn":[11.1,8.3,8.2,6.9,20.4,8.3,17.4],"Triticale":[6.0,6.0,6.2,5.5,6.4,6.4,6.5],"Rapeseed":[4.1,3.4,3.1,3.4,3.6,4.2,3.4],"Sunflower":[3.3,2.8,3.0,2.9,3.5,2.8,3.2],"Vegetables":[13.5,9.7,12.1,8.3,8.9,7.9,8.1],"Wheat":[8.0,7.7,8.8,7.6,8.2,8.5,8.2],"Barley":[7.3,6.9,7.9,5.8,7.5,7.1,7.6],"Beet":[92.4,71.9,78.6,39.4,82.0,72.6,82.1],"Potatoes":[49.7,41.7,44.5,43.8,46.8,40.3,43.2],"Grapes":[7.7,14.3,9.3,7.8,6.2,10.8,7.5]},
  },
  "Centre-Val de Loire":{
    crops:["Corn","Triticale","Rapeseed","Sunflower","Wheat","Barley","Beet","Potatoes","Grapes","Vegetables"],
    area:{"Wheat":[620000,600000,595000,520000,590000,565000,575000],"Barley":[205000,195000,215000,210000,195000,200000,198000],"Rapeseed":[245000,260000,195000,205000,185000,220000,230000],"Corn":[118000,120000,115000,125000,113000,118000,115000],"Sunflower":[52000,54000,62000,78000,72000,88000,85000],"Beet":[87000,85000,78000,74000,71000,69000,65000],"Potatoes":[12000,12500,13000,13500,13000,12800,12500],"Grapes":[58000,57000,58000,59000,60000,60000,61000],"Vegetables":[18000,17000,18500,19000,18000,17500,18000],"Triticale":[48000,44000,50000,47000,52000,48000,45000]},
    production:{"Wheat":[4650000,4200000,4750000,3700000,4500000,4300000,4400000],"Barley":[1450000,1280000,1520000,1250000,1380000,1380000,1390000],"Rapeseed":[870000,825000,620000,660000,605000,730000,760000],"Corn":[1150000,1020000,1000000,1050000,990000,970000,1000000],"Beet":[7500000,6700000,6800000,3400000,6300000,5700000,5500000],"Potatoes":[530000,480000,520000,540000,525000,460000,480000],"Sunflower":[120000,115000,135000,160000,155000,180000,178000],"Triticale":[270000,240000,280000,250000,290000,272000,260000],"Grapes":[252000,155000,210000,195000,180000,230000,220000],"Vegetables":[90000,78000,88000,92000,86000,84000,87000]},
    yield:{"Wheat":[7.5,7.0,8.0,7.1,7.6,7.6,7.7],"Barley":[7.1,6.6,7.1,6.0,7.1,6.9,7.0],"Rapeseed":[3.6,3.2,3.2,3.2,3.3,3.3,3.3],"Corn":[9.7,8.5,8.7,8.4,8.8,8.2,8.7],"Beet":[86.2,78.8,87.2,45.9,88.6,82.4,84.6],"Potatoes":[44.2,38.4,40.0,40.0,40.4,35.9,38.4],"Sunflower":[2.3,2.1,2.2,2.1,2.2,2.0,2.1],"Triticale":[5.6,5.5,5.6,5.3,5.6,5.7,5.8],"Grapes":[4.3,2.7,3.6,3.3,3.0,3.8,3.6],"Vegetables":[5.0,4.6,4.8,4.8,4.8,4.8,4.8]},
  },
  "Hauts-de-France":{
    crops:["Wheat","Barley","Rapeseed","Beet","Potatoes","Corn","Vegetables"],
    area:{"Wheat":[570000,555000,550000,490000,545000,525000,530000],"Barley":[190000,180000,195000,190000,178000,182000,180000],"Rapeseed":[195000,205000,155000,165000,148000,175000,185000],"Beet":[195000,192000,180000,170000,163000,161000,152000],"Potatoes":[86000,87000,90000,93000,90000,89000,87000],"Corn":[52000,50000,48000,52000,47000,49000,48000],"Vegetables":[45000,43000,46000,48000,45000,44000,45000]},
    production:{"Wheat":[4600000,4100000,4750000,3600000,4400000,4200000,4300000],"Barley":[1380000,1210000,1450000,1200000,1310000,1300000,1310000],"Rapeseed":[720000,660000,510000,550000,490000,580000,610000],"Beet":[17800000,16200000,17100000,8200000,15700000,14300000,13900000],"Potatoes":[4500000,3900000,4300000,4400000,4300000,3800000,3950000],"Corn":[490000,420000,425000,440000,415000,405000,418000],"Vegetables":[990000,890000,980000,1030000,960000,940000,975000]},
    yield:{"Wheat":[8.1,7.4,8.6,7.3,8.1,8.0,8.1],"Barley":[7.3,6.7,7.4,6.3,7.4,7.1,7.3],"Rapeseed":[3.7,3.2,3.3,3.3,3.3,3.3,3.3],"Beet":[91.3,84.4,95.0,48.2,96.3,88.8,91.4],"Potatoes":[52.3,44.8,47.8,47.3,47.8,42.7,45.4],"Corn":[9.4,8.4,8.9,8.5,8.8,8.3,8.7],"Vegetables":[22.0,20.7,21.3,21.5,21.3,21.4,21.7]},
  },
  "Grand Est":{
    crops:["Wheat","Barley","Rapeseed","Corn","Beet","Grapes","Potatoes"],
    area:{"Wheat":[480000,465000,460000,405000,455000,438000,442000],"Barley":[175000,162000,178000,175000,162000,168000,165000],"Rapeseed":[210000,220000,170000,178000,160000,190000,200000],"Corn":[245000,248000,265000,295000,268000,255000,238000],"Beet":[89000,88000,80000,76000,73000,72000,68000],"Grapes":[138000,138000,138000,138000,138000,138000,138000],"Potatoes":[11000,11200,11500,12000,11500,11200,11000]},
    production:{"Wheat":[3700000,3400000,3800000,3000000,3600000,3450000,3500000],"Barley":[1260000,1100000,1310000,1080000,1175000,1190000,1185000],"Rapeseed":[760000,700000,560000,590000,525000,625000,660000],"Corn":[2350000,2260000,2450000,2650000,2400000,2270000,2190000],"Beet":[8100000,7300000,7600000,3700000,7200000,6700000,6500000],"Grapes":[950000,700000,850000,780000,820000,920000,880000],"Potatoes":[535000,490000,525000,545000,525000,490000,500000]},
    yield:{"Wheat":[7.7,7.3,8.3,7.4,7.9,7.9,7.9],"Barley":[7.2,6.8,7.4,6.2,7.3,7.1,7.2],"Rapeseed":[3.6,3.2,3.3,3.3,3.3,3.3,3.3],"Corn":[9.6,9.1,9.2,9.0,9.0,8.9,9.2],"Beet":[91.0,83.0,95.0,48.7,98.6,93.1,95.6],"Grapes":[6.9,5.1,6.2,5.7,5.9,6.7,6.4],"Potatoes":[48.6,43.8,45.7,45.4,45.7,43.8,45.5]},
  },
  "Bretagne":{
    crops:["Wheat","Barley","Corn","Rapeseed","Potatoes","Vegetables"],
    area:{"Wheat":[205000,198000,196000,174000,194000,187000,189000],"Barley":[220000,208000,225000,222000,205000,212000,209000],"Corn":[305000,308000,325000,370000,332000,315000,295000],"Rapeseed":[55000,58000,45000,47000,42000,50000,53000],"Potatoes":[27000,27500,28500,30000,28500,28000,27500],"Vegetables":[36000,34000,37000,39000,37000,36000,37000]},
    production:{"Wheat":[1380000,1210000,1440000,1120000,1330000,1280000,1300000],"Barley":[1470000,1295000,1570000,1310000,1390000,1390000,1395000],"Corn":[2700000,2610000,2890000,3170000,2840000,2660000,2590000],"Rapeseed":[175000,165000,140000,148000,132000,158000,168000],"Potatoes":[1090000,980000,1050000,1090000,1060000,985000,1005000],"Vegetables":[700000,630000,700000,730000,695000,675000,695000]},
    yield:{"Wheat":[6.7,6.1,7.3,6.4,6.9,6.8,6.9],"Barley":[6.7,6.2,7.0,5.9,6.8,6.6,6.7],"Corn":[8.9,8.5,8.9,8.6,8.6,8.4,8.8],"Rapeseed":[3.2,2.8,3.1,3.1,3.1,3.2,3.2],"Potatoes":[40.4,35.6,36.8,36.3,37.2,35.2,36.5],"Vegetables":[19.4,18.5,18.9,18.7,18.8,18.8,18.8]},
  },
  "Nouvelle-Aquitaine":{
    crops:["Wheat","Barley","Corn","Rapeseed","Sunflower","Grapes","Potatoes"],
    area:{"Wheat":[490000,475000,470000,418000,465000,447000,451000],"Barley":[185000,173000,188000,185000,172000,177000,175000],"Corn":[320000,323000,345000,395000,353000,335000,313000],"Rapeseed":[198000,208000,163000,170000,152000,180000,190000],"Sunflower":[165000,155000,175000,220000,198000,245000,235000],"Grapes":[252000,252000,253000,254000,255000,255000,258000],"Potatoes":[18500,18800,19500,20500,19500,19100,18700]},
    production:{"Wheat":[3200000,3000000,3400000,2700000,3100000,2980000,3050000],"Barley":[1180000,1050000,1230000,1090000,1115000,1125000,1120000],"Corn":[2950000,2820000,3200000,3540000,3140000,2970000,2840000],"Rapeseed":[640000,600000,490000,520000,468000,556000,590000],"Sunflower":[360000,320000,370000,430000,390000,450000,440000],"Grapes":[1750000,1320000,1650000,1600000,1530000,1790000,1720000],"Potatoes":[700000,640000,680000,710000,680000,620000,640000]},
    yield:{"Wheat":[6.5,6.3,7.2,6.5,6.7,6.7,6.8],"Barley":[6.4,6.1,6.5,5.9,6.5,6.4,6.4],"Corn":[9.2,8.7,9.3,9.0,8.9,8.9,9.1],"Rapeseed":[3.2,2.9,3.0,3.1,3.1,3.1,3.1],"Sunflower":[2.2,2.1,2.1,2.0,2.0,1.8,1.9],"Grapes":[6.9,5.2,6.5,6.3,6.0,7.0,6.7],"Potatoes":[37.8,34.0,34.9,34.6,34.9,32.5,34.2]},
  },
  "Occitanie":{
    crops:["Wheat","Barley","Corn","Rapeseed","Sunflower","Grapes","Potatoes"],
    area:{"Wheat":[380000,368000,364000,323000,360000,346000,349000],"Barley":[218000,204000,222000,218000,203000,209000,206000],"Corn":[195000,197000,210000,240000,215000,204000,191000],"Rapeseed":[88000,93000,73000,76000,68000,81000,85000],"Sunflower":[176000,165000,186000,234000,210000,260000,250000],"Grapes":[222000,221000,222000,222000,223000,223000,225000],"Potatoes":[5800,5900,6100,6400,6100,5980,5850]},
    production:{"Wheat":[2280000,2100000,2500000,1970000,2240000,2150000,2200000],"Barley":[1230000,1085000,1280000,1100000,1150000,1155000,1155000],"Corn":[1720000,1660000,1870000,2050000,1820000,1715000,1660000],"Rapeseed":[268000,252000,213000,226000,200000,237000,250000],"Sunflower":[380000,340000,385000,455000,408000,470000,455000],"Grapes":[1560000,1190000,1480000,1440000,1400000,1580000,1530000],"Potatoes":[210000,195000,205000,215000,208000,190000,196000]},
    yield:{"Wheat":[6.0,5.7,6.9,6.1,6.2,6.2,6.3],"Barley":[5.6,5.3,5.8,5.0,5.7,5.5,5.6],"Corn":[8.8,8.4,8.9,8.5,8.5,8.4,8.7],"Rapeseed":[3.0,2.7,2.9,3.0,2.9,2.9,2.9],"Sunflower":[2.2,2.1,2.1,1.9,1.9,1.8,1.8],"Grapes":[7.0,5.4,6.7,6.5,6.3,7.1,6.8],"Potatoes":[36.2,33.1,33.6,33.6,34.1,31.8,33.5]},
  },
};


// ─── FARMER PERSONAS ─────────────────────────────────────────────────────────
// Exhaustive segmentation based on Agreste 2020, McKinsey farmer surveys,
// French agri-market research, and OCP commercial field data
const FARMER_PERSONAS = [
  {
    id: "price-fighter",
    nickname: "The Price Fighter",
    emoji: "💰",
    color: "#f43f5e",
    tagline: "Prix d'abord, agronomie ensuite",
    share: 28,
    farmSize: "<40 ha",
    age: "55–70 yrs",
    region: "All regions",
    tenure: "Primarily lessee",
    structure: "Individual (EARL)",
    channel: "Direct distributor / price comparison",
    budget: "Minimises total input spend per ha",
    description: "Driven purely by invoice price. Will switch supplier for €2/tonne difference. Uses cooperative only if they have the cheapest quote that week. Often over-applies cheap N and under-applies P to save money.",
    fertiliserBehavior: "Buys cheapest NPK blend available. Defers P applications in tight years. Price spike = immediate P skip.",
    decisionDriver: "Price",
    innovationScore: 12,
    priceScore: 95,
    agronomyScore: 18,
    sustainScore: 8,
    coopScore: 40,
    digitalScore: 10,
    p2o5KgHa: 15,
    fertSpend: 285,
    ocpOpportunity: "Low — very price-sensitive. TSP pitch must lead with cost-per-unit, not agronomy.",
    stats: [
      { label: "P2O5 applied",     value: "~15 kg/ha",  note: "vs 55 kg/ha recommended" },
      { label: "Avg. farm size",   value: "<40 ha",     note: "75% operate on leased land" },
      { label: "Coop loyalty",     value: "Low",        note: "Shops multiple distributors" },
      { label: "Fert. spend",      value: "€285/ha",    note: "Below national avg of €340" },
      { label: "P deferral rate",  value: "~60%",       note: "In years of price shocks" },
      { label: "Digital tools",    value: "None/rare",  note: "Phone & paper records" },
    ],
    segments: [
      { label:"Price sensitivity",  val:95, color:"#f43f5e" },
      { label:"Agronomy focus",     val:18, color:"#2DB84B" },
      { label:"Innovation adopt.",  val:12, color:"#2DB84B" },
      { label:"Sustainability",     val:8,  color:"#a78bfa" },
      { label:"Coop loyalty",       val:40, color:"#f59e0b" },
    ],
  },
  {
    id: "coop-follower",
    nickname: "The Coop Follower",
    emoji: "🤝",
    color: "#f59e0b",
    tagline: "Mon conseiller coopératif décide",
    share: 32,
    farmSize: "40–100 ha",
    age: "45–60 yrs",
    region: "Champagne, Beauce, Picardie",
    tenure: "Mixed (own + lease)",
    structure: "GAEC or EARL",
    channel: "Cooperative agronomist recommendation",
    budget: "Follows coop package — rarely compares",
    description: "The dominant profile in French arable farming. Trusts cooperative agronomist completely. Buys the recommended program without questioning it. Highly loyal — sticky once enrolled in a coop program. 70% of French P2O5 moves through this channel.",
    fertiliserBehavior: "Buys the cooperative's recommended blend or TSP program verbatim. Does not comparison-shop. Influenced by regional agronomist visits.",
    decisionDriver: "Agronomist recommendation",
    innovationScore: 45,
    priceScore: 55,
    agronomyScore: 62,
    sustainScore: 40,
    coopScore: 90,
    digitalScore: 30,
    p2o5KgHa: 38,
    fertSpend: 330,
    ocpOpportunity: "HIGH — must target the coop agronomist, not the farmer. Win the agronomist, win 32% of the market.",
    stats: [
      { label: "P2O5 applied",     value: "~38 kg/ha",  note: "Still below 55 kg/ha rec." },
      { label: "Avg. farm size",   value: "40–100 ha",  note: "Core cereal zone farms" },
      { label: "Coop loyalty",     value: "Very high",  note: "90% of inputs via coop" },
      { label: "Fert. spend",      value: "€330/ha",    note: "Close to national avg" },
      { label: "Decision speed",   value: "Fast",       note: "Once agronomist advises" },
      { label: "TSP familiarity",  value: "Low",        note: "Mostly uses NPK blends" },
    ],
    segments: [
      { label:"Price sensitivity",  val:55, color:"#f43f5e" },
      { label:"Agronomy focus",     val:62, color:"#2DB84B" },
      { label:"Innovation adopt.",  val:45, color:"#2DB84B" },
      { label:"Sustainability",     val:40, color:"#a78bfa" },
      { label:"Coop loyalty",       val:90, color:"#f59e0b" },
    ],
  },
  {
    id: "precision-pioneer",
    nickname: "The Precision Pioneer",
    emoji: "🛰️",
    color: "#2DB84B",
    tagline: "GPS, VRA, et données avant tout",
    share: 11,
    farmSize: ">150 ha",
    age: "30–45 yrs",
    region: "Île-de-France, Champagne, Eure-et-Loir",
    tenure: "Owner-operator or long-term lease",
    structure: "SAS/SCEA or large GAEC",
    channel: "Direct supplier + agronomic advisor",
    budget: "ROI-driven — will pay premium if data-justified",
    description: "Young, educated, data-driven. Uses GPS variable-rate application, yield mapping, soil sampling grids. Reads ARVALIS trial results. Open to separated P programs if agronomic evidence is clear. Often manages >200 ha. Growing segment.",
    fertiliserBehavior: "Uses VRA for P. Tests TSP vs MAP in on-farm trials. Willing to pay premium if justified by soil analysis. Already familiar with P separation concept.",
    decisionDriver: "Agronomic ROI + data evidence",
    innovationScore: 88,
    priceScore: 35,
    agronomyScore: 92,
    sustainScore: 65,
    coopScore: 55,
    digitalScore: 82,
    p2o5KgHa: 52,
    fertSpend: 410,
    ocpOpportunity: "VERY HIGH — early adopter. Lead with agronomic trial data and VRA compatibility. Will champion TSP if convinced.",
    stats: [
      { label: "P2O5 applied",     value: "~52 kg/ha",  note: "Closest to Comifer rec." },
      { label: "Avg. farm size",   value: ">150 ha",    note: "Some >300 ha SCEA" },
      { label: "VRA adoption",     value: "~80%",       note: "GPS-guided P application" },
      { label: "Fert. spend",      value: "€410/ha",    note: "Premium for quality" },
      { label: "Trial willingness",value: "High",       note: "Conducts own field trials" },
      { label: "Digital tools",    value: "Full stack",  note: "FMIS + satellite imaging" },
    ],
    segments: [
      { label:"Price sensitivity",  val:35, color:"#f43f5e" },
      { label:"Agronomy focus",     val:92, color:"#2DB84B" },
      { label:"Innovation adopt.",  val:88, color:"#2DB84B" },
      { label:"Sustainability",     val:65, color:"#a78bfa" },
      { label:"Coop loyalty",       val:55, color:"#f59e0b" },
    ],
  },
  {
    id: "green-convert",
    nickname: "The Green Convert",
    emoji: "🌱",
    color: "#2DB84B",
    tagline: "Bas carbone et certification HVE",
    share: 9,
    farmSize: "30–120 ha",
    age: "35–55 yrs",
    region: "Loire Valley, Normandie, Bretagne",
    tenure: "Owner or long-term tenant",
    structure: "Individual or GAEC",
    channel: "Cooperative bio / sustainable advisor",
    budget: "Will pay premium for certified low-carbon inputs",
    description: "HVE-certified or transitioning to organic. Actively reducing synthetic inputs. Interested in carbon credits and the Farm-to-Fork agenda. Particularly interested in low-cadmium, low-carbon P sources — OCP's Moroccan P is a natural fit.",
    fertiliserBehavior: "Prefers certified organic P or low-carbon mineral P. Actively seeks cadmium certificates. Reduces total P but insists on quality sources. TSP at lower rates is attractive.",
    decisionDriver: "Environmental certification + brand values",
    innovationScore: 72,
    priceScore: 42,
    agronomyScore: 70,
    sustainScore: 94,
    coopScore: 65,
    digitalScore: 55,
    p2o5KgHa: 28,
    fertSpend: 355,
    ocpOpportunity: "HIGH — lead with OCP's low-cadmium positioning and carbon footprint narrative. Green certification is a door-opener.",
    stats: [
      { label: "P2O5 applied",     value: "~28 kg/ha",  note: "Intentionally low-input" },
      { label: "HVE certification",value: "14% of FR",   note: "60k+ farms certified" },
      { label: "Carbon program",   value: "12%",         note: "Enrolled in credit schemes" },
      { label: "Fert. spend",      value: "€355/ha",    note: "Premium for green inputs" },
      { label: "Biostimulant use", value: "High",       note: "40%+ already using" },
      { label: "Cadmium concern",  value: "Very high",  note: "EU regs primary motivator" },
    ],
    segments: [
      { label:"Price sensitivity",  val:42, color:"#f43f5e" },
      { label:"Agronomy focus",     val:70, color:"#2DB84B" },
      { label:"Innovation adopt.",  val:72, color:"#2DB84B" },
      { label:"Sustainability",     val:94, color:"#a78bfa" },
      { label:"Coop loyalty",       val:65, color:"#f59e0b" },
    ],
  },
  {
    id: "sunset-farmer",
    nickname: "The Sunset Farmer",
    emoji: "🌅",
    color: "#a78bfa",
    tagline: "Plus que 5 ans avant la retraite",
    share: 14,
    farmSize: "Any, often <60 ha",
    age: "60–70+ yrs",
    region: "All — concentrated in <20 ha segment",
    tenure: "Owner (often inherited)",
    structure: "Individual, no succession plan",
    channel: "Habit and inertia — same supplier for decades",
    budget: "Minimal capex, depleting soil P reserves",
    description: "Within 5–10 years of retirement. No identified successor. Investing minimally in soil fertility. Actively mining soil P reserves. Represents the largest cohort by number (>50% of operators >55 yrs). Decisions made on autopilot.",
    fertiliserBehavior: "Applies minimal fertilizer — often below agronomic requirements. Skips P entirely in some years. Has no incentive to build soil fertility they won't harvest. Extremely price-resistant to new products.",
    decisionDriver: "Inertia and cost minimization",
    innovationScore: 5,
    priceScore: 78,
    agronomyScore: 22,
    sustainScore: 15,
    coopScore: 50,
    digitalScore: 5,
    p2o5KgHa: 10,
    fertSpend: 240,
    ocpOpportunity: "VERY LOW near-term. Long-term: their farms will transfer to Precision Pioneers and Coop Followers — the generational transfer is the real opportunity window.",
    stats: [
      { label: "P2O5 applied",     value: "~10 kg/ha",  note: "Actively mining soil P" },
      { label: "Share of farms",   value: "43%+",       note: "Operators >55 yrs" },
      { label: "Succession plan",  value: "<30%",       note: "Have identified successor" },
      { label: "Fert. spend",      value: "€240/ha",    note: "Lowest of all segments" },
      { label: "Investment horizon","value": "<5 yrs",  note: "Near-term retirement" },
      { label: "Soil P status",    value: "Declining",  note: "Building agronomic gap" },
    ],
    segments: [
      { label:"Price sensitivity",  val:78, color:"#f43f5e" },
      { label:"Agronomy focus",     val:22, color:"#2DB84B" },
      { label:"Innovation adopt.",  val:5,  color:"#2DB84B" },
      { label:"Sustainability",     val:15, color:"#a78bfa" },
      { label:"Coop loyalty",       val:50, color:"#f59e0b" },
    ],
  },
  {
    id: "consolidator",
    nickname: "The Consolidator",
    emoji: "🏗️",
    color: "#818cf8",
    tagline: "J'agrandis, j'optimise, j'externalise",
    share: 6,
    farmSize: "200–500+ ha",
    age: "40–55 yrs",
    region: "Beauce, Champagne, Picardie, Bourgogne",
    tenure: "Primarily lessee — aggressive land accumulation",
    structure: "SAS, SCEA, or EARL with salaried workers",
    channel: "Negotiates direct with manufacturers or large distributors",
    budget: "Volume-driven — seeks best per-tonne delivered cost at scale",
    description: "Rapidly expanding operations through land leasing. Employs salaried agronomists. Buys at volume — directly from importers or large trading houses. High sophistication. Represents only 6% of farms but ~20% of P2O5 volume by hectares managed.",
    fertiliserBehavior: "Negotiates bulk contracts 6–12 months ahead. Already uses TSP on wheat. Aware of P separation. Will switch if economics clear at scale.",
    decisionDriver: "Volume economics and operational efficiency",
    innovationScore: 75,
    priceScore: 70,
    agronomyScore: 78,
    sustainScore: 45,
    coopScore: 30,
    digitalScore: 68,
    p2o5KgHa: 48,
    fertSpend: 380,
    ocpOpportunity: "VERY HIGH volume leverage — but bypasses coop channel. Must be approached directly. Bulk TSP contract potential.",
    stats: [
      { label: "P2O5 applied",     value: "~48 kg/ha",  note: "Near recommended levels" },
      { label: "Farm size",        value: "200–500+ ha", note: "Some >1,000 ha SAU" },
      { label: "Volume share",     value: "~20%",       note: "Of total P2O5 volume" },
      { label: "Fert. spend",      value: "€380/ha",    note: "Negotiated bulk pricing" },
      { label: "Lead time",        value: "6–12 mo",    note: "Forward buying horizon" },
      { label: "Coop bypass",      value: "Yes",        note: "Direct importer deals" },
    ],
    segments: [
      { label:"Price sensitivity",  val:70, color:"#f43f5e" },
      { label:"Agronomy focus",     val:78, color:"#2DB84B" },
      { label:"Innovation adopt.",  val:75, color:"#2DB84B" },
      { label:"Sustainability",     val:45, color:"#a78bfa" },
      { label:"Coop loyalty",       val:30, color:"#f59e0b" },
    ],
  },
];

// ─── MARKET INTEL ─────────────────────────────────────────────────────────────
const MARKET_INTEL = {
  France: {
    kpis:[
      { label:"P2O5 consumed",     value:"226 kt",  sub:"−44% vs 2017",      accent:"#2DB84B" },
      { label:"Agronomic gap",     value:"−157 kt", sub:"vs Comifer rec.",    accent:"#f59e0b" },
      { label:"Addressable mkt",   value:"511 kt",  sub:"P2O5 by 2030",      accent:"#2DB84B" },
      { label:"Fert. cost share",  value:"14–16%",  sub:"of variable costs", accent:"#a78bfa" },
      { label:"Morocco mkt share", value:"~62%",    sub:"DAP/MAP imports",   accent:"#2DB84B" },
    ],
    productMix:[
      { name:"NPK/NP",  val2022:103, val2023:66, color:"#a78bfa" },
      { name:"PK",      val2022:74,  val2023:43, color:"#f59e0b" },
      { name:"DAP/MAP", val2022:72,  val2023:55, color:"#2DB84B" },
      { name:"TSP",     val2022:54,  val2023:25, color:"#2DB84B" },
      { name:"Other P", val2022:39,  val2023:33, color:"#6B8F72" },
    ],
    importOrigin:[
      { name:"Morocco", value:69.4, color:"#2DB84B" },
      { name:"Russia",  value:13.0, color:"#f87171" },
      { name:"Egypt",   value:11.5, color:"#f59e0b" },
      { name:"Tunisia", value:2.0,  color:"#6B8F72" },
      { name:"Other",   value:1.0,  color:"#6B8F72" },
    ],
    dynamics:[
      { type:"risk",     icon:"📉", label:"Consumption decline",         text:"P2O5 use fell ~44% from 2017 to 2023. Only ~50% of parcels receive mineral P — a structural agronomic gap versus Comifer recommendations." },
      { type:"risk",     icon:"✂️", label:"Price shock & substitution",  text:"The 2022 price spike created a scissors effect. Farmers systematically prioritize nitrogen and defer P & K when budgets are tight." },
      { type:"neutral",  icon:"🚢", label:"Import dependency",           text:"70% of P consumption is imported. No domestic TSP or DAP capacity — structurally favoring Moroccan and Russian exporters." },
      { type:"positive", icon:"📈", label:"Addressable market recovery", text:"If France closes 70% of the agronomic gap, the addressable P2O5 market reaches 511 kt by 2030." },
    ],
    strategy:[
      { type:"positive", icon:"🏆", label:"TSP positioning",       text:"TSP is agronomically optimal for French winter cereals and rapeseed — decouples N and P, aligns with low-carbon narrative." },
      { type:"positive", icon:"🌾", label:"Coop channel leverage", text:"70% of fertilizer flows through cooperatives. Co-designing blends with Inoxa, Area, Axereal is the critical entry mechanism." },
      { type:"neutral",  icon:"⚔️", label:"Competitive landscape", text:"ICL, Timac, Yara dominate NPK+. Entry requires JV blending or differentiated low-cadmium positioning." },
      { type:"risk",     icon:"⚖️", label:"Regulatory headwinds",  text:"EU heavy metal/carbon rules tighten — risk for high-cadmium sources, opportunity for OCP's low-cadmium Moroccan P." },
    ],
    agronomy:[
      { type:"positive", icon:"🌾", label:"TSP & cereal synergy",     text:"Winter wheat, barley, and rapeseed benefit from pre-sowing TSP — P placed in root zone before tillering without N interference." },
      { type:"neutral",  icon:"🧪", label:"Soil pH buffering",         text:"French soils average pH 6.2–6.8 across cereal zones. Calcareous pockets in Champagne and Languedoc favour TSP strongly." },
      { type:"risk",     icon:"🌍", label:"Organic matter depletion",  text:"Reduced organic inputs are increasing P fixation risk, raising the agronomic argument for separated P application." },
      { type:"positive", icon:"🛰️", label:"Precision agronomy uptake", text:"VRA P application is growing on large cereal farms. Separated P programs are more compatible with VRA than blended NPK." },
    ],
    cropAgronomy:[
      { crop:"Wheat",     area:4950, currentP:18, recP:55, product:"TSP",     color:"#2DB84B" },
      { crop:"Barley",    area:1867, currentP:27, recP:55, product:"TSP",     color:"#2DB84B" },
      { crop:"Rapeseed",  area:1230, currentP:34, recP:55, product:"TSP/PK",  color:"#a78bfa" },
      { crop:"Corn",      area:1456, currentP:39, recP:65, product:"DAP",     color:"#f59e0b" },
      { crop:"Sunflower", area:871,  currentP:25, recP:55, product:"TSP/PK",  color:"#a78bfa" },
      { crop:"Potatoes",  area:211,  currentP:40, recP:40, product:"PK",      color:"#2DB84B" },
      { crop:"Beet",      area:402,  currentP:35, recP:60, product:"PK",      color:"#2DB84B" },
    ],
    ownership:{
      kpis:[
        { label:"Total farms",       value:"390k",  sub:"−19% since 2010",       accent:"#2DB84B" },
        { label:"Avg. farm size",    value:"69 ha", sub:"up from 53 ha in 2010", accent:"#2DB84B" },
        { label:"Operators >55 yrs", value:"43%",   sub:"succession risk",       accent:"#f43f5e" },
        { label:"Land leased",       value:"~75%",  sub:"of utilized agri. area",accent:"#f59e0b" },
        { label:"Coop volumes",      value:"~70%",  sub:"of fertilizer flows",   accent:"#a78bfa" },
      ],
      // Histogram data — farm count by size band (Agreste 2020)
      farmSizeHistogram:[
        { range:"<5 ha",    farms:58, pct:15, fertVolPct:2,  color:"#6B8F72" },
        { range:"5–20 ha",  farms:89, pct:23, fertVolPct:6,  color:"#c8d3e0" },
        { range:"20–50 ha", farms:70, pct:18, fertVolPct:12, color:"#6B8F72" },
        { range:"50–100 ha",farms:62, pct:16, fertVolPct:18, color:"#2DB84B" },
        { range:"100–200 ha",farms:55,pct:14, fertVolPct:24, color:"#818cf8" },
        { range:">200 ha",  farms:56, pct:14, fertVolPct:38, color:"#2DB84B" },
      ],
      tenure:[
        { name:"Primarily lessee", value:40, color:"#f59e0b" },
        { name:"Mixed",            value:35, color:"#2DB84B" },
        { name:"Owner-operator",   value:25, color:"#2DB84B" },
      ],
      implications:[
        { type:"risk",     icon:"⏱️", label:"Short lease horizons",        text:"~75% of land under lease. Tenants on 9-year bail rural leases have limited incentive to invest in long-term soil P building." },
        { type:"risk",     icon:"👴", label:"Aging farmer profile",         text:"43% of operators over 55, many approaching retirement without identified successors. This cohort is characteristically price-sensitive." },
        { type:"neutral",  icon:"📐", label:"Consolidation dynamic",        text:"Average farm size grew from 53 ha in 2010 to 69 ha in 2020. Larger successor farms are the addressable segment for precision P programs." },
        { type:"positive", icon:"🏛️", label:"Cooperative as aggregator",   text:"Given fragmented ownership, cooperatives are the de facto purchasing aggregator. Effective strategy must run through the coop channel." },
        { type:"positive", icon:"🤝", label:"GAEC & EARL structures",       text:"~30% of farms operate through collective structures. These are larger, more professionally managed, more responsive to agronomy." },
        { type:"neutral",  icon:"🔄", label:"Generational transfer window", text:"150–180k farms will change hands over the next 10–15 years. New operators are more likely to adopt evidence-based agronomy." },
      ],
    },
  },
};

// ─── UTILITY ─────────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:"#FFFFFF", border:"1px solid #D6E8DA", borderRadius:8, padding:"10px 14px", fontSize:12 }}>
      <p style={{ color:"#6B8F72", marginBottom:6 }}>{label}</p>
      {payload.map((p,i)=><p key={i} style={{ color:p.color, margin:"2px 0" }}>{p.name}: <strong style={{ color:"#0F2415" }}>{typeof p.value==="number"?p.value.toFixed(1):p.value}</strong></p>)}
    </div>
  );
};


// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
function KPICard({ label, value, sub, accent }) {
  return (
    <div style={{ background:"linear-gradient(135deg,#FFFFFF,#F7F9F7)", border:`1px solid ${accent}25`, borderRadius:14, padding:"16px 18px", flex:1, minWidth:120, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:-15, right:-15, width:60, height:60, borderRadius:"50%", background:accent+"08" }} />
      <p style={{ color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>{label}</p>
      <p style={{ color:accent, fontSize:22, fontWeight:800, fontFamily:"'DM Mono',monospace", margin:0 }}>{value}</p>
      {sub && <p style={{ color:"#6B8F72", fontSize:11, marginTop:4 }}>{sub}</p>}
    </div>
  );
}

function SectionBadge({ label, color }) {
  return <span style={{ padding:"3px 12px", borderRadius:20, fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", background:color+"18", color, border:`1px solid ${color}40` }}>{label}</span>;
}

function InsightCard({ item }) {
  const border={ positive:"#2DB84B", neutral:"#f59e0b", risk:"#f43f5e" };
  const bg={ positive:"#EDF6EF", neutral:"#FFFBF0", risk:"#FFF5F5" };
  const c=border[item.type];
  return (
    <div style={{ background:bg[item.type]||"#F3F8F4", border:`1px solid ${c}30`, borderLeft:`3px solid ${c}`, borderRadius:12, padding:"15px 16px", transition:"transform 0.15s,box-shadow 0.15s", cursor:"default" }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 24px ${c}20`;}}
      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
        <span style={{ fontSize:15 }}>{item.icon}</span>
        <p style={{ fontSize:11, color:c, textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:700, margin:0 }}>{item.label}</p>
      </div>
      <p style={{ fontSize:12, color:"#6B8F72", lineHeight:1.7, margin:0 }}>{item.text}</p>
    </div>
  );
}

function AnimBar({ label, val2022, val2023, maxVal, color }) {
  const isDown=val2023<val2022;
  return (
    <div style={{ marginBottom:13 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ color:"#6B8F72", fontSize:12, fontWeight:500 }}>{label}</span>
        <span style={{ color:"#6B8F72", fontSize:11, fontFamily:"'DM Mono',monospace" }}>
          {val2022} → <span style={{ color:isDown?"#f43f5e":"#2DB84B", fontWeight:700 }}>{val2023}</span>
          <span style={{ color:isDown?"#f43f5e80":"#2DB84B80", fontSize:10, marginLeft:3 }}>{isDown?"▼":"▲"}</span>
        </span>
      </div>
      <div style={{ position:"relative", height:10, background:"#D6E8DA", borderRadius:5, overflow:"hidden" }}>
        <div style={{ position:"absolute", left:0, height:"100%", width:`${(val2022/maxVal)*100}%`, background:color+"30", borderRadius:5 }} />
        <div style={{ position:"absolute", left:0, height:"100%", width:`${(val2023/maxVal)*100}%`, background:`linear-gradient(90deg,${color},${color}bb)`, borderRadius:5 }} />
      </div>
    </div>
  );
}

// ── Radar chart for persona scores ──────────────────────────────────────────
function PersonaRadar({ persona }) {
  const data = [
    { axis:"Price Sensitivity", val:persona.priceScore },
    { axis:"Agronomy Focus",    val:persona.agronomyScore },
    { axis:"Innovation",        val:persona.innovationScore },
    { axis:"Sustainability",    val:persona.sustainScore },
    { axis:"Coop Loyalty",      val:persona.coopScore },
    { axis:"Digital Adoption",  val:persona.digitalScore },
  ];
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid stroke="#D6E8DA" />
        <PolarAngleAxis dataKey="axis" tick={{ fill:"#6B8F72", fontSize:9 }} />
        <Radar name={persona.nickname} dataKey="val" stroke={persona.color} fill={persona.color} fillOpacity={0.25} strokeWidth={2} />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Horizontal score bar ─────────────────────────────────────────────────────
function ScoreBar({ label, val, color }) {
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
        <span style={{ color:"#6B8F72", fontSize:11 }}>{label}</span>
        <span style={{ color, fontSize:11, fontWeight:700, fontFamily:"'DM Mono',monospace" }}>{val}/100</span>
      </div>
      <div style={{ height:6, background:"#D6E8DA", borderRadius:3 }}>
        <div style={{ height:"100%", width:`${val}%`, background:`linear-gradient(90deg,${color},${color}88)`, borderRadius:3, transition:"width 0.6s ease" }} />
      </div>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage({ onEnter }) {
  const [vis,  setVis]  = useState(false);
  const [sub,  setSub]  = useState(false);
  const [btn,  setBtn]  = useState(false);
  useEffect(() => {
    setTimeout(()=>setVis(true),  300);
    setTimeout(()=>setSub(true), 1100);
    setTimeout(()=>setBtn(true), 1900);
  }, []);
  return (
    <div style={{ minHeight:"100vh", background:"#F7F9F7", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans','Segoe UI',sans-serif", position:"relative", overflow:"hidden" }}>
      <style>{`
        @keyframes lFadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes lOrbit{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(45,184,75,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(45,184,75,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }}/>
      <div style={{ position:"absolute", width:480, height:480, borderRadius:"50%", border:"1px solid rgba(45,184,75,0.06)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", animation:"lOrbit 30s linear infinite", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", width:340, height:340, borderRadius:"50%", border:"1px solid rgba(45,184,75,0.05)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", animation:"lOrbit 20s linear infinite reverse", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(45,184,75,0.06) 0%,transparent 70%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none" }}/>
      {/* Logo */}
      <div style={{ position:"absolute", top:32, left:40, display:"flex", alignItems:"center", gap:12, opacity:vis?1:0, transition:"opacity 0.8s ease" }}>
        <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#2DB84B,#1A8A34)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:12, color:"#FFFFFF", fontFamily:"'DM Mono',monospace", boxShadow:"0 0 16px #2DB84B30" }}>GMO</div>
        <span style={{ color:"rgba(15,36,21,0.3)", fontSize:12, letterSpacing:"0.15em", textTransform:"uppercase" }}>OCP Nutricrops · Phosphorus Intelligence</span>
      </div>
      {/* Content */}
      <div style={{ textAlign:"center", maxWidth:720, padding:"0 32px", zIndex:10 }}>
        <div style={{ opacity:vis?1:0, transform:vis?"none":"translateY(12px)", transition:"opacity 0.9s ease,transform 0.9s ease", marginBottom:24 }}>
          <span style={{ background:"rgba(45,184,75,0.1)", border:"1px solid rgba(45,184,75,0.2)", borderRadius:20, padding:"5px 16px", color:"rgba(45,184,75,0.9)", fontSize:11, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase" }}>GMO · OCP Nutricrops</span>
        </div>
        <h1 style={{ opacity:vis?1:0, transform:vis?"none":"translateY(20px)", transition:"opacity 0.9s ease,transform 0.9s ease", fontSize:"clamp(26px,4vw,46px)", fontWeight:300, color:"rgba(15,36,21,0.92)", lineHeight:1.28, marginBottom:32, letterSpacing:"-0.02em" }}>
          PhosStrat is GMO's quantitative<br/>
          <span style={{ fontWeight:700, color:"#0F2415" }}>platform to better understand</span><br/>
          <span style={{ color:"#2DB84B", fontWeight:600 }}>the farmer.</span>
        </h1>
        <div style={{ opacity:sub?1:0, transform:sub?"none":"translateY(10px)", transition:"opacity 0.8s ease,transform 0.8s ease", margin:"0 auto 28px", width:48, height:1, background:"linear-gradient(90deg,transparent,rgba(45,184,75,0.6),transparent)" }}/>
        <p style={{ opacity:sub?1:0, transform:sub?"none":"translateY(10px)", transition:"opacity 0.8s ease,transform 0.8s ease", fontSize:15, color:"rgba(15,36,21,0.45)", fontWeight:300, lineHeight:1.8, marginBottom:48 }}>
          P separation economics · Market intelligence · Agronomic modelling
        </p>
        <button onClick={onEnter}
          style={{ opacity:btn?1:0, transform:btn?"none":"translateY(8px)", transition:"opacity 0.6s ease,transform 0.6s ease,background 0.2s,border-color 0.2s", background:"transparent", border:"1px solid rgba(45,184,75,0.5)", color:"rgba(45,184,75,0.9)", padding:"13px 40px", borderRadius:4, fontSize:13, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}
          onMouseEnter={e=>{ e.currentTarget.style.background="rgba(45,184,75,0.1)"; e.currentTarget.style.borderColor="rgba(45,184,75,0.9)"; e.currentTarget.style.color="#fff"; }}
          onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="rgba(45,184,75,0.5)"; e.currentTarget.style.color="rgba(45,184,75,0.9)"; }}>
          Enter Platform →
        </button>
      </div>
      <div style={{ position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)", opacity:btn?0.4:0, transition:"opacity 0.8s ease", fontSize:11, color:"rgba(15,36,21,0.35)", letterSpacing:"0.1em", textTransform:"uppercase", display:"flex", gap:28 }}>
        <span>Agreste 2020</span><span>·</span><span>McKinsey Farmer Survey</span><span>·</span><span>ARVALIS</span><span>·</span><span>OCP Field Intelligence</span>
      </div>
    </div>
  );
}

// ─── FRANCE MAP (GeoJSON fetched at runtime) ──────────────────────────────────
function heatColor(val, min, max) {
  if (val===undefined||val===null||max===min) return "#D6E8DA";
  const t=Math.max(0,Math.min(1,(val-min)/(max-min)));
  // Distinct palette: muted indigo → warm teal → bright amber-green
  const r=Math.round(38  + t*(180-38));
  const g=Math.round(60  + t*(210-60));
  const b=Math.round(140 + t*(80 -140));
  return `rgb(${r},${g},${b})`;
}
function projectFeature(coords, bbox, W, H, pad) {
  const [minLon,minLat,maxLon,maxLat]=bbox;
  const sx=(W-pad*2)/(maxLon-minLon), sy=(H-pad*2)/(maxLat-minLat), sc=Math.min(sx,sy);
  const ox=pad+(W-pad*2-(maxLon-minLon)*sc)/2, oy=pad+(H-pad*2-(maxLat-minLat)*sc)/2;
  const proj=([lo,la])=>[ox+(lo-minLon)*sc, oy+(maxLat-la)*sc];
  const ring=r=>r.map((p,i)=>{const[x,y]=proj(p);return(i===0?`M${x.toFixed(1)},${y.toFixed(1)}`:`L${x.toFixed(1)},${y.toFixed(1)}`);}).join(" ")+"Z";
  if(!coords)return"";
  if(typeof coords[0][0][0]==="number") return coords.map(ring).join(" ");
  return coords.map(poly=>poly.map(ring).join(" ")).join(" ");
}
function FranceMap({ selectedRegion, onSelectRegion, heatValues }) {
  const [paths,  setPaths]  = useState({});
  const [cents,  setCents]  = useState({});
  const [loaded, setLoaded] = useState(false);
  const [hovered,setHovered]= useState(null);
  const W=520, H=560, PAD=18;
  useEffect(()=>{
    fetch("https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/regions-version-simplifiee.geojson")
      .then(r=>r.json())
      .then(gj=>{
        let minLon=Infinity,minLat=Infinity,maxLon=-Infinity,maxLat=-Infinity;
        gj.features.forEach(f=>{
          const flat=f.geometry.type==="Polygon"?f.geometry.coordinates.flat():f.geometry.coordinates.flat(2);
          flat.forEach(([lo,la])=>{ if(la<40)return; if(lo<minLon)minLon=lo; if(lo>maxLon)maxLon=lo; if(la<minLat)minLat=la; if(la>maxLat)maxLat=la; });
        });
        const bbox=[minLon-0.3,minLat-0.3,maxLon+0.3,maxLat+0.3];
        const np={}, nc={};
        gj.features.forEach(f=>{
          const nom=f.properties.nom;
          const geo=f.geometry;
          const coords=geo.type==="Polygon"?[geo.coordinates]:geo.coordinates;
          np[nom]=projectFeature(coords,bbox,W,H,PAD);
          const flat=(geo.type==="Polygon"?geo.coordinates[0]:geo.coordinates[0][0]);
          const cLon=flat.reduce((s,[lo])=>s+lo,0)/flat.length;
          const cLat=flat.reduce((s,[,la])=>s+la,0)/flat.length;
          nc[nom]=[PAD+(cLon-bbox[0])*(W-PAD*2)/(bbox[2]-bbox[0]), PAD+(bbox[3]-cLat)*(H-PAD*2)/(bbox[3]-bbox[1])];
        });
        setPaths(np); setCents(nc); setLoaded(true);
      }).catch(()=>{});
  },[]);
  const hasData=r=>Object.keys(REGIONAL_DATA).includes(r);
  const vals=Object.entries(heatValues||{}).filter(([r])=>hasData(r)).map(([,v])=>v);
  const minV=vals.length?Math.min(...vals):0, maxV=vals.length?Math.max(...vals):1;
  const fmt2=v=>v>1000000?(v/1000000).toFixed(1)+"M":v>1000?(v/1000).toFixed(0)+"k":Number(v).toFixed(v<20?1:0);
  return(
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",display:"block"}}>
      <defs><filter id="mGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      {!loaded&&<text x={W/2} y={H/2} textAnchor="middle" fill="#B8D4BE" fontSize={12} fontFamily="DM Sans,sans-serif">Loading map…</text>}
      {Object.entries(paths).map(([name,d])=>{
        const [cx,cy]=cents[name]||[0,0];
        const isSel=selectedRegion===name,isHov=hovered===name,hasD=hasData(name);
        const hVal=heatValues?.[name];
        const fill=isSel?"#ffffff":isHov?(hasD?"#C8F0D0":"#D6E8DA"):(hasD?heatColor(hVal,minV,maxV):"#D6E8DA");
        return(
          <g key={name} style={{cursor:hasD?"pointer":"default",opacity:hasD?1:0.6}}
            onClick={()=>hasD&&onSelectRegion(name)}
            onMouseEnter={()=>setHovered(name)} onMouseLeave={()=>setHovered(null)}>
            <path d={d} fill={fill} stroke={isSel?"#fff":isHov?"#C8F0D0":"#9BB5A0"} strokeWidth={isSel?2.5:1.2}
              filter={isSel?"url(#mGlow)":undefined} style={{transition:"fill 0.18s"}}/>
            {(isHov||isSel)&&(<>
              <text x={cx} y={cy-(hVal!==undefined?6:0)} textAnchor="middle" dominantBaseline="middle"
                fontSize={isSel?8.5:8} fill={isSel?"#FFFFFF":"#0F2415"} fontWeight={700}
                fontFamily="DM Sans,sans-serif" style={{pointerEvents:"none",userSelect:"none"}}>{name.substring(0,18)}</text>
              {hVal!==undefined&&<text x={cx} y={cy+8} textAnchor="middle" dominantBaseline="middle"
                fontSize={7.5} fill={isSel?"#FFFFFF":"#C8F0D0"} fontFamily="DM Mono,monospace"
                style={{pointerEvents:"none",userSelect:"none"}}>{fmt2(hVal)}</text>}
            </>)}
          </g>
        );
      })}
      {vals.length>0&&(<g transform={`translate(12,${H-26})`}>
        <defs><linearGradient id="scBar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0f2035"/><stop offset="50%" stopColor="#2DB84B"/><stop offset="100%" stopColor="#2DB84B"/>
        </linearGradient></defs>
        <rect x={0} y={0} width={110} height={7} rx={3} fill="url(#scBar)"/>
        <text x={0}   y={17} fontSize={7} fill="#6B8F72" fontFamily="DM Mono,sans-serif">{fmt2(minV)}</text>
        <text x={55}  y={17} fontSize={7} fill="#6B8F72" fontFamily="DM Mono,sans-serif" textAnchor="middle">low → high</text>
        <text x={110} y={17} fontSize={7} fill="#6B8F72" fontFamily="DM Mono,sans-serif" textAnchor="end">{fmt2(maxV)}</text>
      </g>)}
      <g transform={`translate(135,${H-24})`}>
        <rect x={0} y={0} width={9} height={7} rx={1} fill="#F7F9F7" stroke="#D6E8DA" strokeWidth={0.7}/>
        <text x={12} y={7} fontSize={7} fill="#9BB5A0" fontFamily="DM Sans,sans-serif">No data yet</text>
      </g>
    </svg>
  );
}

// ─── REGIONAL ANALYSIS PAGE ───────────────────────────────────────────────────
function RegionalPage(){
  const availableRegions=Object.keys(REGIONAL_DATA);
  const [selectedRegion,setSelectedRegion]=useState(availableRegions[0]);
  const [selectedCrop,  setSelectedCrop]  =useState("Wheat");
  const [metric,        setMetric]        =useState("yield");
  const regionData   =REGIONAL_DATA[selectedRegion];
  const availableCrops=regionData?regionData.crops:[];
  const activeCrop   =availableCrops.includes(selectedCrop)?selectedCrop:availableCrops[0];
  const metricLabel  ={area:"Harvested Area",production:"Production",yield:"Yield"};
  const metricUnit   ={area:"Ha",production:"tonnes",yield:"t/Ha"};
  const metricColor  ={area:"#2DB84B",production:"#2DB84B",yield:"#f59e0b"};
  const chartData    =regionData&&regionData[metric]?YEARS.map((y,i)=>({year:y,value:regionData[metric][activeCrop]?.[i]??0})):[];
  const heatValues   =Object.fromEntries(availableRegions.map(r=>{const rd=REGIONAL_DATA[r];const c=rd?.crops.includes(activeCrop)?activeCrop:rd?.crops[0];const v=rd?.[metric]?.[c]?.[6]??null;return[r,v];}).filter(([,v])=>v!==null));
  const cropColors   =["#2DB84B","#2DB84B","#f59e0b","#a78bfa","#f43f5e"];
  const multiChart   =regionData?YEARS.map((y,i)=>({year:y,...Object.fromEntries(availableCrops.slice(0,5).map(c=>[c,regionData[metric][c]?.[i]??0]))})):[];
  const tickFmt      =v=>v>1000000?(v/1000000).toFixed(1)+"M":v>1000?(v/1000).toFixed(0)+"k":Number(v).toFixed(v<20?1:0);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Controls */}
      <div style={{background:"#F3F8F4",border:"1px solid #D6E8DA",borderRadius:12,padding:"12px 16px",display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
        <div>
          <p style={{color:"#6B8F72",fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:7,fontWeight:600}}>Metric</p>
          <div style={{display:"flex",gap:7}}>
            {Object.entries(metricLabel).map(([k,l])=>(
              <button key={k} onClick={()=>setMetric(k)}
                style={{padding:"7px 16px",borderRadius:8,border:`2px solid ${metric===k?metricColor[k]:"#D6E8DA"}`,background:metric===k?metricColor[k]+"22":"transparent",color:metric===k?metricColor[k]:"#6B8F72",fontSize:12,fontWeight:metric===k?700:400,cursor:"pointer"}}>
                {l} <span style={{opacity:0.6,fontSize:10}}>({metricUnit[k]})</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p style={{color:"#6B8F72",fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:7,fontWeight:600}}>Crop</p>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {["Wheat","Barley","Rapeseed","Corn","Sunflower","Beet","Potatoes"].map(c=>{
              const avail=regionData?.crops.includes(c);
              return(<button key={c} onClick={()=>avail&&setSelectedCrop(c)}
                style={{padding:"5px 12px",borderRadius:8,border:`1px solid ${activeCrop===c?"#0F2415":avail?"#B8D4BE":"#D6E8DA"}`,background:activeCrop===c?"#0F2415":"transparent",color:activeCrop===c?"#FFFFFF":avail?"#6B8F72":"#2d3748",fontSize:11,fontWeight:activeCrop===c?700:400,cursor:avail?"pointer":"default",opacity:avail?1:0.35}}>
                {c}
              </button>);
            })}
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {/* Heatmap */}
        <div className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <h3 className="card-title" style={{marginBottom:1}}>France — {metricLabel[metric]} · {activeCrop} · 2023</h3>
              <p style={{color:"#6B8F72",fontSize:10}}>Click a region to see its time series →</p>
            </div>
            {selectedRegion&&<span style={{background:metricColor[metric]+"20",border:`1px solid ${metricColor[metric]}40`,borderRadius:8,padding:"3px 10px",color:metricColor[metric],fontSize:11,fontWeight:700}}>{selectedRegion.substring(0,16)}</span>}
          </div>
          <FranceMap selectedRegion={selectedRegion}
            onSelectRegion={r=>{setSelectedRegion(r);setSelectedCrop(REGIONAL_DATA[r]?.crops.includes(activeCrop)?activeCrop:REGIONAL_DATA[r]?.crops[0]);}}
            heatValues={heatValues}/>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>
            {availableRegions.map(r=>(
              <button key={r} onClick={()=>setSelectedRegion(r)}
                style={{padding:"3px 8px",borderRadius:5,border:`1px solid ${selectedRegion===r?metricColor[metric]:"#D6E8DA"}`,background:selectedRegion===r?metricColor[metric]+"20":"transparent",color:selectedRegion===r?metricColor[metric]:"#9BB5A0",fontSize:9,cursor:"pointer"}}>
                {r.split("-")[0].split("–")[0].trim().substring(0,14)}
              </button>
            ))}
          </div>
        </div>
        {/* Charts */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div className="card" style={{border:`1px solid ${metricColor[metric]}30`}}>
            <h3 className="card-title" style={{color:metricColor[metric]}}>{activeCrop} — {metricLabel[metric]} ({metricUnit[metric]}) · {selectedRegion}</h3>
            <p style={{color:"#6B8F72",fontSize:10,marginBottom:10}}>2017–2023 · Source: Agreste / Ministry of Agriculture</p>
            <ResponsiveContainer width="100%" height={185}>
              <BarChart data={chartData} margin={{left:10,right:10}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D6E8DA" vertical={false}/>
                <XAxis dataKey="year" tick={{fill:"#6B8F72",fontSize:9}}/>
                <YAxis tick={{fill:"#6B8F72",fontSize:9}} tickFormatter={tickFmt}
                  label={{value:metricUnit[metric],angle:-90,position:"insideLeft",fill:"#6B8F72",fontSize:9,offset:6}}/>
                <Tooltip content={<CustomTooltip/>} formatter={v=>[tickFmt(v)+" "+metricUnit[metric],metricLabel[metric]]}/>
                <Bar dataKey="value" name={metricLabel[metric]} fill={metricColor[metric]} radius={[4,4,0,0]}>
                  {chartData.map((_,i)=><Cell key={i} fill={i===6?"#ffffff":metricColor[metric]} fillOpacity={i===6?1:0.7}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <h3 className="card-title">All Crops — {metricLabel[metric]} ({metricUnit[metric]}) · {selectedRegion}</h3>
            <ResponsiveContainer width="100%" height={165}>
              <LineChart data={multiChart} margin={{left:10,right:10}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D6E8DA"/>
                <XAxis dataKey="year" tick={{fill:"#6B8F72",fontSize:9}}/>
                <YAxis tick={{fill:"#6B8F72",fontSize:9}} tickFormatter={tickFmt}
                  label={{value:metricUnit[metric],angle:-90,position:"insideLeft",fill:"#6B8F72",fontSize:9,offset:6}}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Legend wrapperStyle={{fontSize:9}}/>
                {availableCrops.slice(0,5).map((c,i)=><Line key={c} type="monotone" dataKey={c} stroke={cropColors[i]} strokeWidth={c===activeCrop?2.5:1.5} dot={false} strokeDasharray={c===activeCrop?undefined:"3 2"}/>)}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── FARMER BEHAVIOR PAGE (exhaustive, interactive) ───────────────────────────
function MIFarmerBehaviorPage({ region }) {
  const [topic, setTopic] = useState(null);
  const [activePersona, setActivePersona] = useState(FARMER_PERSONAS[0].id);
  const [viewMode, setViewMode] = useState("grid");
  const persona = FARMER_PERSONAS.find(p=>p.id===activePersona) || FARMER_PERSONAS[0];

  const DECISION_DRIVERS = [
    { id:"cost",    group:"Program Economics",     label:"Total fertilizer cost / ha", surveyScore:4.9, wtpPremium:60, wtpColor:"#2DB84B",
      insight:"Farmers evaluate at program level — total €/ha, not price per bag. A TSP+N separated program can be framed as cheaper per hectare than an equivalent NPK blend.",
      ocpAngle:"Lead every commercial conversation with total program cost. Do not defend TSP price per tonne in isolation.", accentColor:"#2DB84B" },
    { id:"quality", group:"Agronomic Performance",  label:"Product quality — granules & consistency", surveyScore:4.7, wtpPremium:50, wtpColor:"#f59e0b",
      insight:"Granule quality directly affects spreading uniformity. Inconsistent granules create application risk that farmers attribute to the product, not the spreader.",
      ocpAngle:"OCP TSP granule specification is a demonstrable differentiator. Deploy side-by-side spreading trials with cooperative agronomists.", accentColor:"#f59e0b" },
    { id:"peff",    group:"Agronomic Performance",  label:"Phosphorus efficiency", surveyScore:4.6, wtpPremium:55, wtpColor:"#f59e0b",
      insight:"Farmers know P efficiency is a problem — soil pH, fixation, and placement all affect it. This is the strongest agronomic entry point for the TSP separation argument.",
      ocpAngle:"P efficiency is the core case for separation. Every cooperative agronomist visit should anchor on this. ARVALIS trial data is the credibility lever.", accentColor:"#f59e0b" },
    { id:"ease",    group:"Agronomic Performance",  label:"Ease of application", surveyScore:4.4, wtpPremium:40, wtpColor:"#f59e0b",
      insight:"An extra pass for TSP creates friction. Farmers running large acreage on tight seasonal windows weigh machine time directly against agronomic benefit.",
      ocpAngle:"Remove the friction: one-pass programs via cooperative blending units, or contract-applied TSP pre-sowing. Make separation invisible operationally.", accentColor:"#f59e0b" },
    { id:"yield",   group:"Agronomic Performance",  label:"Yield gain (t/ha)", surveyScore:4.4, wtpPremium:55, wtpColor:"#f59e0b",
      insight:"55% WTP for better yield — the highest premium acceptance alongside P efficiency. Requires concrete farm trial evidence, not theoretical claims.",
      ocpAngle:"Commission replicated on-farm trials through Chambres d'Agriculture and ARVALIS. Publish results in cooperative newsletters, not marketing brochures.", accentColor:"#f59e0b" },
    { id:"match",   group:"Agronomic Performance",  label:"Nutrient match to crop & soil", surveyScore:4.4, wtpPremium:45, wtpColor:"#f59e0b",
      insight:"Precision match to soil type and crop requirement is seen as high value. Tied directly into the cooperative agronomist advisory relationship.",
      ocpAngle:"Soil analysis–driven TSP dosing recommendations delivered through cooperative advisory is the natural commercial entry point.", accentColor:"#f59e0b" },
    { id:"bagprice",group:"Price",                  label:"Price per bag (farm-gate)", surveyScore:4.3, wtpPremium:null, wtpColor:null,
      insight:"Ranks #3. Price sensitivity is real but subordinate to program economics and agronomy. The framing of the conversation determines which dimension dominates.",
      ocpAngle:"Never let the negotiation anchor on price per bag. Reframe to €/ha total program cost and cost per tonne of yield gained.", accentColor:"#a78bfa" },
    { id:"delivery",group:"Secondary",              label:"Delivery reliability", surveyScore:3.9, wtpPremium:20, wtpColor:"#f43f5e",
      insight:"Below 40% WTP — table stakes, not a differentiator. Must be met; will not win a sale.",
      ocpAngle:"Ensure logistics commitments are kept. Do not over-invest here as a competitive lever.", accentColor:"#6B8F72" },
    { id:"sustain", group:"Sustainability",         label:"Sustainability / lower carbon", surveyScore:3.0, wtpPremium:25, wtpColor:"#f43f5e",
      insight:"Lowest score today. 25% WTP is concentrated among HVE-certified farms and younger operators. Growing, but not yet a mass-market purchase driver.",
      ocpAngle:"Low-cadmium, low-carbon positioning is a forward asset — target HVE farms now as reference customers. Do not lead with this for the mainstream.", accentColor:"#818cf8" },
  ];

  const INFLUENCERS = [
    { label:"Cooperatives", pct:31, color:"#2DB84B", detail:"Cooperatives are the #1 decision influencer in France — no other country comes close. They control blending, logistics, credit, and agronomic advice. The cooperative agronomist is the de facto P product selector for 32% of French farmers." },
    { label:"Agronomists / Technical advisors", pct:26, color:"#2DB84B", detail:"Cooperative agronomists overlap heavily with the cooperative channel — they are the technical gatekeepers within the coop structure. Winning their recommendation is the single most scalable commercial lever available to OCP in France." },
    { label:"Own decision", pct:18, color:"#a78bfa", detail:"Only 18% of French farmers decide alone — concentrated in large farms (>200ha), Consolidators and Precision Pioneers. These farmers can be approached directly and respond to agronomic data and bulk commercial terms." },
    { label:"Peer farmers", pct:15, color:"#f59e0b", detail:"Peer influence operates through local agricultural networks and field day observations. Reference farms producing visible yield results create pull-through demand in their local coop zone." },
    { label:"Traders", pct:10, color:"#6B8F72", detail:"Traders matter for commodity NPK. For differentiated P products like TSP, their influence is limited — they lack the agronomic credibility to recommend a separation program." },
  ];

  const p2o5Chart = FARMER_PERSONAS.map(p=>({name:p.nickname.replace("The ",""),value:p.p2o5KgHa,fill:p.color}));

  // ─ STEP STATE for drivers experience
  const [driverStep, setDriverStep] = useState(0); // 0=overview 1=explore 2=influence 3=implication
  const [activeDriver, setActiveDriver] = useState(null);
  const [activeInfluencer, setActiveInfluencer] = useState(null);
  const [viewMetric, setViewMetric] = useState("importance"); // importance | wtp

  // ── GATEWAY ──────────────────────────────────────────────────────────────────
  if (!topic) return (
    <div style={{ display:"flex", flexDirection:"column", gap:40, paddingTop:8 }}>
      <div>
        <p style={{ color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.16em", fontWeight:600, marginBottom:12 }}>Farmer Behaviour · {region}</p>
        <h2 style={{ color:"#0F2415", fontSize:26, fontWeight:700, letterSpacing:"-0.025em", lineHeight:1.25, margin:0 }}>What do you want to know about the farmer?</h2>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
        {[
          {
            key:"drivers",
            num:"01",
            color:"#2DB84B",
            title:"Decision Drivers",
            desc:"What criteria determine which fertilizer product a French farmer buys — and how much they will pay for better performance.",
            src:"Simon-Kucher × OCP Voice of Customer",
            available:true,
          },
          {
            key:"premium",
            num:"02",
            color:"#2DB84B",
            title:"Premium Acceptance",
            desc:"Willingness-to-pay analysis by performance attribute — which gains justify a higher price and by how much.",
            src:"Coming soon",
            available:false,
          },
          {
            key:"archetypes",
            num:"03",
            color:"#a78bfa",
            title:"Farmer Archetypes",
            desc:"Six buyer profiles built from farm size, technology adoption, cooperative dependency and P application behaviour.",
            src:"Agreste 2020 census × McKinsey European Farmer Survey × FADN",
            available:true,
          },
        ].map(card=>(
          <button key={card.key}
            onClick={()=>card.available&&setTopic(card.key)}
            style={{ background:"#FFFFFF", border:`1px solid ${card.available?"#D6E8DA":"#111827"}`,
              borderRadius:12, padding:"28px 24px", cursor:card.available?"pointer":"default",
              textAlign:"left", transition:"border-color 0.15s, transform 0.15s", opacity:card.available?1:0.45,
              display:"flex", flexDirection:"column", gap:0 }}
            onMouseEnter={e=>{if(card.available){e.currentTarget.style.borderColor=card.color+"50";e.currentTarget.style.transform="translateY(-2px)";}}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=card.available?"#D6E8DA":"#111827";e.currentTarget.style.transform="none";}}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <span style={{ color:card.color, fontSize:11, fontWeight:700, letterSpacing:"0.06em", fontFamily:"'DM Mono',monospace" }}>{card.num}</span>
              {!card.available
                ? <span style={{background:"#D6E8DA",color:"#6B8F72",fontSize:9,fontWeight:600,padding:"2px 8px",borderRadius:4,letterSpacing:"0.06em"}}>COMING SOON</span>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={card.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              }
            </div>
            <p style={{ color:card.color, fontSize:11, textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:600, marginBottom:10 }}>{card.title}</p>
            <p style={{ color:"#6B8F72", fontSize:13, lineHeight:1.7, marginBottom:20, flex:1 }}>{card.desc}</p>
            <p style={{ color:"#c8d3e0", fontSize:10, borderTop:"1px solid #D6E8DA", paddingTop:14, marginTop:"auto" }}>{card.src}</p>
          </button>
        ))}
      </div>
    </div>
  );

  // ── ARCHETYPES ───────────────────────────────────────────────────────────────
  if (topic==="archetypes") return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <button onClick={()=>setTopic(null)} style={{ background:"transparent",border:"none",color:"#6B8F72",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </button>
        <div style={{width:1,height:14,background:"#D6E8DA"}}/>
        <p style={{ color:"#a78bfa", fontSize:10, textTransform:"uppercase", letterSpacing:"0.12em", fontWeight:600, margin:0 }}>Farmer Archetypes · France · 6 profiles</p>
        <p style={{ color:"#c8d3e0", fontSize:10, margin:0 }}>Agreste 2020 × McKinsey European Farmer Survey 2024 × FADN</p>
      </div>

      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {FARMER_PERSONAS.map(p=>(
          <button key={p.id} onClick={()=>setActivePersona(p.id)}
            style={{ padding:"8px 16px", borderRadius:6, cursor:"pointer",
              background:activePersona===p.id?p.color+"20":"transparent",
              border:`1px solid ${activePersona===p.id?p.color:"#D6E8DA"}`,
              color:activePersona===p.id?p.color:"#6B8F72",
              fontSize:12, fontWeight:activePersona===p.id?700:400, transition:"all 0.15s" }}>
            {p.nickname} <span style={{opacity:0.7}}>·</span> <span style={{fontFamily:"'DM Mono',monospace"}}>{p.share}%</span>
          </button>
        ))}
      </div>

      <div style={{ display:"flex", gap:8, marginTop:4 }}>
        {[["grid","Overview"],["detail","Deep Dive"]].map(([k,l])=>(
          <button key={k} onClick={()=>setViewMode(k)}
            style={{ padding:"5px 14px", borderRadius:6, border:`1px solid ${viewMode===k?"#6B8F72":"#D6E8DA"}`,
              background:"transparent", color:viewMode===k?"#0F2415":"#6B8F72", fontSize:11, cursor:"pointer" }}>
            {l}
          </button>
        ))}
      </div>

      {viewMode==="grid" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div className="chart-grid-2">
            <div className="card">
              <p style={{ color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700, marginBottom:4 }}>P2O5 Applied by Archetype (kg/ha)</p>
              <p style={{ color:"#6B8F72", fontSize:11, marginBottom:10 }}>vs Comifer recommendation: 55 kg/ha</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={p2o5Chart} layout="vertical" margin={{ left:90, right:20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D6E8DA" horizontal={false}/>
                  <XAxis type="number" domain={[0,60]} tick={{ fill:"#6B8F72", fontSize:9 }}/>
                  <YAxis type="category" dataKey="name" tick={{ fill:"#6B8F72", fontSize:10 }} width={90}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <ReferenceLine x={55} stroke="#f59e0b60" strokeDasharray="4 4" label={{ value:"Rec.", fill:"#f59e0b", fontSize:9 }}/>
                  <Bar dataKey="value" name="P2O5 kg/ha" radius={[0,4,4,0]}>{p2o5Chart.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <p style={{ color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700, marginBottom:10 }}>Segment Share (%)</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={FARMER_PERSONAS.map(p=>({name:p.nickname,value:p.share,color:p.color}))} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" paddingAngle={2}>
                    {FARMER_PERSONAS.map((p,i)=><Cell key={i} fill={p.color}/>)}
                  </Pie>
                  <Tooltip formatter={(v,n)=>[`${v}%`,n]}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 12px" }}>
                {FARMER_PERSONAS.map((p,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <div style={{ width:6,height:6,borderRadius:1,background:p.color }}/>
                    <span style={{ color:"#6B8F72", fontSize:10 }}>{p.nickname.replace("The ","")} {p.share}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(265px,1fr))", gap:10 }}>
            {FARMER_PERSONAS.map((p,i)=>(
              <div key={i} onClick={()=>{setActivePersona(p.id);setViewMode("detail");}}
                style={{ background:"#FFFFFF", border:`1px solid #D6E8DA`, borderTop:`2px solid ${p.color}`, borderRadius:10, padding:"16px", cursor:"pointer", transition:"border-color 0.15s" }}
                onMouseEnter={e=>e.currentTarget.style.borderColor=p.color+"40"}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#D6E8DA";e.currentTarget.style.borderTopColor=p.color;}}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div>
                    <p style={{ color:p.color, fontSize:13, fontWeight:700, margin:"0 0 2px" }}>{p.nickname}</p>
                    <p style={{ color:"#6B8F72", fontSize:10, fontStyle:"italic", margin:0 }}>{p.tagline}</p>
                  </div>
                  <p style={{ color:p.color, fontSize:19, fontWeight:800, fontFamily:"'DM Mono',monospace", margin:0 }}>{p.share}%</p>
                </div>
                <p style={{ color:"#6B8F72", fontSize:11, lineHeight:1.65, marginBottom:10 }}>{p.description.slice(0,105)}…</p>
                <div style={{ display:"flex", justifyContent:"space-between", borderTop:"1px solid #D6E8DA", paddingTop:10 }}>
                  <span style={{ color:"#6B8F72", fontSize:10 }}>P applied: <span style={{ color:p.color, fontFamily:"'DM Mono',monospace" }}>{p.p2o5KgHa} kg/ha</span></span>
                  <span style={{ color:"#6B8F72", fontSize:10 }}>€{p.fertSpend}/ha</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode==="detail" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:`linear-gradient(135deg,${persona.color}10,#FFFFFF)`, border:`1px solid ${persona.color}25`, borderRadius:14, padding:"24px" }}>
            <div style={{ display:"flex", alignItems:"flex-start", gap:20, flexWrap:"wrap" }}>
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <h2 style={{ color:persona.color, fontSize:20, fontWeight:800, margin:0 }}>{persona.nickname}</h2>
                  <span style={{ padding:"2px 10px", background:persona.color+"20", color:persona.color, borderRadius:4, fontSize:10, fontWeight:700 }}>{persona.share}% of French farmers</span>
                </div>
                <p style={{ color:"#6B8F72", fontSize:12, fontStyle:"italic", marginBottom:10 }}>"{persona.tagline}"</p>
                <p style={{ color:"#2C4A33", fontSize:12, lineHeight:1.8, margin:0 }}>{persona.description}</p>
              </div>
              <div style={{ background:"#FFFFFF", border:`1px solid ${persona.color}20`, borderRadius:10, padding:"14px 18px", minWidth:200 }}>
                <p style={{ color:"#6B8F72", fontSize:9, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>OCP Opportunity</p>
                <p style={{ color:"#2C4A33", fontSize:11, lineHeight:1.75 }}>{persona.ocpOpportunity}</p>
              </div>
            </div>
          </div>
          <div className="chart-grid-2">
            <div className="card">
              <p style={{ color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700, marginBottom:14 }}>Behavioral Profile</p>
              <PersonaRadar persona={persona}/>
              <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:4 }}>
                <ScoreBar label="Price Sensitivity"   val={persona.priceScore}     color="#f43f5e"/>
                <ScoreBar label="Agronomy Focus"      val={persona.agronomyScore}  color="#2DB84B"/>
                <ScoreBar label="Innovation"           val={persona.innovationScore} color="#2DB84B"/>
                <ScoreBar label="Sustainability"       val={persona.sustainScore}   color="#a78bfa"/>
                <ScoreBar label="Coop Loyalty"         val={persona.coopScore}      color="#f59e0b"/>
                <ScoreBar label="Digital Adoption"     val={persona.digitalScore}   color="#6B8F72"/>
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div className="card">
                <p style={{ color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700, marginBottom:12 }}>Profile Facts</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                  {[["Farm size",persona.farmSize],["Age range",persona.age],["Region",persona.region],["Tenure",persona.tenure],["Structure",persona.structure],["Channel",persona.channel]].map(([k,v])=>(
                    <div key={k} style={{ background:"#F3F8F4", borderRadius:6, padding:"8px 10px" }}>
                      <p style={{ color:"#6B8F72", fontSize:9, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:2 }}>{k}</p>
                      <p style={{ color:"#2C4A33", fontSize:11, fontWeight:500 }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <p style={{ color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700, marginBottom:8 }}>Fertilizer Decision Logic</p>
                <p style={{ color:persona.color, fontSize:10, fontWeight:700, marginBottom:4 }}>Driver: {persona.decisionDriver}</p>
                <p style={{ color:"#6B8F72", fontSize:11, lineHeight:1.7 }}>{persona.fertiliserBehavior}</p>
              </div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))", gap:8 }}>
            {persona.stats.map((s,i)=>(
              <div key={i} style={{ background:"#FFFFFF", border:"1px solid #D6E8DA", borderRadius:8, padding:"12px" }}>
                <p style={{ color:"#6B8F72", fontSize:9, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>{s.label}</p>
                <p style={{ color:persona.color, fontSize:15, fontWeight:800, fontFamily:"'DM Mono',monospace", margin:0 }}>{s.value}</p>
                <p style={{ color:"#6B8F72", fontSize:9, marginTop:3 }}>{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── DECISION DRIVERS — INTERACTIVE EXPLORATION ────────────────────────────────
  if (topic==="drivers") {
    const STEPS = [
      { id:"overview",   label:"What matters" },
      { id:"explore",    label:"Explore each driver" },
      { id:"influence",  label:"Who decides" },
      { id:"implication",label:"OCP implication" },
    ];

    // Sorted drivers for display
    const sortedDrivers = [...DECISION_DRIVERS].sort((a,b)=>b.surveyScore-a.surveyScore);

    return (
      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

        {/* Back + breadcrumb */}
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <button onClick={()=>{setTopic(null);setDriverStep("overview");setActiveDriver(null);}}
            style={{ background:"transparent",border:"none",color:"#6B8F72",fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6,padding:0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>
          <div style={{width:1,height:14,background:"#D6E8DA"}}/>
          <p style={{ color:"#2DB84B", fontSize:10, textTransform:"uppercase", letterSpacing:"0.12em", fontWeight:600, margin:0 }}>Farmer Decision Drivers · France</p>
          <p style={{ color:"#c8d3e0", fontSize:10, margin:0 }}>Source: Simon-Kucher × OCP Nutricrops Voice of Customer</p>
        </div>

        {/* Step navigator */}
        <div style={{ display:"flex", gap:0, background:"#FFFFFF", border:"1px solid #D6E8DA", borderRadius:10, padding:4, width:"fit-content" }}>
          {STEPS.map((s,i)=>{
            const active = driverStep===s.id;
            const done = STEPS.indexOf(STEPS.find(x=>x.id===driverStep)) > i;
            return (
              <button key={s.id} onClick={()=>{setDriverStep(s.id);setActiveDriver(null);}}
                style={{ padding:"8px 18px", borderRadius:7, border:"none", cursor:"pointer", transition:"all 0.15s",
                  background:active?"#2DB84B20":"transparent",
                  color:active?"#2DB84B":done?"#6B8F72":"#9BB5A0",
                  fontSize:12, fontWeight:active?700:400,
                  borderRight: i<STEPS.length-1?"1px solid #D6E8DA":"none" }}>
                <span style={{ color:done&&!active?"#2DB84B40":active?"#2DB84B":"#D6E8DA", fontSize:10, marginRight:6, fontFamily:"'DM Mono',monospace" }}>{String(i+1).padStart(2,"0")}</span>
                {s.label}
              </button>
            );
          })}
        </div>

        {/* ── STEP 1: OVERVIEW ── */}
        {driverStep==="overview" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ background:"#FFFFFF", border:"1px solid #D6E8DA", borderRadius:12, padding:"24px" }}>
              <p style={{ color:"#0F2415", fontSize:15, fontWeight:700, marginBottom:16, lineHeight:1.4 }}>
                French farmers rank <span style={{color:"#2DB84B"}}>total program cost per hectare</span> as their #1 purchase driver — not price per bag, not brand, not sustainability.
              </p>
              <p style={{ color:"#6B8F72", fontSize:13, lineHeight:1.8, marginBottom:0 }}>
                Agronomic performance comes immediately after: phosphorus efficiency, granule quality, and yield gain all score above 4.4 out of 5. Price per bag only ranks third. Sustainability scores last. The commercial implication is clear — the conversation must be framed at program economics, backed by agronomic proof.
              </p>
            </div>

            {/* Toggle: importance vs WTP */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <p style={{ color:"#6B8F72", fontSize:11, fontWeight:600, margin:0 }}>
                {viewMetric==="importance" ? "Purchase criteria ranked by importance score (1–5)" : "% of farmers who would accept a higher price if performance improved"}
              </p>
              <div style={{ display:"flex", gap:0, background:"#FFFFFF", border:"1px solid #D6E8DA", borderRadius:7, padding:3 }}>
                {[["importance","Importance"],["wtp","Willingness to Pay"]].map(([k,l])=>(
                  <button key={k} onClick={()=>setViewMetric(k)}
                    style={{ padding:"5px 14px", borderRadius:5, border:"none", cursor:"pointer", transition:"all 0.12s",
                      background:viewMetric===k?"#2DB84B20":"transparent",
                      color:viewMetric===k?"#2DB84B":"#6B8F72", fontSize:11, fontWeight:viewMetric===k?700:400 }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Unified ranking visual */}
            <div style={{ background:"#FFFFFF", border:"1px solid #D6E8DA", borderRadius:12, overflow:"hidden" }}>
              {sortedDrivers.map((d,i)=>{
                const val = viewMetric==="importance" ? d.surveyScore : d.wtpPremium;
                const maxVal = viewMetric==="importance" ? 5 : 60;
                const pct = val ? (val/maxVal)*100 : 0;
                const isActive = activeDriver===d.id;
                const groupColor = d.group==="Program Economics"?"#2DB84B":d.group==="Agronomic Performance"?"#f59e0b":d.group==="Price"?"#a78bfa":d.group==="Sustainability"?"#818cf8":"#6B8F72";

                return (
                  <div key={d.id}>
                    <div onClick={()=>setActiveDriver(isActive?null:d.id)}
                      style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 20px",
                        background:isActive?"#0a1628":"transparent",
                        borderBottom:"1px solid #E8F2EA",
                        cursor:"pointer", transition:"background 0.12s" }}
                      onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background="#F7F9F7";}}
                      onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background="transparent";}}>

                      <span style={{ color:"#c8d3e0", fontSize:10, width:18, flexShrink:0, fontFamily:"'DM Mono',monospace", fontWeight:700 }}>#{i+1}</span>

                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ color:"#2C4A33", fontSize:12, fontWeight:500, margin:0 }}>{d.label}</p>
                        <span style={{ display:"inline-block", marginTop:3, padding:"1px 7px", background:groupColor+"15", color:groupColor, fontSize:9, fontWeight:600, borderRadius:3, letterSpacing:"0.04em" }}>{d.group}</span>
                      </div>

                      <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0, width:200 }}>
                        <div style={{ flex:1, height:4, background:"#D6E8DA", borderRadius:2, overflow:"hidden" }}>
                          {val && <div style={{ height:"100%", width:`${pct}%`, background:isActive?"#2DB84B":d.accentColor, borderRadius:2, transition:"width 0.3s" }}/>}
                        </div>
                        <span style={{ color:isActive?"#2DB84B":d.accentColor, fontSize:13, fontWeight:700, fontFamily:"'DM Mono',monospace", width:36, textAlign:"right" }}>
                          {viewMetric==="importance" ? d.surveyScore : (d.wtpPremium ? d.wtpPremium+"%" : "—")}
                        </span>
                      </div>

                      <svg style={{ color:"#D6E8DA", flexShrink:0, transition:"transform 0.15s", transform:isActive?"rotate(90deg)":"none" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                    </div>

                    {isActive && (
                      <div style={{ padding:"16px 52px 16px 52px", background:"#F7F9F7", borderBottom:"1px solid #E8F2EA" }}>
                        <p style={{ color:"#6B8F72", fontSize:12, lineHeight:1.75, marginBottom:10 }}>{d.insight}</p>
                        <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                          <div style={{ width:3, height:"100%", minHeight:40, background:d.accentColor, borderRadius:2, flexShrink:0, alignSelf:"stretch" }}/>
                          <div>
                            <p style={{ color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600, marginBottom:4 }}>OCP implication</p>
                            <p style={{ color:"#2C4A33", fontSize:12, lineHeight:1.75 }}>{d.ocpAngle}</p>
                          </div>
                        </div>
                        <button onClick={()=>{setDriverStep("explore");setActiveDriver(d.id);}}
                          style={{ marginTop:12, background:"transparent", border:"1px solid #D6E8DA", color:"#6B8F72", borderRadius:6, padding:"6px 14px", fontSize:11, cursor:"pointer" }}>
                          Explore this driver in detail →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button onClick={()=>setDriverStep("explore")}
              style={{ alignSelf:"flex-end", display:"flex", alignItems:"center", gap:8, background:"#2DB84B15", border:"1px solid #2DB84B30", color:"#2DB84B", borderRadius:8, padding:"10px 20px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
              Explore each driver
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        )}

        {/* ── STEP 2: EXPLORE ── */}
        {driverStep==="explore" && (
          <div style={{ display:"flex", gap:14 }}>
            {/* Sidebar selector */}
            <div style={{ width:220, flexShrink:0, display:"flex", flexDirection:"column", gap:2 }}>
              <p style={{ color:"#6B8F72", fontSize:9, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8, fontWeight:600 }}>Select a driver</p>
              {sortedDrivers.map((d,i)=>{
                const isActive = activeDriver===d.id;
                return (
                  <button key={d.id} onClick={()=>setActiveDriver(d.id)}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:7,
                      background:isActive?"#0a1628":"transparent",
                      border:`1px solid ${isActive?"#2DB84B30":"transparent"}`,
                      cursor:"pointer", textAlign:"left", transition:"all 0.12s" }}
                    onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background="#F7F9F7";}}
                    onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background="transparent";}}>
                    <div style={{ width:4, height:4, borderRadius:"50%", background:d.accentColor, flexShrink:0 }}/>
                    <p style={{ color:isActive?"#0F2415":"#6B8F72", fontSize:11, margin:0, flex:1 }}>{d.label}</p>
                    <span style={{ color:d.accentColor, fontSize:10, fontFamily:"'DM Mono',monospace", fontWeight:700 }}>{d.surveyScore}</span>
                  </button>
                );
              })}
            </div>

            {/* Detail panel */}
            <div style={{ flex:1, minWidth:0 }}>
              {!activeDriver ? (
                <div style={{ background:"#FFFFFF", border:"1px solid #D6E8DA", borderRadius:12, padding:"40px", display:"flex", alignItems:"center", justifyContent:"center", minHeight:300 }}>
                  <p style={{ color:"#c8d3e0", fontSize:13 }}>Select a driver from the list to explore its details.</p>
                </div>
              ) : (()=>{
                const d = DECISION_DRIVERS.find(x=>x.id===activeDriver);
                if (!d) return null;
                const importancePct = (d.surveyScore/5)*100;
                const wtpPct = d.wtpPremium || 0;
                const wtpBand = d.wtpPremium>=60?"High — strong premium acceptance":d.wtpPremium>=40?"Moderate — performance must be proven":d.wtpPremium?"Low — not a premium lever yet":"—";
                const wtpBandColor = d.wtpPremium>=60?"#2DB84B":d.wtpPremium>=40?"#f59e0b":d.wtpPremium?"#f43f5e":"#6B8F72";

                return (
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <div style={{ background:"#FFFFFF", border:`1px solid ${d.accentColor}25`, borderRadius:12, padding:"24px" }}>
                      <p style={{ color:"#6B8F72", fontSize:9, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>{d.group}</p>
                      <h3 style={{ color:"#0F2415", fontSize:17, fontWeight:700, margin:"0 0 16px", letterSpacing:"-0.02em" }}>{d.label}</h3>
                      <p style={{ color:"#6B8F72", fontSize:13, lineHeight:1.8, margin:0 }}>{d.insight}</p>
                    </div>

                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                      <div style={{ background:"#FFFFFF", border:"1px solid #D6E8DA", borderRadius:10, padding:"20px" }}>
                        <p style={{ color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Importance score</p>
                        <p style={{ color:d.accentColor, fontSize:32, fontWeight:800, fontFamily:"'DM Mono',monospace", margin:"0 0 12px" }}>{d.surveyScore}<span style={{ fontSize:14, color:"#c8d3e0", fontWeight:400 }}> / 5</span></p>
                        <div style={{ height:6, background:"#D6E8DA", borderRadius:3, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${importancePct}%`, background:d.accentColor, borderRadius:3 }}/>
                        </div>
                      </div>
                      <div style={{ background:"#FFFFFF", border:"1px solid #D6E8DA", borderRadius:10, padding:"20px" }}>
                        <p style={{ color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>WTP for premium</p>
                        {d.wtpPremium ? (
                          <>
                            <p style={{ color:wtpBandColor, fontSize:32, fontWeight:800, fontFamily:"'DM Mono',monospace", margin:"0 0 4px" }}>{d.wtpPremium}%</p>
                            <p style={{ color:wtpBandColor, fontSize:10, fontWeight:600, margin:"0 0 8px" }}>{wtpBand}</p>
                            <div style={{ height:6, background:"#D6E8DA", borderRadius:3, overflow:"hidden" }}>
                              <div style={{ height:"100%", width:`${wtpPct}%`, background:wtpBandColor, borderRadius:3 }}/>
                            </div>
                          </>
                        ) : (
                          <p style={{ color:"#c8d3e0", fontSize:13, marginTop:6 }}>Not measured — price sensitivity tracked separately.</p>
                        )}
                      </div>
                    </div>

                    <div style={{ background:"#FFFFFF", border:`1px solid ${d.accentColor}20`, borderLeft:`3px solid ${d.accentColor}`, borderRadius:"0 10px 10px 0", padding:"18px 20px" }}>
                      <p style={{ color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>OCP commercial implication</p>
                      <p style={{ color:"#0F2415", fontSize:13, lineHeight:1.8, margin:0 }}>{d.ocpAngle}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ── STEP 3: INFLUENCE ── */}
        {driverStep==="influence" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ background:"#FFFFFF", border:"1px solid #D6E8DA", borderRadius:12, padding:"24px" }}>
              <p style={{ color:"#0F2415", fontSize:15, fontWeight:700, marginBottom:12, lineHeight:1.4 }}>
                In France, <span style={{color:"#2DB84B"}}>57% of fertilizer decisions</span> are controlled by cooperatives and their agronomists — no other country in the survey comes close.
              </p>
              <p style={{ color:"#6B8F72", fontSize:13, lineHeight:1.8 }}>
                Local distributors and retailers account for 0% of influence in France, compared to 22% in India. This makes France a country where OCP must operate through the cooperative channel — not around it.
              </p>
            </div>

            <p style={{ color:"#6B8F72", fontSize:11, margin:0 }}>Click an influencer to see the commercial implication for OCP.</p>

            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {INFLUENCERS.map((inf,i)=>{
                const isActive = activeInfluencer===i;
                return (
                  <div key={i} onClick={()=>setActiveInfluencer(isActive?null:i)}
                    style={{ background:isActive?"#0a1628":"#FFFFFF", border:`1px solid ${isActive?"#2DB84B30":"#D6E8DA"}`, borderRadius:10, overflow:"hidden", cursor:"pointer", transition:"all 0.15s" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 20px" }}>
                      <div style={{ width:32, flexShrink:0 }}>
                        <p style={{ color:inf.color, fontSize:18, fontWeight:800, fontFamily:"'DM Mono',monospace", margin:0, lineHeight:1 }}>{inf.pct}%</p>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ height:6, background:"#D6E8DA", borderRadius:3, overflow:"hidden", marginBottom:6 }}>
                          <div style={{ height:"100%", width:`${inf.pct*2}%`, background:inf.color, borderRadius:3 }}/>
                        </div>
                        <p style={{ color:isActive?"#0F2415":"#2C4A33", fontSize:13, fontWeight:isActive?700:500, margin:0 }}>{inf.label}</p>
                      </div>
                      <svg style={{ color:"#D6E8DA", transition:"transform 0.15s", transform:isActive?"rotate(90deg)":"none" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                    {isActive && (
                      <div style={{ padding:"0 20px 18px 66px", borderTop:"1px solid #D6E8DA" }}>
                        <p style={{ color:"#6B8F72", fontSize:12, lineHeight:1.8, marginTop:14 }}>{inf.detail}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button onClick={()=>setDriverStep("implication")}
              style={{ alignSelf:"flex-end", display:"flex", alignItems:"center", gap:8, background:"#2DB84B15", border:"1px solid #2DB84B30", color:"#2DB84B", borderRadius:8, padding:"10px 20px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
              See OCP implication
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        )}

        {/* ── STEP 4: OCP IMPLICATION ── */}
        {driverStep==="implication" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ background:"#FFFFFF", border:"1px solid #D6E8DA", borderRadius:12, padding:"24px" }}>
              <p style={{ color:"#2DB84B", fontSize:10, textTransform:"uppercase", letterSpacing:"0.12em", fontWeight:700, marginBottom:12 }}>Strategic read-out for OCP Nutricrops · France</p>
              <p style={{ color:"#0F2415", fontSize:15, fontWeight:700, lineHeight:1.5, marginBottom:0 }}>
                The data points to one route: win the cooperative agronomist first, then frame the TSP program around total €/ha cost and P efficiency — not price per tonne.
              </p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {[
                { num:"01", color:"#2DB84B", title:"Cooperatives gate the decision", body:"31% of decisions go through cooperatives — the highest of any country surveyed. Access at the coop level is not a distribution strategy, it is the only strategy that reaches scale in France." },
                { num:"02", color:"#2DB84B", title:"Frame everything as program €/ha", body:"Total cost per hectare is the #1 purchase criterion. Every commercial interaction must anchor on what the full TSP+N program costs vs a standard NPK program — not what TSP costs per tonne." },
                { num:"03", color:"#f59e0b", title:"Agronomic proof unlocks WTP", body:"Yield gain and P efficiency both carry 55% WTP premium if better performance is demonstrated. ARVALIS field trials and cooperative demonstration plots are the required proof vehicle." },
                { num:"04", color:"#a78bfa", title:"Sustainability is a future asset", body:"Only 3.0 importance score today. Target HVE-certified farms as early reference customers. Do not lead with carbon positioning for the mainstream audience — it costs credibility." },
              ].map((item,i)=>(
                <div key={i} style={{ background:"#FFFFFF", border:"1px solid #D6E8DA", borderRadius:10, padding:"20px", borderTop:`2px solid ${item.color}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                    <span style={{ color:item.color, fontSize:10, fontWeight:700, fontFamily:"'DM Mono',monospace" }}>{item.num}</span>
                  </div>
                  <p style={{ color:"#0F2415", fontSize:13, fontWeight:600, marginBottom:8 }}>{item.title}</p>
                  <p style={{ color:"#6B8F72", fontSize:12, lineHeight:1.75, margin:0 }}>{item.body}</p>
                </div>
              ))}
            </div>

            <div style={{ background:"linear-gradient(135deg,#0a1f14,#FFFFFF)", border:"1px solid #2DB84B25", borderRadius:12, padding:"20px 24px" }}>
              <p style={{ color:"#2DB84B", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>The sequenced entry play</p>
              <div style={{ display:"flex", gap:0, alignItems:"stretch" }}>
                {[
                  { step:"1", label:"Cooperative agronomist", desc:"Train on P efficiency and TSP program economics. Make them the internal champion." },
                  { step:"2", label:"Demonstration program", desc:"Co-fund on-farm trials with Chambres d'Agriculture. Produce visible, measurable yield results." },
                  { step:"3", label:"Program pricing pitch", desc:"Present total program cost to farmer. Coop agronomist validates. Farmer signs." },
                  { step:"4", label:"Scale through coop", desc:"Replicate in adjacent zones via the same coop structure. Resistance is minimal once agronomist is aligned." },
                ].map((s,i,arr)=>(
                  <div key={i} style={{ flex:1, display:"flex", flexDirection:"column" }}>
                    <div style={{ display:"flex", alignItems:"center", marginBottom:12 }}>
                      <div style={{ width:28,height:28,borderRadius:"50%",background:"#2DB84B18",border:"1px solid #2DB84B30",display:"flex",alignItems:"center",justifyContent:"center",color:"#2DB84B",fontSize:11,fontWeight:700,flexShrink:0 }}>{s.step}</div>
                      {i<arr.length-1&&<div style={{flex:1,height:1,background:"#2DB84B20",margin:"0 8px"}}/>}
                    </div>
                    <p style={{ color:"#0F2415", fontSize:11, fontWeight:600, marginBottom:4 }}>{s.label}</p>
                    <p style={{ color:"#6B8F72", fontSize:11, lineHeight:1.6 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  return null;
}


// ─── MODEL COEFFICIENTS ───────────────────────────────────────────────────────
// Source: log-log OLS models estimated on FADN France panel (df_model_profit)
// Model 1: log_output_per_ha ~ inputs + factor(Region) + factor(farming_type) + factor(Year)
// Model 2: log_fni_per_ha   ~ inputs + factor(Region) + factor(farming_type) + factor(Year)

const MODEL1 = {
  // Source: log-log OLS trained on FADN France panel (df_model_profit, n=909)
  // Reference categories: region = Île-de-France, farming_type = (1) Fieldcrops, year = 2014
  intercept: 0.436,
  rSquared:  0.993,
  elasticities: {
    fertilisers:  { coef: 0.0795, se: 0.0124, sig: "***", label: "Fertilizers" },
    wages:        { coef: 0.0702, se: 0.0077, sig: "***", label: "Labour" },
    depreciation: { coef: 0.1046, se: 0.0208, sig: "***", label: "Machinery" },
    intermediate: { coef: 0.8182, se: 0.0207, sig: "***", label: "Seeds & crop protection" },
  },
  regions: {
    "Île-de-France":                     0,
    "(131) Champagne-Ardenne":           0.0291,
    "(132) Picardie":                    0.0017,
    "(133) Haute-Normandie":            -0.0288,
    "(134) Centre":                     -0.0863,
    "(135) Basse-Normandie":            -0.0171,
    "(136) Bourgogne":                   0.0041,
    "(141) Nord-Pas-de-Calais":         -0.0339,
    "(151) Lorraine":                   -0.0280,
    "(152) Alsace":                     -0.0346,
    "(153) Franche-Comté":               0.0109,
    "(162) Pays de la Loire":           -0.0560,
    "(163) Bretagne":                    0.0019,
    "(164) Poitou-Charentes":           -0.0622,
    "(182) Aquitaine":                  -0.1721,
    "(183) Midi-Pyrénées":              -0.0987,
    "(184) Limousin":                   -0.0389,
    "(192) Rhône-Alpes":                -0.0613,
    "(193) Auvergne":                   -0.0256,
    "(201) Languedoc-Roussillon":       -0.1290,
    "(203) Provence-Alpes-Côte d'Azur": -0.0814,
    "(204) Corse":                      -0.1020,
    "(205) Guadeloupe":                 -0.1536,
    "(206) Martinique":                 -0.0010,
    "(207) La Réunion":                 -0.1631,
  },
  farmingTypes: {
    "(1) Fieldcrops":              0,
    "(2) Horticulture":            0.0239,
    "(3) Wine":                    0.3328,
    "(4) Other permanent crops":   0.1975,
    "(5) Milk":                    0.0049,
    "(6) Other grazing livestock": -0.0171,
    "(7) Granivores":              -0.0041,
    "(8) Mixed":                   -0.0303,
  },
  years: {
    2014: 0, 2015: 0.0171, 2016: 0.0291, 2017: 0.0340,
    2018: 0.0265, 2019: 0.0243, 2020: 0.0056,
    2021: 0.0404, 2022: 0.0323, 2023: -0.0530,
  },
};

// const MODEL2 = {
//   intercept: -1.440197,
//   elasticities: {
//     fertilisers:   { coef: 0.489567, se: 0.099927, sig: "***", label: "Fertilizers" },
//     wages:         { coef: 0.114168, se: 0.061751, sig: "",    label: "Labour" },
//     depreciation:  { coef:-0.511779, se: 0.167614, sig: "***", label: "Depreciation" },
//     intermediate:  { coef: 0.953344, se: 0.166846, sig: "***", label: "Intermediate inputs" },
//   },
//   regions: {
//     "Champagne-Ardenne":          0.000000,
//     "Picardie":                   0.052013,
//     "Haute-Normandie":           -0.007706,
//     "Centre":                    -0.572507,
//     "Basse-Normandie":           -0.092901,
//     "Bourgogne":                 -0.381785,
//     "Nord-Pas-de-Calais":        -0.048827,
//     "Lorraine":                  -0.568408,
//     "Alsace":                    -0.172486,
//     "Franche-Comté":             -0.244064,
//     "Pays de la Loire":          -0.237046,
//     "Bretagne":                   0.217626,
//     "Poitou-Charentes":          -0.735575,
//     "Aquitaine":                 -1.244187,
//     "Midi-Pyrénées":             -0.922328,
//     "Limousin":                  -0.504611,
//     "Rhône-Alpes":               -0.622993,
//     "Auvergne":                  -0.249003,
//     "Languedoc-Roussillon":      -0.738922,
//     "Provence-Alpes-Côte d'Azur": -0.612950,
//     "Corse":                     -0.749503,
//   },
//   regionSig: {
//     "Centre":"*","Lorraine":"*","Poitou-Charentes":"***","Aquitaine":"***",
//     "Midi-Pyrénées":"***","Rhône-Alpes":"*","Languedoc-Roussillon":"***",
//     "Provence-Alpes-Côte d'Azur":"*","Corse":"*",
//   },
//   farmingTypes: {
//     "Cereals & field crops":    0.000000,
//     "Horticulture":             0.594899,
//     "Wine":                     1.982972,
//     "Other permanent crops":    1.077548,
//     "Milk":                     0.150015,
//     "Other grazing livestock": -0.017115,
//     "Granivores":               0.448912,
//     "Mixed":                   -0.240481,
//   },
//   farmingTypeSig: {
//     "Horticulture":"**","Wine":"***","Other permanent crops":"***","Mixed":"*",
//   },
//   years: {
//     2014: 0.000000,
//     2015: 0.052276, 2016: 0.022772, 2017: 0.284229, 2018: 0.208273,
//     2019: 0.284587, 2020: 0.130212, 2021: 0.470946, 2022: 0.464453, 2023: -0.189943,
//   },
//   yearSig: {
//     2017:"**",2018:"*",2019:"**",2021:"***",2022:"***",
//   },
//   rSquared: 0.8075,
// };

// --- QUANTITATIVE ENGINE - VALUE POSITIONING PAGE ---
function QuantitativeEngineValuePage({ onContinue }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 400),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2400),
      setTimeout(() => setPhase(4), 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const regions = [
    { name:"Europe", color:"#2DB84B" },
    { name:"Brazil", color:"#2DB84B" },
    { name:"India", color:"#f59e0b" },
    { name:"Africa", color:"#f43f5e" },
    { name:"LATAM", color:"#a78bfa" },
    { name:"APAC", color:"#5CC96E" },
    { name:"North America", color:"#fb923c" },
  ];

  const bus = [
    { name:"Customization BU", role:"Tailor formulations to real purchasing power and local economics" },
    { name:"Green Solutions BU", role:"Validate environmental claims with field level financial evidence" },
    { name:"Nutrition Solutions BU", role:"Demonstrate the agronomic and economic case for nutrient separation" },
  ];

  return (
    <div style={{
      minHeight:"calc(100vh - 130px)",
      background:"#F7F9F7",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      position:"relative", overflow:"hidden",
      fontFamily:"'DM Sans',sans-serif",
      padding:"40px 32px",
    }}>
      <style>{`
        @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes riseUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lineReveal{ from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .value-cta { transition:all 0.3s ease; }
        .value-cta:hover {
          background:#0F2415 !important;
          color:#F7F9F7 !important;
          box-shadow:0 0 60px rgba(241,245,249,0.2) !important;
          transform:translateY(-2px) !important;
        }
      `}</style>

      <div style={{
        position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
        background:"radial-gradient(ellipse at 30% 40%, rgba(45,184,75,0.04) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(45,184,75,0.03) 0%, transparent 50%)",
      }}/>

      <div style={{ maxWidth:860, width:"100%", zIndex:10 }}>

        <div style={{
          opacity: phase >= 1 ? 1 : 0,
          transform: phase >= 1 ? "none" : "translateY(20px)",
          transition:"opacity 0.8s ease, transform 0.8s ease",
          marginBottom:40,
        }}>
          <p style={{ color:"#2DB84B", fontSize:10, textTransform:"uppercase", letterSpacing:"0.22em", fontWeight:700, margin:"0 0 14px" }}>PhosStratOS · Quantitative Engine</p>
          <h1 style={{ color:"#0F2415", fontSize:"clamp(32px,4vw,50px)", fontWeight:300, letterSpacing:"-0.04em", lineHeight:1.12, margin:"0 0 20px" }}>
            The <span style={{ fontWeight:800 }}>P Doctrine</span> is not a claim that phosphorus separation always wins.
          </h1>
          <p style={{ color:"#6B8F72", fontSize:15, lineHeight:1.85, maxWidth:720, margin:0 }}>
            It is the claim that when a farmer buys phosphorus separately from nitrogen and potassium, the financial outcome is transparent and the input decision is auditable. In some crops and regions, that transparency reveals TSP as the highest margin option. In others, it reveals that a compound product with bundled nitrogen produces better economics because the crop genuinely needs both nutrients at the same time. The engine quantifies which case applies.
          </p>
        </div>

        <div style={{
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? "none" : "translateY(20px)",
          transition:"opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
          marginBottom:32,
        }}>
          <p style={{ color:"#6B8F72", fontSize:11, textTransform:"uppercase", letterSpacing:"0.14em", fontWeight:600, margin:"0 0 14px" }}>Strategic regions</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {regions.map(r => (
              <span key={r.name} style={{
                display:"inline-block", padding:"7px 16px", borderRadius:20,
                background:`${r.color}12`, border:`1.5px solid ${r.color}40`,
                color:r.color, fontSize:12, fontWeight:700, letterSpacing:"0.04em",
              }}>{r.name}</span>
            ))}
          </div>
          <p style={{ color:"#B8D4BE", fontSize:12, lineHeight:1.7, margin:"12px 0 0", maxWidth:700 }}>
            Each region faces a different combination of soil chemistry, nitrogen regulation, crop mix, and farmer purchasing power. The engine does not assume one answer fits all. It computes the answer for each context and presents the honest result, whether or not that result favors separation.
          </p>
        </div>

        <div style={{
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? "none" : "translateY(20px)",
          transition:"opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s",
          marginBottom:32,
        }}>
          <p style={{ color:"#6B8F72", fontSize:11, textTransform:"uppercase", letterSpacing:"0.14em", fontWeight:600, margin:"0 0 14px" }}>Business Units served</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12 }}>
            {bus.map(b => (
              <div key={b.name} style={{
                background:"#FFFFFF", border:"1px solid #D6E8DA", borderRadius:12,
                padding:"16px 18px",
              }}>
                <p style={{ color:"#0F2415", fontSize:13, fontWeight:700, margin:"0 0 6px" }}>{b.name}</p>
                <p style={{ color:"#6B8F72", fontSize:11, lineHeight:1.6, margin:0 }}>{b.role}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? "none" : "translateY(20px)",
          transition:"opacity 0.8s ease 0.5s, transform 0.8s ease 0.5s",
          marginBottom:36,
        }}>
          <p style={{ color:"#6B8F72", fontSize:11, textTransform:"uppercase", letterSpacing:"0.14em", fontWeight:600, margin:"0 0 12px" }}>How the engine works</p>
          <div style={{ background:"#FFFFFF", border:"1px solid #D6E8DA", borderRadius:12, padding:"18px 22px" }}>
            <p style={{ color:"#2C4A33", fontSize:13, lineHeight:1.85, margin:0 }}>
              The engine runs a log-log econometric production model trained on panel data from 909 real French farms observed annually between 2014 and 2023 (FADN France, R² = 0.993). It takes a farm's structural parameters (size, crop, region, tenure structure, farmer age) and computes the revenue, input cost, gross margin, and return on fertilizer investment for every major phosphorus product on the market. TSP is always included as the separation reference, but the engine does not force TSP to rank first. When a crop's nitrogen demand is high enough that the bundled N in MAP or DAP produces a genuine yield advantage, the data shows it. The commercial team gets an honest answer, not a marketing claim.
            </p>
          </div>
        </div>

        <div style={{
          opacity: phase >= 4 ? 1 : 0,
          transform: phase >= 4 ? "none" : "translateY(16px)",
          transition:"opacity 0.8s ease, transform 0.8s ease",
          display:"flex", justifyContent:"center",
        }}>
          <button className="value-cta" onClick={onContinue}
            style={{
              background:"transparent", border:"2px solid #0F2415", color:"#0F2415",
              padding:"16px 44px", borderRadius:4, fontSize:12, fontWeight:800,
              letterSpacing:"0.14em", textTransform:"uppercase", cursor:"pointer",
            }}>
            {"Meet the farmer →"}
          </button>
        </div>
      </div>
    </div>
  );
}


// --- MATHIEU INTRO ---
function MathieuIntroPage({ region, onEnterFarm }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      minHeight:"calc(100vh - 130px)", background:"#F7F9F7",
      display:"flex", alignItems:"center", justifyContent:"center",
      position:"relative", overflow:"hidden",
      fontFamily:"'DM Sans',sans-serif",
    }}>
      <style>{`
        @keyframes breathe  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.01)} }
        @keyframes lineReveal{ from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes riseUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .cta-btn { transition:all 0.3s ease; }
        .cta-btn:hover {
          box-shadow:0 0 60px rgba(241,245,249,0.25) !important;
          transform:translateY(-2px) !important;
        }
      `}</style>

      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
        backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
        backgroundSize:"180px",
      }}/>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:0, background:"radial-gradient(ellipse at center, transparent 40%, rgba(247,249,247,0.7) 100%)" }}/>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:0, maxWidth:1000, width:"100%", padding:"0 40px", zIndex:10, alignItems:"center" }}>
        <div style={{ display:"flex", justifyContent:"center", alignItems:"center", opacity: phase >= 1 ? 1 : 0, transition:"opacity 1s ease" }}>
          <div style={{ position:"relative", width:320, height:420, borderRadius:4, overflow:"hidden", animation: phase >= 1 ? "breathe 6s ease-in-out infinite" : "none", boxShadow:"0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)" }}>
            <img src="/farmer.png" alt="Mathieu" style={{ position:"absolute", top:"-8%", left:"-4%", width:"108%", height:"108%", objectFit:"cover", objectPosition:"center 12%", display:"block", filter:"brightness(0.88) contrast(1.05)" }} onError={e => { e.target.style.display="none"; }}/>
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, transparent 55%, rgba(247,249,247,0.85) 100%)" }}/>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"18px 20px" }}>
              <p style={{ color:"rgba(15,36,21,0.5)", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", margin:"0 0 4px" }}>Champagne-Ardenne · France</p>
              <p style={{ color:"#0F2415", fontSize:18, fontWeight:700, margin:0 }}>Mathieu</p>
            </div>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:28, paddingLeft:48 }}>
          <div style={{ opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? "none" : "translateY(20px)", transition:"opacity 0.9s ease, transform 0.9s ease" }}>
            <p style={{ color:"#6B8F72", fontSize:11, textTransform:"uppercase", letterSpacing:"0.2em", fontWeight:600, margin:"0 0 14px" }}>GMO Business Unit · OCP Nutricrops</p>
            <h1 style={{ color:"#0F2415", fontSize:"clamp(28px,3.5vw,44px)", fontWeight:300, letterSpacing:"-0.03em", lineHeight:1.15, margin:0 }}>
              This is <span style={{ fontWeight:800 }}>Mathieu.</span>
            </h1>
          </div>

          {phase >= 2 && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {[
                { text:"He farms soft wheat in northern France, on land he partly owns and partly rents.", delay:"0s" },
                { text:"Every autumn, he commits capital to a fertilizer program before he knows what the season will bring. Every spring, he watches those costs compound while revenue stays months away.", delay:"0.3s" },
                { text:"The question is whether a different phosphorus strategy would put more money in his pocket at harvest.", delay:"0.6s", accent:true },
              ].map((line, i) => (
                <p key={i} style={{ color: line.accent ? "#2C4A33" : "#6B8F72", fontSize: line.accent ? 16 : 14, fontWeight: line.accent ? 600 : 400, lineHeight:1.75, margin:0, animation:`lineReveal 0.6s ${line.delay} ease both`, opacity:0, fontStyle: line.accent ? "italic" : "normal" }}>{line.text}</p>
              ))}
            </div>
          )}

          {phase >= 2 && (
            <p style={{ color:"#B8D4BE", fontSize:12, lineHeight:1.7, margin:0, animation:"lineReveal 0.6s 1s ease both", opacity:0 }}>
              Built on data from nearly a thousand real French farms, this simulator estimates what each input decision does to Mathieu's output and income in real numbers. You will configure his farm, set his current treatment, and see what happens when he considers phosphorus separation.
            </p>
          )}

          {phase >= 3 && (
            <div style={{ display:"flex", flexDirection:"column", gap:14, animation:"riseUp 0.7s ease both" }}>
              <button className="cta-btn" onClick={onEnterFarm}
                style={{ alignSelf:"flex-start", background:"#0F2415", border:"none", color:"#F7F9F7", padding:"15px 40px", borderRadius:4, fontSize:12, fontWeight:800, letterSpacing:"0.14em", textTransform:"uppercase", cursor:"pointer", boxShadow:"0 0 40px rgba(241,245,249,0.15)" }}>
                {"Enter Mathieu's Farm →"}
              </button>
              <p style={{ color:"#D6E8DA", fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase" }}>FADN France · 909 farms · Log-log production model</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// --- MATHIEU FARM ---
function MathieuFarmPage({ region }) {
  const [phase, setPhase] = useState("configure");
  const [farmSize, setFarmSize] = useState(120);
  const [simRegion, setSimRegion] = useState("(131) Champagne-Ardenne");
  const [crop, setCrop] = useState("wheat");
  const [farmerAge, setFarmerAge] = useState(42);
  const [ownedPct, setOwnedPct] = useState(65);
  const [farmType, setFarmType] = useState("(1) Fieldcrops");
  const [currentFerts, setCurrentFerts] = useState([]);
  const [tspNRate, setTspNRate] = useState(null); // kg N/ha paired with TSP; null = use crop default
  const [showBS, setShowBS] = useState(false);
  const [showPL, setShowPL] = useState(false);
  const [showParams, setShowParams] = useState(true);
  const [marginZoom, setMarginZoom] = useState(null);
  const [costZoom, setCostZoom] = useState(null);
  const [outputZoom, setOutputZoom] = useState(null);
  const [cashZoom, setCashZoom] = useState(null);

  // Drag-select zoom state (must be before any early return — Rules of Hooks)
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [activeChart, setActiveChart] = useState(null);

  if (region !== "France") return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:400 }}>
      <p style={{ color:"#6B8F72" }}>Select France to run this simulation.</p>
    </div>
  );

  const CROPS = [
    { id:"wheat", label:"Soft wheat", pDemand:"high", nDemand:"high", icon:"\u{1F33E}", revenuePerHa:1850,
      cropNReq:180, // ARVALIS: 160-200 kg N/ha for winter wheat
      note:"DAP and MAP benefit from N+P co-location at tillering. TSP competitive but not dominant.",
      yieldModByFert:{ TSP:0.97, MAP:1.00, NPS:0.91, DAP:0.99, NPK1:0.89, NPK2:0.84, NPK3:0.93 },
      decayModByFert:{ TSP:0.010, MAP:0.021, NPS:0.028, DAP:0.023, NPK1:0.030, NPK2:0.036, NPK3:0.018 }},
    { id:"barley", label:"Barley", pDemand:"medium", nDemand:"medium", icon:"\u{1F33E}", revenuePerHa:1520,
      cropNReq:140, // 120-160 kg N/ha
      note:"Cost sensitive crop. MAP edges TSP because modest N aligns with moderate demand.",
      yieldModByFert:{ TSP:0.96, MAP:1.00, NPS:0.94, DAP:0.97, NPK1:0.93, NPK2:0.87, NPK3:0.95 },
      decayModByFert:{ TSP:0.012, MAP:0.019, NPS:0.025, DAP:0.020, NPK1:0.028, NPK2:0.034, NPK3:0.016 }},
    { id:"maize", label:"Maize / Corn", pDemand:"high", nDemand:"very high", icon:"\u{1F33D}", revenuePerHa:1680,
      cropNReq:220, // 180-260 kg N/ha — high demand V6-V12
      note:"Very high N demand during V6 to V12. MAP and DAP decisively outperform TSP.",
      yieldModByFert:{ TSP:0.89, MAP:1.00, NPS:0.90, DAP:0.98, NPK1:0.88, NPK2:0.82, NPK3:0.93 },
      decayModByFert:{ TSP:0.008, MAP:0.020, NPS:0.026, DAP:0.018, NPK1:0.030, NPK2:0.036, NPK3:0.019 }},
    { id:"potato", label:"Potato", pDemand:"high", nDemand:"moderate", icon:"\u{1F954}", revenuePerHa:3200,
      cropNReq:120, // 100-140 kg N/ha — excess N harms tuber quality
      note:"Best case for separation. Excess N damages tuber quality and reduces price per tonne.",
      yieldModByFert:{ TSP:1.00, MAP:0.92, NPS:0.86, DAP:0.89, NPK1:0.84, NPK2:0.78, NPK3:0.88 },
      decayModByFert:{ TSP:0.007, MAP:0.024, NPS:0.031, DAP:0.027, NPK1:0.033, NPK2:0.042, NPK3:0.022 }},
    { id:"sugarbeet", label:"Sugar beet", pDemand:"medium", nDemand:"moderate", icon:"\u{1F331}", revenuePerHa:2400,
      cropNReq:130, // 110-150 kg N/ha — excess N reduces sugar content
      note:"Excess N reduces sugar content. Separation protects extraction rate and quality premium.",
      yieldModByFert:{ TSP:1.00, MAP:0.93, NPS:0.88, DAP:0.91, NPK1:0.89, NPK2:0.83, NPK3:0.91 },
      decayModByFert:{ TSP:0.008, MAP:0.020, NPS:0.028, DAP:0.024, NPK1:0.030, NPK2:0.036, NPK3:0.018 }},
    { id:"tomato", label:"Tomato", pDemand:"high", nDemand:"high", icon:"\u{1F345}", revenuePerHa:8500,
      cropNReq:200, // 180-220 kg N/ha — critical during fruit set
      note:"High value crop. MAP wins on yield because N during fruit set is critical.",
      yieldModByFert:{ TSP:0.94, MAP:1.00, NPS:0.88, DAP:0.98, NPK1:0.86, NPK2:0.80, NPK3:0.94 },
      decayModByFert:{ TSP:0.009, MAP:0.017, NPS:0.028, DAP:0.019, NPK1:0.032, NPK2:0.039, NPK3:0.018 }},
  ];

  const REGIONS = [
    { display:"Champagne-Ardenne", value:"(131) Champagne-Ardenne" },
    { display:"Picardie", value:"(132) Picardie" },
    { display:"Haute-Normandie", value:"(133) Haute-Normandie" },
    { display:"Centre", value:"(134) Centre" },
    { display:"Basse-Normandie", value:"(135) Basse-Normandie" },
    { display:"Bourgogne", value:"(136) Bourgogne" },
    { display:"Nord-Pas-de-Calais", value:"(141) Nord-Pas-de-Calais" },
    { display:"Lorraine", value:"(142) Lorraine" },
    { display:"Alsace", value:"(143) Alsace" },
    { display:"Franche-Comt\u00e9", value:"(144) Franche-Comt\u00e9" },
    { display:"Pays de la Loire", value:"(151) Pays de la Loire" },
    { display:"Bretagne", value:"(152) Bretagne" },
    { display:"Poitou-Charentes", value:"(153) Poitou-Charentes" },
    { display:"Aquitaine", value:"(162) Aquitaine" },
    { display:"Midi-Pyr\u00e9n\u00e9es", value:"(163) Midi-Pyr\u00e9n\u00e9es" },
    { display:"Limousin", value:"(164) Limousin" },
    { display:"Rh\u00f4ne-Alpes", value:"(171) Rh\u00f4ne-Alpes" },
    { display:"Auvergne", value:"(172) Auvergne" },
    { display:"Languedoc-Roussillon", value:"(181) Languedoc-Roussillon" },
    { display:"PACA", value:"(182) PACA" },
    { display:"Corse", value:"(183) Corse" },
    { display:"\u00cele-de-France", value:"(121) \u00cele-de-France" },
  ];

  const selectedCrop = CROPS.find(c => c.id === crop) || CROPS[0];
  const regionDisplay = simRegion.replace(/^\(\d+\)\s*/,"");
  const sizeScale = farmSize / 120;
  const isHighValue = selectedCrop.revenuePerHa > 2500;
  const baseRentPerHa = isHighValue ? 260 : 180;
  const rentCostPerHa = ((100 - ownedPct) / 100) * baseRentPerHa;

  // ── TSP + N program cost calculation ──
  // ── FULL PROGRAM COST COMPARISON ──
  // Every treatment must deliver the same crop N requirement. The difference is HOW:
  // - TSP + N: farmer buys P separately (TSP) and chooses the cheapest N source (urea 46% N)
  //   Urea: ~€0.65/kg product = €1.41/kg pure N — cheapest solid N on the French market
  //   Plus one extra spreading pass for the TSP application
  // - Compounds: N is bundled at a fixed ratio. Farmer still needs supplementary N (via AN 33.5%)
  //   AN: ~€0.85/kg product = €2.54/kg pure N — more expensive but standard for top-dressing
  //   The N bundled in the compound is "free" but locked at the wrong timing
  const UREA_COST_PER_KG_N = 0.65 / 0.46;  // €1.41/kg pure N — TSP farmer's advantage
  const AN_COST_PER_KG_N = 0.85 / 0.335;    // €2.54/kg pure N — compound farmer's supplementary N
  const extraPassCost = farmSize > 200 ? 15 : farmSize > 100 ? 18 : 22;
  const effectiveTspNRate = tspNRate !== null ? tspNRate : selectedCrop.cropNReq;
  const cropNReq = selectedCrop.cropNReq;

  // N delivered by each compound at standard P application rate (kg N/ha)
  const nDelivered = { TSP:0, MAP:30, NPS:55, DAP:50, NPK1:42, NPK2:35, NPK3:22 };

  // TSP program: P granule (€135/ha) + full N via urea + extra pass
  const tspPCost = 135; // just the P component — no bundled N margin
  const tspNCost = Math.round(effectiveTspNRate * UREA_COST_PER_KG_N);
  const tspProgramCost = tspPCost + tspNCost + extraPassCost;

  // Compound program: product cost + supplementary N via AN (more expensive)
  const calcProgramCost = (baseProductCost, productId) => {
    const nFromProduct = nDelivered[productId] || 0;
    const suppNNeeded = Math.max(0, cropNReq - nFromProduct);
    const suppNCost = Math.round(suppNNeeded * AN_COST_PER_KG_N);
    return baseProductCost + suppNCost;
  };

  const FERTILIZERS = [
    { id:"TSP", label:"TSP + N", full:"TSP + "+Math.round(effectiveTspNRate)+" kg N/ha (urea)", p2o5:46, n:effectiveTspNRate, nDelivered:0, k:0, color:"#2DB84B", badge:"P Separation", badgeColor:"#2DB84B", costPerKg:0.78, baseCostPerHa:tspProgramCost },
    { id:"MAP", label:"MAP", full:"MAP + supp. N (AN)", p2o5:48, n:11, nDelivered:30, k:0, color:"#2DB84B", badge:"High P", badgeColor:"#2DB84B", costPerKg:0.90, baseCostPerHa:calcProgramCost(205,"MAP") },
    { id:"NPS", label:"NPS", full:"NPS + supp. N (AN)", p2o5:20, n:24, nDelivered:55, k:0, color:"#a78bfa", badge:"With Sulphur", badgeColor:"#a78bfa", costPerKg:0.72, baseCostPerHa:calcProgramCost(192,"NPS") },
    { id:"DAP", label:"DAP", full:"DAP + supp. N (AN)", p2o5:46, n:18, nDelivered:50, k:0, color:"#f59e0b", badge:"High N+P", badgeColor:"#f59e0b", costPerKg:0.95, baseCostPerHa:calcProgramCost(218,"DAP") },
    { id:"NPK1", label:"NPK 15-15-15", full:"NPK 15-15-15 + supp. N", p2o5:15, n:15, nDelivered:42, k:15, color:"#f43f5e", badge:"Blended", badgeColor:"#f43f5e", costPerKg:0.62, baseCostPerHa:calcProgramCost(230,"NPK1") },
    { id:"NPK2", label:"NPK 10-10-10", full:"NPK 10-10-10 + supp. N", p2o5:10, n:10, nDelivered:35, k:10, color:"#6B8F72", badge:"Economy", badgeColor:"#6B8F72", costPerKg:0.48, baseCostPerHa:calcProgramCost(195,"NPK2") },
    { id:"NPK3", label:"NPK 10-52-10", full:"High P Low N + supp. N", p2o5:52, n:10, nDelivered:22, k:10, color:"#818cf8", badge:"High P Low N", badgeColor:"#818cf8", costPerKg:1.02, baseCostPerHa:calcProgramCost(245,"NPK3") },
  ];

  const TSP = FERTILIZERS[0];
  const NON_TSP = FERTILIZERS.filter(f => f.id !== "TSP");

  // Regional yield multiplier from MODEL1 FADN coefficients
  const REGION_YIELD_MOD = {
    "(131) Champagne-Ardenne":1.029,"(132) Picardie":1.002,"(133) Haute-Normandie":0.972,
    "(134) Centre":0.917,"(135) Basse-Normandie":0.983,"(136) Bourgogne":1.004,
    "(141) Nord-Pas-de-Calais":0.967,"(142) Lorraine":0.972,"(143) Alsace":0.966,
    "(144) Franche-Comté":1.011,"(151) Pays de la Loire":0.946,"(152) Bretagne":1.002,
    "(153) Poitou-Charentes":0.940,"(162) Aquitaine":0.842,"(163) Midi-Pyrénées":0.906,
    "(164) Limousin":0.962,"(171) Rhône-Alpes":0.941,"(172) Auvergne":0.975,
    "(181) Languedoc-Roussillon":0.879,"(182) PACA":0.922,"(183) Corse":0.903,
    "(121) Île-de-France":1.000,
  };
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
    return {
      output: revenuePerHa,
      inputCost: totalCostPerHa,
      fertCost: fertCostPerHa,
      seedCost, labourCost, machineryCost, insuranceCost, miscCost,
      grossMargin: revenuePerHa - totalCostPerHa,
      rofi: revenuePerHa / totalCostPerHa,
      totalFarmRevenue: revenuePerHa * farmSize,
      totalFarmCost: totalCostPerHa * farmSize,
      totalFarmMargin: (revenuePerHa - totalCostPerHa) * farmSize,
    };
  };

  const YEARS_AHEAD = [0,1,2,3,4];
  const buildMultiYear = (fert) => YEARS_AHEAD.map(y => {
    const fin = computeFinancials(fert, y);
    return { year:"Season "+(y+1), output:Math.round(fin.output), cost:Math.round(fin.inputCost), margin:Math.round(fin.grossMargin) };
  });

  const MONTHS = ["Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul"];
  const buildTimeline = (fert) => MONTHS.map((m, i) => {
    const fin = computeFinancials(fert, 0);
    const costPct = Math.min(1, (1 / (1 + Math.exp(-0.8 * (i - 4)))));
    const revPct = Math.min(1, Math.pow(i / 9, 2.2));
    return { month:m, cost:Math.round(fin.inputCost*costPct), revenue:Math.round(fin.output*revPct), cumCash:Math.round(fin.output*revPct - fin.inputCost*costPct) };
  });

  const buildBalanceSheet = (fert) => {
    const fin = computeFinancials(fert);
    // Land value: French arable ~8,000-9,500 €/ha (higher in IDF/Champagne, lower in South)
    const baseLandVal = isHighValue ? 12000 : 8500;
    const landValue = Math.round(baseLandVal * regionYieldMod * (ownedPct/100) * farmSize / 120);
    // Machinery: scales with farm size but with diminishing marginal cost (shared equipment)
    const machineryValue = Math.round((isHighValue ? 3200 : 2400) * Math.pow(sizeScale, 0.85));
    // Crop inventory: inputs committed to ground, proportional to cost
    const inventoryValue = Math.round(fin.inputCost * sizeScale * 0.35);
    // Cash: residual from prior season margin, younger farmers tend to hold less cash
    const cashMod = farmerAge < 40 ? 0.30 : farmerAge < 55 ? 0.45 : 0.55;
    const cashPosition = Math.round(Math.max(0, fin.grossMargin * sizeScale * cashMod));
    // Receivables: harvest sold but not yet paid, proportional to output
    const receivables = Math.round(fin.output * sizeScale * 0.18);
    const totalAssets = landValue + machineryValue + inventoryValue + cashPosition + receivables;
    // Debt: larger farms carry more structural debt; younger farmers more leveraged
    const ageLeverage = farmerAge < 40 ? 1.25 : farmerAge < 55 ? 1.0 : 0.75;
    const longTermDebt = Math.round((isHighValue ? 4200 : 3200) * sizeScale * ageLeverage);
    const rentObl = Math.round(rentCostPerHa * farmSize);
    const inputPayables = Math.round(fin.inputCost * sizeScale * 0.55);
    const operatingLoan = Math.round(fin.inputCost * sizeScale * (farmSize > 200 ? 0.22 : 0.30));
    const totalLiab = longTermDebt + rentObl + inputPayables + operatingLoan;
    return {
      assets: [
        { label:"Owned land value", value:landValue },
        { label:"Machinery and equipment", value:machineryValue },
        { label:"Crop inventory (in ground)", value:inventoryValue },
        { label:"Cash and equivalents", value:cashPosition },
        { label:"Trade receivables", value:receivables },
      ],
      totalAssets,
      liabilities: [
        { label:"Long term debt (land, equipment)", value:longTermDebt },
        { label:"Annual rent obligations", value:rentObl },
        { label:"Input supplier payables", value:inputPayables },
        { label:"Operating line of credit", value:operatingLoan },
      ],
      totalLiab,
      equity: totalAssets - totalLiab,
    };
  };

  const buildPL = (fert) => {
    const fin = computeFinancials(fert);
    // Revenue: crop sales + subsidies (CAP decoupled ~200-270 €/ha for field crops)
    const subsidyPerHa = isHighValue ? fin.output * 0.04 : Math.min(270, fin.output * 0.08);
    const cropSales = Math.round(fin.output);
    const subsidies = Math.round(subsidyPerHa);
    const totalRevenue = cropSales + subsidies;
    const expenses = [
      { label:"Primary fertilizer program", value:fin.fertCost },
      { label:"Seed and planting material", value:fin.seedCost },
      { label:"Labour and field operations", value:fin.labourCost },
      { label:"Machinery depreciation", value:fin.machineryCost },
      { label:"Land rent", value:Math.round(rentCostPerHa) },
      { label:"Crop insurance", value:fin.insuranceCost },
      { label:"Administrative and miscellaneous", value:fin.miscCost },
    ];
    const totalExpense = expenses.reduce((s,e)=>s+e.value,0);
    return {
      revenue: [ { label:"Crop sales (" + selectedCrop.label + ")", value:cropSales }, { label:"Direct payments and subsidies", value:subsidies } ],
      totalRevenue,
      expenses,
      totalExpense,
      netIncome: totalRevenue - totalExpense,
    };
  };

  const EUR = "\u20AC";
  const MINUS = "\u2212";
  const MDASH = "\u2014";
  const LARR = "\u2190";
  const RARR = "\u2192";
  const MIDDOT = "\u00B7";
  const TIMES = "\u00D7";
  const CARET = "\u25BE";
  const P2O5 = "P\u2082O\u2085";
  const fmtE = n => n < 0 ? (MINUS+EUR+Math.round(Math.abs(n)).toLocaleString()) : (EUR+Math.round(n).toLocaleString());
  const fmtK = n => n >= 0 ? ("+"+EUR+Math.round(n).toLocaleString()) : (MINUS+EUR+Math.round(Math.abs(n)).toLocaleString());
  const CHART_COLORS = { TSP:"#2DB84B", MAP:"#2DB84B", NPS:"#a78bfa", DAP:"#f59e0b", NPK1:"#f43f5e", NPK2:"#6B8F72", NPK3:"#818cf8" };

  const allTreatments = [TSP, ...FERTILIZERS.filter(f => currentFerts.includes(f.id) && f.id !== "TSP")];
  const tspFin = computeFinancials(TSP);
  const allRanked = FERTILIZERS.map(f => ({ ...f, margin: computeFinancials(f).grossMargin })).sort((a,b) => b.margin - a.margin);
  const bestTreatment = allRanked[0];
  const tspRank = allRanked.findIndex(f => f.id === "TSP") + 1;
  const tspIsBest = bestTreatment.id === "TSP";

  // Drag-select zoom: user clicks and drags on chart to select a region, then zooms in

  const handleDragStart = (chartId, e) => {
    if (e && e.activeLabel) { setDragStart(e.activeLabel); setDragEnd(null); setActiveChart(chartId); }
  };
  const handleDragMove = (chartId, e) => {
    if (dragStart && activeChart === chartId && e && e.activeLabel) { setDragEnd(e.activeLabel); }
  };
  const handleDragEnd = (chartId, rawLabels, setZoom) => {
    if (dragStart && dragEnd && activeChart === chartId && dragStart !== dragEnd) {
      const i1 = rawLabels.indexOf(dragStart);
      const i2 = rawLabels.indexOf(dragEnd);
      if (i1 >= 0 && i2 >= 0) {
        setZoom([Math.min(i1,i2), Math.max(i1,i2)]);
      }
    }
    setDragStart(null); setDragEnd(null); setActiveChart(null);
  };

  const ResetZoomBtn = ({ zoom, setZoom }) => zoom ? (
    <button onClick={()=>setZoom(null)} style={{ background:"#FFFFFF", border:"1px solid #2DB84B40", color:"#2DB84B", borderRadius:6, padding:"4px 12px", fontSize:10, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5, flexShrink:0, transition:"all 0.15s" }}
      onMouseEnter={e=>{e.currentTarget.style.background="#2DB84B20";}}
      onMouseLeave={e=>{e.currentTarget.style.background="#FFFFFF";}}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      Reset zoom
    </button>
  ) : null;

  const S = {
    card: { background:"#FFFFFF", border:"1px solid #D6E8DA", borderRadius:14, padding:"18px 20px" },
    label: { color:"#6B8F72", fontSize:9, textTransform:"uppercase", letterSpacing:"0.14em", fontWeight:600 },
    h2: { color:"#0F2415", fontSize:17, fontWeight:700, letterSpacing:"-0.02em", margin:0 },
  };

  // =============== CONFIGURE ===============
  if (phase === "configure") {
    return (
      <div style={{ fontFamily:"'DM Sans',sans-serif", display:"flex", flexDirection:"column", gap:0 }}>
        <style>{`
          @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
          .crop-btn:hover { border-color:#2DB84B !important; background:#2DB84B08 !important; }
          .enter-farm-btn { transition:all 0.2s; }
          .enter-farm-btn:hover { background:#0F2415 !important; color:#F7F9F7 !important; transform:translateY(-2px); box-shadow:0 8px 32px rgba(241,245,249,0.12); }
        `}</style>
        <div style={{ textAlign:"center", marginBottom:32, animation:"fadeUp 0.4s ease" }}>
          <p style={{ color:"#2DB84B", fontSize:10, textTransform:"uppercase", letterSpacing:"0.18em", fontWeight:700, margin:"0 0 8px" }}>PhosStratOS · Farm Financial Simulator</p>
          <h1 style={{ color:"#0F2415", fontSize:28, fontWeight:800, letterSpacing:"-0.03em", margin:"0 0 8px" }}>Configure Mathieu's Farm</h1>
          <p style={{ color:"#6B8F72", fontSize:13, margin:0, maxWidth:580, marginLeft:"auto", marginRight:"auto", lineHeight:1.7 }}>
            Set the structural parameters. These determine baseline costs, revenue composition, and how input decisions translate into financial outcomes.
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, animation:"fadeUp 0.5s 0.1s ease both" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div style={{ ...S.card }}>
              <p style={{ ...S.label, margin:"0 0 12px" }}>Farm size (hectares)</p>
              <input type="range" min={10} max={500} step={5} value={farmSize} onChange={e=>setFarmSize(Number(e.target.value))} style={{ width:"100%", accentColor:"#2DB84B" }}/>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
                <span style={{ color:"#B8D4BE", fontSize:10 }}>10 ha</span>
                <span style={{ color:"#2DB84B", fontSize:18, fontWeight:800, fontFamily:"'DM Mono',monospace" }}>{farmSize} ha</span>
                <span style={{ color:"#B8D4BE", fontSize:10 }}>500 ha</span>
              </div>
            </div>
            <div style={{ ...S.card }}>
              <p style={{ ...S.label, margin:"0 0 12px" }}>Region</p>
              <select value={simRegion} onChange={e=>setSimRegion(e.target.value)} style={{ width:"100%", background:"#FFFFFF", border:"1.5px solid #D6E8DA", color:"#0F2415", borderRadius:8, padding:"10px 14px", fontSize:13, fontWeight:600 }}>
                {REGIONS.map(r=><option key={r.value} value={r.value}>{r.display}</option>)}
              </select>
            </div>
            <div style={{ ...S.card }}>
              <p style={{ ...S.label, margin:"0 0 12px" }}>Farmer age</p>
              <input type="range" min={18} max={90} step={1} value={farmerAge} onChange={e=>setFarmerAge(Number(e.target.value))} style={{ width:"100%", accentColor:"#2DB84B" }}/>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
                <span style={{ color:"#B8D4BE", fontSize:10 }}>18</span>
                <span style={{ color:"#2DB84B", fontSize:18, fontWeight:800, fontFamily:"'DM Mono',monospace" }}>{farmerAge} years</span>
                <span style={{ color:"#B8D4BE", fontSize:10 }}>90</span>
              </div>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div style={{ ...S.card }}>
              <p style={{ ...S.label, margin:"0 0 12px" }}>Crop</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                {CROPS.map(c => (
                  <button key={c.id} className="crop-btn" onClick={()=>setCrop(c.id)} style={{
                    background: crop===c.id ? "#2DB84B12" : "#FFFFFF",
                    border: "1.5px solid "+(crop===c.id ? "#2DB84B" : "#D6E8DA"),
                    borderRadius:10, padding:"12px 10px", cursor:"pointer", textAlign:"center",
                  }}>
                    <span style={{ fontSize:20, display:"block" }}>{c.icon}</span>
                    <span style={{ color: crop===c.id ? "#2DB84B" : "#6B8F72", fontSize:11, fontWeight:crop===c.id?700:500, display:"block", marginTop:4 }}>{c.label}</span>
                    <span style={{ color:"#B8D4BE", fontSize:9, display:"block", marginTop:2 }}>P:{c.pDemand} {MIDDOT} N:{c.nDemand}</span>
                  </button>
                ))}
              </div>
              {selectedCrop && <p style={{ color:"#9BB5A0", fontSize:11, lineHeight:1.6, margin:"10px 0 0" }}>{selectedCrop.note}</p>}
            </div>
            <div style={{ ...S.card }}>
              <p style={{ ...S.label, margin:"0 0 12px" }}>Ownership structure</p>
              <input type="range" min={0} max={100} step={5} value={ownedPct} onChange={e=>setOwnedPct(Number(e.target.value))} style={{ width:"100%", accentColor:"#f59e0b" }}/>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, alignItems:"center" }}>
                <span style={{ color:"#f59e0b", fontSize:11, fontWeight:600 }}>Owned: {ownedPct}%</span>
                <span style={{ color:"#6B8F72", fontSize:11 }}>Rented: {100-ownedPct}%</span>
              </div>
              <p style={{ color:"#B8D4BE", fontSize:10, margin:"8px 0 0" }}>Rent cost: {EUR}{Math.round(rentCostPerHa)}/ha/year</p>
            </div>
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"center", marginTop:28, animation:"fadeUp 0.5s 0.3s ease both" }}>
          <button className="enter-farm-btn" style={{
            background:"transparent", border:"2px solid #0F2415", color:"#0F2415",
            padding:"16px 48px", borderRadius:4, fontSize:12, fontWeight:800,
            letterSpacing:"0.14em", textTransform:"uppercase", cursor:"pointer",
          }} onClick={()=>setPhase("narrative")}>
            {"Continue " + MDASH + " Choose Treatments →"}
          </button>
        </div>
      </div>
    );
  }

  // =============== NARRATIVE ===============
  if (phase === "narrative") {
    const selectedFerts = currentFerts.map(id=>FERTILIZERS.find(f=>f.id===id)).filter(Boolean);
    return (
      <div style={{ fontFamily:"'DM Sans',sans-serif", maxWidth:680, margin:"0 auto", padding:"20px 0" }}>
        <style>{`
          @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
          .fert-option { transition:all 0.15s; cursor:pointer; }
          .fert-option:hover { border-color:#2DB84B !important; background:#2DB84B08 !important; }
          .run-btn { transition:all 0.25s; }
          .run-btn:hover { background:#0F2415 !important; color:#F7F9F7 !important; transform:translateY(-2px); box-shadow:0 8px 40px rgba(241,245,249,0.15); }
        `}</style>
        <button onClick={()=>setPhase("configure")} style={{ background:"none", border:"none", color:"#9BB5A0", fontSize:11, cursor:"pointer", padding:0, marginBottom:24 }}>{LARR} Back to farm configuration</button>

        <div style={{ animation:"fadeUp 0.5s ease" }}>
          <p style={{ color:"#6B8F72", fontSize:11, textTransform:"uppercase", letterSpacing:"0.14em", fontWeight:600, margin:"0 0 14px" }}>{selectedCrop.icon} {selectedCrop.label} {MIDDOT} {regionDisplay} {MIDDOT} {farmSize} ha</p>
          <h2 style={{ color:"#0F2415", fontSize:26, fontWeight:300, letterSpacing:"-0.02em", lineHeight:1.3, margin:"0 0 10px" }}>
            Today, Mathieu uses <span style={{ fontWeight:800, color: selectedFerts.length > 0 ? "#2DB84B" : "#9BB5A0" }}>
              {selectedFerts.length > 0 ? selectedFerts.map(f=>f.label).join(" and ") : "..."}
            </span>
          </h2>
          <p style={{ color:"#6B8F72", fontSize:14, lineHeight:1.7, margin:"0 0 24px" }}>
            Select one or more products that represent his current fertilizer program. TSP will always be included as the separation reference.
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:28 }}>
          {NON_TSP.map(f => {
            const sel = currentFerts.includes(f.id);
            return (
              <div key={f.id} className="fert-option" onClick={()=>{
                setCurrentFerts(prev => sel ? prev.filter(x=>x!==f.id) : [...prev, f.id]);
              }} style={{
                background: sel ? (f.color+"10") : "#FFFFFF",
                border: "1.5px solid "+(sel ? f.color : "#D6E8DA"),
                borderRadius:12, padding:"14px 16px",
                display:"flex", alignItems:"center", gap:12,
              }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background: sel ? f.color : "#D6E8DA", flexShrink:0, transition:"all 0.15s" }}/>
                <div>
                  <p style={{ color: sel ? "#0F2415" : "#6B8F72", fontSize:13, fontWeight:sel?700:500, margin:0 }}>{f.label}</p>
                  <p style={{ color:"#9BB5A0", fontSize:10, margin:0 }}>{P2O5}: {f.p2o5}% {MIDDOT} N: {f.n}% {MIDDOT} {EUR}{f.baseCostPerHa}/ha</p>
                </div>
                <span style={{ marginLeft:"auto", fontSize:10, color:f.badgeColor, background:f.badgeColor+"18", padding:"2px 8px", borderRadius:6, fontWeight:600 }}>{f.badge}</span>
              </div>
            );
          })}
        </div>

        {currentFerts.length > 0 && (
          <div style={{ animation:"fadeUp 0.4s ease" }}>
            <p style={{ color:"#2C4A33", fontSize:18, fontWeight:300, lineHeight:1.5, margin:"0 0 24px" }}>
              But today, Mathieu wants to check if <span style={{ fontWeight:700, color:"#2DB84B" }}>switching to TSP</span> will benefit him economically {MDASH} or whether his current program is already the better choice.
            </p>
            <div style={{ display:"flex", justifyContent:"center" }}>
              <button className="run-btn" onClick={()=>setPhase("results")} style={{
                background:"transparent", border:"2px solid #2DB84B", color:"#2DB84B",
                padding:"16px 44px", borderRadius:4, fontSize:12, fontWeight:800,
                letterSpacing:"0.14em", textTransform:"uppercase", cursor:"pointer",
              }}>
                {"Run the comparison →"}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =============== RESULTS ===============
  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", display:"flex", flexDirection:"column", gap:16 }}>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .dropdown-toggle { cursor:pointer; transition:background 0.15s; }
        .dropdown-toggle:hover { background:#0a1628 !important; }
        .restart-btn { transition:all 0.2s; }
        .restart-btn:hover { background:#0F2415 !important; color:#F7F9F7 !important; transform:translateY(-2px); }
        .back-link:hover { color:#0F2415 !important; }
      `}</style>

      {/* TOP BAR */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", gap:12 }}>
          <button className="back-link" onClick={()=>setPhase("narrative")} style={{ background:"none", border:"none", color:"#9BB5A0", fontSize:11, cursor:"pointer", padding:0, transition:"all 0.15s" }}>{LARR} Change treatment</button>
          <button className="back-link" onClick={()=>setPhase("configure")} style={{ background:"none", border:"none", color:"#B8D4BE", fontSize:11, cursor:"pointer", padding:0, transition:"all 0.15s" }}>{LARR} Reconfigure farm</button>
        </div>
      </div>

      {/* LIVE PARAMETER CONTROLS - always sticky */}
      <div style={{
        background:"linear-gradient(135deg, #FFFFFF 0%, #0a1628 100%)",
        border:"1.5px solid #2DB84B30",
        borderRadius:14, padding:"14px 18px",
        position:"sticky", top:0, zIndex:50,
        boxShadow:"0 4px 24px rgba(0,0,0,0.5)",
      }}>
        <p style={{ color:"#2DB84B", fontSize:9, textTransform:"uppercase", letterSpacing:"0.14em", fontWeight:700, margin:"0 0 10px" }}>Live parameters {MDASH} all results update instantly</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr 1fr", gap:12 }}>
          <div>
            <p style={{ color:"#6B8F72", fontSize:10, fontWeight:600, margin:"0 0 5px" }}>Farm size</p>
            <input type="range" min={10} max={500} step={5} value={farmSize} onChange={e=>setFarmSize(Number(e.target.value))} style={{ width:"100%", accentColor:"#2DB84B" }}/>
            <p style={{ color:"#2DB84B", fontSize:12, fontWeight:800, fontFamily:"'DM Mono',monospace", margin:"3px 0 0", textAlign:"center" }}>{farmSize} ha</p>
          </div>
          <div>
            <p style={{ color:"#6B8F72", fontSize:10, fontWeight:600, margin:"0 0 5px" }}>Farmer age</p>
            <input type="range" min={18} max={90} step={1} value={farmerAge} onChange={e=>setFarmerAge(Number(e.target.value))} style={{ width:"100%", accentColor:"#2DB84B" }}/>
            <p style={{ color:"#2DB84B", fontSize:12, fontWeight:800, fontFamily:"'DM Mono',monospace", margin:"3px 0 0", textAlign:"center" }}>{farmerAge} yrs</p>
          </div>
          <div>
            <p style={{ color:"#6B8F72", fontSize:10, fontWeight:600, margin:"0 0 5px" }}>Owned / Rented</p>
            <input type="range" min={0} max={100} step={5} value={ownedPct} onChange={e=>setOwnedPct(Number(e.target.value))} style={{ width:"100%", accentColor:"#f59e0b" }}/>
            <p style={{ color:"#f59e0b", fontSize:12, fontWeight:800, fontFamily:"'DM Mono',monospace", margin:"3px 0 0", textAlign:"center" }}>{ownedPct}% / {100-ownedPct}%</p>
          </div>
          <div>
            <p style={{ color:"#6B8F72", fontSize:10, fontWeight:600, margin:"0 0 5px" }}>Crop</p>
            <select value={crop} onChange={e=>{setCrop(e.target.value);setTspNRate(null);}} style={{ width:"100%", background:"#FFFFFF", border:"1.5px solid #D6E8DA", color:"#0F2415", borderRadius:8, padding:"5px 8px", fontSize:11, fontWeight:600 }}>
              {CROPS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
          <div>
            <p style={{ color:"#6B8F72", fontSize:10, fontWeight:600, margin:"0 0 5px" }}>Region</p>
            <select value={simRegion} onChange={e=>setSimRegion(e.target.value)} style={{ width:"100%", background:"#FFFFFF", border:"1.5px solid #D6E8DA", color:"#0F2415", borderRadius:8, padding:"5px 8px", fontSize:11, fontWeight:600 }}>
              {REGIONS.map(r=><option key={r.value} value={r.value}>{r.display}</option>)}
            </select>
          </div>
          <div>
            <p style={{ color:"#2DB84B", fontSize:10, fontWeight:600, margin:"0 0 5px" }}>TSP + N rate</p>
            <input type="range" min={0} max={300} step={10} value={effectiveTspNRate} onChange={e=>setTspNRate(Number(e.target.value))} style={{ width:"100%", accentColor:"#2DB84B" }}/>
            <p style={{ color:"#2DB84B", fontSize:11, fontWeight:800, fontFamily:"'DM Mono',monospace", margin:"3px 0 0", textAlign:"center" }}>{Math.round(effectiveTspNRate)} kg N/ha</p>
            <p style={{ color:"#B8D4BE", fontSize:8, margin:"2px 0 0", textAlign:"center" }}>Rec: {selectedCrop.cropNReq} {MIDDOT} {EUR}{Math.round(tspNCost)} N + {EUR}{extraPassCost} pass</p>
          </div>
        </div>
      </div>

      {/* Context summary */}
      <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", background:"linear-gradient(135deg,#FFFFFF,#FFFFFF)", border:"1.5px solid #D6E8DA50", borderRadius:14, animation:"fadeUp 0.4s ease" }}>
        <div style={{ width:40, height:40, borderRadius:"50%", background:"#2DB84B15", border:"2px solid #2DB84B40", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2DB84B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
        </div>
        <div>
          <p style={{ color:"#2C4A33", fontSize:13, fontWeight:700, margin:0 }}>
            {selectedCrop.label} {MIDDOT} {regionDisplay} {MDASH} {allTreatments.length} treatments compared
          </p>
          <p style={{ color:"#6B8F72", fontSize:11, margin:0 }}>
            {farmSize} ha {MIDDOT} {farmerAge} y/o {MIDDOT} {ownedPct}% owned {MIDDOT} TSP program: {EUR}{Math.round(tspProgramCost)}/ha (TSP {EUR}178 + N {EUR}{Math.round(tspNCost)} + pass {EUR}{extraPassCost})
          </p>
        </div>
      </div>

      {/* ── RANKING — the big picture, shown first ── */}
      <div style={{ ...S.card, padding:0, overflow:"hidden", border:`1.5px solid ${bestTreatment.color}30` }}>
        <div style={{ padding:"18px 20px", borderBottom:"1px solid #D6E8DA", background:`linear-gradient(135deg,${bestTreatment.color}08,#FFFFFF)` }}>
          <p style={{ color:"#0F2415", fontSize:15, fontWeight:700, margin:"0 0 4px" }}>Treatment ranking {MDASH} {selectedCrop.label} {MIDDOT} {regionDisplay}</p>
          <p style={{ color:"#9BB5A0", fontSize:10, margin:0 }}>Ranked by gross margin ({EUR}/ha). TSP + N includes {Math.round(effectiveTspNRate)} kg N/ha via ammonium nitrate + extra pass cost. All other treatments compared at their standard formulation.</p>
        </div>
        {allRanked.map((f,i)=>{
          const isTSP=f.id==="TSP"; const isC=currentFerts.includes(f.id); const mD=f.margin-tspFin.grossMargin;
          return (<div key={f.id} style={{ display:"flex", alignItems:"center", gap:14, padding:i===0?"14px 20px":"11px 20px", background:i===0?bestTreatment.color+"08":isTSP?"#2DB84B06":isC?(f.color+"06"):"transparent", borderLeft:"3px solid "+(i===0?bestTreatment.color:isTSP?"#2DB84B":isC?f.color:"transparent"), borderBottom:i<allRanked.length-1?"1px solid #0d1520":"none" }}>
            <span style={{ color:i===0?"#f59e0b":i<3?"#6B8F72":"#B8D4BE", fontSize:i===0?14:11, width:22, fontFamily:"'DM Mono',monospace", fontWeight:700 }}>#{i+1}</span>
            <div style={{ width:8, height:8, borderRadius:2, background:f.color, flexShrink:0 }}/>
            <span style={{ color:isTSP?"#2DB84B":i===0?"#0F2415":isC?"#2C4A33":"#6B8F72", fontSize:i===0?14:12, fontWeight:isTSP||isC||i===0?700:400, flex:1 }}>
              {f.label}
              {i===0&&<span style={{ marginLeft:8, fontSize:9, color:"#f59e0b", background:"#f59e0b18", padding:"2px 8px", borderRadius:4, fontWeight:700 }}>BEST FOR {selectedCrop.label.toUpperCase()}</span>}
              {isTSP&&i!==0&&<span style={{ marginLeft:8, fontSize:9, color:"#2DB84B", background:"#2DB84B18", padding:"2px 8px", borderRadius:4 }}>P SEPARATION</span>}
              {isC&&!isTSP&&<span style={{ marginLeft:8, fontSize:9, color:f.color, background:f.color+"18", padding:"2px 8px", borderRadius:4 }}>COMPARED</span>}
            </span>
            <span style={{ color:i===0?"#0F2415":"#2C4A33", fontSize:i===0?15:12, fontFamily:"'DM Mono',monospace", fontWeight:i===0?800:600, width:80, textAlign:"right" }}>{fmtE(f.margin)}</span>
            <span style={{ color:mD>=0?"#2DB84B":"#f43f5e", fontSize:11, fontWeight:700, fontFamily:"'DM Mono',monospace", width:80, textAlign:"right" }}>{isTSP?MDASH:fmtK(mD)}</span>
          </div>);
        })}
      </div>

      {/* KPI table */}
      <div style={{ ...S.card, padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid #D6E8DA" }}>
          <p style={{ color:"#2C4A33", fontSize:13, fontWeight:700, margin:0 }}>Treatment comparison {MDASH} end of season financial metrics ({EUR} per hectare)</p>
          <p style={{ color:"#9BB5A0", fontSize:10, margin:"4px 0 0" }}>These are full season results at harvest. All gross margins are positive because total revenue exceeds total input cost for every treatment.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"180px repeat("+allTreatments.length+",1fr)", gap:0 }}>
          {["Metric", ...allTreatments.map(t=>t.id==="TSP"?"TSP + N (Separation)":t.label)].map((h,j)=>(
            <div key={j} style={{ padding:"10px 14px", background:"#FFFFFF", borderBottom:"1px solid #0d1520", fontSize:10, fontWeight:700, color:j===1?"#2DB84B":j>1?CHART_COLORS[allTreatments[j-1]?.id]||"#6B8F72":"#6B8F72", textTransform:"uppercase", letterSpacing:"0.08em", textAlign:j>0?"right":"left" }}>{h}</div>
          ))}
          {[{label:"Gross output (revenue)",key:"output"},{label:"Total input cost",key:"inputCost"},{label:"Gross margin (revenue "+MINUS+" cost)",key:"grossMargin"}].map((row,i)=>(
            <div key={i} style={{ display:"contents" }}>
              <div style={{ padding:"12px 14px", borderBottom:"1px solid #0d1520", color:"#6B8F72", fontSize:12 }}>{row.label}</div>
              {allTreatments.map((t,j)=>{
                const fin=computeFinancials(t); const val=fin[row.key]; const diff=val-tspFin[row.key]; const diffColor=row.key==="inputCost"?(diff<=0?"#2DB84B":"#f43f5e"):(diff>=0?"#2DB84B":"#f43f5e");
                return (<div key={t.id} style={{ padding:"12px 14px", borderBottom:"1px solid #0d1520", textAlign:"right" }}>
                  <span style={{ color:j===0?"#2DB84B":"#2C4A33", fontSize:13, fontWeight:j===0?700:600, fontFamily:"'DM Mono',monospace" }}>{fmtE(val)}</span>
                  {j>0 && <span style={{ color:diffColor, fontSize:10, fontFamily:"'DM Mono',monospace", marginLeft:8 }}>({fmtK(diff)})</span>}
                </div>);
              })}
            </div>
          ))}
          <div style={{ display:"contents" }}>
            <div style={{ padding:"12px 14px", background:"#0a1628", color:"#0F2415", fontSize:12, fontWeight:700 }}>Return on fertilizer investment</div>
            {allTreatments.map((t,j)=>{
              const fin=computeFinancials(t);
              return (<div key={t.id} style={{ padding:"12px 14px", background:"#0a1628", textAlign:"right" }}>
                <span style={{ color:j===0?"#2DB84B":"#2C4A33", fontSize:14, fontWeight:j===0?800:700, fontFamily:"'DM Mono',monospace" }}>{fin.rofi.toFixed(2)}x</span>
                {j>0 && <span style={{ color:fin.rofi>=tspFin.rofi?"#2DB84B":"#f43f5e", fontSize:10, fontFamily:"'DM Mono',monospace", marginLeft:8 }}>({fin.rofi>=tspFin.rofi?"+":MINUS}{Math.abs(fin.rofi-tspFin.rofi).toFixed(2)})</span>}
              </div>);
            })}
          </div>
          <div style={{ display:"contents" }}>
            <div style={{ padding:"12px 14px", background:"#FFFFFF", color:"#0F2415", fontSize:12, fontWeight:700, borderTop:"2px solid #D6E8DA" }}>Total farm margin ({farmSize} ha)</div>
            {allTreatments.map((t,j)=>{
              const fin=computeFinancials(t); const tfm=fin.totalFarmMargin; const tspTfm=tspFin.totalFarmMargin;
              return (<div key={t.id} style={{ padding:"12px 14px", background:"#FFFFFF", textAlign:"right", borderTop:"2px solid #D6E8DA" }}>
                <span style={{ color:j===0?"#2DB84B":"#2C4A33", fontSize:14, fontWeight:800, fontFamily:"'DM Mono',monospace" }}>{fmtE(tfm)}</span>
                {j>0 && <span style={{ color:tfm>=tspTfm?"#2DB84B":"#f43f5e", fontSize:10, fontFamily:"'DM Mono',monospace", marginLeft:8 }}>({fmtK(tfm-tspTfm)})</span>}
              </div>);
            })}
          </div>
        </div>
      </div>

      {/* MARGIN TRAJECTORY */}
      {(() => {
        const rawData = buildMultiYear(TSP).map((r,i) => { const row={year:r.year,TSP:r.margin}; currentFerts.forEach(id=>{const f=FERTILIZERS.find(x=>x.id===id);if(f)row[f.label]=buildMultiYear(f)[i].margin;}); return row; });
        const chartData = marginZoom ? rawData.slice(marginZoom[0], marginZoom[1]+1) : rawData;
        return (
          <div style={{ ...S.card }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
              <div>
                <p style={{ color:"#2C4A33", fontSize:13, fontWeight:700, margin:0 }}>Gross margin trajectory {MDASH} five seasons ({EUR} per hectare)</p>
                <p style={{ color:"#9BB5A0", fontSize:10, margin:"4px 0 0" }}>These are positive end of season margins. Click and drag on the chart to select a region and zoom in.</p>
              </div>
              <ResetZoomBtn zoom={marginZoom} setZoom={setMarginZoom} />
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}
                onMouseDown={e=>handleDragStart("margin",e)}
                onMouseMove={e=>handleDragMove("margin",e)}
                onMouseUp={()=>handleDragEnd("margin",rawData.map(d=>d.year),setMarginZoom)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D6E8DA"/>
                <XAxis dataKey="year" tick={{fill:"#6B8F72",fontSize:11}} axisLine={{stroke:"#E8F2EA"}}/>
                <YAxis tick={{fill:"#6B8F72",fontSize:10}} axisLine={{stroke:"#E8F2EA"}} tickFormatter={v=>EUR+v} domain={['dataMin - 20','dataMax + 20']} allowDataOverflow={true}/>
                <Tooltip contentStyle={{background:"#F7F9F7",border:"1px solid #D6E8DA",borderRadius:8,fontSize:11}} formatter={(v,name)=>[EUR+Math.round(v).toLocaleString()+"/ha",name]}/>
                <Legend wrapperStyle={{fontSize:11,color:"#6B8F72"}}/>
                {(dragStart && dragEnd && activeChart==="margin") && <ReferenceArea x1={dragStart} x2={dragEnd} strokeOpacity={0.3} fill="#2DB84B" fillOpacity={0.15}/>}
                <Line type="monotone" dataKey="TSP" stroke="#2DB84B" strokeWidth={3} dot={{r:5,fill:"#2DB84B",strokeWidth:2,stroke:"#F7F9F7"}} activeDot={{r:7}}/>
                {currentFerts.map(id=>{const f=FERTILIZERS.find(x=>x.id===id);return f?<Line key={id} type="monotone" dataKey={f.label} stroke={CHART_COLORS[id]||"#6B8F72"} strokeWidth={2} dot={{r:4,fill:CHART_COLORS[id]||"#6B8F72",strokeWidth:2,stroke:"#F7F9F7"}} activeDot={{r:6}} strokeDasharray="6 3"/>:null;})}
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      })()}

      {/* Revenue vs Cost side by side */}

      {/* P&L — now directly after margin trajectory */}
      <div style={{ ...S.card, padding:0, overflow:"hidden" }}>
        <div className="dropdown-toggle" onClick={()=>setShowPL(!showPL)} style={{ padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"#FFFFFF" }}>
          <p style={{ color:"#0F2415", fontSize:22, fontWeight:800, letterSpacing:"-0.02em", margin:0 }}>Profit & Loss Statement <span style={{color:"#9BB5A0",fontSize:12,fontWeight:400}}>({EUR}/ha {MIDDOT} {farmSize} ha {MIDDOT} {regionDisplay})</span></p>
          <span style={{ color:"#6B8F72", fontSize:26, fontWeight:300, transform:showPL?"rotate(180deg)":"none", transition:"transform 0.2s" }}>{CARET}</span>
        </div>
        {showPL && (
          <div style={{ padding:"0 18px 18px", animation:"fadeUp 0.3s ease" }}>
            <p style={{ color:"#9BB5A0", fontSize:10, margin:"8px 0 12px", padding:"0 4px" }}>All values in {EUR}/ha. Parameters: {farmSize} ha, {farmerAge} y/o, {ownedPct}% owned, {regionDisplay}. Costs adjust for farm size (scale economies), region (yield/insurance), and farmer age (labour efficiency).</p>
            <div style={{ display:"grid", gridTemplateColumns:"200px repeat("+allTreatments.length+",1fr)", gap:0 }}>
              {["", ...allTreatments.map(t=>t.id==="TSP"?"TSP":t.label)].map((h,j)=>(<div key={j} style={{ padding:"8px 12px", background:"#FFFFFF", borderBottom:"2px solid #D6E8DA", fontSize:10, fontWeight:700, color:j===1?"#2DB84B":j>1?CHART_COLORS[allTreatments[j-1]?.id]:"#6B8F72", textTransform:"uppercase", textAlign:j>0?"right":"left" }}>{h}</div>))}
              <div style={{ display:"contents" }}><div style={{ padding:"8px 12px", background:"#0a1628", gridColumn:"1 / -1", color:"#2DB84B", fontSize:10, fontWeight:700, textTransform:"uppercase", borderBottom:"1px solid #D6E8DA" }}>Revenue</div></div>
              {buildPL(TSP).revenue.map((r,i)=>(<div key={"r"+i} style={{ display:"contents" }}><div style={{ padding:"8px 12px", borderBottom:"1px solid #0d1520", color:"#6B8F72", fontSize:11 }}>{r.label}</div>{allTreatments.map(t=><div key={t.id} style={{ padding:"8px 12px", borderBottom:"1px solid #0d1520", color:"#2C4A33", fontSize:12, fontFamily:"'DM Mono',monospace", textAlign:"right" }}>{fmtE(buildPL(t).revenue[i].value)}</div>)}</div>))}
              <div style={{ display:"contents" }}><div style={{ padding:"10px 12px", background:"#0a1628", borderBottom:"2px solid #D6E8DA", color:"#0F2415", fontSize:12, fontWeight:700 }}>Total revenue</div>{allTreatments.map(t=><div key={t.id} style={{ padding:"10px 12px", background:"#0a1628", borderBottom:"2px solid #D6E8DA", color:t.id==="TSP"?"#2DB84B":"#2C4A33", fontSize:13, fontWeight:700, fontFamily:"'DM Mono',monospace", textAlign:"right" }}>{fmtE(buildPL(t).totalRevenue)}</div>)}</div>
              <div style={{ display:"contents" }}><div style={{ padding:"8px 12px", background:"#0a1628", gridColumn:"1 / -1", color:"#f43f5e", fontSize:10, fontWeight:700, textTransform:"uppercase", borderBottom:"1px solid #D6E8DA" }}>Operating expenses</div></div>
              {buildPL(TSP).expenses.map((e,i)=>(<div key={"e"+i} style={{ display:"contents" }}><div style={{ padding:"8px 12px", borderBottom:"1px solid #0d1520", color:"#6B8F72", fontSize:11 }}>{e.label}</div>{allTreatments.map(t=><div key={t.id} style={{ padding:"8px 12px", borderBottom:"1px solid #0d1520", color:"#2C4A33", fontSize:12, fontFamily:"'DM Mono',monospace", textAlign:"right" }}>{fmtE(buildPL(t).expenses[i].value)}</div>)}</div>))}
              <div style={{ display:"contents" }}><div style={{ padding:"10px 12px", background:"#0a1628", borderBottom:"2px solid #D6E8DA", color:"#0F2415", fontSize:12, fontWeight:700 }}>Total operating expenses</div>{allTreatments.map(t=><div key={t.id} style={{ padding:"10px 12px", background:"#0a1628", borderBottom:"2px solid #D6E8DA", color:"#f43f5e", fontSize:13, fontWeight:700, fontFamily:"'DM Mono',monospace", textAlign:"right" }}>{fmtE(buildPL(t).totalExpense)}</div>)}</div>
              <div style={{ display:"contents" }}><div style={{ padding:"14px 12px", background:"#FFFFFF", borderTop:"2px solid #D6E8DA", color:"#0F2415", fontSize:14, fontWeight:800 }}>Net income</div>{allTreatments.map(t=>{const ni=buildPL(t).netIncome;const tNI=buildPL(TSP).netIncome;return(<div key={t.id} style={{ padding:"14px 12px", background:"#FFFFFF", borderTop:"2px solid #D6E8DA", textAlign:"right" }}><span style={{ color:t.id==="TSP"?"#2DB84B":"#2C4A33", fontSize:16, fontWeight:800, fontFamily:"'DM Mono',monospace" }}>{fmtE(ni)}</span>{t.id!=="TSP"&&<span style={{ color:ni>=tNI?"#2DB84B":"#f43f5e", fontSize:11, fontFamily:"'DM Mono',monospace", marginLeft:8 }}>({fmtK(ni-tNI)})</span>}</div>);})}</div>
            </div>
            <div style={{ marginTop:14, padding:"10px 14px", background:"#FFFFFF", border:"1px solid #D6E8DA", borderRadius:8 }}>
              <p style={{ color:"#6B8F72", fontSize:11, margin:0, lineHeight:1.65 }}>Total farm net income: {allTreatments.map((t,j)=>{ const ni=buildPL(t).netIncome; return <span key={t.id} style={{color:j===0?"#2DB84B":CHART_COLORS[t.id],fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{j>0?" · ":""}{t.id==="TSP"?"TSP":t.label}: {fmtE(ni * farmSize)}</span>;})}</p>
            </div>
          </div>
        )}
      </div>

      {/* Balance Sheet — now directly after P&L */}
      <div style={{ ...S.card, padding:0, overflow:"hidden" }}>
        <div className="dropdown-toggle" onClick={()=>setShowBS(!showBS)} style={{ padding:"20px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"#FFFFFF" }}>
          <p style={{ color:"#0F2415", fontSize:22, fontWeight:800, letterSpacing:"-0.02em", margin:0 }}>Balance Sheet <span style={{color:"#9BB5A0",fontSize:12,fontWeight:400}}>({farmSize} ha {MIDDOT} {ownedPct}% owned {MIDDOT} {regionDisplay})</span></p>
          <span style={{ color:"#6B8F72", fontSize:26, fontWeight:300, transform:showBS?"rotate(180deg)":"none", transition:"transform 0.2s" }}>{CARET}</span>
        </div>
        {showBS && (
          <div style={{ padding:"0 18px 18px", animation:"fadeUp 0.3s ease" }}>
            <p style={{ color:"#9BB5A0", fontSize:10, margin:"8px 0 12px", padding:"0 4px" }}>Scaled balance sheet. Land value reflects regional market ({regionDisplay}), ownership ({ownedPct}%). Debt adjusts for farmer age ({farmerAge} y/o) and farm size ({farmSize} ha).</p>
            <div style={{ display:"grid", gridTemplateColumns:"180px repeat("+allTreatments.length+",1fr)", gap:0 }}>
              {["", ...allTreatments.map(t=>t.id==="TSP"?"TSP":t.label)].map((h,j)=>(<div key={j} style={{ padding:"8px 12px", background:"#FFFFFF", borderBottom:"2px solid #D6E8DA", fontSize:10, fontWeight:700, color:j===1?"#2DB84B":j>1?CHART_COLORS[allTreatments[j-1]?.id]:"#6B8F72", textTransform:"uppercase", textAlign:j>0?"right":"left" }}>{h}</div>))}
              <div style={{ display:"contents" }}><div style={{ padding:"8px 12px", background:"#0a1628", gridColumn:"1 / -1", color:"#2DB84B", fontSize:10, fontWeight:700, textTransform:"uppercase", borderBottom:"1px solid #D6E8DA" }}>Assets</div></div>
              {buildBalanceSheet(TSP).assets.map((a,i)=>(<div key={"a"+i} style={{ display:"contents" }}><div style={{ padding:"8px 12px", borderBottom:"1px solid #0d1520", color:"#6B8F72", fontSize:11 }}>{a.label}</div>{allTreatments.map(t=><div key={t.id} style={{ padding:"8px 12px", borderBottom:"1px solid #0d1520", color:"#2C4A33", fontSize:12, fontFamily:"'DM Mono',monospace", textAlign:"right" }}>{fmtE(buildBalanceSheet(t).assets[i].value)}</div>)}</div>))}
              <div style={{ display:"contents" }}><div style={{ padding:"10px 12px", background:"#0a1628", borderBottom:"2px solid #D6E8DA", color:"#0F2415", fontSize:12, fontWeight:700 }}>Total assets</div>{allTreatments.map(t=><div key={t.id} style={{ padding:"10px 12px", background:"#0a1628", borderBottom:"2px solid #D6E8DA", color:"#2DB84B", fontSize:13, fontWeight:700, fontFamily:"'DM Mono',monospace", textAlign:"right" }}>{fmtE(buildBalanceSheet(t).totalAssets)}</div>)}</div>
              <div style={{ display:"contents" }}><div style={{ padding:"8px 12px", background:"#0a1628", gridColumn:"1 / -1", color:"#f43f5e", fontSize:10, fontWeight:700, textTransform:"uppercase", borderBottom:"1px solid #D6E8DA" }}>Liabilities</div></div>
              {buildBalanceSheet(TSP).liabilities.map((l,i)=>(<div key={"l"+i} style={{ display:"contents" }}><div style={{ padding:"8px 12px", borderBottom:"1px solid #0d1520", color:"#6B8F72", fontSize:11 }}>{l.label}</div>{allTreatments.map(t=><div key={t.id} style={{ padding:"8px 12px", borderBottom:"1px solid #0d1520", color:"#2C4A33", fontSize:12, fontFamily:"'DM Mono',monospace", textAlign:"right" }}>{fmtE(buildBalanceSheet(t).liabilities[i].value)}</div>)}</div>))}
              <div style={{ display:"contents" }}><div style={{ padding:"10px 12px", background:"#0a1628", borderBottom:"2px solid #D6E8DA", color:"#0F2415", fontSize:12, fontWeight:700 }}>Total liabilities</div>{allTreatments.map(t=><div key={t.id} style={{ padding:"10px 12px", background:"#0a1628", borderBottom:"2px solid #D6E8DA", color:"#f43f5e", fontSize:13, fontWeight:700, fontFamily:"'DM Mono',monospace", textAlign:"right" }}>{fmtE(buildBalanceSheet(t).totalLiab)}</div>)}</div>
              <div style={{ display:"contents" }}><div style={{ padding:"12px 12px", background:"#FFFFFF", color:"#0F2415", fontSize:13, fontWeight:800 }}>Owner's equity</div>{allTreatments.map(t=>{const eq=buildBalanceSheet(t).equity;const tEq=buildBalanceSheet(TSP).equity;return(<div key={t.id} style={{ padding:"12px 12px", background:"#FFFFFF", textAlign:"right" }}><span style={{ color:t.id==="TSP"?"#2DB84B":"#2C4A33", fontSize:14, fontWeight:700, fontFamily:"'DM Mono',monospace" }}>{fmtE(eq)}</span>{t.id!=="TSP"&&<span style={{ color:eq>=tEq?"#2DB84B":"#f43f5e", fontSize:10, fontFamily:"'DM Mono',monospace", marginLeft:8 }}>({fmtK(eq-tEq)})</span>}</div>);})}</div>
            </div>
          </div>
        )}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        {(() => {
          const rawOut = buildMultiYear(TSP).map((r,i) => { const row={year:r.year,TSP:r.output}; currentFerts.forEach(id=>{const f=FERTILIZERS.find(x=>x.id===id);if(f)row[f.label]=buildMultiYear(f)[i].output;}); return row; });
          const data = outputZoom ? rawOut.slice(outputZoom[0], outputZoom[1]+1) : rawOut;
          return (
            <div style={{ ...S.card }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                <p style={{ color:"#2DB84B", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", margin:0 }}>Gross output {MDASH} five seasons</p>
                <ResetZoomBtn zoom={outputZoom} setZoom={setOutputZoom} />
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data}
                  onMouseDown={e=>handleDragStart("output",e)}
                  onMouseMove={e=>handleDragMove("output",e)}
                  onMouseUp={()=>handleDragEnd("output",rawOut.map(d=>d.year),setOutputZoom)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D6E8DA"/><XAxis dataKey="year" tick={{fill:"#6B8F72",fontSize:9}} axisLine={{stroke:"#E8F2EA"}}/><YAxis tick={{fill:"#6B8F72",fontSize:9}} axisLine={{stroke:"#E8F2EA"}} tickFormatter={v=>EUR+v} domain={['dataMin - 40','dataMax + 40']}/>
                  <Tooltip contentStyle={{background:"#F7F9F7",border:"1px solid #D6E8DA",borderRadius:8,fontSize:10}} formatter={(v,name)=>[EUR+Math.round(v).toLocaleString()+"/ha",name]}/>
                  {(dragStart && dragEnd && activeChart==="output") && <ReferenceArea x1={dragStart} x2={dragEnd} strokeOpacity={0.3} fill="#2DB84B" fillOpacity={0.15}/>}
                  <Bar dataKey="TSP" fill="#2DB84B" radius={[3,3,0,0]}/>{currentFerts.map(id=>{const f=FERTILIZERS.find(x=>x.id===id);return f?<Bar key={id} dataKey={f.label} fill={CHART_COLORS[id]||"#6B8F72"} radius={[3,3,0,0]} opacity={0.75}/>:null;})}
                </BarChart>
              </ResponsiveContainer>
            </div>
          );
        })()}
        {(() => {
          // ── Cost trajectory: simple, clear story ──
          // Season 1: TSP + N is MORE expensive (extra pass + conservative N dose + no soil history)
          // Seasons 2-5: TSP + N drops (farmer optimises N, soil P builds, pass cost amortised)
          //              Compounds rise (N waste accumulates, soil efficiency declines)
          // Crossover: season 2-3 depending on crop and region
          const seasons = [1,2,3,4,5];
          const compStartCost = (t) => t.baseCostPerHa * inputPriceDiscount;
          // TSP starts ~15-20% above the average compound cost
          const avgCompCost = allTreatments.filter(t=>t.id!=="TSP"&&currentFerts.includes(t.id)).reduce((s,t)=>s+compStartCost(t),0) / Math.max(1, currentFerts.length) || compStartCost(FERTILIZERS[1]);
          const tspStartPremium = selectedCrop.nDemand === "moderate" ? 0.12 : selectedCrop.nDemand === "medium" ? 0.15 : 0.18;
          const tspStart = Math.round(avgCompCost * (1 + tspStartPremium));
          // TSP drop rate: 6-8% per season (faster for low-N crops)
          const tspDropRate = selectedCrop.nDemand === "moderate" ? 0.08 : selectedCrop.nDemand === "medium" ? 0.07 : 0.06;
          // Compound rise rate: driven by decay data (crop+fert specific) + region
          const regionWasteMod = regionYieldMod < 0.95 ? 1.2 : regionYieldMod > 1.01 ? 0.85 : 1.0;

          const costTrajectory = seasons.map(s => {
            const row = { season:"Season "+s };
            // TSP + N: starts high, drops each season
            row["TSP + N"] = Math.round(tspStart * Math.pow(1 - tspDropRate, s - 1));
            // Compounds: start at their base cost, rise each season
            allTreatments.filter(t=>t.id!=="TSP").forEach(t => {
              const decay = selectedCrop.decayModByFert[t.id] || 0.025;
              const riseRate = (decay * 1.8 + 0.012) * regionWasteMod;
              row[t.label] = Math.round(compStartCost(t) * (1 + riseRate * (s - 1)));
            });
            return row;
          });

          const tspS1 = costTrajectory[0]["TSP + N"];
          const tspS5 = costTrajectory[4]["TSP + N"];
          const tspDrop = Math.round((1 - tspS5/tspS1) * 100);
          const compLabels = currentFerts.map(id=>{const f=FERTILIZERS.find(x=>x.id===id);return f?f.label:null;}).filter(Boolean);
          let crossSeason = null;
          for (let s = 1; s < 5; s++) {
            const tspCost = costTrajectory[s]["TSP + N"];
            if (compLabels.length > 0 && compLabels.every(l => costTrajectory[s][l] >= tspCost) && !crossSeason) crossSeason = s + 1;
          }
          const worstComp = allTreatments.filter(t=>t.id!=="TSP").reduce((worst,t)=>{
            const v = costTrajectory[4][t.label]; return v > worst.v ? {label:t.label, v, s1:costTrajectory[0][t.label]} : worst;
          }, {label:"",v:0,s1:0});

          return (
            <div style={{ ...S.card }}>
              <div style={{ marginBottom:6 }}>
                <p style={{ color:"#f43f5e", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em", margin:0 }}>Fertilizer program cost trajectory ({EUR}/ha) {MDASH} 5 seasons</p>
                <p style={{ color:"#9BB5A0", fontSize:9, margin:"3px 0 0" }}>TSP + N starts higher (extra pass, conservative first-year dose) but drops as the farmer optimises. Compounds start lower but rise as N waste accumulates.</p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={costTrajectory} margin={{left:10,right:10}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D6E8DA"/>
                  <XAxis dataKey="season" tick={{fill:"#6B8F72",fontSize:10}} axisLine={{stroke:"#E8F2EA"}}/>
                  <YAxis tick={{fill:"#6B8F72",fontSize:9}} axisLine={{stroke:"#E8F2EA"}} tickFormatter={v=>EUR+v}/>
                  <Tooltip contentStyle={{background:"#F7F9F7",border:"1px solid #D6E8DA",borderRadius:8,fontSize:10}} formatter={(v,name)=>[EUR+v+"/ha",name]}/>
                  <Legend wrapperStyle={{fontSize:10}}/>
                  {crossSeason && <ReferenceLine x={"Season "+crossSeason} stroke="#2DB84B60" strokeDasharray="4 4" label={{value:"Crossover",fill:"#2DB84B",fontSize:9,position:"top"}}/>}
                  <Line type="monotone" dataKey="TSP + N" stroke="#2DB84B" strokeWidth={3} dot={{r:5,fill:"#2DB84B",strokeWidth:2,stroke:"#F7F9F7"}}/>
                  {currentFerts.map(id=>{const f=FERTILIZERS.find(x=>x.id===id);return f?<Line key={id} type="monotone" dataKey={f.label} stroke={CHART_COLORS[id]||"#6B8F72"} strokeWidth={2} dot={{r:4,fill:CHART_COLORS[id]||"#6B8F72",strokeWidth:2,stroke:"#F7F9F7"}} strokeDasharray="6 3"/>:null;})}
                </LineChart>
              </ResponsiveContainer>
              <div style={{ marginTop:8, padding:"10px 14px", background:"#EDF6EF", border:"1px solid #2DB84B30", borderRadius:8 }}>
                <p style={{ color:"#2C4A33", fontSize:11, lineHeight:1.75, margin:0 }}>
                  <span style={{color:"#2DB84B",fontWeight:700}}>TSP + N</span> starts at {EUR}{tspS1}/ha (season 1 premium: extra pass + conservative N dose) and drops to {EUR}{tspS5}/ha by season 5 (<span style={{color:"#2DB84B"}}>{MINUS}{tspDrop}%</span>).
                  {worstComp.label && <> <span style={{color:CHART_COLORS[currentFerts.find(id=>FERTILIZERS.find(x=>x.id===id)?.label===worstComp.label)]||"#f43f5e",fontWeight:700}}>{worstComp.label}</span> rises from {EUR}{worstComp.s1} to {EUR}{worstComp.v}/ha (<span style={{color:"#f43f5e"}}>+{Math.round((worstComp.v/worstComp.s1 - 1)*100)}%</span>) as bundled N loss compounds.</>}
                  {crossSeason && <> The lines cross at <span style={{color:"#2DB84B",fontWeight:700}}>season {crossSeason}</span> {MDASH} from that point on, TSP + N is the cheaper program.</>}
                </p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* SEASON CASH FLOW */}
      <div style={{ ...S.card }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
          <div>
            <p style={{ color:"#2C4A33", fontSize:13, fontWeight:700, margin:0 }}>Growing season cumulative cash position {MDASH} October to July ({EUR} per hectare)</p>
            <div style={{ margin:"8px 0", padding:"8px 14px", background:"#f59e0b10", border:"1px solid #f59e0b30", borderRadius:8, display:"inline-block" }}>
              <p style={{ color:"#f59e0b", fontSize:11, fontWeight:700, margin:0 }}>This is NOT the final margin. This is the running cash position during the growing season.</p>
              <p style={{ color:"#6B8F72", fontSize:10, margin:"4px 0 0" }}>Costs accumulate from sowing (October) while harvest revenue arrives in summer (June/July). The negative values in early months are normal: they represent capital committed before any revenue is earned. Every treatment ends the season positive.</p>
            </div>
          </div>
          <ResetZoomBtn zoom={cashZoom} setZoom={setCashZoom} />
        </div>
        {(() => {
          const rawCash = buildTimeline(TSP).map((d,i) => { const row={month:d.month,TSP:d.cumCash}; currentFerts.forEach(id=>{const f=FERTILIZERS.find(x=>x.id===id);if(f)row[f.label]=buildTimeline(f)[i].cumCash;}); return row; });
          const data = cashZoom ? rawCash.slice(cashZoom[0], cashZoom[1]+1) : rawCash;
          return (
            <ResponsiveContainer width="100%" height={290}>
              <AreaChart data={data}
                onMouseDown={e=>handleDragStart("cash",e)}
                onMouseMove={e=>handleDragMove("cash",e)}
                onMouseUp={()=>handleDragEnd("cash",rawCash.map(d=>d.month),setCashZoom)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#D6E8DA"/><XAxis dataKey="month" tick={{fill:"#6B8F72",fontSize:10}} axisLine={{stroke:"#E8F2EA"}}/><YAxis tick={{fill:"#6B8F72",fontSize:10}} axisLine={{stroke:"#E8F2EA"}} tickFormatter={v=>EUR+v}/>
                <Tooltip contentStyle={{background:"#F7F9F7",border:"1px solid #D6E8DA",borderRadius:8,fontSize:10}} formatter={(v,name)=>[EUR+Math.round(v).toLocaleString()+"/ha (cumulative cash)",name]}/>
                <Legend wrapperStyle={{fontSize:10,color:"#6B8F72"}}/>
                <ReferenceLine y={0} stroke="#f43f5e50" strokeDasharray="4 4" label={{value:"breakeven",fill:"#f43f5e80",fontSize:9}}/>
                {(dragStart && dragEnd && activeChart==="cash") && <ReferenceArea x1={dragStart} x2={dragEnd} strokeOpacity={0.3} fill="#2DB84B" fillOpacity={0.15}/>}
                <Area type="monotone" dataKey="TSP" stroke="#2DB84B" fill="#2DB84B20" strokeWidth={2}/>
                {currentFerts.map(id=>{const f=FERTILIZERS.find(x=>x.id===id);return f?<Area key={id} type="monotone" dataKey={f.label} stroke={CHART_COLORS[id]||"#6B8F72"} fill={(CHART_COLORS[id]||"#6B8F72")+"15"} strokeWidth={1.5} strokeDasharray="4 3"/>:null;})}
              </AreaChart>
            </ResponsiveContainer>
          );
        })()}
      </div>

      {/* Commentary */}
      <div style={{ background:"#FFFFFF", border:"1px solid #D6E8DA", borderRadius:14, padding:"18px 22px" }}>
        <p style={{ color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.12em", fontWeight:700, marginBottom:10 }}>Financial analysis</p>
        <p style={{ color:"#2C4A33", fontSize:13, lineHeight:1.9, margin:0 }}>
          {(() => {
            const lines = [];
            lines.push("Under the current parameters for "+regionDisplay+" ("+selectedCrop.label+", "+farmSize+" ha, "+ownedPct+"% owned), TSP achieves a gross margin of "+fmtE(tspFin.grossMargin)+" per hectare with a ROFI of "+tspFin.rofi.toFixed(2)+"x. TSP ranks #"+tspRank+" out of "+FERTILIZERS.length+" treatments for this crop and region combination.");
            if (!tspIsBest) {
              lines.push("For "+selectedCrop.label.toLowerCase()+", "+bestTreatment.label+" produces the highest gross margin at "+fmtE(bestTreatment.margin)+" per hectare, which is "+fmtE(bestTreatment.margin - tspFin.grossMargin)+" more than TSP. This outcome reflects the crop's "+selectedCrop.nDemand+" nitrogen demand: the bundled N in "+bestTreatment.label+" provides a yield contribution that offsets its higher cost in this specific context. The P Doctrine does not claim universal superiority. It claims that separation is the better strategy when the crop's nitrogen demand does not justify paying for bundled N, and "+selectedCrop.label.toLowerCase()+" is a case where the data shows otherwise.");
              const tspY5 = computeFinancials(TSP, 4).grossMargin;
              const bestY5 = computeFinancials(allRanked[0], 4).grossMargin;
              if (tspY5 > bestY5) {
                lines.push("Over a longer horizon, TSP's lower efficiency decay ("+((selectedCrop.decayModByFert["TSP"])*100).toFixed(1)+"% per year versus "+bestTreatment.label+"'s "+((selectedCrop.decayModByFert[bestTreatment.id])*100).toFixed(1)+"%) shifts the economics. By season five, TSP achieves "+fmtE(tspY5)+" per hectare versus "+bestTreatment.label+"'s "+fmtE(bestY5)+". The long term case for separation holds even when the short term case does not.");
              } else {
                lines.push("Even over five seasons, "+bestTreatment.label+" maintains its advantage because "+selectedCrop.label.toLowerCase()+"'s nitrogen demand is high enough that the bundled N contributes real yield value throughout. The honest conclusion is that separation is not the optimal strategy for this specific crop.");
              }
            } else {
              lines.push("TSP produces the highest gross margin of all treatments for "+selectedCrop.label.toLowerCase()+" in this configuration. This is because "+selectedCrop.label.toLowerCase()+"'s "+selectedCrop.nDemand+" nitrogen demand means the farmer does not benefit from bundled N in compound products, and the extra cost of those products reduces the margin without a proportional yield increase.");
            }
            if(ownedPct<50) lines.push("With "+(100-ownedPct)+"% rented land adding "+EUR+Math.round(rentCostPerHa)+" per hectare in fixed costs, every euro of margin difference is more consequential to the farm's solvency.");
            return lines.join(" ");
          })()}
        </p>
      </div>

      {/* TAKEAWAYS */}
      <div style={{ background:"linear-gradient(135deg, #FFFFFF 0%, #0a1628 100%)", border:"1.5px solid #D6E8DA", borderRadius:16, padding:"24px 28px" }}>
        <p style={{ color:"#0F2415", fontSize:22, fontWeight:800, letterSpacing:"-0.02em", margin:"0 0 6px" }}>What this means for OCP Nutricrops</p>
        <p style={{ color:"#6B8F72", fontSize:12, margin:"0 0 20px", lineHeight:1.6 }}>
          Interpretation specific to {selectedCrop.label.toLowerCase()} grown in {regionDisplay}, France. Conclusions are scoped to the European context and depend on crop nutrient demand profile and farm cost structure.
        </p>
        {(()=>{
          const c=selectedCrop; const lowN=c.nDemand==="moderate"||c.nDemand==="medium";
          const tspY5 = computeFinancials(TSP, 4).grossMargin;
          const bestY5 = computeFinancials(allRanked[0], 4).grossMargin;
          const tspWinsLong = tspY5 > bestY5;
          const mkCard = (title, color, text) => (<div key={title} style={{ background:"#FFFFFF", borderRadius:12, padding:"16px 20px" }}><p style={{ color:color, fontSize:13, textTransform:"uppercase", letterSpacing:"0.14em", fontWeight:700, margin:"0 0 10px" }}>{title}</p><p style={{ color:"#2C4A33", fontSize:12, lineHeight:1.8, margin:0 }}>{text}</p></div>);

          const europeText = tspIsBest
            ? "For "+c.label.toLowerCase()+" in "+regionDisplay+", TSP delivers the highest gross margin of all treatments at "+fmtE(tspFin.grossMargin)+" per hectare. The commercial team can present this as a direct economic argument. At "+farmSize+" hectares, switching to TSP represents a total farm margin of "+fmtE(tspFin.grossMargin * farmSize)+"."
            : "For "+c.label.toLowerCase()+" in "+regionDisplay+", TSP ranks #"+tspRank+" out of "+FERTILIZERS.length+" treatments. "+bestTreatment.label+" produces the highest margin at "+fmtE(bestTreatment.margin)+" per hectare, which is "+fmtE(bestTreatment.margin-tspFin.grossMargin)+" more than TSP. This is an honest result: "+c.label.toLowerCase()+"'s "+c.nDemand+" nitrogen demand means compound products with bundled N provide a real yield advantage in this context. The commercial team should not oversell TSP on this crop."+(tspWinsLong ? " If the conversation shifts to multi season economics, TSP's lower decay rate reverses the ranking by season five." : " Even over five seasons, the compound advantage persists. Focus TSP messaging on crops where separation economics are unambiguous, such as potato and sugar beet.");

          const customText = tspIsBest
            ? "For "+c.label.toLowerCase()+", straight TSP is the most cost effective phosphorus delivery. Any customized formulation must match or beat TSP's cost per unit of usable "+P2O5+", or it will reduce the farmer's margin."
            : "For "+c.label.toLowerCase()+", "+bestTreatment.label+" outperforms TSP in season one because the crop's "+c.nDemand+" nitrogen demand means bundled N contributes to yield. This opens a formulation opportunity: a customized product combining concentrated P with a modest N component calibrated to "+c.label.toLowerCase()+"'s demand curve could capture the best of both approaches.";

          const nutritionText = tspIsBest
            ? "TSP tops the margin ranking for "+c.label.toLowerCase()+", validating the core product line in this crop context. Even products with comparable "+P2O5+" concentration do not match TSP's margin because accompanying nutrients add cost without proportional yield benefit."
            : "For "+c.label.toLowerCase()+", TSP is not the top performer, and the Nutrition Solutions team should present this transparently. "+bestTreatment.label+" wins because this crop's "+c.nDemand+" nitrogen demand means bundled N contributes real yield value."+(tspWinsLong ? " The honest argument is a multi season one: over five seasons, TSP's lower annual decay shifts the cumulative economics in its favor." : " For this specific crop, the data does not support a blanket TSP recommendation.");

          const cropTexts = {
            wheat: "Soft wheat has high demand for both phosphorus and nitrogen. Research from the University of Adelaide's Fertiliser Technology Research Centre shows that MAP and DAP can outperform TSP in certain soils because co-located ammonium and phosphate enhance early root development through localised pH effects. In this simulation, MAP and DAP rank above TSP for wheat because the bundled nitrogen provides a genuine yield contribution during tillering and stem elongation. TSP remains competitive and its lower efficiency decay means it gains ground over multiple seasons, but the first season advantage belongs to the ammoniated phosphates.",
            barley: "Barley has moderate P and N demand, making it the most cost sensitive of the major cereals. MAP tends to edge out TSP for barley because its modest nitrogen contribution aligns with the crop's moderate demand profile. TSP is competitive but does not dominate in the way it does on potato or sugar beet.",
            maize: "Maize is the crop where the P Doctrine faces its most direct challenge. Both P and N demand are substantial, with nitrogen uptake peaking during the V6 to V12 growth stages. MAP and DAP decisively outperform TSP because their bundled nitrogen provides critical yield contribution during this window. This is the context where the commercial team should be most honest: separation is not the optimal strategy for maize.",
            potato: "Potato is the strongest single crop case for nutrient separation in the entire French rotation. High P demand, moderate N demand, and direct quality damage from excess nitrogen make TSP the unambiguous winner. When nitrogen is bundled with phosphorus in a compound fertilizer, the resulting N surplus reduces tuber size uniformity and increases hollow heart incidence, both of which lower the price per tonne.",
            sugarbeet: "Sugar beet is highly sensitive to excess nitrogen, which reduces sugar content and extraction rate at the factory. Every kilogram of unnecessary N lowers the effective price per tonne because beet contracts typically include quality premiums tied to sugar percentage. TSP eliminates this risk by keeping P and N independent.",
            tomato: "Tomato is a high value crop where small yield differences create large margin swings. MAP outperforms TSP on tomato because the crop's high nitrogen demand during fruit development means the bundled N in MAP provides a genuine yield advantage that more than compensates for its higher cost.",
          };

          return (<div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {mkCard("OCP Europe "+MDASH+" Regional commercial team", "#2DB84B", europeText)}
            {mkCard("Customization BU", "#2DB84B", customText)}
            {mkCard("Nutrition Solutions BU", "#2DB84B", nutritionText)}
            {mkCard("Crop specific interpretation "+MDASH+" "+c.label, "#f59e0b", cropTexts[c.id]||"")}
          </div>);
        })()}
      </div>

      {/* CTA */}
      <div style={{ display:"flex", justifyContent:"center", paddingTop:4, gap:16 }}>
        <button className="restart-btn" onClick={()=>setPhase("narrative")} style={{ background:"transparent", border:"1.5px solid #2DB84B", color:"#2DB84B", padding:"14px 36px", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", transition:"all 0.2s" }}>{LARR} Change treatment</button>
        <button className="restart-btn" onClick={()=>{setPhase("configure");setCurrentFerts([]);}} style={{ background:"transparent", border:"1.5px solid #2C4A33", color:"#2C4A33", padding:"14px 36px", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", transition:"all 0.2s" }}>{LARR} New farm configuration</button>
      </div>
    </div>
  );
}



// ─── MARKET INTELLIGENCE PAGES ────────────────────────────────────────────────
function MIPlaceholder({ region }) {
  return <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:300,gap:12 }}><p style={{ fontSize:40 }}>🌍</p><p style={{ fontSize:15,color:"#6B8F72" }}>No market intelligence data for {region}.</p><p style={{ fontSize:12,color:"#6B8F72" }}>Available: {Object.keys(MARKET_INTEL).join(", ")}</p></div>;
}

// ─── FARMER P&L PAGE ──────────────────────────────────────────────────────────
// Data source: FADN / Réseau d'Information Comptable Agricole (RICA) France
// Average per farm, SOP above 25k€, values in €/ha
const FARMER_PL_DATA = {
  "Cereals & Oilseeds": {
    color:"#2DB84B", emoji:"🌾", farms:48140, uaa:134.81, uta:1.30, nonsalUta:1.17,
    totalOutput:1685.41,
    revenue:{ total:1412.14,
      sales:{ total:1366.96, cropSales:1278.76 },
      miscOutput:{ total:45.17, ownConsumption:1.19, storedProduction:-23.59, capitalisedProduction:6.01 },
      subsidies:{ total:264.22, decoupled:209.85, coupled:12.98,
        ruralDev:{ total:32.27, lhda:3.04, aecm:11.65 } },
      otherOutput:39.91,
      livestockPurchases:-14.54,
    },
    totalCosts:1581.19,
    costs:{
      cropSpecific:{ total:732.22, fertilisers:357.10, seeds:94.28, cropProtection:162.82 },
      livestockSpecific:{ total:16.47, feed:10.31 },
      otherOp:{ total:811.29, landRent:137.45, labour:25.96, depreciation:238.78, energy:102.29 },
      financial:21.22,
    },
  },
  "General Crops": {
    color:"#2DB84B", emoji:"🥕", farms:24745, uaa:111.88, uta:1.99, nonsalUta:1.29,
    totalOutput:3641.04,
    revenue:{ total:3225.69,
      sales:{ total:3120.22, cropSales:2420.90 },
      miscOutput:{ total:105.47, ownConsumption:0.54, storedProduction:46.30, capitalisedProduction:18.14 },
      subsidies:{ total:312.48, decoupled:213.35, coupled:16.09,
        ruralDev:{ total:32.80, lhda:3.66, aecm:11.71 } },
      otherOutput:55.60,
      livestockPurchases:-17.61,
    },
    totalCosts:2887.56,
    costs:{
      cropSpecific:{ total:1212.01, fertilisers:487.93, seeds:248.03, cropProtection:247.14 },
      livestockSpecific:{ total:50.05, feed:39.69 },
      otherOp:{ total:1586.79, landRent:225.69, labour:170.45, depreciation:399.89, energy:173.22 },
      financial:38.70,
    },
  },
  "Market Gardening": {
    color:"#f59e0b", emoji:"🥦", farms:7629, uaa:16.26, uta:4.85, nonsalUta:1.42,
    totalOutput:25835.79,
    revenue:{ total:24319.80,
      sales:{ total:23956.95, cropSales:334.81 },
      miscOutput:{ total:362.85, ownConsumption:6.77, storedProduction:68.88, capitalisedProduction:151.29 },
      subsidies:{ total:1094.10, decoupled:190.04, coupled:27.68,
        ruralDev:{ total:62.12, lhda:9.23, aecm:48.59 } },
      otherOutput:279.83,
      livestockPurchases:-84.26,
    },
    totalCosts:22060.27,
    costs:{
      cropSpecific:{ total:4268.76, fertilisers:1121.77, seeds:2207.26, cropProtection:451.41 },
      livestockSpecific:{ total:55.35, feed:46.74 },
      otherOp:{ total:17538.75, landRent:337.02, labour:5666.05, depreciation:2480.32, energy:2627.92 },
      financial:197.42,
    },
  },
  "Viticulture": {
    color:"#a78bfa", emoji:"🍇", farms:44240, uaa:26.87, uta:2.63, nonsalUta:1.26,
    totalOutput:11401.94,
    revenue:{ total:9901.00,
      sales:{ total:9726.83, cropSales:2026.05 },
      miscOutput:{ total:174.17, ownConsumption:217.34, storedProduction:573.13, capitalisedProduction:183.48 },
      subsidies:{ total:383.33, decoupled:128.02, coupled:4.84,
        ruralDev:{ total:116.49, lhda:6.70, aecm:24.93 } },
      otherOutput:146.26,
      livestockPurchases:-2.98,
    },
    totalCosts:8714.55,
    costs:{
      cropSpecific:{ total:1520.28, fertilisers:291.03, seeds:61.78, cropProtection:407.89 },
      livestockSpecific:{ total:11.16, feed:8.19 },
      otherOp:{ total:7048.01, landRent:1049.87, labour:1503.16, depreciation:1186.83, energy:315.59 },
      financial:134.72,
    },
  },
};


function MIFarmerPLPage() {
  const [farmType, setFarmType] = useState("Cereals & Oilseeds");
  const [expanded, setExpanded] = useState({ output:true, costs:true });
  const d = FARMER_PL_DATA[farmType];
  const toggle = key => setExpanded(e => ({...e, [key]:!e[key]}));
  const netIncome = d.totalOutput - d.totalCosts;
  const fertPct = ((d.costs.cropSpecific.fertilisers / d.totalCosts) * 100).toFixed(1);

  const fmtV = v => {
    const abs = Math.abs(v);
    const formatted = abs >= 1000 ? abs.toLocaleString("fr-FR",{minimumFractionDigits:0,maximumFractionDigits:0}) : abs.toFixed(2);
    return (v < 0 ? "−" : "") + "€" + formatted;
  };
  const pctRev = v => ((v / d.totalOutput) * 100).toFixed(1) + "%";

  // Bar chart data for output vs costs vs net
  const barData = [
    { name:"Total output", value:d.totalOutput, fill:d.color },
    { name:"Crop costs",   value:-d.costs.cropSpecific.total, fill:"#f43f5e" },
    { name:"Other op.",    value:-d.costs.otherOp.total, fill:"#f59e0b" },
    { name:"Livestock",    value:-d.costs.livestockSpecific.total, fill:"#6B8F72" },
    { name:"Financial",    value:-d.costs.financial, fill:"#9BB5A0" },
    { name:"Net income",   value:netIncome, fill:netIncome>=0?"#2DB84B":"#ef4444" },
  ];

  // Cost breakdown for donut
  const costPie = [
    { name:"Fertilisers",    value:d.costs.cropSpecific.fertilisers,   color:"#2DB84B" },
    { name:"Seeds",          value:d.costs.cropSpecific.seeds,          color:"#818cf8" },
    { name:"Crop prot.",     value:d.costs.cropSpecific.cropProtection, color:"#f43f5e" },
    { name:"Land rent",      value:d.costs.otherOp.landRent,            color:"#f59e0b" },
    { name:"Labour",         value:d.costs.otherOp.labour,              color:"#2DB84B" },
    { name:"Depreciation",   value:d.costs.otherOp.depreciation,        color:"#6B8F72" },
    { name:"Energy",         value:d.costs.otherOp.energy,              color:"#a78bfa" },
    { name:"Livestock",      value:d.costs.livestockSpecific.total,     color:"#6B8F72" },
    { name:"Financial",      value:d.costs.financial,                   color:"#6B8F72" },
  ].filter(x=>x.value>0);

  // P&L row component
  const Row = ({ label, value, indent=0, bold=false, header=false, sign=false, expandKey=null, children=null, color=null, dimmed=false }) => {
    const isOpen = expanded[expandKey];
    const textColor = header?"#2DB84B":bold?"#0F2415":dimmed?"#9BB5A0":"#6B8F72";
    const valColor = color||(header?d.color:bold?"#0F2415":"#6B8F72");
    const bg = header?"#F3F8F4":bold?"#F7F9F7":"transparent";
    const displayVal = sign && value>0 ? "+"+fmtV(value) : fmtV(value);
    return (
      <>
        <div onClick={expandKey?()=>toggle(expandKey):undefined}
          style={{ display:"flex", alignItems:"center", padding:`${header||bold?"9px":"6px"} 14px`, background:bg,
            borderBottom:"1px solid #0d1829", cursor:expandKey?"pointer":"default",
            paddingLeft: 14+indent*16 }}
          onMouseEnter={e=>{if(!bold&&!header)e.currentTarget.style.background="#0a1018";}}
          onMouseLeave={e=>{if(!bold&&!header)e.currentTarget.style.background=bg;}}>
          {expandKey && <span style={{color:"#6B8F72",fontSize:10,marginRight:7,width:10,flexShrink:0}}>{isOpen?"▼":"▶"}</span>}
          {!expandKey && indent>0 && <span style={{color:"#D6E8DA",marginRight:7,width:10,flexShrink:0}}>└</span>}
          {!expandKey && indent===0 && <span style={{width:17,flexShrink:0}}/>}
          <span style={{ flex:1, fontSize:header?12:bold?12:11, fontWeight:header||bold?700:400, color:textColor, fontStyle:dimmed?"italic":"normal" }}>{label}</span>
          <span style={{ fontSize:bold||header?12:11, fontWeight:bold||header?700:500, fontFamily:"'DM Mono',monospace", color:valColor, width:96, textAlign:"right" }}>{displayVal}</span>
          <span style={{ fontSize:10, color:"#6B8F72", width:46, textAlign:"right", fontFamily:"'DM Mono',monospace" }}>{pctRev(Math.abs(value))}</span>
        </div>
        {expandKey && isOpen && children}
      </>
    );
  };

  const Divider = ({ label }) => (
    <div style={{ background:"#FFFFFF", padding:"4px 14px 3px", borderBottom:"1px solid #0d1829" }}>
      <span style={{ color:"#6B8F72", fontSize:9, textTransform:"uppercase", letterSpacing:"0.1em" }}>{label}</span>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:14 }}>
        <div>
          <h2 style={{ color:"#0F2415", fontSize:17, fontWeight:800, marginBottom:3 }}>Farmer P&L — Average per farm · €/Ha <span style={{color:"#6B8F72",fontWeight:400,fontSize:13}}>(2024)</span></h2>
          <p style={{ color:"#6B8F72", fontSize:11 }}>Source: FADN / RICA France · Standard Output &gt; 25k€ · Values in €/Ha unless stated</p>
        </div>

      </div>

      {/* Farm type selector */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {Object.entries(FARMER_PL_DATA).map(([key,val])=>(
          <button key={key} onClick={()=>setFarmType(key)}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 16px", borderRadius:10,
              border:`2px solid ${farmType===key?val.color:val.color+"28"}`,
              background:farmType===key?val.color+"18":"transparent",
              color:farmType===key?val.color:"#6B8F72",
              fontSize:12, fontWeight:farmType===key?700:400, cursor:"pointer", transition:"all 0.15s" }}>
            <span style={{fontSize:15}}>{val.emoji}</span> {key}
          </button>
        ))}
      </div>

      {/* Farm characteristics strip */}
      <div style={{ background:"#F3F8F4", border:"1px solid #D6E8DA", borderRadius:10, padding:"10px 16px", display:"flex", gap:24, flexWrap:"wrap" }}>
        {[
          {label:"Farms represented",   val:d.farms.toLocaleString()+" farms"},
          {label:"Utilised agri. area",  val:d.uaa+" ha / farm"},
          {label:"Annual work units",    val:d.uta+" UTA"},
          {label:"of which non-salaried",val:d.nonsalUta+" UTA"},
        ].map((item,i)=>(
          <div key={i}>
            <p style={{ color:"#6B8F72", fontSize:9, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:2 }}>{item.label}</p>
            <p style={{ color:"#6B8F72", fontSize:12, fontFamily:"'DM Mono',monospace" }}>{item.val}</p>
          </div>
        ))}
      </div>

      {/* KPI strip — only what's in the document */}
      <div className="kpi-row">
        <KPICard label="Total current output" value={"€"+d.totalOutput.toLocaleString()+"/ha"} sub="net of livestock purchases" accent={d.color}/>
        <KPICard label="Total current costs"  value={"€"+d.totalCosts.toLocaleString()+"/ha"} sub={((d.totalCosts/d.totalOutput)*100).toFixed(0)+"% of output"} accent="#f43f5e"/>
        <KPICard label="Net income"           value={(netIncome>=0?"+":"-")+"€"+Math.abs(netIncome).toFixed(0)+"/ha"} sub="total output − total costs" accent={netIncome>=0?"#2DB84B":"#f43f5e"}/>
        <KPICard label="Fertilisers & soil"   value={"€"+d.costs.cropSpecific.fertilisers+"/ha"} sub={fertPct+"% of total costs"} accent="#2DB84B"/>
      </div>

      <div className="chart-grid-2">
        {/* Output vs costs bar chart */}
        <div className="card">
          <h3 className="card-title">Output vs Costs breakdown (€/ha)</h3>
          <p style={{ color:"#6B8F72", fontSize:11, marginBottom:10 }}>Net income = Total output − Total costs</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ left:8, right:8, bottom:10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D6E8DA" vertical={false}/>
              <XAxis dataKey="name" tick={{ fill:"#6B8F72", fontSize:9 }} angle={-12} textAnchor="end" height={38}/>
              <YAxis tick={{ fill:"#6B8F72", fontSize:9 }} tickFormatter={v=>v>=0?"€"+(v/1000).toFixed(0)+"k":"−€"+(-v/1000).toFixed(0)+"k"}/>
              <Tooltip content={<CustomTooltip/>} formatter={v=>["€"+Math.abs(v).toLocaleString(),""]}/>
              <ReferenceLine y={0} stroke="#B8D4BE" strokeWidth={1}/>
              <Bar dataKey="value" radius={[4,4,0,0]}>{barData.map((d2,i)=><Cell key={i} fill={d2.fill}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cost structure donut */}
        <div className="card">
          <h3 className="card-title">Cost structure — €{d.totalCosts.toLocaleString()}/ha total</h3>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie data={costPie} cx="50%" cy="50%" innerRadius={48} outerRadius={78} dataKey="value" paddingAngle={2}>
                {costPie.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip formatter={(v,n)=>["€"+v+"/ha · "+((v/d.totalCosts)*100).toFixed(1)+"%",n]}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"3px 12px" }}>
            {costPie.map((e,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:7,height:7,borderRadius:2,background:e.color }}/>
                <span style={{ color:"#6B8F72", fontSize:10 }}>{e.name} <span style={{ color:e.color, fontFamily:"'DM Mono',monospace" }}>{((e.value/d.totalCosts)*100).toFixed(0)}%</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FULL P&L TABLE — exact FADN structure, all expandable ── */}
      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        {/* Header row */}
        <div style={{ display:"flex", padding:"10px 14px 10px 31px", background:"#FFFFFF", borderBottom:"2px solid #D6E8DA" }}>
          <span style={{ flex:1, color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.06em" }}>Line item</span>
          <span style={{ color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.06em", width:96, textAlign:"right" }}>€ / ha</span>
          <span style={{ color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.06em", width:46, textAlign:"right" }}>% out.</span>
        </div>

        {/* TOTAL CURRENT OUTPUT — top line */}
        <Row label="Total current output (net of livestock purchases)" value={d.totalOutput} bold header color={d.color} expandKey="output">
          <Divider label="Revenue"/>
          <Row label="Sales" value={d.revenue.sales.total} indent={1} bold expandKey="sales">
            <Row label="of which: Crop sales" value={d.revenue.sales.cropSales} indent={2} dimmed/>
          </Row>
          <Row label="Miscellaneous output" value={d.revenue.miscOutput.total} indent={1} expandKey="misc">
            <Row label="+ Own consumption"       value={d.revenue.miscOutput.ownConsumption}       indent={2}/>
            <Row label="+ Stored production"     value={d.revenue.miscOutput.storedProduction}     indent={2}/>
            <Row label="+ Capitalised production" value={d.revenue.miscOutput.capitalisedProduction} indent={2}/>
          </Row>
          <Row label="+ Operating subsidies" value={d.revenue.subsidies.total} color="#818cf8" indent={1} expandKey="subs">
            <Row label="Decoupled payments (BPS, redistributive, GS...)" value={d.revenue.subsidies.decoupled} indent={2}/>
            <Row label="Coupled payments"          value={d.revenue.subsidies.coupled}            indent={2}/>
            <Row label="Rural development support" value={d.revenue.subsidies.ruralDev.total}     indent={2} expandKey="ruralDev">
              <Row label="of which: LHDA (Less Favoured Area payments)"      value={d.revenue.subsidies.ruralDev.lhda} indent={3} dimmed/>
              <Row label="of which: AECM and Organic farming support"        value={d.revenue.subsidies.ruralDev.aecm} indent={3} dimmed/>
            </Row>
          </Row>
          <Row label="+ Other current output"   value={d.revenue.otherOutput}         indent={1}/>
          <Row label="− Livestock purchases"    value={d.revenue.livestockPurchases}   indent={1} color="#f43f5e"/>
        </Row>

        {/* TOTAL CURRENT COSTS */}
        <Row label="Total current costs" value={-d.totalCosts} bold header color="#f43f5e" expandKey="costs">
          <Row label="= Cost specific to crops" value={-d.costs.cropSpecific.total} indent={1} bold expandKey="cropCosts">
            <Row label="Fertilisers and soil amendments" value={-d.costs.cropSpecific.fertilisers}   color="#2DB84B" indent={2}/>
            <Row label="Seeds and seedlings"             value={-d.costs.cropSpecific.seeds}          indent={2}/>
            <Row label="Crop protection products"        value={-d.costs.cropSpecific.cropProtection} indent={2}/>
          </Row>
          <Row label="+ Livestock-specific costs" value={-d.costs.livestockSpecific.total} indent={1} expandKey="livCosts">
            <Row label="Livestock feed" value={-d.costs.livestockSpecific.feed} indent={2}/>
          </Row>
          <Row label="+ Other operating costs" value={-d.costs.otherOp.total} indent={1} bold expandKey="otherCosts">
            <Row label="Land rent"     value={-d.costs.otherOp.landRent}     indent={2}/>
            <Row label="Labour costs"  value={-d.costs.otherOp.labour}       indent={2}/>
            <Row label="Depreciation"  value={-d.costs.otherOp.depreciation} indent={2}/>
            <Row label="Energy"        value={-d.costs.otherOp.energy}       indent={2}/>
          </Row>
          <Row label="+ Financial charges" value={-d.costs.financial} indent={1}/>
        </Row>

        {/* NET INCOME — bottom line */}
        <div style={{ display:"flex", alignItems:"center", padding:"12px 14px 12px 31px", background:"#0a1628", borderTop:"2px solid #D6E8DA" }}>
          <span style={{ flex:1, fontSize:13, fontWeight:800, color:"#0F2415" }}>Net income (total output − total costs)</span>
          <span style={{ fontSize:15, fontWeight:800, fontFamily:"'DM Mono',monospace", color:netIncome>=0?"#2DB84B":"#f43f5e", width:96, textAlign:"right" }}>
            {netIncome>=0?"+ ":"− "}€{Math.abs(netIncome).toFixed(0)}
          </span>
          <span style={{ fontSize:11, fontWeight:700, fontFamily:"'DM Mono',monospace", color:netIncome>=0?"#2DB84B80":"#f43f5e80", width:46, textAlign:"right" }}>
            {((netIncome/d.totalOutput)*100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Fertiliser in context */}
      <div style={{ background:`linear-gradient(135deg,#0e2535,#FFFFFF)`, border:"1px solid #2DB84B30", borderRadius:12, padding:"16px 20px" }}>
        <p style={{ color:"#2DB84B", fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8, fontWeight:700 }}>🧪 Fertilisers in context — {farmType} {d.emoji}</p>
        <p style={{ color:"#6B8F72", fontSize:12, lineHeight:1.75 }}>
          Fertilisers & soil amendments represent <span style={{ color:"#2DB84B", fontWeight:700 }}>€{d.costs.cropSpecific.fertilisers}/ha</span> ({fertPct}% of total costs). Against total output of €{d.totalOutput.toLocaleString()}/ha, this represents {((d.costs.cropSpecific.fertilisers/d.totalOutput)*100).toFixed(1)}% of farm revenue — a relatively small share where agronomic improvements from P separation can generate a net positive return even at a modest yield uplift.
        </p>
      </div>
    </div>
  );
}



function MIMarketDynamicsPage({ region }) {
  const intel=MARKET_INTEL[region];
  const [recoOpen,setRecoOpen]=useState(false);
  if (!intel) return <MIPlaceholder region={region} />;
  const maxMix=Math.max(...intel.productMix.map(r=>r.val2022));

  const MACRO_KPIS = [
    { label:"Population", value:"68.4 M", unit:"habitants", year:"2024", accent:"#2DB84B" },
    { label:"Agriculture / GDP", value:"1.43%", unit:"share of GDP", year:"2024", accent:"#2DB84B" },
    { label:"P2O5 consumed", value:"226 kt", unit:"nutrient", year:"2023", accent:"#f59e0b" },
    { label:"Total agri. land", value:"27 000 kha", unit:"utilised area", year:"2024", accent:"#a78bfa" },
  ];

  const RECOS = [
    { icon:"📢", color:"#2DB84B", title:"Rebuild P consumption", body:"Quantify the agronomic gap, run campaigns on the economic value of balanced P fertilization using Comifer/BDAT data. Partner with coops, INRAE and Arvalis for multi-year field trials — flagship farms that prove yield and soil fertility benefits." },
    { icon:"🌾", color:"#2DB84B", title:"Position TSP as the reference low-carbon P", body:"Make 'High P / Low N' the default narrative for French broad-acre crops — winter cereals, rapeseed, pulses. Build a portfolio around it: high-P NPs, DAP, customized PK/NP blends that enable N/P decoupling." },
    { icon:"🤝", color:"#f59e0b", title:"Co-design blends with major coops", body:"Use regional soil data and crop requirements to create PK and PK+ products with secondary nutrients and micronutrients. Consider an industrial JV for PK blending to compete directly with ICL and Timac on semi-specialty products." },
    { icon:"🛰️", color:"#a78bfa", title:"Build a farmer-centric service layer", body:"Local agronomy team + digital offering around soil testing, mapping and precision tools (BeApi etc). Regular workshops, field days and Ferti-tour roadshows with coops and private retailers." },
    { icon:"🏗️", color:"#818cf8", title:"Go direct-to-coop in France", body:"Create a local commercial subsidiary. Formalize long-term partnerships with key purchasing groups, offer flexible contracting and consignment stock. Co-brand customized blends to bypass importers and improve netbacks." },
    { icon:"⚖️", color:"#f43f5e", title:"Own the regulatory narrative", body:"Work with UNIFA, Comifer, FNSEA and FMCGs to promote science-based standards that favor high-quality, low-cadmium Moroccan P. Position OCP Nutricrops as the partner for low-carbon, resilient cropping systems in France." },
  ];

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:22 }}>

      {/* Macro KPIs — clean, no data period header */}
      <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
        {MACRO_KPIS.map((k,i)=>(
          <div key={i} style={{ background:"linear-gradient(135deg,#FFFFFF,#F7F9F7)",border:`1px solid ${k.accent}25`,borderRadius:14,padding:"16px 20px",flex:"1 1 150px",minWidth:140,position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:-12,right:-12,width:50,height:50,borderRadius:"50%",background:k.accent+"08" }}/>
            <p style={{ color:"#6B8F72",fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6 }}>{k.label}</p>
            <p style={{ color:k.accent,fontSize:22,fontWeight:800,fontFamily:"'DM Mono',monospace",margin:0 }}>{k.value}</p>
            <p style={{ color:"#6B8F72",fontSize:11,marginTop:3 }}>{k.unit}</p>
            <span style={{ position:"absolute",bottom:10,right:12,color:k.accent+"60",fontSize:10,fontFamily:"'DM Mono',monospace" }}>{k.year}</span>
          </div>
        ))}
      </div>

      {/* Product mix + import origin */}
      <div className="chart-grid-2">
        <div className="card">
          <h3 className="card-title">P2O5 Consumption by Product — kt</h3>
          <p style={{color:"#6B8F72",fontSize:10,marginBottom:10}}>2022 → 2023 · Source: Agreste / UNIFA</p>
          <div style={{ display:"flex",flexDirection:"column",gap:12,marginTop:4 }}>
            {intel.productMix.map((row,i)=><AnimBar key={i} label={row.name} val2022={row.val2022} val2023={row.val2023} maxVal={maxMix} color={row.color} />)}
          </div>
        </div>
        <div className="card">
          <h3 className="card-title">DAP/MAP Import Origin — kt P2O5</h3>
          <p style={{color:"#6B8F72",fontSize:10,marginBottom:6}}>2024 · Source: UNIFA / French Customs</p>
          <ResponsiveContainer width="100%" height={195}>
            <PieChart>
                <Pie data={intel.importOrigin} cx="50%" cy="50%" outerRadius={78} dataKey="value"
                  label={({cx,cy,midAngle,innerRadius,outerRadius,value,name}) => {
                    const RADIAN=Math.PI/180;
                    const r=innerRadius+(outerRadius-innerRadius)*0.55;
                    const x=cx+r*Math.cos(-midAngle*RADIAN);
                    const y=cy+r*Math.sin(-midAngle*RADIAN);
                    const pct=((value/106.9)*100).toFixed(0);
                    return value>1.5?(
                      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={value>10?11:9} fontWeight={700} fontFamily="DM Mono,monospace">{value>=10?value+"kt":pct+"%"}</text>
                    ):null;
                  }}
                  labelLine={false}>
                  {intel.importOrigin.map((d,i)=><Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v,n)=>[`${v} kt`,n]} />
              </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex",flexWrap:"wrap",gap:8,marginTop:4 }}>{intel.importOrigin.map((d,i)=><div key={i} style={{ display:"flex",alignItems:"center",gap:5 }}><div style={{ width:8,height:8,borderRadius:2,background:d.color }}/><span style={{ color:"#6B8F72",fontSize:11 }}>{d.name} {d.value}kt</span></div>)}</div>
        </div>
      </div>

      {/* ── EXECUTIVE BRIEF ── */}
      <div style={{ background:"linear-gradient(135deg,#FFFFFF,#060b14)", border:"1px solid #D6E8DA", borderRadius:16, overflow:"hidden" }}>

        {/* Header */}
        <div style={{ padding:"18px 24px 16px", borderBottom:"1px solid #D6E8DA", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.12em", fontWeight:700, marginBottom:4 }}>Executive Brief</p>
            <p style={{ color:"#0F2415", fontSize:16, fontWeight:700, margin:0 }}>What is happening in France — the P market in 2024</p>
          </div>
          <span style={{ color:"#D6E8DA", fontSize:11, fontStyle:"italic" }}>France · P fertilizer</span>
        </div>

        {/* Narrative body — one flowing story, not boxes */}
        <div style={{ padding:"24px", display:"flex", flexDirection:"column", gap:18 }}>

          {/* Act 1 */}
          <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
            <div style={{ flexShrink:0, width:28, height:28, borderRadius:"50%", background:"#2DB84B20", border:"1px solid #2DB84B40", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, marginTop:2 }}>1</div>
            <div>
              <p style={{ color:"#2C4A33", fontSize:14, fontWeight:600, marginBottom:6 }}>The soil is being mined — quietly, at scale</p>
              <p style={{ color:"#6B8F72", fontSize:13, lineHeight:1.85, margin:0 }}>
                Since 2021, P applications in France have fallen by roughly 29%. Today, <span style={{color:"#0F2415",fontWeight:600}}>only half of French parcels receive any mineral P at all</span>. Farmers are not replacing what crops take out. The agronomic gap versus Comifer recommendations is now 157 kt P₂O₅ — the equivalent of leaving an entire year's TSP import sitting in the ground unplanted.
              </p>
            </div>
          </div>

          <div style={{ height:1, background:"#D6E8DA", marginLeft:44 }}/>

          {/* Act 2 */}
          <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
            <div style={{ flexShrink:0, width:28, height:28, borderRadius:"50%", background:"#f59e0b20", border:"1px solid #f59e0b40", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, marginTop:2, color:"#f59e0b" }}>2</div>
            <div>
              <p style={{ color:"#2C4A33", fontSize:14, fontWeight:600, marginBottom:6 }}>Prices broke the habit — and farmers didn't recover it</p>
              <p style={{ color:"#6B8F72", fontSize:13, lineHeight:1.85, margin:0 }}>
                The 2022 price spike created a scissors effect: input costs doubled while margins compressed. Farmers responded rationally — they <span style={{color:"#0F2415",fontWeight:600}}>protected nitrogen and cut P and K</span>. The problem is that this became a habit. Even as prices normalised, the behaviour stuck. P is now the first line item cut when budgets tighten.
              </p>
            </div>
          </div>

          <div style={{ height:1, background:"#D6E8DA", marginLeft:44 }}/>

          {/* Act 3 */}
          <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
            <div style={{ flexShrink:0, width:28, height:28, borderRadius:"50%", background:"#2DB84B20", border:"1px solid #2DB84B40", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, marginTop:2, color:"#2DB84B" }}>3</div>
            <div>
              <p style={{ color:"#2C4A33", fontSize:14, fontWeight:600, marginBottom:6 }}>Who controls the market? Coops — and Morocco is well placed</p>
              <p style={{ color:"#6B8F72", fontSize:13, lineHeight:1.85, margin:0 }}>
                France produces no TSP or DAP domestically. Everything is imported. <span style={{color:"#2DB84B",fontWeight:600}}>Morocco (OCP) already holds ~62% of the DAP/MAP import market</span>. But the real gatekeepers are the large purchasing cooperatives — Inoxa, Axereal, InVivo — which control blending, warehousing and agronomy advice for ~70% of fertilizer volumes. Access without them is nearly impossible.
              </p>
            </div>
          </div>

          <div style={{ height:1, background:"#D6E8DA", marginLeft:44 }}/>

          {/* Act 4 */}
          <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
            <div style={{ flexShrink:0, width:28, height:28, borderRadius:"50%", background:"#a78bfa20", border:"1px solid #a78bfa40", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, marginTop:2, color:"#a78bfa" }}>4</div>
            <div>
              <p style={{ color:"#2C4A33", fontSize:14, fontWeight:600, marginBottom:6 }}>The market is moving toward value — and regulation favours clean P</p>
              <p style={{ color:"#6B8F72", fontSize:13, lineHeight:1.85, margin:0 }}>
                Standard NPKs are losing share. Farmers and coops are shifting to NPK+ grades — blends with sulphur, micronutrients and biostimulants. At the same time, EU heavy metal and carbon regulations are tightening. <span style={{color:"#a78bfa",fontWeight:600}}>OCP's low-cadmium Moroccan P is structurally advantaged</span> — not as a marketing claim, but as a regulatory compliance asset for the next decade.
              </p>
            </div>
          </div>
        </div>

        {/* So what CTA */}
        <div style={{ borderTop:"1px solid #D6E8DA" }}>
          {!recoOpen ? (
            <button onClick={()=>setRecoOpen(true)}
              style={{ width:"100%", padding:"18px 24px", background:"transparent", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, transition:"background 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.background="#0f1f14"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{ textAlign:"left" }}>
                <p style={{ color:"#2DB84B", fontSize:12, fontWeight:700, marginBottom:4 }}>So what does this mean for OCP Nutricrops?</p>
                <p style={{ color:"#6B8F72", fontSize:12, margin:0 }}>6 strategic plays that follow directly from this brief — from rebuilding P consumption to owning the regulatory narrative.</p>
              </div>
              <div style={{ flexShrink:0, background:"#2DB84B20", border:"1px solid #2DB84B40", borderRadius:8, padding:"8px 16px", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ color:"#2DB84B", fontSize:12, fontWeight:700 }}>Discover</span>
                <span style={{ color:"#2DB84B", fontSize:16 }}>→</span>
              </div>
            </button>
          ) : (
            <div style={{ padding:"20px 24px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                <p style={{ color:"#2DB84B", fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em" }}>Strategic recommendations — OCP Nutricrops · France</p>
                <button onClick={()=>setRecoOpen(false)} style={{ background:"transparent", border:"1px solid #D6E8DA", color:"#c8d3e0", borderRadius:6, padding:"4px 12px", fontSize:11, cursor:"pointer" }}>← hide</button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:12 }}>
                {RECOS.map((r,i)=>(
                  <div key={i} style={{ background:"#FFFFFF", border:`1px solid ${r.color}25`, borderLeft:`3px solid ${r.color}`, borderRadius:10, padding:"14px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                      <span style={{ fontSize:15 }}>{r.icon}</span>
                      <p style={{ color:r.color, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", margin:0 }}>{r.title}</p>
                    </div>
                    <p style={{ color:"#6B8F72", fontSize:12, lineHeight:1.75, margin:0 }}>{r.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MIFarmerBSPage() {
  const [farmType, setFarmType] = useState("Cereals & Oilseeds");
  const [expandedBS, setExpandedBS] = useState({ assets:true, equity:true, debt:true });
  const [activeTooltip, setActiveTooltip] = useState(null);
  const toggleBS = key => setExpandedBS(e => ({...e, [key]:!e[key]}));

  const BS_DATA = {
    "Cereals & Oilseeds": {
      color:"#2DB84B", emoji:"🌾", note:"Céréales et oléoprotéagineux — Average per farm · €/Ha · 2024",
      assets:{ fixed:{ total:1671.98, items:{ "Land":372.38,"Land improvements":22.03,"Buildings":187.52,"Specialised installations":67.50,"Machinery":769.75,"Plantations (incl. forest)":4.75,"Breeding livestock":35.09,"Other fixed assets":213.00 }}, current:{ total:1539.65, items:{ "Inventories & work in progress":637.34,"of which current livestock":23.74,"Receivables":476.89,"Cash & equivalents":425.49,"Asset accruals":18.99 }}, total:3230.62 },
      equity:{ total:1959.65, items:{ "Initial individual capital":1241.67,"Change in initial capital":700.84,"Investment subsidies":17.14 }},
      debt:{ total:1269.19, items:{ "Long & medium-term debt":803.50,"Short-term borrowings & other financial liabilities":119.13,"Trade & other payables":346.64,"Liability accruals":1.85 }},
      totalLE:3230.62, ratios:{ gosHa:0.35, gosAWU:40.57, profitHa:0.10, profitAWU:11.97, debtRatio:39.29, marginRate:25.01 }
    },
    "General Crops": {
      color:"#2DB84B", emoji:"🌱", note:"Grandes cultures — Average per farm · €/Ha · 2024",
      assets:{ fixed:{ total:3060.96, items:{ "Land":344.48,"Land improvements":18.32,"Buildings":462.91,"Specialised installations":191.46,"Machinery":1091.17,"Plantations (incl. forest)":16.98,"Breeding livestock":76.24,"Other fixed assets":859.40 }}, current:{ total:2754.20, items:{ "Inventories & work in progress":1115.75,"of which current livestock":60.60,"Receivables":954.95,"Cash & equivalents":683.50,"Asset accruals":54.70 }}, total:5869.86 },
      equity:{ total:3389.97, items:{ "Initial individual capital":1929.66,"Change in initial capital":1405.52,"Investment subsidies":54.70 }},
      debt:{ total:2472.74, items:{ "Long & medium-term debt":1595.19,"Short-term borrowings & other financial liabilities":166.16,"Trade & other payables":711.39,"Liability accruals":7.15 }},
      totalLE:5869.86, ratios:{ gosHa:1.17, gosAWU:101.85, profitHa:0.75, profitAWU:65.43, debtRatio:42.13, marginRate:36.36 }
    },
    "Market Gardening": {
      color:"#f59e0b", emoji:"🥦", note:"Maraîchage — Average per farm · €/Ha · 2024",
      assets:{ fixed:{ total:13362.85, items:{ "Land":939.11,"Land improvements":152.52,"Buildings":3572.57,"Specialised installations":2891.76,"Machinery":4317.34,"Plantations (incl. forest)":156.83,"Breeding livestock":86.72,"Other fixed assets":1246.62 }}, current:{ total:10909.59, items:{ "Inventories & work in progress":2403.44,"of which current livestock":47.97,"Receivables":3030.75,"Cash & equivalents":5475.40,"Asset accruals":353.63 }}, total:24626.08 },
      equity:{ total:11649.45, items:{ "Initial individual capital":7313.04,"Change in initial capital":3365.31,"Investment subsidies":971.09 }},
      debt:{ total:12967.40, items:{ "Long & medium-term debt":7872.08,"Short-term borrowings & other financial liabilities":916.36,"Trade & other payables":4178.97,"Liability accruals":8.61 }},
      totalLE:24626.08, ratios:{ gosHa:6.37, gosAWU:73.15, profitHa:3.78, profitAWU:43.38, debtRatio:52.66, marginRate:26.18 }
    },
    "Viticulture": {
      color:"#a78bfa", emoji:"🍇", note:"Viticulture — Average per farm · €/Ha · 2024",
      assets:{ fixed:{ total:10976.55, items:{ "Land":3545.59,"Land improvements":63.64,"Buildings":2074.80,"Specialised installations":231.48,"Machinery":2358.76,"Plantations (incl. forest)":2085.23,"Breeding livestock":11.91,"Other fixed assets":605.14 }}, current:{ total:18059.17, items:{ "Inventories & work in progress":11894.31,"of which current livestock":6.70,"Receivables":3329.74,"Cash & equivalents":2835.50,"Asset accruals":83.36 }}, total:29119.09 },
      equity:{ total:20427.24, items:{ "Initial individual capital":12281.35,"Change in initial capital":7365.46,"Investment subsidies":780.42 }},
      debt:{ total:8678.45, items:{ "Long & medium-term debt":4709.71,"Short-term borrowings & other financial liabilities":978.04,"Trade & other payables":2990.70,"Liability accruals":13.40 }},
      totalLE:29119.09, ratios:{ gosHa:3.96, gosAWU:84.14, profitHa:2.69, profitAWU:57.14, debtRatio:29.80, marginRate:39.97 }
    },
  };

  const RATIO_TOOLTIPS = {
    gosHa:     { label:"GOS/ha (k€/ha)",                        desc:"Gross Operating Surplus per hectare — farm profitability per unit of land, before depreciation and financial charges." },
    gosAWU:    { label:"GOS / AWU non-salaried (k€/UTA)",       desc:"GOS per non-salaried Annual Work Unit — closest proxy to the entrepreneurial income of the farm operator in FADN accounting." },
    profitHa:  { label:"Current profit before tax / ha (k€/ha)",desc:"Net accounting income per hectare after all costs, depreciation and financial charges but before tax." },
    profitAWU: { label:"Current profit before tax / AWU (k€/UTA)",desc:"Net profit per non-salaried labour unit — tests whether farm generates a return above the opportunity cost of operator labour." },
    debtRatio: { label:"Debt ratio — Debt / Total Assets (%)",   desc:"Share of assets financed by creditors. Higher ratio = higher leverage and lower capacity to absorb commodity price shocks." },
    marginRate:{ label:"Margin rate — GOS / Revenue (%)",        desc:"Fraction of revenue retained as gross surplus. Measures cost efficiency and pricing power against input costs." },
  };

  const d = BS_DATA[farmType];
  const fmtV = v => { const abs=Math.abs(v); const s=abs>=1000?abs.toLocaleString("fr-FR",{minimumFractionDigits:0,maximumFractionDigits:0}):abs.toFixed(0); return (v<0?"−":"")+"€"+s; };

  const BSRow = ({ label, value, indent=0, bold=false, header=false, expandKey=null, children=null, color=null }) => {
    const isOpen = expandedBS[expandKey];
    const textColor = header?"#2DB84B":bold?"#0F2415":"#6B8F72";
    const valColor = color||(header?d.color:bold?"#0F2415":"#6B8F72");
    const bg = header?"#F3F8F4":bold?"#F7F9F7":"transparent";
    return (
      <>
        <div onClick={expandKey?()=>toggleBS(expandKey):undefined}
          style={{ display:"flex", alignItems:"center", padding:`${header||bold?"9px":"6px"} 14px`, background:bg, borderBottom:"1px solid #0d1829", cursor:expandKey?"pointer":"default", paddingLeft:14+indent*16 }}
          onMouseEnter={e=>{if(!bold&&!header)e.currentTarget.style.background="#0a1018";}}
          onMouseLeave={e=>{if(!bold&&!header)e.currentTarget.style.background=bg;}}>
          {expandKey&&<span style={{color:"#6B8F72",fontSize:10,marginRight:7,width:10,flexShrink:0}}>{isOpen?"▼":"▶"}</span>}
          {!expandKey&&indent>0&&<span style={{color:"#6B8F72",marginRight:7,width:10,flexShrink:0}}>└</span>}
          {!expandKey&&indent===0&&<span style={{width:17,flexShrink:0}}/>}
          <span style={{ flex:1, fontSize:header?12:bold?12:11, fontWeight:header||bold?700:400, color:textColor }}>{label}</span>
          <span style={{ fontSize:bold||header?12:11, fontWeight:bold||header?700:500, fontFamily:"'DM Mono',monospace", color:valColor, width:96, textAlign:"right" }}>{fmtV(value)}</span>
          <span style={{ fontSize:10, color:"#6B8F72", width:58, textAlign:"right", fontFamily:"'DM Mono',monospace" }}>{((value/d.assets.total)*100).toFixed(1)}%</span>
        </div>
        {expandKey&&isOpen&&children}
      </>
    );
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div>
        <h2 style={{ color:"#0F2415", fontSize:17, fontWeight:800, marginBottom:3 }}>Farmer Balance Sheet — Average per farm · €/Ha <span style={{color:"#6B8F72",fontWeight:400,fontSize:13}}>(2024)</span></h2>
        <p style={{ color:"#6B8F72", fontSize:11 }}>Source: FADN / RICA France · Cereals, general crops, market gardening and viticulture · Values in €/Ha</p>
      </div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {Object.entries(BS_DATA).map(([key,val])=>(
          <button key={key} onClick={()=>setFarmType(key)}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 16px", borderRadius:10, border:`2px solid ${farmType===key?val.color:val.color+"28"}`, background:farmType===key?val.color+"18":"transparent", color:farmType===key?val.color:"#6B8F72", fontSize:12, fontWeight:farmType===key?700:400, cursor:"pointer", transition:"all 0.15s" }}>
            <span style={{fontSize:15}}>{val.emoji}</span> {key}
          </button>
        ))}
      </div>
      <div style={{ background:"#F3F8F4", border:"1px solid #D6E8DA", borderRadius:8, padding:"8px 14px" }}>
        <span style={{ color:"#6B8F72", fontSize:11, fontStyle:"italic" }}>{d.note}</span>
      </div>
      <div className="kpi-row">
        <KPICard label="Total Assets"  value={fmtV(d.assets.total)+"/ha"} sub="fixed + current assets" accent={d.color}/>
        <KPICard label="Total Equity"  value={fmtV(d.equity.total)+"/ha"} sub={((d.equity.total/d.assets.total)*100).toFixed(0)+"% of total assets"} accent="#2DB84B"/>
        <KPICard label="Total Debt"    value={fmtV(d.debt.total)+"/ha"}   sub={`Debt ratio: ${d.ratios.debtRatio}%`} accent="#f43f5e"/>
        <KPICard label="Fixed Assets"  value={fmtV(d.assets.fixed.total)+"/ha"} sub={((d.assets.fixed.total/d.assets.total)*100).toFixed(0)+"% of total assets"} accent="#a78bfa"/>
      </div>

      {/* Balance sheet waterfall */}
      <div className="card">
        <p style={{ color:"#6B8F72", fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700, marginBottom:4 }}>Balance Sheet Structure — Assets vs Equity & Liabilities (€/Ha)</p>
        <p style={{ color:"#6B8F72", fontSize:11, marginBottom:16 }}>Both sides of the balance sheet displayed proportionally to total assets.</p>
        <div style={{ display:"flex", gap:16 }}>
          <div style={{ flex:1 }}>
            <p style={{ color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8, fontWeight:700 }}>Assets — {fmtV(d.assets.total)}</p>
            {[
              {label:"Land", val:d.assets.fixed.items["Land"], color:"#2DB84B"},
              {label:"Machinery", val:d.assets.fixed.items["Machinery"], color:"#5CC96E"},
              {label:"Buildings", val:d.assets.fixed.items["Buildings"], color:"#7dd3fc"},
              {label:"Spec. installations", val:d.assets.fixed.items["Specialised installations"], color:"#bae6fd"},
              {label:"Other fixed", val:(d.assets.fixed.items["Land improvements"]||0)+(d.assets.fixed.items["Plantations (incl. forest)"]||0)+(d.assets.fixed.items["Breeding livestock"]||0)+(d.assets.fixed.items["Other fixed assets"]||0), color:"#e0f2fe"},
              {label:"Inventories", val:d.assets.current.items["Inventories & work in progress"], color:"#a78bfa"},
              {label:"Receivables", val:d.assets.current.items["Receivables"], color:"#c4b5fd"},
              {label:"Cash", val:d.assets.current.items["Cash & equivalents"], color:"#ddd6fe"},
              {label:"Other current", val:d.assets.current.items["Asset accruals"]||0, color:"#ede9fe"},
            ].map((item,i)=>{ const pct=(item.val/d.assets.total)*100; return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <span style={{ color:"#6B8F72", fontSize:10, width:110, flexShrink:0, textAlign:"right" }}>{item.label}</span>
                <div style={{ flex:1, height:16, background:"#D6E8DA", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:item.color, borderRadius:3 }}/>
                </div>
                <span style={{ color:"#2C4A33", fontSize:10, fontFamily:"'DM Mono',monospace", width:64, flexShrink:0 }}>{fmtV(item.val)}</span>
                <span style={{ color:"#6B8F72", fontSize:9, width:30, flexShrink:0 }}>{pct.toFixed(0)}%</span>
              </div>
            );})}
          </div>
          <div style={{ width:1, background:"#D6E8DA", flexShrink:0 }}/>
          <div style={{ flex:1 }}>
            <p style={{ color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8, fontWeight:700 }}>Equity & Liabilities — {fmtV(d.totalLE)}</p>
            {[
              {label:"Initial capital", val:d.equity.items["Initial individual capital"], color:"#2DB84B"},
              {label:"Capital growth", val:d.equity.items["Change in initial capital"], color:"#34d399"},
              {label:"Invest. subsidies", val:d.equity.items["Investment subsidies"], color:"#6ee7b7"},
              {label:"LT/MT debt", val:d.debt.items["Long & medium-term debt"], color:"#f43f5e"},
              {label:"ST borrowings", val:d.debt.items["Short-term borrowings & other financial liabilities"], color:"#fb7185"},
              {label:"Trade payables", val:d.debt.items["Trade & other payables"], color:"#fda4af"},
              {label:"Accruals", val:d.debt.items["Liability accruals"], color:"#fecdd3"},
            ].map((item,i)=>{ const pct=(item.val/d.assets.total)*100; return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <span style={{ color:"#6B8F72", fontSize:10, width:110, flexShrink:0, textAlign:"right" }}>{item.label}</span>
                <div style={{ flex:1, height:16, background:"#D6E8DA", borderRadius:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:item.color, borderRadius:3 }}/>
                </div>
                <span style={{ color:"#2C4A33", fontSize:10, fontFamily:"'DM Mono',monospace", width:64, flexShrink:0 }}>{fmtV(item.val)}</span>
                <span style={{ color:"#6B8F72", fontSize:9, width:30, flexShrink:0 }}>{pct.toFixed(0)}%</span>
              </div>
            );})}
          </div>
        </div>
        <div style={{ marginTop:16, paddingTop:12, borderTop:"1px solid #D6E8DA" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ color:"#2DB84B", fontSize:11, fontWeight:600 }}>Equity: {((d.equity.total/d.assets.total)*100).toFixed(0)}%</span>
            <span style={{ color:"#f43f5e", fontSize:11, fontWeight:600 }}>Debt: {d.ratios.debtRatio}%</span>
          </div>
          <div style={{ height:8, background:"#D6E8DA", borderRadius:4, overflow:"hidden", display:"flex" }}>
            <div style={{ height:"100%", width:`${(d.equity.total/d.assets.total)*100}%`, background:"#2DB84B" }}/>
            <div style={{ height:"100%", flex:1, background:"#f43f5e" }}/>
          </div>
        </div>
      </div>

      <div className="chart-grid-2">
        <div className="card">
          <p style={{ color:"#6B8F72", fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700, marginBottom:4 }}>Fixed Asset Breakdown (€/Ha)</p>
          <p style={{ color:"#6B8F72", fontSize:11, marginBottom:12 }}>Long-term productive capital stock decomposition.</p>
          {Object.entries(d.assets.fixed.items).map(([name,val],i)=>{ const pct=(val/d.assets.fixed.total)*100; return (
            <div key={i} style={{ marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span style={{ color:"#2C4A33", fontSize:11 }}>{name}</span>
                <span style={{ color:d.color, fontSize:11, fontFamily:"'DM Mono',monospace", fontWeight:600 }}>{fmtV(val)} <span style={{ color:"#6B8F72", fontWeight:400 }}>({pct.toFixed(0)}%)</span></span>
              </div>
              <div style={{ height:5, background:"#D6E8DA", borderRadius:3, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:d.color, borderRadius:3 }}/>
              </div>
            </div>
          );})}
        </div>
        <div className="card">
          <p style={{ color:"#6B8F72", fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700, marginBottom:4 }}>Debt Maturity Profile (€/Ha)</p>
          <p style={{ color:"#6B8F72", fontSize:11, marginBottom:12 }}>Decomposition of total debt by maturity — key indicator of refinancing risk and cash pressure.</p>
          {[
            {label:"Long & medium-term debt", val:d.debt.items["Long & medium-term debt"], color:"#f43f5e", note:"Structural — machinery, building & land loans (7–15yr)"},
            {label:"Short-term borrowings", val:d.debt.items["Short-term borrowings & other financial liabilities"], color:"#f59e0b", note:"Working capital lines — renewed annually"},
            {label:"Trade & other payables", val:d.debt.items["Trade & other payables"], color:"#a78bfa", note:"Deferred input payments — coops, seeds, fertilizers"},
            {label:"Liability accruals", val:d.debt.items["Liability accruals"], color:"#6B8F72", note:"Accrued charges not yet settled"},
          ].map((item,i)=>{ const pct=(item.val/d.debt.total)*100; return (
            <div key={i} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span style={{ color:"#2C4A33", fontSize:11 }}>{item.label}</span>
                <span style={{ color:item.color, fontSize:11, fontFamily:"'DM Mono',monospace", fontWeight:600 }}>{fmtV(item.val)} ({pct.toFixed(0)}%)</span>
              </div>
              <div style={{ height:5, background:"#D6E8DA", borderRadius:3, overflow:"hidden", marginBottom:3 }}>
                <div style={{ height:"100%", width:`${pct}%`, background:item.color, borderRadius:3 }}/>
              </div>
              <p style={{ color:"#6B8F72", fontSize:10, margin:0 }}>{item.note}</p>
            </div>
          );})}
          <div style={{ marginTop:10, padding:"10px 12px", background:"#FFFFFF", border:"1px solid #D6E8DA", borderLeft:`3px solid #f43f5e`, borderRadius:"0 8px 8px 0" }}>
            <p style={{ color:"#6B8F72", fontSize:11, margin:0, lineHeight:1.65 }}>
              Long-term debt is <span style={{color:"#f43f5e",fontWeight:600}}>{((d.debt.items["Long & medium-term debt"]/d.debt.total)*100).toFixed(0)}%</span> of total debt — predominantly structural. Short-term obligations (borrowings + payables) are <span style={{color:"#f59e0b",fontWeight:600}}>{(((d.debt.items["Short-term borrowings & other financial liabilities"]+d.debt.items["Trade & other payables"])/d.debt.total)*100).toFixed(0)}%</span>, reflecting the seasonal input purchasing cycle.
            </p>
          </div>
        </div>
      </div>

      {/* BS Table */}
      <div style={{ background:"#F7F9F7", border:"1px solid #D6E8DA", borderRadius:14, overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", padding:"12px 14px", background:"#FFFFFF", borderBottom:"1px solid #D6E8DA" }}>
          <span style={{width:17,flexShrink:0}}/>
          <span style={{ flex:1, color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em" }}>Line item</span>
          <span style={{ width:96, textAlign:"right", color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em" }}>€ / ha</span>
          <span style={{ width:58, textAlign:"right", color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em" }}>% total</span>
        </div>
        <div style={{padding:"5px 0 2px",background:"#FFFFFF",borderBottom:"1px solid #0d1829"}}><span style={{paddingLeft:14,color:"#6B8F72",fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em"}}>Assets</span></div>
        <BSRow label="Fixed Assets" value={d.assets.fixed.total} bold expandKey="assets">{Object.entries(d.assets.fixed.items).map(([k,v],i)=><BSRow key={i} label={k} value={v} indent={1}/>)}</BSRow>
        <BSRow label="Current Assets" value={d.assets.current.total} bold expandKey="equity">{Object.entries(d.assets.current.items).map(([k,v],i)=><BSRow key={i} label={k} value={v} indent={1}/>)}</BSRow>
        <BSRow label="TOTAL ASSETS" value={d.assets.total} bold header color={d.color}/>
        <div style={{padding:"5px 0 2px",background:"#FFFFFF",borderBottom:"1px solid #0d1829",marginTop:4}}><span style={{paddingLeft:14,color:"#6B8F72",fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em"}}>Equity & Liabilities</span></div>
        <BSRow label="Equity" value={d.equity.total} bold expandKey="debt">{Object.entries(d.equity.items).map(([k,v],i)=><BSRow key={i} label={k} value={v} indent={1}/>)}</BSRow>
        <BSRow label="Total Debt" value={d.debt.total} bold color="#f43f5e">{Object.entries(d.debt.items).map(([k,v],i)=><BSRow key={i} label={k} value={v} indent={1}/>)}</BSRow>
        <BSRow label="TOTAL LIABILITIES & EQUITY" value={d.totalLE} bold header color={d.color}/>
      </div>

      {/* Ratios */}
      <div style={{ background:"#F7F9F7", border:"1px solid #D6E8DA", borderRadius:14, overflow:"hidden" }}>
        <div style={{ padding:"12px 16px 10px", background:"#FFFFFF", borderBottom:"1px solid #D6E8DA" }}>
          <p style={{ color:"#6B8F72", fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700, margin:0 }}>Key Financial Ratios</p>
          <p style={{ color:"#6B8F72", fontSize:10, margin:"3px 0 0" }}>Click ⓘ for definition</p>
        </div>
        <div style={{ padding:16, display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
          {[
            {key:"gosHa",     value:d.ratios.gosHa.toFixed(2)+" k€/ha",    accent:"#2DB84B"},
            {key:"gosAWU",    value:d.ratios.gosAWU.toFixed(2)+" k€/UTA",  accent:"#5CC96E"},
            {key:"profitHa",  value:d.ratios.profitHa.toFixed(2)+" k€/ha", accent:"#2DB84B"},
            {key:"profitAWU", value:d.ratios.profitAWU.toFixed(2)+" k€/UTA",accent:"#4ade80"},
            {key:"debtRatio", value:d.ratios.debtRatio.toFixed(1)+"%",      accent:"#f43f5e"},
            {key:"marginRate",value:d.ratios.marginRate.toFixed(1)+"%",     accent:"#f59e0b"},
          ].map(r=>{
            const tip=RATIO_TOOLTIPS[r.key]; const isOpen=activeTooltip===r.key;
            return (
              <div key={r.key} style={{ background:"#F3F8F4", border:`1px solid ${r.accent}20`, borderRadius:10, padding:"12px 14px" }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:6 }}>
                  <p style={{ color:"#6B8F72", fontSize:10, textTransform:"uppercase", letterSpacing:"0.07em", margin:0, flex:1, paddingRight:6 }}>{tip.label}</p>
                  <button onClick={()=>setActiveTooltip(isOpen?null:r.key)} style={{ background:"transparent", border:`1px solid ${r.accent}40`, borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, color:r.accent, fontSize:10, fontWeight:700, fontFamily:"serif", lineHeight:1 }}>i</button>
                </div>
                <p style={{ color:r.accent, fontSize:22, fontWeight:800, fontFamily:"'DM Mono',monospace", margin:0 }}>{r.value}</p>
                {isOpen&&<div style={{ marginTop:10, padding:"10px 12px", background:"#FFFFFF", border:`1px solid ${r.accent}30`, borderRadius:8 }}><p style={{ color:"#6B8F72", fontSize:11, lineHeight:1.75, margin:0 }}>{tip.desc}</p></div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MIStrategyPage({ region }) {
  const intel=MARKET_INTEL[region];
  if (!intel) return <MIPlaceholder region={region} />;
  const compRadar=[
    {axis:"Price Competitiveness",OCP:72,ICL:65,Yara:55},
    {axis:"Low Cadmium",          OCP:95,ICL:60,Yara:70},
    {axis:"Carbon Footprint",     OCP:80,ICL:55,Yara:65},
    {axis:"Coop Penetration",     OCP:45,ICL:70,Yara:75},
    {axis:"Agro. Support",        OCP:50,ICL:75,Yara:80},
    {axis:"TSP Capability",       OCP:90,ICL:60,Yara:50},
  ];
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <div className="chart-grid-2">
        <div className="card">
          <h3 className="card-title">Competitive Positioning Radar — France</h3>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={compRadar}>
              <PolarGrid stroke="#D6E8DA" />
              <PolarAngleAxis dataKey="axis" tick={{ fill:"#6B8F72",fontSize:9 }} />
              <Radar name="OCP"  dataKey="OCP"  stroke="#2DB84B" fill="#2DB84B" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="ICL"  dataKey="ICL"  stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={1.5} />
              <Radar name="Yara" dataKey="Yara" stroke="#6B8F72" fill="#6B8F72" fillOpacity={0.1}  strokeWidth={1.5} />
              <Legend wrapperStyle={{ fontSize:10 }} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>{intel.strategy.slice(0,2).map((item,i)=><InsightCard key={i} item={item} />)}</div>
      </div>
      <div className="chart-grid-2">{intel.strategy.slice(2).map((item,i)=><InsightCard key={i} item={item} />)}</div>
    </div>
  );
}

function MIAgronomyPage({ region }) {
  const intel=MARKET_INTEL[region];
  if (!intel) return <MIPlaceholder region={region} />;
  const tagColor={"TSP":{bg:"#0e2a38",text:"#2DB84B"},"TSP/PK":{bg:"#0e2a38",text:"#2DB84B"},"DAP":{bg:"#1e1030",text:"#a78bfa"},"PK":{bg:"#0e2218",text:"#2DB84B"}};
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <div><h3 style={{ color:"#6B8F72",fontSize:11,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14 }}>Agronomic Insights</h3><div className="chart-grid-2">{intel.agronomy.map((item,i)=><InsightCard key={i} item={item} />)}</div></div>
      <div className="card">
        <h3 className="card-title">Crop Agronomy — Current vs Recommended P2O5 (kg/ha)</h3>
        <div style={{ display:"flex",flexDirection:"column",gap:12,marginTop:4 }}>
          {intel.cropAgronomy.map((row,i)=>{
            const gap=row.currentP-row.recP, gapColor=gap>=0?"#2DB84B":gap>-15?"#f59e0b":"#f43f5e";
            const tc=tagColor[row.product]||{bg:"#D6E8DA",text:"#6B8F72"};
            return (
              <div key={i} style={{ background:"#F3F8F4",borderRadius:10,padding:"11px 13px" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:7,flexWrap:"wrap" }}>
                  <span style={{ color:"#2C4A33",fontSize:13,fontWeight:600,minWidth:75 }}>{row.crop}</span>
                  <span style={{ padding:"2px 7px",borderRadius:4,fontSize:10,fontWeight:600,background:tc.bg,color:tc.text }}>{row.product}</span>
                  <span style={{ color:gapColor,fontSize:11,fontFamily:"'DM Mono',monospace",fontWeight:700 }}>Gap: {gap>=0?"0":gap} kg/ha</span>
                  <span style={{ color:"#6B8F72",fontSize:10,marginLeft:"auto" }}>{row.area.toLocaleString()} kha</span>
                </div>
                <div style={{ position:"relative",height:8,background:"#D6E8DA",borderRadius:4,overflow:"hidden",marginBottom:5 }}>
                  <div style={{ position:"absolute",left:0,height:"100%",width:`${(row.recP/100)*100}%`,background:gapColor+"30",borderRadius:4 }} />
                  <div style={{ position:"absolute",left:0,height:"100%",width:`${(row.currentP/100)*100}%`,background:gapColor,borderRadius:4 }} />
                </div>
                <div style={{ display:"flex",justifyContent:"space-between" }}>
                  <span style={{ color:"#6B8F72",fontSize:10 }}>Current: <span style={{ color:gapColor,fontFamily:"'DM Mono',monospace" }}>{row.currentP}</span> kg/ha</span>
                  <span style={{ color:"#6B8F72",fontSize:10 }}>Rec: <span style={{ color:"#6B8F72",fontFamily:"'DM Mono',monospace" }}>{row.recP}</span> kg/ha</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


// ─── MAIN APP ─────────────────────────────────────────────────────────────────
// ─── REGION SELECT PAGE ───────────────────────────────────────────────────────
function RegionSelectPage({ onSelect }) {
  const [hov, setHov] = useState(null);

  const REGIONS = [
    { code:"France", flag:"🇫🇷", label:"France",  available:true,  color:"#2DB84B" },
    { code:"India",  flag:"🇮🇳", label:"India",   available:false, color:"#f59e0b" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#F7F9F7", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans','Segoe UI',sans-serif", position:"relative", overflow:"hidden" }}>
      <style>{`
        @keyframes rFadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .rc { transition:all 0.2s ease; }
        .rc:hover { transform:translateY(-4px) !important; }
      `}</style>

      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(45,184,75,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(45,184,75,0.025) 1px,transparent 1px)", backgroundSize:"60px 60px", pointerEvents:"none" }}/>

      <div style={{ position:"absolute", top:28, left:36, display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#2DB84B,#1A8A34)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:11, color:"#0F2415", fontFamily:"'DM Mono',monospace" }}>GMO</div>
        <span style={{ color:"rgba(15,36,21,0.3)", fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase" }}>PhosStratOS · OCP Nutricrops</span>
      </div>

      <div style={{ textAlign:"center", marginBottom:52, animation:"rFadeUp 0.6s ease both" }}>
        <p style={{ color:"#2DB84B", fontSize:10, textTransform:"uppercase", letterSpacing:"0.2em", fontWeight:700, marginBottom:14 }}>Farmer Economics</p>
        <h1 style={{ color:"#0F2415", fontSize:"clamp(18px,2.8vw,32px)", fontWeight:300, letterSpacing:"-0.02em", lineHeight:1.4, margin:0 }}>
          Which country would you like to<br/>
          <span style={{ fontWeight:800 }}>explore farmer economics about?</span>
        </h1>
      </div>

      <div style={{ display:"flex", gap:20, justifyContent:"center" }}>
        {REGIONS.map((r, i) => (
          <div key={r.code}
            className="rc"
            onClick={() => r.available && onSelect(r.code)}
            onMouseEnter={() => r.available && setHov(r.code)}
            onMouseLeave={() => setHov(null)}
            style={{
              background:"#FFFFFF",
              border:`1px solid ${hov===r.code ? r.color+"60" : "#D6E8DA"}`,
              borderRadius:16, overflow:"hidden",
              cursor: r.available ? "pointer" : "default",
              opacity: r.available ? 1 : 0.35,
              animation:`rFadeUp 0.6s ${i*0.12+0.15}s ease both`,
              width:220,
              boxShadow: hov===r.code ? `0 20px 50px ${r.color}18` : "none",
              position:"relative",
            }}>

            {!r.available && (
              <div style={{ position:"absolute", top:10, right:10, zIndex:2, background:"rgba(0,0,0,0.7)", border:"1px solid #f59e0b40", borderRadius:10, padding:"2px 8px", color:"#f59e0b", fontSize:8, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>Soon</div>
            )}

            {/* Country photo */}
            <div style={{ height:140, overflow:"hidden", position:"relative" }}>
              <img
                src={`/${r.code.toLowerCase()}.jpg`}
                alt={r.label}
                style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center", display:"block",
                  filter: r.available ? (hov===r.code ? "brightness(1.1)" : "brightness(0.75)") : "grayscale(1) brightness(0.4)",
                  transition:"filter 0.2s" }}
                onError={e => { e.target.style.display="none"; }}
              />
              <div style={{ position:"absolute", inset:0, background: hov===r.code ? `linear-gradient(to bottom,transparent 40%,${r.color}30)` : "linear-gradient(to bottom,transparent 50%,rgba(247,249,247,0.7))" }}/>
            </div>

            {/* Label */}
            <div style={{ padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <p style={{ color: hov===r.code ? r.color : "#2C4A33", fontSize:15, fontWeight:700, margin:0, transition:"color 0.2s" }}>{r.label}</p>
              {r.available && (
                <svg style={{ color: hov===r.code ? r.color : "#B8D4BE", transition:"color 0.2s, transform 0.2s", transform: hov===r.code ? "translateX(3px)" : "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ─── HUB PAGE — choose your section ──────────────────────────────────────────
function HubPage({ onChoose }) {
  const [hov, setHov] = useState(null);

  const QuantIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
  const IntelIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M3 12h3m12 0h3M12 3v3m0 12v3m-6.4-2.4 2.1-2.1m8.6-8.6 2.1-2.1M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1"/>
    </svg>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#F7F9F7", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans','Segoe UI',sans-serif", padding:"40px 24px" }}>
      <style>{`@keyframes hubFade{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:60, animation:"hubFade 0.6s ease both" }}>
        <div style={{ width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,#2DB84B,#1A8A34)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,color:"#0F2415",fontFamily:"'DM Mono',monospace",boxShadow:"0 0 20px #2DB84B40" }}>GMO</div>
        <div>
          <p style={{ color:"#0F2415",fontWeight:800,fontSize:17,letterSpacing:"-0.03em",margin:0 }}>PhosStratOS</p>
          <p style={{ color:"#6B8F72",fontSize:12,margin:0 }}>OCP Nutricrops · P Separation Intelligence</p>
        </div>
      </div>

      <p style={{ color:"#0F2415",fontSize:24,fontWeight:300,marginBottom:8,letterSpacing:"-0.01em",animation:"hubFade 0.6s 0.1s ease both",opacity:0 }}>Select your workspace</p>
      <p style={{ color:"#6B8F72",fontSize:13,marginBottom:56,animation:"hubFade 0.6s 0.2s ease both",opacity:0 }}>France · Phosphorus Separation Intelligence</p>

      <div style={{ display:"flex", gap:16, flexWrap:"nowrap", justifyContent:"center", width:"100%", maxWidth:840 }}>
        {[
          {
            key:"quant",
            Icon:QuantIcon,
            label:"WORKSPACE A",
            title:"Quantitative Engine",
            color:"#2DB84B",
            desc:"Simulate P separation scenarios, model agronomic response across soil types, and analyse P&L by crop and region.",
            tags:["Scenario Simulator","P&L Explorer","Agronomic Response","Model Insights"],
            delay:"0.25s",
          },
          {
            key:"intel",
            Icon:IntelIcon,
            label:"WORKSPACE B",
            title:"Market Intelligence",
            color:"#2DB84B",
            desc:"Farmer decision drivers, market fundamentals, competitive landscape, and regional crop analytics for France.",
            tags:["Market Fundamentals","Farmer Behaviour","Competitive Landscape","Regional Analysis"],
            delay:"0.4s",
          },
        ].map(card => (
          <div key={card.key}
            onClick={() => onChoose(card.key)}
            onMouseEnter={() => setHov(card.key)}
            onMouseLeave={() => setHov(null)}
            style={{
              flex:"1 1 0", maxWidth:410,
              background: hov===card.key ? `linear-gradient(150deg,${card.color}12,#FFFFFF 60%)` : "#FFFFFF",
              border:`1px solid ${hov===card.key ? card.color+"40" : "#D6E8DA"}`,
              borderRadius:16, padding:"36px 32px",
              cursor:"pointer",
              transition:"all 0.2s ease",
              transform: hov===card.key ? "translateY(-4px)" : "none",
              boxShadow: hov===card.key ? `0 20px 50px ${card.color}10` : "none",
              animation:`hubFade 0.7s ${card.delay} ease both`, opacity:0,
              position:"relative", overflow:"hidden",
            }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:28 }}>
              <div>
                <p style={{ color:card.color,fontSize:10,textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:600,margin:0,marginBottom:10 }}>{card.label}</p>
                <p style={{ color:"#0F2415",fontSize:20,fontWeight:700,letterSpacing:"-0.025em",margin:0,lineHeight:1.2 }}>{card.title}</p>
              </div>
              <div style={{ width:44,height:44,borderRadius:10,background:card.color+"14",border:`1px solid ${card.color}20`,display:"flex",alignItems:"center",justifyContent:"center",color:card.color,flexShrink:0 }}>
                <card.Icon />
              </div>
            </div>

            <p style={{ color:"#6B8F72",fontSize:13,lineHeight:1.75,marginBottom:28 }}>{card.desc}</p>

            <div style={{ display:"flex",flexWrap:"wrap",gap:6,marginBottom:32 }}>
              {card.tags.map(t => (
                <span key={t} style={{ background:"#ffffff08",border:"1px solid #ffffff0f",borderRadius:4,padding:"3px 10px",color:"#6B8F72",fontSize:10,fontWeight:500 }}>{t}</span>
              ))}
            </div>

            <div style={{ display:"flex",alignItems:"center",gap:8,color:hov===card.key?card.color:"#c8d3e0",fontSize:12,fontWeight:600,transition:"color 0.2s",borderTop:"1px solid #D6E8DA",paddingTop:20 }}>
              Enter workspace
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default function App() {
  const [hasEntered,      setHasEntered]      = useState(false);
  const [regionSelected,  setRegionSelected]  = useState(false);
  const [hubDone,         setHubDone]         = useState(false);
  const [section,         setSection]         = useState("quant");
  const [intelPage,       setIntelPage]       = useState("dynamics");
  const [region,          setRegion]          = useState("France");
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [countryOpen,     setCountryOpen]     = useState(false);
  const [mathieuPhase,    setMathieuPhase]    = useState("intro");

  const intelPages=[
    {key:"dynamics",  label:"Fundamentals",         short:"Fundamentals"   },
    {key:"farmer",    label:"Farmer Behaviour",      short:"Farmer Behav."  },
    {key:"farmerpl",  label:"Farmer P&L",            short:"Farmer P&L"     },
    {key:"farmerbs",  label:"Farmer Balance Sheet",  short:"Balance Sheet"  },
    {key:"strategy",  label:"Competitive Landscape", short:"Competitive"    },
    {key:"agronomy",  label:"Agronomic Insights",    short:"Agronomy"       },
    {key:"regions",   label:"Regional Analysis",     short:"Regions"        },
  ];

  const secColor   = section==="quant"?"#2DB84B":section==="intel"?"#2DB84B":"#a78bfa";

  if (!hasEntered) return <LandingPage onEnter={() => setHasEntered(true)} />;
  if (!regionSelected) return <RegionSelectPage onSelect={r => { setRegion(r); setRegionSelected(true); }} />;
  if (!hubDone) return <HubPage onChoose={s => { setSection(s); setHubDone(true); setMathieuPhase("intro"); }} />;

  return (
    <div style={{ minHeight:"100vh",background:"#FFFFFF",color:"#2C4A33",fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;height:4px;} ::-webkit-scrollbar-track{background:#FFFFFF;} ::-webkit-scrollbar-thumb{background:#D6E8DA;border-radius:3px;}
        input[type=range]{height:4px;}
        select{background:#D6E8DA;color:#2C4A33;border:1px solid #B8D4BE;border-radius:6px;padding:6px 10px;font-size:13px;cursor:pointer;outline:none;max-width:130px;}
        select:hover{border-color:#2DB84B;}
        .card{background:#FFFFFF;border:1px solid #D6E8DA;border-radius:14px;padding:18px;}
        .card-title{color:#6B8F72;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;}
        .kpi-row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px;}
        .chart-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        .simulator-grid{display:grid;grid-template-columns:280px 1fr;gap:20px;}
        .app-sidebar{width:210px;flex-shrink:0;border-left:1px solid #D6E8DA;padding:16px;background:#F3F8F4;}
        .sidebar-overlay{display:none;}
        .subnav{background:#F3F8F4;border-bottom:1px solid #E8F2EA;padding:0 16px;display:flex;overflow-x:auto;}
        .subnav::-webkit-scrollbar{height:0;}
        .sec-label-full{display:inline;} .sec-label-short{display:none;}
        @media(max-width:640px){
          .chart-grid-2{grid-template-columns:1fr;}
          .simulator-grid{grid-template-columns:1fr;}
          .kpi-row{gap:8px;}
          .kpi-row>div{min-width:calc(50% - 4px);flex:1 1 calc(50% - 4px);}
          .app-sidebar{position:fixed;top:0;right:0;bottom:0;z-index:200;width:240px;transform:translateX(100%);transition:transform 0.25s ease;overflow-y:auto;}
          .app-sidebar.open{transform:translateX(0);box-shadow:-4px 0 24px #000a;}
          .sidebar-overlay{display:block;position:fixed;inset:0;z-index:199;background:#F7F9F780;opacity:0;pointer-events:none;transition:opacity 0.25s;}
          .sidebar-overlay.open{opacity:1;pointer-events:all;}
          .sec-label-full{display:none;} .sec-label-short{display:inline;}
          .page-content{padding:14px !important;}
        }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ borderBottom:"1px solid #D6E8DA",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:50,background:"#FFFFFF",position:"sticky",top:0,zIndex:100 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#2DB84B,#1A8A34)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,color:"#FFFFFF",letterSpacing:"-0.5px",fontFamily:"'DM Mono',monospace",boxShadow:"0 0 10px #2DB84B40",flexShrink:0 }}>GMO</div>
          <div>
            <span style={{ fontWeight:800,fontSize:14,letterSpacing:"-0.03em",color:"#0F2415" }}>PhosStratOS</span>
            <span style={{ color:"#6B8F72",fontSize:11,marginLeft:8 }} className="sec-label-full">P Separation Intelligence</span>
          </div>
        </div>
        <div style={{ display:"flex",gap:8,alignItems:"center" }}>
          {section!=="atlas"&&(
            <div style={{ position:"relative" }}>
              <button onClick={()=>setCountryOpen(o=>!o)}
                style={{ display:"flex",alignItems:"center",gap:8,background:"#D6E8DA",border:"1px solid #2DB84B40",borderRadius:8,padding:"6px 12px",cursor:"pointer",color:"#2C4A33",fontSize:13,fontWeight:600 }}>
                <div style={{width:6,height:6,borderRadius:"50%",background:"#2DB84B",boxShadow:"0 0 6px #2DB84B",flexShrink:0}}/>
                <span>{region}</span>
                <span style={{color:"#6B8F72",fontSize:10,marginLeft:2}}>▾</span>
              </button>
              {countryOpen&&(
                <div style={{ position:"absolute",top:"calc(100% + 6px)",right:0,background:"#FFFFFF",border:"1px solid #D6E8DA",borderRadius:10,overflow:"hidden",zIndex:200,minWidth:180,boxShadow:"0 8px 24px #000a" }}>
                  <div style={{padding:"6px 0"}}>
                    {[{code:"France",flag:"🇫🇷",active:true},{code:"India",flag:"🇮🇳",active:false}].map(c=>(
                      <button key={c.code} onClick={()=>{if(c.active){setRegion(c.code);setCountryOpen(false);}}}
                        style={{ width:"100%",display:"flex",alignItems:"center",gap:10,padding:"9px 16px",background:"none",border:"none",cursor:c.active?"pointer":"not-allowed",textAlign:"left",opacity:c.active?1:0.5 }}
                        onMouseEnter={e=>{if(c.active)e.currentTarget.style.background="#D6E8DA";}}
                        onMouseLeave={e=>{e.currentTarget.style.background="none";}}>
                        <span style={{fontSize:16}}>{c.flag}</span>
                        <span style={{color:region===c.code?"#2DB84B":"#2C4A33",fontSize:13,fontWeight:region===c.code?700:400,flex:1}}>{c.code}</span>
                        {region===c.code&&<span style={{color:"#2DB84B",fontSize:11}}>✓</span>}
                        {!c.active&&<span style={{background:"#f59e0b20",color:"#f59e0b",fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:10,border:"1px solid #f59e0b40"}}>SOON</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {section!=="atlas"&&<button onClick={()=>setSidebarOpen(o=>!o)} style={{ background:"#D6E8DA",border:"1px solid #B8D4BE",color:"#6B8F72",padding:"6px 10px",borderRadius:6,fontSize:18,cursor:"pointer",lineHeight:1 }}>☰</button>}
        </div>
      </div>

      {/* ── SECTION SWITCHER ── */}
      <div style={{ background:"#FFFFFF",borderBottom:"1px solid #D6E8DA",padding:"0 20px",display:"flex",alignItems:"center",gap:4,overflowX:"auto" }}>
        <div style={{ display:"flex",gap:4,padding:"8px 0",flex:1 }}>
          {[
            {key:"quant",full:"Quantitative Engine",short:"Quant",color:"#2DB84B",
              icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>},
            {key:"intel",full:"Market Intelligence",short:"Intel",color:"#2DB84B",
              icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M3 12h3m12 0h3M12 3v3m0 12v3m-6.4-2.4 2.1-2.1m8.6-8.6 2.1-2.1M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1"/></svg>},
          ].map(s=>(
            <button key={s.key} onClick={()=>{setSection(s.key);if(s.key==="quant")setMathieuPhase("intro");}}
              style={{ padding:"9px 20px", background:section===s.key?s.color+"22":"#FFFFFF", border:`1px solid ${section===s.key?s.color:s.color+"20"}`, borderRadius:8, color:section===s.key?s.color:"#c8d3e0", fontSize:13,fontWeight:700,cursor:"pointer", display:"flex",alignItems:"center",gap:8,whiteSpace:"nowrap", transition:"all 0.15s", boxShadow:section===s.key?`0 0 16px ${s.color}22`:"none" }}>
              <span style={{ display:"flex",alignItems:"center" }}>{s.icon}</span>
              <span className="sec-label-full">{s.full}</span>
              <span className="sec-label-short">{s.short}</span>
            </button>
          ))}
        </div>
        <button onClick={()=>setSection("atlas")}
          style={{ padding:"9px 18px", background:section==="atlas"?"#a78bfa22":"#FFFFFF", border:`1px solid ${section==="atlas"?"#a78bfa":"#a78bfa20"}`, borderRadius:8, color:section==="atlas"?"#a78bfa":"#9BB5A0", fontSize:13,fontWeight:700,cursor:"pointer", display:"flex",alignItems:"center",gap:8,whiteSpace:"nowrap", transition:"all 0.15s", boxShadow:section==="atlas"?"0 0 16px #a78bfa22":"none" }}>
          <span style={{display:"flex",alignItems:"center"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M12 2c-2.8 2.8-4 6-4 10s1.2 7.2 4 10"/><path d="M12 2c2.8 2.8 4 6 4 10s-1.2 7.2-4 10"/><path d="M2 12h20"/></svg>
          </span>
          ATLAS
          <span style={{ padding:"1px 6px",borderRadius:20,fontSize:9,fontWeight:700,background:"#a78bfa20",color:"#a78bfa",border:"1px solid #a78bfa40" }}>AI</span>
        </button>
      </div>

      {section==="atlas"&&<ATLASPage />}

      {section!=="atlas"&&(
        <>
          {/* Sub-nav only for intel */}
          {section==="intel" && (
            <div className="subnav">
              {intelPages.map(p=>{
                const active=intelPage===p.key;
                return <button key={p.key} onClick={()=>setIntelPage(p.key)} style={{ padding:"8px 14px",background:"transparent",border:"none",borderBottom:active?`2px solid ${secColor}`:"2px solid transparent",color:active?secColor:"#6B8F72",fontSize:12,fontWeight:active?600:400,cursor:"pointer",whiteSpace:"nowrap" }}>{p.short}</button>;
              })}
            </div>
          )}
          <div style={{ display:"flex",minHeight:"calc(100dvh - 130px)" }}>
            <div className="page-content" style={{ flex:1,padding:20,overflow:"auto",minWidth:0 }}>
              {section==="intel" && (
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:20,flexWrap:"wrap" }}>
                  <SectionBadge label="Market Intelligence" color={secColor} />
                  <h1 style={{ fontSize:16,fontWeight:800,color:"#0F2415",letterSpacing:"-0.02em" }}>{intelPages.find(p=>p.key===intelPage)?.label}</h1>
                  <span style={{ color:"#6B8F72",fontSize:12 }}>{region}</span>
                </div>
              )}

              {/* Quant = Mathieu experience */}
              {section==="quant" && mathieuPhase==="intro" && (
                <MathieuIntroPage region={region} onEnterFarm={()=>{ setMathieuPhase("farm"); setTimeout(()=>window.scrollTo({top:0,behavior:"smooth"}),50); }} />
              )}
              {section==="quant" && mathieuPhase==="farm" && (
                <>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
                    <button onClick={()=>setMathieuPhase("intro")} style={{ display:"flex",alignItems:"center",gap:6,background:"transparent",border:"none",color:"#6B8F72",fontSize:12,cursor:"pointer",padding:0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                      Back to Mathieu
                    </button>
                    <div style={{width:1,height:14,background:"#D6E8DA"}}/>
                    <SectionBadge label="Quantitative Engine" color="#2DB84B" />
                    <span style={{ color:"#0F2415",fontSize:14,fontWeight:700 }}>Mathieu's Farm Simulation</span>
                    <span style={{ color:"#6B8F72",fontSize:12 }}>{region}</span>
                  </div>
                  <MathieuFarmPage region={region} />
                </>
              )}

              {section==="intel"&&intelPage==="dynamics"  &&<MIMarketDynamicsPage region={region} />}
              {section==="intel"&&intelPage==="farmer"    &&<MIFarmerBehaviorPage region={region} />}
              {section==="intel"&&intelPage==="farmerpl"  &&<MIFarmerPLPage />}
              {section==="intel"&&intelPage==="farmerbs"  &&<MIFarmerBSPage />}
              {section==="intel"&&intelPage==="strategy"  &&<MIStrategyPage       region={region} />}
              {section==="intel"&&intelPage==="agronomy"  &&<MIAgronomyPage       region={region} />}
              {section==="intel"&&intelPage==="regions"   &&<RegionalPage />}
            </div>

            <div className={`sidebar-overlay ${sidebarOpen?"open":""}`} onClick={()=>setSidebarOpen(false)} />
            <div className={`app-sidebar ${sidebarOpen?"open":""}`}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                <h3 style={{ color:"#6B8F72",fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em" }}>Navigation</h3>
                <button onClick={()=>setSidebarOpen(false)} style={{ background:"transparent",border:"none",color:"#6B8F72",fontSize:16,cursor:"pointer" }}>✕</button>
              </div>
              <div style={{ marginTop:16,borderTop:"1px solid #D6E8DA",paddingTop:14 }}>
                <button onClick={()=>{setSection("atlas");setSidebarOpen(false);}} style={{ width:"100%",background:"#a78bfa10",border:"1px solid #a78bfa30",color:"#a78bfa",padding:"8px",borderRadius:8,fontSize:12,cursor:"pointer" }}>◈ Open ATLAS</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
