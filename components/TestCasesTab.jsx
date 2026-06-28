import React from "react";
import { TEST_CASES } from "../constants.js";

export default function TestCasesTab({ onLoad }) {
  return (
    <div>
      <div style={{ marginBottom: 16, fontSize: 13, color: "#6b7280" }}>
        All 10 test cases from the assignment. Click any to load and process.
      </div>
      <div className="two-col">
        {TEST_CASES.map((tc) => (
          <div
            key={tc.id}
            onClick={() => onLoad(tc)}
            className="card"
            style={{ padding: 16, cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#dc2626";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(220,38,38,0.12)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e5e7eb";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af" }}>{tc.id}</span>
              <span
                style={{
                  padding: "2px 10px",
                  borderRadius: 20,
                  background: tc.tagColor + "18",
                  color: tc.tagColor,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {tc.tag}
              </span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
              {tc.label}
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              {tc.data.member_name} · ₹{tc.data.claim_amount.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{tc.data.diagnosis}</div>
            <div style={{ marginTop: 10, padding: 6, background: "#0f0f0f", color: "white", borderRadius: 6, fontSize: 12, fontWeight: 600, textAlign: "center" }}>
              Load &amp; Process →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
