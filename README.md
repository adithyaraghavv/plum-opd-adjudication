# Plum OPD Adjudication System

An AI-powered web application that instantly automates approval and rejection decisions for Outpatient Department (OPD) insurance claims — replacing hours of manual review with a deterministic rule engine and Claude AI for document OCR.

---

## The Problem

When an employee visits a doctor and submits a medical bill to their insurer, a human adjudicator has to:

1. Read and verify the claim documents
2. Check the claim against 6+ policy rules (limits, waiting periods, exclusions, fraud patterns, etc.)
3. Make a decision: approve, reject, partially approve, or escalate

This process is **slow** (hours to days), **inconsistent** (different adjudicators apply rules differently), and **expensive** (high human labor cost at scale). At Plum's scale — thousands of employee claims per day — this becomes a critical bottleneck.

---

## The Solution

A rule-based adjudication engine that processes a claim in **< 200ms** against the full policy ruleset and outputs a structured decision with reasons, financial breakdown, and next steps.

Claude AI handles the document understanding layer — extracting structured data from uploaded prescriptions and bills (images/PDFs) so employees don't have to manually type every field.

---

## How It Works

```
Employee submits claim
        │
        ▼
┌───────────────────────────────┐
│   Upload bills & prescription │  ◄── Claude AI extracts data via OCR
│   (or fill form manually)     │      (doctor name, diagnosis, amounts, dates)
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────┐
│                 6-Step Adjudication Engine             │
│                                                       │
│  01 Eligibility    → Policy active? Min amount? Submission within 30 days? │
│  02 Documents      → Prescription present? Doctor registration valid?      │
│  03 Coverage       → Treatment excluded? Pre-authorization obtained?       │
│  04 Limits         → Per-claim ₹5K cap? Sub-limits? Copay calculation?    │
│  05 Medical Need   → Diagnosis justifies the treatment?                    │
│  06 Fraud          → Same-day duplicates? High-value flags?               │
└───────────────┬───────────────────────────────────────┘
                │
                ▼
        ┌───────────────┐
        │   Decision    │
        └───────┬───────┘
                │
    ┌───────────┼───────────┬───────────────┐
    ▼           ▼           ▼               ▼
APPROVED     PARTIAL    REJECTED      MANUAL REVIEW
  Pay in     Covered     Denied —      Fraud flag or
 3–5 days    portion     appeal in     ambiguous →
             paid out    30 days       specialist
```

---

## Decision Outcomes

| Decision | When | Action |
|---|---|---|
| **APPROVED** | All rules pass | Payment processed in 3–5 business days |
| **PARTIAL** | Some items covered, some excluded (e.g. root canal ✓, teeth whitening ✗) | Covered portion paid; excluded items out-of-pocket |
| **REJECTED** | One or more hard rules fail | Denied with specific reason codes; 30-day appeal window |
| **MANUAL REVIEW** | Fraud flags raised | Escalated to a human specialist within 48 hours |

---

## Policy Rules Enforced

| Rule | Value |
|---|---|
| Annual Limit | ₹50,000 |
| Per Claim Limit | ₹5,000 |
| Copay | 10% |
| Network Hospital Discount | 20% |
| Consultation Sub-limit | ₹2,000/claim |
| Pharmacy Sub-limit | ₹15,000/year |
| Diagnostics Sub-limit | ₹10,000/year |
| Dental Sub-limit | ₹10,000/year |
| Alternative Medicine | ₹8,000/year |
| Submission Deadline | 30 days from treatment |
| Initial Waiting Period | 30 days from join date |
| Diabetes / Hypertension | 90-day waiting period |
| Maternity | 270-day waiting period |
| Joint Replacement | 730-day waiting period |
| Pre-authorization Required | MRI, CT Scan |

---

## Screenshots

### Submit Claim — Dark Theme
![Submit Claim](opd%20screenshot/approved.png.png)

### Approved Decision with Financial Breakdown
![Approved](opd%20screenshot/approved.png.png)

### Partial Approval (some items excluded)
![Partial](opd%20screenshot/partial.png.png)

### Manual Review (fraud flags)
![Manual Review](opd%20screenshot/manual-review.png.png)

### History Dashboard with Annual Limit Tracker
![History](opd%20screenshot/history.png.png)

### Test Cases
![Test Cases](opd%20screenshot/test-case.png.png)

### Policy Reference
![Policy](opd%20screenshot/policy.png.png)

---

## All 10 Test Cases

| ID | Scenario | Expected | Status |
|---|---|---|---|
| TC001 | Simple consultation — Viral fever | APPROVED ₹1,350 | ✅ Pass |
| TC002 | Dental — Root canal + Whitening | PARTIAL ₹10,800 | ✅ Pass |
| TC003 | Claim exceeds ₹5,000 per-claim limit | REJECTED | ✅ Pass |
| TC004 | No prescription submitted | REJECTED | ✅ Pass |
| TC005 | Diabetes within 90-day waiting period | REJECTED | ✅ Pass |
| TC006 | Ayurvedic Panchakarma therapy | APPROVED | ✅ Pass |
| TC007 | MRI without pre-authorization | REJECTED | ✅ Pass |
| TC008 | 3 claims same day (fraud pattern) | MANUAL REVIEW | ✅ Pass |
| TC009 | Weight loss / obesity — excluded treatment | REJECTED | ✅ Pass |
| TC010 | Apollo Hospitals cashless claim | APPROVED + Cashless | ✅ Pass |

---

## Features

- **Instant adjudication** — 6-step rule engine runs in < 200ms
- **AI document extraction** — Upload a photo of a prescription or bill; Claude reads and auto-fills the form
- **Annual limit tracking** — Live remaining balance shown in the header, with a usage bar in History
- **Fraud detection** — Flags multiple same-day claims, high-value outliers, and duplicate submissions
- **Partial approvals** — Splits covered and excluded line items; calculates covered amount separately
- **Cashless flow** — Network hospital claims can be approved cashless (no upfront payment)
- **Confidence score** — Every decision comes with an engine confidence percentage
- **Claims history** — Session-level audit trail with stats dashboard
- **Form validation** — Inline field errors before submission

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| AI / OCR | Anthropic Claude API (`claude-haiku-4-5`) |
| Decision engine | Deterministic rule engine (JavaScript) |
| Storage | In-memory session state |
| Deployment | Localhost / Vercel ready |

> **Why a rule engine and not AI for decisions?**
> Insurance adjudication decisions must be explainable, auditable, and consistent. A rule engine guarantees that the same inputs always produce the same output with traceable reasons. AI is only used for document *reading* (OCR), not for the decision itself.

---

## Run Locally

```bash
git clone https://github.com/adithyaraghavv/plum-opd-adjudication.git
cd plum-opd-adjudication
git checkout claude/new-session-tab9o1
npm install
npm run dev
```

Open **http://localhost:5173**

For AI document extraction, click **+ API Key** in the top bar and paste your Anthropic API key (`sk-ant-...`). The key is stored in the browser only and sent exclusively to the Anthropic API.

---

## Project Structure

```
/
├── App.jsx              # Main app — tab routing, state, header
├── adjudication.js      # 6-step rule engine (pure functions)
├── constants.js         # Policy config, test cases, decision colours
├── index.css            # Dark theme CSS variables + layout
├── main.jsx             # React entry point
├── components/
│   ├── ClaimForm.jsx    # Claim input form with validation
│   ├── ResultPanel.jsx  # Decision result with breakdown
│   ├── UploadBox.jsx    # Document upload + AI extraction
│   ├── TestCasesTab.jsx # 10 pre-built test scenarios
│   ├── HistoryTab.jsx   # Claims history + annual limit bar
│   ├── PolicyTab.jsx    # Policy reference (limits, exclusions, flow)
│   └── ui.jsx           # Shared Label, Field, Section components
└── opd screenshot/      # Demo screenshots
```

---

## Assumptions

- Per-claim ₹5,000 limit does not apply to partial claims (sub-limits are used instead)
- Doctor registration validated by format only (`STATE/NUMBER/YEAR`)
- Fraud threshold: 3 or more claims submitted on the same day
- In-memory storage only — a production build would persist to Supabase or PostgreSQL
- API key entered in the browser for demo purposes — production would use a backend proxy

---

*Built for the Plum AI Automation Engineer Assignment*
