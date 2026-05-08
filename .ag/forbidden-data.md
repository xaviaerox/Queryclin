# Forbidden Data List - Queryclin

## MANDATORY: DATA PROHIBITED IN REPOSITORY
The following data types are **STRICTLY FORBIDDEN**. Their presence in any commit will trigger an immediate incident response.

### 1. Clinical Identifiers
- **Real CIP/DNI/NIE:** Any national or regional patient identifier.
- **Real NHC:** Hospital Clinical History numbers.
- **Real Names:** Patient names, surnames, or initials of real patients.

### 2. Contact & Demographic Info
- **Real Birthdates:** Use generic years or mock dates.
- **Phone Numbers:** Real mobile or landline numbers.
- **Addresses:** Physical home addresses or GPS coordinates.
- **Emails:** Personal or professional emails of patients or clinical staff.

### 3. Clinical Documents & Media
- **Real Clinical Records:** Original HCE exports, PDFs, or XLSX files from a hospital.
- **Medical Images:** Real X-rays, MRIs, or clinical photographs.
- **Bio-signals:** Real ECG/EEG data files.

### 4. Technical Sensitive Data
- **Real Exports:** Any data exported from a live clinical system.
- **Sensitive Analytics:** Usage statistics that reveal institutional patterns.
- **Secrets:** API Keys, OAuth tokens, private keys.

---
**Allowed Alternative:** Use only the synthetic datasets provided in `src/assets/mocks/` (or equivalent location).
