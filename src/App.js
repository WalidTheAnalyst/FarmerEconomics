import { useState, useMemo, useEffect } from "react";
import ATLASPage from "./ATLAS";
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, Area, AreaChart, Cell, PieChart, Pie
} from "recharts";

// ─── EXCEL DATA (extracted from Farmer Analytics factsheets v5) ───────────────
const YEARS = [2017, 2018, 2019, 2020, 2021, 2022, 2023];
const PM_SEASONS = ["16-17","17-18","18-19","19-20","20-21","21-22","22-23"];

const CONSUMPTION_DATA = YEARS.map((y,i) => ({
  year: y,
  N:    [2242700,2248277,2140000,2130000,1880000,1780000,1719000][i],
  P2O5: [444000, 420423, 440000, 410000, 450000, 350000, 226000][i],
  K2O:  [427000, 451365, 460000, 470000, 530000, 410000, 224000][i],
}));

const PRODUCT_MIX_DATA = PM_SEASONS.map((s,i) => ({
  season:   s,
  "DAP/MAP":      [121,135,142,148,136,72,55][i],
  "NPK/NP":       [96, 98, 97, 103,111,103,66.4][i],
  "PK":           [64, 79, 80, 71, 83, 74, 43.1][i],
  "TSP":          [88, 98, 77, 63, 83, 54, 25][i],
  "Other P":      [29, 32, 32, 29, 34, 39, 32.5][i],
  "Organomineral":[4,  3,  3,  3,  3,  4,  4][i],
}));

// Regional data — harvested area (Ha), production (t), yield (t/Ha)
// Source: Agreste / French Ministry of Agriculture
const REGIONAL_DATA = {
  "Île-de-France": {
    crops: ["Corn","Triticale","Rapeseed","Sunflower","Vegetables","Wheat","Barley","Beet","Potatoes","Grapes"],
    area: {
      "Corn":       [145952,38775,183575,146032,87175,47755,90593],
      "Triticale":  [1920,1865,3190,3575,3605,2940,2384],
      "Rapeseed":   [76140,78800,48655,60705,52260,63495,68226],
      "Sunflower":  [1280,1505,3950,6195,8860,12023,12169],
      "Vegetables": [17446,12707,14910,20194,18961,15979,19207],
      "Wheat":      [228570,220430,223090,194290,220885,204590,207427],
      "Barley":     [88620,87605,104480,100770,84180,89630,89038],
      "Beet":       [49635,49505,45950,43415,40750,39095,32162],
      "Potatoes":   [4776,4738,4867,5243,4679,4399,4318],
      "Grapes":     [30,33,33,101,101,101,109],
    },
    production: {
      "Corn":       [372474,322678,364899,354635,472874,388535,467704],
      "Triticale":  [11520,11190,19778,19663,23197,18673,15394],
      "Rapeseed":   [313181,266560,149011,204897,190666,266925,234523],
      "Sunflower":  [4280,4286,11915,17686,30608,34047,39293],
      "Vegetables": [64489,42761,62797,60596,57736,59292,67723],
      "Wheat":      [1830659,1687577,1956693,1469618,1817216,1732088,1706559],
      "Barley":     [645944,606931,820445,583518,634241,634609,676645],
      "Beet":       [4588398,3558810,3610660,1708580,3342255,2838325,2641877],
      "Potatoes":   [237401,197707,216780,229578,219131,177437,186358],
      "Grapes":     [231,474,306,352,371,735,702],
    },
    yield: {
      "Corn":       [11.1,8.3,8.2,6.9,20.4,8.3,17.4],
      "Triticale":  [6.0,6.0,6.2,5.5,6.4,6.4,6.5],
      "Rapeseed":   [4.1,3.4,3.1,3.4,3.6,4.2,3.4],
      "Sunflower":  [3.3,2.8,3.0,2.9,3.5,2.8,3.2],
      "Vegetables": [13.5,9.7,12.1,8.3,8.9,7.9,8.1],
      "Wheat":      [8.0,7.7,8.8,7.6,8.2,8.5,8.2],
      "Barley":     [7.3,6.9,7.9,5.8,7.5,7.1,7.6],
      "Beet":       [92.4,71.9,78.6,39.4,82.0,72.6,82.1],
      "Potatoes":   [49.7,41.7,44.5,43.8,46.8,40.3,43.2],
      "Grapes":     [7.7,14.3,9.3,7.8,6.2,10.8,7.5],
    },
  },
  "Centre-Val de Loire": {
    crops: ["Corn","Triticale","Rapeseed","Sunflower","Wheat","Barley","Beet","Potatoes","Grapes","Vegetables"],
    area: {
      "Corn":       [118000,120000,115000,125000,113000,118000,115000],
      "Triticale":  [48000,44000,50000,47000,52000,48000,45000],
      "Rapeseed":   [245000,260000,195000,205000,185000,220000,230000],
      "Sunflower":  [52000,54000,62000,78000,72000,88000,85000],
      "Wheat":      [620000,600000,595000,520000,590000,565000,575000],
      "Barley":     [205000,195000,215000,210000,195000,200000,198000],
      "Beet":       [87000,85000,78000,74000,71000,69000,65000],
      "Potatoes":   [12000,12500,13000,13500,13000,12800,12500],
      "Grapes":     [58000,57000,58000,59000,60000,60000,61000],
      "Vegetables": [18000,17000,18500,19000,18000,17500,18000],
    },
    production: {
      "Wheat":      [4650000,4200000,4750000,3700000,4500000,4300000,4400000],
      "Barley":     [1450000,1280000,1520000,1250000,1380000,1380000,1390000],
      "Rapeseed":   [870000,825000,620000,660000,605000,730000,760000],
      "Corn":       [1150000,1020000,1000000,1050000,990000,970000,1000000],
      "Beet":       [7500000,6700000,6800000,3400000,6300000,5700000,5500000],
      "Potatoes":   [530000,480000,520000,540000,525000,460000,480000],
      "Sunflower":  [120000,115000,135000,160000,155000,180000,178000],
      "Triticale":  [270000,240000,280000,250000,290000,272000,260000],
      "Grapes":     [252000,155000,210000,195000,180000,230000,220000],
      "Vegetables": [90000,78000,88000,92000,86000,84000,87000],
    },
    yield: {
      "Wheat":      [7.5,7.0,8.0,7.1,7.6,7.6,7.7],
      "Barley":     [7.1,6.6,7.1,6.0,7.1,6.9,7.0],
      "Rapeseed":   [3.6,3.2,3.2,3.2,3.3,3.3,3.3],
      "Corn":       [9.7,8.5,8.7,8.4,8.8,8.2,8.7],
      "Beet":       [86.2,78.8,87.2,45.9,88.6,82.4,84.6],
      "Potatoes":   [44.2,38.4,40.0,40.0,40.4,35.9,38.4],
      "Sunflower":  [2.3,2.1,2.2,2.1,2.2,2.0,2.1],
      "Triticale":  [5.6,5.5,5.6,5.3,5.6,5.7,5.8],
      "Grapes":     [4.3,2.7,3.6,3.3,3.0,3.8,3.6],
      "Vegetables": [5.0,4.6,4.8,4.8,4.8,4.8,4.8],
    },
  },
  "Hauts-de-France": {
    crops: ["Wheat","Barley","Rapeseed","Beet","Potatoes","Corn","Vegetables"],
    area: {
      "Wheat":      [570000,555000,550000,490000,545000,525000,530000],
      "Barley":     [190000,180000,195000,190000,178000,182000,180000],
      "Rapeseed":   [195000,205000,155000,165000,148000,175000,185000],
      "Beet":       [195000,192000,180000,170000,163000,161000,152000],
      "Potatoes":   [86000,87000,90000,93000,90000,89000,87000],
      "Corn":       [52000,50000,48000,52000,47000,49000,48000],
      "Vegetables": [45000,43000,46000,48000,45000,44000,45000],
    },
    production: {
      "Wheat":      [4600000,4100000,4750000,3600000,4400000,4200000,4300000],
      "Barley":     [1380000,1210000,1450000,1200000,1310000,1300000,1310000],
      "Rapeseed":   [720000,660000,510000,550000,490000,580000,610000],
      "Beet":       [17800000,16200000,17100000,8200000,15700000,14300000,13900000],
      "Potatoes":   [4500000,3900000,4300000,4400000,4300000,3800000,3950000],
      "Corn":       [490000,420000,425000,440000,415000,405000,418000],
      "Vegetables": [990000,890000,980000,1030000,960000,940000,975000],
    },
    yield: {
      "Wheat":      [8.1,7.4,8.6,7.3,8.1,8.0,8.1],
      "Barley":     [7.3,6.7,7.4,6.3,7.4,7.1,7.3],
      "Rapeseed":   [3.7,3.2,3.3,3.3,3.3,3.3,3.3],
      "Beet":       [91.3,84.4,95.0,48.2,96.3,88.8,91.4],
      "Potatoes":   [52.3,44.8,47.8,47.3,47.8,42.7,45.4],
      "Corn":       [9.4,8.4,8.9,8.5,8.8,8.3,8.7],
      "Vegetables": [22.0,20.7,21.3,21.5,21.3,21.4,21.7],
    },
  },
  "Grand Est": {
    crops: ["Wheat","Barley","Rapeseed","Corn","Beet","Grapes","Potatoes"],
    area: {
      "Wheat":      [480000,465000,460000,405000,455000,438000,442000],
      "Barley":     [175000,162000,178000,175000,162000,168000,165000],
      "Rapeseed":   [210000,220000,170000,178000,160000,190000,200000],
      "Corn":       [245000,248000,265000,295000,268000,255000,238000],
      "Beet":       [89000,88000,80000,76000,73000,72000,68000],
      "Grapes":     [138000,138000,138000,138000,138000,138000,138000],
      "Potatoes":   [11000,11200,11500,12000,11500,11200,11000],
    },
    production: {
      "Wheat":      [3700000,3400000,3800000,3000000,3600000,3450000,3500000],
      "Barley":     [1260000,1100000,1310000,1080000,1175000,1190000,1185000],
      "Rapeseed":   [760000,700000,560000,590000,525000,625000,660000],
      "Corn":       [2350000,2260000,2450000,2650000,2400000,2270000,2190000],
      "Beet":       [8100000,7300000,7600000,3700000,7200000,6700000,6500000],
      "Grapes":     [950000,700000,850000,780000,820000,920000,880000],
      "Potatoes":   [535000,490000,525000,545000,525000,490000,500000],
    },
    yield: {
      "Wheat":      [7.7,7.3,8.3,7.4,7.9,7.9,7.9],
      "Barley":     [7.2,6.8,7.4,6.2,7.3,7.1,7.2],
      "Rapeseed":   [3.6,3.2,3.3,3.3,3.3,3.3,3.3],
      "Corn":       [9.6,9.1,9.2,9.0,9.0,8.9,9.2],
      "Beet":       [91.0,83.0,95.0,48.7,98.6,93.1,95.6],
      "Potatoes":   [48.6,43.8,45.7,45.4,45.7,43.8,45.5],
      "Grapes":     [6.9,5.1,6.2,5.7,5.9,6.7,6.4],
    },
  },
  "Bretagne": {
    crops: ["Wheat","Barley","Corn","Rapeseed","Potatoes","Vegetables"],
    area: {
      "Wheat":      [205000,198000,196000,174000,194000,187000,189000],
      "Barley":     [220000,208000,225000,222000,205000,212000,209000],
      "Corn":       [305000,308000,325000,370000,332000,315000,295000],
      "Rapeseed":   [55000,58000,45000,47000,42000,50000,53000],
      "Potatoes":   [27000,27500,28500,30000,28500,28000,27500],
      "Vegetables": [36000,34000,37000,39000,37000,36000,37000],
    },
    production: {
      "Wheat":      [1380000,1210000,1440000,1120000,1330000,1280000,1300000],
      "Barley":     [1470000,1295000,1570000,1310000,1390000,1390000,1395000],
      "Corn":       [2700000,2610000,2890000,3170000,2840000,2660000,2590000],
      "Rapeseed":   [175000,165000,140000,148000,132000,158000,168000],
      "Potatoes":   [1090000,980000,1050000,1090000,1060000,985000,1005000],
      "Vegetables": [700000,630000,700000,730000,695000,675000,695000],
    },
    yield: {
      "Wheat":      [6.7,6.1,7.3,6.4,6.9,6.8,6.9],
      "Barley":     [6.7,6.2,7.0,5.9,6.8,6.6,6.7],
      "Corn":       [8.9,8.5,8.9,8.6,8.6,8.4,8.8],
      "Rapeseed":   [3.2,2.8,3.1,3.1,3.1,3.2,3.2],
      "Potatoes":   [40.4,35.6,36.8,36.3,37.2,35.2,36.5],
      "Vegetables": [19.4,18.5,18.9,18.7,18.8,18.8,18.8],
    },
  },
  "Nouvelle-Aquitaine": {
    crops: ["Wheat","Barley","Corn","Rapeseed","Sunflower","Grapes","Potatoes"],
    area: {
      "Wheat":      [490000,475000,470000,418000,465000,447000,451000],
      "Barley":     [185000,173000,188000,185000,172000,177000,175000],
      "Corn":       [320000,323000,345000,395000,353000,335000,313000],
      "Rapeseed":   [198000,208000,163000,170000,152000,180000,190000],
      "Sunflower":  [165000,155000,175000,220000,198000,245000,235000],
      "Grapes":     [252000,252000,253000,254000,255000,255000,258000],
      "Potatoes":   [18500,18800,19500,20500,19500,19100,18700],
    },
    production: {
      "Wheat":      [3200000,3000000,3400000,2700000,3100000,2980000,3050000],
      "Barley":     [1180000,1050000,1230000,1090000,1115000,1125000,1120000],
      "Corn":       [2950000,2820000,3200000,3540000,3140000,2970000,2840000],
      "Rapeseed":   [640000,600000,490000,520000,468000,556000,590000],
      "Sunflower":  [360000,320000,370000,430000,390000,450000,440000],
      "Grapes":     [1750000,1320000,1650000,1600000,1530000,1790000,1720000],
      "Potatoes":   [700000,640000,680000,710000,680000,620000,640000],
    },
    yield: {
      "Wheat":      [6.5,6.3,7.2,6.5,6.7,6.7,6.8],
      "Barley":     [6.4,6.1,6.5,5.9,6.5,6.4,6.4],
      "Corn":       [9.2,8.7,9.3,9.0,8.9,8.9,9.1],
      "Rapeseed":   [3.2,2.9,3.0,3.1,3.1,3.1,3.1],
      "Sunflower":  [2.2,2.1,2.1,2.0,2.0,1.8,1.9],
      "Grapes":     [6.9,5.2,6.5,6.3,6.0,7.0,6.7],
      "Potatoes":   [37.8,34.0,34.9,34.6,34.9,32.5,34.2],
    },
  },
  "Occitanie": {
    crops: ["Wheat","Barley","Corn","Rapeseed","Sunflower","Grapes","Potatoes"],
    area: {
      "Wheat":      [380000,368000,364000,323000,360000,346000,349000],
      "Barley":     [218000,204000,222000,218000,203000,209000,206000],
      "Corn":       [195000,197000,210000,240000,215000,204000,191000],
      "Rapeseed":   [88000,93000,73000,76000,68000,81000,85000],
      "Sunflower":  [176000,165000,186000,234000,210000,260000,250000],
      "Grapes":     [222000,221000,222000,222000,223000,223000,225000],
      "Potatoes":   [5800,5900,6100,6400,6100,5980,5850],
    },
    production: {
      "Wheat":      [2280000,2100000,2500000,1970000,2240000,2150000,2200000],
      "Barley":     [1230000,1085000,1280000,1100000,1150000,1155000,1155000],
      "Corn":       [1720000,1660000,1870000,2050000,1820000,1715000,1660000],
      "Rapeseed":   [268000,252000,213000,226000,200000,237000,250000],
      "Sunflower":  [380000,340000,385000,455000,408000,470000,455000],
      "Grapes":     [1560000,1190000,1480000,1440000,1400000,1580000,1530000],
      "Potatoes":   [210000,195000,205000,215000,208000,190000,196000],
    },
    yield: {
      "Wheat":      [6.0,5.7,6.9,6.1,6.2,6.2,6.3],
      "Barley":     [5.6,5.3,5.8,5.0,5.7,5.5,5.6],
      "Corn":       [8.8,8.4,8.9,8.5,8.5,8.4,8.7],
      "Rapeseed":   [3.0,2.7,2.9,3.0,2.9,2.9,2.9],
      "Sunflower":  [2.2,2.1,2.1,1.9,1.9,1.8,1.8],
      "Grapes":     [7.0,5.4,6.7,6.5,6.3,7.1,6.8],
      "Potatoes":   [36.2,33.1,33.6,33.6,34.1,31.8,33.5],
    },
  },
};

// Accurate SVG paths for French metropolitan regions — viewBox "0 0 540 600"
// Paths derived from standard French administrative geography
const FR_REGIONS_PATHS = {
  "Hauts-de-France":            { d:"M228,18 L248,16 L292,18 L335,24 L352,28 L358,42 L360,62 L352,88 L338,108 L310,116 L280,118 L252,116 L228,108 L216,88 L218,58 Z", cx:287,cy:68 },
  "Normandie":                  { d:"M72,52 L148,42 L218,42 L228,58 L216,88 L188,118 L162,134 L130,140 L82,122 L68,98 Z", cx:152,cy:92 },
  "Île-de-France":              { d:"M252,116 L280,118 L310,116 L318,152 L290,164 L260,162 L248,144 Z", cx:282,cy:140 },
  "Grand Est":                  { d:"M338,108 L352,88 L360,62 L358,42 L400,28 L444,38 L460,60 L464,110 L462,162 L430,182 L400,188 L372,178 L348,160 L340,130 Z", cx:408,cy:118 },
  "Bretagne":                   { d:"M22,148 L88,134 L148,130 L168,162 L158,192 L128,210 L88,218 L52,208 L22,182 Z", cx:102,cy:176 },
  "Pays de la Loire":           { d:"M82,122 L130,140 L162,134 L188,118 L198,158 L202,198 L188,228 L162,252 L120,252 L82,238 L68,208 L72,168 Z", cx:143,cy:192 },
  "Centre-Val de Loire":        { d:"M188,118 L228,108 L252,116 L248,144 L260,162 L290,164 L302,202 L278,240 L248,252 L202,252 L188,228 L202,198 L198,158 Z", cx:252,cy:195 },
  "Bourgogne-Franche-Comté":   { d:"M302,202 L290,164 L318,152 L310,116 L338,108 L348,160 L372,178 L400,188 L430,182 L438,262 L420,310 L392,332 L358,338 L318,308 L298,272 L294,242 Z", cx:368,cy:256 },
  "Nouvelle-Aquitaine":         { d:"M68,208 L82,238 L120,252 L162,252 L202,252 L218,268 L228,358 L202,408 L162,432 L118,418 L68,382 L48,320 L50,258 Z", cx:145,cy:340 },
  "Auvergne-Rhône-Alpes":      { d:"M278,240 L302,202 L294,242 L298,272 L318,308 L358,338 L392,332 L434,408 L398,438 L342,442 L278,412 L262,368 L258,308 Z", cx:346,cy:360 },
  "Occitanie":                  { d:"M118,418 L162,432 L202,408 L228,358 L262,368 L278,412 L342,442 L358,488 L298,518 L210,518 L148,498 L100,462 Z", cx:218,cy:468 },
  "Provence-Alpes-Côte d'Azur":{ d:"M398,438 L434,408 L460,388 L478,428 L468,482 L432,502 L378,498 L358,488 L342,442 Z", cx:415,cy:462 },
  "Corse":                      { d:"M466,490 L480,468 L494,500 L498,538 L484,552 L466,542 L458,518 Z", cx:478,cy:513 },
};

// ─── SAMPLE DATA ────────────────────────────────────────────────────────────
const SAMPLE_DATA = [
  { region:"France", crop:"Wheat",  soil_ph:6.5, om:2.1, strategy:"Blended (MAP)",     yield:7.1, fert_cost:340, op_cost:980,  revenue:1775, margin:795 },
  { region:"France", crop:"Wheat",  soil_ph:6.5, om:2.1, strategy:"Separated (TSP+N)", yield:7.2, fert_cost:330, op_cost:1030, revenue:1800, margin:770 },
  { region:"France", crop:"Wheat",  soil_ph:6.5, om:2.1, strategy:"Optimized",         yield:7.4, fert_cost:320, op_cost:1010, revenue:1850, margin:840 },
  { region:"France", crop:"Barley", soil_ph:6.3, om:1.9, strategy:"Blended (MAP)",     yield:6.8, fert_cost:310, op_cost:890,  revenue:1360, margin:470 },
  { region:"France", crop:"Barley", soil_ph:6.3, om:1.9, strategy:"Separated (TSP+N)", yield:7.0, fert_cost:295, op_cost:940,  revenue:1400, margin:460 },
  { region:"France", crop:"Barley", soil_ph:6.3, om:1.9, strategy:"Optimized",         yield:7.2, fert_cost:285, op_cost:920,  revenue:1440, margin:520 },
  { region:"France", crop:"Rapeseed",soil_ph:6.6,om:2.3, strategy:"Blended (MAP)",     yield:3.4, fert_cost:380, op_cost:1100, revenue:1870, margin:770 },
  { region:"France", crop:"Rapeseed",soil_ph:6.6,om:2.3, strategy:"Separated (TSP+N)", yield:3.5, fert_cost:365, op_cost:1155, revenue:1925, margin:770 },
  { region:"France", crop:"Rapeseed",soil_ph:6.6,om:2.3, strategy:"Optimized",         yield:3.7, fert_cost:355, op_cost:1135, revenue:2035, margin:900 },
];

const STRATEGY_COLORS = { "Blended (MAP)":"#64748b", "Separated (TSP+N)":"#0ea5e9", "Optimized":"#10b981" };

// ─── FARMER PERSONAS ─────────────────────────────────────────────────────────
const FARMER_PERSONAS = [
  { id:"price-fighter",  nickname:"The Price Fighter",   emoji:"💰", color:"#f43f5e", tagline:"Prix d'abord, agronomie ensuite", share:28, farmSize:"<40 ha", age:"55–70 yrs", region:"All regions", tenure:"Primarily lessee", structure:"Individual (EARL)", channel:"Direct distributor / price comparison", budget:"Minimises total input spend per ha", description:"Driven purely by invoice price. Will switch supplier for €2/tonne difference. Uses cooperative only if they have the cheapest quote. Often over-applies cheap N and under-applies P to save money.", fertiliserBehavior:"Buys cheapest NPK blend. Defers P applications in tight years. Price spike = immediate P skip.", decisionDriver:"Price", innovationScore:12, priceScore:95, agronomyScore:18, sustainScore:8, coopScore:40, digitalScore:10, p2o5KgHa:15, fertSpend:285, ocpOpportunity:"Low — very price-sensitive. TSP pitch must lead with cost-per-unit, not agronomy.", stats:[{label:"P2O5 applied",value:"~15 kg/ha",note:"vs 55 kg/ha recommended"},{label:"Avg. farm size",value:"<40 ha",note:"75% on leased land"},{label:"Coop loyalty",value:"Low",note:"Shops multiple distributors"},{label:"Fert. spend",value:"€285/ha",note:"Below national avg"},{label:"P deferral rate",value:"~60%",note:"In price shock years"},{label:"Digital tools",value:"None/rare",note:"Phone & paper records"}], segments:[{label:"Price sensitivity",val:95,color:"#f43f5e"},{label:"Agronomy focus",val:18,color:"#0ea5e9"},{label:"Innovation adopt.",val:12,color:"#10b981"},{label:"Sustainability",val:8,color:"#a78bfa"},{label:"Coop loyalty",val:40,color:"#f59e0b"}] },
  { id:"coop-follower",  nickname:"The Coop Follower",   emoji:"🤝", color:"#f59e0b", tagline:"Mon conseiller coopératif décide", share:32, farmSize:"40–100 ha", age:"45–60 yrs", region:"Champagne, Beauce, Picardie", tenure:"Mixed", structure:"GAEC or EARL", channel:"Cooperative agronomist recommendation", budget:"Follows coop package — rarely compares", description:"The dominant profile in French arable farming. Trusts cooperative agronomist completely. Buys the recommended program without questioning it. 70% of French P2O5 moves through this channel.", fertiliserBehavior:"Buys the cooperative's recommended blend verbatim. Does not comparison-shop. Influenced by regional agronomist visits.", decisionDriver:"Agronomist recommendation", innovationScore:45, priceScore:55, agronomyScore:62, sustainScore:40, coopScore:90, digitalScore:30, p2o5KgHa:38, fertSpend:330, ocpOpportunity:"HIGH — must target the coop agronomist, not the farmer. Win the agronomist, win 32% of the market.", stats:[{label:"P2O5 applied",value:"~38 kg/ha",note:"Still below 55 kg/ha rec."},{label:"Avg. farm size",value:"40–100 ha",note:"Core cereal zone farms"},{label:"Coop loyalty",value:"Very high",note:"90% of inputs via coop"},{label:"Fert. spend",value:"€330/ha",note:"Close to national avg"},{label:"Decision speed",value:"Fast",note:"Once agronomist advises"},{label:"TSP familiarity",value:"Low",note:"Mostly uses NPK blends"}], segments:[{label:"Price sensitivity",val:55,color:"#f43f5e"},{label:"Agronomy focus",val:62,color:"#0ea5e9"},{label:"Innovation adopt.",val:45,color:"#10b981"},{label:"Sustainability",val:40,color:"#a78bfa"},{label:"Coop loyalty",val:90,color:"#f59e0b"}] },
  { id:"precision-pioneer",nickname:"The Precision Pioneer",emoji:"🛰️",color:"#0ea5e9",tagline:"GPS, VRA, et données avant tout",share:11,farmSize:">150 ha",age:"30–45 yrs",region:"Île-de-France, Champagne",tenure:"Owner or long-term lease",structure:"SAS/SCEA or large GAEC",channel:"Direct supplier + agronomic advisor",budget:"ROI-driven — will pay premium if data-justified",description:"Young, educated, data-driven. Uses GPS variable-rate application, yield mapping, soil sampling. Reads ARVALIS trial results. Open to separated P programs if evidence is clear.",fertiliserBehavior:"Uses VRA for P. Tests TSP vs MAP in on-farm trials. Willing to pay premium if justified by soil analysis.",decisionDriver:"Agronomic ROI + data evidence",innovationScore:88,priceScore:35,agronomyScore:92,sustainScore:65,coopScore:55,digitalScore:82,p2o5KgHa:52,fertSpend:410,ocpOpportunity:"VERY HIGH — early adopter. Lead with agronomic trial data and VRA compatibility.",stats:[{label:"P2O5 applied",value:"~52 kg/ha",note:"Closest to Comifer rec."},{label:"Avg. farm size",value:">150 ha",note:"Some >300 ha SCEA"},{label:"VRA adoption",value:"~80%",note:"GPS-guided P application"},{label:"Fert. spend",value:"€410/ha",note:"Premium for quality"},{label:"Trial willingness",value:"High",note:"Conducts own field trials"},{label:"Digital tools",value:"Full stack",note:"FMIS + satellite imaging"}],segments:[{label:"Price sensitivity",val:35,color:"#f43f5e"},{label:"Agronomy focus",val:92,color:"#0ea5e9"},{label:"Innovation adopt.",val:88,color:"#10b981"},{label:"Sustainability",val:65,color:"#a78bfa"},{label:"Coop loyalty",val:55,color:"#f59e0b"}] },
  { id:"green-convert",  nickname:"The Green Convert",   emoji:"🌱", color:"#10b981", tagline:"Bas carbone et certification HVE", share:9, farmSize:"30–120 ha", age:"35–55 yrs", region:"Loire Valley, Normandie", tenure:"Owner or long-term tenant", structure:"Individual or GAEC", channel:"Cooperative bio / sustainable advisor", budget:"Will pay premium for certified low-carbon inputs", description:"HVE-certified or transitioning to organic. Actively reducing synthetic inputs. Interested in carbon credits. OCP's low-cadmium Moroccan P is a natural fit.", fertiliserBehavior:"Prefers certified organic P or low-carbon mineral P. Actively seeks cadmium certificates. TSP at lower rates is attractive.", decisionDriver:"Environmental certification + brand values", innovationScore:72, priceScore:42, agronomyScore:70, sustainScore:94, coopScore:65, digitalScore:55, p2o5KgHa:28, fertSpend:355, ocpOpportunity:"HIGH — lead with OCP's low-cadmium positioning and carbon footprint narrative.", stats:[{label:"P2O5 applied",value:"~28 kg/ha",note:"Intentionally low-input"},{label:"HVE certification",value:"14% of FR",note:"60k+ farms certified"},{label:"Carbon program",value:"12%",note:"Enrolled in credit schemes"},{label:"Fert. spend",value:"€355/ha",note:"Premium for green inputs"},{label:"Biostimulant use",value:"High",note:"40%+ already using"},{label:"Cadmium concern",value:"Very high",note:"EU regs primary motivator"}], segments:[{label:"Price sensitivity",val:42,color:"#f43f5e"},{label:"Agronomy focus",val:70,color:"#0ea5e9"},{label:"Innovation adopt.",val:72,color:"#10b981"},{label:"Sustainability",val:94,color:"#a78bfa"},{label:"Coop loyalty",val:65,color:"#f59e0b"}] },
  { id:"sunset-farmer",  nickname:"The Sunset Farmer",   emoji:"🌅", color:"#a78bfa", tagline:"Plus que 5 ans avant la retraite",  share:14, farmSize:"Any, often <60 ha", age:"60–70+ yrs", region:"All — concentrated in <20 ha", tenure:"Owner (often inherited)", structure:"Individual, no succession plan", channel:"Habit and inertia — same supplier for decades", budget:"Minimal capex, depleting soil P reserves", description:"Within 5–10 years of retirement. No identified successor. Investing minimally in soil fertility. Actively mining soil P reserves. Decisions made on autopilot.", fertiliserBehavior:"Applies minimal fertilizer — often below agronomic requirements. Skips P entirely in some years. No incentive to build soil fertility they won't harvest.", decisionDriver:"Inertia and cost minimization", innovationScore:5, priceScore:78, agronomyScore:22, sustainScore:15, coopScore:50, digitalScore:5, p2o5KgHa:10, fertSpend:240, ocpOpportunity:"VERY LOW near-term. Long-term: their farms will transfer to Precision Pioneers and Coop Followers.", stats:[{label:"P2O5 applied",value:"~10 kg/ha",note:"Actively mining soil P"},{label:"Share of farms",value:"43%+",note:"Operators >55 yrs"},{label:"Succession plan",value:"<30%",note:"Have identified successor"},{label:"Fert. spend",value:"€240/ha",note:"Lowest of all segments"},{label:"Investment horizon",value:"<5 yrs",note:"Near-term retirement"},{label:"Soil P status",value:"Declining",note:"Building agronomic gap"}], segments:[{label:"Price sensitivity",val:78,color:"#f43f5e"},{label:"Agronomy focus",val:22,color:"#0ea5e9"},{label:"Innovation adopt.",val:5,color:"#10b981"},{label:"Sustainability",val:15,color:"#a78bfa"},{label:"Coop loyalty",val:50,color:"#f59e0b"}] },
  { id:"consolidator",   nickname:"The Consolidator",    emoji:"🏗️", color:"#818cf8", tagline:"J'agrandis, j'optimise, j'externalise", share:6, farmSize:"200–500+ ha", age:"40–55 yrs", region:"Beauce, Champagne, Picardie", tenure:"Primarily lessee — aggressive land accumulation", structure:"SAS, SCEA, or EARL with salaried workers", channel:"Negotiates direct with manufacturers", budget:"Volume-driven — best per-tonne delivered cost at scale", description:"Rapidly expanding through land leasing. Employs salaried agronomists. Buys at volume — directly from importers. Represents 6% of farms but ~20% of P2O5 volume.", fertiliserBehavior:"Negotiates bulk contracts 6–12 months ahead. Already uses TSP on wheat. Will switch if economics clear at scale.", decisionDriver:"Volume economics and operational efficiency", innovationScore:75, priceScore:70, agronomyScore:78, sustainScore:45, coopScore:30, digitalScore:68, p2o5KgHa:48, fertSpend:380, ocpOpportunity:"VERY HIGH volume leverage — bypasses coop. Must be approached directly. Bulk TSP contract potential.", stats:[{label:"P2O5 applied",value:"~48 kg/ha",note:"Near recommended levels"},{label:"Farm size",value:"200–500+ ha",note:"Some >1,000 ha SAU"},{label:"Volume share",value:"~20%",note:"Of total P2O5 volume"},{label:"Fert. spend",value:"€380/ha",note:"Negotiated bulk pricing"},{label:"Lead time",value:"6–12 mo",note:"Forward buying horizon"},{label:"Coop bypass",value:"Yes",note:"Direct importer deals"}], segments:[{label:"Price sensitivity",val:70,color:"#f43f5e"},{label:"Agronomy focus",val:78,color:"#0ea5e9"},{label:"Innovation adopt.",val:75,color:"#10b981"},{label:"Sustainability",val:45,color:"#a78bfa"},{label:"Coop loyalty",val:30,color:"#f59e0b"}] },
];

// ─── MARKET INTEL ─────────────────────────────────────────────────────────────
const MARKET_INTEL = {
  France: {
    kpis:[
      { label:"P2O5 consumed",    value:"226 kt", sub:"−44% vs 2017",      accent:"#0ea5e9" },
      { label:"Agronomic gap",    value:"−157 kt",sub:"vs Comifer rec.",   accent:"#f59e0b" },
      { label:"Addressable mkt",  value:"511 kt", sub:"P2O5 by 2030",     accent:"#10b981" },
      { label:"Morocco mkt share",value:"~62%",   sub:"DAP/MAP imports",  accent:"#10b981" },
      { label:"Coop volumes",     value:"~70%",   sub:"of fertilizer flow",accent:"#a78bfa" },
    ],
    importOrigin:[
      { name:"Morocco",value:69.4,color:"#10b981"},
      { name:"Russia", value:13.0,color:"#f87171"},
      { name:"Egypt",  value:11.5,color:"#f59e0b"},
      { name:"Tunisia",value:2.0, color:"#64748b"},
      { name:"Other",  value:1.0, color:"#334155"},
    ],
    dynamics:[
      { type:"risk",    icon:"📉",label:"Consumption decline",        text:"P2O5 use fell ~44% from 2017 to 2023. Only ~50% of parcels receive mineral P — a structural agronomic gap versus Comifer recommendations." },
      { type:"risk",    icon:"✂️",label:"Price shock & substitution", text:"The 2022 price spike created a scissors effect. Farmers systematically prioritize nitrogen and defer P & K when budgets are tight." },
      { type:"neutral", icon:"🚢",label:"Import dependency",          text:"70% of P consumption is imported. No domestic TSP or DAP capacity — structurally favoring Moroccan and Russian exporters." },
      { type:"positive",icon:"📈",label:"Market recovery",            text:"If France closes 70% of the agronomic gap, the addressable P2O5 market reaches 511 kt by 2030." },
    ],
    strategy:[
      { type:"positive",icon:"🏆",label:"TSP positioning",      text:"TSP is agronomically optimal for French winter cereals — decouples N and P, aligns with low-carbon narrative." },
      { type:"positive",icon:"🌾",label:"Coop channel leverage",text:"70% of fertilizer flows through cooperatives. Co-designing with Inoxa, Area, Axereal is the critical entry mechanism." },
      { type:"neutral", icon:"⚔️",label:"Competitive landscape", text:"ICL, Timac, Yara dominate NPK+. Entry requires JV blending or differentiated low-cadmium positioning." },
      { type:"risk",    icon:"⚖️",label:"Regulatory headwinds",  text:"EU heavy metal/carbon rules tighten — opportunity for OCP's low-cadmium Moroccan P." },
    ],
    agronomy:[
      { type:"positive",icon:"🌾",label:"TSP & cereal synergy",    text:"Winter wheat, barley, and rapeseed benefit from pre-sowing TSP — P placed in root zone before tillering without N interference." },
      { type:"neutral", icon:"🧪",label:"Soil pH buffering",        text:"French soils average pH 6.2–6.8 across cereal zones. Calcareous pockets in Champagne and Languedoc favour TSP strongly." },
      { type:"risk",    icon:"🌍",label:"Organic matter depletion", text:"Reduced organic inputs are increasing P fixation risk, raising the agronomic argument for separated P application." },
      { type:"positive",icon:"🛰️",label:"Precision agronomy uptake",text:"VRA P application is growing on large cereal farms. Separated P programs are more compatible with VRA than blended NPK." },
    ],
    cropAgronomy:[
      { crop:"Wheat",    area:4950,currentP:18,recP:55,product:"TSP",    color:"#0ea5e9"},
      { crop:"Barley",   area:1867,currentP:27,recP:55,product:"TSP",    color:"#0ea5e9"},
      { crop:"Rapeseed", area:1230,currentP:34,recP:55,product:"TSP/PK", color:"#a78bfa"},
      { crop:"Corn",     area:1456,currentP:39,recP:65,product:"DAP",    color:"#f59e0b"},
      { crop:"Sunflower",area:871, currentP:25,recP:55,product:"TSP/PK", color:"#a78bfa"},
      { crop:"Potatoes", area:211, currentP:40,recP:40,product:"PK",     color:"#10b981"},
      { crop:"Beet",     area:402, currentP:35,recP:60,product:"PK",     color:"#10b981"},
    ],
    ownership:{
      kpis:[
        { label:"Total farms",       value:"390k", sub:"−19% since 2010",        accent:"#0ea5e9"},
        { label:"Avg. farm size",    value:"69 ha",sub:"up from 53 ha in 2010", accent:"#10b981"},
        { label:"Operators >55 yrs", value:"43%",  sub:"succession risk",        accent:"#f43f5e"},
        { label:"Land leased",       value:"~75%", sub:"of utilized agri. area", accent:"#f59e0b"},
        { label:"Coop volumes",      value:"~70%", sub:"of fertilizer flows",    accent:"#a78bfa"},
      ],
      farmSizeHistogram:[
        { range:"<5 ha",     farms:58, pct:15, fertVolPct:2,  color:"#334155"},
        { range:"5–20 ha",   farms:89, pct:23, fertVolPct:6,  color:"#475569"},
        { range:"20–50 ha",  farms:70, pct:18, fertVolPct:12, color:"#64748b"},
        { range:"50–100 ha", farms:62, pct:16, fertVolPct:18, color:"#0ea5e9"},
        { range:"100–200 ha",farms:55, pct:14, fertVolPct:24, color:"#818cf8"},
        { range:">200 ha",   farms:56, pct:14, fertVolPct:38, color:"#10b981"},
      ],
      tenure:[
        { name:"Primarily lessee",value:40,color:"#f59e0b"},
        { name:"Mixed",           value:35,color:"#0ea5e9"},
        { name:"Owner-operator",  value:25,color:"#10b981"},
      ],
      implications:[
        { type:"risk",    icon:"⏱️",label:"Short lease horizons",       text:"~75% of land under lease. Tenants on 9-year bail rural leases have limited incentive to invest in long-term soil P building." },
        { type:"risk",    icon:"👴",label:"Aging farmer profile",        text:"43% of operators over 55, many approaching retirement without successors. This cohort is characteristically price-sensitive." },
        { type:"neutral", icon:"📐",label:"Consolidation dynamic",       text:"Average farm size grew from 53 ha in 2010 to 69 ha in 2020. Larger successor farms are the addressable segment for precision P programs." },
        { type:"positive",icon:"🏛️",label:"Cooperative as aggregator",  text:"Given fragmented ownership, cooperatives are the de facto purchasing aggregator. Effective strategy must run through the coop channel." },
        { type:"positive",icon:"🤝",label:"GAEC & EARL structures",      text:"~30% of farms operate through collective structures. These are larger, more professionally managed, more responsive to agronomy." },
        { type:"neutral", icon:"🔄",label:"Generational transfer window",text:"150–180k farms will change hands over the next 10–15 years. New operators are more likely to adopt evidence-based agronomy." },
      ],
    },
  },
};

// ─── UTILITY ─────────────────────────────────────────────────────────────────
function fmt(n,prefix="$") { if(n===undefined||n===null)return"—"; return `${prefix}${Number(n).toFixed(0)}`; }
function pct(n) { return `${Number(n).toFixed(1)}%`; }

const CustomTooltip=({active,payload,label})=>{
  if(!active||!payload?.length)return null;
  return(<div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:8,padding:"10px 14px",fontSize:12}}><p style={{color:"#94a3b8",marginBottom:6}}>{label}</p>{payload.map((p,i)=><p key={i} style={{color:p.color,margin:"2px 0"}}>{p.name}: <strong style={{color:"#f1f5f9"}}>{typeof p.value==="number"?p.value.toFixed(1):p.value}</strong></p>)}</div>);
};

function generateInsights(data,region,crop){
  const filtered=data.filter(d=>d.region===region&&d.crop===crop);
  if(!filtered.length)return[];
  const base=filtered.find(d=>d.strategy==="Blended (MAP)"),sep=filtered.find(d=>d.strategy==="Separated (TSP+N)"),opt=filtered.find(d=>d.strategy==="Optimized");
  if(!base||!sep)return[];
  const ph=base.soil_ph,md=sep.margin-base.margin,yg=((sep.yield-base.yield)/base.yield*100).toFixed(1),eoc=sep.op_cost-base.op_cost,bey=(eoc/(base.revenue/base.yield)).toFixed(2);
  const ins=[];
  if(ph>7.5)ins.push(`In calcareous soils (pH ${ph}), P fixation is high — separation improves net margin by ~$${md}/ha.`);
  else if(ph<6.0)ins.push(`Acidic soils (pH ${ph}) show strong response to TSP separation — a ${yg}% yield gain modeled.`);
  else ins.push(`Moderate pH (${ph}) — net positive at $${md}/ha margin improvement.`);
  ins.push(`Separation requires $${eoc}/ha extra operational cost. Break-even at ${bey} t/ha yield gain.`);
  if(md>0)ins.push(`Separation increases profit per hectare once all incremental costs are included.`);
  else ins.push(`Separation is margin-neutral here. Lower pass costs or higher prices would tip the balance.`);
  if(opt)ins.push(`Optimized program: $${(opt.margin-base.margin).toFixed(0)}/ha above baseline.`);
  return ins;
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
function KPICard({label,value,sub,accent}){
  return(<div style={{background:"linear-gradient(135deg,#0f172a,#0a1020)",border:`1px solid ${accent}25`,borderRadius:14,padding:"16px 18px",flex:1,minWidth:120,position:"relative",overflow:"hidden"}}><div style={{position:"absolute",top:-15,right:-15,width:60,height:60,borderRadius:"50%",background:accent+"08"}}/><p style={{color:"#64748b",fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>{label}</p><p style={{color:accent,fontSize:22,fontWeight:800,fontFamily:"'DM Mono',monospace",margin:0}}>{value}</p>{sub&&<p style={{color:"#475569",fontSize:11,marginTop:4}}>{sub}</p>}</div>);
}
function SectionBadge({label,color}){return<span style={{padding:"3px 12px",borderRadius:20,fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",background:color+"18",color,border:`1px solid ${color}40`}}>{label}</span>;}
function InsightCard({item}){
  const border={positive:"#10b981",neutral:"#f59e0b",risk:"#f43f5e"},bg={positive:"#0a1e14",neutral:"#1a1200",risk:"#1a0808"},c=border[item.type];
  return(<div style={{background:bg[item.type]||"#0a0f1a",border:`1px solid ${c}30`,borderLeft:`3px solid ${c}`,borderRadius:12,padding:"15px 16px",transition:"transform 0.15s,box-shadow 0.15s",cursor:"default"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 24px ${c}20`;}} onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}><span style={{fontSize:15}}>{item.icon}</span><p style={{fontSize:11,color:c,textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:700,margin:0}}>{item.label}</p></div><p style={{fontSize:12,color:"#94a3b8",lineHeight:1.7,margin:0}}>{item.text}</p></div>);
}
function ScoreBar({label,val,color}){return(<div style={{marginBottom:8}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{color:"#94a3b8",fontSize:11}}>{label}</span><span style={{color,fontSize:11,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{val}/100</span></div><div style={{height:6,background:"#1e293b",borderRadius:3}}><div style={{height:"100%",width:`${val}%`,background:`linear-gradient(90deg,${color},${color}88)`,borderRadius:3,transition:"width 0.6s ease"}}/></div></div>);}
function PersonaRadar({persona}){
  const data=[{axis:"Price Sensitivity",val:persona.priceScore},{axis:"Agronomy Focus",val:persona.agronomyScore},{axis:"Innovation",val:persona.innovationScore},{axis:"Sustainability",val:persona.sustainScore},{axis:"Coop Loyalty",val:persona.coopScore},{axis:"Digital",val:persona.digitalScore}];
  return(<ResponsiveContainer width="100%" height={220}><RadarChart data={data}><PolarGrid stroke="#1e293b"/><PolarAngleAxis dataKey="axis" tick={{fill:"#64748b",fontSize:9}}/><Radar name={persona.nickname} dataKey="val" stroke={persona.color} fill={persona.color} fillOpacity={0.25} strokeWidth={2}/><Tooltip content={<CustomTooltip/>}/></RadarChart></ResponsiveContainer>);
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage({onEnter}){
  const [visible,setVisible]=useState(false);
  const [subVisible,setSubVisible]=useState(false);
  const [btnVisible,setBtnVisible]=useState(false);
  useEffect(()=>{
    setTimeout(()=>setVisible(true),300);
    setTimeout(()=>setSubVisible(true),1100);
    setTimeout(()=>setBtnVisible(true),1900);
  },[]);
  return(
    <div style={{minHeight:"100vh",background:"#04080f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans','Segoe UI',sans-serif",position:"relative",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:0.9}}
        @keyframes orbitSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .land-headline{transition:opacity 0.9s ease,transform 0.9s ease;}
        .land-sub{transition:opacity 0.8s ease,transform 0.8s ease;}
        .land-btn{transition:opacity 0.6s ease,transform 0.6s ease;}
      `}</style>

      {/* Subtle background grid */}
      <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(14,165,233,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.04) 1px,transparent 1px)",backgroundSize:"60px 60px"}}/>

      {/* Faint center glow */}
      <div style={{position:"absolute",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(14,165,233,0.07) 0%,transparent 70%)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",pointerEvents:"none"}}/>

      {/* Orbiting ring — very subtle */}
      <div style={{position:"absolute",width:480,height:480,borderRadius:"50%",border:"1px solid rgba(14,165,233,0.06)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",animation:"orbitSlow 30s linear infinite",pointerEvents:"none"}}/>
      <div style={{position:"absolute",width:340,height:340,borderRadius:"50%",border:"1px solid rgba(16,185,129,0.05)",top:"50%",left:"50%",transform:"translate(-50%,-50%)",animation:"orbitSlow 20s linear infinite reverse",pointerEvents:"none"}}/>

      {/* Logo */}
      <div style={{position:"absolute",top:32,left:40,display:"flex",alignItems:"center",gap:12,opacity:visible?1:0,transition:"opacity 0.8s ease"}}>
        <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#0ea5e9,#0369a1)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:12,color:"#fff",fontFamily:"'DM Mono',monospace",boxShadow:"0 0 16px #0ea5e930"}}>SMO</div>
        <span style={{color:"rgba(255,255,255,0.15)",fontSize:12,letterSpacing:"0.15em",textTransform:"uppercase"}}>Phosphorus Intelligence</span>
      </div>

      {/* Main content */}
      <div style={{textAlign:"center",maxWidth:720,padding:"0 32px",zIndex:10}}>
        {/* Small eyebrow label */}
        <div className="land-sub" style={{opacity:visible?1:0,transform:visible?"none":"translateY(12px)",marginBottom:24}}>
          <span style={{background:"rgba(14,165,233,0.1)",border:"1px solid rgba(14,165,233,0.2)",borderRadius:20,padding:"5px 16px",color:"rgba(14,165,233,0.9)",fontSize:11,fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase"}}>SMO · OCP Nutricrops</span>
        </div>

        {/* Headline */}
        <h1 className="land-headline" style={{opacity:visible?1:0,transform:visible?"none":"translateY(20px)",fontSize:"clamp(28px,4vw,48px)",fontWeight:300,color:"rgba(255,255,255,0.92)",lineHeight:1.25,marginBottom:32,letterSpacing:"-0.02em"}}>
          PhosStrat is SMO's quantitative<br/>
          <span style={{fontWeight:700,color:"#f1f5f9"}}>platform to better understand</span><br/>
          <span style={{color:"#0ea5e9",fontWeight:600}}>the farmer.</span>
        </h1>

        {/* Thin rule */}
        <div className="land-sub" style={{opacity:subVisible?1:0,transform:subVisible?"none":"translateY(10px)",margin:"0 auto 28px",width:48,height:1,background:"linear-gradient(90deg,transparent,rgba(14,165,233,0.6),transparent)"}}/>

        {/* Sub-line */}
        <p className="land-sub" style={{opacity:subVisible?1:0,transform:subVisible?"none":"translateY(10px)",fontSize:15,color:"rgba(255,255,255,0.35)",fontWeight:300,lineHeight:1.8,marginBottom:48,letterSpacing:"0.01em"}}>
          P separation economics · Market intelligence · Agronomic modelling
        </p>

        {/* CTA */}
        <button className="land-btn" onClick={onEnter}
          style={{opacity:btnVisible?1:0,transform:btnVisible?"none":"translateY(8px)",background:"transparent",border:"1px solid rgba(14,165,233,0.5)",color:"rgba(14,165,233,0.9)",padding:"13px 40px",borderRadius:4,fontSize:13,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",transition:"all 0.2s"}}
          onMouseEnter={e=>{e.currentTarget.style.background="rgba(14,165,233,0.1)";e.currentTarget.style.borderColor="rgba(14,165,233,0.9)";e.currentTarget.style.color="#fff";}}
          onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.borderColor="rgba(14,165,233,0.5)";e.currentTarget.style.color="rgba(14,165,233,0.9)";}}>
          Enter Platform →
        </button>
      </div>

      {/* Bottom bar */}
      <div style={{position:"absolute",bottom:32,left:"50%",transform:"translateX(-50%)",opacity:btnVisible?0.4:0,transition:"opacity 0.8s ease",fontSize:11,color:"rgba(255,255,255,0.3)",letterSpacing:"0.1em",textTransform:"uppercase",display:"flex",gap:32}}>
        <span>Agreste 2020</span><span>·</span><span>McKinsey Farmer Survey</span><span>·</span><span>ARVALIS</span><span>·</span><span>OCP Field Intelligence</span>
      </div>
    </div>
  );
}

// ─── FRANCE MAP COMPONENT ─────────────────────────────────────────────────────
// ── Heatmap color helper ─────────────────────────────────────────────────────
function heatColor(val, min, max, hasData) {
  if (!hasData || val === undefined || val === null) return "#0a1420";
  if (max === min) return "#0ea5e9";
  const t = (val - min) / (max - min); // 0 = low, 1 = high
  // Interpolate from deep blue (#0a2540) → teal (#0ea5e9) → green (#10b981)
  const r = Math.round(10  + t * (16  - 10));
  const g = Math.round(37  + t * (185 - 37));
  const b = Math.round(64  + t * (129 - 64));
  return `rgb(${r},${g},${b})`;
}

// ── France SVG heatmap ───────────────────────────────────────────────────────
function FranceMap({ selectedRegion, onSelectRegion, heatValues }) {
  const [hovered, setHovered] = useState(null);
  const regions = Object.keys(FR_REGIONS_PATHS);
  const hasData = r => Object.keys(REGIONAL_DATA).includes(r);

  // Compute min/max for scale legend
  const vals = Object.entries(heatValues || {}).filter(([r]) => hasData(r)).map(([,v]) => v);
  const minV = vals.length ? Math.min(...vals) : 0;
  const maxV = vals.length ? Math.max(...vals) : 1;

  const fmt2 = v => v > 1000000 ? (v/1000000).toFixed(1)+"M" : v > 1000 ? (v/1000).toFixed(0)+"k" : Number(v).toFixed(v < 20 ? 1 : 0);

  return (
    <div style={{ position:"relative" }}>
      <svg viewBox="0 0 540 600" style={{ width:"100%", height:"auto", display:"block" }}>
        <defs>
          <filter id="mapGlow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="mapShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.4"/>
          </filter>
        </defs>

        {regions.map(name => {
          const r = FR_REGIONS_PATHS[name];
          const isSelected = selectedRegion === name;
          const isHovered  = hovered === name;
          const hasD = hasData(name);
          const hVal = heatValues?.[name];
          const fill = isSelected
            ? "#ffffff"
            : isHovered
              ? (hasD ? "#3be8a0" : "#1e3040")
              : heatColor(hVal, minV, maxV, hasD);
          const strokeC = isSelected ? "#fff" : isHovered ? "#5eead4" : "#0a1e2e";
          const strokeW = isSelected ? 2 : isHovered ? 1.5 : 0.8;
          const txtColor = isSelected ? "#060d1a" : "#f1f5f9";

          return (
            <g key={name}
              style={{ cursor: hasD ? "pointer" : "default", opacity: hasD ? 1 : 0.5 }}
              onClick={() => hasD && onSelectRegion(name)}
              onMouseEnter={() => setHovered(name)}
              onMouseLeave={() => setHovered(null)}>
              <path d={r.d} fill={fill} stroke={strokeC} strokeWidth={strokeW}
                filter={isSelected ? "url(#mapGlow)" : undefined}
                style={{ transition:"fill 0.2s, stroke 0.2s" }}/>
              {/* Show label on hover/select */}
              {(isHovered || isSelected) && (
                <text x={r.cx} y={r.cy - (hVal !== undefined ? 7 : 0)}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={isSelected ? 8 : 7.5} fill={txtColor} fontWeight={700}
                  fontFamily="DM Sans,sans-serif" style={{ pointerEvents:"none", userSelect:"none" }}>
                  {name.split("-")[0].split("–")[0].trim().substring(0,16)}
                </text>
              )}
              {/* Value label on hover */}
              {(isHovered || isSelected) && hVal !== undefined && (
                <text x={r.cx} y={r.cy + 7}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={7} fill={txtColor} fontFamily="DM Mono,monospace"
                  style={{ pointerEvents:"none", userSelect:"none" }}>
                  {fmt2(hVal)}
                </text>
              )}
              {/* Always show dot for no-data regions */}
              {!isHovered && !isSelected && !hasD && (
                <circle cx={r.cx} cy={r.cy} r={2} fill="#1e3040" style={{ pointerEvents:"none" }}/>
              )}
            </g>
          );
        })}

        {/* Gradient scale bar */}
        {vals.length > 0 && (
          <g transform="translate(10,568)">
            <defs>
              <linearGradient id="scaleGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#0a2540"/>
                <stop offset="50%"  stopColor="#0ea5e9"/>
                <stop offset="100%" stopColor="#10b981"/>
              </linearGradient>
            </defs>
            <rect x={0} y={0} width={120} height={8} rx={4} fill="url(#scaleGrad)"/>
            <text x={0}   y={18} fontSize={7} fill="#64748b" fontFamily="DM Sans,sans-serif">{fmt2(minV)}</text>
            <text x={60}  y={18} fontSize={7} fill="#64748b" fontFamily="DM Sans,sans-serif" textAnchor="middle">mid</text>
            <text x={120} y={18} fontSize={7} fill="#64748b" fontFamily="DM Sans,sans-serif" textAnchor="end">{fmt2(maxV)}</text>
            <text x={0}   y={27} fontSize={7} fill="#334155" fontFamily="DM Sans,sans-serif">2023 values</text>
          </g>
        )}
        {/* No-data legend */}
        <g transform="translate(145,570)">
          <rect x={0} y={0} width={10} height={8} rx={2} fill="#0a1420" stroke="#1e3040" strokeWidth={0.8}/>
          <text x={13} y={7} fontSize={7} fill="#475569" fontFamily="DM Sans,sans-serif">No data yet</text>
        </g>
      </svg>
    </div>
  );
}


// ─── REGIONAL ANALYSIS PAGE ───────────────────────────────────────────────────
function RegionalPage(){
  const availableRegions = Object.keys(REGIONAL_DATA);
  const [selectedRegion, setSelectedRegion] = useState(availableRegions[0]);
  const [selectedCrop,   setSelectedCrop]   = useState("Wheat");
  const [metric,         setMetric]         = useState("yield");

  const regionData   = REGIONAL_DATA[selectedRegion];
  const availableCrops = regionData ? regionData.crops : [];
  const activeCrop   = availableCrops.includes(selectedCrop) ? selectedCrop : availableCrops[0];

  const metricLabel = { area:"Harvested Area", production:"Production", yield:"Yield" };
  const metricUnit  = { area:"Ha", production:"tonnes", yield:"t/Ha" };
  const metricColor = { area:"#0ea5e9", production:"#10b981", yield:"#f59e0b" };

  // Time series for selected region + crop
  const chartData = regionData && regionData[metric]
    ? YEARS.map((y,i) => ({ year: y, value: regionData[metric][activeCrop]?.[i] ?? 0 }))
    : [];

  // Heatmap values — 2023 (index 6) for each region for active crop
  const heatValues = Object.fromEntries(
    availableRegions.map(r => {
      const rd = REGIONAL_DATA[r];
      const crop = rd?.crops.includes(activeCrop) ? activeCrop : rd?.crops[0];
      const val = rd?.[metric]?.[crop]?.[6] ?? null;
      return [r, val];
    }).filter(([,v]) => v !== null)
  );

  // Multi-crop for selected region
  const cropColors = ["#0ea5e9","#10b981","#f59e0b","#a78bfa","#f43f5e"];
  const multiChart = regionData ? YEARS.map((y,i) => ({
    year: y,
    ...Object.fromEntries(availableCrops.slice(0,5).map(c => [c, regionData[metric][c]?.[i] ?? 0])),
  })) : [];

  const tickFmt = v => v > 1000000 ? (v/1000000).toFixed(1)+"M" : v > 1000 ? (v/1000).toFixed(0)+"k" : Number(v).toFixed(v < 20 ? 1 : 0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

      {/* ── Controls bar — prominent at top ── */}
      <div style={{ background:"#0a0f1a", border:"1px solid #1e293b", borderRadius:12, padding:"14px 18px", display:"flex", gap:24, flexWrap:"wrap", alignItems:"center" }}>
        <div>
          <p style={{ color:"#475569", fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8, fontWeight:600 }}>Metric</p>
          <div style={{ display:"flex", gap:8 }}>
            {Object.entries(metricLabel).map(([k,l]) => (
              <button key={k} onClick={() => setMetric(k)}
                style={{ padding:"8px 18px", borderRadius:8, border:`2px solid ${metric===k ? metricColor[k] : "#1e293b"}`, background: metric===k ? metricColor[k]+"22" : "transparent", color: metric===k ? metricColor[k] : "#64748b", fontSize:12, fontWeight: metric===k ? 700 : 400, cursor:"pointer", transition:"all 0.15s" }}>
                {l} <span style={{ opacity:0.6, fontSize:10 }}>({metricUnit[k]})</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <p style={{ color:"#475569", fontSize:10, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8, fontWeight:600 }}>Crop</p>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {["Wheat","Barley","Rapeseed","Corn","Sunflower","Beet","Potatoes"].map(c => {
              // Check if this crop exists in the selected region
              const avail = regionData?.crops.includes(c);
              return (
                <button key={c} onClick={() => avail && setSelectedCrop(c)}
                  style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${activeCrop===c ? "#f1f5f9" : avail ? "#334155" : "#1e293b"}`, background: activeCrop===c ? "#f1f5f9" : "transparent", color: activeCrop===c ? "#060d1a" : avail ? "#94a3b8" : "#2d3748", fontSize:11, fontWeight: activeCrop===c ? 700 : 400, cursor: avail ? "pointer" : "default", opacity: avail ? 1 : 0.35 }}>
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Map + time series side by side ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>

        {/* Heatmap */}
        <div className="card">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <div>
              <h3 className="card-title" style={{ marginBottom:2 }}>France — {metricLabel[metric]} · {activeCrop} · 2023</h3>
              <p style={{ color:"#334155", fontSize:10 }}>Click a region to see its time series →</p>
            </div>
            <div style={{ background: selectedRegion ? metricColor[metric]+"20" : "transparent", border:`1px solid ${metricColor[metric]}40`, borderRadius:8, padding:"4px 10px" }}>
              <p style={{ color: metricColor[metric], fontSize:11, fontWeight:700 }}>{selectedRegion?.split("-")[0]?.split("–")[0]?.trim().substring(0,16) || "—"}</p>
            </div>
          </div>
          <FranceMap
            selectedRegion={selectedRegion}
            onSelectRegion={r => { setSelectedRegion(r); setSelectedCrop(REGIONAL_DATA[r]?.crops.includes(activeCrop) ? activeCrop : REGIONAL_DATA[r]?.crops[0]); }}
            heatValues={heatValues}
          />
          {/* Region buttons */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:10 }}>
            {availableRegions.map(r => (
              <button key={r} onClick={() => setSelectedRegion(r)}
                style={{ padding:"3px 8px", borderRadius:5, border:`1px solid ${selectedRegion===r ? metricColor[metric] : "#1e293b"}`, background: selectedRegion===r ? metricColor[metric]+"20" : "transparent", color: selectedRegion===r ? metricColor[metric] : "#475569", fontSize:9, cursor:"pointer" }}>
                {r.split("-")[0].split("–")[0].trim().substring(0,14)}
              </button>
            ))}
          </div>
        </div>

        {/* Time series panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div className="card" style={{ border:`1px solid ${metricColor[metric]}30` }}>
            <h3 className="card-title" style={{ color: metricColor[metric] }}>
              {activeCrop} — {metricLabel[metric]} ({metricUnit[metric]}) · {selectedRegion}
            </h3>
            <p style={{ color:"#334155", fontSize:10, marginBottom:12 }}>2017–2023 · Source: Agreste / Ministry of Agriculture</p>
            <ResponsiveContainer width="100%" height={185}>
              <BarChart data={chartData} margin={{ left:10, right:10, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false}/>
                <XAxis dataKey="year" tick={{ fill:"#64748b", fontSize:9 }}/>
                <YAxis
                  tick={{ fill:"#64748b", fontSize:9 }}
                  tickFormatter={tickFmt}
                  label={{ value: metricUnit[metric], angle:-90, position:"insideLeft", fill:"#64748b", fontSize:9, offset:6 }}
                />
                <Tooltip content={<CustomTooltip/>} formatter={v => [tickFmt(v)+" "+metricUnit[metric], metricLabel[metric]]}/>
                <Bar dataKey="value" name={metricLabel[metric]} fill={metricColor[metric]} radius={[4,4,0,0]}>
                  {chartData.map((_,i) => <Cell key={i} fill={i===6 ? "#fff" : metricColor[metric]} fillOpacity={i===6 ? 1 : 0.7}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p style={{ color:"#334155", fontSize:10, marginTop:6, textAlign:"right" }}>2023 value highlighted in white</p>
          </div>

          {/* Multi-crop comparison */}
          <div className="card">
            <h3 className="card-title">All Crops — {metricLabel[metric]} ({metricUnit[metric]}) · {selectedRegion}</h3>
            <ResponsiveContainer width="100%" height={175}>
              <LineChart data={multiChart} margin={{ left:10, right:10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                <XAxis dataKey="year" tick={{ fill:"#64748b", fontSize:9 }}/>
                <YAxis
                  tick={{ fill:"#64748b", fontSize:9 }}
                  tickFormatter={tickFmt}
                  label={{ value: metricUnit[metric], angle:-90, position:"insideLeft", fill:"#64748b", fontSize:9, offset:6 }}
                />
                <Tooltip content={<CustomTooltip/>}/>
                <Legend wrapperStyle={{ fontSize:9 }}/>
                {availableCrops.slice(0,5).map((c,i) => (
                  <Line key={c} type="monotone" dataKey={c} stroke={cropColors[i]} strokeWidth={c===activeCrop ? 2.5 : 1.5} dot={false} strokeDasharray={c===activeCrop ? undefined : "3 2"}/>
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── QUANTITATIVE PAGES ───────────────────────────────────────────────────────
function OverviewPage({data,region}){
  const regionCrops=[...new Set(data.filter(d=>d.region===region).map(d=>d.crop))];
  const cropSummary=regionCrops.map(c=>{
    const b=data.find(d=>d.region===region&&d.crop===c&&d.strategy==="Blended (MAP)");
    const s=data.find(d=>d.region===region&&d.crop===c&&d.strategy==="Separated (TSP+N)");
    const o=data.find(d=>d.region===region&&d.crop===c&&d.strategy==="Optimized");
    return{crop:c,blended:b?.margin??0,separated:s?.margin??0,optimized:o?.margin??0,delta:(s?.margin??0)-(b?.margin??0)};
  });
  const allBase=data.filter(d=>d.region===region&&d.strategy==="Blended (MAP)");
  const allSep=data.filter(d=>d.region===region&&d.strategy==="Separated (TSP+N)");
  const avgB=allBase.reduce((a,d)=>a+d.margin,0)/(allBase.length||1);
  const avgS=allSep.reduce((a,d)=>a+d.margin,0)/(allSep.length||1);
  const avgD=avgS-avgB;
  const avgF=allBase.reduce((a,d)=>a+(d.fert_cost/d.op_cost)*100,0)/(allBase.length||1);

  const PM_COLORS={"DAP/MAP":"#0ea5e9","NPK/NP":"#a78bfa","PK":"#f59e0b","TSP":"#10b981","Other P":"#64748b","Organomineral":"#818cf8"};

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div className="kpi-row">
        <KPICard label="Avg. Margin — Blended"  value={fmt(avgB)+"/ha"} sub={`all crops · ${region}`} accent="#64748b"/>
        <KPICard label="Avg. Margin — Separated" value={fmt(avgS)+"/ha"} sub={`all crops · ${region}`} accent="#0ea5e9"/>
        <KPICard label="Avg. Sep. Benefit"       value={(avgD>=0?"+":"")+fmt(avgD)+"/ha"} sub="vs blended" accent={avgD>=0?"#10b981":"#f43f5e"}/>
        <KPICard label="Avg. Fert. Cost Share"   value={pct(avgF)} sub="of production cost" accent="#f59e0b"/>
        <KPICard label="Crops modelled"          value={regionCrops.length} sub={`in ${region}`} accent="#a78bfa"/>
      </div>

      {/* Product mix histogram — from Excel */}
      <div className="card">
        <h3 className="card-title">Product Mix Evolution — France (kt P2O5)</h3>
        <p style={{color:"#475569",fontSize:11,marginBottom:12}}>Season-by-season · Source: Agreste / French Ministry of Agriculture</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={PRODUCT_MIX_DATA} margin={{left:0,right:10,bottom:4}}>
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
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cropSummary} margin={{left:0,right:10}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
              <XAxis dataKey="crop" tick={{fill:"#64748b",fontSize:11}}/>
              <YAxis tick={{fill:"#64748b",fontSize:10}}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend wrapperStyle={{fontSize:10}}/>
              <Bar dataKey="blended"   name="Blended"   fill="#64748b" radius={[3,3,0,0]}/>
              <Bar dataKey="separated" name="Separated" fill="#0ea5e9" radius={[3,3,0,0]}/>
              <Bar dataKey="optimized" name="Optimized" fill="#10b981" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="card-title">Separation Delta — {region}</h3>
          <div style={{display:"flex",flexDirection:"column",gap:10,marginTop:4}}>
            {cropSummary.map((row,i)=>{
              const max=Math.max(...cropSummary.map(r=>r.separated)||[1]);
              const dc=row.delta>30?"#10b981":row.delta>0?"#0ea5e9":"#f43f5e";
              return(<div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{color:"#94a3b8",fontSize:11,width:68,flexShrink:0}}>{row.crop}</span>
                <div style={{flex:1,background:"#1e293b",borderRadius:4,height:20,position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${(row.separated/max)*100}%`,background:dc+"30",borderRadius:4}}/>
                  <span style={{position:"absolute",left:8,top:"50%",transform:"translateY(-50%)",color:"#e2e8f0",fontSize:10,fontFamily:"'DM Mono',monospace"}}>${row.separated}/ha</span>
                </div>
                <span style={{color:dc,fontSize:11,fontWeight:700,fontFamily:"'DM Mono',monospace",width:52,textAlign:"right",flexShrink:0}}>{row.delta>0?"+":""}{row.delta}</span>
              </div>);
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SimulatorPage({data,region,crop}){
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
    return[
      {strategy:"Blended (MAP)",     yield:baseYield,revenue:baseYield*cropPrice,fertCost:fb,opCost:boc,       totalCost:boc+fb,                margin:baseYield*cropPrice-boc-fb},
      {strategy:"Separated (TSP+N)", yield:yS,       revenue:yS*cropPrice,       fertCost:fs,opCost:boc+ex,   totalCost:boc+ex+fs,             margin:yS*cropPrice-(boc+ex)-fs},
      {strategy:"Optimized",         yield:yO,       revenue:yO*cropPrice,       fertCost:fs*0.95,opCost:boc+ex*0.85,totalCost:boc+ex*0.85+fs*0.95,margin:yO*cropPrice-(boc+ex*0.85)-fs*0.95},
    ];
  },[cropPrice,mapPrice,tspPrice,baseYield,yieldBoost,extraPasses,costPerPass,appRateN,appRateP,realBase]);
  const base=scenarios[0];
  const breakEven=((extraPasses*costPerPass)/cropPrice).toFixed(2);
  const passes=yieldBoost/100*baseYield>=breakEven;
  const waterfallData=[{name:"Base",value:base.margin,fill:"#64748b"},{name:"+Yield",value:scenarios[1].revenue-base.revenue,fill:"#10b981"},{name:"-Passes",value:-(extraPasses*costPerPass),fill:"#f43f5e"},{name:"-FertΔ",value:-(scenarios[1].fertCost-base.fertCost),fill:"#f59e0b"},{name:"=Sep.",value:scenarios[1].margin,fill:"#0ea5e9"}];
  const Slider=({label,min,max,step,value,onChange,unit})=>(<div style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{color:"#94a3b8",fontSize:12}}>{label}</span><span style={{color:"#f1f5f9",fontSize:12,fontFamily:"'DM Mono',monospace"}}>{value}{unit}</span></div><input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",accentColor:"#0ea5e9",cursor:"pointer"}}/></div>);
  return(<div><div className="simulator-grid"><div className="card"><h3 className="card-title">Inputs — {crop} · {region}</h3>{realBase&&<p style={{color:"#10b981",fontSize:11,marginBottom:10,background:"#10b98110",borderRadius:6,padding:"5px 10px",border:"1px solid #10b98120"}}>Base op. cost: ${realBase.op_cost}/ha</p>}<Slider label="Crop Price ($/t)" min={100} max={600} step={10} value={cropPrice} onChange={setCropPrice} unit=" $/t"/><Slider label="MAP Price ($/t)"  min={300} max={900} step={10} value={mapPrice}  onChange={setMapPrice}  unit=" $/t"/><Slider label="TSP Price ($/t)"  min={280} max={850} step={10} value={tspPrice}  onChange={setTspPrice}  unit=" $/t"/><Slider label="Base Yield"       min={1}   max={15}  step={0.1}value={baseYield} onChange={setBaseYield} unit=" t/ha"/><Slider label="Yield Boost Sep." min={0}   max={30}  step={0.5}value={yieldBoost}onChange={setYieldBoost}unit="%"/><Slider label="Extra Passes"     min={0}   max={4}   step={1}  value={extraPasses}onChange={setExtraPasses}unit=""/><Slider label="Cost/Pass"        min={20}  max={150} step={5}  value={costPerPass}onChange={setCostPerPass}unit=" $/ha"/><Slider label="N Rate"           min={50}  max={300} step={5}  value={appRateN}  onChange={setAppRateN}  unit=" kg/ha"/><Slider label="P Rate"           min={20}  max={200} step={5}  value={appRateP}  onChange={setAppRateP}  unit=" kg/ha"/></div><div style={{display:"flex",flexDirection:"column",gap:14}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>{scenarios.map((s,si)=>{const delta=s.margin-base.margin;const col=Object.values(STRATEGY_COLORS)[si];const winner=s.margin===Math.max(...scenarios.map(x=>x.margin));return(<div key={si} style={{background:"linear-gradient(135deg,#0f172a,#0a1020)",border:`1px solid ${col}${winner?"80":"30"}`,borderRadius:14,padding:"14px 12px",position:"relative"}}>{winner&&<div style={{position:"absolute",top:8,right:10,fontSize:13}}>🏆</div>}<div style={{width:9,height:9,borderRadius:"50%",background:col,marginBottom:7,boxShadow:`0 0 7px ${col}`}}/><p style={{color:col,fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:7,fontWeight:700}}>{s.strategy}</p><p style={{color:"#f1f5f9",fontSize:19,fontWeight:800,fontFamily:"'DM Mono',monospace",margin:0}}>{fmt(s.margin)}</p><p style={{color:"#64748b",fontSize:10,marginTop:1}}>$/ha margin</p>{si>0&&<div style={{marginTop:8,padding:"3px 8px",borderRadius:6,background:delta>=0?"#10b98120":"#f43f5e20",display:"inline-block"}}><span style={{color:delta>=0?"#10b981":"#f43f5e",fontSize:11,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{delta>=0?"+":""}{fmt(delta)}</span></div>}</div>);})}</div><div className="chart-grid-2"><div className="card"><h3 className="card-title">Profit Waterfall</h3><ResponsiveContainer width="100%" height={155}><BarChart data={waterfallData}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/><XAxis dataKey="name" tick={{fill:"#64748b",fontSize:9}}/><YAxis tick={{fill:"#64748b",fontSize:9}}/><Tooltip content={<CustomTooltip/>}/><Bar dataKey="value" name="$/ha" radius={[3,3,0,0]}>{waterfallData.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Bar></BarChart></ResponsiveContainer></div><div className="card" style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",gap:8}}><h3 className="card-title">Break-Even</h3><p style={{color:"#f59e0b",fontSize:28,fontWeight:800,fontFamily:"'DM Mono',monospace"}}>{breakEven} t/ha</p><div style={{width:"100%",background:passes?"#10b98120":"#f43f5e20",borderRadius:9,padding:"9px",textAlign:"center",border:`1px solid ${passes?"#10b98140":"#f43f5e40"}`}}><p style={{color:passes?"#10b981":"#f43f5e",fontWeight:700,fontSize:12}}>{passes?"✓ PAYS OFF":"✗ DOESN'T BREAK EVEN"}</p></div></div></div></div></div></div>);
}

function PLPage({data,region,crop}){
  const [expanded,setExpanded]=useState({});
  const base=data.find(d=>d.region===region&&d.crop===crop&&d.strategy==="Blended (MAP)");
  const categories=[{key:"seed",label:"Seed",value:95,share:11,color:"#a78bfa"},{key:"fert",label:"Fertilizer",value:base?.fert_cost||310,share:Math.round((base?.fert_cost||310)/(base?.op_cost||900)*100),color:"#f59e0b"},{key:"cp",label:"Crop Protection",value:120,share:14,color:"#0ea5e9"},{key:"mach",label:"Machinery",value:180,share:21,color:"#64748b"},{key:"labor",label:"Labor",value:95,share:11,color:"#10b981"},{key:"fuel",label:"Fuel",value:65,share:8,color:"#f43f5e"},{key:"land",label:"Land / Rent",value:145,share:17,color:"#e2e8f0"}];
  const sensData=[200,300,400,500,600,700,800].map(fp=>({price:fp,"Blended":(base?.revenue||1050)-(base?.op_cost||900-(base?.fert_cost||310))-fp,"Separated":(base?.revenue||1050)*1.08-((base?.op_cost||900)+55-((base?.fert_cost||310)*0.95))-fp*0.95}));
  const donutData=categories.map(c=>({name:c.label,value:c.share,color:c.color}));
  return(<div style={{display:"flex",flexDirection:"column",gap:18}}><div className="chart-grid-2"><div className="card"><h3 className="card-title">Cost Breakdown — {crop} · {region}</h3><ResponsiveContainer width="100%" height={155}><PieChart><Pie data={donutData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={2}>{donutData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie><Tooltip formatter={(v,n)=>[`${v}%`,n]}/></PieChart></ResponsiveContainer>{categories.map(cat=>(<div key={cat.key} style={{marginBottom:5}}><div onClick={()=>setExpanded(e=>({...e,[cat.key]:!e[cat.key]}))} style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",padding:"5px 7px",borderRadius:7,background:expanded[cat.key]?"#1e293b":"transparent"}}><div style={{width:9,height:9,borderRadius:2,background:cat.color,flexShrink:0}}/><span style={{color:"#e2e8f0",fontSize:12,flex:1}}>{cat.label}</span><div style={{width:80,background:"#1e293b",borderRadius:3,height:4}}><div style={{width:`${cat.share}%`,background:cat.color,borderRadius:3,height:"100%"}}/></div><span style={{color:"#94a3b8",fontSize:11,width:28,textAlign:"right"}}>{cat.share}%</span><span style={{color:"#f1f5f9",fontSize:11,fontFamily:"'DM Mono',monospace",width:52,textAlign:"right"}}>${cat.value}</span></div>{expanded[cat.key]&&<div style={{marginLeft:22,padding:"5px 10px",background:"#0a0f1a",borderRadius:7,fontSize:11,color:"#64748b"}}>{cat.key==="fert"?`Blended: $${cat.value}/ha → Sep.: $${Math.round(cat.value*0.95)}/ha`:`Standard for ${crop.toLowerCase()} in ${region}.`}</div>}</div>))}</div><div className="card"><h3 className="card-title">Margin Sensitivity to Fertilizer Price</h3><p style={{color:"#475569",fontSize:11,marginBottom:8}}>{crop} · {region}</p><ResponsiveContainer width="100%" height={200}><AreaChart data={sensData}><defs><linearGradient id="gbF" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/><stop offset="95%" stopColor="#64748b" stopOpacity={0}/></linearGradient><linearGradient id="gsF" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/><XAxis dataKey="price" tick={{fill:"#64748b",fontSize:10}}/><YAxis tick={{fill:"#64748b",fontSize:10}}/><Tooltip content={<CustomTooltip/>}/><Legend wrapperStyle={{fontSize:11}}/><ReferenceLine y={0} stroke="#334155" strokeDasharray="4 4"/><Area type="monotone" dataKey="Blended"   stroke="#64748b" fill="url(#gbF)" strokeWidth={2}/><Area type="monotone" dataKey="Separated" stroke="#0ea5e9" fill="url(#gsF)" strokeWidth={2}/></AreaChart></ResponsiveContainer></div></div></div>);
}

function AgronomyPage({data,region,crop}){
  const base=data.find(d=>d.region===region&&d.crop===crop&&d.strategy==="Blended (MAP)");
  const ph=base?.soil_ph??6.5;
  const phData=Array.from({length:30},(_,i)=>{const p=5.0+i*0.15;return{ph:p.toFixed(1),"MAP/DAP":Math.max(0,6.5-Math.abs(p-6.2)*1.8+(p>7.0?-(p-7.0)*2:0)),"TSP Sep.":Math.max(0,7.0-Math.abs(p-6.5)*1.2+(p>7.5?-(p-7.5)*1.5:0)),"Optimized":Math.max(0,7.5-Math.abs(p-6.8)*1.0)};});
  const pRateData=Array.from({length:10},(_,i)=>{const r=i*20+20;return{rate:r,"MAP/DAP":Math.min(8,3+Math.sqrt(r)*0.65),"TSP Sep.":Math.min(9,3.2+Math.sqrt(r)*0.72),"Optimized":Math.min(9.5,3.4+Math.sqrt(r)*0.78)};});
  return(<div style={{display:"flex",flexDirection:"column",gap:18}}>
    {base&&<div style={{display:"flex",gap:12,flexWrap:"wrap"}}>{[{label:"Crop",val:crop,color:"#0ea5e9"},{label:"Region",val:region,color:"#a78bfa"},{label:"Soil pH",val:ph,color:"#f59e0b"},{label:"Org. Matter",val:base.om+"%",color:"#10b981"}].map((item,i)=>(<div key={i} style={{background:"linear-gradient(135deg,#0f172a,#0a1020)",border:`1px solid ${item.color}25`,borderRadius:12,padding:"12px 16px",flex:1,minWidth:90}}><p style={{color:"#64748b",fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>{item.label}</p><p style={{color:item.color,fontSize:17,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{item.val}</p></div>))}</div>}

    {/* Consumption time series — from Excel */}
    <div className="card">
      <h3 className="card-title">Annual Nutrient Consumption — France (t nutrient)</h3>
      <p style={{color:"#475569",fontSize:11,marginBottom:12}}>2017–2023 · N, P2O5, K2O · Source: Agreste / French Ministry of Agriculture</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={CONSUMPTION_DATA} margin={{left:0,right:20}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
          <XAxis dataKey="year" tick={{fill:"#64748b",fontSize:9}}/>
          <YAxis tick={{fill:"#64748b",fontSize:9}} tickFormatter={v=>(v/1000).toFixed(0)+"k"}/>
          <Tooltip content={<CustomTooltip/>} formatter={v=>[v.toLocaleString()+" t",""]}/>
          <Legend wrapperStyle={{fontSize:10}}/>
          <Line type="monotone" dataKey="N"    name="N (t)"    stroke="#0ea5e9" strokeWidth={2} dot={{r:3}} activeDot={{r:5}}/>
          <Line type="monotone" dataKey="P2O5" name="P2O5 (t)" stroke="#10b981" strokeWidth={2} dot={{r:3}} activeDot={{r:5}}/>
          <Line type="monotone" dataKey="K2O"  name="K2O (t)"  stroke="#f59e0b" strokeWidth={2} dot={{r:3}} activeDot={{r:5}}/>
        </LineChart>
      </ResponsiveContainer>
    </div>

    <div className="chart-grid-2">
      <div className="card"><h3 className="card-title">Yield vs Soil pH</h3><p style={{color:"#475569",fontSize:11,marginBottom:10}}>Separation advantage highest at pH &gt; 7.5</p><ResponsiveContainer width="100%" height={175}><LineChart data={phData}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/><XAxis dataKey="ph" tick={{fill:"#64748b",fontSize:9}}/><YAxis tick={{fill:"#64748b",fontSize:9}}/><Tooltip content={<CustomTooltip/>}/><Legend wrapperStyle={{fontSize:9}}/><ReferenceLine x={String(ph.toFixed(1))} stroke="#f59e0b80" strokeDasharray="4 4" label={{value:"↑ now",fill:"#f59e0b",fontSize:9}}/>{["MAP/DAP","TSP Sep.","Optimized"].map((k,i)=><Line key={k} type="monotone" dataKey={k} stroke={Object.values(STRATEGY_COLORS)[i]} strokeWidth={2} dot={false}/>)}</LineChart></ResponsiveContainer></div>
      <div className="card"><h3 className="card-title">Yield vs P Rate</h3><p style={{color:"#475569",fontSize:11,marginBottom:10}}>Separation shifts the plateau upward</p><ResponsiveContainer width="100%" height={175}><LineChart data={pRateData}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/><XAxis dataKey="rate" tick={{fill:"#64748b",fontSize:9}}/><YAxis tick={{fill:"#64748b",fontSize:9}}/><Tooltip content={<CustomTooltip/>}/><Legend wrapperStyle={{fontSize:9}}/>{["MAP/DAP","TSP Sep.","Optimized"].map((k,i)=><Line key={k} type="monotone" dataKey={k} stroke={Object.values(STRATEGY_COLORS)[i]} strokeWidth={2} dot={false}/>)}</LineChart></ResponsiveContainer></div>
    </div>
  </div>);
}

function InsightsPage({data,region,crop}){
  const insights=generateInsights(data,region,crop);
  const allInsights=[...new Set(data.map(d=>d.crop))].map(c=>{
    const b=data.find(d=>d.region===region&&d.crop===c&&d.strategy==="Blended (MAP)");
    const s=data.find(d=>d.region===region&&d.crop===c&&d.strategy==="Separated (TSP+N)");
    if(!b||!s)return null;
    return{region,crop:c,delta:s.margin-b.margin,ph:b.soil_ph};
  }).filter(Boolean);
  const base=data.find(d=>d.region===region&&d.crop===crop&&d.strategy==="Blended (MAP)");
  const sep=data.find(d=>d.region===region&&d.crop===crop&&d.strategy==="Separated (TSP+N)");
  const radarData=base&&sep?[{metric:"Yield",blended:base.yield/0.1,separated:sep.yield/0.1},{metric:"Margin",blended:base.margin/10,separated:sep.margin/10},{metric:"P Effic.",blended:60,separated:80},{metric:"Revenue",blended:base.revenue/20,separated:sep.revenue/20},{metric:"Cost Eff.",blended:50,separated:70}]:[];
  return(<div style={{display:"flex",flexDirection:"column",gap:18}}><div className="chart-grid-2"><div className="card" style={{border:"1px solid #0ea5e930"}}><h3 style={{color:"#0ea5e9",fontSize:11,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:14}}>◈ Model Insights — {crop} · {region}</h3>{insights.length?insights.map((ins,i)=>(<div key={i} style={{display:"flex",gap:10,marginBottom:11,padding:"9px 12px",background:"#0a0f1a",borderRadius:8,borderLeft:"2px solid #0ea5e940"}}><span style={{color:"#0ea5e9",fontSize:13,marginTop:1,flexShrink:0}}>→</span><p style={{color:"#cbd5e1",fontSize:12,lineHeight:1.7,margin:0}}>{ins}</p></div>)):<p style={{color:"#475569"}}>No data for selected context.</p>}</div>{radarData.length>0&&<div className="card"><h3 className="card-title">Strategy Radar — {crop} · {region}</h3><ResponsiveContainer width="100%" height={230}><RadarChart data={radarData}><PolarGrid stroke="#1e293b"/><PolarAngleAxis dataKey="metric" tick={{fill:"#64748b",fontSize:10}}/><Radar name="Blended"   dataKey="blended"   stroke="#64748b" fill="#64748b" fillOpacity={0.2} strokeWidth={2}/><Radar name="Separated" dataKey="separated" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.25} strokeWidth={2}/><Legend wrapperStyle={{fontSize:10}}/><Tooltip content={<CustomTooltip/>}/></RadarChart></ResponsiveContainer></div>}</div><div className="card" style={{overflow:"auto"}}><h3 className="card-title">Separation Benefit by Crop — {region}</h3><table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:300}}><thead><tr style={{borderBottom:"1px solid #1e293b"}}>{["Crop","pH","Δ Margin","Verdict"].map((h,i)=><th key={i} style={{padding:"8px 12px",textAlign:i>0?"right":"left",color:"#64748b",fontSize:10,textTransform:"uppercase",fontWeight:500,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead><tbody>{allInsights.sort((a,b)=>b.delta-a.delta).map((row,i)=>{const dc=row.delta>30?"#10b981":row.delta>0?"#0ea5e9":"#f43f5e";return(<tr key={i} style={{borderBottom:"1px solid #0f1929",background:i%2===0?"#0a0f1a":"#0f172a"}}><td style={{padding:"8px 12px",color:"#94a3b8"}}>{row.crop}</td><td style={{padding:"8px 12px",textAlign:"right",color:"#64748b",fontFamily:"'DM Mono',monospace"}}>{row.ph}</td><td style={{padding:"8px 12px",textAlign:"right",fontFamily:"'DM Mono',monospace",fontWeight:700,color:dc}}>{row.delta>0?"+":""}{row.delta}</td><td style={{padding:"8px 12px",textAlign:"right"}}><span style={{padding:"2px 8px",borderRadius:20,fontSize:10,background:dc+"20",color:dc,whiteSpace:"nowrap"}}>{row.delta>30?"STRONG":row.delta>0?"MARGINAL":"NEUTRAL"}</span></td></tr>);})}</tbody></table></div></div>);
}

// ─── MARKET INTELLIGENCE PAGES ───────────────────────────────────────────────
function MIPlaceholder({region}){return<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:300,gap:12}}><p style={{fontSize:40}}>🌍</p><p style={{fontSize:15,color:"#64748b"}}>No market intelligence data for {region}.</p></div>;}

function MIMarketDynamicsPage({region}){
  const intel=MARKET_INTEL[region];
  if(!intel)return<MIPlaceholder region={region}/>;
  return(<div style={{display:"flex",flexDirection:"column",gap:20}}><div className="kpi-row">{intel.kpis.map((k,i)=><KPICard key={i} {...k}/>)}</div><div className="chart-grid-2"><div className="card"><h3 className="card-title">P2O5 Consumption by Product — kt (season over season)</h3><ResponsiveContainer width="100%" height={220}><LineChart data={PRODUCT_MIX_DATA}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/><XAxis dataKey="season" tick={{fill:"#64748b",fontSize:9}}/><YAxis tick={{fill:"#64748b",fontSize:9}}/><Tooltip content={<CustomTooltip/>}/><Legend wrapperStyle={{fontSize:10}}/>{[["DAP/MAP","#0ea5e9"],["NPK/NP","#a78bfa"],["PK","#f59e0b"],["TSP","#10b981"],["Other P","#64748b"]].map(([k,c])=><Line key={k} type="monotone" dataKey={k} stroke={c} strokeWidth={2} dot={{r:3}} activeDot={{r:5}}/>)}</LineChart></ResponsiveContainer></div><div className="card"><h3 className="card-title">DAP/MAP Import Origin — kt P2O5 (2024)</h3><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={intel.importOrigin} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value})=>`${name} ${value}kt`} labelLine={false}>{intel.importOrigin.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie><Tooltip formatter={(v,n)=>[`${v} kt`,n]}/></PieChart></ResponsiveContainer><div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:6}}>{intel.importOrigin.map((d,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:8,height:8,borderRadius:2,background:d.color}}/><span style={{color:"#94a3b8",fontSize:11}}>{d.name} {d.value}kt</span></div>)}</div></div></div><div><h3 style={{color:"#94a3b8",fontSize:11,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Market Dynamics</h3><div className="chart-grid-2">{intel.dynamics.map((item,i)=><InsightCard key={i} item={item}/>)}</div></div></div>);
}

function MIFarmerBehaviorPage(){
  const [activePersona,setActivePersona]=useState(FARMER_PERSONAS[0].id);
  const [viewMode,setViewMode]=useState("grid");
  const persona=FARMER_PERSONAS.find(p=>p.id===activePersona)||FARMER_PERSONAS[0];
  const p2o5Chart=FARMER_PERSONAS.map(p=>({name:p.nickname.replace("The ",""),value:p.p2o5KgHa,fill:p.color}));
  return(<div style={{display:"flex",flexDirection:"column",gap:20}}><div style={{background:"linear-gradient(135deg,#0a0f1a,#0d1225)",border:"1px solid #1e293b",borderRadius:14,padding:"16px 18px"}}><p style={{color:"#94a3b8",fontSize:11,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>France — 6 Farmer Archetypes</p><p style={{color:"#64748b",fontSize:12,lineHeight:1.7,margin:0}}>Based on Agreste 2020 census data, McKinsey global farmer surveys, and OCP commercial field intelligence.</p></div><div><div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>{FARMER_PERSONAS.map(p=>(<button key={p.id} onClick={()=>{setActivePersona(p.id);setViewMode("detail");}} style={{display:"flex",alignItems:"center",gap:7,padding:"9px 14px",borderRadius:12,cursor:"pointer",background:activePersona===p.id?p.color+"22":"#0f172a",border:`1px solid ${activePersona===p.id?p.color:p.color+"30"}`,transition:"all 0.15s"}}><span style={{fontSize:16}}>{p.emoji}</span><div style={{textAlign:"left"}}><p style={{color:activePersona===p.id?p.color:"#94a3b8",fontSize:11,fontWeight:700,margin:0}}>{p.nickname}</p><p style={{color:"#475569",fontSize:10,margin:0}}>{p.share}%</p></div></button>))}</div><div style={{display:"flex",gap:8,marginBottom:14}}>{[["grid","📊 Overview"],["detail","🔍 Deep Dive"]].map(([k,l])=>(<button key={k} onClick={()=>setViewMode(k)} style={{padding:"5px 13px",borderRadius:8,border:`1px solid ${viewMode===k?"#0ea5e9":"#1e293b"}`,background:viewMode===k?"#0ea5e920":"transparent",color:viewMode===k?"#0ea5e9":"#64748b",fontSize:11,cursor:"pointer"}}>{l}</button>))}</div></div>
  {viewMode==="grid"&&(<div style={{display:"flex",flexDirection:"column",gap:14}}><div className="chart-grid-2"><div className="card"><h3 className="card-title">P2O5 Applied by Archetype (kg/ha)</h3><p style={{color:"#475569",fontSize:11,marginBottom:8}}>vs Comifer recommendation: 55 kg/ha</p><ResponsiveContainer width="100%" height={200}><BarChart data={p2o5Chart} layout="vertical" margin={{left:90,right:20}}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false}/><XAxis type="number" domain={[0,60]} tick={{fill:"#64748b",fontSize:9}}/><YAxis type="category" dataKey="name" tick={{fill:"#94a3b8",fontSize:10}} width={90}/><Tooltip content={<CustomTooltip/>}/><ReferenceLine x={55} stroke="#f59e0b80" strokeDasharray="4 4" label={{value:"Rec.",fill:"#f59e0b",fontSize:9}}/><Bar dataKey="value" name="P2O5 kg/ha" radius={[0,4,4,0]}>{p2o5Chart.map((d,i)=><Cell key={i} fill={d.fill}/>)}</Bar></BarChart></ResponsiveContainer></div><div className="card"><h3 className="card-title">Segment Share (%)</h3><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={FARMER_PERSONAS.map(p=>({name:p.nickname,value:p.share,color:p.color}))} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" paddingAngle={2}>{FARMER_PERSONAS.map((p,i)=><Cell key={i} fill={p.color}/>)}</Pie><Tooltip formatter={(v,n)=>[`${v}%`,n]}/></PieChart></ResponsiveContainer><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>{FARMER_PERSONAS.map((p,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:p.color}}/><span style={{color:"#64748b",fontSize:10}}>{p.emoji} {p.share}%</span></div>)}</div></div></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(265px,1fr))",gap:12}}>{FARMER_PERSONAS.map((p,i)=>(<div key={i} onClick={()=>{setActivePersona(p.id);setViewMode("detail");}} style={{background:"#0a0f1a",border:`1px solid ${p.color}20`,borderTop:`3px solid ${p.color}`,borderRadius:12,padding:"14px",cursor:"pointer",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 8px 20px ${p.color}20`;}} onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}><div><span style={{fontSize:22}}>{p.emoji}</span><p style={{color:p.color,fontSize:12,fontWeight:800,margin:"3px 0 1px"}}>{p.nickname}</p><p style={{color:"#475569",fontSize:10,fontStyle:"italic"}}>{p.tagline}</p></div><div style={{textAlign:"right"}}><p style={{color:p.color,fontSize:20,fontWeight:800,fontFamily:"'DM Mono',monospace",margin:0}}>{p.share}%</p><p style={{color:"#475569",fontSize:10}}>of farmers</p></div></div><p style={{color:"#64748b",fontSize:11,lineHeight:1.6,marginBottom:8}}>{p.description.slice(0,110)}…</p><div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#334155",fontSize:10}}>P: <span style={{color:p.color,fontFamily:"'DM Mono',monospace"}}>{p.p2o5KgHa} kg/ha</span></span><span style={{color:"#334155",fontSize:10}}>€{p.fertSpend}/ha</span></div><div style={{display:"flex",gap:3,marginTop:8}}>{[p.priceScore,p.agronomyScore,p.innovationScore,p.sustainScore,p.coopScore].map((s,j)=><div key={j} style={{flex:1,height:4,borderRadius:2,background:`${["#f43f5e","#0ea5e9","#10b981","#a78bfa","#f59e0b"][j]}${Math.round(s/100*255).toString(16).padStart(2,"0")}`}}/>)}</div></div>))}</div></div>)}
  {viewMode==="detail"&&(<div style={{display:"flex",flexDirection:"column",gap:14}}><div style={{background:`linear-gradient(135deg,${persona.color}15,#0a0f1a)`,border:`1px solid ${persona.color}30`,borderRadius:16,padding:"22px"}}><div style={{display:"flex",alignItems:"flex-start",gap:18,flexWrap:"wrap"}}><div style={{fontSize:50}}>{persona.emoji}</div><div style={{flex:1,minWidth:200}}><div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:5}}><h2 style={{color:persona.color,fontSize:20,fontWeight:800,margin:0}}>{persona.nickname}</h2><span style={{padding:"2px 9px",background:persona.color+"25",color:persona.color,borderRadius:20,fontSize:10,fontWeight:700}}>{persona.share}% of French farmers</span></div><p style={{color:"#94a3b8",fontSize:12,fontStyle:"italic",marginBottom:8}}>"{persona.tagline}"</p><p style={{color:"#cbd5e1",fontSize:12,lineHeight:1.8,margin:0}}>{persona.description}</p></div><div style={{background:"#0a0f1a",border:`1px solid ${persona.color}30`,borderRadius:10,padding:"12px 16px",minWidth:180}}><p style={{color:"#64748b",fontSize:10,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>OCP Opportunity</p><p style={{color:"#e2e8f0",fontSize:11,lineHeight:1.7}}>{persona.ocpOpportunity}</p></div></div></div><div className="chart-grid-2"><div className="card"><h3 className="card-title">Behavioral Profile</h3><PersonaRadar persona={persona}/><div style={{display:"flex",flexDirection:"column",gap:5,marginTop:4}}><ScoreBar label="Price Sensitivity"   val={persona.priceScore}     color="#f43f5e"/><ScoreBar label="Agronomy Focus"      val={persona.agronomyScore}  color="#0ea5e9"/><ScoreBar label="Innovation Adoption" val={persona.innovationScore} color="#10b981"/><ScoreBar label="Sustainability"       val={persona.sustainScore}   color="#a78bfa"/><ScoreBar label="Coop Loyalty"         val={persona.coopScore}      color="#f59e0b"/><ScoreBar label="Digital Adoption"     val={persona.digitalScore}   color="#64748b"/></div></div><div style={{display:"flex",flexDirection:"column",gap:10}}><div className="card"><h3 className="card-title">Profile Facts</h3><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>{[["Farm size",persona.farmSize],["Age range",persona.age],["Main region",persona.region],["Tenure",persona.tenure],["Structure",persona.structure],["Channel",persona.channel]].map(([k,v])=>(<div key={k} style={{background:"#0a0f1a",borderRadius:7,padding:"7px 9px"}}><p style={{color:"#475569",fontSize:9,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>{k}</p><p style={{color:"#e2e8f0",fontSize:11,fontWeight:500}}>{v}</p></div>))}</div></div><div className="card"><h3 className="card-title">Fertilizer Decision Logic</h3><div style={{display:"flex",gap:7,marginBottom:6}}><div style={{width:7,height:7,borderRadius:"50%",background:persona.color,flexShrink:0,marginTop:4}}/><div><p style={{color:persona.color,fontSize:10,fontWeight:700,marginBottom:3}}>Driver: {persona.decisionDriver}</p><p style={{color:"#94a3b8",fontSize:11,lineHeight:1.7}}>{persona.fertiliserBehavior}</p></div></div></div></div></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:9}}>{persona.stats.map((s,i)=>(<div key={i} style={{background:"linear-gradient(135deg,#0f172a,#0a1020)",border:`1px solid ${persona.color}18`,borderRadius:9,padding:"11px 13px"}}><p style={{color:"#64748b",fontSize:9,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{s.label}</p><p style={{color:persona.color,fontSize:15,fontWeight:800,fontFamily:"'DM Mono',monospace",margin:0}}>{s.value}</p><p style={{color:"#334155",fontSize:9,marginTop:3}}>{s.note}</p></div>))}</div></div>)}
  </div>);
}

function MIStrategyPage({region}){
  const intel=MARKET_INTEL[region];
  if(!intel)return<MIPlaceholder region={region}/>;
  const compRadar=[{axis:"Price Competitiveness",OCP:72,ICL:65,Yara:55},{axis:"Low Cadmium",OCP:95,ICL:60,Yara:70},{axis:"Carbon Footprint",OCP:80,ICL:55,Yara:65},{axis:"Coop Penetration",OCP:45,ICL:70,Yara:75},{axis:"Agro. Support",OCP:50,ICL:75,Yara:80},{axis:"TSP Capability",OCP:90,ICL:60,Yara:50}];
  return(<div style={{display:"flex",flexDirection:"column",gap:20}}><div className="chart-grid-2"><div className="card"><h3 className="card-title">Competitive Positioning Radar — France</h3><ResponsiveContainer width="100%" height={240}><RadarChart data={compRadar}><PolarGrid stroke="#1e293b"/><PolarAngleAxis dataKey="axis" tick={{fill:"#64748b",fontSize:9}}/><Radar name="OCP" dataKey="OCP" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2}/><Radar name="ICL" dataKey="ICL" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} strokeWidth={1.5}/><Radar name="Yara" dataKey="Yara" stroke="#64748b" fill="#64748b" fillOpacity={0.1} strokeWidth={1.5}/><Legend wrapperStyle={{fontSize:10}}/><Tooltip content={<CustomTooltip/>}/></RadarChart></ResponsiveContainer></div><div style={{display:"flex",flexDirection:"column",gap:12}}>{intel.strategy.slice(0,2).map((item,i)=><InsightCard key={i} item={item}/>)}</div></div><div className="chart-grid-2">{intel.strategy.slice(2).map((item,i)=><InsightCard key={i} item={item}/>)}</div></div>);
}

function MIAgronomyPage({region}){
  const intel=MARKET_INTEL[region];
  if(!intel)return<MIPlaceholder region={region}/>;
  const tagColor={"TSP":{bg:"#0e2a38",text:"#0ea5e9"},"TSP/PK":{bg:"#0e2a38",text:"#0ea5e9"},"DAP":{bg:"#1e1030",text:"#a78bfa"},"PK":{bg:"#0e2218",text:"#10b981"}};
  return(<div style={{display:"flex",flexDirection:"column",gap:20}}><div><h3 style={{color:"#94a3b8",fontSize:11,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Agronomic Insights</h3><div className="chart-grid-2">{intel.agronomy.map((item,i)=><InsightCard key={i} item={item}/>)}</div></div><div className="card"><h3 className="card-title">Crop Agronomy — Current vs Recommended P2O5 (kg/ha)</h3><div style={{display:"flex",flexDirection:"column",gap:11,marginTop:4}}>{intel.cropAgronomy.map((row,i)=>{const gap=row.currentP-row.recP,gapColor=gap>=0?"#10b981":gap>-15?"#f59e0b":"#f43f5e",tc=tagColor[row.product]||{bg:"#1e293b",text:"#94a3b8"};return(<div key={i} style={{background:"#0a0f1a",borderRadius:10,padding:"10px 13px"}}><div style={{display:"flex",alignItems:"center",gap:9,marginBottom:6,flexWrap:"wrap"}}><span style={{color:"#e2e8f0",fontSize:12,fontWeight:600,minWidth:72}}>{row.crop}</span><span style={{padding:"2px 6px",borderRadius:4,fontSize:10,fontWeight:600,background:tc.bg,color:tc.text}}>{row.product}</span><span style={{color:gapColor,fontSize:11,fontFamily:"'DM Mono',monospace",fontWeight:700}}>Gap: {gap>=0?"0":gap} kg/ha</span><span style={{color:"#475569",fontSize:10,marginLeft:"auto"}}>{row.area.toLocaleString()} kha</span></div><div style={{position:"relative",height:7,background:"#1e293b",borderRadius:4,overflow:"hidden",marginBottom:4}}><div style={{position:"absolute",left:0,height:"100%",width:`${(row.recP/100)*100}%`,background:gapColor+"30",borderRadius:4}}/><div style={{position:"absolute",left:0,height:"100%",width:`${(row.currentP/100)*100}%`,background:gapColor,borderRadius:4}}/></div><div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#475569",fontSize:10}}>Current: <span style={{color:gapColor,fontFamily:"'DM Mono',monospace"}}>{row.currentP}</span> kg/ha</span><span style={{color:"#475569",fontSize:10}}>Rec: <span style={{color:"#94a3b8",fontFamily:"'DM Mono',monospace"}}>{row.recP}</span> kg/ha</span></div></div>);})}</div></div></div>);
}

function MIOwnershipPage({region}){
  const [histMode,setHistMode]=useState("farms");
  const intel=MARKET_INTEL[region];
  if(!intel?.ownership)return<MIPlaceholder region={region}/>;
  const own=intel.ownership;
  const histData=own.farmSizeHistogram;
  return(<div style={{display:"flex",flexDirection:"column",gap:20}}><div className="kpi-row">{own.kpis.map((k,i)=><KPICard key={i} {...k}/>)}</div><div className="chart-grid-2"><div className="card"><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><h3 className="card-title" style={{marginBottom:0}}>Farm Size Distribution — France 2020</h3><div style={{display:"flex",gap:5}}>{[["farms","# Farms"],["volume","Fert. Vol"]].map(([k,l])=>(<button key={k} onClick={()=>setHistMode(k)} style={{padding:"3px 9px",borderRadius:6,border:`1px solid ${histMode===k?"#0ea5e9":"#1e293b"}`,background:histMode===k?"#0ea5e920":"transparent",color:histMode===k?"#0ea5e9":"#64748b",fontSize:10,cursor:"pointer"}}>{l}</button>))}</div></div><p style={{color:"#475569",fontSize:11,marginBottom:10}}>{histMode==="farms"?"Farm count (thousands) by size band":"Share of total P2O5 fertilizer volume"}</p><ResponsiveContainer width="100%" height={210}><BarChart data={histData} margin={{left:0,right:10,bottom:10}}><CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/><XAxis dataKey="range" tick={{fill:"#64748b",fontSize:9}} angle={-15} textAnchor="end" height={36}/><YAxis tick={{fill:"#64748b",fontSize:9}}/><Tooltip content={<CustomTooltip/>}/><Bar dataKey={histMode==="farms"?"farms":"fertVolPct"} name={histMode==="farms"?"Farms (k)":"Fert. Vol. %"} radius={[4,4,0,0]}>{histData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar></BarChart></ResponsiveContainer><div style={{background:"#0a1020",border:"1px solid #10b98130",borderRadius:8,padding:"9px 11px",marginTop:8}}><p style={{color:"#64748b",fontSize:11,lineHeight:1.6,margin:0}}>{histMode==="farms"?"The >200 ha segment is 14% of farms but accounts for 38% of total P2O5 volume — the primary commercial target for bulk TSP.":"Farms over 100 ha command 62% of fertilizer volume. This is where precision P programs have the highest commercial impact."}</p></div></div><div className="card"><h3 className="card-title">Land Tenure Structure</h3><ResponsiveContainer width="100%" height={175}><PieChart><Pie data={own.tenure} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3}>{own.tenure.map((d,i)=><Cell key={i} fill={d.color}/>)}</Pie><Tooltip formatter={(v,n)=>[`${v}%`,n]}/></PieChart></ResponsiveContainer><div style={{display:"flex",flexDirection:"column",gap:6,marginTop:6}}>{own.tenure.map((d,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:9}}><div style={{width:9,height:9,borderRadius:2,background:d.color,flexShrink:0}}/><span style={{color:"#94a3b8",fontSize:12,flex:1}}>{d.name}</span><span style={{color:d.color,fontSize:12,fontWeight:700,fontFamily:"'DM Mono',monospace"}}>{d.value}%</span></div>))}</div><p style={{color:"#334155",fontSize:11,marginTop:10,lineHeight:1.6}}>~75% of agricultural land under lease. The 9-year bail rural compresses investment horizons and suppresses long-term soil P building.</p></div></div><div><h3 style={{color:"#94a3b8",fontSize:11,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Structural Implications for Fertilizer Demand</h3><div className="chart-grid-2">{own.implications.map((item,i)=><InsightCard key={i} item={item}/>)}</div></div></div>);
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const [hasEntered,setHasEntered]=useState(false);
  const [section,    setSection]   =useState("quant");
  const [quantPage,  setQuantPage] =useState("overview");
  const [intelPage,  setIntelPage] =useState("dynamics");
  const [crop,       setCrop]      =useState("Wheat");
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [savedScenarios,setSavedScenarios]=useState([{name:"France Wheat Baseline",region:"France",crop:"Wheat"},{name:"France Rapeseed Sep.",region:"France",crop:"Rapeseed"}]);
  const [scenarioName,setScenarioName]=useState("");

  const region="France"; // locked to France

  const quantPages=[{key:"overview",label:"Overview",short:"Overview"},{key:"simulator",label:"Simulator",short:"Simulator"},{key:"pl",label:"P&L",short:"P&L"},{key:"agronomy",label:"Agronomy",short:"Agronomy"},{key:"insights",label:"Insights",short:"Insights"}];
  const intelPages=[{key:"dynamics",label:"Market Dynamics",short:"Dynamics"},{key:"farmer",label:"Farmer Behavior",short:"Behavior"},{key:"strategy",label:"Strategic Outlook",short:"Strategy"},{key:"agronomy",label:"Agronomic Insights",short:"Agronomy"},{key:"ownership",label:"Farm Ownership",short:"Ownership"},{key:"regions",label:"Regional Analysis",short:"Regions"}];

  const subPages   =section==="quant"?quantPages:intelPages;
  const activePage =section==="quant"?quantPage:intelPage;
  const setPage    =section==="quant"?setQuantPage:setIntelPage;
  const isOverview =section==="quant"&&quantPage==="overview";
  const availableCrops=[...new Set(SAMPLE_DATA.filter(d=>d.region===region).map(d=>d.crop))];
  const secColor   =section==="quant"?"#0ea5e9":section==="intel"?"#10b981":"#a78bfa";

  const saveScenario=()=>{
    if(!scenarioName)return;
    setSavedScenarios(s=>[...s,{name:scenarioName,region,crop}]);
    setScenarioName("");
  };

  if(!hasEntered) return <LandingPage onEnter={()=>setHasEntered(true)}/>;

  return(
    <div style={{minHeight:"100vh",background:"#060d1a",color:"#e2e8f0",fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
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

      {/* HEADER */}
      <div style={{borderBottom:"1px solid #1e293b",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:50,background:"#0a0f1a",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#0ea5e9,#0369a1)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:11,color:"#fff",fontFamily:"'DM Mono',monospace",boxShadow:"0 0 10px #0ea5e940",flexShrink:0}}>SMO</div>
          <div>
            <span style={{fontWeight:800,fontSize:14,letterSpacing:"-0.03em",color:"#f1f5f9"}}>PhosStratOS</span>
            <span style={{color:"#334155",fontSize:11,marginLeft:8}} className="sec-label-full">P Separation Intelligence</span>
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {/* France locked + Turkey coming soon */}
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{background:"#1e293b",border:"1px solid #0ea5e940",borderRadius:6,padding:"6px 12px",display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"#10b981",boxShadow:"0 0 6px #10b981"}}/>
              <span style={{color:"#e2e8f0",fontSize:12,fontWeight:600}}>France</span>
            </div>
            <div style={{background:"#1e293b",border:"1px solid #334155",borderRadius:6,padding:"6px 12px",display:"flex",alignItems:"center",gap:6,opacity:0.5}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"#f59e0b"}}/>
              <span style={{color:"#64748b",fontSize:12}}>Turkey</span>
              <span style={{background:"#f59e0b20",color:"#f59e0b",fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:10,border:"1px solid #f59e0b40"}}>SOON</span>
            </div>
          </div>
          {section==="quant"&&!isOverview&&<select value={crop} onChange={e=>setCrop(e.target.value)}>{availableCrops.map(c=><option key={c}>{c}</option>)}</select>}
          {section!=="atlas"&&<button onClick={()=>setSidebarOpen(o=>!o)} style={{background:"#1e293b",border:"1px solid #334155",color:"#94a3b8",padding:"6px 10px",borderRadius:6,fontSize:18,cursor:"pointer",lineHeight:1}}>☰</button>}
        </div>
      </div>

      {/* SECTION SWITCHER */}
      <div style={{background:"#080e1a",borderBottom:"1px solid #1e293b",padding:"0 16px",display:"flex",alignItems:"center",overflowX:"auto"}}>
        {[{key:"quant",icon:"⚙",full:"Quantitative Engine",short:"Quant",color:"#0ea5e9"},{key:"intel",icon:"◎",full:"Market Intelligence",short:"Intel",color:"#10b981"}].map(s=>(<button key={s.key} onClick={()=>setSection(s.key)} style={{padding:"11px 16px",background:"transparent",border:"none",borderBottom:section===s.key?`2px solid ${s.color}`:"2px solid transparent",color:section===s.key?"#f1f5f9":"#475569",fontSize:12,fontWeight:section===s.key?700:400,cursor:"pointer",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap"}}><span style={{color:section===s.key?s.color:"#334155"}}>{s.icon}</span><span className="sec-label-full">{s.full}</span><span className="sec-label-short">{s.short}</span></button>))}
        <button onClick={()=>setSection("atlas")} style={{marginLeft:"auto",padding:"11px 16px",background:"transparent",border:"none",borderBottom:section==="atlas"?"2px solid #a78bfa":"2px solid transparent",color:section==="atlas"?"#f1f5f9":"#475569",fontSize:12,fontWeight:section==="atlas"?700:400,cursor:"pointer",display:"flex",alignItems:"center",gap:6,whiteSpace:"nowrap"}}><span style={{color:section==="atlas"?"#a78bfa":"#334155"}}>◈</span>ATLAS<span style={{padding:"1px 6px",borderRadius:20,fontSize:9,fontWeight:700,background:"#a78bfa20",color:"#a78bfa",border:"1px solid #a78bfa40"}}>AI</span></button>
      </div>

      {section==="atlas"&&<ATLASPage/>}

      {section!=="atlas"&&(<>
        <div className="subnav">{subPages.map(p=>{const active=activePage===p.key;return<button key={p.key} onClick={()=>setPage(p.key)} style={{padding:"8px 14px",background:"transparent",border:"none",borderBottom:active?`2px solid ${secColor}`:"2px solid transparent",color:active?secColor:"#64748b",fontSize:12,fontWeight:active?600:400,cursor:"pointer",whiteSpace:"nowrap"}}>{p.short}</button>;})}</div>
        <div style={{display:"flex",minHeight:"calc(100dvh - 130px)"}}>
          <div className="page-content" style={{flex:1,padding:20,overflow:"auto",minWidth:0}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,flexWrap:"wrap"}}>
              <SectionBadge label={section==="quant"?"Quantitative Engine":"Market Intelligence"} color={secColor}/>
              <h1 style={{fontSize:16,fontWeight:800,color:"#f1f5f9",letterSpacing:"-0.02em"}}>{subPages.find(p=>p.key===activePage)?.label}</h1>
              <span style={{color:"#334155",fontSize:12}}>{isOverview?`all crops · ${region}`:section==="intel"?region:`${crop} · ${region}`}</span>
            </div>

            {section==="quant"&&quantPage==="overview"  &&<OverviewPage  data={SAMPLE_DATA} region={region}/>}
            {section==="quant"&&quantPage==="simulator" &&<SimulatorPage data={SAMPLE_DATA} region={region} crop={crop}/>}
            {section==="quant"&&quantPage==="pl"        &&<PLPage        data={SAMPLE_DATA} region={region} crop={crop}/>}
            {section==="quant"&&quantPage==="agronomy"  &&<AgronomyPage  data={SAMPLE_DATA} region={region} crop={crop}/>}
            {section==="quant"&&quantPage==="insights"  &&<InsightsPage  data={SAMPLE_DATA} region={region} crop={crop}/>}

            {section==="intel"&&intelPage==="dynamics"  &&<MIMarketDynamicsPage region={region}/>}
            {section==="intel"&&intelPage==="farmer"    &&<MIFarmerBehaviorPage/>}
            {section==="intel"&&intelPage==="strategy"  &&<MIStrategyPage       region={region}/>}
            {section==="intel"&&intelPage==="agronomy"  &&<MIAgronomyPage       region={region}/>}
            {section==="intel"&&intelPage==="ownership" &&<MIOwnershipPage      region={region}/>}
            {section==="intel"&&intelPage==="regions"   &&<RegionalPage/>}
          </div>

          <div className={`sidebar-overlay ${sidebarOpen?"open":""}`} onClick={()=>setSidebarOpen(false)}/>
          <div className={`app-sidebar ${sidebarOpen?"open":""}`}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h3 style={{color:"#64748b",fontSize:10,textTransform:"uppercase",letterSpacing:"0.1em"}}>Saved Scenarios</h3>
              <button onClick={()=>setSidebarOpen(false)} style={{background:"transparent",border:"none",color:"#475569",fontSize:16,cursor:"pointer"}}>✕</button>
            </div>
            {savedScenarios.map((s,i)=>(<div key={i} onClick={()=>{setCrop(s.crop);setSidebarOpen(false);}} style={{padding:"8px 10px",borderRadius:6,marginBottom:6,cursor:"pointer",background:crop===s.crop?"#1e293b":"transparent",border:"1px solid transparent"}} onMouseEnter={e=>e.currentTarget.style.borderColor="#334155"} onMouseLeave={e=>e.currentTarget.style.borderColor="transparent"}><p style={{color:"#94a3b8",fontSize:12,fontWeight:500}}>{s.name}</p><p style={{color:"#475569",fontSize:10,marginTop:2}}>{s.crop} · {s.region}</p></div>))}
            <div style={{marginTop:14,borderTop:"1px solid #1e293b",paddingTop:14}}>
              <input value={scenarioName} onChange={e=>setScenarioName(e.target.value)} placeholder="Scenario name..." style={{width:"100%",background:"#1e293b",border:"1px solid #334155",borderRadius:6,padding:"6px 8px",color:"#e2e8f0",fontSize:12,marginBottom:8,outline:"none"}}/>
              <button onClick={saveScenario} style={{width:"100%",background:"#0ea5e910",border:"1px solid #0ea5e940",color:"#0ea5e9",padding:"7px",borderRadius:6,fontSize:12,cursor:"pointer"}}>+ Save Current</button>
            </div>
            <div style={{marginTop:16,borderTop:"1px solid #1e293b",paddingTop:14}}>
              <button onClick={()=>{setSection("atlas");setSidebarOpen(false);}} style={{width:"100%",background:"#a78bfa10",border:"1px solid #a78bfa30",color:"#a78bfa",padding:"8px",borderRadius:8,fontSize:12,cursor:"pointer"}}>◈ Open ATLAS</button>
            </div>
          </div>
        </div>
      </>)}
    </div>
  );
}
