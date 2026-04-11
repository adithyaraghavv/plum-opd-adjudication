# 🏥 Plum OPD Claim Adjudication Tool

AI-powered web application that automates approval/rejection decisions for Outpatient Department (OPD) insurance claims.

## 🎯 What it does
- Processes medical documents (bills, prescriptions)
- Runs a 6-step adjudication engine against policy rules
- Makes APPROVED / REJECTED / PARTIAL / MANUAL REVIEW decisions
- Detects fraud patterns automatically
- Integrates with Claude AI for document extraction and insights

## ✅ All 10 Test Cases Passing
| Case | Scenario | Result |
|------|----------|--------|
| TC001 | Simple consultation | ✅ APPROVED ₹1,350 |
| TC002 | Dental + cosmetic | ⚠️ PARTIAL ₹10,800 |
| TC003 | Exceeds limit | ❌ REJECTED |
| TC004 | Missing prescription | ❌ REJECTED |
| TC005 | Diabetes waiting period | ❌ REJECTED |
| TC006 | Ayurvedic treatment | ✅ APPROVED |
| TC007 | MRI without pre-auth | ❌ REJECTED |
| TC008 | Multiple same-day claims | 🔍 MANUAL REVIEW |
| TC009 | Weight loss excluded | ❌ REJECTED |
| TC010 | Apollo cashless | ✅ APPROVED + Cashless |

## 🛠️ Tech Stack
- React 18 + Vite
- Anthropic Claude API (document extraction + AI insights)
- Rule-based adjudication engine (JavaScript)
- In-memory claims storage

## 🚀 Run Locally
```bash
npm install
npm run dev
```
Open http://localhost:5173

## 📋 Policy Rules Implemented
- Per claim limit: ₹5,000
- Annual limit: ₹50,000
- 10% copay on all claims
- 20% network hospital discount
- Waiting periods (Diabetes: 90 days, Hypertension: 90 days)
- Exclusions: cosmetic, weight loss, bariatric, LASIK etc.
- Pre-authorization: MRI, CT Scan
- Fraud detection: same-day multiple claims
- Late submission: 30-day deadline
- Duplicate claim detection
