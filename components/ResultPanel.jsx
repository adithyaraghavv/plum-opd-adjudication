import React from "react";
import { DC } from "../constants.js";

export default function ResultPanel({ result, claimAmount, processing }) {
  if (processing) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center" }}>
        <div className="spinner" />
        <div style={{ fontSize: 13, color: "#6b7280" }}>Running adjudication engine...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
          Ready to process
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af" }}>
          Fill the form or load a test case, then click Process Claim
        </div>
      </div>
    );
  }

  const cfg = DC[result.decision];

  return (
    <div style={{ background: "white", borderRadius: 10, border: `2px solid ${cfg.border}`, overflow: "hidden" }}>
      {/* Decision Header */}
      <div style={{ background: cfg.bg, padding: "16px 20px", borderBottom: `1px solid ${cfg.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: cfg.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
            {cfg.icon}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: cfg.color }}>{cfg.label}</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>
              {result.claim_id} · {result.timestamp}
            </div>
          </div>
          <div style={{ marginLeft: "auto", textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: cfg.color }}>
              ₹{result.approved_amount.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>approved</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 20px" }}>
        {/* Confidence Bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Confidence
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#374151" }}>
              {Math.round(result.confidence_score * 100)}%
            </span>
          </div>
          <div style={{ background: "#f3f4f6", borderRadius: 4, height: 6 }}>
            <div
              style={{ background: cfg.color, height: 6, borderRadius: 4, width: `${result.confidence_score * 100}%`, transition: "width 0.6s ease" }}
            />
          </div>
        </div>

        {/* Financial Breakdown */}
        {(result.decision === "APPROVED" || result.decision === "PARTIAL") && (
          <div style={{ background: "#f9fafb", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 12 }}>
            {[
              ["Claim Amount", `₹${parseFloat(claimAmount || 0).toLocaleString()}`],
              result.network_discount > 0 && ["Network Discount (20%)", `− ₹${result.network_discount.toLocaleString()}`],
              ["Copay (10%)", `− ₹${result.copay_deducted.toLocaleString()}`],
              ["Approved Amount", `₹${result.approved_amount.toLocaleString()}`],
            ]
              .filter(Boolean)
              .map(([label, value], i, arr) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "3px 0",
                    borderTop: i === arr.length - 1 ? "1px solid #e5e7eb" : "none",
                    fontWeight: i === arr.length - 1 ? 700 : 400,
                  }}
                >
                  <span style={{ color: "#6b7280" }}>{label}</span>
                  <span style={{ color: "#111827" }}>{value}</span>
                </div>
              ))}
            {result.cashless_approved && (
              <div style={{ marginTop: 8, padding: "4px 10px", background: "#dbeafe", borderRadius: 4, color: "#1d4ed8", fontSize: 11, fontWeight: 700, textAlign: "center" }}>
                CASHLESS APPROVED
              </div>
            )}
          </div>
        )}

        {/* Excluded Items */}
        {result.rejected_items?.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Excluded Items
            </div>
            {result.rejected_items.map((item) => (
              <div key={item} style={{ padding: "4px 10px", background: "#fef2f2", borderRadius: 4, fontSize: 12, color: "#b91c1c", marginBottom: 4 }}>
                ✕ {item}
              </div>
            ))}
          </div>
        )}

        {/* Rejection Reasons */}
        {result.rejection_reasons.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Rejection Reasons
            </div>
            {result.rejection_reasons.map((reason) => (
              <div key={reason} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: "#374151", fontWeight: 600 }}>
                  {reason.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Fraud Flags */}
        {result.flags?.length > 0 && (
          <div style={{ marginBottom: 12, padding: "8px 12px", background: "#faf5ff", borderRadius: 6, border: "1px solid #c4b5fd" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6d28d9", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Fraud Flags
            </div>
            {result.flags.map((flag) => (
              <div key={flag} style={{ fontSize: 12, color: "#374151", marginBottom: 2 }}>
                🚩 {flag}
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        <div style={{ background: "#f9fafb", borderRadius: 6, padding: 10, fontSize: 12, color: "#4b5563", lineHeight: 1.6, marginBottom: 12 }}>
          <strong style={{ display: "block", fontSize: 11, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
            Notes
          </strong>
          {result.notes}
        </div>

        {/* Next Steps */}
        <div style={{ background: cfg.bg, borderRadius: 6, padding: 10, fontSize: 12, color: cfg.color, lineHeight: 1.6, border: `1px solid ${cfg.border}` }}>
          <strong style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
            Next Steps
          </strong>
          {result.next_steps}
        </div>
      </div>
    </div>
  );
}
