# Incident Response - Queryclin

## 1. What is a Security Incident?
An incident includes, but is not limited to:
- Accidental publication of real clinical data (PII).
- Accidental publication of a secret (API Key, Credential).
- Discovery of a vulnerability that allows data exfiltration.

## 2. Immediate Action (The "Stop-Bleed" Protocol)
If you discover sensitive data has been pushed to the repository:
1. **Force Delete:** Remove the sensitive file in a new commit.
2. **Alert:** Notify the repository owner/maintainer immediately.
3. **Revoke:** If a secret was leaked (e.g., an API Key), revoke it **instantly**.

## 3. History Purge
Deleting a file in a new commit is NOT enough. The history must be purged:
1. Use `git filter-repo` or `BFG Repo-Cleaner` to remove the sensitive object from all commits.
2. Force push the cleaned history to `main` (and any other affected branches).
3. Notify anyone who might have forked the repository that a security purge has occurred.

## 4. Communication
- **Transparency:** If clinical data was exposed, follow legal requirements for data breach notification (GDPR/HIPAA).
- **Update:** Document the incident (without repeating the sensitive data) and update this policy to prevent recurrence.
