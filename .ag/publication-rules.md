# Publication Rules - Queryclin

## 1. Pre-Commit Checklist
Before every `git commit`, the author must verify:
- [ ] **No Sensitive Data:** No real clinical data or identifiers.
- [ ] **No Secrets:** No `.env`, tokens, or keys.
- [ ] **No Logs:** No debugging logs or execution traces with sensitive info.
- [ ] **No Temporaries:** No `*.tmp`, `*.bak`, or `*.swp` files.
- [ ] **Clean Assets:** Images and PDFs are strictly mock-based.

## 2. Pre-Release Review
Before tagging a release (or pushing to `main`):
- Scan for accidental exposures of internal URLs.
- Verify that `dist/` or `build/` artifacts do not contain development-only sensitive configs.
- Check `.gitignore` effectiveness.

## 3. Deployment Safety (GitHub Pages)
- Ensure that the deployed version does not include "dev-only" clinical mocks that might be too close to real data.
- The `index.html` and assets must be clean of any institutional branding not authorized for public release.

## 4. Automation
Whenever possible, use pre-commit hooks to scan for secrets and common sensitive patterns (PII).
