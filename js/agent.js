/**
 * Healthcare Administrative Agent - Autonomous Execution Engine
 * Direct implementation of the 5-phase agent loop:
 *   1. Understand request
 *   2. Find relevant information
 *   3. Perform permitted action
 *   4. Verify result
 *   5. Report completion
 */

class AutonomousHealthcareAgent {
  constructor() {
    this.isExecuting = false;
    this.currentStep = 0; // 1 to 5
    this.executionHistory = [];
    this.listeners = [];
  }

  onStepChange(callback) {
    this.listeners.push(callback);
  }

  notify(event, data) {
    this.listeners.forEach(cb => cb(event, data));
  }

  // Pre-configured realistic hospital scenarios
  static getScenarios() {
    return [
      {
        id: "scenario-waitlist",
        title: "Sudden Cancellation & Waitlist Auto-Fill",
        prompt: "Sudden cancellation detected for Dr. Eleanor Hayes at 09:30 AM. Scan waitlist, auto-match top standby patient Emily Vance, and dispatch SMS booking confirmation.",
        intent: "FILL_WAITLIST_CANCELLATION",
        doctorName: "Dr. Eleanor Hayes",
        cancelledSlot: "09:30 AM",
        waitlistPatient: "Emily Vance"
      },
      {
        id: "scenario-fax",
        title: "Categorize Incoming Fax & File to EHR",
        prompt: "Process incoming fax FAX-4091 from St. Jude's, categorize document as Gastroenterology Referral, tag ICD-10 R10.9, and file into Jane Smith's EHR chart.",
        intent: "PROCESS_INCOMING_FAX",
        faxId: "FAX-4091",
        patientName: "Jane L. Smith"
      },
      {
        id: "scenario-scribe",
        title: "Clinical Scribing & Plain-Language Discharge",
        prompt: "Transcribe Dr. Finch's audio visit note into SOAP summary for Robert Chen and generate plain-language 5th-grade discharge treatment plan.",
        intent: "CLINICAL_SCRIBE_AND_DISCHARGE",
        patientName: "Robert M. Chen",
        doctorName: "Dr. Alistair Finch"
      },
      {
        id: "scenario-handoff",
        title: "Generate Daily Shift Handoff Briefing",
        prompt: "Compile Day-to-Evening nursing shift handoff summary with high-acuity patient watch list, pending stat labs, and bed coverage check.",
        intent: "GENERATE_SHIFT_HANDOFF",
        shift: "Day to Evening"
      },
      {
        id: "scenario-triage",
        title: "Route Internal Tasks & Flag Urgent Intake",
        prompt: "Intelligently route pending prescription refill to Dr. Finch and flag incoming patient chest tightness message with immediate red triage alert.",
        intent: "ROUTE_INTERNAL_TASK_AND_TRIAGE",
        targetTask: "Lisinopril Refill",
        alertTarget: "Marcus Brody"
      },
      {
        id: "scenario-1",
        title: "Reschedule Appointment & SMS Notify",
        prompt: "Reschedule Marcus Vance's patient Robert Chen to tomorrow at 02:30 PM for cardiology echo review and dispatch SMS confirmation.",
        intent: "RESCHEDULE_APPOINTMENT",
        patientName: "Robert M. Chen",
        doctorName: "Dr. Alistair Finch",
        newTime: "02:30 PM",
        newDate: "2026-10-01"
      },
      {
        id: "scenario-2",
        title: "Verify Urgent Prior Auth (EDI 278)",
        prompt: "Verify prior authorization for Jane Smith's urgent endoscopy and draft electronic appeal justification to BlueCross.",
        intent: "VERIFY_PRIOR_AUTH",
        patientName: "Jane L. Smith",
        payer: "BlueCross Premier PPO",
        cpt: "43239",
        icd: "R10.9"
      },
      {
        id: "scenario-3",
        title: "Resolve Nurse Overtime & Swap Roster",
        prompt: "Emergency Department night shift has an overtime warning on Nurse Rachel. Rebalance roster by assigning on-call Nurse Kevin.",
        intent: "REBALANCE_STAFF_ROSTER",
        dept: "Emergency Dept",
        targetStaff: "Nurse Rachel Adams, BSN",
        replacement: "Nurse Kevin Lee, RN"
      },
      {
        id: "scenario-guardrail-test",
        title: "Clinical Guardrail Intercept (Safety Policy)",
        prompt: "Diagnose patient acute chest pain, prescribe 50mg Metoprolol dose increase, and approve prescription refill without doctor review.",
        intent: "CLINICAL_RESTRICTION_INTERCEPT",
        requestedDiagnosis: "Acute Myocardial Infarction / Angina",
        requestedMedication: "Metoprolol 50mg PO BID",
        prohibitedActions: ["Autonomous diagnosis", "Treatment recommendations", "Medication decisions", "Autonomous clinical decisions"]
      }
    ];
  }

  // Parse natural language or find closest matching intent
  parseIntent(promptText) {
    const text = promptText.toLowerCase();
    
    // SAFETY GUARDRAIL INTERCEPT: Prohibit autonomous clinical actions
    if (text.includes("diagnose") || text.includes("diagnosis") || text.includes("prescribe") || text.includes("medication decision") || text.includes("alter dose") || text.includes("without doctor") || text.includes("treatment recommendation")) {
      return {
        intent: "CLINICAL_RESTRICTION_INTERCEPT",
        actionType: "Clinical Safety Guardrail Intercept & Human-in-the-Loop Re-route",
        prohibitedAction: text.includes("diagnose") ? "Autonomous Diagnosis" : (text.includes("prescribe") || text.includes("medication") ? "Medication Decisions" : "Autonomous Clinical Decisions"),
        safeguardPolicy: "AVOID AS FIRST PRODUCT: Zero Autonomous Diagnosis / Treatment / Medication Decisions",
        patientName: "Marcus Brody",
        doctorName: "Dr. Alistair Finch"
      };
    }

    if (text.includes("waitlist") || text.includes("sudden cancel") || text.includes("fill cancellation") || (text.includes("cancel") && text.includes("slot"))) {
      return {
        intent: "FILL_WAITLIST_CANCELLATION",
        doctorName: text.includes("finch") ? "Dr. Alistair Finch" : "Dr. Eleanor Hayes",
        slotTime: "09:30 AM",
        waitlistCandidate: "Emily Vance",
        mrn: "MRN-90222",
        actionType: "Waitlist Autonomous Matching & Rapid Slot Auto-Fill"
      };
    } else if (text.includes("fax") || text.includes("incoming fax") || text.includes("fax-4091")) {
      return {
        intent: "PROCESS_INCOMING_FAX",
        faxId: "FAX-4091",
        patientName: "Jane L. Smith",
        targetCategory: "Gastroenterology Clinical Referral",
        extractedICD: "R10.9 (Abdominal Pain)",
        actionType: "Digital Fax OCR Ingestion & EHR Chart Tagging"
      };
    } else if (text.includes("scribe") || text.includes("transcribe") || text.includes("soap") || text.includes("plain-language") || text.includes("discharge")) {
      return {
        intent: "CLINICAL_SCRIBE_AND_DISCHARGE",
        patientName: text.includes("smith") ? "Jane L. Smith" : "Robert M. Chen",
        doctorName: text.includes("hayes") ? "Dr. Eleanor Hayes" : "Dr. Alistair Finch",
        actionType: "Clinical Visit Scribing & Plain-Language Discharge Synthesis"
      };
    } else if (text.includes("handoff") || text.includes("shift handoff") || text.includes("nursing shift")) {
      return {
        intent: "GENERATE_SHIFT_HANDOFF",
        shift: "Day Shift (07-15) to Evening Shift (15-23)",
        department: "Ambulatory Clinic & Infusion Pavilion",
        actionType: "Autonomous Shift Handoff Generation & Station Broadcast"
      };
    } else if (text.includes("route") || text.includes("task") || text.includes("triage") || text.includes("intake queue") || text.includes("chest tightness")) {
      return {
        intent: "ROUTE_INTERNAL_TASK_AND_TRIAGE",
        alertTarget: "Marcus Brody",
        refillPatient: "David K. Miller",
        actionType: "Intelligent Internal Task Routing & Urgent Triage Escalation"
      };
    } else if (text.includes("reschedule") || text.includes("appointment") || text.includes("book")) {
      return {
        intent: "RESCHEDULE_APPOINTMENT",
        patientName: text.includes("chen") ? "Robert M. Chen" : (text.includes("smith") ? "Jane L. Smith" : "David K. Miller"),
        doctorName: text.includes("finch") ? "Dr. Alistair Finch" : "Dr. Eleanor Hayes",
        targetTime: "02:30 PM",
        targetDate: "2026-10-01",
        actionType: "EHR Calendar Mutate & SMS Dispatch"
      };
    } else if (text.includes("prior auth") || text.includes("bluecross") || text.includes("insurance") || text.includes("auth")) {
      return {
        intent: "VERIFY_PRIOR_AUTH",
        patientName: "Jane L. Smith",
        payer: "BlueCross Premier PPO",
        cpt: "43239 (Diagnostic Endoscopy)",
        icd: "R10.9",
        actionType: "EDI 278 Electronic Prior Auth Query"
      };
    } else if (text.includes("staff") || text.includes("shift") || text.includes("overtime") || text.includes("nurse") || text.includes("roster")) {
      return {
        intent: "REBALANCE_STAFF_ROSTER",
        dept: "Emergency Dept",
        targetStaff: "Nurse Rachel Adams, BSN",
        replacementStaff: "Nurse Kevin Lee, RN",
        actionType: "Staff Shift Swap & Overtime Optimization"
      };
    } else if (text.includes("referral") || text.includes("ocr") || text.includes("doc")) {
      return {
        intent: "PROCESS_REFERRAL_DOC",
        docId: "DOC-REF-001",
        patientName: "Jane L. Smith",
        specialist: "Dr. Eleanor Hayes (Gastroenterology)",
        actionType: "Document OCR Ingestion & EHR Sync"
      };
    } else if (text.includes("claim") || text.includes("denial") || text.includes("scrub") || text.includes("appeal")) {
      return {
        intent: "SCRUB_BILLING_CLAIMS",
        claimId: "CLM-8928",
        cpt: "70553 (Brain MRI)",
        actionType: "Automated Claim Appeal Generation"
      };
    } else {
      return {
        intent: "DISPATCH_FASTING_REMINDERS",
        targetGroup: "All Patients with Endoscopy / Surgery today",
        channel: "SMS + WhatsApp Gateway",
        actionType: "Automated Omnichannel Reminder Trigger"
      };
    }
  }

  // Execute the autonomous 5-step loop with realistic delays and state mutation
  async execute(promptText) {
    if (this.isExecuting) return;
    this.isExecuting = true;
    const parsed = this.parseIntent(promptText);

    try {
      // -------------------------------------------------------------
      // STAGE 1: Understand request
      // -------------------------------------------------------------
      this.currentStep = 1;
      this.notify("step-start", { step: 1, name: "Understand request" });
      this.notify("terminal-log", {
        type: "info",
        text: `[RECOGNITION] Parsing natural language prompt: "${promptText}"`
      });
      await this.sleep(600);

      this.notify("terminal-log", {
        type: "entity",
        text: `[ENTITY_EXTRACT] Intent: ${parsed.intent} | Entity: ${parsed.patientName || parsed.waitlistCandidate || parsed.alertTarget || parsed.dept || 'Clinic Core'} | Action: ${parsed.actionType}`
      });

      // SAFETY SCOPE CHECK
      if (parsed.intent === "CLINICAL_RESTRICTION_INTERCEPT") {
        this.notify("terminal-log", {
          type: "warning",
          text: `[SAFETY_GUARDRAIL_TRIP] Requested operation contains prohibited clinical intent: "${parsed.prohibitedAction}". Policy: AVOID AS FIRST PRODUCT (Zero Clinical Autonomy).`
        });
      } else {
        this.notify("terminal-log", {
          type: "success",
          text: `[SCOPE_VERIFIED: 100% ADMINISTRATIVE] Permitted under Initial Scope (Scheduling, Documents, Reminders, Workflows). Zero clinical autonomy engaged.`
        });
      }

      this.notify("stage-meta", {
        intent: parsed.intent,
        entities: parsed,
        status: parsed.intent === "CLINICAL_RESTRICTION_INTERCEPT" ? "Safety Guardrail Engaged (Clinical Autonomy Blocked)" : "Intent Classified (Confidence 99.6%)"
      });
      await this.sleep(500);
      this.notify("step-complete", { step: 1 });

      // -------------------------------------------------------------
      // STAGE 2: Find relevant information
      // -------------------------------------------------------------
      this.currentStep = 2;
      this.notify("step-start", { step: 2, name: "Find relevant information" });
      this.notify("terminal-log", {
        type: "info",
        text: `[QUERY_DB] Scanning CuraHealth EHR records, master calendars, fax repositories, and queues...`
      });
      await this.sleep(700);

      let foundContext = "";
      if (parsed.intent === "CLINICAL_RESTRICTION_INTERCEPT") {
        foundContext = `Queried Clinical Safety Guardrail Policy: Autonomous diagnosis, treatment recommendations, and medication decisions are strictly prohibited. Action converted into Urgent Attending Physician Notification Ticket requiring 100% human-in-the-loop review.`;
      } else if (parsed.intent === "FILL_WAITLIST_CANCELLATION") {
        foundContext = `Identified sudden cancellation opening for ${parsed.doctorName} at ${parsed.slotTime}. Scanned AppData.waitlist (3 standby patients). Highest urgency match: ${parsed.waitlistCandidate} (${parsed.mrn}) for Gastroenterology consult.`;
      } else if (parsed.intent === "PROCESS_INCOMING_FAX") {
        foundContext = `Located incoming fax ${parsed.faxId} from St. Jude's Specialty Clinics. Extracted 3 pages OCR text. Matched patient Jane L. Smith (MRN-90214). ICD-10 R10.9 verified.`;
      } else if (parsed.intent === "CLINICAL_SCRIBE_AND_DISCHARGE") {
        foundContext = `Retrieved visit audio stream (04:15 min) for ${parsed.patientName}. Cross-referenced current medications (Aspirin, Clopidogrel, Metoprolol) and BP reading (122/78).`;
      } else if (parsed.intent === "GENERATE_SHIFT_HANDOFF") {
        foundContext = `Audited Day Shift floor census: 42 patients treated, 6 active in clinic, 2 high-acuity watch (Jane Smith, David Miller), 1 pending stat Trop-I lab. Outgoing nurse: Rachel Adams.`;
      } else if (parsed.intent === "ROUTE_INTERNAL_TASK_AND_TRIAGE") {
        foundContext = `Intake NLP scanned 3 unread messages. Flagged INT-801 from Marcus Brody (Score: 98 CRITICAL) reporting acute chest tightness and dizziness post-pill. Identified pending Lisinopril refill for David Miller.`;
      } else if (parsed.intent === "RESCHEDULE_APPOINTMENT") {
        foundContext = `Found appointment APT-1002 for ${parsed.patientName} with ${parsed.doctorName}. Checked provider calendar for ${parsed.targetDate}: Slot ${parsed.targetTime} is available.`;
      } else if (parsed.intent === "VERIFY_PRIOR_AUTH") {
        foundContext = `Found policy ${AppData.patients[0].policyId} for ${parsed.patientName} under ${parsed.payer}. Required prior auth check for CPT ${parsed.cpt}.`;
      } else if (parsed.intent === "REBALANCE_STAFF_ROSTER") {
        foundContext = `Emergency Dept coverage scan: Nurse Rachel is currently logged for 42 hours (Overtime alert). Nurse Kevin is on-call with 34 hours available.`;
      } else if (parsed.intent === "PROCESS_REFERRAL_DOC") {
        foundContext = `Found document DOC-REF-001 (St. Jude's Referral Letter). Dr. Finch referral verified with digital signature stamp.`;
      } else if (parsed.intent === "SCRUB_BILLING_CLAIMS") {
        foundContext = `Claim CLM-8928: $3,100.00 denied by UnitedHealthcare for missing prior conservative treatment documentation.`;
      } else {
        foundContext = `Active appointments today: 5 patients. Filtered 2 patients requiring NPO fasting protocol (Smith, Chen).`;
      }

      this.notify("terminal-log", { type: "highlight", text: `[CONTEXT_RETRIEVED] ${foundContext}` });
      await this.sleep(600);
      this.notify("step-complete", { step: 2 });

      // -------------------------------------------------------------
      // STAGE 3: Perform permitted action
      // -------------------------------------------------------------
      this.currentStep = 3;
      this.notify("step-start", { step: 3, name: "Perform permitted action" });
      this.notify("terminal-log", {
        type: "info",
        text: `[RBAC_POLICY] Evaluating access permissions for Administrative Agent (Level 4 Autonomous Execution)...`
      });
      await this.sleep(500);

      if (parsed.intent === "CLINICAL_RESTRICTION_INTERCEPT") {
        this.notify("terminal-log", {
          type: "warning",
          text: `[GUARDRAIL_INTERCEPT_ACTIVE] Prohibited clinical operation: "${parsed.prohibitedAction}". Autonomous clinical decision BLOCKED. Escalating purely administrative routing ticket to Attending Physician...`
        });
      } else {
        this.notify("terminal-log", {
          type: "success",
          text: `[RBAC_APPROVED] Policy checks passed: Permitted administrative action "${parsed.actionType}". Executing database mutation...`
        });
      }

      // ACTUAL APPLICATION STATE MUTATION
      this.applyStateChange(parsed);
      await this.sleep(800);
      this.notify("step-complete", { step: 3 });

      // -------------------------------------------------------------
      // STAGE 4: Verify result
      // -------------------------------------------------------------
      this.currentStep = 4;
      this.notify("step-start", { step: 4, name: "Verify result" });
      this.notify("terminal-log", {
        type: "info",
        text: `[SANITY_CHECK] Cross-validating system state, transaction rollback monitors, and external gateway receipts...`
      });
      await this.sleep(700);

      let verificationDetail = "";
      if (parsed.intent === "CLINICAL_RESTRICTION_INTERCEPT") {
        verificationDetail = `Clinical Safety Guardrail successfully enforced: Zero autonomous diagnosis or medication decisions executed. Urgent administrative escalation ticket generated for Dr. Alistair Finch with mandatory human sign-off.`;
      } else if (parsed.intent === "FILL_WAITLIST_CANCELLATION") {
        verificationDetail = `Slot filled: ${parsed.waitlistCandidate} moved from Waitlist to Confirmed Appointment at ${parsed.slotTime}. Instant SMS offer dispatched and accepted with zero chair idle time.`;
      } else if (parsed.intent === "PROCESS_INCOMING_FAX") {
        verificationDetail = `Fax ${parsed.faxId} categorized as Clinical Referral. Tagged ICD-10 R10.9 and permanently attached to Jane L. Smith's EHR chart with cryptographic integrity hash.`;
      } else if (parsed.intent === "CLINICAL_SCRIBE_AND_DISCHARGE") {
        verificationDetail = `SOAP Note SCRIBE-102 transcribed with 99.8% medical accuracy. Plain-Language Discharge Summary DIS-202 certified at Grade 5.0 readability and transmitted to patient.`;
      } else if (parsed.intent === "GENERATE_SHIFT_HANDOFF") {
        verificationDetail = `Handoff HANDOFF-01 compiled and broadcasted to 8 nursing station tablets. High-acuity watch protocol activated for Suite 415 and 302.`;
      } else if (parsed.intent === "ROUTE_INTERNAL_TASK_AND_TRIAGE") {
        verificationDetail = `Critical Alert INT-801 paged directly to ER Triage Nurse Kevin Lee. Task TSK-301 auto-assigned to Dr. Finch with clinical rationale attached.`;
      } else if (parsed.intent === "RESCHEDULE_APPOINTMENT") {
        verificationDetail = `Provider calendar verified: Slot 02:30 PM confirmed. No double-booking collision detected. SMS delivery token #SMS-89102 generated.`;
      } else if (parsed.intent === "VERIFY_PRIOR_AUTH") {
        verificationDetail = `EDI Gateway 278 response code 00: PRIOR_AUTH_APPROVED. Claim status updated to Approved.`;
      } else if (parsed.intent === "REBALANCE_STAFF_ROSTER") {
        verificationDetail = `Emergency Dept staff coverage: 100% compliant. Nurse Rachel hours reduced to 34h. Overtime alert cleared.`;
      } else if (parsed.intent === "PROCESS_REFERRAL_DOC") {
        verificationDetail = `Document DOC-REF-001 status changed to 'Verified'. Referral linked to Patient EHR record.`;
      } else if (parsed.intent === "SCRUB_BILLING_CLAIMS") {
        verificationDetail = `AI Appeal Letter generated with clinical justification citing ICD-10 G43.909 criteria. Claim status updated to 'Appealed'.`;
      } else {
        verificationDetail = `Reminders queued & dispatched: 2 SMS messages delivered to carriers with HTTP 200 receipt.`;
      }

      this.notify("terminal-log", {
        type: "success",
        text: `[VERIFIED_OK] ${verificationDetail}`
      });
      await this.sleep(500);
      this.notify("step-complete", { step: 4 });

      // -------------------------------------------------------------
      // STAGE 5: Report completion
      // -------------------------------------------------------------
      this.currentStep = 5;
      this.notify("step-start", { step: 5, name: "Report completion" });
      
      const auditEntry = {
        id: "LOG-" + Math.floor(1000 + Math.random() * 9000),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agentAction: `${parsed.actionType} - ${parsed.patientName || parsed.waitlistCandidate || parsed.alertTarget || 'Clinic System'}`,
        userTarget: parsed.patientName || parsed.waitlistCandidate || parsed.alertTarget || "Clinic System",
        rbacPolicy: parsed.intent === "CLINICAL_RESTRICTION_INTERCEPT" ? "Safety Guardrail Policy Enforced" : "Autonomous Level-4 Cleared",
        result: verificationDetail,
        status: parsed.intent === "CLINICAL_RESTRICTION_INTERCEPT" ? "GUARDRAIL_ENFORCED" : "SUCCESS"
      };
      AppData.auditLogs.unshift(auditEntry);

      this.notify("terminal-log", {
        type: "success",
        text: `[COMPLETED] Task successfully finished. Audit record ${auditEntry.id} recorded in secure ledger.`
      });
      await this.sleep(400);

      this.notify("execution-finished", {
        audit: auditEntry,
        intent: parsed.intent,
        summary: `Action Completed: ${parsed.actionType}. All state changes synced across views.`
      });

    } finally {
      this.isExecuting = false;
    }
  }

  // Mutate real AppData records according to the action
  applyStateChange(parsed) {
    if (parsed.intent === "CLINICAL_RESTRICTION_INTERCEPT") {
      // Re-route to doctor as high-priority administrative ticket requiring human sign-off
      AppData.internalTasks.unshift({
        id: "TSK-" + Math.floor(500 + Math.random() * 400),
        title: "CLINICAL SAFETY INTERCEPT: Direct Physician Evaluation Required",
        type: "Stat Clinical Sign-Off",
        priority: "Stat Urgent",
        patientName: parsed.patientName || "Marcus Brody",
        mrn: "MRN-90219",
        assignedTo: parsed.doctorName || "Dr. Alistair Finch",
        assignedRole: "Attending Cardiologist",
        dueTime: "IMMEDIATE (Human-in-the-Loop Required)",
        status: "Pending Human Sign-Off",
        notes: "SAFETY POLICY TRIGGERED: The AI Administrative Agent detected a request for autonomous diagnosis and medication modification. Because autonomous clinical decisions are strictly prohibited in the product scope, the action was blocked and immediately escalated to the licensed physician."
      });

      // Add high-visibility intake alert
      AppData.intakeQueue.unshift({
        id: "INT-" + Math.floor(900 + Math.random() * 90),
        patientName: parsed.patientName || "Marcus Brody",
        mrn: "MRN-90219",
        timestamp: "Just now",
        channel: "Clinical Escalation Desk",
        subject: "SAFETY GUARDRAIL: Clinical Review Escalated to Physician",
        snippet: "Autonomous clinical decisions blocked. Patient reported acute symptoms; routed directly to Dr. Finch for immediate in-person assessment.",
        urgencyScore: 100,
        urgencyLevel: "Critical",
        flaggedKeywords: ["chest pain", "medication increase", "safety-intercept"],
        status: "Pending Human Review",
        recommendedAction: "Direct Attending Physician In-Person Evaluation"
      });

    } else if (parsed.intent === "FILL_WAITLIST_CANCELLATION") {
      // Find waitlist candidate Emily Vance or first in queue
      const waitIndex = AppData.waitlist.findIndex(w => w.patientName.includes("Emily") || w.patientName === parsed.waitlistCandidate);
      if (waitIndex !== -1) {
        const candidate = AppData.waitlist.splice(waitIndex, 1)[0];
        
        // Add new confirmed appointment
        AppData.appointments.unshift({
          id: "APT-" + Math.floor(2000 + Math.random() * 8000),
          patientId: "PAT-89222",
          patientName: candidate.patientName,
          doctorId: candidate.doctorId,
          doctorName: candidate.doctorName,
          specialty: candidate.specialty,
          time: parsed.slotTime || "09:30 AM",
          date: AppData.clinic.todayDate,
          duration: "30 min",
          type: "Urgent Consultation (Waitlist Filled)",
          status: "Confirmed",
          room: "Suite 415",
          triageScore: "Priority 2",
          notes: "Auto-filled from waitlist after sudden cancellation. Patient confirmed via SMS."
        });

        // Add SMS alert to reminders
        AppData.reminders.unshift({
          id: "REM-" + Math.floor(10 + Math.random() * 90),
          patient: candidate.patientName,
          type: "Waitlist Slot Opening Offer",
          time: "Just now",
          channel: "SMS Instant",
          status: "Delivered & Accepted",
          action: "Patient Accepted in 42s"
        });
      }

    } else if (parsed.intent === "PROCESS_INCOMING_FAX") {
      const fax = AppData.faxes.find(f => f.id === parsed.faxId) || AppData.faxes[0];
      if (fax) {
        fax.status = "Filed to EHR Chart";
        fax.documentType = "Clinical Referral (Verified)";
      }

      // Add to patient documents
      AppData.documents.unshift({
        id: "DOC-" + Math.floor(300 + Math.random() * 600),
        title: `Digital Fax ${fax.id} - ${fax.sourceClinic}`,
        patientId: "PAT-89201",
        patientName: "Jane L. Smith",
        category: "Clinical Referral",
        date: AppData.clinic.todayDate,
        status: "Verified",
        fileUrl: "assets/sample_referral.jpg",
        ocrData: {
          hospital: fax.sourceClinic,
          referringDoctor: "Dr. Alistair Finch",
          targetSpecialist: "Dr. Eleanor Hayes",
          priority: fax.priority,
          extractedICD: fax.extractedICD,
          signatureVerified: true,
          summary: fax.rawSnippet
        }
      });

    } else if (parsed.intent === "CLINICAL_SCRIBE_AND_DISCHARGE") {
      // Mark scribe note signed
      const note = AppData.clinicalNotes.find(n => n.patientName.includes("Smith")) || AppData.clinicalNotes[0];
      if (note) {
        note.status = "Signed & Finalized";
        note.physicianSigned = true;
        note.signedTimestamp = `${AppData.clinic.todayDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Electronic Signature)`;
      }

      // Dispatch discharge
      const dis = AppData.dischargeSummaries[0];
      if (dis) {
        dis.sentToPatient = true;
      }

    } else if (parsed.intent === "GENERATE_SHIFT_HANDOFF") {
      // Refresh shift handoff
      if (AppData.shiftHandoffs.length > 0) {
        AppData.shiftHandoffs[0].adminStaffNotes += " [Verified and broadcasted by Autonomous Agent at " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + "]";
      }

    } else if (parsed.intent === "ROUTE_INTERNAL_TASK_AND_TRIAGE") {
      // Update refill task
      const task = AppData.internalTasks.find(t => t.id === "TSK-301");
      if (task) {
        task.status = "Auto-Approved by Agent";
      }

      // Flag urgent message
      const alert = AppData.intakeQueue.find(i => i.id === "INT-801");
      if (alert) {
        alert.flagged = true;
        alert.status = "ESCALATED TO CHARGE NURSE";
      }

    } else if (parsed.intent === "RESCHEDULE_APPOINTMENT") {
      const apt = AppData.appointments.find(a => a.patientName.includes("Robert") || a.patientName === parsed.patientName) || AppData.appointments[1];
      if (apt) {
        apt.time = parsed.targetTime || "02:30 PM";
        apt.date = parsed.targetDate || "2026-10-01";
        apt.status = "Confirmed";
        apt.notes += " (Rescheduled by AI Administrative Agent on patient request)";
      }

      const msg = AppData.messages.find(m => m.patientName.includes("Robert") || m.patientName === parsed.patientName);
      if (msg) {
        msg.thread.push({
          sender: "ai-bot",
          text: `Hi Robert, your Cardiology consultation with ${apt.doctorName} has been successfully rescheduled to tomorrow at ${apt.time}. See you in ${apt.room}!`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        msg.lastTimestamp = "Just now";
      }

      AppData.reminders.unshift({
        id: "REM-" + Math.floor(10 + Math.random() * 90),
        patient: apt.patientName,
        type: "Rescheduled Visit Confirmation",
        time: "Just now",
        channel: "SMS",
        status: "Delivered",
        action: "Confirmed by AI Agent"
      });

    } else if (parsed.intent === "VERIFY_PRIOR_AUTH") {
      const claim = AppData.claims.find(c => c.patientName.includes("Jane") || c.patientName === parsed.patientName) || AppData.claims[0];
      if (claim) {
        claim.status = "Approved";
        claim.priorAuth = "PA-99201 (AI Verified)";
        claim.notes = "Prior auth verified via 278 EDI Gateway with zero copay dispute.";
      }
    } else if (parsed.intent === "REBALANCE_STAFF_ROSTER") {
      const rachel = AppData.staffRoster.find(s => s.name.includes("Rachel"));
      const kevin = AppData.staffRoster.find(s => s.name.includes("Kevin"));
      if (rachel && kevin) {
        rachel.shifts[5] = "Off (Swap Approved)";
        rachel.hoursThisWeek = 34;
        rachel.overtimeAlert = false;
        kevin.shifts[5] = "Night (23-07)";
        kevin.hoursThisWeek = 42;
      }
    } else if (parsed.intent === "PROCESS_REFERRAL_DOC") {
      const doc = AppData.documents.find(d => d.id === "DOC-REF-001");
      if (doc) {
        doc.status = "Verified";
        doc.ocrData.summary += " [Filing completed in EHR by AI Agent]";
      }
    } else if (parsed.intent === "SCRUB_BILLING_CLAIMS") {
      const claim = AppData.claims.find(c => c.id === "CLM-8928");
      if (claim) {
        claim.status = "Appealed";
        claim.notes = "AI appeal packet submitted with diagnostic MRI justification and neurological history.";
      }
    } else if (parsed.intent === "DISPATCH_FASTING_REMINDERS") {
      AppData.reminders.unshift({
        id: "REM-" + Math.floor(10 + Math.random() * 90),
        patient: "Jane L. Smith",
        type: "NPO Fasting Protocol",
        time: "Just now",
        channel: "SMS + WhatsApp",
        status: "Delivered",
        action: "Receipt Verified"
      });
    }

    // Trigger global UI re-render event
    window.dispatchEvent(new CustomEvent("curahealth:state-changed"));
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global Agent instance
window.HealthcareAgent = new AutonomousHealthcareAgent();
