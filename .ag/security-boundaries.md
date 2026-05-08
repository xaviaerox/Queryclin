# Security Boundaries - Queryclin

## 1. Definition of Boundaries
This document defines the limits of what information can enter the public repository and what must remain strictly outside.

## 2. Forbidden Operational Information
The following information must NEVER be documented or referenced:
- **Internal Endpoints:** Hospital APIs, internal server URLs, or private webhooks.
- **Infrastructure Details:** Server names, IP addresses (even internal), or cloud provider specific configurations.
- **VPN & Network:** Connection details, VPN configurations, or internal routing tables.
- **Private Configs:** Any `.env` variables or configuration files used in a private production deployment.

## 3. Publication Limits
- **Sensitive Zones:** Any code logic that deals with specific hospital integration layers must be abstracted to be generic. 
- **Logs:** Production logs, even if "cleaned," are prohibited. Use synthetic logs for debugging documentation.
- **Screenshots:** Screenshots must NEVER contain real patient data or internal hospital UI elements that reveal institutional identity.

## 4. Operational Prohibitions
- No internal network paths (e.g., `\\hospital-server\share\`).
- No internal contact information (emails, internal phone extensions).
- No references to specific institutional security protocols or vulnerabilities.
