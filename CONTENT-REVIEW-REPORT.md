# AYME — Content review report (LLM first-pass)

**Reviewed:** 24 April 2026
**Reviewer:** Claude Opus 4.7 (LLM first-pass; not a substitute for SME sign-off)
**Method:** Each module's `whatItIs`, `whyItMatters`, `keyConcepts`, and `clientQuestions` cross-checked against general industry knowledge (vendor public materials, ISA standards, FDA/EMA guidance) up to the model's training cut-off.

---

## How to read this report

For every module:

- ✅ **Confirmed**: Statement is accurate based on widely-published authoritative material.
- ⚠️ **Verify**: Plausibly correct but moves fast or is vendor-specific — confirm against the cited source before sign-off.
- ❌ **Likely wrong / misleading**: Edit recommended.
- 📚 **Sources to cite**: Where a SME should look to confirm and to populate `CONTENT_REVIEW[id].sources`.

A module is ready for `CONTENT_REVIEW` sign-off when every ⚠️/❌ has been resolved with a SME.

---

## 1. `deltav` — DeltaV DCS

✅ Architecture description (controllers + ProfessionalPLUS + Operator Stations + Continuous Historian) is correct for current DeltaV.
✅ ISA-88 phases / modules vocabulary is on point.
✅ AMS Device Manager scope (HART / WirelessHART / Foundation Fieldbus) is accurate.
⚠️ "DeltaV Live is the modern HTML5 HMI" — true, but DeltaV Operate is still in widespread use; consider noting this for accuracy.
⚠️ "CHARMs / Electronic Marshalling" — the explanation "wire first, assign later" is correct but oversimplifies; CHARMs are I/O conditioning modules. SME should refine.
⚠️ "Most capex automation projects at these sites will need DeltaV engineers" — true *at DeltaV sites*; the sentence as written conflates "pharma" with "DeltaV". Edit suggestion: "At DeltaV sites, most capex automation projects will need DeltaV engineers."
📚 **Sources**: Emerson DeltaV product page (emerson.com/en-us/automation/control-and-safety-systems/distributed-control-systems-dcs/deltav-distributed-control-system), Emerson DeltaV Whitepaper Library, ISPE GAMP DeltaV guidance.

## 2. `mes` — MES (Manufacturing Execution System)

✅ ISA-95 Level 3 positioning is correct.
✅ EBR / MBR / Review by Exception terminology is industry-standard.
✅ Vendor list (PAS-X, Syncade, Rockwell PharmaSuite, Opcenter, AVEVA, Tulip) is accurate as of 2025.
⚠️ "Rockwell PharmaSuite / FactoryTalk ProductionCentre" — Rockwell has rebranded multiple times; verify current product names.
⚠️ "2-4 year programme across multiple sites" — typical but varies wildly; SME should validate based on their own client base.
⚠️ OEE definition "Availability × Performance × Quality" is correct but it's not always reported via MES (often OEE comes from a dedicated OEE tool or PI). Consider rewording: "Often surfaced via MES dashboards."
📚 **Sources**: ISA-95 standard (ISA.org), ISPE Pharma 4.0 documentation, vendor public product pages.

## 3. `csv` — CSV & Validation

✅ V-Model and IQ/OQ/PQ are accurately defined.
✅ GAMP categories 1/3/4/5 mapping is correct.
✅ ALCOA+ acronym definition is correct.
⚠️ **CSA section** — FDA published draft guidance "Computer Software Assurance for Production and Quality System Software" in September 2022. As of 2025/2026, the *final* version's status should be re-checked; the module says "FDA's 2022+ draft guidance" which is correct but stale. SME should confirm whether the final version has been released and update.
⚠️ "25-50% of the automation budget" — well-cited industry rule of thumb; but the range varies. SME should provide their own data point.
⚠️ "EU Annex 11 ... broader, more principles-based than Part 11" — correct historically; Annex 11 has been under revision (the EMA has signalled an update). Verify current state.
❌ "21 CFR Part 11. FDA regulation on electronic records and electronic signatures. Audit trails, access control, timestamps." — *technically* correct but Part 11 is much more nuanced (predicate rules vs Part 11 controls, the 2003 scope-and-application guidance, and FDA's modernisation efforts). The current module is fine for a 60-second pitch but consider expanding the keyConcept entry.
📚 **Sources**: FDA 21 CFR Part 11 + 2003 Scope and Application guidance + 2022 CSA draft guidance + GAMP 5 Second Edition (ISPE 2022). EU GMP Annex 11 (EudraLex Volume 4).

## 4. `itot` — IT/OT Convergence

✅ Purdue Model description is correct.
✅ DMZ / unidirectional gateway concepts are accurate.
⚠️ **NIS2** — module says "in force 2024". Member-state transposition deadlines were October 2024; some states were late. Verify current applicability per the EU Commission's official tracker.
⚠️ "IEC 62443 — Zones & Conduits model" — correct, but IEC 62443 is a *family* of 14+ standards (62443-3-3 for system requirements, 62443-4-1 for product development, etc.). The module currently treats it as a single thing. Consider expanding the keyConcept.
⚠️ "OPC UA — Open Platform Communications Unified Architecture, the modern, secure, cross-vendor way" — accurate. SME may want to add the Foundation, Pub/Sub vs Client/Server, and security profile detail for advanced users.
✅ Air-gapped reality check ("almost never true in 2026") is a useful red flag.
📚 **Sources**: IEC 62443 series (iec.ch), EU NIS2 Directive 2022/2555, Purdue/ISA-99 papers, ISA Global Cybersecurity Alliance materials.

## 5. `syncade` — Syncade MES

✅ Emerson ownership and DeltaV pairing is correct.
✅ Workflow / Recipe Authoring / Weigh-and-Dispense / EBR scope reflects Syncade product structure.
⚠️ "OOTB DeltaV ↔ Syncade integration" — Emerson markets it as such; in practice projects involve significant configuration. Soften to "designed for tight integration" rather than "OOTB" if SME agrees.
⚠️ "Syncade without DeltaV is rare" — empirically true but a SME should confirm.
✅ Talent scarcity claim is accurate as a market signal.
📚 **Sources**: Emerson Syncade product page, ISPE-published Syncade case studies.

## 6. `pasx` — PAS-X MES

✅ Körber/Werum ownership is correct.
✅ "Most widely deployed MES in pharmaceutical manufacturing" is the industry consensus and matches Gartner/IDC research.
⚠️ "PAS-X Savvy" — confirm current product name and whether it's still positioned as a separate module or consolidated.
⚠️ "MSI (Manufacturing Suite Integration)" — verify this is the current Körber productisation; product names get re-shuffled.
⚠️ "PAS-X LIMS" — Körber acquired LIMS/QMS products; confirm whether PAS-X LIMS is the current branding.
⚠️ "Top-20 pharma companies have PAS-X deployed at multiple sites" — directionally true, but SME should provide a verifiable citation.
📚 **Sources**: Körber Pharma product portfolio (koerber-pharma.com), Werum/Körber annual reports.

## 7. `plc` — PLCs & Controls

✅ IEC 61131-3 languages list is accurate.
✅ Allen-Bradley / Siemens dominance in pharma packaging is correct.
✅ EtherNet/IP vs Profinet distinction (both Ethernet-based, not interoperable by default) is accurate.
⚠️ "S7-1500, S7-1200, TIA Portal" — current naming is right; S7-1200/1500 family continues.
⚠️ "PCS 7 is Siemens' DCS built on S7 PLCs" — correct historically; Siemens is positioning *PCS neo* as the successor. SME should consider mentioning PCS neo as a forward-looking note.
✅ Safety PLC examples (GuardLogix, Siemens F-PLCs) are correct.
✅ HMI examples (FactoryTalk View, WinCC, Ignition) are accurate.
📚 **Sources**: Rockwell, Siemens, and Ignition (Inductive Automation) public product pages; IEC 61131-3 standard summary.

## 8. `historian` — Historians & PI

✅ Time-series data scope is accurate.
✅ "OSIsoft PI (now AVEVA PI System)" — correct; Aveva acquired OSIsoft in 2021.
✅ PI Asset Framework / PI Vision / PI Integrator descriptions are accurate.
⚠️ "AVEVA Data Hub / AVEVA CONNECT" — these are the current Aveva cloud product names. Verify they are still marketed as such and not re-branded.
⚠️ "Canary / Ignition / other historians" — correct competitive landscape; "less feature-rich" is debatable for some use cases. SME may soften.
📚 **Sources**: AVEVA PI System product page, Aveva CONNECT documentation.

## 9. `isa88` — ISA-88 Batch

✅ Physical model levels (Enterprise → Site → Area → Process Cell → Unit → Equipment Module → Control Module) are correct.
✅ Procedural model (Procedure → Unit Procedure → Operation → Phase) is correct.
✅ Recipe types (General → Site → Master → Control) are correctly enumerated.
✅ Phase / state-model concepts are accurate.
✅ This module is one of the cleanest in the platform — ISA-88 is mature and stable.
📚 **Sources**: ISA-88 Part 1 (Models and Terminology, ANSI/ISA-88.01-2010 R2018), Part 2 (Data Structures and Guidelines), Part 3 (General and Site Recipe Models).

## 10. `isa95` — ISA-95 & Purdue

✅ Levels 0-4 mapping is correct.
✅ "L3.5 — DMZ" — pragmatic shorthand; not strictly part of ISA-95 but widely used.
✅ Examples per level (PLCs/DCS at L2, MES at L3, ERP at L4) are accurate.
⚠️ "OPC UA, or legacy DCOM" in clientQuestions — DCOM-based OPC Classic is still surprisingly common; phrasing as "legacy" is fine but SME may want to nuance.
⚠️ Module title "ISA-95 & Purdue" — Purdue (1990s) and ISA-95 (1999+) are related but distinct; this module reasonably treats them together since the industry does too. A SME may want to note the distinction in the briefing.
📚 **Sources**: ISA-95 standard parts 1-7 (ANSI/ISA-95.00.01 etc.), Purdue Reference Model paper, ISA Global Cybersecurity Alliance Purdue extensions.

## 11. `dataintegrity` — Data Integrity & ALCOA+

✅ ALCOA+ acronym definition is the standard MHRA/PIC/S definition.
✅ "Data integrity citations are the #1 cause of FDA 483 observations in computerised systems" — historically accurate; SME should provide a current citation (FDA inspection observation summaries are published annually).
✅ Audit trail / Part 11 / Annex 11 framing is correct.
⚠️ "ALCOA+ is the nine-word summary" — clean phrasing but make sure that's true (ALCOA = 5 words, + = 4 words = 9 total ✓).
⚠️ "Excel used for GMP calculations without validation" red flag — accurate; SME may want to reference the MHRA spreadsheet guidance.
📚 **Sources**: MHRA "GxP Data Integrity Guidance and Definitions" (March 2018), FDA "Data Integrity and Compliance With Drug CGMP" (December 2018), PIC/S PI 041 (Good Practices for Data Management and Integrity in Regulated GMP/GDP Environments, 2021).

## 12. `serialization` — Serialization & Track-and-Trace

✅ DSCSA / FMD as primary regulatory drivers — correct.
⚠️ **DSCSA timeline**: the law's enhanced drug distribution security provisions were due Nov 2023, then FDA issued enforcement-discretion extensions. SME should verify the *current* compliance status as of the review date and update wording.
✅ Aggregation / parent-child / unit-carton-case-pallet model — accurate.
✅ L2 line-system vendor list (Optel, Antares, Systech, Rockwell) — accurate.
✅ L3 platform list (TraceLink, Systech, SAP ATTP, rfxcel) — accurate, though rfxcel was acquired by Antares Vision; SME may want to note current ownership.
⚠️ "New markets (Russia, Saudi, Brazil)" — Russia is now politically sensitive given sanctions; SME may want to refresh examples (e.g., Egypt, India, China NMPA).
📚 **Sources**: FDA DSCSA page (fda.gov/drugs/drug-supply-chain-security-act-dscsa), EU Falsified Medicines Directive 2011/62/EU and Delegated Regulation 2016/161, GS1 standards.

---

## Cross-cutting recommendations

1. **Date-stamp every regulatory claim**. Pharma regs evolve; phrasing like "current FDA expectation" without a date will go stale fast. Suggest a footnote convention or a per-module "as of YYYY-MM" stamp inside the briefing.

2. **Disambiguate vendor product names**. Several modules reference vendor product names (DeltaV Live, PAS-X Savvy, MSI, AVEVA CONNECT) that vendors rebrand frequently. Maintaining a single reviewable list of vendor product mentions makes the next refresh easier.

3. **Add citations to the briefings**. Every `whyItMatters` and `keyConcept` could carry a small `[1]`/`[2]` link to the relevant authoritative source. The `CONTENT_REVIEW[id].sources` array already exists — the missing piece is rendering inline citation references in the briefing UI. Worth a small follow-up.

4. **Treat `clientQuestions` and `redFlags` as opinion**, not fact. These are seasoned-practitioner heuristics. The current banner already handles this (educational summary), but consider an italics / "in our experience" framing on red flags.

5. **Foreshadow what's not there**. The current 12 modules don't cover: PCS neo, OPC UA Pub/Sub specifics, Edge / IIoT (Ignition Edge, Siemens IoT2050), AI/ML in MES, Pharma 4.0 specifically, ICH Q9(R1) on quality risk management. Worth flagging as gaps to fill in v2.

---

## What to do with this report

1. **Have a SME read this side-by-side with the live app** (`https://aymetraining.com`) — module by module.
2. For each ⚠️ / ❌, agree on the correct wording.
3. Edit `MODULES`, `FLASHCARDS`, `QUIZZES` in `index.html` accordingly.
4. Once all flags resolved, populate `CONTENT_REVIEW[moduleId]` with the SME's name, date, and the sources from this report (plus any they add).
5. Commit each module's sign-off as its own commit so the audit trail is clean.

The 12 modules vary in volatility:
- **Stable**: `isa88`, `isa95`, `plc`, `historian` — the underlying standards/products move slowly.
- **Moving**: `csv`, `itot`, `serialization`, `dataintegrity` — regulations and threats evolve; recommend annual review (matches the 365-day stale check).
- **Vendor-driven**: `deltav`, `mes`, `syncade`, `pasx` — product naming and feature drift; recommend re-check on each major vendor release cycle.

---

## Methodology note

This is an **LLM first-pass**, not an SME review. It is most useful as:

- A pre-read for the human SME (saves them time finding what to verify).
- A defensible due-diligence step for the company's records.
- A baseline for subsequent reviews — the SME can diff against this report.

It is **not sufficient on its own** for the `CONTENT_REVIEW` sign-off, which requires a named human with industry credentials.
