# Agent Context: Queryclin (V5.2.0) 🚀

## 🎯 Project Goal
Build a professional, private, Local-First clinical search engine capable of handling 100,000+ records (HCE) with millisecond response times using IndexedDB and Okapi BM25. Now evolving into a public-facing secure repository.

## 🚀 Current Status: Fase 27 (Debug Mode y Refinamiento de Taxonomía)
The project has reached a level of industrial and public maturity with the following latest features:
- **Public Repository Hardening**: Full governance ecosystem for secure public exhibition.
- **Security Suite**: Dedicated security policies, incident response plans, and data policies.
- **Controlled Export (XLSX)**: New "Last Intake" mode for consolidated clinical reporting.
- **AI-First Governance**: Directory `/.ag` for structured agent guidance and safety.
- **Native XLSX Support**: Ingest directly from Excel sheets.
- **3-Step Ingest Assistant**: Simplified UX for clinical staff.
- **Ubiquitous Search**: Integrated in the header for global access.
- **Deterministic Field Order**: Forced visual structure based on official mappings.
- **High-Fidelity Rendering**: Multi-value field support ($) and hierarchical HCE-OBS taxonomy.

## 🛠️ Technical Stack
- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS 4.
- **Storage**: IndexedDB (with fragmenting/sharding for >100k records).
- **Engine**: 
    - **BM25 Scoring**: For professional-grade relevance.
    - **Clinical Synonym Mapper**: 23+ patologies mapped.
    - **Web Workers**: For parallel, non-blocking ingestion.
- **Architecture**: Clean Architecture (Core, Engine, Ingestion, Storage, Utils).
- **Security**: Local-First, Privacy-by-Design, PHI-blocked by .gitignore.

## ⚔️ Battle Log (Latest Challenges)
- **PII Leak Prevention**: Hardening .gitignore and implementing PR templates with security checklists.
- **Hierarchy Mapping**: Implementing complex `Category > Subcategory` logic for HCE-OBS.
- **Build Date Automation**: Injecting `__BUILD_DATE__` via Vite to eliminate manual versioning debt.
- **Legacy Encodings**: Robust support for CP850 and ISO-8859-1 for old hospital systems.

## 📋 Immediate Tasks
- [x] Implement deterministic field ordering and smart paragraph formatting.
- [x] Create comprehensive governance ecosystem (`.ag/`, `/security/`).
- [x] Implement controlled "Last Intake" export mode.
- [x] Synchronize all project documentation (README, CHANGELOG, TASKS).
- [ ] Implement Semantic Search with Transformers.js (Next Step).
- [ ] AI-Generated Clinical Summaries (Future).

## 📜 Governance
- Follow **RULES.md** and **/.ag/** policies strictly.
- Update **CHANGELOG.md** and **TASKS.md** after every change.
- Maintain **BATTLE_LOG.md** for critical technical decisions.
- **NEVER** include real patient data (PHI) in the repository. Use Mocks only.
