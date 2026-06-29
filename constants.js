export const POLICY = {
  annual_limit: 50000,
  per_claim_limit: 5000,
  consultation_sub_limit: 2000,
  pharmacy_sub_limit: 15000,
  diagnostic_sub_limit: 10000,
  dental_sub_limit: 10000,
  vision_sub_limit: 5000,
  alternative_sub_limit: 8000,
  copay_percentage: 10,
  network_discount: 20,
  min_claim_amount: 500,
  submission_deadline_days: 30,
  network_hospitals: [
    "Apollo Hospitals",
    "Fortis Healthcare",
    "Max Healthcare",
    "Manipal Hospitals",
    "Narayana Health",
  ],
  exclusion_keywords: [
    "cosmetic", "weight loss", "infertility", "experimental", "self-inflicted",
    "adventure sports", "hiv", "aids", "alcoholism", "drug abuse", "obesity",
    "bariatric", "whitening", "lasik",
  ],
  waiting_periods: {
    initial: 30,
    pre_existing: 365,
    diabetes: 90,
    hypertension: 90,
    maternity: 270,
    joint_replacement: 730,
  },
  pre_auth_required: ["MRI", "CT Scan"],
};

export const TODAY = new Date().toISOString().split("T")[0];
const JOIN = "2025-01-01";
const RECENT_JOIN = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

export const TEST_CASES = [
  { id: "TC001", label: "Simple Consultation", tag: "APPROVED", tagColor: "#15803d", data: { member_name: "Rajesh Kumar", member_id: "EMP001", treatment_date: TODAY, join_date: JOIN, claim_amount: 1500, hospital: "", is_cashless: false, doctor_name: "Dr. Sharma", doctor_reg: "KA/45678/2015", diagnosis: "Viral fever", consultation_fee: 1000, medicine_cost: 0, diagnostic_cost: 500, dental_cost: 0, other_cost: 0, medicines_list: "Paracetamol 650mg, Vitamin C", tests_list: "CBC, Dengue test", procedures_list: "", prev_claims_today: 0, has_prescription: true, has_bill: true } },
  { id: "TC002", label: "Dental Partial Approval", tag: "PARTIAL", tagColor: "#b45309", data: { member_name: "Priya Singh", member_id: "EMP002", treatment_date: TODAY, join_date: JOIN, claim_amount: 12000, hospital: "", is_cashless: false, doctor_name: "Dr. Patel", doctor_reg: "MH/23456/2018", diagnosis: "Tooth decay requiring root canal", consultation_fee: 0, medicine_cost: 0, diagnostic_cost: 0, dental_cost: 12000, other_cost: 0, medicines_list: "", tests_list: "", procedures_list: "Root canal treatment, Teeth whitening", prev_claims_today: 0, has_prescription: true, has_bill: true } },
  { id: "TC003", label: "Limit Exceeded", tag: "REJECTED", tagColor: "#b91c1c", data: { member_name: "Amit Verma", member_id: "EMP003", treatment_date: TODAY, join_date: JOIN, claim_amount: 7500, hospital: "", is_cashless: false, doctor_name: "Dr. Gupta", doctor_reg: "DL/34567/2016", diagnosis: "Gastroenteritis", consultation_fee: 2000, medicine_cost: 5500, diagnostic_cost: 0, dental_cost: 0, other_cost: 0, medicines_list: "Antibiotics, Probiotics", tests_list: "", procedures_list: "", prev_claims_today: 0, has_prescription: true, has_bill: true } },
  { id: "TC004", label: "Missing Documents", tag: "REJECTED", tagColor: "#b91c1c", data: { member_name: "Sneha Reddy", member_id: "EMP004", treatment_date: TODAY, join_date: JOIN, claim_amount: 2000, hospital: "", is_cashless: false, doctor_name: "", doctor_reg: "", diagnosis: "General consultation", consultation_fee: 1500, medicine_cost: 500, diagnostic_cost: 0, dental_cost: 0, other_cost: 0, medicines_list: "", tests_list: "", procedures_list: "", prev_claims_today: 0, has_prescription: false, has_bill: true } },
  { id: "TC005", label: "Waiting Period – Diabetes", tag: "REJECTED", tagColor: "#b91c1c", data: { member_name: "Vikram Joshi", member_id: "EMP005", treatment_date: TODAY, join_date: RECENT_JOIN, claim_amount: 3000, hospital: "", is_cashless: false, doctor_name: "Dr. Mehta", doctor_reg: "GJ/56789/2014", diagnosis: "Type 2 Diabetes", consultation_fee: 1000, medicine_cost: 2000, diagnostic_cost: 0, dental_cost: 0, other_cost: 0, medicines_list: "Metformin, Glimepiride", tests_list: "", procedures_list: "", prev_claims_today: 0, has_prescription: true, has_bill: true } },
  { id: "TC006", label: "Alternative Medicine", tag: "APPROVED", tagColor: "#15803d", data: { member_name: "Kavita Nair", member_id: "EMP006", treatment_date: TODAY, join_date: JOIN, claim_amount: 4000, hospital: "", is_cashless: false, doctor_name: "Vaidya Krishnan", doctor_reg: "AYUR/KL/2345/2019", diagnosis: "Chronic joint pain", consultation_fee: 1000, medicine_cost: 0, diagnostic_cost: 0, dental_cost: 0, other_cost: 3000, medicines_list: "", tests_list: "", procedures_list: "Panchakarma therapy", prev_claims_today: 0, has_prescription: true, has_bill: true } },
  { id: "TC007", label: "Pre-auth Missing (MRI)", tag: "REJECTED", tagColor: "#b91c1c", data: { member_name: "Suresh Patil", member_id: "EMP007", treatment_date: TODAY, join_date: JOIN, claim_amount: 15000, hospital: "", is_cashless: false, doctor_name: "Dr. Rao", doctor_reg: "AP/67890/2017", diagnosis: "Suspected lumbar disc herniation", consultation_fee: 0, medicine_cost: 0, diagnostic_cost: 15000, dental_cost: 0, other_cost: 0, medicines_list: "", tests_list: "MRI Lumbar Spine", procedures_list: "", prev_claims_today: 0, has_prescription: true, has_bill: true } },
  { id: "TC008", label: "Fraud Detection", tag: "REVIEW", tagColor: "#6d28d9", data: { member_name: "Ravi Menon", member_id: "EMP008", treatment_date: TODAY, join_date: JOIN, claim_amount: 4800, hospital: "", is_cashless: false, doctor_name: "Dr. Khan", doctor_reg: "UP/45678/2016", diagnosis: "Migraine", consultation_fee: 2000, medicine_cost: 2800, diagnostic_cost: 0, dental_cost: 0, other_cost: 0, medicines_list: "Sumatriptan, Propranolol", tests_list: "", procedures_list: "", prev_claims_today: 3, has_prescription: true, has_bill: true } },
  { id: "TC009", label: "Excluded Treatment", tag: "REJECTED", tagColor: "#b91c1c", data: { member_name: "Anita Desai", member_id: "EMP009", treatment_date: TODAY, join_date: JOIN, claim_amount: 8000, hospital: "", is_cashless: false, doctor_name: "Dr. Banerjee", doctor_reg: "WB/34567/2015", diagnosis: "Obesity - BMI 35 weight loss", consultation_fee: 3000, medicine_cost: 0, diagnostic_cost: 0, dental_cost: 0, other_cost: 5000, medicines_list: "", tests_list: "", procedures_list: "Bariatric consultation", prev_claims_today: 0, has_prescription: true, has_bill: true } },
  { id: "TC010", label: "Network Cashless", tag: "APPROVED", tagColor: "#15803d", data: { member_name: "Deepak Shah", member_id: "EMP010", treatment_date: TODAY, join_date: JOIN, claim_amount: 4500, hospital: "Apollo Hospitals", is_cashless: true, doctor_name: "Dr. Iyer", doctor_reg: "TN/56789/2013", diagnosis: "Acute bronchitis", consultation_fee: 1500, medicine_cost: 3000, diagnostic_cost: 0, dental_cost: 0, other_cost: 0, medicines_list: "Antibiotics, Bronchodilators", tests_list: "", procedures_list: "", prev_claims_today: 0, has_prescription: true, has_bill: true } },
];

// Decision config: colors/backgrounds tuned for dark theme
export const DC = {
  APPROVED:      { color: "#4ade80", bg: "#052e16", border: "#14532d", icon: "✓", label: "Approved" },
  PARTIAL:       { color: "#fbbf24", bg: "#1c1400", border: "#854d0e", icon: "◑", label: "Partial Approval" },
  REJECTED:      { color: "#f87171", bg: "#1a0505", border: "#7f1d1d", icon: "✕", label: "Rejected" },
  MANUAL_REVIEW: { color: "#fb923c", bg: "#1a0d00", border: "#7c2d12", icon: "⊙", label: "Manual Review" },
};

export const EMPTY_FORM = {
  member_name: "", member_id: "", treatment_date: "", join_date: "",
  claim_amount: "", hospital: "", is_cashless: false, doctor_name: "",
  doctor_reg: "", diagnosis: "", consultation_fee: "", medicine_cost: "",
  diagnostic_cost: "", dental_cost: "", other_cost: "", medicines_list: "",
  tests_list: "", procedures_list: "", prev_claims_today: "0",
  has_prescription: true, has_bill: true,
};
