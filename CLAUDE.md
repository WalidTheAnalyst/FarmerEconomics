# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Dev server at http://localhost:3000
npm test         # Run tests (Jest, watch mode)
npm run build    # Production build
```

No linting script is configured beyond CRA's built-in ESLint (`extends: ["react-app", "react-app/jest"]`). ESLint runs automatically during `npm start` and `npm run build`.

## Architecture

**PhosStratOS** is a client-side-only React SPA (Create React App) — a strategic phosphate fertilizer decision tool for OCP. No backend, no API server; all computation runs in the browser.

### Two-file structure

- **`src/App.js`** (~1,640 lines) — monolithic: data constants, computation engine, all UI pages and sub-components combined in one file.
- **`src/ATLAS.js`** (~860 lines) — standalone AI phosphorus advisor component with voice I/O and a canvas-rendered animated face; calls the Claude API directly from the browser (`anthropic-dangerous-direct-browser-access`).

### Routing (state-driven, no React Router)

`App` holds `page` and `country` state. Navigation is done by calling `setPage()`/`setCountry()`:

```
Landing → CountrySelector → Dashboard
                             ├─ FranceHub (tabbed: QuantEngine / Regional / Archetypes)
                             └─ BrazilPage
```

### France module

Static data (`REGIONAL_DATA`, `FARMER_PERSONAS`, `YEARS`) is hardcoded in App.js. Pages are presentational with `recharts` visualizations — no user-editable inputs except `MathieuFarmPage`, which has an interactive farm cost simulator.

### Brazil module (`BrazilPage`)

Pure functional computation engine with three entry points:

| Function | Purpose |
|---|---|
| `buildBrazilBaseline(regionId, cropId, sizeId)` | Initialize farm economics from `BRAZIL_ECON` constants |
| `computeFertCost(mix)` | Sum fertilizer cost for a given product mix |
| `computeNutrients(mix)` | Sum N/P₂O₅/K₂O delivered by a mix |
| `computeBrazilPnL(baseline)` | Full P&L: revenue, fert cost, other costs, net income |

User edits to the fertilizer mix or cost drivers feed into `useMemo`-wrapped `computeBrazilPnL` calls; results drive all charts. Up to 4 named scenarios can be saved and compared side-by-side.

### ATLAS AI advisor

- Model: `claude-sonnet-4-20250514` via direct browser call
- Voice input: Web Speech API (`SpeechRecognition`)
- Voice output: Web Speech Synthesis (prefers 9 specific English voices)
- Canvas animation: state-driven face (`idle | listening | thinking | speaking`)
- Tool use: web search (max 1 use) when live data is requested

### Charting

All charts use `recharts`. The pattern throughout is: derive a data array → pass to a `recharts` chart with custom `CustomTooltip`. No global chart config; each chart is configured inline.
