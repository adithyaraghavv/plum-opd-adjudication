import React from "react";
import { TEST_CASES } from "../constants.js";

export default function TestCasesTab({ onLoad }) {
  return (
    <div>
      <div style={{ marginBottom: 16, fontSize: 13, color: "#52525b" }}>
        10 test cases covering all adjudication scenarios. Click any to load and process.
      </div>
      <div className="two-col">
        {TEST_CASES.map(tc => (
          <div
            key={tc.id}
            onClick={() => onLoad(tc)}
            className="card"
            style={{ padding: 18, cursor: "pointer", transition: "border-color 0.15s, box-shadow 0.15s" }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "#dc2626";
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(220,38,38,0.12)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "#1f1f1f";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#52525b", letterSpacing: "0.08em" }}>
                {tc.id}
              </span>
              <span style={{ padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                             color: tc.tagColor, background: tc.tagColor + "18",
                             border: `1px solid ${tc.tagColor}44` }}>
                {tc.tag}
              </span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f2f2f2", marginBottom: 5, letterSpacing: "-0.2px" }}>
              {tc.label}
            </div>
            <div style={{ fontSize: 12, color: "#71717a" }}>
              {tc.data.member_name} · ₹{tc.data.claim_amount.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: "#52525b", marginTop: 3 }}>{tc.data.diagnosis}</div>
            <div style={{ marginTop: 14, padding: "7px 0", background: "#dc2626", color: "white",
                          borderRadius: 6, fontSize: 12, fontWeight: 700, textAlign: "center",
                          letterSpacing: "0.02em" }}>
              Load &amp; Process →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
