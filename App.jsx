import React, { useState, useRef } from "react";
import { POLICY, DC, EMPTY_FORM } from "./constants.js";
import { adjudicateClaim } from "./adjudication.js";
import UploadBox from "./components/UploadBox.jsx";
import ClaimForm from "./components/ClaimForm.jsx";
import ResultPanel from "./components/ResultPanel.jsx";
import TestCasesTab from "./components/TestCasesTab.jsx";
import HistoryTab from "./components/HistoryTab.jsx";
import PolicyTab from "./components/PolicyTab.jsx";

const TABS = [
  { id: "submit", label: "Submit Claim" },
  { id: "test", label: "Test Cases" },
  { id: "history", label: "History" },
  { id: "policy", label: "Policy" },
];

function validateForm(form) {
  const errors = {};
  if (!form.member_name.trim()) errors.member_name = "Required";
  if (!form.member_id.trim()) errors.member_id = "Required";
  if (!form.treatment_date) errors.treatment_date = "Required";
  if (!form.diagnosis.trim()) errors.diagnosis = "Required";
  if (!form.claim_amount || parseFloat(form.claim_amount) <= 0) errors.claim_amount = "Enter a valid amount";
  if (!form.doctor_name.trim()) errors.doctor_name = "Required";
  return errors;
}

export default function App() {
  const [tab, setTab] = useState("submit");
  const [form, setForm] = useState(EMPTY_FORM);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const [history, setHistory] = useState([]);
  const [apiKey, setApiKey] = useState("");
  const [showApiInput, setShowApiInput] = useState(false);
  const resultRef = useRef();

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function handleExtracted(extracted) {
    setForm((f) => ({
      ...f,
      doctor_name: extracted.doctor_name || f.doctor_name,
      doctor_reg: extracted.doctor_reg || f.doctor_reg,
      member_name: extracted.patient_name || f.member_name,
      diagnosis: extracted.diagnosis || f.diagnosis,
      treatment_date: extracted.treatment_date
        ? extracted.treatment_date.replace(/\//g, "-")
        : f.treatment_date,
      medicines_list: extracted.medicines_prescribed?.join(", ") || f.medicines_list,
      tests_list: extracted.tests_prescribed?.join(", ") || f.tests_list,
      procedures_list: extracted.procedures?.join(", ") || f.procedures_list,
      consultation_fee: extracted.consultation_fee || f.consultation_fee,
      medicine_cost: extracted.medicine_cost || f.medicine_cost,
      diagnostic_cost: extracted.diagnostic_cost || f.diagnostic_cost,
      dental_cost: extracted.dental_cost || f.dental_cost,
      other_cost: extracted.other_cost || f.other_cost,
      claim_amount: extracted.total_amount || f.claim_amount,
      hospital: extracted.hospital_name || f.hospital,
    }));
  }

  async function handleSubmit() {
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setProcessing(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 200));

    const res = adjudicateClaim(form, history);
    const id = `CLM_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    const full = {
      ...res,
      claim_id: id,
      member_name: form.member_name,
      member_id: form.member_id,
      treatment_date: form.treatment_date,
      diagnosis: form.diagnosis,
      claim_amount: form.claim_amount,
      timestamp: new Date().toLocaleString(),
    };

    setResult(full);
    setHistory((h) => [full, ...h].slice(0, 50));
    setProcessing(false);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  function loadTestCase(tc) {
    setForm({ ...EMPTY_FORM, ...tc.data });
    setResult(null);
    setErrors({});
    setTab("submit");
  }

  function clearForm() {
    setForm(EMPTY_FORM);
    setResult(null);
    setErrors({});
  }

  const totalApproved = history.reduce((s, h) => s + h.approved_amount, 0);
  const annualRemaining = Math.max(0, POLICY.annual_limit - totalApproved);

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: "#f3f4f6", minHeight: "100vh", paddingBottom: 48 }}>
      {/* Header */}
      <header style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "0 24px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 12, height: 56, flexWrap: "wrap" }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "white", fontSize: 16, fontWeight: 800 }}>P</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Plum OPD Adjudication</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>
              Policy PLUM_OPD_2024 · Annual ₹50K · Per Claim ₹5K
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {/* Annual limit badge */}
            {history.length > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, color: annualRemaining < 10000 ? "#b91c1c" : "#15803d", background: annualRemaining < 10000 ? "#fef2f2" : "#f0fdf4", padding: "3px 10px", borderRadius: 20, border: `1px solid ${annualRemaining < 10000 ? "#fca5a5" : "#86efac"}` }}>
                ₹{annualRemaining.toLocaleString()} remaining
              </span>
            )}
            {["10% Copay", "20% Network Discount", "30-day Window"].map((b) => (
              <span key={b} style={{ padding: "3px 10px", borderRadius: 20, background: "#f3f4f6", fontSize: 11, fontWeight: 600, color: "#374151" }}>
                {b}
              </span>
            ))}
            <button
              onClick={() => setShowApiInput((v) => !v)}
              style={{ padding: "4px 12px", borderRadius: 6, background: apiKey ? "#f0fdf4" : "#fef9c3", border: `1px solid ${apiKey ? "#86efac" : "#fde047"}`, fontSize: 11, fontWeight: 700, cursor: "pointer", color: apiKey ? "#15803d" : "#854d0e" }}
            >
              {apiKey ? "✓ API Key Set" : "+ Add API Key"}
            </button>
          </div>
        </div>

        {showApiInput && (
          <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input
              style={{ width: "100%", maxWidth: 420, padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 12, fontFamily: "inherit", outline: "none" }}
              type="password"
              placeholder="Paste Anthropic API key (sk-ant-...) for document extraction"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button
              onClick={() => setShowApiInput(false)}
              style={{ padding: "6px 14px", background: "#7c3aed", color: "white", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}
            >
              Save
            </button>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>Key stays in browser only — never sent anywhere except Anthropic</span>
          </div>
        )}
      </header>

      {/* Tabs */}
      <nav style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "0 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "12px 18px",
                fontSize: 13,
                fontWeight: 600,
                color: tab === t.id ? "#7c3aed" : "#6b7280",
                background: "none",
                border: "none",
                borderBottom: tab === t.id ? "2px solid #7c3aed" : "2px solid transparent",
                cursor: "pointer",
              }}
            >
              {t.id === "history" ? `History (${history.length})` : t.label}
            </button>
          ))}
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: "24px auto", padding: "0 24px" }}>
        {/* SUBMIT TAB */}
        {tab === "submit" && (
          <div className="tab-grid">
            <div>
              <UploadBox apiKey={apiKey} onFilesExtracted={handleExtracted} onNeedApiKey={() => setShowApiInput(true)} />
              <ClaimForm
                form={form}
                onChange={setField}
                onSubmit={handleSubmit}
                onClear={clearForm}
                processing={processing}
                errors={errors}
              />
            </div>
            <div className="result-sticky">
              <div ref={resultRef} />
              <ResultPanel result={result} claimAmount={form.claim_amount} processing={processing} />
            </div>
          </div>
        )}

        {tab === "test" && <TestCasesTab onLoad={loadTestCase} />}
        {tab === "history" && <HistoryTab history={history} />}
        {tab === "policy" && <PolicyTab />}
      </main>
    </div>
  );
}
