import React from "react";

export function Label({ children, req }) {
  return (
    <div className="field-label">
      {children}
      {req && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
    </div>
  );
}

export function Field({ label, req, children, half }) {
  return (
    <div style={{ marginBottom: 12, flex: half ? "0 0 calc(50% - 6px)" : "1 1 100%" }}>
      <Label req={req}>{label}</Label>
      {children}
    </div>
  );
}

export function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div className="section-title">{title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>{children}</div>
    </div>
  );
}

// Shared props for text/select inputs
export const inputProps = {
  style: {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 13,
    outline: "none",
    background: "white",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.15s",
  },
};

export const numberProps = {
  type: "number",
  min: 0,
  style: { ...inputProps.style },
};
