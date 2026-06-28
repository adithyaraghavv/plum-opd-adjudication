import React from "react";
import { POLICY } from "../constants.js";

const COVERAGE_LIMITS = [
  ["Annual Limit",          "₹50,000"],
  ["Per Claim Limit",       "₹5,000"],
  ["Consultation",          "₹2,000/claim"],
  ["Pharmacy",              "₹15,000/year"],
  ["Diagnostics",           "₹10,000/year"],
  ["Dental",                "₹10,000/year"],
  ["Vision",                "₹5,000/year"],
  ["Alternative Medicine",  "₹8,000/year"],
];

const WAITING_PERIODS = [
  ["Initial (all claims)",   "30 days"],
  ["Pre-existing diseases",  "365 days"],
  ["Diabetes",               "90 days"],
  ["Hypertension",           "90 days"],
  ["Maternity",              "270 days"],
  ["Joint Replacement",      "730 days"],
];

const EXCLUSIONS_DISPLAY = [
  "Cosmetic procedures","Weight loss","Infertility","Experimental",
  "Self-inflicted","HIV/AIDS","Alcoholism / Drug abuse","Adventure sports",
  "Vitamins / Supplements","LASIK","Bariatric",
];

const STEPS = [
  ["01","Eligibility",       "Policy active, waiting period, min amount"],
  ["02","Documents",         "Prescription, doctor reg, bill validity"],
  ["03","Coverage",          "Exclusions, pre-auth, service covered"],
  ["04","Limits",            "Per-claim, sub-limits, copay calculation"],
  ["05","Medical Necessity", "Diagnosis justifies treatment"],
  ["06","Fraud Detection",   "Same-day claims, high-value flags"],
];

const cardStyle = { padding: 20 };
const cardTitleStyle = { fontSize: 12, fontWeight: 800, color: "#f2f2f2", marginBottom: 16,
                         paddingBottom: 10, borderBottom: "1px solid #1f1f1f",
                         textTransform: "uppercase", letterSpacing: "0.06em" };

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0",
                  borderBottom: "1px solid #1a1a1a" }}>
      <span style={{ fontSize: 12, color: "#71717a" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa" }}>{value}</span>
    </div>
  );
}

export default function PolicyTab() {
  return (
    <div className="policy-grid">
      <div className="card" style={cardStyle}>
        <div style={cardTitleStyle}>Coverage Limits</div>
        {COVERAGE_LIMITS.map(([l, v]) => <Row key={l} label={l} value={v} />)}
      </div>

      <div className="card" style={cardStyle}>
        <div style={cardTitleStyle}>Waiting Periods</div>
        {WAITING_PERIODS.map(([l, v]) => <Row key={l} label={l} value={v} />)}
      </div>

      <div className="card" style={cardStyle}>
        <div style={cardTitleStyle}>Exclusions</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {EXCLUSIONS_DISPLAY.map(e => (
            <span key={e} style={{ padding: "4px 10px", background: "#1a0505", color: "#f87171",
                                   border: "1px solid #7f1d1d", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
              {e}
            </span>
          ))}
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <div style={cardTitleStyle}>Network Hospitals — 20% Discount + Cashless</div>
        {POLICY.network_hospitals.map(h => (
          <div key={h} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                                borderBottom: "1px solid #1a1a1a" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#a1a1aa", flex: 1 }}>{h}</span>
            <span style={{ fontSize: 10, color: "#4ade80", fontWeight: 700,
                           background: "#052e16", border: "1px solid #14532d",
                           padding: "2px 8px", borderRadius: 4 }}>Cashless</span>
          </div>
        ))}
      </div>

      {/* Adjudication flow — full width */}
      <div className="card" style={{ ...cardStyle, gridColumn: "1 / -1" }}>
        <div style={cardTitleStyle}>Adjudication Flow</div>
        <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
          {STEPS.map(([num, title, desc], i, arr) => (
            <div key={num} style={{ flex: "1 0 130px", padding: "14px 16px", background: "#0f0f0f",
                                    borderRight: i < arr.length - 1 ? "1px solid #1f1f1f" : "none" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#dc2626", marginBottom: 6,
                            fontFamily: "monospace", letterSpacing: "-1px" }}>{num}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#f2f2f2", marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 11, color: "#52525b", lineHeight: 1.4 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
