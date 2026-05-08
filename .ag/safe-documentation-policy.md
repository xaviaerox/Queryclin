# Safe Documentation Policy - Queryclin

## 1. Goal
To ensure that all documentation (READMEs, Wikis, AI Contexts, Comments) is safe for public exposure and AI indexing.

## 2. General Principles
- **Fictitious Examples:** Use only "John Doe", "Jane Smith", or "Patient Zero" in examples.
- **Generic Mocks:** Reference synthetic datasets, never real file structures from clinical environments.
- **Abstract Institutions:** Instead of "General Hospital of X", use "Health Center Alpha" or "Mock Clinic".
- **Avoid Internal Architectures:** Do not document the specific internal network topology of the hospital where this might be deployed.

## 3. Visual Content
- Screenshots must be taken using **Demo Mode** or with explicitly mock data loaded.
- Blur or mask any accidental identifiers before uploading.
- Prefer diagrams (Mermaid, Excalidraw) over screenshots of real interfaces when possible.

## 4. AI-Safe Documentation
- When providing context to AI agents (like Antigravity), ensure the provided snippets do not contain hardcoded secrets or sensitive URLs.
- AI-generated documentation must be reviewed to ensure it hasn't "hallucinated" real-world references from the training data into the project context.
