import React from "react";
import { POLICY } from "../constants.js";

const COVERAGE_LIMITS = [
  ["Annual Limit", "₹50,000"],
  ["Per Claim Limit", "₹5,000"],
  ["Consultation", "₹2,000/claim"],
  ["Pharmacy", "₹15,000/year"],
  ["Diagnostics", "₹10,000/year"],
  ["Dental", "₹10,000/year"],
  ["Vision", "₹5,000/year"],
  ["Alternative Medicine", "₹8,000/year"],
];

const WAITING_PERIODS = [
  ["Initial (all claims)", "30 days"],
  ["Pre-existing diseases", "365 days"],
  ["Diabetes", "90 days"],
  ["Hypertension", "90 days"],
  ["Maternity", "270 days"],
  ["Joint Replacement", "730 days"],
];

const EXCLUSIONS_DISPLAY = [
  "Cosmetic procedures", "Weight loss", "Infertility", "Experimental",
  "Self-inflicted", "HIV/AIDS", "Alcoholism/drug abuse", "Adventure sports",
  "Vitamins/supplements", "LASIK", "Bariatric",
];

const ADJUDICATION_STEPS = [
  ["1", "Eligibility", "Policy active, waiting period, min amount"],
  ["2", "Documents", "Prescription, doctor reg, bill validity"],
  ["3", "Coverage", "Exclusions, pre-auth, service covered"],
  ["4", "Limits", "Per-claim, sub-limits, copay calculation"],
  ["5", "Medical Necessity", "Diagnosis justifies treatment"],
  ["6", "Fraud Detection", "Same-day claims, high-value flags"],
];

function SimpleTable({ rows }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <td style={{ padding: "5px 0", fontSize: 12, color: "#6b7280" }}>{label}</td>
            <td style={{ padding: "5px 0", fontSize: 12, fontWeight: 600, color: "#111827", textAlign: "right" }}>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PolicyCard({ title, children }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #f3f4f6" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function PolicyTab() {
  return (
    <div className="policy-grid">
      <PolicyCard title="Coverage Limits">
        <SimpleTable rows={COVERAGE_LIMITS} />
      </PolicyCard>

      <PolicyCard title="Waiting Periods">
        <SimpleTable rows={WAITING_PERIODS} />
      </PolicyCard>

      <PolicyCard title="Exclusions">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {EXCLUSIONS_DISPLAY.map((e) => (
            <span key={e} style={{ padding: "3px 10px", background: "#fef2f2", color: "#b91c1c", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
              {e}
            </span>
          ))}
        </div>
      </PolicyCard>

      <PolicyCard title="Network Hospitals — 20% Discount + Cashless">
        {POLICY.network_hospitals.map((h) => (
          <div key={h} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #f9fafb" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#15803d" }} />
            <span style={{ fontSize: 12, color: "#374151", flex: 1 }}>{h}</span>
            <span style={{ fontSize: 11, color: "#15803d", fontWeight: 600 }}>Cashless eligible</span>
          </div>
        ))}
      </PolicyCard>

      <div className="card" style={{ padding: 20, gridColumn: "1 / -1" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 14, paddingBottom: 8, borderBottom: "1px solid #f3f4f6" }}>
          Adjudication Flow — 6 Steps
        </div>
        <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
          {ADJUDICATION_STEPS.map(([num, title, desc], i, arr) => (
            <div
              key={num}
              style={{
                flex: "1 0 120px",
                padding: "12px 14px",
                background: "#f9fafb",
                borderRight: i < arr.length - 1 ? "1px solid #e5e7eb" : "none",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 800, color: "#fee2e2", marginBottom: 4 }}>{num}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 2 }}>{title}</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
