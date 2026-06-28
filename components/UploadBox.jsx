import React, { useRef, useState, useCallback } from "react";

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

export default function UploadBox({ apiKey, onFilesExtracted }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const handleFiles = useCallback(
    async (files) => {
      const valid = Array.from(files).filter(
        (f) => f.type.startsWith("image/") || f.type === "application/pdf"
      );
      if (!valid.length) return;

      const newFiles = valid.map((f) => ({ file: f, name: f.name, status: "queued" }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      setExtracting(true);

      const allExtracted = {};

      for (let i = 0; i < valid.length; i++) {
        const file = valid[i];
        setUploadedFiles((prev) =>
          prev.map((u, idx) =>
            idx === prev.length - valid.length + i ? { ...u, status: "processing" } : u
          )
        );

        try {
          const b64 = await new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result.split(",")[1]);
            reader.onerror = rej;
            reader.readAsDataURL(file);
          });

          const mediaType = file.type === "application/pdf" ? "application/pdf" : file.type;

          const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
              model: CLAUDE_MODEL,
              max_tokens: 1500,
              system:
                "You are a medical document OCR expert. Extract all data and return ONLY valid JSON, no markdown.",
              messages: [
                {
                  role: "user",
                  content: [
                    { type: "image", source: { type: "base64", media_type: mediaType, data: b64 } },
                    {
                      type: "text",
                      text: `Extract from this medical document and return JSON:
{"doctor_name":"","doctor_reg":"","patient_name":"","diagnosis":"","treatment_date":"YYYY-MM-DD","medicines_prescribed":[],"tests_prescribed":[],"procedures":[],"consultation_fee":0,"medicine_cost":0,"diagnostic_cost":0,"dental_cost":0,"other_cost":0,"total_amount":0,"hospital_name":""}
Return ONLY the JSON.`,
                    },
                  ],
                },
              ],
            }),
          });

          const data = await response.json();
          const text = data.content?.map((b) => b.text || "").join("") || "{}";
          const clean = text.replace(/```json|```/g, "").trim();
          const extracted = JSON.parse(clean);

          Object.assign(allExtracted, extracted);
          setUploadedFiles((prev) =>
            prev.map((u, idx) =>
              idx === prev.length - valid.length + i ? { ...u, status: "done", extracted } : u
            )
          );
        } catch {
          setUploadedFiles((prev) =>
            prev.map((u, idx) =>
              idx === prev.length - valid.length + i ? { ...u, status: "error" } : u
            )
          );
        }
      }

      if (Object.keys(allExtracted).length) {
        onFilesExtracted(allExtracted);
      }
      setExtracting(false);
    },
    [apiKey, onFilesExtracted]
  );

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  const hasExtracted = uploadedFiles.some((f) => f.status === "done");

  return (
    <div className="card" style={{ padding: 20, marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        Upload Medical Documents
        <span style={{ fontSize: 11, fontWeight: 500, color: "#7c3aed", background: "#ede9fe", padding: "2px 8px", borderRadius: 20 }}>
          AI Extraction
        </span>
        {!apiKey && (
          <span style={{ fontSize: 11, color: "#b45309", background: "#fffbeb", padding: "2px 8px", borderRadius: 20 }}>
            Add API key to enable
          </span>
        )}
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? "#7c3aed" : "#d1d5db"}`,
          borderRadius: 8,
          padding: "24px 16px",
          textAlign: "center",
          cursor: "pointer",
          background: dragOver ? "#faf5ff" : "#fafafa",
          transition: "all 0.15s",
        }}
      >
        <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
          {apiKey ? "Drop bills & prescriptions here or click to browse" : "Add API key above to enable document upload"}
        </div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
          PNG, JPG, PDF · AI will extract and auto-fill the form
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
      />

      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {uploadedFiles.map((f, i) => (
            <div
              key={i}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#f9fafb", borderRadius: 6, marginBottom: 6, fontSize: 12 }}
            >
              <span>📎</span>
              <span style={{ flex: 1, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {f.name}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 20,
                  color: { queued: "#9ca3af", processing: "#b45309", done: "#15803d", error: "#b91c1c" }[f.status],
                  background: { queued: "#f3f4f6", processing: "#fffbeb", done: "#f0fdf4", error: "#fef2f2" }[f.status],
                }}
              >
                {{ queued: "Queued", processing: "Extracting...", done: "✓ Extracted", error: "Failed" }[f.status]}
              </span>
            </div>
          ))}
          {extracting && (
            <div style={{ fontSize: 12, color: "#7c3aed", fontWeight: 600, textAlign: "center", padding: "8px 0" }}>
              AI extracting data...
            </div>
          )}
          {hasExtracted && !extracting && (
            <div style={{ fontSize: 12, color: "#15803d", fontWeight: 600, padding: "8px 10px", background: "#f0fdf4", borderRadius: 6, marginTop: 6 }}>
              ✓ Form auto-filled from documents. Review and submit.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
