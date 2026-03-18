import { useState, useMemo, useEffect } from "react";
import ATLASPage from "./ATLAS";
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, Area, AreaChart, Cell, PieChart, Pie
} from "recharts";

// ─── DATA ────────────────────────────────────────────────────────────────────
const SAMPLE_DATA = [
  { region:"Spain",     crop:"Wheat",  soil_ph:7.8, om:1.2, strategy:"Blended (MAP)",     yield:4.2,  fert_cost:310, op_cost:820,  revenue:1050, margin:230 },
  { region:"Spain",     crop:"Wheat",  soil_ph:7.8, om:1.2, strategy:"Separated (TSP+N)", yield:4.55, fert_cost:295, op_cost:875,  revenue:1137, margin:262 },
  { region:"Spain",     crop:"Wheat",  soil_ph:7.8, om:1.2, strategy:"Optimized",         yield:4.7,  fert_cost:285, op_cost:860,  revenue:1175, margin:315 },
  { region:"France",    crop:"Wheat",  soil_ph:6.5, om:2.1, strategy:"Blended (MAP)",     yield:7.1,  fert_cost:340, op_cost:980,  revenue:1775, margin:795 },
  { region:"France",    crop:"Wheat",  soil_ph:6.5, om:2.1, strategy:"Separated (TSP+N)", yield:7.2,  fert_cost:330, op_cost:1030, revenue:1800, margin:770 },
  { region:"France",    crop:"Wheat",  soil_ph:6.5, om:2.1, strategy:"Optimized",         yield:7.4,  fert_cost:320, op_cost:1010, revenue:1850, margin:840 },
  { region:"Brazil",    crop:"Maize",  soil_ph:5.4, om:2.8, strategy:"Blended (MAP)",     yield:7.8,  fert_cost:420, op_cost:1100, revenue:1248, margin:148 },
  { region:"Brazil",    crop:"Maize",  soil_ph:5.4, om:2.8, strategy:"Separated (TSP+N)", yield:8.6,  fert_cost:400, op_cost:1170, revenue:1376, margin:206 },
  { region:"Brazil",    crop:"Maize",  soil_ph:5.4, om:2.8, strategy:"Optimized",         yield:9.1,  fert_cost:390, op_cost:1150, revenue:1456, margin:306 },
  { region:"Australia", crop:"Wheat",  soil_ph:6.1, om:1.5, strategy:"Blended (MAP)",     yield:3.8,  fert_cost:280, op_cost:760,  revenue:950,  margin:190 },
  { region:"Australia", crop:"Wheat",  soil_ph:6.1, om:1.5, strategy:"Separated (TSP+N)", yield:4.0,  fert_cost:270, op_cost:810,  revenue:1000, margin:190 },
  { region:"Australia", crop:"Wheat",  soil_ph:6.1, om:1.5, strategy:"Optimized",         yield:4.2,  fert_cost:265, op_cost:795,  revenue:1050, margin:255 },
  { region:"Morocco",   crop:"Wheat",  soil_ph:8.1, om:0.8, strategy:"Blended (MAP)",     yield:2.9,  fert_cost:260, op_cost:620,  revenue:725,  margin:105 },
  { region:"Morocco",   crop:"Wheat",  soil_ph:8.1, om:0.8, strategy:"Separated (TSP+N)", yield:3.3,  fert_cost:245, op_cost:675,  revenue:825,  margin:150 },
  { region:"Morocco",   crop:"Wheat",  soil_ph:8.1, om:0.8, strategy:"Optimized",         yield:3.5,  fert_cost:240, op_cost:658,  revenue:875,  margin:217 },
  { region:"Spain",     crop:"Olives", soil_ph:7.5, om:1.0, strategy:"Blended (MAP)",     yield:3.1,  fert_cost:290, op_cost:1100, revenue:1550, margin:450 },
  { region:"Spain",     crop:"Olives", soil_ph:7.5, om:1.0, strategy:"Separated (TSP+N)", yield:3.3,  fert_cost:275, op_cost:1155, revenue:1650, margin:495 },
  { region:"Spain",     crop:"Olives", soil_ph:7.5, om:1.0, strategy:"Optimized",         yield:3.5,  fert_cost:265, op_cost:1135, revenue:1750, margin:615 },
];

// Active regions (data available). Turkey listed as coming soon in the selector.
const REGIONS = ["France"];
const STRATEGY_COLORS = { "Blended (MAP)":"#64748b", "Separated (TSP+N)":"#0ea5e9", "Optimized":"#10b981" };

// ─── EXCEL DATA (Farmer Analytics factsheets v5 — France) ────────────────────
const YEARS       = [2017,2018,2019,2020,2021,2022,2023];
const PM_SEASONS  = ["16-17","17-18","18-19","19-20","20-21","21-22","22-23"];

const CONSUMPTION_DATA = YEARS.map((y,i) => ({
  year: y,
  N:    [2242700,2248277,2140000,2130000,1880000,1780000,1719000][i],
  P2O5: [444000,420423,440000,410000,450000,350000,226000][i],
  K2O:  [427000,451365,460000,470000,530000,410000,224000][i],
}));

const PM_COLORS = { "DAP/MAP":"#0ea5e9","NPK/NP":"#a78bfa","PK":"#f59e0b","TSP":"#10b981","Other P":"#64748b","Organomineral":"#818cf8" };

const PRODUCT_MIX_DATA = PM_SEASONS.map((s,i) => ({
  season:s,
  "DAP/MAP":[121,135,142,148,136,72,55][i],
  "NPK/NP":[96,98,97,103,111,103,66.4][i],
  "PK":[64,79,80,71,83,74,43.1][i],
  "TSP":[88,98,77,63,83,54,25][i],
  "Other P":[29,32,32,29,34,39,32.5][i],
  "Organomineral":[4,3,3,3,3,4,4][i],
}));

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
      { label:"Agronomy focus",     val:18, color:"#0ea5e9" },
      { label:"Innovation adopt.",  val:12, color:"#10b981" },
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
      { label:"Agronomy focus",     val:62, color:"#0ea5e9" },
      { label:"Innovation adopt.",  val:45, color:"#10b981" },
      { label:"Sustainability",     val:40, color:"#a78bfa" },
      { label:"Coop loyalty",       val:90, color:"#f59e0b" },
    ],
  },
  {
    id: "precision-pioneer",
    nickname: "The Precision Pioneer",
    emoji: "🛰️",
    color: "#0ea5e9",
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
      { label:"Agronomy focus",     val:92, color:"#0ea5e9" },
      { label:"Innovation adopt.",  val:88, color:"#10b981" },
      { label:"Sustainability",     val:65, color:"#a78bfa" },
      { label:"Coop loyalty",       val:55, color:"#f59e0b" },
    ],
  },
  {
    id: "green-convert",
    nickname: "The Green Convert",
    emoji: "🌱",
    color: "#10b981",
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
      { label:"Agronomy focus",     val:70, color:"#0ea5e9" },
      { label:"Innovation adopt.",  val:72, color:"#10b981" },
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
      { label:"Agronomy focus",     val:22, color:"#0ea5e9" },
      { label:"Innovation adopt.",  val:5,  color:"#10b981" },
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
      { label:"Agronomy focus",     val:78, color:"#0ea5e9" },
      { label:"Innovation adopt.",  val:75, color:"#10b981" },
      { label:"Sustainability",     val:45, color:"#a78bfa" },
      { label:"Coop loyalty",       val:30, color:"#f59e0b" },
    ],
  },
];

// ─── MARKET INTEL ─────────────────────────────────────────────────────────────
const MARKET_INTEL = {
  France: {
    kpis:[
      { label:"P2O5 consumed",     value:"226 kt",  sub:"−44% vs 2017",      accent:"#0ea5e9" },
      { label:"Agronomic gap",     value:"−157 kt", sub:"vs Comifer rec.",    accent:"#f59e0b" },
      { label:"Addressable mkt",   value:"511 kt",  sub:"P2O5 by 2030",      accent:"#10b981" },
      { label:"Fert. cost share",  value:"14–16%",  sub:"of variable costs", accent:"#a78bfa" },
      { label:"Morocco mkt share", value:"~62%",    sub:"DAP/MAP imports",   accent:"#10b981" },
    ],
    productMix:[
      { name:"NPK/NP",  val2022:103, val2023:66, color:"#a78bfa" },
      { name:"PK",      val2022:74,  val2023:43, color:"#f59e0b" },
      { name:"DAP/MAP", val2022:72,  val2023:55, color:"#0ea5e9" },
      { name:"TSP",     val2022:54,  val2023:25, color:"#10b981" },
      { name:"Other P", val2022:39,  val2023:33, color:"#64748b" },
    ],
    importOrigin:[
      { name:"Morocco", value:69.4, color:"#10b981" },
      { name:"Russia",  value:13.0, color:"#f87171" },
      { name:"Egypt",   value:11.5, color:"#f59e0b" },
      { name:"Tunisia", value:2.0,  color:"#64748b" },
      { name:"Other",   value:1.0,  color:"#334155" },
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
      { crop:"Wheat",     area:4950, currentP:18, recP:55, product:"TSP",     color:"#0ea5e9" },
      { crop:"Barley",    area:1867, currentP:27, recP:55, product:"TSP",     color:"#0ea5e9" },
      { crop:"Rapeseed",  area:1230, currentP:34, recP:55, product:"TSP/PK",  color:"#a78bfa" },
      { crop:"Corn",      area:1456, currentP:39, recP:65, product:"DAP",     color:"#f59e0b" },
      { crop:"Sunflower", area:871,  currentP:25, recP:55, product:"TSP/PK",  color:"#a78bfa" },
      { crop:"Potatoes",  area:211,  currentP:40, recP:40, product:"PK",      color:"#10b981" },
      { crop:"Beet",      area:402,  currentP:35, recP:60, product:"PK",      color:"#10b981" },
    ],
    ownership:{
      kpis:[
        { label:"Total farms",       value:"390k",  sub:"−19% since 2010",       accent:"#0ea5e9" },
        { label:"Avg. farm size",    value:"69 ha", sub:"up from 53 ha in 2010", accent:"#10b981" },
        { label:"Operators >55 yrs", value:"43%",   sub:"succession risk",       accent:"#f43f5e" },
        { label:"Land leased",       value:"~75%",  sub:"of utilized agri. area",accent:"#f59e0b" },
        { label:"Coop volumes",      value:"~70%",  sub:"of fertilizer flows",   accent:"#a78bfa" },
      ],
      // Histogram data — farm count by size band (Agreste 2020)
      farmSizeHistogram:[
        { range:"<5 ha",    farms:58, pct:15, fertVolPct:2,  color:"#334155" },
        { range:"5–20 ha",  farms:89, pct:23, fertVolPct:6,  color:"#475569" },
        { range:"20–50 ha", farms:70, pct:18, fertVolPct:12, color:"#64748b" },
        { range:"50–100 ha",farms:62, pct:16, fertVolPct:18, color:"#0ea5e9" },
        { range:"100–200 ha",farms:55,pct:14, fertVolPct:24, color:"#818cf8" },
        { range:">200 ha",  farms:56, pct:14, fertVolPct:38, color:"#10b981" },
      ],
      tenure:[
        { name:"Primarily lessee", value:40, color:"#f59e0b" },
        { name:"Mixed",            value:35, color:"#0ea5e9" },
        { name:"Owner-operator",   value:25, color:"#10b981" },
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
function fmt(n, prefix="$") { if (n===undefined||n===null) return "—"; return `${prefix}${Number(n).toFixed(0)}`; }
function pct(n) { return `${Number(n).toFixed(1)}%`; }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:8, padding:"10px 14px", fontSize:12 }}>
      <p style={{ color:"#94a3b8", marginBottom:6 }}>{label}</p>
      {payload.map((p,i)=><p key={i} style={{ color:p.color, margin:"2px 0" }}>{p.name}: <strong style={{ color:"#f1f5f9" }}>{typeof p.value==="number"?p.value.toFixed(1):p.value}</strong></p>)}
    </div>
  );
};

function generateInsights(data, region, crop) {
  const filtered = data.filter(d=>d.region===region&&d.crop===crop);
  if (!filtered.length) return [];
  const base=filtered.find(d=>d.strategy==="Blended (MAP)");
  const sep=filtered.find(d=>d.strategy==="Separated (TSP+N)");
  const opt=filtered.find(d=>d.strategy==="Optimized");
  if (!base||!sep) return [];
  const ph=base.soil_ph, md=sep.margin-base.margin, yg=((sep.yield-base.yield)/base.yield*100).toFixed(1), eoc=sep.op_cost-base.op_cost, bey=(eoc/(base.revenue/base.yield)).toFixed(2);
  const ins=[];
  if (ph>7.5) ins.push(`In calcareous soils (pH ${ph}), P fixation is high — separation improves net margin by ~$${md}/ha.`);
  else if (ph<6.0) ins.push(`Acidic soils (pH ${ph}) show strong response to TSP separation — a ${yg}% yield gain modeled.`);
  else ins.push(`Moderate pH (${ph}) limits the soil-driven case — still net positive at $${md}/ha.`);
  ins.push(`Separation requires $${eoc}/ha extra operational cost. Break-even at ${bey} t/ha yield gain.`);
  if (md>0) ins.push(`Separation increases profit per hectare once all incremental costs are included.`);
  else ins.push(`Separation is margin-neutral here. Lower pass costs or higher prices would tip the balance.`);
  if (opt) ins.push(`Optimized program: $${(opt.margin-base.margin).toFixed(0)}/ha above baseline.`);
  return ins;
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
function KPICard({ label, value, sub, accent }) {
  return (
    <div style={{ background:"linear-gradient(135deg,#0f172a,#0a1020)", border:`1px solid ${accent}25`, borderRadius:14, padding:"16px 18px", flex:1, minWidth:120, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:-15, right:-15, width:60, height:60, borderRadius:"50%", background:accent+"08" }} />
      <p style={{ color:"#64748b", fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>{label}</p>
      <p style={{ color:accent, fontSize:22, fontWeight:800, fontFamily:"'DM Mono',monospace", margin:0 }}>{value}</p>
      {sub && <p style={{ color:"#475569", fontSize:11, marginTop:4 }}>{sub}</p>}
    </div>
  );
}

function SectionBadge({ label, color }) {
  return <span style={{ padding:"3px 12px", borderRadius:20, fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", background:color+"18", color, border:`1px solid ${color}40` }}>{label}</span>;
}

function InsightCard({ item }) {
  const border={ positive:"#10b981", neutral:"#f59e0b", risk:"#f43f5e" };
  const bg={ positive:"#0a1e14", neutral:"#1a1200", risk:"#1a0808" };
  const c=border[item.type];
  return (
    <div style={{ background:bg[item.type]||"#0a0f1a", border:`1px solid ${c}30`, borderLeft:`3px solid ${c}`, borderRadius:12, padding:"15px 16px", transition:"transform 0.15s,box-shadow 0.15s", cursor:"default" }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 24px ${c}20`;}}
      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:7 }}>
        <span style={{ fontSize:15 }}>{item.icon}</span>
        <p style={{ fontSize:11, color:c, textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:700, margin:0 }}>{item.label}</p>
      </div>
      <p style={{ fontSize:12, color:"#94a3b8", lineHeight:1.7, margin:0 }}>{item.text}</p>
    </div>
  );
}

function AnimBar({ label, val2022, val2023, maxVal, color }) {
  const isDown=val2023<val2022;
  return (
    <div style={{ marginBottom:13 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ color:"#94a3b8", fontSize:12, fontWeight:500 }}>{label}</span>
        <span style={{ color:"#64748b", fontSize:11, fontFamily:"'DM Mono',monospace" }}>
          {val2022} → <span style={{ color:isDown?"#f43f5e":"#10b981", fontWeight:700 }}>{val2023}</span>
          <span style={{ color:isDown?"#f43f5e80":"#10b98180", fontSize:10, marginLeft:3 }}>{isDown?"▼":"▲"}</span>
        </span>
      </div>
      <div style={{ position:"relative", height:10, background:"#1e293b", borderRadius:5, overflow:"hidden" }}>
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
        <PolarGrid stroke="#1e293b" />
        <PolarAngleAxis dataKey="axis" tick={{ fill:"#64748b", fontSize:9 }} />
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
        <span style={{ color:"#94a3b8", fontSize:11 }}>{label}</span>
        <span style={{ color, fontSize:11, fontWeight:700, fontFamily:"'DM Mono',monospace" }}>{val}/100</span>
      </div>
      <div style={{ height:6, background:"#1e293b", borderRadius:3 }}>
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
    <div style={{ minHeight:"100vh", background:"#04080f", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans','Segoe UI',sans-serif", position:"relative", overflow:"hidden" }}>
      <style>{`
        @keyframes lFadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes lOrbit{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>
      <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(14,165,233,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }}/>
      <div style={{ position:"absolute", width:480, height:480, borderRadius:"50%", border:"1px solid rgba(14,165,233,0.06)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", animation:"lOrbit 30s linear infinite", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", width:340, height:340, borderRadius:"50%", border:"1px solid rgba(16,185,129,0.05)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", animation:"lOrbit 20s linear infinite reverse", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(14,165,233,0.06) 0%,transparent 70%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none" }}/>
      {/* Logo */}
      <div style={{ position:"absolute", top:32, left:40, display:"flex", alignItems:"center", gap:12, opacity:vis?1:0, transition:"opacity 0.8s ease" }}>
        <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#0ea5e9,#0369a1)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:12, color:"#fff", fontFamily:"'DM Mono',monospace", boxShadow:"0 0 16px #0ea5e930" }}>SMO</div>
        <span style={{ color:"rgba(255,255,255,0.15)", fontSize:12, letterSpacing:"0.15em", textTransform:"uppercase" }}>OCP Nutricrops · Phosphorus Intelligence</span>
      </div>
      {/* Content */}
      <div style={{ textAlign:"center", maxWidth:720, padding:"0 32px", zIndex:10 }}>
        <div style={{ opacity:vis?1:0, transform:vis?"none":"translateY(12px)", transition:"opacity 0.9s ease,transform 0.9s ease", marginBottom:24 }}>
          <span style={{ background:"rgba(14,165,233,0.1)", border:"1px solid rgba(14,165,233,0.2)", borderRadius:20, padding:"5px 16px", color:"rgba(14,165,233,0.9)", fontSize:11, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase" }}>SMO · OCP Nutricrops</span>
        </div>
        <h1 style={{ opacity:vis?1:0, transform:vis?"none":"translateY(20px)", transition:"opacity 0.9s ease,transform 0.9s ease", fontSize:"clamp(26px,4vw,46px)", fontWeight:300, color:"rgba(255,255,255,0.92)", lineHeight:1.28, marginBottom:32, letterSpacing:"-0.02em" }}>
          PhosStrat is SMO's quantitative<br/>
          <span style={{ fontWeight:700, color:"#f1f5f9" }}>platform to better understand</span><br/>
          <span style={{ color:"#0ea5e9", fontWeight:600 }}>the farmer.</span>
        </h1>
        <div style={{ opacity:sub?1:0, transform:sub?"none":"translateY(10px)", transition:"opacity 0.8s ease,transform 0.8s ease", margin:"0 auto 28px", width:48, height:1, background:"linear-gradient(90deg,transparent,rgba(14,165,233,0.6),transparent)" }}/>
        <p style={{ opacity:sub?1:0, transform:sub?"none":"translateY(10px)", transition:"opacity 0.8s ease,transform 0.8s ease", fontSize:15, color:"rgba(255,255,255,0.35)", fontWeight:300, lineHeight:1.8, marginBottom:48 }}>
          P separation economics · Market intelligence · Agronomic modelling
        </p>
        <button onClick={onEnter}
          style={{ opacity:btn?1:0, transform:btn?"none":"translateY(8px)", transition:"opacity 0.6s ease,transform 0.6s ease,background 0.2s,border-color 0.2s", background:"transparent", border:"1px solid rgba(14,165,233,0.5)", color:"rgba(14,165,233,0.9)", padding:"13px 40px", borderRadius:4, fontSize:13, fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", cursor:"pointer" }}
          onMouseEnter={e=>{ e.currentTarget.style.background="rgba(14,165,233,0.1)"; e.currentTarget.style.borderColor="rgba(14,165,233,0.9)"; e.currentTarget.style.color="#fff"; }}
          onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="rgba(14,165,233,0.5)"; e.currentTarget.style.color="rgba(14,165,233,0.9)"; }}>
          Enter Platform →
        </button>
      </div>
      <div style={{ position:"absolute", bottom:32, left:"50%", transform:"translateX(-50%)", opacity:btn?0.4:0, transition:"opacity 0.8s ease", fontSize:11, color:"rgba(255,255,255,0.3)", letterSpacing:"0.1em", textTransform:"uppercase", display:"flex", gap:28 }}>
        <span>Agreste 2020</span><span>·</span><span>McKinsey Farmer Survey</span><span>·</span><span>ARVALIS</span><span>·</span><span>OCP Field Intelligence</span>
      </div>
    </div>
  );
}

// ─── FRANCE MAP (GeoJSON fetched at runtime) ──────────────────────────────────
function heatColor(val, min, max) {
  if (val===undefined||val===null||max===min) return "#1a2744";
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
      {!loaded&&<text x={W/2} y={H/2} textAnchor="middle" fill="#334155" fontSize={12} fontFamily="DM Sans,sans-serif">Loading map…</text>}
      {Object.entries(paths).map(([name,d])=>{
        const [cx,cy]=cents[name]||[0,0];
        const isSel=selectedRegion===name,isHov=hovered===name,hasD=hasData(name);
        const hVal=heatValues?.[name];
        const fill=isSel?"#ffffff":isHov?(hasD?"#a3f4d0":"#1e3050"):(hasD?heatColor(hVal,minV,maxV):"#1a2744");
        return(
          <g key={name} style={{cursor:hasD?"pointer":"default",opacity:hasD?1:0.6}}
            onClick={()=>hasD&&onSelectRegion(name)}
            onMouseEnter={()=>setHovered(name)} onMouseLeave={()=>setHovered(null)}>
            <path d={d} fill={fill} stroke={isSel?"#fff":isHov?"#a3f4d0":"#4a6080"} strokeWidth={isSel?2.5:1.2}
              filter={isSel?"url(#mGlow)":undefined} style={{transition:"fill 0.18s"}}/>
            {(isHov||isSel)&&(<>
              <text x={cx} y={cy-(hVal!==undefined?6:0)} textAnchor="middle" dominantBaseline="middle"
                fontSize={isSel?8.5:8} fill={isSel?"#060d1a":"#f1f5f9"} fontWeight={700}
                fontFamily="DM Sans,sans-serif" style={{pointerEvents:"none",userSelect:"none"}}>{name.substring(0,18)}</text>
              {hVal!==undefined&&<text x={cx} y={cy+8} textAnchor="middle" dominantBaseline="middle"
                fontSize={7.5} fill={isSel?"#0f172a":"#a5f3fc"} fontFamily="DM Mono,monospace"
                style={{pointerEvents:"none",userSelect:"none"}}>{fmt2(hVal)}</text>}
            </>)}
          </g>
        );
      })}
      {vals.length>0&&(<g transform={`translate(12,${H-26})`}>
        <defs><linearGradient id="scBar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0f2035"/><stop offset="50%" stopColor="#0ea5e9"/><stop offset="100%" stopColor="#10b981"/>
        </linearGradient></defs>
        <rect x={0} y={0} width={110} height={7} rx={3} fill="url(#scBar)"/>
        <text x={0}   y={17} fontSize={7} fill="#64748b" fontFamily="DM Mono,sans-serif">{fmt2(minV)}</text>
        <text x={55}  y={17} fontSize={7} fill="#64748b" fontFamily="DM Mono,sans-serif" textAnchor="middle">low → high</text>
        <text x={110} y={17} fontSize={7} fill="#64748b" fontFamily="DM Mono,sans-serif" textAnchor="end">{fmt2(maxV)}</text>
      </g>)}
      <g transform={`translate(135,${H-24})`}>
        <rect x={0} y={0} width={9} height={7} rx={1} fill="#0a1420" stroke="#1e3040" strokeWidth={0.7}/>
        <text x={12} y={7} fontSize={7} fill="#475569" fontFamily="DM Sans,sans-serif">No data yet</text>
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
  const metricColor  ={area:"#0ea5e9",production:"#10b981",yield:"#f59e0b"};
  const chartData    =regionData&&regionData[metric]?YEARS.map((y,i)=>({year:y,value:regionData[metric][activeCrop]?.[i]??0})):[];
  const heatValues   =Object.fromEntries(availableRegions.map(r=>{const rd=REGIONAL_DATA[r];const c=rd?.crops.includes(activeCrop)?activeCrop:rd?.crops[0];const v=rd?.[metric]?.[c]?.[6]??null;return[r,v];}).filter(([,v])=>v!==null));
  const cropColors   =["#0ea5e9","#10b981","#f59e0b","#a78bfa","#f43f5e"];
  const multiChart   =regionData?YEARS.map((y,i)=>({year:y,...Object.fromEntries(availableCrops.slice(0,5).map(c=>[c,regionData[metric][c]?.[i]??0]))})):[];
  const tickFmt      =v=>v>1000000?(v/1000000).toFixed(1)+"M":v>1000?(v/1000).toFixed(0)+"k":Number(v).toFixed(v<20?1:0);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Controls */}
      <div style={{background:"#0a0f1a",border:"1px solid #1e293b",borderRadius:12,padding:"12px 16px",display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
        <div>
          <p style={{color:"#475569",fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:7,fontWeight:600}}>Metric</p>
          <div style={{display:"flex",gap:7}}>
            {Object.entries(metricLabel).map(([k,l])=>(
              <button key={k} onClick={()=>setMetric(k)}
                style={{padding:"7px 16px",borderRadius:8,border:`2px solid ${metric===k?metricColor[k]:"#1e293b"}`,background:metric===k?metricColor[k]+"22":"transparent",color:metric===k?metricColor[k]:"#64748b",fontSize:12,fontWeight:metric===k?700:400,cursor:"pointer"}}>
                {l} <span style={{opacity:0.6,fontSize:10}}>({metricUnit[k]})</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p style={{color:"#475569",fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:7,fontWeight:600}}>Crop</p>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {["Wheat","Barley","Rapeseed","Corn","Sunflower","Beet","Potatoes"].map(c=>{
              const avail=regionData?.crops.includes(c);
              return(<button key={c} onClick={()=>avail&&setSelectedCrop(c)}
                style={{padding:"5px 12px",borderRadius:8,border:`1px solid ${activeCrop===c?"#f1f5f9":avail?"#334155":"#1e293b"}`,background:activeCrop===c?"#f1f5f9":"transparent",color:activeCrop===c?"#060d1a":avail?"#94a3b8":"#2d3748",fontSize:11,fontWeight:activeCrop===c?700:400,cursor:avail?"pointer":"default",opacity:avail?1:0.35}}>
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
              <p style={{color:"#334155",fontSize:10}}>Click a region to see its time series →</p>
            </div>
            {selectedRegion&&<span style={{background:metricColor[metric]+"20",border:`1px solid ${metricColor[metric]}40`,borderRadius:8,padding:"3px 10px",color:metricColor[metric],fontSize:11,fontWeight:700}}>{selectedRegion.substring(0,16)}</span>}
          </div>
          <FranceMap selectedRegion={selectedRegion}
            onSelectRegion={r=>{setSelectedRegion(r);setSelectedCrop(REGIONAL_DATA[r]?.crops.includes(activeCrop)?activeCrop:REGIONAL_DATA[r]?.crops[0]);}}
            heatValues={heatValues}/>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>
            {availableRegions.map(r=>(
              <button key={r} onClick={()=>setSelectedRegion(r)}
                style={{padding:"3px 8px",borderRadius:5,border:`1px solid ${selectedRegion===r?metricColor[metric]:"#1e293b"}`,background:selectedRegion===r?metricColor[metric]+"20":"transparent",color:selectedRegion===r?metricColor[metric]:"#475569",fontSize:9,cursor:"pointer"}}>
                {r.split("-")[0].split("–")[0].trim().substring(0,14)}
              </button>
            ))}
          </div>
        </div>
        {/* Charts */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div className="card" style={{border:`1px solid ${metricColor[metric]}30`}}>
            <h3 className="card-title" style={{color:metricColor[metric]}}>{activeCrop} — {metricLabel[metric]} ({metricUnit[metric]}) · {selectedRegion}</h3>
            <p style={{color:"#334155",fontSize:10,marginBottom:10}}>2017–2023 · Source: Agreste / Ministry of Agriculture</p>
            <ResponsiveContainer width="100%" height={185}>
              <BarChart data={chartData} margin={{left:10,right:10}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
                <XAxis dataKey="year" tick={{fill:"#64748b",fontSize:9}}/>
                <YAxis tick={{fill:"#64748b",fontSize:9}} tickFormatter={tickFmt}
                  label={{value:metricUnit[metric],angle:-90,position:"insideLeft",fill:"#64748b",fontSize:9,offset:6}}/>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                <XAxis dataKey="year" tick={{fill:"#64748b",fontSize:9}}/>
                <YAxis tick={{fill:"#64748b",fontSize:9}} tickFormatter={tickFmt}
                  label={{value:metricUnit[metric],angle:-90,position:"insideLeft",fill:"#64748b",fontSize:9,offset:6}}/>
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
  const [farmerTab,      setFarmerTab]      = useState("personas");
  const [activePersona,  setActivePersona]  = useState(FARMER_PERSONAS[0].id);
  const [viewMode,       setViewMode]       = useState("grid");
  const [histMode,       setHistMode]       = useState("farms");
  const persona   = FARMER_PERSONAS.find(p=>p.id===activePersona) || FARMER_PERSONAS[0];
  const p2o5Chart = FARMER_PERSONAS.map(p=>({name:p.nickname.replace("The ",""),value:p.p2o5KgHa,fill:p.color}));
  const intel     = MARKET_INTEL[region];
  const own       = intel?.ownership;
  const histData  = own?.farmSizeHistogram || [];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* Tab switcher */}
      <div style={{ display:"flex", gap:0, background:"#0a0f1a", border:"1px solid #1e293b", borderRadius:10, padding:4, width:"fit-content" }}>
        {[["personas","👤 Farmer Archetypes"],["ownership","🏛️ Ownership Structure"]].map(([k,l])=>(
          <button key={k} onClick={()=>setFarmerTab(k)}
            style={{ padding:"7px 20px", borderRadius:8, border:"none", background:farmerTab===k?"#10b981":"transparent", color:farmerTab===k?"#fff":"#64748b", fontSize:12, fontWeight:farmerTab===k?700:400, cursor:"pointer", transition:"all 0.15s" }}>
            {l}
          </button>
        ))}
      </div>

      {/* ── OWNERSHIP TAB ── */}
      {farmerTab==="ownership" && own && (
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
          <div className="kpi-row">{own.kpis.map((k,i)=><KPICard key={i} {...k}/>)}</div>
          <div className="chart-grid-2">
            <div className="card">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <h3 className="card-title" style={{ marginBottom:0 }}>Farm Size Distribution — France 2020</h3>
                <div style={{ display:"flex", gap:5 }}>
                  {[["farms","# Farms"],["volume","Fert. Vol"]].map(([k,l])=>(
                    <button key={k} onClick={()=>setHistMode(k)}
                      style={{ padding:"3px 9px", borderRadius:6, border:`1px solid ${histMode===k?"#0ea5e9":"#1e293b"}`, background:histMode===k?"#0ea5e920":"transparent", color:histMode===k?"#0ea5e9":"#64748b", fontSize:10, cursor:"pointer" }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <p style={{ color:"#475569", fontSize:11, marginBottom:10 }}>{histMode==="farms"?"Farm count (thousands) by size band":"Share of total P2O5 fertilizer volume"}</p>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={histData} margin={{ left:0, right:10, bottom:10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                  <XAxis dataKey="range" tick={{ fill:"#64748b", fontSize:9 }} angle={-15} textAnchor="end" height={36}/>
                  <YAxis tick={{ fill:"#64748b", fontSize:9 }}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey={histMode==="farms"?"farms":"fertVolPct"} name={histMode==="farms"?"Farms (k)":"Fert. Vol. %"} radius={[4,4,0,0]}>
                    {histData.map((d,i)=><Cell key={i} fill={d.color}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ background:"#0a1020", border:"1px solid #10b98130", borderRadius:8, padding:"9px 11px", marginTop:8 }}>
                <p style={{ color:"#64748b", fontSize:11, lineHeight:1.6, margin:0 }}>
                  {histMode==="farms"?"The >200 ha segment is 14% of farms but 38% of P2O5 volume — the primary target for bulk TSP.":"Farms over 100 ha command 62% of fertilizer volume. This is where precision P programs have the highest commercial impact."}
                </p>
              </div>
            </div>
            <div className="card">
              <h3 className="card-title">Land Tenure Structure</h3>
              <ResponsiveContainer width="100%" height={175}>
                <PieChart><Pie data={own.tenure} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3}>{own.tenure.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie><Tooltip formatter={(v,n)=>[`${v}%`,n]}/></PieChart>
              </ResponsiveContainer>
              <div style={{ display:"flex", flexDirection:"column", gap:6, marginTop:6 }}>
                {own.tenure.map((d,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <div style={{ width:9, height:9, borderRadius:2, background:d.color, flexShrink:0 }}/>
                    <span style={{ color:"#94a3b8", fontSize:12, flex:1 }}>{d.name}</span>
                    <span style={{ color:d.color, fontSize:12, fontWeight:700, fontFamily:"'DM Mono',monospace" }}>{d.value}%</span>
                  </div>
                ))}
              </div>
              <p style={{ color:"#334155", fontSize:11, marginTop:10, lineHeight:1.6 }}>~75% of agricultural land under lease. The 9-year bail rural compresses investment horizons and suppresses long-term soil P building.</p>
            </div>
          </div>
          <div>
            <h3 style={{ color:"#94a3b8", fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:14 }}>Structural Implications for Fertilizer Demand</h3>
            <div className="chart-grid-2">{own.implications.map((item,i)=><InsightCard key={i} item={item}/>)}</div>
          </div>
        </div>
      )}

      {/* ── PERSONAS TAB ── */}
      {farmerTab==="personas" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:"linear-gradient(135deg,#0a0f1a,#0d1225)", border:"1px solid #1e293b", borderRadius:14, padding:"16px 18px" }}>
            <p style={{ color:"#94a3b8", fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>France — 6 Farmer Archetypes</p>
            <p style={{ color:"#64748b", fontSize:12, lineHeight:1.7, margin:0 }}>Based on Agreste 2020 census data, McKinsey global farmer surveys, and OCP commercial field intelligence.</p>
          </div>

          <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:4 }}>
            {FARMER_PERSONAS.map(p=>(
              <button key={p.id} onClick={()=>{setActivePersona(p.id);setViewMode("detail");}}
                style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 14px", borderRadius:12, cursor:"pointer", background:activePersona===p.id?p.color+"22":"#0f172a", border:`1px solid ${activePersona===p.id?p.color:p.color+"30"}`, transition:"all 0.15s" }}>
                <span style={{ fontSize:16 }}>{p.emoji}</span>
                <div style={{ textAlign:"left" }}>
                  <p style={{ color:activePersona===p.id?p.color:"#94a3b8", fontSize:11, fontWeight:700, margin:0 }}>{p.nickname}</p>
                  <p style={{ color:"#475569", fontSize:10, margin:0 }}>{p.share}%</p>
                </div>
              </button>
            ))}
          </div>

          <div style={{ display:"flex", gap:8 }}>
            {[["grid","📊 Overview"],["detail","🔍 Deep Dive"]].map(([k,l])=>(
              <button key={k} onClick={()=>setViewMode(k)}
                style={{ padding:"5px 13px", borderRadius:8, border:`1px solid ${viewMode===k?"#0ea5e9":"#1e293b"}`, background:viewMode===k?"#0ea5e920":"transparent", color:viewMode===k?"#0ea5e9":"#64748b", fontSize:11, cursor:"pointer" }}>
                {l}
              </button>
            ))}
          </div>

          {/* OVERVIEW */}
          {viewMode==="grid" && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div className="chart-grid-2">
                <div className="card">
                  <h3 className="card-title">P2O5 Applied by Archetype (kg/ha)</h3>
                  <p style={{ color:"#475569", fontSize:11, marginBottom:8 }}>vs Comifer recommendation: 55 kg/ha</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={p2o5Chart} layout="vertical" margin={{ left:90, right:20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false}/>
                      <XAxis type="number" domain={[0,60]} tick={{ fill:"#64748b", fontSize:9 }}/>
                      <YAxis type="category" dataKey="name" tick={{ fill:"#94a3b8", fontSize:10 }} width={90}/>
                      <Tooltip content={<CustomTooltip/>}/>
                      <ReferenceLine x={55} stroke="#f59e0b80" strokeDasharray="4 4" label={{ value:"Rec.", fill:"#f59e0b", fontSize:9 }}/>
                      <Bar dataKey="value" name="P2O5 kg/ha" radius={[0,4,4,0]}>{p2o5Chart.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="card">
                  <h3 className="card-title">Segment Share (%)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={FARMER_PERSONAS.map(p=>({name:p.nickname,value:p.share,color:p.color}))} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" paddingAngle={2}>
                        {FARMER_PERSONAS.map((p,i)=><Cell key={i} fill={p.color}/>)}
                      </Pie>
                      <Tooltip formatter={(v,n)=>[`${v}%`,n]}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:4 }}>
                    {FARMER_PERSONAS.map((p,i)=><div key={i} style={{ display:"flex", alignItems:"center", gap:4 }}><div style={{ width:8, height:8, borderRadius:2, background:p.color }}/><span style={{ color:"#64748b", fontSize:10 }}>{p.emoji} {p.share}%</span></div>)}
                  </div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(265px,1fr))", gap:12 }}>
                {FARMER_PERSONAS.map((p,i)=>(
                  <div key={i} onClick={()=>{setActivePersona(p.id);setViewMode("detail");}}
                    style={{ background:"#0a0f1a", border:`1px solid ${p.color}20`, borderTop:`3px solid ${p.color}`, borderRadius:12, padding:"14px", cursor:"pointer", transition:"all 0.15s" }}
                    onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 20px ${p.color}20`;}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                      <div>
                        <span style={{ fontSize:22 }}>{p.emoji}</span>
                        <p style={{ color:p.color, fontSize:12, fontWeight:800, margin:"3px 0 1px" }}>{p.nickname}</p>
                        <p style={{ color:"#475569", fontSize:10, fontStyle:"italic" }}>{p.tagline}</p>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <p style={{ color:p.color, fontSize:20, fontWeight:800, fontFamily:"'DM Mono',monospace", margin:0 }}>{p.share}%</p>
                        <p style={{ color:"#475569", fontSize:10 }}>of farmers</p>
                      </div>
                    </div>
                    <p style={{ color:"#64748b", fontSize:11, lineHeight:1.6, marginBottom:8 }}>{p.description.slice(0,110)}…</p>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ color:"#334155", fontSize:10 }}>P: <span style={{ color:p.color, fontFamily:"'DM Mono',monospace" }}>{p.p2o5KgHa} kg/ha</span></span>
                      <span style={{ color:"#334155", fontSize:10 }}>€{p.fertSpend}/ha</span>
                    </div>
                    <div style={{ display:"flex", gap:3, marginTop:8 }}>
                      {[p.priceScore,p.agronomyScore,p.innovationScore,p.sustainScore,p.coopScore].map((s,j)=>(
                        <div key={j} style={{ flex:1, height:4, borderRadius:2, background:`${["#f43f5e","#0ea5e9","#10b981","#a78bfa","#f59e0b"][j]}${Math.round(s/100*255).toString(16).padStart(2,"0")}` }}/>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DEEP DIVE */}
          {viewMode==="detail" && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ background:`linear-gradient(135deg,${persona.color}15,#0a0f1a)`, border:`1px solid ${persona.color}30`, borderRadius:16, padding:"22px" }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:18, flexWrap:"wrap" }}>
                  <div style={{ fontSize:50 }}>{persona.emoji}</div>
                  <div style={{ flex:1, minWidth:200 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:5 }}>
                      <h2 style={{ color:persona.color, fontSize:20, fontWeight:800, margin:0 }}>{persona.nickname}</h2>
                      <span style={{ padding:"2px 9px", background:persona.color+"25", color:persona.color, borderRadius:20, fontSize:10, fontWeight:700 }}>{persona.share}% of French farmers</span>
                    </div>
                    <p style={{ color:"#94a3b8", fontSize:12, fontStyle:"italic", marginBottom:8 }}>"{persona.tagline}"</p>
                    <p style={{ color:"#cbd5e1", fontSize:12, lineHeight:1.8, margin:0 }}>{persona.description}</p>
                  </div>
                  <div style={{ background:"#0a0f1a", border:`1px solid ${persona.color}30`, borderRadius:10, padding:"12px 16px", minWidth:180 }}>
                    <p style={{ color:"#64748b", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>OCP Opportunity</p>
                    <p style={{ color:"#e2e8f0", fontSize:11, lineHeight:1.7 }}>{persona.ocpOpportunity}</p>
                  </div>
                </div>
              </div>
              <div className="chart-grid-2">
                <div className="card">
                  <h3 className="card-title">Behavioral Profile</h3>
                  <PersonaRadar persona={persona}/>
                  <div style={{ display:"flex", flexDirection:"column", gap:5, marginTop:4 }}>
                    <ScoreBar label="Price Sensitivity"   val={persona.priceScore}     color="#f43f5e"/>
                    <ScoreBar label="Agronomy Focus"      val={persona.agronomyScore}  color="#0ea5e9"/>
                    <ScoreBar label="Innovation Adoption" val={persona.innovationScore} color="#10b981"/>
                    <ScoreBar label="Sustainability"       val={persona.sustainScore}   color="#a78bfa"/>
                    <ScoreBar label="Coop Loyalty"         val={persona.coopScore}      color="#f59e0b"/>
                    <ScoreBar label="Digital Adoption"     val={persona.digitalScore}   color="#64748b"/>
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <div className="card">
                    <h3 className="card-title">Profile Facts</h3>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 }}>
                      {[["Farm size",persona.farmSize],["Age range",persona.age],["Main region",persona.region],["Tenure",persona.tenure],["Structure",persona.structure],["Channel",persona.channel]].map(([k,v])=>(
                        <div key={k} style={{ background:"#0a0f1a", borderRadius:7, padding:"7px 9px" }}>
                          <p style={{ color:"#475569", fontSize:9, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:2 }}>{k}</p>
                          <p style={{ color:"#e2e8f0", fontSize:11, fontWeight:500 }}>{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card">
                    <h3 className="card-title">Fertilizer Decision Logic</h3>
                    <div style={{ display:"flex", gap:7, marginBottom:6 }}>
                      <div style={{ width:7, height:7, borderRadius:"50%", background:persona.color, flexShrink:0, marginTop:4 }}/>
                      <div>
                        <p style={{ color:persona.color, fontSize:10, fontWeight:700, marginBottom:3 }}>Driver: {persona.decisionDriver}</p>
                        <p style={{ color:"#94a3b8", fontSize:11, lineHeight:1.7 }}>{persona.fertiliserBehavior}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))", gap:9 }}>
                {persona.stats.map((s,i)=>(
                  <div key={i} style={{ background:"linear-gradient(135deg,#0f172a,#0a1020)", border:`1px solid ${persona.color}18`, borderRadius:9, padding:"11px 13px" }}>
                    <p style={{ color:"#64748b", fontSize:9, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>{s.label}</p>
                    <p style={{ color:persona.color, fontSize:15, fontWeight:800, fontFamily:"'DM Mono',monospace", margin:0 }}>{s.value}</p>
                    <p style={{ color:"#334155", fontSize:9, marginTop:3 }}>{s.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ─── QUANTITATIVE PAGES ───────────────────────────────────────────────────────

function OverviewPage({ data, region }) {
  const regionCrops = [...new Set(data.filter(d=>d.region===region).map(d=>d.crop))];
  const cropSummary = regionCrops.map(c=>{
    const b=data.find(d=>d.region===region&&d.crop===c&&d.strategy==="Blended (MAP)");
    const s=data.find(d=>d.region===region&&d.crop===c&&d.strategy==="Separated (TSP+N)");
    const o=data.find(d=>d.region===region&&d.crop===c&&d.strategy==="Optimized");
    return { crop:c, blended:b?.margin??0, separated:s?.margin??0, optimized:o?.margin??0, delta:(s?.margin??0)-(b?.margin??0) };
  });
  const regionAttractive = REGIONS.map(r=>{
    const crops=[...new Set(data.filter(d=>d.region===r).map(d=>d.crop))];
    const deltas=crops.map(c=>{
      const b=data.find(d=>d.region===r&&d.crop===c&&d.strategy==="Blended (MAP)");
      const s=data.find(d=>d.region===r&&d.crop===c&&d.strategy==="Separated (TSP+N)");
      return b&&s?s.margin-b.margin:0;
    });
    return { region:r, avg:deltas.reduce((a,x)=>a+x,0)/deltas.length };
  });
  const allBase=data.filter(d=>d.region===region&&d.strategy==="Blended (MAP)");
  const allSep=data.filter(d=>d.region===region&&d.strategy==="Separated (TSP+N)");
  const avgB=allBase.reduce((a,d)=>a+d.margin,0)/(allBase.length||1);
  const avgS=allSep.reduce((a,d)=>a+d.margin,0)/(allSep.length||1);
  const avgD=avgS-avgB;
  const avgF=allBase.reduce((a,d)=>a+(d.fert_cost/d.op_cost)*100,0)/(allBase.length||1);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
      <div className="kpi-row">
        <KPICard label="Avg. Margin — Blended"  value={fmt(avgB)+"/ha"} sub={`all crops · ${region}`} accent="#64748b" />
        <KPICard label="Avg. Margin — Separated" value={fmt(avgS)+"/ha"} sub={`all crops · ${region}`} accent="#0ea5e9" />
        <KPICard label="Avg. Sep. Benefit"       value={(avgD>=0?"+":"")+fmt(avgD)+"/ha"} sub="vs blended" accent={avgD>=0?"#10b981":"#f43f5e"} />
        <KPICard label="Avg. Fert. Cost Share"   value={pct(avgF)}        sub="of production cost" accent="#f59e0b" />
        <KPICard label="Crops modelled"          value={regionCrops.length} sub={`in ${region}`} accent="#a78bfa" />
      </div>
      {/* Product mix histogram from Excel */}
      <div className="card">
        <h3 className="card-title">Product Mix Evolution — France (kt P2O5)</h3>
        <p style={{color:"#475569",fontSize:11,marginBottom:10}}>Season-by-season · Source: Agreste / French Ministry of Agriculture</p>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={PRODUCT_MIX_DATA} margin={{left:8,right:10,bottom:4}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
            <XAxis dataKey="season" tick={{fill:"#64748b",fontSize:9}}/>
            <YAxis tick={{fill:"#64748b",fontSize:9}} label={{value:"kt P2O5",angle:-90,position:"insideLeft",fill:"#475569",fontSize:9,offset:8}}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Legend wrapperStyle={{fontSize:10}}/>
            {Object.entries(PM_COLORS).map(([k,c])=>(
              <Bar key={k} dataKey={k} fill={c} stackId="a" radius={k==="Organomineral"?[3,3,0,0]:undefined}/>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-grid-2">
        <div className="card">
          <h3 className="card-title">Gross Margin by Crop & Strategy — {region}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cropSummary} margin={{ left:0,right:10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="crop" tick={{ fill:"#64748b",fontSize:11 }} />
              <YAxis tick={{ fill:"#64748b",fontSize:10 }} />
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
            <BarChart data={regionAttractive} margin={{ left:0,right:10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="region" tick={{ fill:"#64748b",fontSize:10 }} />
              <YAxis tick={{ fill:"#64748b",fontSize:10 }} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#334155" />
              <Bar dataKey="avg" name="Avg Δ Margin ($/ha)" radius={[4,4,0,0]}>
                {regionAttractive.map((e,i)=><Cell key={i} fill={e.avg>30?"#10b981":e.avg>0?"#0ea5e9":"#f43f5e"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="card">
        <h3 className="card-title">Separation Delta — {region}</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {cropSummary.map((row,i)=>{
            const max=Math.max(...cropSummary.map(r=>r.separated));
            const dc=row.delta>30?"#10b981":row.delta>0?"#0ea5e9":"#f43f5e";
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ color:"#94a3b8",fontSize:12,width:72,flexShrink:0 }}>{row.crop}</span>
                <div style={{ flex:1, background:"#1e293b", borderRadius:4, height:24, position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute",left:0,top:0,height:"100%",width:`${(row.separated/max)*100}%`,background:`linear-gradient(90deg,${dc}40,${dc}20)`,borderRadius:4 }} />
                  <span style={{ position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#e2e8f0",fontSize:11,fontFamily:"'DM Mono',monospace" }}>${row.separated}/ha</span>
                </div>
                <span style={{ color:dc,fontSize:12,fontWeight:700,fontFamily:"'DM Mono',monospace",width:56,textAlign:"right",flexShrink:0 }}>{row.delta>0?"+":""}{row.delta}</span>
                <span style={{ padding:"2px 8px",borderRadius:20,fontSize:10,background:dc+"20",color:dc,width:68,textAlign:"center",flexShrink:0 }}>{row.delta>30?"STRONG":row.delta>0?"MARGINAL":"NEUTRAL"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SimulatorPage({ data, region, crop }) {
  const [cropPrice,setCropPrice]=useState(250);
  const [mapPrice,setMapPrice]=useState(520);
  const [tspPrice,setTspPrice]=useState(480);
  const [baseYield,setBaseYield]=useState(4.5);
  const [yieldBoost,setYieldBoost]=useState(8);
  const [extraPasses,setExtraPasses]=useState(1);
  const [costPerPass,setCostPerPass]=useState(55);
  const [appRateN,setAppRateN]=useState(150);
  const [appRateP,setAppRateP]=useState(80);
  const realBase=data.find(d=>d.region===region&&d.crop===crop&&d.strategy==="Blended (MAP)");
  const scenarios=useMemo(()=>{
    const fb=(appRateP*mapPrice)/1000+(appRateN*280)/1000;
    const fs=(appRateP*tspPrice)/1000+(appRateN*280)/1000;
    const ex=extraPasses*costPerPass;
    const yS=baseYield*(1+yieldBoost/100);
    const yO=baseYield*(1+(yieldBoost*1.3)/100);
    const boc=realBase?.op_cost??750;
    return [
      { strategy:"Blended (MAP)",     yield:baseYield,revenue:baseYield*cropPrice,fertCost:fb,opCost:boc,       totalCost:boc+fb,            margin:baseYield*cropPrice-boc-fb },
      { strategy:"Separated (TSP+N)", yield:yS,       revenue:yS*cropPrice,       fertCost:fs,opCost:boc+ex,   totalCost:boc+ex+fs,         margin:yS*cropPrice-(boc+ex)-fs },
      { strategy:"Optimized",         yield:yO,       revenue:yO*cropPrice,       fertCost:fs*0.95,opCost:boc+ex*0.85,totalCost:boc+ex*0.85+fs*0.95,margin:yO*cropPrice-(boc+ex*0.85)-fs*0.95 },
    ];
  },[cropPrice,mapPrice,tspPrice,baseYield,yieldBoost,extraPasses,costPerPass,appRateN,appRateP,realBase]);
  const base=scenarios[0];
  const breakEven=((extraPasses*costPerPass)/cropPrice).toFixed(2);
  const passes=yieldBoost/100*baseYield>=breakEven;
  const waterfallData=[
    {name:"Base",value:base.margin,fill:"#64748b"},
    {name:"+Yield",value:scenarios[1].revenue-base.revenue,fill:"#10b981"},
    {name:"-Passes",value:-(extraPasses*costPerPass),fill:"#f43f5e"},
    {name:"-FertΔ",value:-(scenarios[1].fertCost-base.fertCost),fill:"#f59e0b"},
    {name:"=Sep.",value:scenarios[1].margin,fill:"#0ea5e9"},
  ];
  const Slider=({label,min,max,step,value,onChange,unit})=>(
    <div style={{ marginBottom:11 }}>
      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
        <span style={{ color:"#94a3b8",fontSize:12 }}>{label}</span>
        <span style={{ color:"#f1f5f9",fontSize:12,fontFamily:"'DM Mono',monospace" }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))} style={{ width:"100%",accentColor:"#0ea5e9",cursor:"pointer" }} />
    </div>
  );
  return (
    <div>
      <div className="simulator-grid">
        <div className="card">
          <h3 className="card-title">Inputs — {crop} · {region}</h3>
          {realBase&&<p style={{ color:"#10b981",fontSize:11,marginBottom:11,background:"#10b98110",borderRadius:6,padding:"5px 10px",border:"1px solid #10b98120" }}>Base op. cost: ${realBase.op_cost}/ha</p>}
          <Slider label="Crop Price ($/t)" min={100} max={600} step={10} value={cropPrice} onChange={setCropPrice} unit=" $/t"/>
          <Slider label="MAP Price ($/t)"  min={300} max={900} step={10} value={mapPrice}  onChange={setMapPrice}  unit=" $/t"/>
          <Slider label="TSP Price ($/t)"  min={280} max={850} step={10} value={tspPrice}  onChange={setTspPrice}  unit=" $/t"/>
          <Slider label="Base Yield"       min={1}   max={15}  step={0.1}value={baseYield} onChange={setBaseYield} unit=" t/ha"/>
          <Slider label="Yield Boost Sep." min={0}   max={30}  step={0.5}value={yieldBoost}onChange={setYieldBoost}unit="%"/>
          <Slider label="Extra Passes"     min={0}   max={4}   step={1}  value={extraPasses}onChange={setExtraPasses}unit=""/>
          <Slider label="Cost/Pass"        min={20}  max={150} step={5}  value={costPerPass}onChange={setCostPerPass}unit=" $/ha"/>
          <Slider label="N Rate"           min={50}  max={300} step={5}  value={appRateN}  onChange={setAppRateN}  unit=" kg/ha"/>
          <Slider label="P Rate"           min={20}  max={200} step={5}  value={appRateP}  onChange={setAppRateP}  unit=" kg/ha"/>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12 }}>
            {scenarios.map((s,si)=>{
              const delta=s.margin-base.margin;
              const col=Object.values(STRATEGY_COLORS)[si];
              const winner=s.margin===Math.max(...scenarios.map(x=>x.margin));
              return (
                <div key={si} style={{ background:"linear-gradient(135deg,#0f172a,#0a1020)",border:`1px solid ${col}${winner?"80":"30"}`,borderRadius:14,padding:"16px 14px",position:"relative",overflow:"hidden" }}>
                  {winner&&<div style={{ position:"absolute",top:8,right:10,fontSize:14 }}>🏆</div>}
                  <div style={{ width:10,height:10,borderRadius:"50%",background:col,marginBottom:8,boxShadow:`0 0 8px ${col}` }} />
                  <p style={{ color:col,fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8,fontWeight:700 }}>{s.strategy}</p>
                  <p style={{ color:"#f1f5f9",fontSize:20,fontWeight:800,fontFamily:"'DM Mono',monospace",margin:0 }}>{fmt(s.margin)}</p>
                  <p style={{ color:"#64748b",fontSize:10,marginTop:2 }}>$/ha margin</p>
                  {si>0&&<div style={{ marginTop:8,padding:"3px 8px",borderRadius:6,background:delta>=0?"#10b98120":"#f43f5e20",display:"inline-block" }}><span style={{ color:delta>=0?"#10b981":"#f43f5e",fontSize:11,fontWeight:700,fontFamily:"'DM Mono',monospace" }}>{delta>=0?"+":""}{fmt(delta)}</span></div>}
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
                  <XAxis dataKey="name" tick={{ fill:"#64748b",fontSize:9 }} />
                  <YAxis tick={{ fill:"#64748b",fontSize:9 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="$/ha" radius={[3,3,0,0]}>{waterfallData.map((d,i)=><Cell key={i} fill={d.fill} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{ display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:10 }}>
              <h3 className="card-title">Break-Even</h3>
              <p style={{ color:"#f59e0b",fontSize:30,fontWeight:800,fontFamily:"'DM Mono',monospace" }}>{breakEven} t/ha</p>
              <div style={{ width:"100%",background:passes?"#10b98120":"#f43f5e20",borderRadius:10,padding:"10px",textAlign:"center",border:`1px solid ${passes?"#10b98140":"#f43f5e40"}` }}>
                <p style={{ color:passes?"#10b981":"#f43f5e",fontWeight:700,fontSize:12 }}>{passes?"✓ SEPARATION PAYS OFF":"✗ DOES NOT BREAK EVEN"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PLPage({ data, region, crop }) {
  const [expanded,setExpanded]=useState({});
  const base=data.find(d=>d.region===region&&d.crop===crop&&d.strategy==="Blended (MAP)");
  const categories=[
    {key:"seed",label:"Seed",           value:95,                   share:11,color:"#a78bfa"},
    {key:"fert",label:"Fertilizer",     value:base?.fert_cost||310,  share:Math.round((base?.fert_cost||310)/(base?.op_cost||900)*100),color:"#f59e0b"},
    {key:"cp",  label:"Crop Protection",value:120,                   share:14,color:"#0ea5e9"},
    {key:"mach",label:"Machinery",      value:180,                   share:21,color:"#64748b"},
    {key:"labor",label:"Labor",         value:95,                    share:11,color:"#10b981"},
    {key:"fuel",label:"Fuel",           value:65,                    share:8, color:"#f43f5e"},
    {key:"land",label:"Land / Rent",    value:145,                   share:17,color:"#e2e8f0"},
  ];
  const sensData=[200,300,400,500,600,700,800].map(fp=>({
    price:fp,
    "Blended":  (base?.revenue||1050)-(base?.op_cost||900-(base?.fert_cost||310))-fp,
    "Separated":(base?.revenue||1050)*1.08-((base?.op_cost||900)+55-((base?.fert_cost||310)*0.95))-fp*0.95,
  }));
  const donutData=categories.map(c=>({name:c.label,value:c.share,color:c.color}));
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:18 }}>
      <div className="chart-grid-2">
        <div className="card">
          <h3 className="card-title">Cost Breakdown — {crop} · {region}</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart><Pie data={donutData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={2}>{donutData.map((d,i)=><Cell key={i} fill={d.color} />)}</Pie><Tooltip formatter={(v,n)=>[`${v}%`,n]} /></PieChart>
          </ResponsiveContainer>
          {categories.map(cat=>(
            <div key={cat.key} style={{ marginBottom:5 }}>
              <div onClick={()=>setExpanded(e=>({...e,[cat.key]:!e[cat.key]}))}
                style={{ display:"flex",alignItems:"center",gap:9,cursor:"pointer",padding:"5px 7px",borderRadius:7,background:expanded[cat.key]?"#1e293b":"transparent" }}>
                <div style={{ width:9,height:9,borderRadius:2,background:cat.color,flexShrink:0 }} />
                <span style={{ color:"#e2e8f0",fontSize:12,flex:1 }}>{cat.label}</span>
                <div style={{ width:80,background:"#1e293b",borderRadius:3,height:4 }}><div style={{ width:`${cat.share}%`,background:cat.color,borderRadius:3,height:"100%" }} /></div>
                <span style={{ color:"#94a3b8",fontSize:11,width:28,textAlign:"right" }}>{cat.share}%</span>
                <span style={{ color:"#f1f5f9",fontSize:11,fontFamily:"'DM Mono',monospace",width:52,textAlign:"right" }}>${cat.value}</span>
              </div>
              {expanded[cat.key]&&<div style={{ marginLeft:22,padding:"5px 10px",background:"#0a0f1a",borderRadius:7,fontSize:11,color:"#64748b" }}>{cat.key==="fert"?`Blended: $${cat.value}/ha → Sep.: $${Math.round(cat.value*0.95)}/ha`:`Standard allocation for ${crop.toLowerCase()} in ${region}.`}</div>}
            </div>
          ))}
        </div>
        <div className="card">
          <h3 className="card-title">Margin Sensitivity to Fertilizer Price</h3>
          <p style={{ color:"#475569",fontSize:11,marginBottom:10 }}>{crop} · {region}</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sensData}>
              <defs>
                <linearGradient id="gbFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/><stop offset="95%" stopColor="#64748b" stopOpacity={0}/></linearGradient>
                <linearGradient id="gsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="price" tick={{ fill:"#64748b",fontSize:10 }} />
              <YAxis tick={{ fill:"#64748b",fontSize:10 }} />
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
  const base=data.find(d=>d.region===region&&d.crop===crop&&d.strategy==="Blended (MAP)");
  const ph=base?.soil_ph??6.5;
  const phData=Array.from({length:30},(_,i)=>{const p=5.0+i*0.15;return{ph:p.toFixed(1),"MAP/DAP":Math.max(0,6.5-Math.abs(p-6.2)*1.8+(p>7.0?-(p-7.0)*2:0)),"TSP Sep.":Math.max(0,7.0-Math.abs(p-6.5)*1.2+(p>7.5?-(p-7.5)*1.5:0)),"Optimized":Math.max(0,7.5-Math.abs(p-6.8)*1.0)};});
  const pRateData=Array.from({length:10},(_,i)=>{const r=i*20+20;return{rate:r,"MAP/DAP":Math.min(8,3+Math.sqrt(r)*0.65),"TSP Sep.":Math.min(9,3.2+Math.sqrt(r)*0.72),"Optimized":Math.min(9.5,3.4+Math.sqrt(r)*0.78)};});
  const omData=Array.from({length:8},(_,i)=>{const om=0.5+i*0.5;return{om:om.toFixed(1),"P Eff. MAP":Math.min(85,40+om*18),"P Eff. TSP":Math.min(92,45+om*20)};});
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:18 }}>
      <div className="card">
        <h3 className="card-title">Annual Nutrient Consumption — France (t nutrient)</h3>
        <p style={{color:"#475569",fontSize:11,marginBottom:10}}>2017–2023 · Source: Agreste / French Ministry of Agriculture</p>
        <ResponsiveContainer width="100%" height={195}>
          <LineChart data={CONSUMPTION_DATA} margin={{left:10,right:20}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
            <XAxis dataKey="year" tick={{fill:"#64748b",fontSize:9}}/>
            <YAxis tick={{fill:"#64748b",fontSize:9}} tickFormatter={v=>(v/1000).toFixed(0)+"k"} label={{value:"t nutrient",angle:-90,position:"insideLeft",fill:"#64748b",fontSize:9,offset:6}}/>
            <Tooltip content={<CustomTooltip/>} formatter={v=>[v.toLocaleString()+" t",""]}/>
            <Legend wrapperStyle={{fontSize:10}}/>
            <Line type="monotone" dataKey="N"    name="N (t)"    stroke="#0ea5e9" strokeWidth={2} dot={{r:3}}/>
            <Line type="monotone" dataKey="P2O5" name="P2O5 (t)" stroke="#10b981" strokeWidth={2} dot={{r:3}}/>
            <Line type="monotone" dataKey="K2O"  name="K2O (t)"  stroke="#f59e0b" strokeWidth={2} dot={{r:3}}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
      {base&&(
        <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
          {[{label:"Crop",val:crop,color:"#0ea5e9"},{label:"Region",val:region,color:"#a78bfa"},{label:"Soil pH",val:ph,color:"#f59e0b"},{label:"Org. Matter",val:base.om+"%",color:"#10b981"}].map((item,i)=>(
            <div key={i} style={{ background:"linear-gradient(135deg,#0f172a,#0a1020)",border:`1px solid ${item.color}25`,borderRadius:12,padding:"12px 16px",flex:1,minWidth:90 }}>
              <p style={{ color:"#64748b",fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4 }}>{item.label}</p>
              <p style={{ color:item.color,fontSize:17,fontWeight:700,fontFamily:"'DM Mono',monospace" }}>{item.val}</p>
            </div>
          ))}
        </div>
      )}
      <div className="chart-grid-2">
        <div className="card">
          <h3 className="card-title">Yield vs Soil pH</h3>
          <p style={{ color:"#475569",fontSize:11,marginBottom:10 }}>Separation advantage highest at pH &gt; 7.5</p>
          <ResponsiveContainer width="100%" height={175}>
            <LineChart data={phData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="ph" tick={{ fill:"#64748b",fontSize:9 }} />
              <YAxis tick={{ fill:"#64748b",fontSize:9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize:9 }} />
              <ReferenceLine x={String(ph.toFixed(1))} stroke="#f59e0b80" strokeDasharray="4 4" label={{ value:"↑ now",fill:"#f59e0b",fontSize:9 }} />
              {["MAP/DAP","TSP Sep.","Optimized"].map((k,i)=><Line key={k} type="monotone" dataKey={k} stroke={Object.values(STRATEGY_COLORS)[i]} strokeWidth={2} dot={false} />)}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="card-title">Yield vs P Rate</h3>
          <p style={{ color:"#475569",fontSize:11,marginBottom:10 }}>Separation shifts the plateau upward</p>
          <ResponsiveContainer width="100%" height={175}>
            <LineChart data={pRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="rate" tick={{ fill:"#64748b",fontSize:9 }} />
              <YAxis tick={{ fill:"#64748b",fontSize:9 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize:9 }} />
              {["MAP/DAP","TSP Sep.","Optimized"].map((k,i)=><Line key={k} type="monotone" dataKey={k} stroke={Object.values(STRATEGY_COLORS)[i]} strokeWidth={2} dot={false} />)}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="card-title">P Efficiency vs Organic Matter</h3>
          <p style={{ color:"#475569",fontSize:11,marginBottom:10 }}>Gap narrows above 2.5% OM</p>
          <ResponsiveContainer width="100%" height={175}>
            <AreaChart data={omData}>
              <defs>
                <linearGradient id="mapFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#64748b" stopOpacity={0.4}/><stop offset="95%" stopColor="#64748b" stopOpacity={0}/></linearGradient>
                <linearGradient id="tspFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="om" tick={{ fill:"#64748b",fontSize:9 }} />
              <YAxis tick={{ fill:"#64748b",fontSize:9 }} />
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
            {title:"P Fixation in Calcareous Soils",body:"At pH > 7.5, Ca²⁺ precipitates MAP phosphate within hours. TSP maintains a lower pH microzone, delaying fixation.",accent:"#f59e0b",icon:"🧲"},
            {title:"NH₄⁺ Interference in Blends",  body:"MAP/DAP release N and P simultaneously. High NH₄⁺ suppresses root P uptake. Separation removes this competition.",accent:"#a78bfa",icon:"⚗️"},
            {title:"Placement & Timing",            body:"Banded TSP subsurface puts P directly in the root zone. Broadcast MAP loses 15–35% to surface fixation.",accent:"#0ea5e9",icon:"📍"},
          ].map((item,i)=>(
            <div key={i} style={{ borderLeft:`3px solid ${item.accent}`,paddingLeft:11,marginBottom:13,paddingTop:2 }}>
              <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:3 }}><span style={{ fontSize:13 }}>{item.icon}</span><p style={{ color:item.accent,fontSize:11,fontWeight:700 }}>{item.title}</p></div>
              <p style={{ color:"#64748b",fontSize:11,lineHeight:1.6 }}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InsightsPage({ data, region, crop }) {
  const insights=generateInsights(data,region,crop);
  const allCrops=[...new Set(data.map(d=>d.crop))];const allInsights=[...new Set(data.map(d=>d.region))].flatMap(r=>allCrops.filter(c=>data.some(d=>d.region===r&&d.crop===c)).map(c=>{
    const b=data.find(d=>d.region===r&&d.crop===c&&d.strategy==="Blended (MAP)");
    const s=data.find(d=>d.region===r&&d.crop===c&&d.strategy==="Separated (TSP+N)");
    if(!b||!s) return null;
    return {region:r,crop:c,delta:s.margin-b.margin,ph:b.soil_ph};
  }).filter(Boolean));
  const base=data.find(d=>d.region===region&&d.crop===crop&&d.strategy==="Blended (MAP)");
  const sep=data.find(d=>d.region===region&&d.crop===crop&&d.strategy==="Separated (TSP+N)");
  const radarData=base&&sep?[
    {metric:"Yield",    blended:base.yield/0.1,  separated:sep.yield/0.1},
    {metric:"Margin",   blended:base.margin/10,  separated:sep.margin/10},
    {metric:"P Effic.", blended:60,              separated:80},
    {metric:"Revenue",  blended:base.revenue/20, separated:sep.revenue/20},
    {metric:"Cost Eff.",blended:50,              separated:70},
  ]:[];
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:18 }}>
      <div className="chart-grid-2">
        <div className="card" style={{ border:"1px solid #0ea5e930" }}>
          <h3 style={{ color:"#0ea5e9",fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14 }}>◈ Model Insights — {crop} · {region}</h3>
          {insights.length?insights.map((ins,i)=>(
            <div key={i} style={{ display:"flex",gap:10,marginBottom:11,padding:"9px 12px",background:"#0a0f1a",borderRadius:8,borderLeft:"2px solid #0ea5e940" }}>
              <span style={{ color:"#0ea5e9",fontSize:13,marginTop:1,flexShrink:0 }}>→</span>
              <p style={{ color:"#cbd5e1",fontSize:12,lineHeight:1.7,margin:0 }}>{ins}</p>
            </div>
          )):<p style={{ color:"#475569" }}>No data for selected context.</p>}
        </div>
        {radarData.length>0&&(
          <div className="card">
            <h3 className="card-title">Strategy Radar — {crop} · {region}</h3>
            <ResponsiveContainer width="100%" height={230}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="metric" tick={{ fill:"#64748b",fontSize:10 }} />
                <Radar name="Blended"   dataKey="blended"   stroke="#64748b" fill="#64748b" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Separated" dataKey="separated" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.25} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize:10 }} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <div className="card" style={{ overflow:"auto" }}>
        <h3 className="card-title">Full Separation Benefit Matrix</h3>
        <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:360 }}>
          <thead><tr style={{ borderBottom:"1px solid #1e293b" }}>{["Region","Crop","pH","Δ Margin","Verdict"].map((h,i)=><th key={i} style={{ padding:"8px 12px",textAlign:i>1?"right":"left",color:"#64748b",fontSize:10,textTransform:"uppercase",fontWeight:500,whiteSpace:"nowrap" }}>{h}</th>)}</tr></thead>
          <tbody>{allInsights.sort((a,b)=>b.delta-a.delta).map((row,i)=>{const dc=row.delta>30?"#10b981":row.delta>0?"#0ea5e9":"#f43f5e";return(<tr key={i} style={{ borderBottom:"1px solid #0f1929",background:i%2===0?"#0a0f1a":"#0f172a" }}><td style={{ padding:"8px 12px",color:"#94a3b8" }}>{row.region}</td><td style={{ padding:"8px 12px",color:"#94a3b8" }}>{row.crop}</td><td style={{ padding:"8px 12px",textAlign:"right",color:"#64748b",fontFamily:"'DM Mono',monospace" }}>{row.ph}</td><td style={{ padding:"8px 12px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontWeight:700,color:dc }}>{row.delta>0?"+":""}{row.delta}</td><td style={{ padding:"8px 12px",textAlign:"right" }}><span style={{ padding:"2px 8px",borderRadius:20,fontSize:10,background:dc+"20",color:dc,whiteSpace:"nowrap" }}>{row.delta>30?"STRONG":row.delta>0?"MARGINAL":"NEUTRAL"}</span></td></tr>);})}</tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MARKET INTELLIGENCE PAGES ────────────────────────────────────────────────
function MIPlaceholder({ region }) {
  return <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:300,gap:12 }}><p style={{ fontSize:40 }}>🌍</p><p style={{ fontSize:15,color:"#64748b" }}>No market intelligence data for {region}.</p><p style={{ fontSize:12,color:"#334155" }}>Available: {Object.keys(MARKET_INTEL).join(", ")}</p></div>;
}

// ─── FARMER P&L PAGE ──────────────────────────────────────────────────────────
// Data source: FADN / Réseau d'Information Comptable Agricole (RICA) France
// Average per farm, SOP above 25k€, values in €/ha
const FARMER_PL_DATA = {
  "Cereals & Oilseeds": {
    color:"#0ea5e9", emoji:"🌾", farms:48140, uaa:134.81, uta:1.30, nonsalUta:1.17,
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
    color:"#10b981", emoji:"🥕", farms:24745, uaa:111.88, uta:1.99, nonsalUta:1.29,
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
    { name:"Livestock",    value:-d.costs.livestockSpecific.total, fill:"#64748b" },
    { name:"Financial",    value:-d.costs.financial, fill:"#475569" },
    { name:"Net income",   value:netIncome, fill:netIncome>=0?"#10b981":"#ef4444" },
  ];

  // Cost breakdown for donut
  const costPie = [
    { name:"Fertilisers",    value:d.costs.cropSpecific.fertilisers,   color:"#0ea5e9" },
    { name:"Seeds",          value:d.costs.cropSpecific.seeds,          color:"#818cf8" },
    { name:"Crop prot.",     value:d.costs.cropSpecific.cropProtection, color:"#f43f5e" },
    { name:"Land rent",      value:d.costs.otherOp.landRent,            color:"#f59e0b" },
    { name:"Labour",         value:d.costs.otherOp.labour,              color:"#10b981" },
    { name:"Depreciation",   value:d.costs.otherOp.depreciation,        color:"#64748b" },
    { name:"Energy",         value:d.costs.otherOp.energy,              color:"#a78bfa" },
    { name:"Livestock",      value:d.costs.livestockSpecific.total,     color:"#94a3b8" },
    { name:"Financial",      value:d.costs.financial,                   color:"#334155" },
  ].filter(x=>x.value>0);

  // P&L row component
  const Row = ({ label, value, indent=0, bold=false, header=false, sign=false, expandKey=null, children=null, color=null, dimmed=false }) => {
    const isOpen = expanded[expandKey];
    const textColor = header?"#0ea5e9":bold?"#f1f5f9":dimmed?"#475569":"#94a3b8";
    const valColor = color||(header?d.color:bold?"#f1f5f9":"#94a3b8");
    const bg = header?"#080e1a":bold?"#0a1020":"transparent";
    const displayVal = sign && value>0 ? "+"+fmtV(value) : fmtV(value);
    return (
      <>
        <div onClick={expandKey?()=>toggle(expandKey):undefined}
          style={{ display:"flex", alignItems:"center", padding:`${header||bold?"9px":"6px"} 14px`, background:bg,
            borderBottom:"1px solid #0d1829", cursor:expandKey?"pointer":"default",
            paddingLeft: 14+indent*16 }}
          onMouseEnter={e=>{if(!bold&&!header)e.currentTarget.style.background="#0a1018";}}
          onMouseLeave={e=>{if(!bold&&!header)e.currentTarget.style.background=bg;}}>
          {expandKey && <span style={{color:"#475569",fontSize:10,marginRight:7,width:10,flexShrink:0}}>{isOpen?"▼":"▶"}</span>}
          {!expandKey && indent>0 && <span style={{color:"#1e3040",marginRight:7,width:10,flexShrink:0}}>└</span>}
          {!expandKey && indent===0 && <span style={{width:17,flexShrink:0}}/>}
          <span style={{ flex:1, fontSize:header?12:bold?12:11, fontWeight:header||bold?700:400, color:textColor, fontStyle:dimmed?"italic":"normal" }}>{label}</span>
          <span style={{ fontSize:bold||header?12:11, fontWeight:bold||header?700:500, fontFamily:"'DM Mono',monospace", color:valColor, width:96, textAlign:"right" }}>{displayVal}</span>
          <span style={{ fontSize:10, color:"#334155", width:46, textAlign:"right", fontFamily:"'DM Mono',monospace" }}>{pctRev(Math.abs(value))}</span>
        </div>
        {expandKey && isOpen && children}
      </>
    );
  };

  const Divider = ({ label }) => (
    <div style={{ background:"#060d1a", padding:"4px 14px 3px", borderBottom:"1px solid #0d1829" }}>
      <span style={{ color:"#334155", fontSize:9, textTransform:"uppercase", letterSpacing:"0.1em" }}>{label}</span>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:14 }}>
        <div>
          <h2 style={{ color:"#f1f5f9", fontSize:17, fontWeight:800, marginBottom:3 }}>Farmer P&L — Average per farm · €/Ha <span style={{color:"#475569",fontWeight:400,fontSize:13}}>(2024)</span></h2>
          <p style={{ color:"#475569", fontSize:11 }}>Source: FADN / RICA France · Standard Output &gt; 25k€ · Values in €/Ha unless stated</p>
        </div>

      </div>

      {/* Farm type selector */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {Object.entries(FARMER_PL_DATA).map(([key,val])=>(
          <button key={key} onClick={()=>setFarmType(key)}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 16px", borderRadius:10,
              border:`2px solid ${farmType===key?val.color:val.color+"28"}`,
              background:farmType===key?val.color+"18":"transparent",
              color:farmType===key?val.color:"#64748b",
              fontSize:12, fontWeight:farmType===key?700:400, cursor:"pointer", transition:"all 0.15s" }}>
            <span style={{fontSize:15}}>{val.emoji}</span> {key}
          </button>
        ))}
      </div>

      {/* Farm characteristics strip */}
      <div style={{ background:"#080e1a", border:"1px solid #1e293b", borderRadius:10, padding:"10px 16px", display:"flex", gap:24, flexWrap:"wrap" }}>
        {[
          {label:"Farms represented",   val:d.farms.toLocaleString()+" farms"},
          {label:"Utilised agri. area",  val:d.uaa+" ha / farm"},
          {label:"Annual work units",    val:d.uta+" UTA"},
          {label:"of which non-salaried",val:d.nonsalUta+" UTA"},
        ].map((item,i)=>(
          <div key={i}>
            <p style={{ color:"#334155", fontSize:9, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:2 }}>{item.label}</p>
            <p style={{ color:"#64748b", fontSize:12, fontFamily:"'DM Mono',monospace" }}>{item.val}</p>
          </div>
        ))}
      </div>

      {/* KPI strip — only what's in the document */}
      <div className="kpi-row">
        <KPICard label="Total current output" value={"€"+d.totalOutput.toLocaleString()+"/ha"} sub="net of livestock purchases" accent={d.color}/>
        <KPICard label="Total current costs"  value={"€"+d.totalCosts.toLocaleString()+"/ha"} sub={((d.totalCosts/d.totalOutput)*100).toFixed(0)+"% of output"} accent="#f43f5e"/>
        <KPICard label="Net income"           value={(netIncome>=0?"+":"-")+"€"+Math.abs(netIncome).toFixed(0)+"/ha"} sub="total output − total costs" accent={netIncome>=0?"#10b981":"#f43f5e"}/>
        <KPICard label="Fertilisers & soil"   value={"€"+d.costs.cropSpecific.fertilisers+"/ha"} sub={fertPct+"% of total costs"} accent="#0ea5e9"/>
      </div>

      <div className="chart-grid-2">
        {/* Output vs costs bar chart */}
        <div className="card">
          <h3 className="card-title">Output vs Costs breakdown (€/ha)</h3>
          <p style={{ color:"#475569", fontSize:11, marginBottom:10 }}>Net income = Total output − Total costs</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ left:8, right:8, bottom:10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
              <XAxis dataKey="name" tick={{ fill:"#64748b", fontSize:9 }} angle={-12} textAnchor="end" height={38}/>
              <YAxis tick={{ fill:"#64748b", fontSize:9 }} tickFormatter={v=>v>=0?"€"+(v/1000).toFixed(0)+"k":"−€"+(-v/1000).toFixed(0)+"k"}/>
              <Tooltip content={<CustomTooltip/>} formatter={v=>["€"+Math.abs(v).toLocaleString(),""]}/>
              <ReferenceLine y={0} stroke="#334155" strokeWidth={1}/>
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
                <span style={{ color:"#475569", fontSize:10 }}>{e.name} <span style={{ color:e.color, fontFamily:"'DM Mono',monospace" }}>{((e.value/d.totalCosts)*100).toFixed(0)}%</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FULL P&L TABLE — exact FADN structure, all expandable ── */}
      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        {/* Header row */}
        <div style={{ display:"flex", padding:"10px 14px 10px 31px", background:"#060d1a", borderBottom:"2px solid #1e293b" }}>
          <span style={{ flex:1, color:"#475569", fontSize:10, textTransform:"uppercase", letterSpacing:"0.06em" }}>Line item</span>
          <span style={{ color:"#475569", fontSize:10, textTransform:"uppercase", letterSpacing:"0.06em", width:96, textAlign:"right" }}>€ / ha</span>
          <span style={{ color:"#475569", fontSize:10, textTransform:"uppercase", letterSpacing:"0.06em", width:46, textAlign:"right" }}>% out.</span>
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
            <Row label="Fertilisers and soil amendments" value={-d.costs.cropSpecific.fertilisers}   color="#0ea5e9" indent={2}/>
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
        <div style={{ display:"flex", alignItems:"center", padding:"12px 14px 12px 31px", background:"#0a1628", borderTop:"2px solid #1e293b" }}>
          <span style={{ flex:1, fontSize:13, fontWeight:800, color:"#f1f5f9" }}>Net income (total output − total costs)</span>
          <span style={{ fontSize:15, fontWeight:800, fontFamily:"'DM Mono',monospace", color:netIncome>=0?"#10b981":"#f43f5e", width:96, textAlign:"right" }}>
            {netIncome>=0?"+ ":"− "}€{Math.abs(netIncome).toFixed(0)}
          </span>
          <span style={{ fontSize:11, fontWeight:700, fontFamily:"'DM Mono',monospace", color:netIncome>=0?"#10b98180":"#f43f5e80", width:46, textAlign:"right" }}>
            {((netIncome/d.totalOutput)*100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Fertiliser in context */}
      <div style={{ background:`linear-gradient(135deg,#0e2535,#080e18)`, border:"1px solid #0ea5e930", borderRadius:12, padding:"16px 20px" }}>
        <p style={{ color:"#0ea5e9", fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8, fontWeight:700 }}>🧪 Fertilisers in context — {farmType} {d.emoji}</p>
        <p style={{ color:"#64748b", fontSize:12, lineHeight:1.75 }}>
          Fertilisers & soil amendments represent <span style={{ color:"#0ea5e9", fontWeight:700 }}>€{d.costs.cropSpecific.fertilisers}/ha</span> ({fertPct}% of total costs). Against total output of €{d.totalOutput.toLocaleString()}/ha, this represents {((d.costs.cropSpecific.fertilisers/d.totalOutput)*100).toFixed(1)}% of farm revenue — a relatively small share where agronomic improvements from P separation can generate a net positive return even at a modest yield uplift.
        </p>
      </div>
    </div>
  );
}



function MIMarketDynamicsPage({ region }) {
  const intel=MARKET_INTEL[region];
  const [recoOpen,setRecoOpen]=useState(false);
  const [briefOpen,setBriefOpen]=useState(false);
  if (!intel) return <MIPlaceholder region={region} />;
  const maxMix=Math.max(...intel.productMix.map(r=>r.val2022));

  const MACRO_KPIS = [
    { label:"Population", value:"68.4 M", unit:"habitants", year:"2024", accent:"#0ea5e9" },
    { label:"Agriculture / GDP", value:"1.43%", unit:"share of GDP", year:"2024", accent:"#10b981" },
    { label:"P2O5 consumed", value:"226 kt", unit:"nutrient", year:"2023", accent:"#f59e0b" },
    { label:"Total agri. land", value:"27 000 kha", unit:"utilised area", year:"2024", accent:"#a78bfa" },
  ];



  const RECOS = [
    { icon:"📢", color:"#0ea5e9", title:"Rebuild P consumption", body:"Quantify the agronomic gap, run campaigns on the economic value of balanced P fertilization using Comifer/BDAT data. Partner with coops, INRAE and Arvalis for multi-year field trials — flagship farms that prove yield and soil fertility benefits." },
    { icon:"🌾", color:"#10b981", title:"Position TSP as the reference low-carbon P", body:"Make 'High P / Low N' the default narrative for French broad-acre crops — winter cereals, rapeseed, pulses. Build a portfolio around it: high-P NPs, DAP, customized PK/NP blends that enable N/P decoupling." },
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
          <div key={i} style={{ background:"linear-gradient(135deg,#0f172a,#0a1020)",border:`1px solid ${k.accent}25`,borderRadius:14,padding:"16px 20px",flex:"1 1 150px",minWidth:140,position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:-12,right:-12,width:50,height:50,borderRadius:"50%",background:k.accent+"08" }}/>
            <p style={{ color:"#64748b",fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6 }}>{k.label}</p>
            <p style={{ color:k.accent,fontSize:22,fontWeight:800,fontFamily:"'DM Mono',monospace",margin:0 }}>{k.value}</p>
            <p style={{ color:"#475569",fontSize:11,marginTop:3 }}>{k.unit}</p>
            <span style={{ position:"absolute",bottom:10,right:12,color:k.accent+"60",fontSize:10,fontFamily:"'DM Mono',monospace" }}>{k.year}</span>
          </div>
        ))}
      </div>

      {/* Product mix + import origin */}
      <div className="chart-grid-2">
        <div className="card">
          <h3 className="card-title">P2O5 Consumption by Product — kt</h3>
          <p style={{color:"#334155",fontSize:10,marginBottom:10}}>2022 → 2023 · Source: Agreste / UNIFA</p>
          <div style={{ display:"flex",flexDirection:"column",gap:12,marginTop:4 }}>
            {intel.productMix.map((row,i)=><AnimBar key={i} label={row.name} val2022={row.val2022} val2023={row.val2023} maxVal={maxMix} color={row.color} />)}
          </div>
        </div>
        <div className="card">
          <h3 className="card-title">DAP/MAP Import Origin — kt P2O5</h3>
          <p style={{color:"#334155",fontSize:10,marginBottom:6}}>2024 · Source: UNIFA / French Customs</p>
          <ResponsiveContainer width="100%" height={195}>
            <PieChart>
                <Pie data={intel.importOrigin} cx="50%" cy="50%" outerRadius={78} dataKey="value"
                  label={({cx,cy,midAngle,innerRadius,outerRadius,value}) => {
                    const RADIAN=Math.PI/180;
                    const r=innerRadius+(outerRadius-innerRadius)*0.55;
                    const x=cx+r*Math.cos(-midAngle*RADIAN);
                    const y=cy+r*Math.sin(-midAngle*RADIAN);
                    const total=intel.importOrigin.reduce((s,d2)=>s+d2.value,0);
                    const pct=((value/total)*100).toFixed(0);
                    return value/total>0.03?(
                      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={value/total>0.1?11:9} fontWeight={700} fontFamily="DM Mono,monospace">{pct}%</text>
                    ):null;
                  }}
                  labelLine={false}>
                  {intel.importOrigin.map((d,i)=><Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v,n)=>[`${v} kt`,n]} />
              </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex",flexWrap:"wrap",gap:8,marginTop:4 }}>{intel.importOrigin.map((d,i)=><div key={i} style={{ display:"flex",alignItems:"center",gap:5 }}><div style={{ width:8,height:8,borderRadius:2,background:d.color }}/><span style={{ color:"#94a3b8",fontSize:11 }}>{d.name} {d.value}kt</span></div>)}</div>
        </div>
      </div>

      {/* ── EXECUTIVE BRIEF ── */}
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

        {/* Big "Open Executive Brief" button */}
        {!briefOpen ? (
          <button onClick={()=>setBriefOpen(true)}
            style={{ width:"100%", padding:"28px 32px", background:"linear-gradient(135deg,#080e18,#060b14)", border:"1px solid #1e293b", borderRadius:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", gap:20, transition:"all 0.2s", textAlign:"left" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#0ea5e940";e.currentTarget.style.background="linear-gradient(135deg,#0a1422,#080e18)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#1e293b";e.currentTarget.style.background="linear-gradient(135deg,#080e18,#060b14)";}}>
            <div>
              <p style={{ color:"#475569", fontSize:10, textTransform:"uppercase", letterSpacing:"0.14em", fontWeight:700, marginBottom:8 }}>Executive Brief · France · P Fertilizer Market 2024</p>
              <p style={{ color:"#f1f5f9", fontSize:20, fontWeight:800, letterSpacing:"-0.02em", margin:0 }}>What is happening in France?</p>
              <p style={{ color:"#475569", fontSize:13, marginTop:8, lineHeight:1.6 }}>Four structural forces reshaping the French phosphate market — soil depletion, price-driven behaviour, import dependency, and regulatory opportunity.</p>
            </div>
            <div style={{ flexShrink:0, background:"#0ea5e918", border:"1px solid #0ea5e940", borderRadius:12, padding:"14px 22px", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ color:"#0ea5e9", fontSize:14, fontWeight:700 }}>Read the brief</span>
              <span style={{ color:"#0ea5e9", fontSize:20 }}>→</span>
            </div>
          </button>
        ) : (
          <div style={{ background:"linear-gradient(135deg,#080e18,#060b14)", border:"1px solid #1e293b", borderRadius:16, overflow:"hidden" }}>

            {/* Header */}
            <div style={{ padding:"18px 24px 16px", borderBottom:"1px solid #1e293b", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ color:"#475569", fontSize:10, textTransform:"uppercase", letterSpacing:"0.12em", fontWeight:700, marginBottom:4 }}>Executive Brief · France · P Fertilizer Market 2024</p>
                <p style={{ color:"#f1f5f9", fontSize:16, fontWeight:700, margin:0 }}>What is happening in France?</p>
              </div>
              <button onClick={()=>setBriefOpen(false)} style={{ background:"transparent", border:"1px solid #1e293b", color:"#475569", borderRadius:8, padding:"6px 14px", fontSize:11, cursor:"pointer" }}>← close</button>
            </div>

            {/* Narrative body */}
            <div style={{ padding:"24px", display:"flex", flexDirection:"column", gap:18 }}>

              <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                <div style={{ flexShrink:0, width:28, height:28, borderRadius:"50%", background:"#0ea5e920", border:"1px solid #0ea5e940", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, marginTop:2, color:"#0ea5e9" }}>1</div>
                <div>
                  <p style={{ color:"#e2e8f0", fontSize:14, fontWeight:700, marginBottom:8 }}>French soils are being quietly mined of phosphorus at scale</p>
                  <p style={{ color:"#64748b", fontSize:13, lineHeight:1.85, margin:0 }}>
                    Since 2021, P applications have fallen by roughly 29% across France. Today only half of French parcels receive any mineral phosphorus at all. Farmers are systematically extracting more phosphorus through harvests than they are returning to the soil through fertilization. The resulting agronomic gap versus Comifer recommendations now stands at 157 kt P₂O₅, an amount equivalent to an entire year of TSP imports. <span style={{color:"#f1f5f9",fontWeight:600}}>This is a slow-motion soil fertility crisis with no self-correcting mechanism currently in place.</span>
                  </p>
                </div>
              </div>

              <div style={{ height:1, background:"#1e293b", marginLeft:44 }}/>

              <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                <div style={{ flexShrink:0, width:28, height:28, borderRadius:"50%", background:"#f59e0b20", border:"1px solid #f59e0b40", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, marginTop:2, color:"#f59e0b" }}>2</div>
                <div>
                  <p style={{ color:"#e2e8f0", fontSize:14, fontWeight:700, marginBottom:8 }}>The 2022 price shock broke a fertilization habit that has not recovered</p>
                  <p style={{ color:"#64748b", fontSize:13, lineHeight:1.85, margin:0 }}>
                    The 2022 fertilizer price spike created a scissors effect: input costs doubled while farm margins compressed sharply. Farmers responded by protecting their nitrogen budget and cutting phosphorus and potassium first. What began as a rational short-term adjustment became embedded behaviour. <span style={{color:"#f1f5f9",fontWeight:600}}>Even as prices normalised through 2023 and 2024, P remained the first line item sacrificed when budgets tightened</span>, leaving a structural underapplication that compounds year on year.
                  </p>
                </div>
              </div>

              <div style={{ height:1, background:"#1e293b", marginLeft:44 }}/>

              <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                <div style={{ flexShrink:0, width:28, height:28, borderRadius:"50%", background:"#10b98120", border:"1px solid #10b98140", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, marginTop:2, color:"#10b981" }}>3</div>
                <div>
                  <p style={{ color:"#e2e8f0", fontSize:14, fontWeight:700, marginBottom:8 }}>France imports everything and cooperatives control the market</p>
                  <p style={{ color:"#64748b", fontSize:13, lineHeight:1.85, margin:0 }}>
                    France produces no TSP or DAP domestically. Every tonne must be imported. Morocco through OCP already captures roughly 62% of the DAP and MAP import market, which is a meaningful structural advantage. However the real commercial gatekeepers are the large purchasing cooperatives — Inoxa, Axereal, InVivo and a handful of others — which collectively control blending capacity, warehousing logistics and agronomic advisory services for approximately 70% of fertilizer volumes reaching farmers. <span style={{color:"#10b981",fontWeight:600}}>Market access without a formal relationship with these structures is effectively impossible.</span>
                  </p>
                </div>
              </div>

              <div style={{ height:1, background:"#1e293b", marginLeft:44 }}/>

              <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>
                <div style={{ flexShrink:0, width:28, height:28, borderRadius:"50%", background:"#a78bfa20", border:"1px solid #a78bfa40", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, marginTop:2, color:"#a78bfa" }}>4</div>
                <div>
                  <p style={{ color:"#e2e8f0", fontSize:14, fontWeight:700, marginBottom:8 }}>Regulatory pressure and product premiumisation are creating a structural opening</p>
                  <p style={{ color:"#64748b", fontSize:13, lineHeight:1.85, margin:0 }}>
                    Standard NPK compounds are losing market share as farmers and cooperatives migrate toward NPK+ grades incorporating sulphur, micronutrients and biostimulants. Simultaneously, EU heavy metal regulations are tightening cadmium thresholds for phosphate fertilizers and FMCG supply chains are beginning to demand low-carbon input certification from their farm suppliers. <span style={{color:"#a78bfa",fontWeight:600}}>OCP's low-cadmium Moroccan phosphate is not merely a quality differentiator — it is a forward regulatory compliance asset</span> that becomes more valuable as the European standard tightens over the next decade.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Big "Why does this matter for OCP?" button */}
        {!recoOpen ? (
          <button onClick={()=>setRecoOpen(true)}
            style={{ width:"100%", padding:"28px 32px", background:"linear-gradient(135deg,#061410,#040c0a)", border:"1px solid #10b98130", borderRadius:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", gap:20, transition:"all 0.2s", textAlign:"left" }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="#10b98160";e.currentTarget.style.background="linear-gradient(135deg,#081a14,#060f0c)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="#10b98130";e.currentTarget.style.background="linear-gradient(135deg,#061410,#040c0a)";}}>
            <div>
              <p style={{ color:"#10b981", fontSize:10, textTransform:"uppercase", letterSpacing:"0.14em", fontWeight:700, marginBottom:8 }}>Strategic Implications · OCP Nutricrops · France</p>
              <p style={{ color:"#f1f5f9", fontSize:20, fontWeight:800, letterSpacing:"-0.02em", margin:0 }}>Why does this matter for OCP Nutricrops?</p>
              <p style={{ color:"#475569", fontSize:13, marginTop:8, lineHeight:1.6 }}>Six strategic plays that follow directly from this market analysis — from rebuilding phosphorus consumption to owning the regulatory narrative.</p>
            </div>
            <div style={{ flexShrink:0, background:"#10b98118", border:"1px solid #10b98150", borderRadius:12, padding:"14px 22px", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ color:"#10b981", fontSize:14, fontWeight:700 }}>Discover</span>
              <span style={{ color:"#10b981", fontSize:20 }}>→</span>
            </div>
          </button>
        ) : (
          <div style={{ background:"linear-gradient(135deg,#061410,#040c0a)", border:"1px solid #10b98130", borderRadius:16, overflow:"hidden" }}>
            <div style={{ padding:"18px 24px 16px", borderBottom:"1px solid #10b98120", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ color:"#10b981", fontSize:10, textTransform:"uppercase", letterSpacing:"0.12em", fontWeight:700, marginBottom:4 }}>Strategic Implications · OCP Nutricrops · France</p>
                <p style={{ color:"#f1f5f9", fontSize:16, fontWeight:700, margin:0 }}>Why does this matter for OCP Nutricrops?</p>
              </div>
              <button onClick={()=>setRecoOpen(false)} style={{ background:"transparent", border:"1px solid #1e293b", color:"#475569", borderRadius:8, padding:"6px 14px", fontSize:11, cursor:"pointer" }}>← close</button>
            </div>
            <div style={{ padding:"20px 24px" }}>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:12 }}>
                {RECOS.map((r,i)=>(
                  <div key={i} style={{ background:"#060d1a", border:`1px solid ${r.color}25`, borderLeft:`3px solid ${r.color}`, borderRadius:10, padding:"14px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                      <span style={{ fontSize:15 }}>{r.icon}</span>
                      <p style={{ color:r.color, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", margin:0 }}>{r.title}</p>
                    </div>
                    <p style={{ color:"#94a3b8", fontSize:12, lineHeight:1.75, margin:0 }}>{r.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MIFarmerBSPage() {
  const [farmType, setFarmType] = useState("Cereals & Oilseeds");
  const [expandedBS, setExpandedBS] = useState({ assets:true, equity:true, debt:true });
  const [activeTooltip, setActiveTooltip] = useState(null);
  const toggleBS = key => setExpandedBS(e => ({...e, [key]:!e[key]}));

  // Balance sheet data from FADN/RICA France 2024 (average per farm, €/Ha)
  const BS_DATA = {
    "Cereals & Oilseeds": {
      color:"#0ea5e9", emoji:"🌾",
      label:"Cereals & Oilseeds",
      note:"Céréales et oléoprotéagineux — Average per farm · €/Ha · 2024",
      assets: {
        fixed: {
          total: 1671.98,
          items: {
            "Land": 372.38,
            "Land improvements": 22.03,
            "Buildings": 187.52,
            "Specialised installations": 67.50,
            "Machinery": 769.75,
            "Plantations (incl. forest)": 4.75,
            "Breeding livestock": 35.09,
            "Other fixed assets": 213.00,
          }
        },
        current: {
          total: 1539.65,
          items: {
            "Inventories & work in progress": 637.34,
            "of which current livestock": 23.74,
            "Receivables": 476.89,
            "Cash & equivalents": 425.49,
            "Asset accruals": 18.99,
          }
        },
        total: 3230.62,
      },
      equity: {
        total: 1959.65,
        items: {
          "Initial individual capital": 1241.67,
          "Change in initial capital": 700.84,
          "Investment subsidies": 17.14,
        }
      },
      debt: {
        total: 1269.19,
        items: {
          "Long & medium-term debt": 803.50,
          "Short-term borrowings & other financial liabilities": 119.13,
          "Trade & other payables": 346.64,
          "Liability accruals": 1.85,
        }
      },
      totalLE: 3230.62,
      ratios: {
        gosHa: 0.35,
        gosAWU: 40.57,
        profitHa: 0.10,
        profitAWU: 11.97,
        debtRatio: 39.29,
        marginRate: 25.01,
      }
    },
    "General Crops": {
      color:"#10b981", emoji:"🌱",
      label:"General Crops",
      note:"Grandes cultures — Average per farm · €/Ha · 2024",
      assets: {
        fixed: {
          total: 3060.96,
          items: {
            "Land": 344.48,
            "Land improvements": 18.32,
            "Buildings": 462.91,
            "Specialised installations": 191.46,
            "Machinery": 1091.17,
            "Plantations (incl. forest)": 16.98,
            "Breeding livestock": 76.24,
            "Other fixed assets": 859.40,
          }
        },
        current: {
          total: 2754.20,
          items: {
            "Inventories & work in progress": 1115.75,
            "of which current livestock": 60.60,
            "Receivables": 954.95,
            "Cash & equivalents": 683.50,
            "Asset accruals": 54.70,
          }
        },
        total: 5869.86,
      },
      equity: {
        total: 3389.97,
        items: {
          "Initial individual capital": 1929.66,
          "Change in initial capital": 1405.52,
          "Investment subsidies": 54.70,
        }
      },
      debt: {
        total: 2472.74,
        items: {
          "Long & medium-term debt": 1595.19,
          "Short-term borrowings & other financial liabilities": 166.16,
          "Trade & other payables": 711.39,
          "Liability accruals": 7.15,
        }
      },
      totalLE: 5869.86,
      ratios: {
        gosHa: 1.17,
        gosAWU: 101.85,
        profitHa: 0.75,
        profitAWU: 65.43,
        debtRatio: 42.13,
        marginRate: 36.36,
      }
    },
    "Market Gardening": {
      color:"#f59e0b", emoji:"🥦",
      label:"Market Gardening (Maraîchage)",
      note:"Maraîchage — Average per farm · €/Ha · 2024",
      assets: {
        fixed: {
          total: 13362.85,
          items: {
            "Land": 939.11,
            "Land improvements": 152.52,
            "Buildings": 3572.57,
            "Specialised installations": 2891.76,
            "Machinery": 4317.34,
            "Plantations (incl. forest)": 156.83,
            "Breeding livestock": 86.72,
            "Other fixed assets": 1246.62,
          }
        },
        current: {
          total: 10909.59,
          items: {
            "Inventories & work in progress": 2403.44,
            "of which current livestock": 47.97,
            "Receivables": 3030.75,
            "Cash & equivalents": 5475.40,
            "Asset accruals": 353.63,
          }
        },
        total: 24626.08,
      },
      equity: {
        total: 11649.45,
        items: {
          "Initial individual capital": 7313.04,
          "Change in initial capital": 3365.31,
          "Investment subsidies": 971.09,
        }
      },
      debt: {
        total: 12967.40,
        items: {
          "Long & medium-term debt": 7872.08,
          "Short-term borrowings & other financial liabilities": 916.36,
          "Trade & other payables": 4178.97,
          "Liability accruals": 8.61,
        }
      },
      totalLE: 24626.08,
      ratios: {
        gosHa: 6.37,
        gosAWU: 73.15,
        profitHa: 3.78,
        profitAWU: 43.38,
        debtRatio: 52.66,
        marginRate: 26.18,
      }
    },
    "Viticulture": {
      color:"#a78bfa", emoji:"🍇",
      label:"Viticulture",
      note:"Viticulture — Average per farm · €/Ha · 2024",
      assets: {
        fixed: {
          total: 10976.55,
          items: {
            "Land": 3545.59,
            "Land improvements": 63.64,
            "Buildings": 2074.80,
            "Specialised installations": 231.48,
            "Machinery": 2358.76,
            "Plantations (incl. forest)": 2085.23,
            "Breeding livestock": 11.91,
            "Other fixed assets": 605.14,
          }
        },
        current: {
          total: 18059.17,
          items: {
            "Inventories & work in progress": 11894.31,
            "of which current livestock": 6.70,
            "Receivables": 3329.74,
            "Cash & equivalents": 2835.50,
            "Asset accruals": 83.36,
          }
        },
        total: 29119.09,
      },
      equity: {
        total: 20427.24,
        items: {
          "Initial individual capital": 12281.35,
          "Change in initial capital": 7365.46,
          "Investment subsidies": 780.42,
        }
      },
      debt: {
        total: 8678.45,
        items: {
          "Long & medium-term debt": 4709.71,
          "Short-term borrowings & other financial liabilities": 978.04,
          "Trade & other payables": 2990.70,
          "Liability accruals": 13.40,
        }
      },
      totalLE: 29119.09,
      ratios: {
        gosHa: 3.96,
        gosAWU: 84.14,
        profitHa: 2.69,
        profitAWU: 57.14,
        debtRatio: 29.80,
        marginRate: 39.97,
      }
    },
  };

  const RATIO_TOOLTIPS = {
    gosHa: { label:"GOS/ha (k€/ha)", desc:"Gross Operating Surplus per hectare measures how much surplus is generated from farming operations before depreciation and financial charges, normalized by cultivated area. It captures operational profitability intensity per unit of land and is a key indicator of land productivity and capital efficiency." },
    gosAWU: { label:"GOS / AWU non-salaried (k€/UTA)", desc:"Gross Operating Surplus per non-salaried Annual Work Unit approximates the economic return to the farmer's own labour. It is the closest measure to an entrepreneurial income equivalent in FADN accounting, and is routinely used to benchmark farm viability against a reference wage in the broader economy." },
    profitHa: { label:"Current profit before tax / ha (k€/ha)", desc:"Current profit before tax per hectare represents the accounting net income of the farm per unit of area, after all operating costs, depreciation, and financial expenses but before corporate or income tax. It is the most complete measure of economic profitability at the farm level on a land-normalized basis." },
    profitAWU: { label:"Current profit before tax / AWU non-salaried (k€/UTA)", desc:"Current profit before tax normalized by non-salaried labour units is the definitive measure of financial return to the farm entrepreneur. It captures whether the farm generates a remuneration comparable to or above the opportunity cost of labour in the wider economy, which is the fundamental solvency test for a family farming enterprise." },
    debtRatio: { label:"Debt ratio — Debt / Total Assets (%)", desc:"The debt-to-assets ratio measures the leverage of the farm balance sheet. A higher ratio indicates that a larger share of the asset base is financed by external creditors rather than equity, which amplifies both returns and risks. In agricultural economics this ratio is used to assess financial resilience and the capacity to absorb commodity price shocks without triggering debt restructuring." },
    marginRate: { label:"Margin rate — GOS / Revenue (%)", desc:"The gross operating margin rate expresses what fraction of total farm revenue is retained as gross operating surplus after covering all variable and operating costs. It is a direct measure of the farm's ability to convert revenue into economic surplus, and serves as a proxy for cost structure efficiency and pricing power relative to input costs." },
  };

  const d = BS_DATA[farmType];

  const fmtV = v => {
    const abs = Math.abs(v);
    const s = abs >= 1000 ? abs.toLocaleString("fr-FR",{minimumFractionDigits:0,maximumFractionDigits:0}) : abs.toFixed(0);
    return (v < 0 ? "−" : "") + "€" + s;
  };

  // Chart data
  const assetBreakdown = [
    { name:"Fixed", value: d.assets.fixed.total, fill:"#0ea5e9" },
    { name:"Current", value: d.assets.current.total, fill:"#38bdf8" },
  ];
  const liabBreakdown = [
    { name:"Equity", value: d.equity.total, fill:"#10b981" },
    { name:"LT/MT Debt", value: d.debt.items["Long & medium-term debt"], fill:"#f43f5e" },
    { name:"ST Debt", value: d.debt.items["Short-term borrowings & other financial liabilities"], fill:"#f59e0b" },
    { name:"Payables", value: d.debt.items["Trade & other payables"], fill:"#a78bfa" },
    { name:"Accruals", value: d.debt.items["Liability accruals"], fill:"#64748b" },
  ];
  const debtLeverageData = [
    { name:"Equity", value: d.equity.total, fill:"#10b981" },
    { name:"Total Debt", value: d.debt.total, fill:"#f43f5e" },
  ];
  const BSRow = ({ label, value, indent=0, bold=false, header=false, expandKey=null, children=null, color=null }) => {
    const isOpen = expandedBS[expandKey];
    const textColor = header?"#0ea5e9":bold?"#f1f5f9":"#94a3b8";
    const valColor = color||(header?d.color:bold?"#f1f5f9":"#94a3b8");
    const bg = header?"#080e1a":bold?"#0a1020":"transparent";
    return (
      <>
        <div onClick={expandKey?()=>toggleBS(expandKey):undefined}
          style={{ display:"flex", alignItems:"center", padding:`${header||bold?"9px":"6px"} 14px`,
            background:bg, borderBottom:"1px solid #0d1829", cursor:expandKey?"pointer":"default",
            paddingLeft: 14+indent*16 }}
          onMouseEnter={e=>{if(!bold&&!header)e.currentTarget.style.background="#0a1018";}}
          onMouseLeave={e=>{if(!bold&&!header)e.currentTarget.style.background=bg;}}>
          {expandKey && <span style={{color:"#475569",fontSize:10,marginRight:7,width:10,flexShrink:0}}>{isOpen?"▼":"▶"}</span>}
          {!expandKey && indent>0 && <span style={{color:"#1e3040",marginRight:7,width:10,flexShrink:0}}>└</span>}
          {!expandKey && indent===0 && <span style={{width:17,flexShrink:0}}/>}
          <span style={{ flex:1, fontSize:header?12:bold?12:11, fontWeight:header||bold?700:400, color:textColor }}>{label}</span>
          <span style={{ fontSize:bold||header?12:11, fontWeight:bold||header?700:500, fontFamily:"'DM Mono',monospace", color:valColor, width:96, textAlign:"right" }}>{fmtV(value)}</span>
          <span style={{ fontSize:10, color:"#334155", width:58, textAlign:"right", fontFamily:"'DM Mono',monospace" }}>{((value/d.assets.total)*100).toFixed(1)}%</span>
        </div>
        {expandKey && isOpen && children}
      </>
    );
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* Header */}
      <div>
        <h2 style={{ color:"#f1f5f9", fontSize:17, fontWeight:800, marginBottom:3 }}>
          Farmer Balance Sheet — Average per farm · €/Ha <span style={{color:"#475569",fontWeight:400,fontSize:13}}>(2024)</span>
        </h2>
        <p style={{ color:"#475569", fontSize:11 }}>Source: FADN / RICA France · Cereals, general crops, market gardening and viticulture · Values in €/Ha</p>
      </div>

      {/* Crop type selector */}
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {Object.entries(BS_DATA).map(([key,val])=>(
          <button key={key} onClick={()=>setFarmType(key)}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 16px", borderRadius:10,
              border:`2px solid ${farmType===key?val.color:val.color+"28"}`,
              background:farmType===key?val.color+"18":"transparent",
              color:farmType===key?val.color:"#64748b",
              fontSize:12, fontWeight:farmType===key?700:400, cursor:"pointer", transition:"all 0.15s" }}>
            <span style={{fontSize:15}}>{val.emoji}</span> {key}
          </button>
        ))}
      </div>

      {/* Note strip */}
      <div style={{ background:"#080e1a", border:"1px solid #1e293b", borderRadius:8, padding:"8px 14px" }}>
        <span style={{ color:"#475569", fontSize:11, fontStyle:"italic" }}>{d.note}</span>
      </div>

      {/* ── VISUALS FIRST ── */}
      {/* KPI strip */}
      <div className="kpi-row">
        <KPICard label="Total Assets"       value={fmtV(d.assets.total)+"/ha"}  sub="fixed + current assets"    accent={d.color} />
        <KPICard label="Total Equity"        value={fmtV(d.equity.total)+"/ha"}  sub={((d.equity.total/d.assets.total)*100).toFixed(0)+"% of total assets"}  accent="#10b981" />
        <KPICard label="Total Debt"          value={fmtV(d.debt.total)+"/ha"}    sub={`Debt ratio: ${d.ratios.debtRatio}%`}  accent="#f43f5e" />
        <KPICard label="Fixed Assets"        value={fmtV(d.assets.fixed.total)+"/ha"} sub={((d.assets.fixed.total/d.assets.total)*100).toFixed(0)+"% of total assets"} accent="#a78bfa" />
      </div>

      {/* Chart row 1 */}
      <div className="chart-grid-2">
        {/* Asset composition bar */}
        <div className="card">
          <h3 className="card-title">Asset Composition (€/Ha)</h3>
          <p style={{color:"#334155",fontSize:10,marginBottom:10}}>Fixed assets vs current assets · balance sheet structure</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[{name:farmType,...d.assets.fixed.items}]} layout="vertical" margin={{left:8,right:16}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false}/>
              <XAxis type="number" tick={{fill:"#64748b",fontSize:9}} />
              <YAxis type="category" dataKey="name" tick={{fill:"#94a3b8",fontSize:10}} width={80}/>
              <Tooltip formatter={v=>[fmtV(v),"€/ha"]} contentStyle={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:8,fontSize:11}}/>
              {assetBreakdown.map((a,i)=>(
                <Bar key={i} dataKey={a.name} stackId="a" fill={a.fill} radius={i===assetBreakdown.length-1?[0,4,4,0]:[0,0,0,0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <div style={{display:"flex",gap:20,marginTop:8,paddingLeft:6}}>
            {assetBreakdown.map((a,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:8,height:8,borderRadius:2,background:a.fill}}/>
                <span style={{color:"#64748b",fontSize:11}}>{a.name}: {fmtV(a.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Liability + equity composition */}
        <div className="card">
          <h3 className="card-title">Funding Structure — Equity vs Debt (€/Ha)</h3>
          <p style={{color:"#334155",fontSize:10,marginBottom:8}}>How the farm's asset base is financed · balance sheet liability side</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={liabBreakdown} cx="50%" cy="50%" outerRadius={72} dataKey="value"
                label={({name,value,cx,cy,midAngle,innerRadius,outerRadius})=>{
                  const RADIAN=Math.PI/180;
                  const r=innerRadius+(outerRadius-innerRadius)*0.55;
                  const x=cx+r*Math.cos(-midAngle*RADIAN);
                  const y=cy+r*Math.sin(-midAngle*RADIAN);
                  return value>100?<text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight={700} fontFamily="DM Mono,monospace">{fmtV(value)}</text>:null;
                }}
                labelLine={false}>
                {liabBreakdown.map((d2,i)=><Cell key={i} fill={d2.fill}/>)}
              </Pie>
              <Tooltip formatter={(v,n)=>[fmtV(v),n]} contentStyle={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:8,fontSize:11}}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:4}}>
            {liabBreakdown.map((a,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:8,height:8,borderRadius:2,background:a.fill}}/>
                <span style={{color:"#94a3b8",fontSize:10}}>{a.name}: {fmtV(a.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart row 2 */}
      <div className="chart-grid-2">
        {/* Fixed asset breakdown */}
        <div className="card">
          <h3 className="card-title">Fixed Asset Breakdown (€/Ha)</h3>
          <p style={{color:"#334155",fontSize:10,marginBottom:10}}>Decomposition of long-term productive capital stock</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {Object.entries(d.assets.fixed.items).map(([name,val],i)=>{
              const pct = (val/d.assets.fixed.total)*100;
              return (
                <div key={i}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{color:"#94a3b8",fontSize:11}}>{name}</span>
                    <span style={{color:d.color,fontSize:11,fontFamily:"'DM Mono',monospace",fontWeight:600}}>{fmtV(val)}</span>
                  </div>
                  <div style={{height:5,background:"#1e293b",borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:d.color,borderRadius:3,transition:"width 0.5s"}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Equity vs debt leverage */}
        <div className="card">
          <h3 className="card-title">Leverage Analysis — Equity vs Total Debt (€/Ha)</h3>
          <p style={{color:"#334155",fontSize:10,marginBottom:10}}>Financial solvency structure · debt ratio: {d.ratios.debtRatio}%</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={debtLeverageData} margin={{left:8,right:16,bottom:4}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
              <XAxis dataKey="name" tick={{fill:"#94a3b8",fontSize:11}}/>
              <YAxis tick={{fill:"#64748b",fontSize:9}} tickFormatter={v=>"€"+v.toLocaleString()}/>
              <Tooltip formatter={(v,n)=>[fmtV(v),n]} contentStyle={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:8,fontSize:11}}/>
              <Bar dataKey="value" radius={[4,4,0,0]}>
                {debtLeverageData.map((entry,i)=><Cell key={i} fill={entry.fill}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{background:"#060d1a",borderRadius:8,padding:"10px 14px",marginTop:12,border:"1px solid #1e293b"}}>
            <p style={{color:"#64748b",fontSize:11,lineHeight:1.7,margin:0}}>
              For every euro of assets, this farm type finances <span style={{color:"#f43f5e",fontWeight:600}}>{d.ratios.debtRatio.toFixed(1)}¢ through debt</span> and <span style={{color:"#10b981",fontWeight:600}}>{(100-d.ratios.debtRatio).toFixed(1)}¢ through equity</span>. This debt ratio reflects the structural capital intensity of the sector and the historical recourse to medium-term machinery and land improvement loans.
            </p>
          </div>
        </div>
      </div>

      {/* ── BALANCE SHEET TABLE ── */}
      <div style={{ background:"#0a1020", border:"1px solid #1e293b", borderRadius:14, overflow:"hidden" }}>
        {/* Table header */}
        <div style={{ display:"flex", alignItems:"center", padding:"12px 14px", background:"#060d1a", borderBottom:"1px solid #1e293b" }}>
          <span style={{width:17,flexShrink:0}}/>
          <span style={{ flex:1, color:"#475569", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em" }}>Line item</span>
          <span style={{ width:96, textAlign:"right", color:"#475569", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em" }}>€ / ha</span>
          <span style={{ width:58, textAlign:"right", color:"#475569", fontSize:10, textTransform:"uppercase", letterSpacing:"0.08em" }}>% total</span>
        </div>

        {/* ASSETS */}
        <div style={{padding:"6px 0 2px",background:"#060d1a",borderBottom:"1px solid #0d1829"}}>
          <span style={{paddingLeft:14,color:"#334155",fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em"}}>Assets</span>
        </div>
        <BSRow label="Fixed Assets" value={d.assets.fixed.total} bold expandKey="assets">
          {Object.entries(d.assets.fixed.items).map(([k,v],i)=>(
            <BSRow key={i} label={k} value={v} indent={1} />
          ))}
        </BSRow>
        <BSRow label="Current Assets" value={d.assets.current.total} bold expandKey="equity">
          {Object.entries(d.assets.current.items).map(([k,v],i)=>(
            <BSRow key={i} label={k} value={v} indent={1} />
          ))}
        </BSRow>
        <BSRow label="TOTAL ASSETS" value={d.assets.total} bold header color={d.color} />

        {/* LIABILITIES & EQUITY */}
        <div style={{padding:"6px 0 2px",background:"#060d1a",borderBottom:"1px solid #0d1829",marginTop:4}}>
          <span style={{paddingLeft:14,color:"#334155",fontSize:9,textTransform:"uppercase",letterSpacing:"0.1em"}}>Equity & Liabilities</span>
        </div>
        <BSRow label="Equity" value={d.equity.total} bold expandKey="debt">
          {Object.entries(d.equity.items).map(([k,v],i)=>(
            <BSRow key={i} label={k} value={v} indent={1} />
          ))}
        </BSRow>
        <BSRow label="Total Debt" value={d.debt.total} bold color="#f43f5e">
          {Object.entries(d.debt.items).map(([k,v],i)=>(
            <BSRow key={i} label={k} value={v} indent={1} />
          ))}
        </BSRow>
        <BSRow label="TOTAL LIABILITIES & EQUITY" value={d.totalLE} bold header color={d.color} />
      </div>

      {/* ── RATIOS ── */}
      <div style={{ background:"#0a1020", border:"1px solid #1e293b", borderRadius:14, overflow:"hidden" }}>
        <div style={{ padding:"12px 16px 10px", background:"#060d1a", borderBottom:"1px solid #1e293b" }}>
          <p style={{ color:"#94a3b8", fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:700, margin:0 }}>Key Financial Ratios</p>
          <p style={{ color:"#334155", fontSize:10, margin:"3px 0 0" }}>Click the ⓘ icon for an economic definition of each ratio</p>
        </div>
        <div style={{ padding:16, display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
          {[
            { key:"gosHa",     value: d.ratios.gosHa.toFixed(2)+" k€/ha",   unit:"k€/ha",   accent:"#0ea5e9" },
            { key:"gosAWU",    value: d.ratios.gosAWU.toFixed(2)+" k€/UTA",  unit:"k€/UTA",  accent:"#38bdf8" },
            { key:"profitHa",  value: d.ratios.profitHa.toFixed(2)+" k€/ha", unit:"k€/ha",   accent:"#10b981" },
            { key:"profitAWU", value: d.ratios.profitAWU.toFixed(2)+" k€/UTA",unit:"k€/UTA", accent:"#4ade80" },
            { key:"debtRatio", value: d.ratios.debtRatio.toFixed(1)+"%",      unit:"%",       accent:"#f43f5e" },
            { key:"marginRate",value: d.ratios.marginRate.toFixed(1)+"%",     unit:"%",       accent:"#f59e0b" },
          ].map(r => {
            const tip = RATIO_TOOLTIPS[r.key];
            const isOpen = activeTooltip === r.key;
            return (
              <div key={r.key} style={{ background:"#080e1a", border:`1px solid ${r.accent}20`, borderRadius:10, padding:"12px 14px", position:"relative" }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:6 }}>
                  <p style={{ color:"#64748b", fontSize:10, textTransform:"uppercase", letterSpacing:"0.07em", margin:0, flex:1, paddingRight:6 }}>{tip.label}</p>
                  <button
                    onClick={()=>setActiveTooltip(isOpen?null:r.key)}
                    style={{ background:"transparent", border:`1px solid ${r.accent}40`, borderRadius:"50%", width:18, height:18, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, color:r.accent, fontSize:10, fontWeight:700, fontFamily:"serif", lineHeight:1 }}>
                    i
                  </button>
                </div>
                <p style={{ color:r.accent, fontSize:22, fontWeight:800, fontFamily:"'DM Mono',monospace", margin:0 }}>{r.value}</p>
                {isOpen && (
                  <div style={{ marginTop:10, padding:"10px 12px", background:"#060d1a", border:`1px solid ${r.accent}30`, borderRadius:8 }}>
                    <p style={{ color:"#94a3b8", fontSize:11, lineHeight:1.75, margin:0 }}>{tip.desc}</p>
                  </div>
                )}
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
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="axis" tick={{ fill:"#64748b",fontSize:9 }} />
              <Radar name="OCP"  dataKey="OCP"  stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="ICL"  dataKey="ICL"  stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={1.5} />
              <Radar name="Yara" dataKey="Yara" stroke="#64748b" fill="#64748b" fillOpacity={0.1}  strokeWidth={1.5} />
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
  const tagColor={"TSP":{bg:"#0e2a38",text:"#0ea5e9"},"TSP/PK":{bg:"#0e2a38",text:"#0ea5e9"},"DAP":{bg:"#1e1030",text:"#a78bfa"},"PK":{bg:"#0e2218",text:"#10b981"}};
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <div><h3 style={{ color:"#94a3b8",fontSize:11,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14 }}>Agronomic Insights</h3><div className="chart-grid-2">{intel.agronomy.map((item,i)=><InsightCard key={i} item={item} />)}</div></div>
      <div className="card">
        <h3 className="card-title">Crop Agronomy — Current vs Recommended P2O5 (kg/ha)</h3>
        <div style={{ display:"flex",flexDirection:"column",gap:12,marginTop:4 }}>
          {intel.cropAgronomy.map((row,i)=>{
            const gap=row.currentP-row.recP, gapColor=gap>=0?"#10b981":gap>-15?"#f59e0b":"#f43f5e";
            const tc=tagColor[row.product]||{bg:"#1e293b",text:"#94a3b8"};
            return (
              <div key={i} style={{ background:"#0a0f1a",borderRadius:10,padding:"11px 13px" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:7,flexWrap:"wrap" }}>
                  <span style={{ color:"#e2e8f0",fontSize:13,fontWeight:600,minWidth:75 }}>{row.crop}</span>
                  <span style={{ padding:"2px 7px",borderRadius:4,fontSize:10,fontWeight:600,background:tc.bg,color:tc.text }}>{row.product}</span>
                  <span style={{ color:gapColor,fontSize:11,fontFamily:"'DM Mono',monospace",fontWeight:700 }}>Gap: {gap>=0?"0":gap} kg/ha</span>
                  <span style={{ color:"#475569",fontSize:10,marginLeft:"auto" }}>{row.area.toLocaleString()} kha</span>
                </div>
                <div style={{ position:"relative",height:8,background:"#1e293b",borderRadius:4,overflow:"hidden",marginBottom:5 }}>
                  <div style={{ position:"absolute",left:0,height:"100%",width:`${(row.recP/100)*100}%`,background:gapColor+"30",borderRadius:4 }} />
                  <div style={{ position:"absolute",left:0,height:"100%",width:`${(row.currentP/100)*100}%`,background:gapColor,borderRadius:4 }} />
                </div>
                <div style={{ display:"flex",justifyContent:"space-between" }}>
                  <span style={{ color:"#475569",fontSize:10 }}>Current: <span style={{ color:gapColor,fontFamily:"'DM Mono',monospace" }}>{row.currentP}</span> kg/ha</span>
                  <span style={{ color:"#475569",fontSize:10 }}>Rec: <span style={{ color:"#94a3b8",fontFamily:"'DM Mono',monospace" }}>{row.recP}</span> kg/ha</span>
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
// ─── HUB PAGE — choose your section ──────────────────────────────────────────
function HubPage({ onChoose }) {
  const [hov, setHov] = useState(null);
  return (
    <div style={{ minHeight:"100vh", background:"#04080f", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans','Segoe UI',sans-serif", padding:"40px 24px" }}>
      <style>{`@keyframes hubFade{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:48, animation:"hubFade 0.6s ease both" }}>
        <div style={{ width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#0ea5e9,#0369a1)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,color:"#fff",fontFamily:"'DM Mono',monospace",boxShadow:"0 0 16px #0ea5e930" }}>SMO</div>
        <div>
          <p style={{ color:"#f1f5f9",fontWeight:800,fontSize:16,letterSpacing:"-0.02em",margin:0 }}>PhosStratOS</p>
          <p style={{ color:"#334155",fontSize:11,margin:0 }}>OCP Nutricrops · P Separation Intelligence</p>
        </div>
      </div>

      <p style={{ color:"#f1f5f9",fontSize:22,fontWeight:700,marginBottom:52,letterSpacing:"-0.01em",animation:"hubFade 0.6s 0.1s ease both",opacity:0 }}>Select your workspace</p>

      <div style={{ display:"flex", gap:24, flexWrap:"nowrap", justifyContent:"center", width:"100%", maxWidth:900 }}>
        {[
          {
            key:"quant", icon:"⚙",
            title:"Quantitative Engine",
            color:"#0ea5e9",
            desc:"Model trained on field data across multiple fertilization strategies. Simulate scenarios, analyse P&L, and model agronomic response across crops and regions.",
            tags:["Scenario Simulator","P&L Explorer","Agronomic Response","Model Insights"],
            delay:"0.2s",
          },
          {
            key:"intel", icon:"◎",
            title:"Market Intelligence",
            color:"#10b981",
            desc:"Strategic and qualitative interpretation layer. Market fundamentals, farmer behaviour archetypes, competitive landscape, and regional crop analytics.",
            tags:["Market Fundamentals","Farmer Behaviour","Competitive Landscape","Regional Analysis"],
            delay:"0.35s",
          },
        ].map(card => (
          <div key={card.key}
            onClick={() => onChoose(card.key)}
            onMouseEnter={() => setHov(card.key)}
            onMouseLeave={() => setHov(null)}
            style={{
              flex:"1 1 0", maxWidth:430,
              background: hov===card.key ? `linear-gradient(135deg,${card.color}18,#0a1020)` : "linear-gradient(135deg,#0c1422,#080e18)",
              border:`1px solid ${hov===card.key ? card.color+"60" : card.color+"20"}`,
              borderRadius:20, padding:"36px 32px",
              cursor:"pointer",
              transition:"all 0.22s",
              transform: hov===card.key ? "translateY(-6px)" : "none",
              boxShadow: hov===card.key ? `0 20px 60px ${card.color}18` : "none",
              animation:`hubFade 0.7s ${card.delay} ease both`, opacity:0,
              position:"relative", overflow:"hidden",
            }}>
            {/* Corner glow */}
            <div style={{ position:"absolute",top:-30,right:-30,width:100,height:100,borderRadius:"50%",background:card.color+"08",pointerEvents:"none" }}/>

            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:22 }}>
              <div style={{ width:48,height:48,borderRadius:14,background:card.color+"18",border:`1px solid ${card.color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}>{card.icon}</div>
              <div>
                <p style={{ color:card.color,fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:700,margin:0,marginBottom:3 }}>{card.key==="quant"?"Workspace A":"Workspace B"}</p>
                <p style={{ color:"#f1f5f9",fontSize:18,fontWeight:800,letterSpacing:"-0.02em",margin:0 }}>{card.title}</p>
              </div>
            </div>

            <p style={{ color:"#64748b",fontSize:13,lineHeight:1.75,marginBottom:24 }}>{card.desc}</p>

            <div style={{ display:"flex",flexWrap:"wrap",gap:7 }}>
              {card.tags.map(t => (
                <span key={t} style={{ background:card.color+"12",border:`1px solid ${card.color}25`,borderRadius:20,padding:"3px 10px",color:card.color,fontSize:10,fontWeight:600 }}>{t}</span>
              ))}
            </div>

            <div style={{ marginTop:28,display:"flex",alignItems:"center",gap:8,color:hov===card.key?card.color:"#334155",fontSize:12,fontWeight:600,transition:"color 0.2s" }}>
              Enter {card.title} <span style={{ fontSize:14 }}>→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [hubDone,    setHubDone]    = useState(false);
  const [section,    setSection]    = useState("quant");
  const [quantPage,  setQuantPage]  = useState("overview");
  const [intelPage,  setIntelPage]  = useState("dynamics");
  const [region,     setRegion]     = useState("France");
  const [crop,       setCrop]       = useState("Wheat");
  const [sidebarOpen,setSidebarOpen]= useState(false);
  const [savedScenarios, setSavedScenarios] = useState([
    { name:"Spain Wheat Baseline", region:"Spain",  crop:"Wheat" },
    { name:"Brazil Maize High pH", region:"Brazil", crop:"Maize" },
  ]);
  const [scenarioName, setScenarioName] = useState("");

  const quantPages=[
    {key:"overview",  label:"Overview",  short:"Overview" },
    {key:"simulator", label:"Simulator", short:"Simulator"},
    {key:"pl",        label:"P&L",       short:"P&L"      },
    {key:"agronomy",  label:"Agronomy",  short:"Agronomy" },
    {key:"insights",  label:"Insights",  short:"Insights" },
  ];
  const intelPages=[
    {key:"dynamics",  label:"Fundamentals",         short:"Fundamentals"   },
    {key:"farmer",    label:"Farmer Behaviour",      short:"Farmer Behav."  },
    {key:"farmerpl",  label:"Farmer P&L",            short:"Farmer P&L"     },
    {key:"farmerbs",  label:"Farmer Balance Sheet",  short:"Balance Sheet"  },
    {key:"strategy",  label:"Competitive Landscape", short:"Competitive"    },
    {key:"agronomy",  label:"Agronomic Insights",    short:"Agronomy"       },
    {key:"regions",   label:"Regional Analysis",     short:"Regions"        },
  ];

  const subPages   = section==="quant"?quantPages:intelPages;
  const activePage = section==="quant"?quantPage:intelPage;
  const setPage    = section==="quant"?setQuantPage:setIntelPage;
  const isOverview = section==="quant"&&quantPage==="overview";
  const availableCrops=[...new Set(SAMPLE_DATA.filter(d=>d.region===region).map(d=>d.crop))];
  const secColor   = section==="quant"?"#0ea5e9":section==="intel"?"#10b981":"#a78bfa";

  const saveScenario=()=>{
    if (!scenarioName) return;
    setSavedScenarios(s=>[...s,{name:scenarioName,region,crop}]);
    setScenarioName("");
  };

  if (!hasEntered) return <LandingPage onEnter={() => setHasEntered(true)} />;
  if (!hubDone) return <HubPage onChoose={s => { setSection(s); setHubDone(true); }} />;

  return (
    <div style={{ minHeight:"100vh",background:"#060d1a",color:"#e2e8f0",fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;height:4px;} ::-webkit-scrollbar-track{background:#0f172a;} ::-webkit-scrollbar-thumb{background:#1e293b;border-radius:3px;}
        input[type=range]{height:4px;}
        select{background:#1e293b;color:#e2e8f0;border:1px solid #334155;border-radius:6px;padding:6px 10px;font-size:13px;cursor:pointer;outline:none;max-width:130px;}
        select:hover{border-color:#0ea5e9;}
        .card{background:#0f172a;border:1px solid #1e293b;border-radius:14px;padding:18px;}
        .card-title{color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:14px;}
        .kpi-row{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px;}
        .chart-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        .simulator-grid{display:grid;grid-template-columns:280px 1fr;gap:20px;}
        .app-sidebar{width:210px;flex-shrink:0;border-left:1px solid #1e293b;padding:16px;background:#0a0f1a;}
        .sidebar-overlay{display:none;}
        .subnav{background:#080e1a;border-bottom:1px solid #0f1929;padding:0 16px;display:flex;overflow-x:auto;}
        .subnav::-webkit-scrollbar{height:0;}
        .sec-label-full{display:inline;} .sec-label-short{display:none;}
        @media(max-width:640px){
          .chart-grid-2{grid-template-columns:1fr;}
          .simulator-grid{grid-template-columns:1fr;}
          .kpi-row{gap:8px;}
          .kpi-row>div{min-width:calc(50% - 4px);flex:1 1 calc(50% - 4px);}
          .app-sidebar{position:fixed;top:0;right:0;bottom:0;z-index:200;width:240px;transform:translateX(100%);transition:transform 0.25s ease;overflow-y:auto;}
          .app-sidebar.open{transform:translateX(0);box-shadow:-4px 0 24px #000a;}
          .sidebar-overlay{display:block;position:fixed;inset:0;z-index:199;background:#00000080;opacity:0;pointer-events:none;transition:opacity 0.25s;}
          .sidebar-overlay.open{opacity:1;pointer-events:all;}
          .sec-label-full{display:none;} .sec-label-short{display:inline;}
          .page-content{padding:14px !important;}
        }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ borderBottom:"1px solid #1e293b",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:50,background:"#0a0f1a",position:"sticky",top:0,zIndex:100 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          {/* SMO Logo */}
          <div style={{ width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#0ea5e9,#0369a1)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,color:"#fff",letterSpacing:"-0.5px",fontFamily:"'DM Mono',monospace",boxShadow:"0 0 10px #0ea5e940",flexShrink:0 }}>SMO</div>
          <div>
            <span style={{ fontWeight:800,fontSize:14,letterSpacing:"-0.03em",color:"#f1f5f9" }}>PhosStratOS</span>
            <span style={{ color:"#334155",fontSize:11,marginLeft:8 }} className="sec-label-full">P Separation Intelligence</span>
          </div>
        </div>
        <div style={{ display:"flex",gap:8,alignItems:"center" }}>
          {section==="quant"&&!isOverview&&<select value={crop} onChange={e=>setCrop(e.target.value)}>{availableCrops.map(c=><option key={c}>{c}</option>)}</select>}
          {section!=="atlas"&&<button onClick={()=>setSidebarOpen(o=>!o)} style={{ background:"#1e293b",border:"1px solid #334155",color:"#94a3b8",padding:"6px 10px",borderRadius:6,fontSize:18,cursor:"pointer",lineHeight:1 }}>☰</button>}
        </div>
      </div>

      {/* ── SECTION SWITCHER ── */}
      <div style={{ background:"#060d1a",borderBottom:"1px solid #1e293b",padding:"0 20px",display:"flex",alignItems:"center",gap:4,overflowX:"auto" }}>
        <div style={{ display:"flex",gap:4,padding:"8px 0",flex:1 }}>
          {[{key:"quant",icon:"⚙",full:"Quantitative Engine",short:"Quant",color:"#0ea5e9"},{key:"intel",icon:"◎",full:"Market Intelligence",short:"Intel",color:"#10b981"}].map(s=>(
            <button key={s.key} onClick={()=>setSection(s.key)}
              style={{
                padding:"9px 20px",
                background:section===s.key?s.color+"22":"#0f172a",
                border:`1px solid ${section===s.key?s.color:s.color+"20"}`,
                borderRadius:8,
                color:section===s.key?s.color:"#475569",
                fontSize:13,fontWeight:700,cursor:"pointer",
                display:"flex",alignItems:"center",gap:8,whiteSpace:"nowrap",
                transition:"all 0.15s",
                boxShadow:section===s.key?`0 0 16px ${s.color}22`:"none",
              }}>
              <span style={{ fontSize:15 }}>{s.icon}</span>
              <span className="sec-label-full">{s.full}</span>
              <span className="sec-label-short">{s.short}</span>
            </button>
          ))}
        </div>
        <button onClick={()=>setSection("atlas")}
          style={{
            padding:"9px 18px",
            background:section==="atlas"?"#a78bfa22":"#0f172a",
            border:`1px solid ${section==="atlas"?"#a78bfa":"#a78bfa20"}`,
            borderRadius:8,
            color:section==="atlas"?"#a78bfa":"#475569",
            fontSize:13,fontWeight:700,cursor:"pointer",
            display:"flex",alignItems:"center",gap:8,whiteSpace:"nowrap",
            transition:"all 0.15s",
            boxShadow:section==="atlas"?"0 0 16px #a78bfa22":"none",
          }}>
          <span>◈</span>
          ATLAS
          <span style={{ padding:"1px 6px",borderRadius:20,fontSize:9,fontWeight:700,background:"#a78bfa20",color:"#a78bfa",border:"1px solid #a78bfa40" }}>AI</span>
        </button>
      </div>

      {section==="atlas"&&<ATLASPage />}

      {section!=="atlas"&&(
        <>
          <div className="subnav">
            {subPages.map(p=>{
              const active=activePage===p.key;
              return <button key={p.key} onClick={()=>setPage(p.key)} style={{ padding:"8px 14px",background:"transparent",border:"none",borderBottom:active?`2px solid ${secColor}`:"2px solid transparent",color:active?secColor:"#64748b",fontSize:12,fontWeight:active?600:400,cursor:"pointer",whiteSpace:"nowrap" }}>{p.short}</button>;
            })}
          </div>
          <div style={{ display:"flex",minHeight:"calc(100dvh - 130px)" }}>
            <div className="page-content" style={{ flex:1,padding:20,overflow:"auto",minWidth:0 }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:20,flexWrap:"wrap" }}>
                <SectionBadge label={section==="quant"?"Quantitative Engine":"Market Intelligence"} color={secColor} />
                <h1 style={{ fontSize:16,fontWeight:800,color:"#f1f5f9",letterSpacing:"-0.02em" }}>{subPages.find(p=>p.key===activePage)?.label}</h1>
                <span style={{ color:"#334155",fontSize:12 }}>{isOverview?`all crops · ${region}`:section==="intel"?region:`${crop} · ${region}`}</span>
              </div>

              {section==="quant"&&quantPage==="overview"  &&<OverviewPage  data={SAMPLE_DATA} region={region} />}
              {section==="quant"&&quantPage==="simulator" &&<SimulatorPage data={SAMPLE_DATA} region={region} crop={crop} />}
              {section==="quant"&&quantPage==="pl"        &&<PLPage        data={SAMPLE_DATA} region={region} crop={crop} />}
              {section==="quant"&&quantPage==="agronomy"  &&<AgronomyPage  data={SAMPLE_DATA} region={region} crop={crop} />}
              {section==="quant"&&quantPage==="insights"  &&<InsightsPage  data={SAMPLE_DATA} region={region} crop={crop} />}

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
                <h3 style={{ color:"#64748b",fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em" }}>Saved Scenarios</h3>
                <button onClick={()=>setSidebarOpen(false)} style={{ background:"transparent",border:"none",color:"#475569",fontSize:16,cursor:"pointer" }}>✕</button>
              </div>
              {savedScenarios.map((s,i)=>(
                <div key={i} onClick={()=>{setRegion(s.region);setCrop(s.crop);setSidebarOpen(false);}}
                  style={{ padding:"8px 10px",borderRadius:6,marginBottom:6,cursor:"pointer",background:region===s.region&&crop===s.crop?"#1e293b":"transparent",border:"1px solid transparent" }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor="#334155"}
                  onMouseLeave={e=>e.currentTarget.style.borderColor="transparent"}>
                  <p style={{ color:"#94a3b8",fontSize:12,fontWeight:500 }}>{s.name}</p>
                  <p style={{ color:"#475569",fontSize:10,marginTop:2 }}>{s.crop} · {s.region}</p>
                </div>
              ))}
              <div style={{ marginTop:14,borderTop:"1px solid #1e293b",paddingTop:14 }}>
                <input value={scenarioName} onChange={e=>setScenarioName(e.target.value)} placeholder="Scenario name..."
                  style={{ width:"100%",background:"#1e293b",border:"1px solid #334155",borderRadius:6,padding:"6px 8px",color:"#e2e8f0",fontSize:12,marginBottom:8,outline:"none" }} />
                <button onClick={saveScenario} style={{ width:"100%",background:"#0ea5e910",border:"1px solid #0ea5e940",color:"#0ea5e9",padding:"7px",borderRadius:6,fontSize:12,cursor:"pointer" }}>+ Save Current</button>
              </div>
              <div style={{ marginTop:16,borderTop:"1px solid #1e293b",paddingTop:14 }}>
                <button onClick={()=>{setSection("atlas");setSidebarOpen(false);}} style={{ width:"100%",background:"#a78bfa10",border:"1px solid #a78bfa30",color:"#a78bfa",padding:"8px",borderRadius:8,fontSize:12,cursor:"pointer" }}>◈ Open ATLAS</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
