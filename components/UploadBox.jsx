import React, { useRef, useState, useCallback } from "react";

const CLAUDE_MODEL = "claude-haiku-4-5-20251001";

const STATUS_COLOR = {
  queued:     { color: "#52525b", bg: "#1a1a1a"  },
  processing: { color: "#fbbf24", bg: "#1c1400"  },
  done:       { color: "#4ade80", bg: "#052e16"  },
  error:      { color: "#f87171", bg: "#1a0505"  },
};
const STATUS_LABEL = { queued: "Queued", processing: "Extracting…", done: "✓ Done", error: "Failed" };

export default function UploadBox({ apiKey, onFilesExtracted, onNeedApiKey }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [extracting,    setExtracting]    = useState(false);
  const [dragOver,      setDragOver]      = useState(false);
  const fileRef = useRef();

  const handleFiles = useCallback(async (files) => {
    if (!apiKey) { onNeedApiKey?.(); return; }
    const valid = Array.from(files).filter(
      f => f.type.startsWith("image/") || f.type === "application/pdf"
    );
    if (!valid.length) return;

    const newFiles = valid.map(f => ({ file: f, name: f.name, status: "queued" }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    setExtracting(true);
    const allExtracted = {};

    for (let i = 0; i < valid.length; i++) {
      const file = valid[i];
      setUploadedFiles(prev => prev.map((u, idx) =>
        idx === prev.length - valid.length + i ? { ...u, status: "processing" } : u
      ));
      try {
        const b64 = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result.split(",")[1]);
          r.onerror = rej;
          r.readAsDataURL(file);
        });
        const mediaType = file.type === "application/pdf" ? "application/pdf" : file.type;
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({
            model: CLAUDE_MODEL, max_tokens: 1500,
            system: "You are a medical document OCR expert. Extract all data and return ONLY valid JSON, no markdown.",
            messages: [{ role: "user", content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: b64 } },
              { type: "text", text: `Extract from this medical document and return JSON:
{"doctor_name":"","doctor_reg":"","patient_name":"","diagnosis":"","treatment_date":"YYYY-MM-DD","medicines_prescribed":[],"tests_prescribed":[],"procedures":[],"consultation_fee":0,"medicine_cost":0,"diagnostic_cost":0,"dental_cost":0,"other_cost":0,"total_amount":0,"hospital_name":""}
Return ONLY the JSON.` }
            ]}],
          }),
        });
        const data = await response.json();
        const text = data.content?.map(b => b.text || "").join("") || "{}";
        const extracted = JSON.parse(text.replace(/```json|```/g, "").trim());
        Object.assign(allExtracted, extracted);
        setUploadedFiles(prev => prev.map((u, idx) =>
          idx === prev.length - valid.length + i ? { ...u, status: "done", extracted } : u
        ));
      } catch {
        setUploadedFiles(prev => prev.map((u, idx) =>
          idx === prev.length - valid.length + i ? { ...u, status: "error" } : u
        ));
      }
    }

    if (Object.keys(allExtracted).length) onFilesExtracted(allExtracted);
    setExtracting(false);
  }, [apiKey, onFilesExtracted, onNeedApiKey]);

  function onDrop(e) { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }
  const hasExtracted = uploadedFiles.some(f => f.status === "done");

  return (
    <div className="card" style={{ padding: 20, marginBottom: 16 }}>
      {/* Title row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#f2f2f2" }}>Upload Medical Documents</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", background: "#1a0505",
                       border: "1px solid #7f1d1d", padding: "2px 8px", borderRadius: 4 }}>
          AI Extraction
        </span>
        {!apiKey && (
          <span style={{ fontSize: 10, fontWeight: 600, color: "#fbbf24", background: "#1c1400",
                         border: "1px solid #854d0e", padding: "2px 8px", borderRadius: 4 }}>
            Add API key to enable
          </span>
        )}
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => apiKey ? fileRef.current?.click() : onNeedApiKey?.()}
        style={{
          border: `2px dashed ${dragOver ? "#dc2626" : "#2a2a2a"}`,
          borderRadius: 8, padding: "28px 16px", textAlign: "center", cursor: "pointer",
          background: dragOver ? "#1a0505" : "#0f0f0f",
          transition: "all 0.15s",
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#a1a1aa" }}>
          {apiKey ? "Drop bills & prescriptions here, or click to browse" : "Add API key to enable document upload"}
        </div>
        <div style={{ fontSize: 11, color: "#52525b", marginTop: 4 }}>PNG · JPG · PDF</div>
      </div>
      <input ref={fileRef} type="file" multiple accept="image/*,application/pdf"
        style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />

      {/* File list */}
      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {uploadedFiles.map((f, i) => {
            const s = STATUS_COLOR[f.status];
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
                                    background: "#0f0f0f", borderRadius: 6, marginBottom: 5, border: "1px solid #1f1f1f" }}>
                <span style={{ fontSize: 14 }}>📎</span>
                <span style={{ flex: 1, fontSize: 12, color: "#a1a1aa", overflow: "hidden",
                               textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                               color: s.color, background: s.bg }}>{STATUS_LABEL[f.status]}</span>
              </div>
            );
          })}
          {extracting && (
            <div style={{ fontSize: 12, color: "#dc2626", fontWeight: 600, textAlign: "center", padding: "8px 0" }}>
              Extracting data with AI…
            </div>
          )}
          {hasExtracted && !extracting && (
            <div style={{ fontSize: 12, color: "#4ade80", fontWeight: 600, padding: "8px 12px",
                          background: "#052e16", border: "1px solid #14532d", borderRadius: 6, marginTop: 6 }}>
              ✓ Form auto-filled from documents. Review and submit.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
