# Data Policy - Queryclin

## 1. Accepted Data (Clean Zone)
The following data types are permitted in the repository:
- **Application Logic:** HTML, CSS, JS/TS code.
- **Mock Datasets:** Synthetic clinical data explicitly created for testing (e.g., `src/assets/mocks/`).
- **Anonymized Configs:** Generic configuration files.
- **Documentation:** Architectural and user guides following the [Safe Documentation Policy](../.ag/safe-documentation-policy.md).

## 2. Prohibited Data (Danger Zone)
**UNDER NO CIRCUMSTANCES** shall the following be uploaded:
- **Real Patient Records:** Any file containing real clinical information.
- **Identifiable Metrics:** Data that, while not containing names, could identify a patient through a combination of factors (rare diseases + specific dates + location).
- **Hospital Exports:** Raw XLSX, CSV, or XML files exported from a clinical system.
- **Credentials:** API keys, passwords, or session tokens.

## 3. Data Handling in Application
The Queryclin application is designed to process data **locally** in the browser. 
- No data is uploaded to a server.
- No telemetry is collected regarding the *content* of the clinical data explored.
- The use of `IndexedDB` or `localStorage` for patient data must be transient and user-controlled.
