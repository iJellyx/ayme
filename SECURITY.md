# AYME — Security & Compliance Overview

> **Status:** Starter document. Fill placeholders in `[brackets]` with your specifics before sharing with clients. Have your legal/security lead review before distribution.

**Last updated:** 24 April 2026
**Contact:** [security@your-domain.com]
**Owner:** [Your Legal Entity Name Ltd.]

This document summarises how AYME is designed, deployed, and operated. It is intended to answer common procurement and information-security questionnaires (SIG Lite, CAIQ, vendor onboarding forms) for enterprise clients in the pharmaceutical and biotechnology industries.

---

## 1. Product overview

AYME is a web-based learning platform that helps professionals build fluency in connected automation topics (DeltaV, MES, CSV, IT/OT, Syncade, PAS-X, etc.). It is delivered as Software-as-a-Service over HTTPS. Access is gated by individual user authentication and an active subscription.

- **Delivery model:** Multi-tenant SaaS, single-tenant per-user experience
- **Client access:** Web browser only (no installed software, no VPN, no local agent)
- **Data classification:** No client-confidential, regulated (GxP), or production data is processed by AYME. All content is generic educational material.

---

## 2. Architecture

AYME is a static single-page web application with a small number of serverless functions for authentication and billing.

```
┌─────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  Browser    │──────│  Vercel (CDN +   │──────│  Clerk (auth)    │
│  (user)     │  TLS │  Edge Functions) │  TLS │  Stripe (billing)│
└─────────────┘      └──────────────────┘      └──────────────────┘
       │                      │
       │                      └─ Serverless functions:
       │                         /api/create-checkout-session
       │                         /api/stripe-webhook
       │                         /api/customer-portal
       │
       └─ localStorage: user progress (per-browser, not synced)
```

There is **no AYME-operated database, no AYME-operated server, no persistent storage of user content** beyond what Clerk and Stripe hold as our subprocessors. Progress data never leaves the user's browser.

---

## 3. Data we collect

| Data category | Source | Stored by | Retention |
|---|---|---|---|
| Name, email | User at sign-up | Clerk | Duration of account + 12 months |
| Password hash | User at sign-up | Clerk | Duration of account |
| Session cookie | Generated on sign-in | Browser + Clerk | Sliding session |
| Payment method, billing address | User at checkout | **Stripe only** — we never see card data | Per Stripe retention |
| Invoices, subscription status | Stripe event callbacks | Clerk `publicMetadata` (status only) + Stripe (full records) | 7 years (tax requirement) |
| Usage progress (XP, completed modules, flashcards seen) | Client-side events | Browser `localStorage` only | Until user clears it |
| Server logs (IP, user agent, path) | HTTP request | Vercel | ≤30 days |

**We do not collect:** real-time behavioural analytics, advertising identifiers, location data, contacts, device identifiers, microphone/camera, or any client-confidential content.

---

## 4. Subprocessors

| Subprocessor | Purpose | Data processed | Hosting region | Compliance |
|---|---|---|---|---|
| Clerk, Inc. | Authentication, user directory | Name, email, password hash, session | US (AWS) | SOC 2 Type II, GDPR |
| Stripe, Inc. | Payment processing | Billing details, subscription records | US + EU (AWS) | PCI-DSS Level 1, SOC 2, GDPR |
| Vercel Inc. | Static hosting, serverless runtime, CDN | Request logs, serverless function runtime | Configurable (default US) | SOC 2 Type II, GDPR |

Each subprocessor has signed a Data Processing Agreement with [Your Legal Entity Name Ltd.] and provides EU Standard Contractual Clauses for international data transfers.

---

## 5. Encryption

- **In transit:** All traffic between the browser, Vercel, Clerk, and Stripe is encrypted with TLS 1.2+ (TLS 1.3 preferred). HSTS is enabled on the production domain.
- **At rest:** Clerk encrypts user records with AES-256; Stripe encrypts cardholder data per PCI-DSS. `localStorage` progress data is unencrypted on the user's device by design — it contains no sensitive information.
- **Secrets management:** API keys and webhook signing secrets are stored as Vercel environment variables, scoped per environment (production/preview/development), accessible only to the serverless runtime. They are never committed to source control.

---

## 6. Authentication & access control

- **User authentication:** Email + password via Clerk, with optional passwordless magic-link. Password policy enforces minimum length and blocks known-compromised passwords via Clerk's HaveIBeenPwned integration.
- **Multi-factor authentication:** Available (TOTP, SMS) via Clerk's user profile UI. Can be made mandatory via Clerk settings for enterprise tenants.
- **Session management:** Short-lived JWTs with automatic refresh. Sessions revoked server-side on sign-out or on password change.
- **Subscription gating:** All application content is blocked until the Clerk user record has `publicMetadata.subscriptionStatus === "active"`, set only by the Stripe webhook after signature verification.
- **Admin access to production:** Limited to named [Your Company] personnel via SSO on Vercel, Clerk, and Stripe dashboards. 2FA required.

---

## 7. Secure development

- All source is version-controlled in a private GitHub repository with branch protection on `main`.
- Vercel builds every commit and runs preview deployments for review.
- Dependencies are minimal (Stripe SDK, Clerk backend SDK) and kept current. The front-end has no third-party runtime dependencies beyond the Clerk JS script.
- No user-supplied content is rendered as HTML on the server. All user-entered strings are HTML-escaped before rendering in the DOM.
- CSRF protection is inherent to the architecture: state-changing endpoints require a Clerk session JWT in an `Authorization: Bearer` header, which cannot be added by cross-site requests.
- The Stripe webhook handler verifies every request using Stripe's `constructEvent` with the signing secret; malformed or unsigned requests are rejected with 400.

---

## 8. Vulnerability management

- **Disclosure:** Security researchers can report vulnerabilities at [security@your-domain.com]. See `/.well-known/security.txt` on the production site.
- **Triage:** Reports are acknowledged within 2 business days and remediated per severity:
  - Critical: ≤7 days
  - High: ≤30 days
  - Medium: ≤90 days
  - Low: best-effort
- **Dependencies:** Monitored continuously via GitHub Dependabot. Critical advisories patched and redeployed within 72 hours.
- **Penetration testing:** [Planned annually / none yet — update to reflect reality.]

---

## 9. Incident response

An incident is any unauthorised access, disclosure, alteration, or loss of customer data, or any material outage of the production service.

- **Detection:** Vercel and Clerk dashboards monitored; email alerts on deployment failures and Clerk instance events.
- **Notification:** Affected customers notified within 72 hours of confirmed data incident (GDPR Article 33 threshold).
- **Post-incident:** Written post-mortem shared with affected parties on request.

---

## 10. Business continuity

- **Hosting resilience:** Vercel operates multi-region edge; single-region failure results in degraded performance, not outage.
- **Source code:** Mirrored between the local development machine and GitHub. A complete rebuild from source-of-truth takes <30 minutes.
- **Data continuity:** All durable data lives with subprocessors (Clerk, Stripe), each with their own backup and disaster-recovery SLAs. AYME itself holds no data that requires separate backup.
- **RPO / RTO:** Recovery point ≤0 (subprocessors are source of truth); recovery time ≤60 minutes for platform redeploy.

---

## 11. Personnel

- All personnel with access to production credentials are subject to confidentiality obligations in their employment or contractor agreements.
- Credentials are rotated on personnel departure within 24 hours.

---

## 12. GDPR / data-subject rights

AYME acts as a **Data Controller** for the limited personal data it holds (account, billing, progress). Under GDPR and equivalent laws, users can request:

- Access to their personal data (Article 15)
- Rectification of inaccurate data (Article 16)
- Erasure / right to be forgotten (Article 17), subject to tax-record retention
- Data portability in a machine-readable format (Article 20)
- Objection to processing (Article 21)
- Restriction of processing (Article 18)

Requests are handled at [privacy@your-domain.com] and resolved within 30 days.

A Data Processing Agreement is available on request for Enterprise customers: [dpa@your-domain.com].

---

## 13. Compliance posture

| Framework | Status |
|---|---|
| GDPR | In scope; privacy notice published, DPA available, SCCs in place with subprocessors |
| CCPA / CPRA | In scope for California users; we do not sell data |
| ISO 27001 | Not certified |
| SOC 2 Type I | Not certified |
| SOC 2 Type II | Not certified |
| HIPAA | Out of scope — no protected health information is processed |
| PCI-DSS | Scope minimised — card data handled exclusively by Stripe |

[Update this table as certifications progress. If you plan to pursue SOC 2, state target quarter.]

---

## 14. Client-facing controls

Enterprise clients can request the following at no additional cost:

- Signed Data Processing Agreement
- Subprocessor change notifications (30 days advance notice)
- Named security contact for incident coordination
- Removal of AYME branding / read-only audit access (custom arrangement)

---

## 15. Change log

| Date | Change |
|---|---|
| 2026-04-24 | Initial publication |
