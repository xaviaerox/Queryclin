# Safe Contributing Guide - Queryclin

## 1. Introduction
Welcome to Queryclin! To maintain our status as a public, clinical-grade tool, we require all contributors to follow these safety rules.

## 2. What NOT to Submit
- **No Private Data:** Never include real patient data in your PRs.
- **No Institutional Context:** Do not include references to your specific hospital or workplace's internal systems.
- **No Secrets:** Do not include API keys, internal URLs, or credentials.

## 3. How to Anonymize
If you need to report a bug that requires a specific data structure:
1. Create a **Synthetic Mock** that mimics the structure but contains 100% fake data.
2. Verify the bug is reproducible with the mock.
3. Submit the mock as part of a test case or in the `src/assets/mocks/` folder.

## 4. Pull Request Requirements
Every PR must pass the following check:
- "I have verified that no real clinical data, hospital secrets, or private network information is included in this contribution."

## 5. Security Reviews
All PRs will be reviewed not just for code quality, but for **information leakage**. PRs that fail this check will be closed immediately.
