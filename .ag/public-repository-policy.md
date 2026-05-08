# Public Repository Policy - Queryclin

## 1. Nature of the Repository
This repository is **PUBLIC**. All content, including code, documentation, issues, and pull requests, is:
- Globally visible.
- Indexable by search engines.
- Subject to automated scraping and analysis by external AIs.
- Available for external forks and cloning.

## 2. Fundamental Assumption
**"Any file committed to this repository can and will be read publicly."**
There is no "private" space within this GitHub repository. Never assume that a branch, a draft PR, or a deleted file (which remains in history) is private.

## 3. Strict Prohibitions
To maintain clinical privacy and operational security, the following are strictly prohibited:
- **No Sensitive Documentation:** Never document internal hospital infrastructure, private VPN addresses, or internal network routes.
- **No Real Examples:** Never upload or reference real clinical cases, patient names, or hospital IDs.
- **No Secrets:** No API keys, tokens, or credentials of any kind.
- **No Production Logs:** Never upload logs that may contain traces of real clinical activity.

## 4. Fork Awareness
External forks are inevitable and encouraged for open-source collaboration. However, this means any sensitive data mistakenly committed is instantly replicated across the network. Security is a pre-requisite for every commit.
