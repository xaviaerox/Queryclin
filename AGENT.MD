# Agent Context: Queryclin (V5.3.0) 🚀

## 🎯 Project Goal
Build a professional, private, Local-First clinical search engine capable of handling 100,000+ records (HCE) with millisecond response times using IndexedDB and Okapi BM25. Now featuring a specialized Semantic Engine with structural context.

## 🚀 Current Status: Fase 28 (Refactor Semántico y Búsqueda Estructural)
The project has reached a level of industrial and public maturity with the following latest features:
- **Semantic Processor**: Unified source of truth for clinical tokenization, stemming, and synonym expansion.
- **Structural Search Index**: Posts now contain categorical context ('c'), enabling O(1) filtering.
- **Post-Score Field Boosting**: Dynamic relevance multipliers based on clinical section (Diagnosis, Background).
- **Public Repository Hardening**: Full governance ecosystem for secure public exhibition.
- **Security Suite**: Dedicated security policies, incident response plans, and data policies.
- **Controlled Export (XLSX)**: "Last Intake" mode for consolidated clinical reporting.

## 🛠️ Technical Stack
- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS 4.
- **Storage**: IndexedDB (with fragmenting/sharding for >100k records).
- **Engine**: 
    - **BM25 Scoring**: For professional-grade relevance.
    - **Structural Indexing**: Context-aware postings for instant filtering.
    - **Clinical Semantic Layer**: Whitelist-based stemming and synonym mapping.
    - **Web Workers**: For parallel, non-blocking ingestion.
- **Architecture**: Clean Architecture (Core, Engine, Ingestion, Storage, Utils).
- **Security**: Local-First, Privacy-by-Design, PHI-blocked by .gitignore.

## ⚔️ Battle Log (Latest Challenges)
- **Hydration Bottleneck**: Eliminating the need to load full patient objects for filtering by moving categorical metadata to the inverted index.
- **Semantic Consistency**: Syncing search logic with UI highlighting via a shared Regex generator.
- **Field Boosting Balance**: Implementing relevance weights post-BM25 to avoid Term Frequency distortion.

## 📋 Immediate Tasks
- [x] Implement Semantic Engine and Structural Filtering (V5.3.0).
- [x] Eliminate massive hydration in search results.
- [x] Create comprehensive governance ecosystem (`.ag/`, `/security/`).
- [ ] Implement Semantic Search with Transformers.js (Next Step).
- [ ] AI-Generated Clinical Summaries (Future).

## 📜 Governance
- Follow **RULES.md** and **/.ag/** policies strictly.
- Update **CHANGELOG.md** and **TASKS.md** after every change.
- Maintain **BATTLE_LOG.md** for critical technical decisions.
- **NEVER** include real patient data (PHI) in the repository. Use Mocks only.
