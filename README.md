# CODEBASE.UNIVERSE

> **The Playable Architectural Simulation Engine for Software Repositories.**
> *Transforming static dependency analysis into a living, interactive architectural sci-fi simulation.*

---

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CODEBASE.UNIVERSE v2.5                             │
│                  THE ARCHITECTURAL SIMULATION ENGINE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ TOP BAR ]      Entities: 568 | Edges: 1,520 | Risk: 37% | Rank: Senior  │
│                                                                             │
│  [ LEFT DOCK ]    [ 2.5D PROCEDURAL ARCHITECTURAL CANVAS ]     [ RIGHT DOCK]│
│  • Search & Layer • Procedural buildings scaled to LOC/Centrality • Layered │
│  • Biomes (8)     • Energy Conduits with live packet flow     Inspector     │
│  • Tactical Radar • Follow the Flow & Trace Path Navigator    [Tabs: Arch,  │
│                                                               Deps, Sim]    │
│  [ CONTEXTUAL OPERATION CONSOLE - ONE ACTIVE OPERATIONAL DECK AT A TIME ]   │
│  [01 WORLD]  [02 CODEDEX 61%]  [03 QUESTS 06]  [04 THREATS 10]  [05 SIM]    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Overview

**CODEBASE.UNIVERSE** is a next-generation software architecture intelligence tool. Instead of presenting static node-link graphs that get abandoned after two minutes, it transforms repositories into **procedural living worlds** where every visual element directly encodes real code metrics.

It combines rigorous static graph analysis (Betweenness Centrality, PageRank, Tarjan's SCC Cycle Detection, Martin's Instability Metric) with procedural vector rendering, execution flow tracing, what-if blast radius simulation, and interactive onboarding quests.

---

## Quick Start (Instant CLI)

Launch CODEBASE.UNIVERSE on any local repository in seconds with zero configuration:

```bash
# Run directly inside any repository folder
npx codebase-universe .

# Or specify a target directory and custom port
npx codebase-universe ./my-project --port 5173
```

Zero code leaves your local machine. The AST parsing, dependency graph extraction, and topological calculations execute 100% in local memory.

### Local Development Setup

```bash
# Clone repository
git clone https://github.com/luisrodriguez-rgb/CODEBASE.UNIVERSE.git
cd CODEBASE.UNIVERSE

# Start development server
npm install
npm run dev

# Open in browser
# http://localhost:5173
```

---

## Core Systems & Features

### 1. Procedural Metric-Driven Building Silhouettes
Every file and module is rendered as an architectural vector landmark whose physical dimensions represent source metrics:
- **Building Height & Spire:** Proportional to Lines of Code (`LOC`) and cyclomatic mass.
- **Base Width & Orbital Rings:** Proportional to inbound callers (`Fan-In`).
- **Pulsing Core Glow:** Proportional to Betweenness Centrality (`Centrality %`).
- **Hazard Warning Beacons:** Crimson rotating shields on circular feedback cycles (`SCC`).

### 2. 4-Tier Hierarchical Semantic Zoom
Navigate smoothly from the macro galaxy overview down to internal functions:
- **Scale 1 (0.04x - 0.40x) // Galaxy View:** Subsystem territories, macro energy conduits, and global health.
- **Scale 2 (0.40x - 1.20x) // World View:** Domain districts and primary module buildings.
- **Scale 3 (1.20x - 3.50x) // Architecture View:** Individual source files, classes, and caller/dependency links.
- **Scale 4 (3.50x - 15.0x) // Code View:** Internal functions, methods, and execution signatures.

### 3. Visual Execution Tools
- **`[ FOLLOW EXECUTION FLOW ]`:** Select any node to trigger an autonomous camera flight along the downstream call chain, lighting up conduits with moving data packets.
- **`[ TRACE PATH GPS ]`:** Select an Origin module and a Destination module (e.g. `Client Router -> Database Vault`). The engine computes the shortest Dijkstra dependency path and isolates the route on the tactical canvas.

### 4. Layered Entity Inspector
Progressive disclosure interface avoiding dashboard fatigue:
- **`[ ARCHITECTURE ]`:** Centrality %, Fan-In, Fan-Out, LOC, and architectural role diagnosis.
- **`[ DEPENDENCIES ]`:** Interactive list of direct callers and outgoing dependencies.
- **`[ SIMULATION ]`:** Instant triggers for What-If cascade blackout and refactor decoupling.

### 5. Threat Arena & Refactor Strategy Simulator
Pinpoints architectural monoliths (*The Death Star*, *The Cyclic Wormhole*) and simulates 4 non-destructive decoupling strategies:
- `[ BREAK CYCLE ]`: Sever cyclical feedback loops.
- `[ SPLIT MODULE ]`: Divide monolithic modules into core vs worker sub-services.
- `[ INTRODUCE INTERFACE ]`: Invert dependencies via abstract adapter boundaries.
- `[ ISOLATE ]`: Encapsulate as standalone micro-kernel.
- Computes before-and-after risk reduction and blast footprint reduction in real time.

### 6. What-If Impact Laboratory
Analyze cascade failure propagation across 4 explicit scenarios:
- `[ REMOVE ]`: Total module failure / deletion.
- `[ ISOLATE ]`: Micro-kernel decoupling.
- `[ REFACTOR ]`: Halving coupling load.
- `[ MOVE ]`: Subsystem relocation.
- Displays affected files, casualty log, and triggers visual shockwave blackouts across the canvas.

### 7. Code Detective & Architectural Lessons
Procedural incident room cases generated from topology. Interrogate suspects to find the root cause module of architectural anomalies, unlocking formal **Architectural Lessons** covering design principles (DIP, SRP, God Object decoupling).

### 8. Git Time Machine & Code Archaeology
- **Timeline Evolution:** Step through repository commit generations to watch the architecture grow.
- **Archaeology Relics:** Automatically detects fossil code:
  - `[DEAD CODE]`: Orphaned modules with zero incoming and outgoing calls.
  - `[ABANDONED API]`: Consumes dependencies but is never called by other subsystems.
  - `[HISTORICAL CORE]`: Pillar modules unchanged across multiple releases.
  - `[CYCLIC REMNANT]`: Legacy feedback loops persisted across versions.

### 9. Live Architectural Events Ticker
Real-time tactical notification toast that emits live alerts on hotspot surges, circular anomalies, and core discoveries. Clicking any notification immediately centers the camera on the target.

### 10. Bilingual Engine & Web Audio Procedural Synthesizer
- Complete real-time **English (EN) / Spanish (ES)** live UI translation.
- Zero-dependency Web Audio API procedural sound synthesizer for tactile terminal clicks, discovery chimes, victory fanfares, and alarms.

---

## Architectural Biomes

| Biome | Domain Representation | Visual Silhouette | Color |
| :--- | :--- | :--- | :--- |
| **Core Citadel** | Central Orchestration & Execution Pipeline | Command Sun with Orbiting Spires | Cyan / Blue |
| **UI Metropolis** | Components, Viewports, Templates & Themes | Step-Tiered Glowing Skyscrapers | Amber / Orange |
| **Power Grid** | State Stores, Action Dispatchers & Event Bus | Diamond Capacitor Circuit Junction | Emerald Green |
| **Data Bunker** | Databases, Storage Engines & Persistence Vaults | Fortified Storage Silo | Deep Cobalt |
| **Transmission Hub** | APIs, Network Gateways & Protocols | Parabolic Satellite Radar Array | Bright Cyan |
| **Research Labs** | Test Suites, Mocks & Benchmarks | Geodesic Testing Domes | Purple / Violet |
| **Hazard Zone** | High Risk Hotspots & Circular Feedback Loops | Hexagonal Threat Fortress | Crimson / Rose |
| **Forgotten Ruins** | Dead Code & Deprecated Utilities | Weathered Broken Monoliths | Slate Grey |

---

## Universal Indexing Engine

The built-in parser (`src/indexer/astParser.js` and `src/indexer/localScanner.js`) extracts architectural graphs from real codebases:

- **Supported Languages:** JavaScript, TypeScript, JSX/TSX, Python, Go, Rust, Java, C++, JSON.
- **Ignored Directories:** `node_modules`, `.git`, `dist`, `build`, `target`, `vendor`, `__pycache__`, `.next`.
- **Topological Analysis:**
  - Betweenness Centrality (Brandes' Algorithm)
  - PageRank (Global Importance Percentiles)
  - Strongly Connected Components (Tarjan's SCC)
  - Martin's Instability Coefficient ($I = \frac{Ce}{Ca + Ce}$)
  - Cyclomatic Mass & LOC

---

## Keyboard & Navigation Controls

| Action | Control |
| :--- | :--- |
| **Pan Canvas** | `W` `A` `S` `D` / Arrow Keys / Click & Drag |
| **Exponential Zoom** | Mouse Wheel / Trackpad Pinch / `+` `-` Buttons |
| **Focus & Center** | Double-Click on any node |
| **Reset View** | `R` Key / Reset Button |
| **CodeDex** | `C` Key |
| **Quests & Incidents** | `Q` Key |
| **Threat Arena** | `T` Key |
| **Time Machine** | `H` Key |
| **Trace Path GPS** | `[>] TRACE PATH` Button |
| **Language Switch** | `EN / ES` Toggle Button |
| **Sound Toggle** | `SFX: ON/OFF` Button |

---

## License

MIT License. Developed by Luis Felipe Rodriguez.
