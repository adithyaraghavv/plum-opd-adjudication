import React from "react";
import { DC, POLICY } from "../constants.js";

export default function HistoryTab({ history }) {
  if (history.length === 0) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
        No claims processed yet.
      </div>
    );
  }

  const totalApproved = history.reduce((s, h) => s + h.approved_amount, 0);
  const annualRemaining = Math.max(0, POLICY.annual_limit - totalApproved);
  const utilizationPct = Math.min(100, Math.round((totalApproved / POLICY.annual_limit) * 100));

  return (
    <div>
      {/* Stats */}
      <div className="four-col" style={{ marginBottom: 16 }}>
        {[
          { l: "Total Claims", v: history.length, c: "#dc2626" },
          { l: "Approved", v: history.filter((h) => h.decision === "APPROVED").length, c: "#15803d" },
          { l: "Rejected / Partial", v: history.filter((h) => ["REJECTED", "PARTIAL"].includes(h.decision)).length, c: "#b91c1c" },
          { l: "Total Approved", v: "₹" + totalApproved.toLocaleString(), c: "#1d4ed8" },
        ].map((s) => (
          <div key={s.l} className="card" style={{ padding: "12px 16px" }}>
            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
              {s.l}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Annual Limit Usage */}
      <div className="card" style={{ padding: "12px 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>Annual Limit Usage</span>
          <span style={{ fontSize: 12, color: "#6b7280" }}>
            ₹{totalApproved.toLocaleString()} / ₹{POLICY.annual_limit.toLocaleString()} ({utilizationPct}%)
          </span>
        </div>
        <div style={{ background: "#f3f4f6", borderRadius: 4, height: 8 }}>
          <div
            style={{
              background: utilizationPct > 80 ? "#b91c1c" : utilizationPct > 60 ? "#b45309" : "#15803d",
              height: 8,
              borderRadius: 4,
              width: `${utilizationPct}%`,
              transition: "width 0.6s ease",
            }}
          />
        </div>
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
          ₹{annualRemaining.toLocaleString()} remaining this year
        </div>
      </div>

      {/* Claims Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Claim ID", "Member", "Date", "Claimed", "Decision", "Confidence", "Approved"].map((h) => (
                <th
                  key={h}
                  style={{ padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#6b7280", textAlign: "left", borderBottom: "1px solid #e5e7eb", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => {
              const c = DC[h.decision];
              return (
                <tr key={h.claim_id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 ? "#fafafa" : "white" }}>
                  <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: 700, color: "#374151" }}>{h.claim_id}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12 }}>{h.member_name}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, color: "#6b7280" }}>{h.treatment_date}</td>
                  <td style={{ padding: "10px 14px", fontSize: 12 }}>₹{parseFloat(h.claim_amount || 0).toLocaleString()}</td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, background: c.bg, color: c.color, fontSize: 11, fontWeight: 700, border: `1px solid ${c.border}`, whiteSpace: "nowrap" }}>
                      {h.decision}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", fontSize: 12 }}>{Math.round(h.confidence_score * 100)}%</td>
                  <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: 700, color: c.color }}>
                    ₹{h.approved_amount.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
