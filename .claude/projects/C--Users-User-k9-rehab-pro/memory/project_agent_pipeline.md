---
name: Multi-agent clinical pipeline architecture
description: 5-agent orchestrated rehab protocol generation pipeline using Claude Sonnet 4.6 - ready for integration
type: project
---

User has built a multi-agent pipeline (ESM modules, Anthropic SDK) in Downloads folder, ready to integrate into the backend.

**Pipeline flow:** Patient Intake → Orchestrator (context brief) → 4 parallel sub-agents → Assembler → Final Plan

**Agents:**
- `orchestratorAgent.js` — coordinator, builds context brief, fans out, merges results
- `breedResearchAgent.js` — breed biomechanics, recovery modifiers
- `protocolLookupAgent.js` — matches to `approvedProtocols.json`
- `contraindicationAgent.js` — safety gating (hard rules + LLM), blocks unsafe plans
- `exerciseSequencerAgent.js` — phased week-by-week exercise plan
- `assemblerAgent.js` — final plan: vet summary, client summary, progress tracker, PDF sections

**Key details:**
- All agents use `claude-sonnet-4-6`
- Reads from `approvedProtocols.json` (needs to be created/mapped from existing exercise data)
- Uses ESM imports (import/export), not CommonJS
- Contraindication `safe: false` gates delivery — requires vet review
- Assembler produces: planId, vetSummary, clientSummary, progressTracker, pdfSections, pushNotification

**Why:** This is the core intelligence that will impress Mars Petcare — it's the production-grade replacement for the current single-endpoint protocol generator.

**How to apply:** These agents need to be integrated into the backend, with a new API route and the UI updated to show the richer output (progress tracker, vet/client summaries).

**Source files:** `C:\Users\User\Downloads\` — orchestratorAgent.js, breedResearchAgent.js, protocolLookupAgent.js, contraindicationAgent.js, exerciseSequencerAgent.js, assemblerAgent.js
