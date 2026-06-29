import React from "react";
import { DC } from "../constants.js";

export default function ResultPanel({ result, claimAmount, processing }) {
  if (processing) {
    return (
      <div className="card" style={{ padding: 48, textAlign: "center" }}>
        <div className="spinner" />
        <div style={{ fontSize: 13, color: "#52525b" }}>Running adjudication engine…</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="card" style={{ padding: 48, textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 14, filter: "grayscale(0.5)" }}>📋</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#a1a1aa", marginBottom: 6 }}>Ready to process</div>
        <div style={{ fontSize: 12, color: "#52525b" }}>
          Fill the form or load a test case, then click Process Claim
        </div>
      </div>
    );
  }

  const cfg = DC[result.decision];

  return (
    <div style={{ background: "#111111", borderRadius: 10, border: `1px solid ${cfg.border}`, overflow: "hidden" }}>
      {/* Decision header */}
      <div style={{ background: cfg.bg, padding: "18px 20px", borderBottom: `1px solid ${cfg.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: cfg.color + "22",
                        border: `2px solid ${cfg.color}`, display: "flex", alignItems: "center",
                        justifyContent: "center", color: cfg.color, fontSize: 18, fontWeight: 800, flexShrink: 0 }}>
            {cfg.icon}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: cfg.color, letterSpacing: "-0.2px" }}>{cfg.label}</div>
            <div style={{ fontSize: 11, color: "#52525b", marginTop: 1 }}>
              {result.claim_id} · {result.timestamp}
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: cfg.color, letterSpacing: "-0.5px" }}>
              ₹{result.approved_amount.toLocaleString()}
            </div>
            <div style={{ fontSize: 10, color: "#52525b", textTransform: "uppercase", letterSpacing: "0.05em" }}>approved</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {/* Confidence bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: "#52525b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Confidence
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#a1a1aa" }}>
              {Math.round(result.confidence_score * 100)}%
            </span>
          </div>
          <div style={{ background: "#1a1a1a", borderRadius: 4, height: 5 }}>
            <div style={{ background: cfg.color, height: 5, borderRadius: 4,
                          width: `${result.confidence_score * 100}%`, transition: "width 0.7s ease" }} />
          </div>
        </div>

        {/* Financial breakdown */}
        {(result.decision === "APPROVED" || result.decision === "PARTIAL") && (
          <div style={{ background: "#0f0f0f", borderRadius: 8, padding: 14, marginBottom: 14,
                        border: "1px solid #1f1f1f", fontSize: 12 }}>
            {[
              ["Claim Amount",       `₹${parseFloat(claimAmount || 0).toLocaleString()}`],
              result.network_discount > 0 && ["Network Discount (20%)", `− ₹${result.network_discount.toLocaleString()}`],
              ["Copay (10%)",        `− ₹${result.copay_deducted.toLocaleString()}`],
              ["Approved Amount",    `₹${result.approved_amount.toLocaleString()}`],
            ].filter(Boolean).map(([label, value], i, arr) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0",
                                        borderTop: i === arr.length - 1 ? "1px solid #1f1f1f" : "none",
                                        fontWeight: i === arr.length - 1 ? 700 : 400, marginTop: i === arr.length - 1 ? 4 : 0 }}>
                <span style={{ color: "#52525b" }}>{label}</span>
                <span style={{ color: i === arr.length - 1 ? cfg.color : "#a1a1aa" }}>{value}</span>
              </div>
            ))}
            {result.cashless_approved && (
              <div style={{ marginTop: 10, padding: "5px 10px", background: "#0c1a3a",
                            border: "1px solid #1d4ed8", borderRadius: 4, color: "#60a5fa",
                            fontSize: 11, fontWeight: 700, textAlign: "center" }}>
                CASHLESS APPROVED
              </div>
            )}
          </div>
        )}

        {/* Excluded items */}
        {result.rejected_items?.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#52525b", marginBottom: 6,
                          textTransform: "uppercase", letterSpacing: "0.08em" }}>Excluded Items</div>
            {result.rejected_items.map(item => (
              <div key={item} style={{ padding: "5px 10px", background: "#1a0505", border: "1px solid #7f1d1d",
                                       borderRadius: 5, fontSize: 12, color: "#f87171", marginBottom: 4 }}>
                ✕ {item}
              </div>
            ))}
          </div>
        )}

        {/* Rejection reasons */}
        {result.rejection_reasons.length > 0 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#52525b", marginBottom: 6,
                          textTransform: "uppercase", letterSpacing: "0.08em" }}>Rejection Reasons</div>
            {result.rejection_reasons.map(reason => (
              <div key={reason} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#dc2626", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#a1a1aa", fontWeight: 600 }}>
                  {reason.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Fraud flags */}
        {result.flags?.length > 0 && (
          <div style={{ marginBottom: 14, padding: "10px 14px", background: "#1a0505",
                        border: "1px solid #7f1d1d", borderRadius: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#f87171", marginBottom: 6,
                          textTransform: "uppercase", letterSpacing: "0.08em" }}>Fraud Flags</div>
            {result.flags.map(flag => (
              <div key={flag} style={{ fontSize: 12, color: "#a1a1aa", marginBottom: 3 }}>🚩 {flag}</div>
            ))}
          </div>
        )}

        {/* Notes */}
        <div style={{ background: "#0f0f0f", border: "1px solid #1f1f1f", borderRadius: 6,
                      padding: 12, fontSize: 12, color: "#71717a", lineHeight: 1.6, marginBottom: 12 }}>
          <strong style={{ display: "block", fontSize: 10, color: "#52525b", fontWeight: 700,
                           textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Notes</strong>
          {result.notes}
        </div>

        {/* Next steps */}
        <div style={{ background: cfg.bg, borderRadius: 6, padding: 12, fontSize: 12,
                      color: cfg.color, lineHeight: 1.6, border: `1px solid ${cfg.border}` }}>
          <strong style={{ display: "block", fontSize: 10, fontWeight: 700,
                           textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>Next Steps</strong>
          {result.next_steps}
        </div>
      </div>
    </div>
  );
}
