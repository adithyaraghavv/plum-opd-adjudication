import React from "react";
import { DC, POLICY } from "../constants.js";

export default function HistoryTab({ history }) {
  if (history.length === 0) {
    return (
      <div className="card" style={{ padding: 48, textAlign: "center", color: "#52525b", fontSize: 13 }}>
        No claims processed yet.
      </div>
    );
  }

  const totalApproved   = history.reduce((s, h) => s + h.approved_amount, 0);
  const annualRemaining = Math.max(0, POLICY.annual_limit - totalApproved);
  const utilizationPct  = Math.min(100, Math.round((totalApproved / POLICY.annual_limit) * 100));
  const barColor        = utilizationPct > 80 ? "#dc2626" : utilizationPct > 60 ? "#f59e0b" : "#4ade80";

  return (
    <div>
      {/* Stat cards */}
      <div className="four-col" style={{ marginBottom: 16 }}>
        {[
          { l: "Total Claims",      v: history.length,                                                                    c: "#dc2626" },
          { l: "Approved",          v: history.filter(h => h.decision === "APPROVED").length,                             c: "#4ade80" },
          { l: "Rejected / Partial",v: history.filter(h => ["REJECTED","PARTIAL"].includes(h.decision)).length,           c: "#f87171" },
          { l: "Total Approved",    v: "₹" + totalApproved.toLocaleString(),                                              c: "#60a5fa" },
        ].map(s => (
          <div key={s.l} className="card" style={{ padding: "14px 16px" }}>
            <div style={{ fontSize: 10, color: "#52525b", fontWeight: 700, textTransform: "uppercase",
                          letterSpacing: "0.08em", marginBottom: 6 }}>{s.l}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.c, letterSpacing: "-0.5px" }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Annual limit bar */}
      <div className="card" style={{ padding: "14px 18px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#a1a1aa" }}>Annual Limit Usage</span>
          <span style={{ fontSize: 12, color: "#52525b" }}>
            ₹{totalApproved.toLocaleString()} / ₹{POLICY.annual_limit.toLocaleString()} ({utilizationPct}%)
          </span>
        </div>
        <div style={{ background: "#1a1a1a", borderRadius: 4, height: 7 }}>
          <div style={{ background: barColor, height: 7, borderRadius: 4,
                        width: `${utilizationPct}%`, transition: "width 0.6s ease" }} />
        </div>
        <div style={{ fontSize: 11, color: "#52525b", marginTop: 6 }}>
          ₹{annualRemaining.toLocaleString()} remaining this year
        </div>
      </div>

      {/* Claims table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#0f0f0f" }}>
              {["Claim ID","Member","Date","Claimed","Decision","Confidence","Approved"].map(h => (
                <th key={h} style={{ padding: "11px 14px", fontSize: 10, fontWeight: 700, color: "#52525b",
                                     textAlign: "left", borderBottom: "1px solid #1f1f1f",
                                     textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => {
              const c = DC[h.decision];
              return (
                <tr key={h.claim_id} style={{ borderBottom: "1px solid #1a1a1a",
                                              background: i % 2 ? "#0d0d0d" : "#111111" }}>
                  <td style={{ padding: "11px 14px", fontSize: 12, fontWeight: 700, color: "#dc2626",
                                fontFamily: "monospace" }}>{h.claim_id}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "#a1a1aa" }}>{h.member_name}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "#52525b" }}>{h.treatment_date}</td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "#a1a1aa" }}>
                    ₹{parseFloat(h.claim_amount || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ padding: "3px 9px", borderRadius: 4, background: c.bg, color: c.color,
                                   fontSize: 10, fontWeight: 700, border: `1px solid ${c.border}`,
                                   whiteSpace: "nowrap", letterSpacing: "0.03em" }}>
                      {h.decision}
                    </span>
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 12, color: "#71717a" }}>
                    {Math.round(h.confidence_score * 100)}%
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: 12, fontWeight: 700, color: c.color }}>
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
