import React, { useState, useRef, useCallback } from "react";

const POLICY = {
  annual_limit:50000, per_claim_limit:5000,
  consultation_sub_limit:2000, pharmacy_sub_limit:15000,
  diagnostic_sub_limit:10000, dental_sub_limit:10000,
  vision_sub_limit:5000, alternative_sub_limit:8000,
  copay_percentage:10, network_discount:20,
  min_claim_amount:500, submission_deadline_days:30,
  network_hospitals:["Apollo Hospitals","Fortis Healthcare","Max Healthcare","Manipal Hospitals","Narayana Health"],
  exclusion_keywords:["cosmetic","weight loss","infertility","experimental","self-inflicted","adventure sports","hiv","aids","alcoholism","drug abuse","obesity","bariatric","whitening","lasik"],
  waiting_periods:{initial:30,pre_existing:365,diabetes:90,hypertension:90,maternity:270,joint_replacement:730},
  pre_auth_required:["MRI","CT Scan"],
};

const TODAY = new Date().toISOString().split("T")[0];
const JOIN  = "2025-01-01";
const RECENT_JOIN = new Date(Date.now()-15*24*60*60*1000).toISOString().split("T")[0];

const TEST_CASES = [
  {id:"TC001",label:"Simple Consultation",tag:"APPROVED",tagColor:"#15803d",data:{member_name:"Rajesh Kumar",member_id:"EMP001",treatment_date:TODAY,join_date:JOIN,claim_amount:1500,hospital:"",is_cashless:false,doctor_name:"Dr. Sharma",doctor_reg:"KA/45678/2015",diagnosis:"Viral fever",consultation_fee:1000,medicine_cost:0,diagnostic_cost:500,dental_cost:0,other_cost:0,medicines_list:"Paracetamol 650mg, Vitamin C",tests_list:"CBC, Dengue test",procedures_list:"",prev_claims_today:0,has_prescription:true,has_bill:true}},
  {id:"TC002",label:"Dental Partial Approval",tag:"PARTIAL",tagColor:"#b45309",data:{member_name:"Priya Singh",member_id:"EMP002",treatment_date:TODAY,join_date:JOIN,claim_amount:12000,hospital:"",is_cashless:false,doctor_name:"Dr. Patel",doctor_reg:"MH/23456/2018",diagnosis:"Tooth decay requiring root canal",consultation_fee:0,medicine_cost:0,diagnostic_cost:0,dental_cost:12000,other_cost:0,medicines_list:"",tests_list:"",procedures_list:"Root canal treatment, Teeth whitening",prev_claims_today:0,has_prescription:true,has_bill:true}},
  {id:"TC003",label:"Limit Exceeded",tag:"REJECTED",tagColor:"#b91c1c",data:{member_name:"Amit Verma",member_id:"EMP003",treatment_date:TODAY,join_date:JOIN,claim_amount:7500,hospital:"",is_cashless:false,doctor_name:"Dr. Gupta",doctor_reg:"DL/34567/2016",diagnosis:"Gastroenteritis",consultation_fee:2000,medicine_cost:5500,diagnostic_cost:0,dental_cost:0,other_cost:0,medicines_list:"Antibiotics, Probiotics",tests_list:"",procedures_list:"",prev_claims_today:0,has_prescription:true,has_bill:true}},
  {id:"TC004",label:"Missing Documents",tag:"REJECTED",tagColor:"#b91c1c",data:{member_name:"Sneha Reddy",member_id:"EMP004",treatment_date:TODAY,join_date:JOIN,claim_amount:2000,hospital:"",is_cashless:false,doctor_name:"",doctor_reg:"",diagnosis:"General consultation",consultation_fee:1500,medicine_cost:500,diagnostic_cost:0,dental_cost:0,other_cost:0,medicines_list:"",tests_list:"",procedures_list:"",prev_claims_today:0,has_prescription:false,has_bill:true}},
  {id:"TC005",label:"Waiting Period – Diabetes",tag:"REJECTED",tagColor:"#b91c1c",data:{member_name:"Vikram Joshi",member_id:"EMP005",treatment_date:TODAY,join_date:RECENT_JOIN,claim_amount:3000,hospital:"",is_cashless:false,doctor_name:"Dr. Mehta",doctor_reg:"GJ/56789/2014",diagnosis:"Type 2 Diabetes",consultation_fee:1000,medicine_cost:2000,diagnostic_cost:0,dental_cost:0,other_cost:0,medicines_list:"Metformin, Glimepiride",tests_list:"",procedures_list:"",prev_claims_today:0,has_prescription:true,has_bill:true}},
  {id:"TC006",label:"Alternative Medicine",tag:"APPROVED",tagColor:"#15803d",data:{member_name:"Kavita Nair",member_id:"EMP006",treatment_date:TODAY,join_date:JOIN,claim_amount:4000,hospital:"",is_cashless:false,doctor_name:"Vaidya Krishnan",doctor_reg:"AYUR/KL/2345/2019",diagnosis:"Chronic joint pain",consultation_fee:1000,medicine_cost:0,diagnostic_cost:0,dental_cost:0,other_cost:3000,medicines_list:"",tests_list:"",procedures_list:"Panchakarma therapy",prev_claims_today:0,has_prescription:true,has_bill:true}},
  {id:"TC007",label:"Pre-auth Missing (MRI)",tag:"REJECTED",tagColor:"#b91c1c",data:{member_name:"Suresh Patil",member_id:"EMP007",treatment_date:TODAY,join_date:JOIN,claim_amount:15000,hospital:"",is_cashless:false,doctor_name:"Dr. Rao",doctor_reg:"AP/67890/2017",diagnosis:"Suspected lumbar disc herniation",consultation_fee:0,medicine_cost:0,diagnostic_cost:15000,dental_cost:0,other_cost:0,medicines_list:"",tests_list:"MRI Lumbar Spine",procedures_list:"",prev_claims_today:0,has_prescription:true,has_bill:true}},
  {id:"TC008",label:"Fraud Detection",tag:"REVIEW",tagColor:"#6d28d9",data:{member_name:"Ravi Menon",member_id:"EMP008",treatment_date:TODAY,join_date:JOIN,claim_amount:4800,hospital:"",is_cashless:false,doctor_name:"Dr. Khan",doctor_reg:"UP/45678/2016",diagnosis:"Migraine",consultation_fee:2000,medicine_cost:2800,diagnostic_cost:0,dental_cost:0,other_cost:0,medicines_list:"Sumatriptan, Propranolol",tests_list:"",procedures_list:"",prev_claims_today:3,has_prescription:true,has_bill:true}},
  {id:"TC009",label:"Excluded Treatment",tag:"REJECTED",tagColor:"#b91c1c",data:{member_name:"Anita Desai",member_id:"EMP009",treatment_date:TODAY,join_date:JOIN,claim_amount:8000,hospital:"",is_cashless:false,doctor_name:"Dr. Banerjee",doctor_reg:"WB/34567/2015",diagnosis:"Obesity - BMI 35 weight loss",consultation_fee:3000,medicine_cost:0,diagnostic_cost:0,dental_cost:0,other_cost:5000,medicines_list:"",tests_list:"",procedures_list:"Bariatric consultation",prev_claims_today:0,has_prescription:true,has_bill:true}},
  {id:"TC010",label:"Network Cashless",tag:"APPROVED",tagColor:"#15803d",data:{member_name:"Deepak Shah",member_id:"EMP010",treatment_date:TODAY,join_date:JOIN,claim_amount:4500,hospital:"Apollo Hospitals",is_cashless:true,doctor_name:"Dr. Iyer",doctor_reg:"TN/56789/2013",diagnosis:"Acute bronchitis",consultation_fee:1500,medicine_cost:3000,diagnostic_cost:0,dental_cost:0,other_cost:0,medicines_list:"Antibiotics, Bronchodilators",tests_list:"",procedures_list:"",prev_claims_today:0,has_prescription:true,has_bill:true}},
];

// ── Adjudication Engine ────────────────────────────────────────────────────────
function validateDoctorReg(reg) {
  if (!reg) return false;
  return /^[A-Z]{2}\/\d{4,6}\/\d{4}$/.test(reg) || /^AYUR\/[A-Z]{2}\/\d{4,6}\/\d{4}$/.test(reg);
}

function checkWaitingPeriod(diagnosis, joinStr, treatStr) {
  try {
    const join = new Date(joinStr), treat = new Date(treatStr);
    const days = Math.floor((treat - join) / 86400000);
    const d = diagnosis.toLowerCase();
    const rules = [["diabetes",90],["hypertension",90],["blood pressure",90],["maternity",270]];
    for (const [kw, period] of rules) {
      if (d.includes(kw) && days < period) {
        const el = new Date(join); el.setDate(el.getDate() + period);
        return `${kw.charAt(0).toUpperCase()+kw.slice(1)} has ${period}-day waiting period. Eligible from ${el.toISOString().split("T")[0]}`;
      }
    }
    if (days < 30) return `Initial 30-day waiting period not completed (${days} days elapsed)`;
    return null;
  } catch { return null; }
}

function checkExclusions(diagnosis, procedures, items) {
  const EX = POLICY.exclusion_keywords;
  const d = diagnosis.toLowerCase();
  // Full exclusion on diagnosis
  for (const kw of EX) if (d.includes(kw)) return {excluded:true,reason:`Diagnosis '${diagnosis}' is excluded from coverage`,excluded_items:[diagnosis],covered_amount:0,is_partial:false};
  const excl = procedures.filter(p => EX.some(kw => p.toLowerCase().includes(kw)));
  const ok   = procedures.filter(p => !EX.some(kw => p.toLowerCase().includes(kw)));
  // PARTIAL: some covered, some not
  if (excl.length && ok.length) {
    let cov = (parseFloat(items.consultation_fee)||0)+(parseFloat(items.medicine_cost)||0)+(parseFloat(items.diagnostic_cost)||0)+(parseFloat(items.other_cost)||0);
    const dental_covered = ["root canal","filling","extraction","cleaning","cavity"];
    const has_covered_dental = ok.some(p => dental_covered.some(dk => p.toLowerCase().includes(dk)));
    if (has_covered_dental) cov += (parseFloat(items.dental_cost)||0);
    // Fallback: split total by procedure count
    if (cov === 0) {
      const total = parseFloat(items.claim_amount)||0;
      const perProc = total / (procedures.length||1);
      cov = ok.length * perProc;
    }
    return {excluded:true,reason:`Partially excluded: ${excl.map(e=>e.trim()).join(", ")} not covered`,excluded_items:excl,covered_amount:Math.round(cov),is_partial:true};
  }
  if (excl.length) return {excluded:true,reason:`Not covered: ${excl.join(", ")}`,excluded_items:excl,covered_amount:0,is_partial:false};
  return {excluded:false};
}

function adjudicateClaim(form, claimsHistory=[]) {
  const rejections=[], flags=[], notes=[];
  const total = parseFloat(form.claim_amount)||0;
  const procedures = form.procedures_list ? form.procedures_list.split(",").map(s=>s.trim()).filter(Boolean) : [];
  const tests = form.tests_list ? form.tests_list.split(",").map(s=>s.trim()).filter(Boolean) : [];

  // Run exclusions check FIRST so we know if it's partial before limit check
  const excl = checkExclusions(form.diagnosis, procedures, form);
  let rejected_items = [];

  // STEP 1: Eligibility
  if (total < POLICY.min_claim_amount) { rejections.push("BELOW_MIN_AMOUNT"); notes.push(`Amount ₹${total} below minimum ₹${POLICY.min_claim_amount}`); }

  // Late submission check
  if (form.treatment_date) {
    const daysSince = Math.floor((new Date() - new Date(form.treatment_date)) / 86400000);
    if (daysSince > POLICY.submission_deadline_days) { rejections.push("LATE_SUBMISSION"); notes.push(`Submitted ${daysSince} days after treatment (deadline: ${POLICY.submission_deadline_days} days)`); }
  }

  // Waiting period
  if (form.join_date && form.treatment_date) {
    const wp = checkWaitingPeriod(form.diagnosis, form.join_date, form.treatment_date);
    if (wp) { rejections.push("WAITING_PERIOD"); notes.push(wp); }
  }

  // STEP 2: Documents
  if (!form.has_prescription) { rejections.push("MISSING_DOCUMENTS"); notes.push("Prescription from registered doctor required"); }
  if (form.doctor_reg && !validateDoctorReg(form.doctor_reg)) { rejections.push("DOCTOR_REG_INVALID"); notes.push(`Invalid doctor registration format: ${form.doctor_reg}`); }

  // STEP 3: Coverage
  if (excl.excluded) { rejections.push("SERVICE_NOT_COVERED"); notes.push(excl.reason); rejected_items = excl.excluded_items; }

  // Pre-auth
  for (const item of [...tests, ...procedures]) {
    for (const pa of POLICY.pre_auth_required) {
      if (item.toLowerCase().includes(pa.toLowerCase())) { rejections.push("PRE_AUTH_MISSING"); notes.push(`${item} requires pre-authorization`); break; }
    }
  }

  // STEP 4: Limits — skip per-claim check if it's a partial claim (partial uses sub-limits instead)
  if (total > POLICY.per_claim_limit && !excl.is_partial) {
    rejections.push("PER_CLAIM_EXCEEDED");
    notes.push(`₹${total} exceeds per-claim limit of ₹${POLICY.per_claim_limit}`);
  }

  // Duplicate check
  if (claimsHistory.length > 0) {
    const dup = claimsHistory.find(h => h.member_id===form.member_id && h.treatment_date===form.treatment_date && h.diagnosis?.toLowerCase()===form.diagnosis?.toLowerCase() && h.decision!=="MANUAL_REVIEW");
    if (dup) { rejections.push("DUPLICATE_CLAIM"); notes.push(`Duplicate: ${dup.claim_id} already processed`); }
  }

  // STEP 6: Fraud
  const prev = parseInt(form.prev_claims_today)||0;
  if (prev >= 3) { flags.push("Multiple claims same day — possible fraud"); flags.push("Unusual claim pattern detected"); }
  if (total > 25000) flags.push(`High-value claim ₹${total} — requires manual authorization`);

  // Amount calculation
  const cons = Math.min(parseFloat(form.consultation_fee)||0, POLICY.consultation_sub_limit);
  const meds = Math.min(parseFloat(form.medicine_cost)||0, POLICY.pharmacy_sub_limit);
  const diag = Math.min(parseFloat(form.diagnostic_cost)||0, POLICY.diagnostic_sub_limit);
  const dent = Math.min(parseFloat(form.dental_cost)||0, POLICY.dental_sub_limit);
  const alt  = Math.min(parseFloat(form.other_cost)||0, POLICY.alternative_sub_limit);
  let gross = cons+meds+diag+dent+alt || total;

  const is_network = POLICY.network_hospitals.includes(form.hospital);
  let network_discount = 0;
  if (is_network) { network_discount = Math.round(gross * POLICY.network_discount/100); gross -= network_discount; }
  const copay = Math.round(gross * POLICY.copay_percentage/100);
  const net = Math.round(gross - copay);

  let decision, approved_amount, confidence_score;

  // Priority Rule 1: Fraud flags always win
  if (flags.length > 0 && rejections.length === 0) {
    decision="MANUAL_REVIEW"; approved_amount=0; confidence_score=0.65;
  } else if (flags.length > 0 && rejections.length > 0) {
    decision="MANUAL_REVIEW"; approved_amount=0; confidence_score=0.55;
  } else if (rejections.length) {
    // PARTIAL: only SERVICE_NOT_COVERED with is_partial=true, no other rejections
    const only_service = rejections.length===1 && rejections[0]==="SERVICE_NOT_COVERED" && excl.is_partial && excl.covered_amount>0;
    if (only_service) {
      decision="PARTIAL";
      const cp = Math.round(excl.covered_amount * POLICY.copay_percentage/100);
      approved_amount = Math.round(excl.covered_amount - cp);
      confidence_score=0.90;
    } else {
      decision="REJECTED"; approved_amount=0; confidence_score=0.95;
    }
  } else {
    decision="APPROVED"; approved_amount=net; confidence_score=0.92;
  }

  return {
    decision, approved_amount, rejection_reasons:rejections, rejected_items, flags, confidence_score,
    notes: notes.join(" | ") || "Claim processed successfully",
    next_steps:{
      APPROVED:"Payment will be processed in 3–5 business days.",
      REJECTED:`Claim rejected: ${rejections.join(", ")}. You may appeal within 30 days.`,
      PARTIAL:"Covered portion will be paid in 3–5 business days. Excluded items must be paid out of pocket.",
      MANUAL_REVIEW:"Your claim has been escalated to a specialist who will contact you within 48 hours."
    }[decision],
    is_network, network_discount, copay_deducted: decision==="APPROVED"||decision==="PARTIAL"?copay:0,
    cashless_approved: is_network && form.is_cashless && decision==="APPROVED",
  };
}

const DC = {
  APPROVED:      {color:"#15803d",bg:"#f0fdf4",border:"#86efac",icon:"✓",label:"Approved"},
  PARTIAL:       {color:"#b45309",bg:"#fffbeb",border:"#fcd34d",icon:"◑",label:"Partial Approval"},
  REJECTED:      {color:"#b91c1c",bg:"#fef2f2",border:"#fca5a5",icon:"✕",label:"Rejected"},
  MANUAL_REVIEW: {color:"#6d28d9",bg:"#faf5ff",border:"#c4b5fd",icon:"⊙",label:"Manual Review"},
};

const EMPTY = {member_name:"",member_id:"",treatment_date:"",join_date:"",claim_amount:"",hospital:"",is_cashless:false,doctor_name:"",doctor_reg:"",diagnosis:"",consultation_fee:"",medicine_cost:"",diagnostic_cost:"",dental_cost:"",other_cost:"",medicines_list:"",tests_list:"",procedures_list:"",prev_claims_today:"0",has_prescription:true,has_bill:true};

function Label({children,req}){return <div style={{fontSize:11,fontWeight:700,color:"#374151",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>{children}{req&&<span style={{color:"#ef4444",marginLeft:2}}>*</span>}</div>;}
function Field({label,req,children,half}){return <div style={{marginBottom:12,flex:half?"0 0 calc(50% - 6px)":"1 1 100%"}}><Label req={req}>{label}</Label>{children}</div>;}
const IS={style:{width:"100%",padding:"8px 10px",border:"1px solid #d1d5db",borderRadius:6,fontSize:13,outline:"none",background:"white",boxSizing:"border-box",fontFamily:"inherit"}};
const NS={type:"number",min:0,style:{...IS.style}};
function Sec({title,children}){return <div style={{marginBottom:18}}><div style={{fontSize:10,fontWeight:800,color:"#9ca3af",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10,paddingBottom:6,borderBottom:"1px solid #f3f4f6"}}>{title}</div><div style={{display:"flex",flexWrap:"wrap",gap:12}}>{children}</div></div>;}

export default function App() {
  const [tab,setTab]=useState("submit");
  const [form,setForm]=useState(EMPTY);
  const [result,setResult]=useState(null);
  const [processing,setProcessing]=useState(false);
  const [history,setHistory]=useState([]);
  const [uploadedFiles,setUploadedFiles]=useState([]);
  const [extracting,setExtracting]=useState(false);
  const [extractedData,setExtractedData]=useState(null);
  const [dragOver,setDragOver]=useState(false);
  const [apiKey,setApiKey]=useState("");
  const [showApiInput,setShowApiInput]=useState(false);
  const fileRef=useRef();
  const resultRef=useRef();

  function set(k,v){setForm(f=>({...f,[k]:v}));}

  // Document upload + AI extraction
  const handleFiles = useCallback(async (files) => {
    if (!apiKey) { setShowApiInput(true); return; }
    const valid = Array.from(files).filter(f => f.type.startsWith("image/") || f.type==="application/pdf");
    if (!valid.length) return;
    const newFiles = valid.map(f=>({file:f,name:f.name,status:"queued"}));
    setUploadedFiles(prev=>[...prev,...newFiles]);
    setExtracting(true);
    const allExtracted = {};
    for (let i=0; i<valid.length; i++) {
      const file = valid[i];
      setUploadedFiles(prev=>prev.map((u,idx)=>idx===prev.length-valid.length+i?{...u,status:"processing"}:u));
      try {
        const b64 = await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
        const mediaType = file.type==="application/pdf"?"application/pdf":file.type;
        const response = await fetch("https://api.anthropic.com/v1/messages",{
          method:"POST",
          headers:{"Content-Type":"application/json","x-api-key":apiKey,"anthropic-version":"2023-06-01"},
          body:JSON.stringify({
            model:"claude-opus-4-5",max_tokens:1500,
            system:"You are a medical document OCR expert. Extract all data and return ONLY valid JSON, no markdown.",
            messages:[{role:"user",content:[
              {type:"image",source:{type:"base64",media_type:mediaType,data:b64}},
              {type:"text",text:`Extract from this medical document and return JSON:
{"doctor_name":"","doctor_reg":"","patient_name":"","diagnosis":"","treatment_date":"YYYY-MM-DD","medicines_prescribed":[],"tests_prescribed":[],"procedures":[],"consultation_fee":0,"medicine_cost":0,"diagnostic_cost":0,"dental_cost":0,"other_cost":0,"total_amount":0,"hospital_name":""}
Return ONLY the JSON.`}
            ]}]
          })
        });
        const data = await response.json();
        const text = data.content?.map(b=>b.text||"").join("")||"{}";
        const clean = text.replace(/```json|```/g,"").trim();
        const extracted = JSON.parse(clean);
        Object.assign(allExtracted,extracted);
        setUploadedFiles(prev=>prev.map((u,idx)=>idx===prev.length-valid.length+i?{...u,status:"done",extracted}:u));
      } catch(e) {
        setUploadedFiles(prev=>prev.map((u,idx)=>idx===prev.length-valid.length+i?{...u,status:"error"}:u));
      }
    }
    if (Object.keys(allExtracted).length) {
      setExtractedData(allExtracted);
      setForm(f=>({...f,
        doctor_name:allExtracted.doctor_name||f.doctor_name,
        doctor_reg:allExtracted.doctor_reg||f.doctor_reg,
        member_name:allExtracted.patient_name||f.member_name,
        diagnosis:allExtracted.diagnosis||f.diagnosis,
        treatment_date:allExtracted.treatment_date?allExtracted.treatment_date.replace(/\//g,"-"):f.treatment_date,
        medicines_list:allExtracted.medicines_prescribed?.join(", ")||f.medicines_list,
        tests_list:allExtracted.tests_prescribed?.join(", ")||f.tests_list,
        procedures_list:allExtracted.procedures?.join(", ")||f.procedures_list,
        consultation_fee:allExtracted.consultation_fee||f.consultation_fee,
        medicine_cost:allExtracted.medicine_cost||f.medicine_cost,
        diagnostic_cost:allExtracted.diagnostic_cost||f.diagnostic_cost,
        dental_cost:allExtracted.dental_cost||f.dental_cost,
        other_cost:allExtracted.other_cost||f.other_cost,
        claim_amount:allExtracted.total_amount||f.claim_amount,
        hospital:allExtracted.hospital_name||f.hospital,
      }));
    }
    setExtracting(false);
  },[apiKey]);

  function onDrop(e){e.preventDefault();setDragOver(false);handleFiles(e.dataTransfer.files);}

  async function handleSubmit() {
    setProcessing(true); setResult(null);
    await new Promise(r=>setTimeout(r,200));
    const res = adjudicateClaim(form, history);
    const id = `CLM_${Math.random().toString(36).substr(2,5).toUpperCase()}`;
    const full = {...res,claim_id:id,member_name:form.member_name,member_id:form.member_id,treatment_date:form.treatment_date,diagnosis:form.diagnosis,claim_amount:form.claim_amount,timestamp:new Date().toLocaleString()};
    setResult(full);
    setHistory(h=>[full,...h].slice(0,50));
    setProcessing(false);
    setTimeout(()=>resultRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),100);
  }

  function loadTC(tc){setForm({...EMPTY,...tc.data});setResult(null);setUploadedFiles([]);setExtractedData(null);setTab("submit");}

  const TABS=[{id:"submit",label:"Submit Claim"},{id:"test",label:"Test Cases"},{id:"history",label:`History (${history.length})`},{id:"policy",label:"Policy"}];

  return (
    <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",background:"#f3f4f6",minHeight:"100vh",paddingBottom:48}}>
      {/* Header */}
      <div style={{background:"white",borderBottom:"1px solid #e5e7eb",padding:"0 24px",position:"sticky",top:0,zIndex:10}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",gap:12,height:56}}>
          <div style={{width:34,height:34,borderRadius:8,background:"#7c3aed",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"white",fontSize:16,fontWeight:800}}>P</span>
          </div>
          <div>
            <div style={{fontSize:14,fontWeight:700,color:"#111827"}}>Plum OPD Adjudication System</div>
            <div style={{fontSize:11,color:"#9ca3af"}}>AI-powered · Policy PLUM_OPD_2024 · Annual ₹50K · Per Claim ₹5K</div>
          </div>
          <div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center"}}>
            {["10% Copay","20% Network Discount","30-day Submission Window"].map(b=>(
              <span key={b} style={{padding:"3px 10px",borderRadius:20,background:"#f3f4f6",fontSize:11,fontWeight:600,color:"#374151"}}>{b}</span>
            ))}
            <button onClick={()=>setShowApiInput(v=>!v)} style={{padding:"4px 12px",borderRadius:6,background:apiKey?"#f0fdf4":"#fef9c3",border:`1px solid ${apiKey?"#86efac":"#fde047"}`,fontSize:11,fontWeight:700,cursor:"pointer",color:apiKey?"#15803d":"#854d0e"}}>
              {apiKey?"✓ API Key Set":"+ Add API Key"}
            </button>
          </div>
        </div>
        {showApiInput && (
          <div style={{maxWidth:1100,margin:"0 auto",paddingBottom:12,display:"flex",gap:8,alignItems:"center"}}>
            <input style={{...IS.style,maxWidth:420,fontSize:12}} type="password" placeholder="Paste Anthropic API key (sk-ant-...) for document extraction" value={apiKey} onChange={e=>setApiKey(e.target.value)} />
            <button onClick={()=>setShowApiInput(false)} style={{padding:"6px 14px",background:"#7c3aed",color:"white",border:"none",borderRadius:6,fontSize:12,fontWeight:700,cursor:"pointer"}}>Save</button>
            <span style={{fontSize:11,color:"#9ca3af"}}>Key stays in browser only — never sent anywhere except Anthropic</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{background:"white",borderBottom:"1px solid #e5e7eb",padding:"0 24px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",display:"flex"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"12px 18px",fontSize:13,fontWeight:600,color:tab===t.id?"#7c3aed":"#6b7280",background:"none",border:"none",borderBottom:tab===t.id?"2px solid #7c3aed":"2px solid transparent",cursor:"pointer"}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"24px auto",padding:"0 24px"}}>

        {/* SUBMIT TAB */}
        {tab==="submit" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 400px",gap:20,alignItems:"start"}}>
            <div>
              {/* Upload Box */}
              <div style={{background:"white",borderRadius:10,border:"1px solid #e5e7eb",padding:20,marginBottom:16}}>
                <div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:12}}>
                  Upload Medical Documents
                  <span style={{marginLeft:8,fontSize:11,fontWeight:500,color:"#7c3aed",background:"#ede9fe",padding:"2px 8px",borderRadius:20}}>AI Extraction</span>
                  {!apiKey && <span style={{marginLeft:8,fontSize:11,color:"#b45309",background:"#fffbeb",padding:"2px 8px",borderRadius:20}}>Add API key to enable</span>}
                </div>
                <div onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={onDrop} onClick={()=>apiKey?fileRef.current?.click():setShowApiInput(true)}
                  style={{border:`2px dashed ${dragOver?"#7c3aed":"#d1d5db"}`,borderRadius:8,padding:"24px 16px",textAlign:"center",cursor:"pointer",background:dragOver?"#faf5ff":"#fafafa",transition:"all 0.15s"}}>
                  <div style={{fontSize:24,marginBottom:6}}>📄</div>
                  <div style={{fontSize:13,fontWeight:600,color:"#374151"}}>{apiKey?"Drop bills & prescriptions here":"Add API key above to enable document upload"}</div>
                  <div style={{fontSize:11,color:"#9ca3af",marginTop:4}}>PNG, JPG, PDF · AI will extract and auto-fill the form</div>
                </div>
                <input ref={fileRef} type="file" multiple accept="image/*,application/pdf" style={{display:"none"}} onChange={e=>handleFiles(e.target.files)} />
                {uploadedFiles.length>0 && (
                  <div style={{marginTop:12}}>
                    {uploadedFiles.map((f,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"#f9fafb",borderRadius:6,marginBottom:6,fontSize:12}}>
                        <span>📎</span>
                        <span style={{flex:1,color:"#374151",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.name}</span>
                        <span style={{fontSize:11,fontWeight:700,color:{queued:"#9ca3af",processing:"#b45309",done:"#15803d",error:"#b91c1c"}[f.status],padding:"2px 8px",borderRadius:20,background:{queued:"#f3f4f6",processing:"#fffbeb",done:"#f0fdf4",error:"#fef2f2"}[f.status]}}>
                          {{queued:"Queued",processing:"Extracting...",done:"✓ Extracted",error:"Failed"}[f.status]}
                        </span>
                      </div>
                    ))}
                    {extracting && <div style={{fontSize:12,color:"#7c3aed",fontWeight:600,textAlign:"center",padding:"8px 0"}}>AI extracting data...</div>}
                    {extractedData && !extracting && <div style={{fontSize:12,color:"#15803d",fontWeight:600,padding:"8px 10px",background:"#f0fdf4",borderRadius:6,marginTop:6}}>✓ Form auto-filled from documents. Review and submit.</div>}
                  </div>
                )}
              </div>

              {/* Form */}
              <div style={{background:"white",borderRadius:10,border:"1px solid #e5e7eb",padding:20}}>
                <Sec title="Member Information">
                  <Field label="Member Name" req half><input {...IS} value={form.member_name} onChange={e=>set("member_name",e.target.value)} placeholder="Rajesh Kumar" /></Field>
                  <Field label="Employee ID" req half><input {...IS} value={form.member_id} onChange={e=>set("member_id",e.target.value)} placeholder="EMP001" /></Field>
                  <Field label="Treatment Date" req half><input {...IS} type="date" value={form.treatment_date} onChange={e=>set("treatment_date",e.target.value)} /></Field>
                  <Field label="Policy Join Date" half><input {...IS} type="date" value={form.join_date} onChange={e=>set("join_date",e.target.value)} /></Field>
                </Sec>
                <Sec title="Hospital & Doctor">
                  <Field label="Hospital / Clinic" half>
                    <select style={IS.style} value={form.hospital} onChange={e=>set("hospital",e.target.value)}>
                      <option value="">Non-network / Other</option>
                      {POLICY.network_hospitals.map(h=><option key={h} value={h}>{h} ✓ Network</option>)}
                    </select>
                  </Field>
                  <Field label="Options" half>
                    <div style={{display:"flex",gap:16,paddingTop:8}}>
                      <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,cursor:"pointer"}}><input type="checkbox" checked={form.is_cashless} onChange={e=>set("is_cashless",e.target.checked)} /> Cashless</label>
                      <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,cursor:"pointer"}}><input type="checkbox" checked={form.has_prescription} onChange={e=>set("has_prescription",e.target.checked)} /> Prescription</label>
                      <label style={{display:"flex",alignItems:"center",gap:6,fontSize:13,cursor:"pointer"}}><input type="checkbox" checked={form.has_bill} onChange={e=>set("has_bill",e.target.checked)} /> Bill</label>
                    </div>
                  </Field>
                  <Field label="Doctor Name" req half><input {...IS} value={form.doctor_name} onChange={e=>set("doctor_name",e.target.value)} placeholder="Dr. Sharma" /></Field>
                  <Field label="Doctor Reg. No." req half><input {...IS} value={form.doctor_reg} onChange={e=>set("doctor_reg",e.target.value)} placeholder="KA/45678/2015" /></Field>
                  <Field label="Diagnosis" req><input {...IS} value={form.diagnosis} onChange={e=>set("diagnosis",e.target.value)} placeholder="e.g. Viral fever, Type 2 Diabetes" /></Field>
                </Sec>
                <Sec title="Bill Breakdown (₹)">
                  <Field label="Total Claim Amount" req half><input {...NS} value={form.claim_amount} onChange={e=>set("claim_amount",e.target.value)} /></Field>
                  <Field label="Consultation Fee" half><input {...NS} value={form.consultation_fee} onChange={e=>set("consultation_fee",e.target.value)} /></Field>
                  <Field label="Medicines" half><input {...NS} value={form.medicine_cost} onChange={e=>set("medicine_cost",e.target.value)} /></Field>
                  <Field label="Diagnostic Tests" half><input {...NS} value={form.diagnostic_cost} onChange={e=>set("diagnostic_cost",e.target.value)} /></Field>
                  <Field label="Dental Charges" half><input {...NS} value={form.dental_cost} onChange={e=>set("dental_cost",e.target.value)} /></Field>
                  <Field label="Other / Alt. Medicine" half><input {...NS} value={form.other_cost} onChange={e=>set("other_cost",e.target.value)} /></Field>
                </Sec>
                <Sec title="Clinical Details">
                  <Field label="Medicines Prescribed"><input {...IS} value={form.medicines_list} onChange={e=>set("medicines_list",e.target.value)} placeholder="Paracetamol 650mg, Vitamin C" /></Field>
                  <Field label="Tests Prescribed"><input {...IS} value={form.tests_list} onChange={e=>set("tests_list",e.target.value)} placeholder="CBC, Blood Sugar" /></Field>
                  <Field label="Procedures"><input {...IS} value={form.procedures_list} onChange={e=>set("procedures_list",e.target.value)} placeholder="Root canal, Teeth whitening" /></Field>
                  <Field label="Previous Claims Today" half><input {...NS} min={0} value={form.prev_claims_today} onChange={e=>set("prev_claims_today",e.target.value)} /></Field>
                </Sec>
                <button onClick={handleSubmit} disabled={processing} style={{width:"100%",padding:"13px",background:processing?"#a78bfa":"#7c3aed",color:"white",border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:processing?"not-allowed":"pointer"}}>
                  {processing?"Adjudicating...":"Process Claim →"}
                </button>
              </div>
            </div>

            {/* Result Panel */}
            <div style={{position:"sticky",top:80}}>
              <div ref={resultRef} />
              {!result && !processing && (
                <div style={{background:"white",borderRadius:10,border:"1px solid #e5e7eb",padding:40,textAlign:"center"}}>
                  <div style={{fontSize:36,marginBottom:12}}>📋</div>
                  <div style={{fontSize:13,fontWeight:600,color:"#374151",marginBottom:6}}>Ready to process</div>
                  <div style={{fontSize:12,color:"#9ca3af"}}>Fill the form or load a test case, then click Process Claim</div>
                </div>
              )}
              {processing && (
                <div style={{background:"white",borderRadius:10,border:"1px solid #e5e7eb",padding:40,textAlign:"center"}}>
                  <div style={{width:32,height:32,border:"3px solid #ede9fe",borderTop:"3px solid #7c3aed",borderRadius:"50%",margin:"0 auto 12px",animation:"spin 0.8s linear infinite"}} />
                  <div style={{fontSize:13,color:"#6b7280"}}>Running adjudication engine...</div>
                </div>
              )}
              {result && !processing && (()=>{
                const cfg=DC[result.decision];
                return (
                  <div style={{background:"white",borderRadius:10,border:`2px solid ${cfg.border}`,overflow:"hidden"}}>
                    <div style={{background:cfg.bg,padding:"16px 20px",borderBottom:`1px solid ${cfg.border}`}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:38,height:38,borderRadius:"50%",background:cfg.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:18,fontWeight:700,flexShrink:0}}>{cfg.icon}</div>
                        <div>
                          <div style={{fontSize:16,fontWeight:700,color:cfg.color}}>{cfg.label}</div>
                          <div style={{fontSize:11,color:"#6b7280"}}>{result.claim_id} · {result.timestamp}</div>
                        </div>
                        <div style={{marginLeft:"auto",textAlign:"right"}}>
                          <div style={{fontSize:20,fontWeight:800,color:cfg.color}}>₹{result.approved_amount.toLocaleString()}</div>
                          <div style={{fontSize:11,color:"#9ca3af"}}>approved</div>
                        </div>
                      </div>
                    </div>
                    <div style={{padding:"16px 20px"}}>
                      {/* Confidence */}
                      <div style={{marginBottom:14}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                          <span style={{fontSize:11,color:"#6b7280",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em"}}>Confidence</span>
                          <span style={{fontSize:11,fontWeight:700,color:"#374151"}}>{Math.round(result.confidence_score*100)}%</span>
                        </div>
                        <div style={{background:"#f3f4f6",borderRadius:4,height:6}}>
                          <div style={{background:cfg.color,height:6,borderRadius:4,width:`${result.confidence_score*100}%`,transition:"width 0.6s ease"}} />
                        </div>
                      </div>
                      {/* Financial Breakdown */}
                      {(result.decision==="APPROVED"||result.decision==="PARTIAL") && (
                        <div style={{background:"#f9fafb",borderRadius:8,padding:12,marginBottom:12,fontSize:12}}>
                          {[
                            ["Claim Amount",`₹${parseFloat(form.claim_amount||0).toLocaleString()}`],
                            result.network_discount>0&&["Network Discount (20%)",`− ₹${result.network_discount}`],
                            ["Copay (10%)",`− ₹${result.copay_deducted}`],
                            ["Approved Amount",`₹${result.approved_amount.toLocaleString()}`],
                          ].filter(Boolean).map(([l,v],i,arr)=>(
                            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderTop:i===arr.length-1?"1px solid #e5e7eb":"none",fontWeight:i===arr.length-1?700:400}}>
                              <span style={{color:"#6b7280"}}>{l}</span><span style={{color:"#111827"}}>{v}</span>
                            </div>
                          ))}
                          {result.cashless_approved&&<div style={{marginTop:8,padding:"4px 10px",background:"#dbeafe",borderRadius:4,color:"#1d4ed8",fontSize:11,fontWeight:700,textAlign:"center"}}>CASHLESS APPROVED</div>}
                        </div>
                      )}
                      {/* Excluded Items */}
                      {result.rejected_items?.length>0 && (
                        <div style={{marginBottom:12}}>
                          <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Excluded Items</div>
                          {result.rejected_items.map(r=><div key={r} style={{padding:"4px 10px",background:"#fef2f2",borderRadius:4,fontSize:12,color:"#b91c1c",marginBottom:4}}>✕ {r}</div>)}
                        </div>
                      )}
                      {/* Rejection Reasons */}
                      {result.rejection_reasons.length>0 && (
                        <div style={{marginBottom:12}}>
                          <div style={{fontSize:11,fontWeight:700,color:"#6b7280",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>Rejection Reasons</div>
                          {result.rejection_reasons.map(r=>(
                            <div key={r} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                              <div style={{width:6,height:6,borderRadius:"50%",background:"#ef4444",flexShrink:0}} />
                              <span style={{fontSize:12,color:"#374151",fontWeight:600}}>{r.replace(/_/g," ")}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Flags */}
                      {result.flags?.length>0 && (
                        <div style={{marginBottom:12,padding:"8px 12px",background:"#faf5ff",borderRadius:6,border:"1px solid #c4b5fd"}}>
                          <div style={{fontSize:11,fontWeight:700,color:"#6d28d9",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.05em"}}>Fraud Flags</div>
                          {result.flags.map(f=><div key={f} style={{fontSize:12,color:"#374151",marginBottom:2}}>🚩 {f}</div>)}
                        </div>
                      )}
                      {/* Notes */}
                      <div style={{background:"#f9fafb",borderRadius:6,padding:10,fontSize:12,color:"#4b5563",lineHeight:1.6,marginBottom:12}}>
                        <strong style={{display:"block",fontSize:11,color:"#6b7280",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Notes</strong>
                        {result.notes}
                      </div>
                      {/* Next Steps */}
                      <div style={{background:cfg.bg,borderRadius:6,padding:10,fontSize:12,color:cfg.color,lineHeight:1.6,border:`1px solid ${cfg.border}`}}>
                        <strong style={{display:"block",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>Next Steps</strong>
                        {result.next_steps}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TEST CASES TAB */}
        {tab==="test" && (
          <div>
            <div style={{marginBottom:16,fontSize:13,color:"#6b7280"}}>All 10 test cases from the assignment. Click any to load and process.</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
              {TEST_CASES.map(tc=>(
                <div key={tc.id} onClick={()=>loadTC(tc)} style={{background:"white",borderRadius:10,border:"1px solid #e5e7eb",padding:16,cursor:"pointer",transition:"all 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#7c3aed";e.currentTarget.style.boxShadow="0 0 0 3px #ede9fe";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#e5e7eb";e.currentTarget.style.boxShadow="none";}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                    <span style={{fontSize:11,fontWeight:700,color:"#9ca3af"}}>{tc.id}</span>
                    <span style={{padding:"2px 10px",borderRadius:20,background:tc.tagColor+"18",color:tc.tagColor,fontSize:11,fontWeight:700}}>{tc.tag}</span>
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:"#111827",marginBottom:4}}>{tc.label}</div>
                  <div style={{fontSize:12,color:"#6b7280"}}>{tc.data.member_name} · ₹{tc.data.claim_amount.toLocaleString()}</div>
                  <div style={{fontSize:11,color:"#9ca3af",marginTop:2}}>{tc.data.diagnosis}</div>
                  <div style={{marginTop:10,padding:"6px",background:"#7c3aed",color:"white",borderRadius:6,fontSize:12,fontWeight:600,textAlign:"center"}}>Load &amp; Process →</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {tab==="history" && (
          <div>
            {history.length===0
              ? <div style={{background:"white",borderRadius:10,border:"1px solid #e5e7eb",padding:40,textAlign:"center",color:"#9ca3af",fontSize:13}}>No claims processed yet.</div>
              : <>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
                  {[
                    {l:"Total Claims",v:history.length,c:"#7c3aed"},
                    {l:"Approved",v:history.filter(h=>h.decision==="APPROVED").length,c:"#15803d"},
                    {l:"Rejected/Partial",v:history.filter(h=>["REJECTED","PARTIAL"].includes(h.decision)).length,c:"#b91c1c"},
                    {l:"Total Approved",v:"₹"+history.reduce((s,h)=>s+h.approved_amount,0).toLocaleString(),c:"#1d4ed8"},
                  ].map(s=>(
                    <div key={s.l} style={{background:"white",borderRadius:8,border:"1px solid #e5e7eb",padding:"12px 16px"}}>
                      <div style={{fontSize:11,color:"#9ca3af",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>{s.l}</div>
                      <div style={{fontSize:22,fontWeight:700,color:s.c}}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:"white",borderRadius:10,border:"1px solid #e5e7eb",overflow:"hidden"}}>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead>
                      <tr style={{background:"#f9fafb"}}>
                        {["Claim ID","Member","Date","Claimed","Decision","Confidence","Approved"].map(h=>(
                          <th key={h} style={{padding:"10px 14px",fontSize:11,fontWeight:700,color:"#6b7280",textAlign:"left",borderBottom:"1px solid #e5e7eb",textTransform:"uppercase",letterSpacing:"0.04em"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((h,i)=>{
                        const c=DC[h.decision];
                        return (
                          <tr key={h.claim_id} style={{borderBottom:"1px solid #f3f4f6",background:i%2?"#fafafa":"white"}}>
                            <td style={{padding:"10px 14px",fontSize:12,fontWeight:700,color:"#374151"}}>{h.claim_id}</td>
                            <td style={{padding:"10px 14px",fontSize:12}}>{h.member_name}</td>
                            <td style={{padding:"10px 14px",fontSize:12,color:"#6b7280"}}>{h.treatment_date}</td>
                            <td style={{padding:"10px 14px",fontSize:12}}>₹{parseFloat(h.claim_amount||0).toLocaleString()}</td>
                            <td style={{padding:"10px 14px"}}><span style={{padding:"3px 10px",borderRadius:20,background:c.bg,color:c.color,fontSize:11,fontWeight:700,border:`1px solid ${c.border}`}}>{h.decision}</span></td>
                            <td style={{padding:"10px 14px",fontSize:12}}>{Math.round(h.confidence_score*100)}%</td>
                            <td style={{padding:"10px 14px",fontSize:12,fontWeight:700,color:c.color}}>₹{h.approved_amount.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            }
          </div>
        )}

        {/* POLICY TAB */}
        {tab==="policy" && (
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16}}>
            {[
              {title:"Coverage Limits",rows:[["Annual Limit","₹50,000"],["Per Claim Limit","₹5,000"],["Consultation","₹2,000/claim"],["Pharmacy","₹15,000/year"],["Diagnostics","₹10,000/year"],["Dental","₹10,000/year"],["Vision","₹5,000/year"],["Alternative Medicine","₹8,000/year"]]},
              {title:"Waiting Periods",rows:[["Initial (all claims)","30 days"],["Pre-existing diseases","365 days"],["Diabetes","90 days"],["Hypertension","90 days"],["Maternity","270 days"],["Joint Replacement","730 days"]]},
            ].map(card=>(
              <div key={card.title} style={{background:"white",borderRadius:10,border:"1px solid #e5e7eb",padding:20}}>
                <div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:14,paddingBottom:8,borderBottom:"1px solid #f3f4f6"}}>{card.title}</div>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <tbody>{card.rows.map(([l,v])=>(
                    <tr key={l}><td style={{padding:"5px 0",fontSize:12,color:"#6b7280"}}>{l}</td><td style={{padding:"5px 0",fontSize:12,fontWeight:600,color:"#111827",textAlign:"right"}}>{v}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            ))}
            <div style={{background:"white",borderRadius:10,border:"1px solid #e5e7eb",padding:20}}>
              <div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:14,paddingBottom:8,borderBottom:"1px solid #f3f4f6"}}>Exclusions</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {["Cosmetic procedures","Weight loss","Infertility","Experimental","Self-inflicted","HIV/AIDS","Alcoholism/drug abuse","Adventure sports","Vitamins/supplements","LASIK","Bariatric"].map(e=>(
                  <span key={e} style={{padding:"3px 10px",background:"#fef2f2",color:"#b91c1c",borderRadius:20,fontSize:11,fontWeight:600}}>{e}</span>
                ))}
              </div>
            </div>
            <div style={{background:"white",borderRadius:10,border:"1px solid #e5e7eb",padding:20}}>
              <div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:14,paddingBottom:8,borderBottom:"1px solid #f3f4f6"}}>Network Hospitals — 20% Discount + Cashless</div>
              {POLICY.network_hospitals.map(h=>(
                <div key={h} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid #f9fafb"}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:"#15803d"}} />
                  <span style={{fontSize:12,color:"#374151",flex:1}}>{h}</span>
                  <span style={{fontSize:11,color:"#15803d",fontWeight:600}}>Cashless eligible</span>
                </div>
              ))}
            </div>
            <div style={{background:"white",borderRadius:10,border:"1px solid #e5e7eb",padding:20,gridColumn:"1/-1"}}>
              <div style={{fontSize:13,fontWeight:700,color:"#111827",marginBottom:14,paddingBottom:8,borderBottom:"1px solid #f3f4f6"}}>Adjudication Flow — 6 Steps</div>
              <div style={{display:"flex",gap:0}}>
                {[["1","Eligibility","Policy active, waiting period, min amount"],["2","Documents","Prescription, doctor reg, bill validity"],["3","Coverage","Exclusions, pre-auth, service covered"],["4","Limits","Per-claim, sub-limits, copay calculation"],["5","Medical Necessity","Diagnosis justifies treatment"],["6","Fraud Detection","Same-day claims, high-value flags"]].map(([n,t,d],i,arr)=>(
                  <div key={n} style={{flex:1,padding:"12px 14px",background:"#f9fafb",borderRight:i<arr.length-1?"1px solid #e5e7eb":"none"}}>
                    <div style={{fontSize:18,fontWeight:800,color:"#ede9fe",marginBottom:4}}>{n}</div>
                    <div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:2}}>{t}</div>
                    <div style={{fontSize:11,color:"#9ca3af"}}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
