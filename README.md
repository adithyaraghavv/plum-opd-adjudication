# 🏥 Plum OPD Claim Adjudication Tool

AI-powered web application that automates approval/rejection decisions for Outpatient Department (OPD) insurance claims. Built with React and Claude AI.

---

## 🎬 Demo Screenshots

### ✅ Approved Claim — Simple Consultation
![Approved](screenshots/Screenshot%202026-04-11%20161312.png)

### ⚠️ Partial Approval — Dental (Root Canal covered, Whitening excluded)
![Partial](screenshots/Screenshot%202026-04-12%20154756.png)

### 🔍 Manual Review — Fraud Detection
![Manual Review](screenshots/Screenshot%202026-04-12%20060043.png)

### 🧪 All 10 Test Cases
![Test Cases](screenshots/Screenshot%202026-04-11%20161325.png)

### 📊 Claims History Dashboard
![History](screenshots/Screenshot%202026-04-11%20161348.png)

### 📜 Policy Reference
![Policy](screenshots/Screenshot%202026-04-11%20161429.png)

---

## 🎯 What It Does

- Uploads medical documents (bills, prescriptions) and extracts data using Claude AI Vision
- Runs a **6-step adjudication engine** against policy rules
- Makes **APPROVED / REJECTED / PARTIAL / MANUAL REVIEW** decisions instantly
- Detects fraud patterns automatically
- Shows full financial breakdown (copay, network discount, approved amount)
- Maintains claims history with dashboard stats

---

## ✅ All 10 Test Cases Passing

| Case | Scenario | Expected | Result |
|------|----------|----------|--------|
| TC001 | Simple consultation - Viral fever | ✅ APPROVED ₹1,350 | ✅ Pass |
| TC002 | Dental - Root canal + Whitening | ⚠️ PARTIAL ₹10,800 | ✅ Pass |
| TC003 | Claim exceeds ₹5,000 limit | ❌ REJECTED | ✅ Pass |
| TC004 | No prescription submitted | ❌ REJECTED | ✅ Pass |
| TC005 | Diabetes within 90-day wait | ❌ REJECTED | ✅ Pass |
| TC006 | Ayurvedic Panchakarma | ✅ APPROVED | ✅ Pass |
| TC007 | MRI without pre-authorization | ❌ REJECTED | ✅ Pass |
| TC008 | 3 claims same day | 🔍 MANUAL REVIEW | ✅ Pass |
| TC009 | Weight loss / obesity excluded | ❌ REJECTED | ✅ Pass |
| TC010 | Apollo Hospitals cashless | ✅ APPROVED + Cashless | ✅ Pass |

---

## ⚙️ Adjudication Engine — 6 Steps

1. **Eligibility Check** — Policy active, waiting period, minimum amount
2. **Document Validation** — Prescription present, doctor registration valid
3. **Coverage Verification** — Treatment not excluded, pre-auth obtained
4. **Limit Validation** — Per-claim ₹5K, sub-limits, 10% copay applied
5. **Medical Necessity** — Diagnosis justifies treatment
6. **Fraud Detection** — Same-day claims, high-value flags, duplicate detection

---

## 💰 Policy Rules Implemented

| Rule | Value |
|------|-------|
| Annual Limit | ₹50,000 |
| Per Claim Limit | ₹5,000 |
| Copay | 10% |
| Network Discount | 20% |
| Consultation Sub-limit | ₹2,000 |
| Pharmacy Sub-limit | ₹15,000 |
| Dental Sub-limit | ₹10,000 |
| Diagnostics Sub-limit | ₹10,000 |
| Alternative Medicine | ₹8,000 |
| Submission Deadline | 30 days |

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **AI/LLM**: Anthropic Claude API (document OCR + claim insights)
- **Decision Engine**: Rule-based adjudication (JavaScript)
- **Storage**: Session-based claims history
- **Deployment**: Localhost / Vercel ready

---

## 🚀 Run Locally

```bash
npm install
npm run dev
```

Open **http://localhost:5173**

For AI document extraction — add your Anthropic API key using the **"+ Add API Key"** button in the top right.

---

## 📁 Project Structure

src/
└── App.jsx          # Complete application (adjudication engine + UI)
index.html           # Entry point
vite.config.js       # Vite configuration
package.json         # Dependencies
screenshots/         # Demo screenshots

---

## 📝 Assumptions

- Per-claim limit does not apply to partial claims (sub-limits used instead)
- Doctor registration validated by format only (State/Number/Year)
- Fraud detection threshold: 3+ claims same day
- In-memory storage (production would use Supabase/PostgreSQL)
- API key entered in browser for demo (production uses backend proxy)

---

*Built for Plum AI Automation Engineer Assignment*
