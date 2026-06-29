import React from "react";

export function Label({ children, req }) {
  return (
    <div className="field-label">
      {children}
      {req && <span style={{ color: "#dc2626", marginLeft: 2 }}>*</span>}
    </div>
  );
}

export function Field({ label, req, children, half }) {
  return (
    <div style={{ marginBottom: 14, flex: half ? "0 0 calc(50% - 6px)" : "1 1 100%" }}>
      <Label req={req}>{label}</Label>
      {children}
    </div>
  );
}

export function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div className="section-title">{title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>{children}</div>
    </div>
  );
}

export const inputProps = {
  style: {
    width: "100%",
    padding: "9px 12px",
    border: "1px solid #2a2a2a",
    borderRadius: 6,
    fontSize: 13,
    fontFamily: "inherit",
    background: "#1a1a1a",
    color: "#f2f2f2",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  },
};

export const numberProps = {
  type: "number",
  min: 0,
  style: { ...inputProps.style },
};
