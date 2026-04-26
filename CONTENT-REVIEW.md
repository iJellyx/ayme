# AYME — Content review methodology

This doc explains how AYME keeps its educational content accurate and current. Share an excerpt of this with enterprise clients during procurement — pharma buyers value seeing a documented process.

---

## Why it matters

AYME teaches concepts that intersect regulated environments (GxP, 21 CFR Part 11, EU Annex 11, GAMP 5, ISA-88, ISA-95, IEC 62443). If a learner misremembers something from a module and later applies it to a real validation decision, the consequences can be serious. We're explicit that AYME is **educational, not advice** (see the in-app Educational Disclaimer), but accuracy still matters for trust.

---

## Three lines of defence

### 1. Authoritative sourcing
Every module's content is grounded in publicly available authoritative sources:

| Source type | Examples |
|---|---|
| Regulators | FDA (CDER, CBER), EMA, MHRA, HPRA, PMDA, NMPA |
| Standards | ISA-88, ISA-95, ISA-99/IEC 62443, ISO/IEC 27001 |
| Industry guidance | ISPE GAMP 5, PIC/S Annex 11, EU GMP Annex 11/15 |
| Vendor official docs | Emerson DeltaV, Werum/Körber PAS-X, Körber Syncade, Rockwell PlantPAx, Siemens SIMATIC PCS 7 |

When an SME reviews a module, they record their sources in `CONTENT_REVIEW[moduleId].sources` (see `index.html`). The sources surface to the learner as a collapsible list at the top of the module briefing.

### 2. Subject-matter expert (SME) review
Each module is reviewed by a named SME with relevant industry experience. The SME:

1. Reads the briefing, flashcards, and quiz answers
2. Cross-checks against the sources above
3. Flags any claim that is wrong, misleading, or outdated
4. Suggests corrections inline
5. Signs off by adding their entry to `CONTENT_REVIEW`:
   ```js
   moduleId: {
     reviewer: "Name, role/credential",
     date: "YYYY-MM-DD",
     sources: [{ title, url, note }]
   }
   ```

Modules with no `CONTENT_REVIEW` entry render an amber "Educational summary — verify with vendor docs" banner at the top of the briefing, so users know it hasn't been reviewed yet.

### 3. Crowd correction
Every briefing includes a **"Spotted something inaccurate? Tell us"** button that opens a pre-filled email to `feedback@aymetraining.com`. AYME's audience includes practising sales engineers, validation consultants, and CSV/IT-OT specialists — many of them spot inaccuracies that we wouldn't catch.

Feedback is triaged within 5 business days. Material corrections are deployed within 10 business days; minor copy edits go out at the next regular update.

---

## Review cadence

| Trigger | Action |
|---|---|
| Quarterly | Re-confirm review on the 4 modules with the highest learner traffic |
| Major regulation change (e.g., new EU Annex 11 revision) | Targeted review of affected modules within 30 days |
| Vendor product change (e.g., DeltaV major release) | Targeted review within 60 days |
| Crowd-sourced correction received | Triage + fix per the SLA above |

A module's review goes stale 12 months after its `date`. Stale entries cause the in-app stamp to revert to the amber banner.

---

## Templates

### SME review form (gather these before adding to `CONTENT_REVIEW`)

```
Module reviewed: ____________________
Reviewer name + credential: ____________________
Review date: ____________________
Sources used (3–6):
  - Title:
    URL:
    Why this source: (vendor / standard / regulator / other)
Inaccuracies flagged (if any):
  -
  -
Suggested edits (paste into Markdown or directly in the issue tracker):
  -
Sign-off: I confirm the briefing, flashcards, and quiz answers are
materially accurate against the sources above as of the review date.
```

### Triage label set for feedback emails

| Label | Meaning | SLA |
|---|---|---|
| `accuracy-critical` | Could lead a user to a wrong real-world decision | 3 business days |
| `accuracy-minor` | Outdated or imprecise but not misleading | 10 business days |
| `clarity` | Wording could be improved, factually fine | Next update cycle |
| `not-an-issue` | Reporter misread or content is correct | Reply same day, close |

---

## Audit trail

Every change to module content is captured in the Git history. To produce an audit trail for a client:

```bash
git log --pretty=format:"%h %ad %s" --date=short -- index.html | grep -i "module\|content\|review"
```

The `CONTENT_REVIEW` constant in `index.html` is the canonical record of who signed off on what and when.

---

## Last updated

2026-04-24 — initial publication of the methodology.
