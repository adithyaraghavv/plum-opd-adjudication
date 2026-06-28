import React from "react";
import { POLICY } from "../constants.js";
import { Field, Section, inputProps, numberProps } from "./ui.jsx";

export default function ClaimForm({ form, onChange, onSubmit, processing, errors }) {
  function set(key, value) {
    onChange(key, value);
  }

  return (
    <div className="card" style={{ padding: 20 }}>
      <Section title="Member Information">
        <Field label="Member Name" req half>
          <input
            {...inputProps}
            className={errors?.member_name ? "input error" : "input"}
            value={form.member_name}
            onChange={(e) => set("member_name", e.target.value)}
            placeholder="Rajesh Kumar"
          />
          {errors?.member_name && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{errors.member_name}</div>}
        </Field>
        <Field label="Employee ID" req half>
          <input
            {...inputProps}
            className={errors?.member_id ? "input error" : "input"}
            value={form.member_id}
            onChange={(e) => set("member_id", e.target.value)}
            placeholder="EMP001"
          />
          {errors?.member_id && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{errors.member_id}</div>}
        </Field>
        <Field label="Treatment Date" req half>
          <input
            {...inputProps}
            type="date"
            className={errors?.treatment_date ? "input error" : "input"}
            value={form.treatment_date}
            onChange={(e) => set("treatment_date", e.target.value)}
          />
          {errors?.treatment_date && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{errors.treatment_date}</div>}
        </Field>
        <Field label="Policy Join Date" half>
          <input
            {...inputProps}
            type="date"
            value={form.join_date}
            onChange={(e) => set("join_date", e.target.value)}
          />
        </Field>
      </Section>

      <Section title="Hospital & Doctor">
        <Field label="Hospital / Clinic" half>
          <select
            style={inputProps.style}
            value={form.hospital}
            onChange={(e) => set("hospital", e.target.value)}
          >
            <option value="">Non-network / Other</option>
            {POLICY.network_hospitals.map((h) => (
              <option key={h} value={h}>{h} ✓ Network</option>
            ))}
          </select>
        </Field>
        <Field label="Options" half>
          <div style={{ display: "flex", gap: 16, paddingTop: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={form.is_cashless} onChange={(e) => set("is_cashless", e.target.checked)} />
              Cashless
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={form.has_prescription} onChange={(e) => set("has_prescription", e.target.checked)} />
              Prescription
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={form.has_bill} onChange={(e) => set("has_bill", e.target.checked)} />
              Bill
            </label>
          </div>
        </Field>
        <Field label="Doctor Name" req half>
          <input
            {...inputProps}
            className={errors?.doctor_name ? "input error" : "input"}
            value={form.doctor_name}
            onChange={(e) => set("doctor_name", e.target.value)}
            placeholder="Dr. Sharma"
          />
          {errors?.doctor_name && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{errors.doctor_name}</div>}
        </Field>
        <Field label="Doctor Reg. No." req half>
          <input
            {...inputProps}
            value={form.doctor_reg}
            onChange={(e) => set("doctor_reg", e.target.value)}
            placeholder="KA/45678/2015"
          />
          <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>Format: STATE/NUMBER/YEAR or AYUR/STATE/NUMBER/YEAR</div>
        </Field>
        <Field label="Diagnosis" req>
          <input
            {...inputProps}
            className={errors?.diagnosis ? "input error" : "input"}
            value={form.diagnosis}
            onChange={(e) => set("diagnosis", e.target.value)}
            placeholder="e.g. Viral fever, Type 2 Diabetes"
          />
          {errors?.diagnosis && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{errors.diagnosis}</div>}
        </Field>
      </Section>

      <Section title="Bill Breakdown (₹)">
        <Field label="Total Claim Amount" req half>
          <input
            {...numberProps}
            className={errors?.claim_amount ? "input error" : "input"}
            value={form.claim_amount}
            onChange={(e) => set("claim_amount", e.target.value)}
          />
          {errors?.claim_amount && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{errors.claim_amount}</div>}
        </Field>
        <Field label="Consultation Fee" half>
          <input {...numberProps} value={form.consultation_fee} onChange={(e) => set("consultation_fee", e.target.value)} />
        </Field>
        <Field label="Medicines" half>
          <input {...numberProps} value={form.medicine_cost} onChange={(e) => set("medicine_cost", e.target.value)} />
        </Field>
        <Field label="Diagnostic Tests" half>
          <input {...numberProps} value={form.diagnostic_cost} onChange={(e) => set("diagnostic_cost", e.target.value)} />
        </Field>
        <Field label="Dental Charges" half>
          <input {...numberProps} value={form.dental_cost} onChange={(e) => set("dental_cost", e.target.value)} />
        </Field>
        <Field label="Other / Alt. Medicine" half>
          <input {...numberProps} value={form.other_cost} onChange={(e) => set("other_cost", e.target.value)} />
        </Field>
      </Section>

      <Section title="Clinical Details">
        <Field label="Medicines Prescribed">
          <input
            {...inputProps}
            value={form.medicines_list}
            onChange={(e) => set("medicines_list", e.target.value)}
            placeholder="Paracetamol 650mg, Vitamin C"
          />
        </Field>
        <Field label="Tests Prescribed">
          <input
            {...inputProps}
            value={form.tests_list}
            onChange={(e) => set("tests_list", e.target.value)}
            placeholder="CBC, Blood Sugar"
          />
        </Field>
        <Field label="Procedures">
          <input
            {...inputProps}
            value={form.procedures_list}
            onChange={(e) => set("procedures_list", e.target.value)}
            placeholder="Root canal, Teeth whitening"
          />
        </Field>
        <Field label="Previous Claims Today" half>
          <input
            {...numberProps}
            min={0}
            value={form.prev_claims_today}
            onChange={(e) => set("prev_claims_today", e.target.value)}
          />
        </Field>
      </Section>

      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn-primary" onClick={onSubmit} disabled={processing}>
          {processing ? "Adjudicating..." : "Process Claim →"}
        </button>
      </div>
    </div>
  );
}
