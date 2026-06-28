import React, { useState, useRef } from "react";
import { POLICY, EMPTY_FORM } from "./constants.js";
import { adjudicateClaim } from "./adjudication.js";
import UploadBox from "./components/UploadBox.jsx";
import ClaimForm from "./components/ClaimForm.jsx";
import ResultPanel from "./components/ResultPanel.jsx";
import TestCasesTab from "./components/TestCasesTab.jsx";
import HistoryTab from "./components/HistoryTab.jsx";
import PolicyTab from "./components/PolicyTab.jsx";

const TABS = [
  { id: "submit", label: "Submit Claim" },
  { id: "test",   label: "Test Cases"   },
  { id: "history",label: "History"      },
  { id: "policy", label: "Policy"       },
];

function validateForm(form) {
  const errors = {};
  if (!form.member_name.trim())                          errors.member_name   = "Required";
  if (!form.member_id.trim())                            errors.member_id     = "Required";
  if (!form.treatment_date)                              errors.treatment_date= "Required";
  if (!form.diagnosis.trim())                            errors.diagnosis     = "Required";
  if (!form.claim_amount || parseFloat(form.claim_amount) <= 0) errors.claim_amount = "Enter a valid amount";
  if (!form.doctor_name.trim())                          errors.doctor_name   = "Required";
  return errors;
}

export default function App() {
  const [tab, setTab]                     = useState("submit");
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [result, setResult]               = useState(null);
  const [processing, setProcessing]       = useState(false);
  const [errors, setErrors]               = useState({});
  const [history, setHistory]             = useState([]);
  const [apiKey, setApiKey]               = useState("");
  const [showApiInput, setShowApiInput]   = useState(false);
  const resultRef = useRef();

  function setField(key, value) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
  }

  function handleExtracted(extracted) {
    setForm(f => ({
      ...f,
      doctor_name:      extracted.doctor_name      || f.doctor_name,
      doctor_reg:       extracted.doctor_reg       || f.doctor_reg,
      member_name:      extracted.patient_name     || f.member_name,
      diagnosis:        extracted.diagnosis        || f.diagnosis,
      treatment_date:   extracted.treatment_date   ? extracted.treatment_date.replace(/\//g, "-") : f.treatment_date,
      medicines_list:   extracted.medicines_prescribed?.join(", ") || f.medicines_list,
      tests_list:       extracted.tests_prescribed?.join(", ")     || f.tests_list,
      procedures_list:  extracted.procedures?.join(", ")           || f.procedures_list,
      consultation_fee: extracted.consultation_fee || f.consultation_fee,
      medicine_cost:    extracted.medicine_cost    || f.medicine_cost,
      diagnostic_cost:  extracted.diagnostic_cost  || f.diagnostic_cost,
      dental_cost:      extracted.dental_cost      || f.dental_cost,
      other_cost:       extracted.other_cost       || f.other_cost,
      claim_amount:     extracted.total_amount     || f.claim_amount,
      hospital:         extracted.hospital_name    || f.hospital,
    }));
  }

  async function handleSubmit() {
    const errs = validateForm(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setProcessing(true); setResult(null);
    await new Promise(r => setTimeout(r, 220));

    const res  = adjudicateClaim(form, history);
    const id   = `CLM_${Math.random().toString(36).substr(2,5).toUpperCase()}`;
    const full = { ...res, claim_id: id, member_name: form.member_name, member_id: form.member_id,
                   treatment_date: form.treatment_date, diagnosis: form.diagnosis,
                   claim_amount: form.claim_amount, timestamp: new Date().toLocaleString() };

    setResult(full);
    setHistory(h => [full, ...h].slice(0, 50));
    setProcessing(false);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  function loadTestCase(tc) {
    setForm({ ...EMPTY_FORM, ...tc.data });
    setResult(null); setErrors({}); setTab("submit");
  }

  function clearForm() {
    setForm(EMPTY_FORM); setResult(null); setErrors({});
  }

  const totalApproved   = history.reduce((s, h) => s + h.approved_amount, 0);
  const annualRemaining = Math.max(0, POLICY.annual_limit - totalApproved);

  /* ─── styles ─── */
  const S = {
    pill: { padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600,
            background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#a1a1aa" },
    tab: (active) => ({
      padding: "14px 20px", fontSize: 13, fontWeight: 600, background: "none",
      border: "none", borderBottom: active ? "2px solid #dc2626" : "2px solid transparent",
      color: active ? "#dc2626" : "#52525b", cursor: "pointer", transition: "color 0.15s",
      letterSpacing: "0.01em",
    }),
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", paddingBottom: 56 }}>

      {/* ── Red top bar ── */}
      <header style={{ background: "#dc2626", padding: "0 28px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", gap: 16, height: 56 }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(0,0,0,0.25)",
                          display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontSize: 15, fontWeight: 900 }}>P</span>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "white", letterSpacing: "-0.3px" }}>
                Plum OPD Adjudication
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.65)", letterSpacing: "0.04em" }}>
                Policy PLUM_OPD_2024 · Annual ₹50K · Per Claim ₹5K
              </div>
            </div>
          </div>

          {/* Right side */}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            {history.length > 0 && (
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4,
                             color: "white", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.2)" }}>
                ₹{annualRemaining.toLocaleString()} left
              </span>
            )}
            {["10% Copay", "20% Discount", "30-day Window"].map(b => (
              <span key={b} style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                                     background: "rgba(0,0,0,0.2)", color: "rgba(255,255,255,0.8)",
                                     border: "1px solid rgba(255,255,255,0.15)" }}>
                {b}
              </span>
            ))}
            <button onClick={() => setShowApiInput(v => !v)}
              style={{ padding: "5px 14px", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer",
                       background: apiKey ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.15)",
                       border: "1px solid rgba(255,255,255,0.3)", color: "white" }}>
              {apiKey ? "✓ API Key" : "+ API Key"}
            </button>
          </div>
        </div>

        {showApiInput && (
          <div style={{ maxWidth: 1120, margin: "0 auto", paddingBottom: 12, paddingTop: 8,
                        borderTop: "1px solid rgba(255,255,255,0.2)", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <input type="password" placeholder="Paste Anthropic API key (sk-ant-...)"
              value={apiKey} onChange={e => setApiKey(e.target.value)}
              style={{ maxWidth: 380, padding: "7px 12px", border: "1px solid rgba(255,255,255,0.3)",
                       borderRadius: 6, fontSize: 12, fontFamily: "inherit", outline: "none",
                       background: "rgba(0,0,0,0.3)", color: "white", width: "100%" }} />
            <button onClick={() => setShowApiInput(false)}
              style={{ padding: "7px 16px", background: "rgba(0,0,0,0.4)", color: "white",
                       border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Save
            </button>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
              Stays in browser — only sent to Anthropic for OCR
            </span>
          </div>
        )}
      </header>

      {/* ── Tab bar ── */}
      <nav style={{ background: "#111111", borderBottom: "1px solid #1f1f1f", padding: "0 28px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={S.tab(tab === t.id)}>
              {t.id === "history" ? `History (${history.length})` : t.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Content ── */}
      <main style={{ maxWidth: 1120, margin: "24px auto", padding: "0 28px" }}>

        {tab === "submit" && (
          <div className="tab-grid">
            <div>
              <UploadBox apiKey={apiKey} onFilesExtracted={handleExtracted}
                         onNeedApiKey={() => setShowApiInput(true)} />
              <ClaimForm form={form} onChange={setField} onSubmit={handleSubmit}
                         onClear={clearForm} processing={processing} errors={errors} />
            </div>
            <div className="result-sticky">
              <div ref={resultRef} />
              <ResultPanel result={result} claimAmount={form.claim_amount} processing={processing} />
            </div>
          </div>
        )}

        {tab === "test"    && <TestCasesTab onLoad={loadTestCase} />}
        {tab === "history" && <HistoryTab history={history} />}
        {tab === "policy"  && <PolicyTab />}
      </main>
    </div>
  );
}
