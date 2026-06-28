import { POLICY } from "./constants.js";

export function validateDoctorReg(reg) {
  if (!reg) return false;
  return (
    /^[A-Z]{2}\/\d{4,6}\/\d{4}$/.test(reg) ||
    /^AYUR\/[A-Z]{2}\/\d{4,6}\/\d{4}$/.test(reg)
  );
}

export function checkWaitingPeriod(diagnosis, joinStr, treatStr) {
  try {
    const join = new Date(joinStr);
    const treat = new Date(treatStr);
    const days = Math.floor((treat - join) / 86400000);
    const d = diagnosis.toLowerCase();

    const rules = [
      ["diabetes", 90],
      ["hypertension", 90],
      ["blood pressure", 90],
      ["maternity", 270],
    ];

    for (const [kw, period] of rules) {
      if (d.includes(kw) && days < period) {
        const eligibleDate = new Date(join);
        eligibleDate.setDate(eligibleDate.getDate() + period);
        return `${kw.charAt(0).toUpperCase() + kw.slice(1)} has ${period}-day waiting period. Eligible from ${eligibleDate.toISOString().split("T")[0]}`;
      }
    }

    if (days < 30) {
      return `Initial 30-day waiting period not completed (${days} days elapsed)`;
    }

    return null;
  } catch {
    return null;
  }
}

export function checkExclusions(diagnosis, procedures, items) {
  const EX = POLICY.exclusion_keywords;
  const d = diagnosis.toLowerCase();

  // Full exclusion if diagnosis itself is excluded
  for (const kw of EX) {
    if (d.includes(kw)) {
      return {
        excluded: true,
        reason: `Diagnosis '${diagnosis}' is excluded from coverage`,
        excluded_items: [diagnosis],
        covered_amount: 0,
        is_partial: false,
      };
    }
  }

  const excludedProcs = procedures.filter((p) =>
    EX.some((kw) => p.toLowerCase().includes(kw))
  );
  const coveredProcs = procedures.filter(
    (p) => !EX.some((kw) => p.toLowerCase().includes(kw))
  );

  // Partial: some covered, some excluded
  if (excludedProcs.length && coveredProcs.length) {
    let coveredAmount =
      (parseFloat(items.consultation_fee) || 0) +
      (parseFloat(items.medicine_cost) || 0) +
      (parseFloat(items.diagnostic_cost) || 0) +
      (parseFloat(items.other_cost) || 0);

    const coveredDentalProcedures = ["root canal", "filling", "extraction", "cleaning", "cavity"];
    const hasCoveredDental = coveredProcs.some((p) =>
      coveredDentalProcedures.some((dk) => p.toLowerCase().includes(dk))
    );
    if (hasCoveredDental) coveredAmount += parseFloat(items.dental_cost) || 0;

    // Fallback: split proportionally by procedure count
    if (coveredAmount === 0) {
      const total = parseFloat(items.claim_amount) || 0;
      const perProc = total / (procedures.length || 1);
      coveredAmount = coveredProcs.length * perProc;
    }

    return {
      excluded: true,
      reason: `Partially excluded: ${excludedProcs.map((e) => e.trim()).join(", ")} not covered`,
      excluded_items: excludedProcs,
      covered_amount: Math.round(coveredAmount),
      is_partial: true,
    };
  }

  if (excludedProcs.length) {
    return {
      excluded: true,
      reason: `Not covered: ${excludedProcs.join(", ")}`,
      excluded_items: excludedProcs,
      covered_amount: 0,
      is_partial: false,
    };
  }

  return { excluded: false };
}

export function adjudicateClaim(form, claimsHistory = []) {
  const rejections = [];
  const flags = [];
  const notes = [];

  const total = parseFloat(form.claim_amount) || 0;
  const procedures = form.procedures_list
    ? form.procedures_list.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  const tests = form.tests_list
    ? form.tests_list.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  // Run exclusions first to determine if partial (affects limit check)
  const excl = checkExclusions(form.diagnosis, procedures, form);
  let rejected_items = [];

  // STEP 1: Eligibility
  if (total < POLICY.min_claim_amount) {
    rejections.push("BELOW_MIN_AMOUNT");
    notes.push(`Amount ₹${total} below minimum ₹${POLICY.min_claim_amount}`);
  }

  // Annual limit check
  const totalApprovedThisYear = claimsHistory
    .filter((h) => h.decision === "APPROVED" || h.decision === "PARTIAL")
    .reduce((sum, h) => sum + (h.approved_amount || 0), 0);

  if (totalApprovedThisYear >= POLICY.annual_limit) {
    rejections.push("ANNUAL_LIMIT_EXCEEDED");
    notes.push(`Annual limit of ₹${POLICY.annual_limit.toLocaleString()} fully utilized`);
  } else if (totalApprovedThisYear + total > POLICY.annual_limit) {
    const remaining = POLICY.annual_limit - totalApprovedThisYear;
    notes.push(`Note: Only ₹${remaining.toLocaleString()} of annual limit remaining`);
  }

  // Late submission
  if (form.treatment_date) {
    const daysSince = Math.floor(
      (new Date() - new Date(form.treatment_date)) / 86400000
    );
    if (daysSince > POLICY.submission_deadline_days) {
      rejections.push("LATE_SUBMISSION");
      notes.push(
        `Submitted ${daysSince} days after treatment (deadline: ${POLICY.submission_deadline_days} days)`
      );
    }
  }

  // Waiting period
  if (form.join_date && form.treatment_date) {
    const wp = checkWaitingPeriod(form.diagnosis, form.join_date, form.treatment_date);
    if (wp) {
      rejections.push("WAITING_PERIOD");
      notes.push(wp);
    }
  }

  // STEP 2: Documents
  if (!form.has_prescription) {
    rejections.push("MISSING_DOCUMENTS");
    notes.push("Prescription from registered doctor required");
  }
  if (form.doctor_reg && !validateDoctorReg(form.doctor_reg)) {
    rejections.push("DOCTOR_REG_INVALID");
    notes.push(`Invalid doctor registration format: ${form.doctor_reg}`);
  }

  // STEP 3: Coverage
  if (excl.excluded) {
    rejections.push("SERVICE_NOT_COVERED");
    notes.push(excl.reason);
    rejected_items = excl.excluded_items;
  }

  // Pre-authorization check
  for (const item of [...tests, ...procedures]) {
    for (const pa of POLICY.pre_auth_required) {
      if (item.toLowerCase().includes(pa.toLowerCase())) {
        rejections.push("PRE_AUTH_MISSING");
        notes.push(`${item} requires pre-authorization`);
        break;
      }
    }
  }

  // STEP 4: Per-claim limit (skip for partial claims — sub-limits apply instead)
  if (total > POLICY.per_claim_limit && !excl.is_partial) {
    rejections.push("PER_CLAIM_EXCEEDED");
    notes.push(`₹${total} exceeds per-claim limit of ₹${POLICY.per_claim_limit}`);
  }

  // Duplicate detection
  if (claimsHistory.length > 0) {
    const duplicate = claimsHistory.find(
      (h) =>
        h.member_id === form.member_id &&
        h.treatment_date === form.treatment_date &&
        h.diagnosis?.toLowerCase() === form.diagnosis?.toLowerCase() &&
        h.decision !== "MANUAL_REVIEW"
    );
    if (duplicate) {
      rejections.push("DUPLICATE_CLAIM");
      notes.push(`Duplicate: ${duplicate.claim_id} already processed`);
    }
  }

  // STEP 6: Fraud detection
  const prevClaimsToday = parseInt(form.prev_claims_today) || 0;
  if (prevClaimsToday >= 3) {
    flags.push("Multiple claims same day — possible fraud");
    flags.push("Unusual claim pattern detected");
  }
  if (total > 25000) {
    flags.push(`High-value claim ₹${total} — requires manual authorization`);
  }

  // Amount calculation (apply sub-limits)
  const cons = Math.min(parseFloat(form.consultation_fee) || 0, POLICY.consultation_sub_limit);
  const meds = Math.min(parseFloat(form.medicine_cost) || 0, POLICY.pharmacy_sub_limit);
  const diag = Math.min(parseFloat(form.diagnostic_cost) || 0, POLICY.diagnostic_sub_limit);
  const dent = Math.min(parseFloat(form.dental_cost) || 0, POLICY.dental_sub_limit);
  const alt  = Math.min(parseFloat(form.other_cost) || 0, POLICY.alternative_sub_limit);
  let gross = cons + meds + diag + dent + alt || total;

  const is_network = POLICY.network_hospitals.includes(form.hospital);
  let network_discount = 0;
  if (is_network) {
    network_discount = Math.round(gross * (POLICY.network_discount / 100));
    gross -= network_discount;
  }

  const copay = Math.round(gross * (POLICY.copay_percentage / 100));
  const net = Math.round(gross - copay);

  // Determine final decision
  let decision, approved_amount, confidence_score;

  if (flags.length > 0) {
    // Fraud flags always escalate to manual review
    decision = "MANUAL_REVIEW";
    approved_amount = 0;
    confidence_score = rejections.length > 0 ? 0.55 : 0.65;
  } else if (rejections.length > 0) {
    const onlyPartialExclusion =
      rejections.length === 1 &&
      rejections[0] === "SERVICE_NOT_COVERED" &&
      excl.is_partial &&
      excl.covered_amount > 0;

    if (onlyPartialExclusion) {
      decision = "PARTIAL";
      const partialCopay = Math.round(excl.covered_amount * (POLICY.copay_percentage / 100));
      approved_amount = Math.round(excl.covered_amount - partialCopay);
      confidence_score = 0.90;
    } else {
      decision = "REJECTED";
      approved_amount = 0;
      confidence_score = 0.95;
    }
  } else {
    decision = "APPROVED";
    approved_amount = net;
    confidence_score = 0.92;
  }

  const next_steps = {
    APPROVED: "Payment will be processed in 3–5 business days.",
    REJECTED: `Claim rejected: ${rejections.join(", ")}. You may appeal within 30 days.`,
    PARTIAL: "Covered portion will be paid in 3–5 business days. Excluded items must be paid out of pocket.",
    MANUAL_REVIEW: "Your claim has been escalated to a specialist who will contact you within 48 hours.",
  }[decision];

  return {
    decision,
    approved_amount,
    rejection_reasons: rejections,
    rejected_items,
    flags,
    confidence_score,
    notes: notes.join(" | ") || "Claim processed successfully",
    next_steps,
    is_network,
    network_discount,
    copay_deducted: decision === "APPROVED" || decision === "PARTIAL" ? copay : 0,
    cashless_approved: is_network && form.is_cashless && decision === "APPROVED",
    annual_utilized: totalApprovedThisYear,
  };
}
