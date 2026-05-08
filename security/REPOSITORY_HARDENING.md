# Repository Hardening - Queryclin

## 1. Preventive Measures
- **Strict .gitignore:** Our `.gitignore` is designed to fail-safe, blocking common sensitive extensions (`.xlsx`, `.csv`, `.db`, `.env`) by default.
- **Pre-push Reviews:** Developers are encouraged to perform a manual diff review before every push.
- **No Sensitive Branches:** Even temporary branches must be clean. Do not push "debug" or "work-in-progress" branches that contain real data.

## 2. Commit Hygiene
- **Squash Commits:** When merging PRs, prefer squashing to reduce the footprint of potential accidental commits that were corrected in later patches.
- **History Auditing:** Periodically audit the git history for patterns resembling secrets or PII (Personally Identifiable Information).

## 3. Asset Protection
- Images must be compressed and stripped of EXIF metadata.
- PDF assets must be generated from scratch, never "edited" from real hospital PDFs (to avoid hidden metadata).

## 4. Automation & Tools
- Recommended tool for local scanning: `gitleaks` or `trufflehog`.
- GitHub Actions should include a secret scanning step (if available for the repository type).
