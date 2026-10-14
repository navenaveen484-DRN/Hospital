/**
 * Healthcare Administrative Agent - Main Application Controller
 * Handles all 9 modules, interactive views, chart rendering, and agent bindings
 */

document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  loadSavedHospitalBrand();
  setupSidebar();
  setupNavigation();
  setupThemeToggle();
  setupAgentModal();
  setupEventListeners();
  setupKeyboardShortcuts();
  renderAllViews();

  // Listen for state change events dispatched by the AI agent
  window.addEventListener("curahealth:state-changed", () => {
    renderAllViews();
    showToast("System State Updated", "AI Administrative Agent synchronized database records across all modules.", "ai");
  });
}

// --------------------------------------------------------------------------
// Navigation & Routing (8 Core Modules + Clinical AI Workflows)
// --------------------------------------------------------------------------
function normalizeModuleName(view) {
  if (!view) return "dashboard";
  const v = view.toLowerCase().replace(/[\s_-]+/g, "");
  if (v === "overview" || v === "home" || v === "dash" || v === "dashboard") return "dashboard";
  if (v === "patient" || v === "patients") return "patients";
  if (v === "doctor" || v === "doctors" || v === "physicians" || v === "providers") return "doctors";
  if (v === "appointment" || v === "appointments" || v === "appoinments" || v === "calendar" || v === "booking") return "appointments";
  if (v === "department" || v === "departments" || v === "dept" || v === "depts" || v === "units") return "departments";
  if (v === "medicalrecords" || v === "records" || v === "medicalrecord" || v === "documents" || v === "doc" || v === "ehr") return "medicalrecords";
  if (v === "billing" || v === "bill" || v === "claims" || v === "insurance") return "billing";
  if (v === "room" || v === "rooms" || v === "beds" || v === "bed") return "rooms";
  if (v === "staff" || v === "staffs" || v === "scheduling" || v === "roster" || v === "nurses") return "staff";
  return v;
}

function navigateToModule(targetView) {
  const normKey = normalizeModuleName(targetView);
  const navItems = document.querySelectorAll(".nav-item");
  const viewSections = document.querySelectorAll(".view-section");

  // Map normalized keys to supported section IDs and aliases
  const moduleTargetMap = {
    dashboard: ["view-dashboard", "view-overview"],
    patients: ["view-patients"],
    doctors: ["view-doctors"],
    appointments: ["view-appointments"],
    departments: ["view-departments"],
    medicalrecords: ["view-medicalrecords", "view-documents"],
    billing: ["view-billing", "view-insurance"],
    rooms: ["view-rooms"],
    staff: ["view-staff", "view-scheduling"],
    summaries: ["view-summaries"],
    coordination: ["view-coordination"],
    communication: ["view-communication"],
    reminders: ["view-reminders"],
    workflows: ["view-workflows"],
    reporting: ["view-reporting"],
    agent: ["view-agent"]
  };

  const validTargets = moduleTargetMap[normKey] || [`view-${normKey}`, `view-${targetView}`];

  // Update active state on navigation sidebar
  navItems.forEach(n => {
    const v = n.getAttribute("data-view");
    const itemNorm = normalizeModuleName(v);
    if (itemNorm === normKey || v === targetView) {
      n.classList.add("active");
    } else {
      n.classList.remove("active");
    }
  });

  // Toggle active view section
  viewSections.forEach(section => {
    const sId = section.id;
    const sAlias = section.getAttribute("data-alias");
    const isMatch = validTargets.includes(sId) || 
                    (sAlias && validTargets.some(t => t.includes(sAlias))) ||
                    sId === `view-${normKey}` || 
                    sId === `view-${targetView}`;

    if (isMatch) {
      section.classList.add("active");
    } else {
      section.classList.remove("active");
    }
  });

  // Sync window hash for bookmarking & back button
  try {
    if (window.location.hash !== `#${normKey}`) {
      history.replaceState(null, null, `#${normKey}`);
    }
  } catch (e) {
    // Ignore iframe / sandboxed state errors
  }

  window.scrollTo({ top: 0, behavior: "smooth" });

  // On-demand rendering for optimal performance & instant reactivity
  if (normKey === "patients") renderPatients();
  else if (normKey === "doctors") renderDoctors();
  else if (normKey === "appointments") { renderAppointments(); renderWaitlist(); }
  else if (normKey === "departments") renderDepartments();
  else if (normKey === "medicalrecords") { renderDocuments(); renderFaxes(); }
  else if (normKey === "billing") renderInsuranceClaims();
  else if (normKey === "rooms") renderRooms();
  else if (normKey === "staff") renderStaff();
  else if (normKey === "reporting") renderCharts();
  else if (normKey === "dashboard") { renderHospiCareDashboard(); updateBenefitCalculator(); }
}
window.navigateToModule = navigateToModule;

function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const targetView = item.getAttribute("data-view");
      navigateToModule(targetView);

      // Close mobile drawer on item select
      if (window.innerWidth <= 1024) {
        document.getElementById("mainSidebar")?.classList.remove("open");
        document.getElementById("sidebarBackdrop")?.classList.remove("active");
      }
    });
  });

  // URL Hash listener for browser back/forward and deep linking
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.replace("#", "");
    if (hash) navigateToModule(hash);
  });

  // Initial load hash check
  const initHash = window.location.hash.replace("#", "");
  if (initHash) {
    setTimeout(() => navigateToModule(initHash), 50);
  }
}

// --------------------------------------------------------------------------
// Collapsible Sidebar & Expanded Workspace Controller
// --------------------------------------------------------------------------
function setupSidebar() {
  const sidebar = document.getElementById("mainSidebar");
  const collapseBtn = document.getElementById("sidebarCollapseBtn");
  const toggleBtn = document.getElementById("sidebarToggleBtn");
  const backdrop = document.getElementById("sidebarBackdrop");

  // Restore persisted state from localStorage
  const isCollapsed = typeof localStorage !== 'undefined' ? localStorage.getItem("curahealth_sidebar_collapsed") === "true" : false;
  if (isCollapsed && window.innerWidth > 1024) {
    document.body.classList.add("sidebar-collapsed");
  }

  function toggleSidebar() {
    if (window.innerWidth <= 1024) {
      const isOpen = sidebar?.classList.toggle("open");
      backdrop?.classList.toggle("active", isOpen);
    } else {
      document.body.classList.toggle("sidebar-collapsed");
      const collapsed = document.body.classList.contains("sidebar-collapsed");
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem("curahealth_sidebar_collapsed", collapsed);
      }
      showToast(
        collapsed ? "Workspace Expanded" : "Sidebar Expanded",
        collapsed ? "Sidebar collapsed to icon-only mode." : "Full navigation sidebar restored.",
        "info"
      );
    }
  }

  collapseBtn?.addEventListener("click", toggleSidebar);
  toggleBtn?.addEventListener("click", toggleSidebar);
  backdrop?.addEventListener("click", () => {
    sidebar?.classList.remove("open");
    backdrop?.classList.remove("active");
  });
}

// --------------------------------------------------------------------------
// Global Keyboard Shortcuts (Ctrl+B, Ctrl+K, Esc)
// --------------------------------------------------------------------------
function setupKeyboardShortcuts() {
  window.addEventListener("keydown", (e) => {
    // Ctrl+B or Cmd+B to toggle sidebar collapse
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
      e.preventDefault();
      const collapseBtn = document.getElementById("sidebarCollapseBtn");
      collapseBtn?.click();
    }

    // Ctrl+K or Cmd+K to focus global search
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      const searchInput = document.getElementById("globalHeaderSearch");
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }

    // Esc to close modals or blur search
    if (e.key === "Escape") {
      const brandModal = document.getElementById("hospitalBrandModal");
      if (brandModal?.classList.contains("active")) {
        closeHospitalBrandModal();
      }
      const drilldownModal = document.getElementById("metricDrilldownModal");
      if (drilldownModal?.classList.contains("active")) {
        closeMetricDetails();
      }
      const agentModal = document.getElementById("agentModalOverlay");
      if (agentModal?.classList.contains("active")) {
        agentModal.classList.remove("active");
      }
      const safetyModal = document.getElementById("safetyScopeModal");
      if (safetyModal?.classList.contains("active")) {
        safetyModal.classList.remove("active");
      }
      const sidebar = document.getElementById("mainSidebar");
      const backdrop = document.getElementById("sidebarBackdrop");
      if (sidebar?.classList.contains("open")) {
        sidebar.classList.remove("open");
        backdrop?.classList.remove("active");
      }
      if (document.activeElement === document.getElementById("globalHeaderSearch")) {
        document.activeElement.blur();
      }
    }
  });
}

// --------------------------------------------------------------------------
// Theme Toggle (Dark / Light)
// --------------------------------------------------------------------------
function setupThemeToggle() {
  const themeBtn = document.getElementById("themeToggleBtn");
  if (!themeBtn) return;

  themeBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    showToast("Theme Changed", `Switched to ${newTheme} mode.`, "info");
    
    // Re-render charts with updated theme colors if on reporting view
    if (document.getElementById("view-reporting")?.classList.contains("active")) {
      renderCharts();
    }
  });
}

// --------------------------------------------------------------------------
// Security: HTML Sanitization Utility & Global Error Boundary
// --------------------------------------------------------------------------
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
window.escapeHtml = escapeHtml;

window.addEventListener("error", (event) => {
  console.error("HospiCare Unhandled Error:", event.error || event.message);
});
window.addEventListener("unhandledrejection", (event) => {
  console.error("HospiCare Unhandled Promise Rejection:", event.reason);
});

// --------------------------------------------------------------------------
// Global Toast Notifications
// --------------------------------------------------------------------------
function showToast(title, message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  let iconSvg = "";
  if (type === "success") {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`;
  } else if (type === "ai") {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>`;
  } else {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
  }

  toast.innerHTML = `
    <div style="flex-shrink:0; padding-top:2px;">${iconSvg}</div>
    <div class="toast-content">
      <div class="toast-title">${escapeHtml(title)}</div>
      <div class="toast-msg">${escapeHtml(message)}</div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = "all 0.3s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    setTimeout(() => {
      if (typeof toast.remove === "function") {
        toast.remove();
      } else if (toast && toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 4000);
}

// --------------------------------------------------------------------------
// AI Administrative Agent Modal & Execution Hook
// --------------------------------------------------------------------------
function setupAgentModal() {
  const modalOverlay = document.getElementById("agentModalOverlay");
  const openBtns = [document.getElementById("btnOpenAgentModal"), document.getElementById("btnSidebarAgent")];
  const closeBtn = document.getElementById("btnCloseAgentModal");
  const promptInput = document.getElementById("agentPromptInput");
  const btnRun = document.getElementById("btnRunAgent");
  const presetCards = document.querySelectorAll(".preset-card");

  openBtns.forEach(btn => {
    if (btn) btn.addEventListener("click", () => modalOverlay.classList.add("active"));
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => modalOverlay.classList.remove("active"));
  }

  modalOverlay?.addEventListener("click", (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove("active");
  });

  // Preset scenarios click
  presetCards.forEach(card => {
    card.addEventListener("click", () => {
      const prompt = card.getAttribute("data-prompt");
      if (promptInput) promptInput.value = prompt;
      runAgentLoop(prompt);
    });
  });

  btnRun?.addEventListener("click", () => {
    const text = promptInput?.value.trim();
    if (text) runAgentLoop(text);
  });

  promptInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const text = promptInput?.value.trim();
      if (text) runAgentLoop(text);
    }
  });

  // Connect agent engine step listener to UI visualizer
  window.HealthcareAgent.onStepChange((event, data) => {
    handleAgentEvent(event, data);
  });
}

function runAgentLoop(promptText) {
  resetAgentVisualizer();
  window.HealthcareAgent.execute(promptText);
}

function resetAgentVisualizer() {
  const steps = document.querySelectorAll(".step-card");
  steps.forEach(s => {
    s.classList.remove("active", "completed");
    s.classList.add("waiting");
    const statusText = s.querySelector(".step-status-text");
    if (statusText) statusText.textContent = "Waiting...";
    const iconContainer = s.querySelector(".step-icon-indicator");
    if (iconContainer) iconContainer.innerHTML = "";
  });

  const terminal = document.getElementById("agentTerminalOutput");
  if (terminal) terminal.innerHTML = "";

  const metaBox = document.getElementById("agentMetaBox");
  if (metaBox) {
    metaBox.innerHTML = `
      <div class="meta-field">
        <span class="meta-field-label">Autonomous State</span>
        <span class="meta-field-val" style="color:var(--teal-primary)">Processing Natural Language...</span>
      </div>
    `;
  }
}

function handleAgentEvent(event, data) {
  const terminal = document.getElementById("agentTerminalOutput");

  if (event === "step-start") {
    const stepEl = document.querySelector(`.step-card[data-step="${data.step}"]`);
    if (stepEl) {
      stepEl.classList.remove("waiting");
      stepEl.classList.add("active");
      const statusText = stepEl.querySelector(".step-status-text");
      if (statusText) statusText.textContent = "In progress...";
      const icon = stepEl.querySelector(".step-icon-indicator");
      if (icon) icon.innerHTML = `<div class="radar-spinner"></div>`;
    }
  } else if (event === "step-complete") {
    const stepEl = document.querySelector(`.step-card[data-step="${data.step}"]`);
    if (stepEl) {
      stepEl.classList.remove("active");
      stepEl.classList.add("completed");
      const statusText = stepEl.querySelector(".step-status-text");
      if (statusText) statusText.textContent = "Verified OK";
      const icon = stepEl.querySelector(".step-icon-indicator");
      if (icon) icon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
    }
  } else if (event === "terminal-log") {
    if (terminal) {
      const line = document.createElement("div");
      line.className = "terminal-line";
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      line.innerHTML = `
        <span class="line-timestamp">[${time}]</span>
        <span class="line-prefix">agent@curahealth:~$</span>
        <span class="line-content ${data.type || ''}">${data.text}</span>
      `;
      terminal.appendChild(line);
      terminal.scrollTop = terminal.scrollHeight;
    }
  } else if (event === "stage-meta") {
    const metaBox = document.getElementById("agentMetaBox");
    if (metaBox && data.entities) {
      metaBox.innerHTML = `
        <div class="meta-field">
          <span class="meta-field-label">Detected Intent</span>
          <span class="meta-field-val" style="color:var(--purple-ai)">${data.intent}</span>
        </div>
        <div class="meta-field">
          <span class="meta-field-label">Target Entity</span>
          <span class="meta-field-val">${data.entities.patientName || data.entities.dept || 'System Roster'}</span>
        </div>
        <div class="meta-field">
          <span class="meta-field-label">Permitted Action</span>
          <span class="meta-field-val" style="color:var(--teal-primary)">${data.entities.actionType || 'Verified State Update'}</span>
        </div>
        <div class="meta-field">
          <span class="meta-field-label">RBAC Compliance</span>
          <span class="meta-field-val" style="color:var(--emerald-success)">Level 4 - Auto Approved</span>
        </div>
      `;
    }
  } else if (event === "execution-finished") {
    showToast("Agent Task Completed", data.summary, "success");
    // Update live counter badge in header
    const counterBadge = document.getElementById("agentTasksCountBadge");
    if (counterBadge) {
      let count = parseInt(counterBadge.textContent) || 384;
      counterBadge.textContent = count + 1;
    }
  }
}

// --------------------------------------------------------------------------
// Master Render Function
// --------------------------------------------------------------------------
function renderAllViews() {
  renderHospiCareDashboard();
  renderDepartments();
  renderPatients();
  renderDoctors();
  renderRooms();
  renderAppointments();
  renderWaitlist();
  renderPatientComms();
  renderDocuments();
  renderFaxes();
  renderAdministrativeSummaries();
  renderTaskCoordination();
  renderStaff();
  renderInsuranceClaims();
  renderReminders();
  renderWorkflows();
  renderAuditLogs();
  updateBenefitCalculator();
}

// --------------------------------------------------------------------------
// Module 1: Appointment Management & Waitlist
// --------------------------------------------------------------------------
function renderAppointments() {
  const tbody = document.getElementById("appointmentsTableBody");
  if (!tbody) return;

  const doctorFilter = document.getElementById("filterDoctorSelect")?.value || "ALL";
  const statusFilter = document.getElementById("filterStatusSelect")?.value || "ALL";

  let filtered = AppData.appointments;
  if (doctorFilter !== "ALL") {
    filtered = filtered.filter(a => a.doctorId === doctorFilter);
  }
  if (statusFilter !== "ALL") {
    filtered = filtered.filter(a => a.status.toLowerCase() === statusFilter.toLowerCase());
  }

  tbody.innerHTML = filtered.map(apt => `
    <tr>
      <td>
        <div class="user-cell">
          <div class="avatar avatar-sm">${apt.patientName.split(" ").map(n => n[0]).join("")}</div>
          <div class="user-cell-meta">
            <span class="user-cell-name">${escapeHtml(apt.patientName)}</span>
            <span class="user-cell-sub">${escapeHtml(apt.id)} • ${escapeHtml(apt.triageScore)}</span>
          </div>
        </div>
      </td>
      <td>
        <strong>${escapeHtml(apt.doctorName)}</strong>
        <div class="user-cell-sub">${escapeHtml(apt.specialty)} • ${escapeHtml(apt.room)}</div>
      </td>
      <td>
        <strong>${escapeHtml(apt.time)}</strong>
        <div class="user-cell-sub">${escapeHtml(apt.date)} (${escapeHtml(apt.duration)})</div>
      </td>
      <td>
        <span class="badge badge-${apt.status.toLowerCase().replace(" ", "-")}">
          <span class="badge-dot" style="background: currentColor;"></span>
          ${escapeHtml(apt.status)}
        </span>
      </td>
      <td>
        <div style="font-size:0.78rem; max-width:240px; color:var(--text-secondary);">${escapeHtml(apt.notes)}</div>
      </td>
      <td>
        <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
          <button class="btn btn-sm btn-secondary" onclick="quickCheckIn('${escapeHtml(apt.id)}')" title="Mark Patient Checked In">
            Check In
          </button>
          <button class="btn btn-sm btn-ai" onclick="agentQuickReschedule('${escapeHtml(apt.patientName).replace(/'/g, "\\'")}')" title="AI Reschedule Assist">
            Reschedule
          </button>
          <button class="btn btn-sm btn-danger" onclick="cancelAppointmentAndAutoFill('${escapeHtml(apt.id)}')" title="Cancel & Auto-Fill from Waitlist">
            Cancel & Fill
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

function renderWaitlist() {
  const tbody = document.getElementById("waitlistTableBody");
  const countBadge = document.getElementById("waitlistCountBadge");
  if (!tbody) return;

  if (countBadge) {
    countBadge.textContent = `${AppData.waitlist.length} Standby Patients`;
  }

  if (AppData.waitlist.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding:1.5rem; color:var(--text-muted);">
          All waitlist slots successfully matched and filled by the autonomous agent!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = AppData.waitlist.map(w => `
    <tr>
      <td><strong>${w.id}</strong></td>
      <td>
        <div style="font-weight:600; color:var(--text-main);">${w.patientName}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${w.mrn} • ${w.phone}</div>
      </td>
      <td>
        <strong>${w.doctorName}</strong>
        <div style="font-size:0.75rem; color:var(--teal-light);">${w.specialty}</div>
      </td>
      <td><span style="font-size:0.8rem; font-weight:600;">${w.requestedWindow}</span></td>
      <td>
        <span class="badge ${w.urgency === 'High' ? 'badge-urgent' : (w.urgency === 'Medium' ? 'badge-scheduled' : 'badge-confirmed')}">
          ${w.urgency} Priority
        </span>
      </td>
      <td><div style="font-size:0.78rem; max-width:220px; color:var(--text-secondary);">${w.notes}</div></td>
      <td>
        <button class="btn btn-sm btn-ai" onclick="autoFillWaitlistSlot('${w.id}')" title="Auto-match with open cancellation">
          ⚡ Auto-Fill Slot
        </button>
      </td>
    </tr>
  `).join("");
}

window.quickCheckIn = function(aptId) {
  const apt = AppData.appointments.find(a => a.id === aptId);
  if (apt) {
    apt.status = "Checked-in";
    renderAppointments();
    showToast("Patient Checked In", `${apt.patientName} checked in for ${apt.specialty}. Room ${apt.room} alerted.`, "success");
  }
};

window.agentQuickReschedule = function(patientName) {
  const modalOverlay = document.getElementById("agentModalOverlay");
  modalOverlay?.classList.add("active");
  const promptInput = document.getElementById("agentPromptInput");
  if (promptInput) {
    promptInput.value = `Reschedule ${patientName} to next available slot tomorrow afternoon and notify patient.`;
    runAgentLoop(promptInput.value);
  }
};

window.cancelAppointmentAndAutoFill = function(aptId) {
  const apt = AppData.appointments.find(a => a.id === aptId);
  if (!apt) return;

  const targetDoc = apt.doctorName;
  const targetTime = apt.time;
  const patientCancelled = apt.patientName;

  // Mark cancelled
  apt.status = "Cancelled";
  apt.notes += " [Cancelled by patient - Auto-Recovery Triggered]";
  renderAppointments();

  showToast("Cancellation Detected", `${patientCancelled} cancelled at ${targetTime}. Triggering autonomous waitlist scan...`, "info");

  // Trigger agent loop
  setTimeout(() => {
    window.HealthcareAgent.execute(`Sudden cancellation detected for ${targetDoc} at ${targetTime}. Scan waitlist, auto-match top standby patient Emily Vance, and dispatch SMS booking confirmation.`);
  }, 600);
};

window.simulateCancellationAutoFill = function() {
  const prompt = "Sudden cancellation detected for Dr. Eleanor Hayes at 09:30 AM. Scan waitlist, auto-match top standby patient Emily Vance, and dispatch SMS booking confirmation.";
  const modalOverlay = document.getElementById("agentModalOverlay");
  modalOverlay?.classList.add("active");
  const promptInput = document.getElementById("agentPromptInput");
  if (promptInput) promptInput.value = prompt;
  runAgentLoop(prompt);
};

window.autoFillWaitlistSlot = function(waitId) {
  const candidate = AppData.waitlist.find(w => w.id === waitId);
  if (!candidate) return;

  const prompt = `Sudden cancellation opening for ${candidate.doctorName}. Match standby patient ${candidate.patientName} from waitlist, book appointment, and notify via SMS.`;
  const modalOverlay = document.getElementById("agentModalOverlay");
  modalOverlay?.classList.add("active");
  const promptInput = document.getElementById("agentPromptInput");
  if (promptInput) promptInput.value = prompt;
  runAgentLoop(prompt);
};

// --------------------------------------------------------------------------
// Module 2: Patient Communication
// --------------------------------------------------------------------------
let activeChatPatientId = "PAT-89201";

function renderPatientComms() {
  const listEl = document.getElementById("chatPatientList");
  if (!listEl) return;

  listEl.innerHTML = AppData.messages.map(msg => `
    <div class="chat-patient-item ${msg.patientId === activeChatPatientId ? 'active' : ''}" onclick="selectChatPatient('${msg.patientId}')">
      <div class="avatar">${msg.patientName.split(" ").map(n => n[0]).join("")}</div>
      <div style="flex:1; min-width:0;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="font-size:0.85rem; color:var(--text-main);">${msg.patientName}</strong>
          <span style="font-size:0.68rem; color:var(--text-muted);">${msg.lastTimestamp}</span>
        </div>
        <div style="font-size:0.75rem; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          ${msg.thread[msg.thread.length - 1].text}
        </div>
      </div>
      <span class="badge badge-sm badge-ai" style="font-size:0.65rem;">${msg.channel}</span>
    </div>
  `).join("");

  renderActiveChatThread();
}

window.selectChatPatient = function(patientId) {
  activeChatPatientId = patientId;
  renderPatientComms();
};

function renderActiveChatThread() {
  const activeMsg = AppData.messages.find(m => m.patientId === activeChatPatientId) || AppData.messages[0];
  const patient = AppData.patients.find(p => p.id === activeChatPatientId) || AppData.patients[0];

  const threadContainer = document.getElementById("chatThreadMessages");
  const chatHeaderName = document.getElementById("chatHeaderPatientName");
  const chatHeaderSub = document.getElementById("chatHeaderPatientSub");
  const patientInfoPanel = document.getElementById("chatPatientInfoPanel");

  if (chatHeaderName) chatHeaderName.textContent = activeMsg.patientName;
  if (chatHeaderSub) chatHeaderSub.textContent = `Channel: ${activeMsg.channel} • MRN: ${patient.mrn} • Policy: ${patient.policyId}`;

  if (threadContainer) {
    threadContainer.innerHTML = activeMsg.thread.map(item => `
      <div class="message-bubble ${item.sender}">
        <div style="font-size:0.7rem; font-weight:700; margin-bottom:0.2rem; opacity:0.8;">
          ${item.sender === 'patient' ? escapeHtml(activeMsg.patientName) : (item.sender === 'ai-bot' ? 'CuraHealth AI Agent' : 'Clinic Staff')}
        </div>
        <div>${escapeHtml(item.text)}</div>
        <div class="message-time">${escapeHtml(item.time)}</div>
      </div>
    `).join("");
    threadContainer.scrollTop = threadContainer.scrollHeight;
  }

  if (patientInfoPanel) {
    patientInfoPanel.innerHTML = `
      <div style="text-align:center; margin-bottom:1.25rem;">
        <div class="avatar" style="width:50px; height:50px; margin:0 auto 0.5rem; font-size:1.1rem;">
          ${patient.name.split(" ").map(n => n[0]).join("")}
        </div>
        <h3 style="font-size:1.05rem;">${patient.name}</h3>
        <p style="font-size:0.78rem; color:var(--text-muted);">DOB: ${patient.dob} (${patient.gender})</p>
      </div>

      <div style="display:flex; flex-direction:column; gap:0.85rem; font-size:0.82rem;">
        <div>
          <span style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Insurance Payer</span>
          <div style="font-weight:600; color:var(--text-main);">${patient.insurance}</div>
          <div style="font-size:0.74rem; color:var(--teal-light);">${patient.policyId}</div>
        </div>

        <div>
          <span style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Allergies</span>
          <div style="color:var(--rose-danger); font-weight:600;">${patient.allergies.join(", ")}</div>
        </div>

        <div>
          <span style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Clinical Condition</span>
          <div style="color:var(--text-secondary);">${patient.activeCondition}</div>
        </div>

        <div>
          <span style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; font-weight:600;">Contact Phone</span>
          <div style="color:var(--text-main);">${patient.phone}</div>
        </div>
      </div>
    `;
  }
}

window.sendChatMessage = function() {
  const input = document.getElementById("chatMessageInput");
  const text = input?.value.trim();
  if (!text) return;

  const activeMsg = AppData.messages.find(m => m.patientId === activeChatPatientId);
  if (activeMsg) {
    activeMsg.thread.push({
      sender: "staff",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    activeMsg.lastTimestamp = "Just now";
    input.value = "";
    renderPatientComms();
  }
};

window.aiDraftReply = function() {
  const input = document.getElementById("chatMessageInput");
  const activeMsg = AppData.messages.find(m => m.patientId === activeChatPatientId);
  if (!activeMsg) return;

  let suggested = "";
  if (activeChatPatientId === "PAT-89201") {
    suggested = "Dr. Hayes' suite is located on the 4th floor, Room 415. Please proceed directly to Reception Desk B where your digital intake has been verified.";
  } else if (activeChatPatientId === "PAT-89202") {
    suggested = "Your cardiology prescription renewal is ready for pickup at Walgreens. Please remember to record your morning blood pressure readings.";
  } else {
    suggested = "Hello Sarah, your surgical coordinator Dr. Reyes will review your intake checklist at 09:00 AM. Fasting begins at midnight tonight.";
  }

  if (input) input.value = suggested;
  showToast("AI Smart Draft Generated", "Drafted HIPAA-compliant clinical response. Click Send to transmit.", "ai");
};

// --------------------------------------------------------------------------
// Module 3: Document Management & AI OCR
// --------------------------------------------------------------------------
function renderDocuments() {
  const docContainer = document.getElementById("documentsListContainer");
  if (!docContainer) return;

  docContainer.innerHTML = AppData.documents.map(doc => `
    <div class="card" style="margin-bottom:1rem; cursor:pointer;" onclick="viewDocumentOcr('${doc.id}')">
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <span class="badge badge-ai" style="font-size:0.68rem; margin-bottom:0.4rem;">${doc.category}</span>
          <h4 style="font-size:0.95rem; margin-bottom:0.25rem;">${doc.title}</h4>
          <p style="font-size:0.78rem;">Patient: <strong>${doc.patientName}</strong> • Date: ${doc.date}</p>
        </div>
        <span class="badge badge-${doc.status === 'Verified' ? 'confirmed' : 'urgent'}">${doc.status}</span>
      </div>
      <div style="background:var(--bg-base); padding:0.65rem 0.85rem; border-radius:var(--radius-md); margin-top:0.75rem; font-size:0.8rem; color:var(--text-secondary); border-left:3px solid var(--teal-primary);">
        "${doc.ocrData.summary}"
      </div>
    </div>
  `).join("");

  renderFaxes();
}

function renderFaxes() {
  const faxContainer = document.getElementById("faxStreamContainer");
  const countBadge = document.getElementById("faxQueueCountBadge");
  if (!faxContainer) return;

  if (countBadge) {
    const pendingCount = AppData.faxes.filter(f => f.status !== 'Filed to EHR Chart').length;
    countBadge.textContent = `${pendingCount} Inbound Faxes Pending`;
  }

  faxContainer.innerHTML = AppData.faxes.map(fax => `
    <div class="fax-card ${fax.priority === 'Urgent' ? 'urgent-fax' : ''}">
      <div>
        <div class="fax-header">
          <div>
            <span class="fax-id">${fax.id}</span>
            <div style="font-weight:700; font-size:0.92rem; color:var(--text-main); margin-top:0.2rem;">${fax.sourceClinic}</div>
            <div class="fax-meta">${fax.senderNumber} • ${fax.timestamp} (${fax.pages} pages)</div>
          </div>
          <span class="badge ${fax.status === 'Filed to EHR Chart' ? 'badge-confirmed' : (fax.priority === 'Urgent' ? 'badge-urgent' : 'badge-scheduled')}">
            ${fax.status}
          </span>
        </div>

        <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin:0.6rem 0;">
          <span class="badge badge-ai" style="font-size:0.7rem;">${fax.suggestedCategory}</span>
          <span class="badge badge-scheduled" style="font-size:0.7rem;">ICD-10: ${fax.extractedICD}</span>
        </div>

        <div style="font-size:0.78rem; color:var(--text-muted); margin-bottom:0.4rem;">
          Matched Chart: <strong style="color:var(--teal-light);">${fax.patientMatch}</strong>
        </div>

        <div class="fax-snippet">
          ${fax.rawSnippet}
        </div>
      </div>

      <div style="margin-top:0.75rem; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.72rem; color:var(--text-muted);">Attending: ${fax.targetDoctor}</span>
        ${fax.status === 'Filed to EHR Chart' 
          ? '<span style="font-size:0.75rem; color:var(--emerald-success); font-weight:700;">✓ Synced to Patient Chart</span>'
          : `<button class="btn btn-sm btn-ai" onclick="fileFaxToEhr('${fax.id}')">⚡ Auto-Tag & File to EHR</button>`}
      </div>
    </div>
  `).join("");
}

window.fileFaxToEhr = function(faxId) {
  const fax = AppData.faxes.find(f => f.id === faxId);
  if (!fax) return;

  fax.status = "Filed to EHR Chart";
  
  // Add to documents repository
  AppData.documents.unshift({
    id: "DOC-" + Math.floor(300 + Math.random() * 600),
    title: `${fax.documentType} - ${fax.sourceClinic}`,
    patientId: fax.patientMatch.includes("Smith") ? "PAT-89201" : "PAT-89202",
    patientName: fax.patientMatch.split(" (")[0],
    category: fax.suggestedCategory,
    date: AppData.clinic.todayDate,
    status: "Verified",
    fileUrl: "assets/sample_referral.jpg",
    ocrData: {
      hospital: fax.sourceClinic,
      referringDoctor: "Dr. Alistair Finch",
      targetSpecialist: fax.targetDoctor,
      priority: fax.priority,
      extractedICD: fax.extractedICD,
      signatureVerified: true,
      summary: fax.rawSnippet
    }
  });

  renderDocuments();
  showToast("Fax Ingested & Filed", `Tagged ${fax.id} with ICD-10 ${fax.extractedICD} and permanently filed to ${fax.patientMatch}.`, "success");
};

window.processAllIncomingFaxes = function() {
  AppData.faxes.forEach(fax => {
    fax.status = "Filed to EHR Chart";
  });
  renderDocuments();
  showToast("All Faxes Processed", "4 incoming faxes parsed via OCR, tagged with ICD-10, and filed into respective patient charts.", "ai");
};

window.viewDocumentOcr = function(docId) {
  const doc = AppData.documents.find(d => d.id === docId) || AppData.documents[0];
  const ocrView = document.getElementById("activeOcrDetails");
  if (!ocrView) return;

  ocrView.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
      <h3 style="font-size:1.1rem; display:flex; align-items:center; gap:0.5rem;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal-primary)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        ${doc.title}
      </h3>
      <button class="btn btn-sm btn-ai" onclick="runDocumentOcrScan('${doc.id}')">
        ⚡ Re-Scan with AI OCR
      </button>
    </div>

    <div class="ocr-key-value-list">
      <div class="ocr-item">
        <span class="ocr-item-label">Source Facility</span>
        <div class="ocr-item-val">${doc.ocrData.hospital}</div>
      </div>
      <div class="ocr-item">
        <span class="ocr-item-label">Referring Physician</span>
        <div class="ocr-item-val">${doc.ocrData.referringDoctor}</div>
      </div>
      <div class="ocr-item">
        <span class="ocr-item-label">Target Specialty</span>
        <div class="ocr-item-val" style="color:var(--teal-light);">${doc.ocrData.targetSpecialist}</div>
      </div>
      <div class="ocr-item">
        <span class="ocr-item-label">ICD-10 Diagnostic Code</span>
        <div class="ocr-item-val" style="color:var(--emerald-success);">${doc.ocrData.extractedICD}</div>
      </div>
      <div class="ocr-item">
        <span class="ocr-item-label">Urgency Priority</span>
        <div class="ocr-item-val" style="color:var(--rose-danger); font-weight:700;">${doc.ocrData.priority}</div>
      </div>
      <div class="ocr-item">
        <span class="ocr-item-label">Doctor Signature Verification</span>
        <div class="ocr-item-val" style="color:var(--emerald-success);">✓ Cryptographically Valid</div>
      </div>
    </div>

    <div style="margin-top:1rem; padding:0.85rem; background:rgba(6,182,212,0.06); border:1px solid rgba(6,182,212,0.2); border-radius:var(--radius-md);">
      <strong style="font-size:0.8rem; color:var(--teal-light); text-transform:uppercase;">Extracted Clinical Impression:</strong>
      <p style="font-size:0.85rem; color:var(--text-main); margin-top:0.3rem;">${doc.ocrData.summary}</p>
    </div>
  `;
};

window.runDocumentOcrScan = function(docId) {
  showToast("AI OCR In Progress", "Extracting key medical entities, ICD-10 codes, and doctor signatures...", "ai");
  setTimeout(() => {
    const doc = AppData.documents.find(d => d.id === docId);
    if (doc) {
      doc.status = "Verified";
      renderDocuments();
      viewDocumentOcr(docId);
      showToast("OCR Scan Completed", "All clinical data extracted and synced with EHR database.", "success");
    }
  }, 1200);
};

// --------------------------------------------------------------------------
// Core Responsibility 3: Administrative Summaries
// --------------------------------------------------------------------------
function renderAdministrativeSummaries() {
  renderClinicalNotes();
  renderDischargeSummaries();
  renderShiftHandoffs();
}

function switchSummarySubTab(tabName) {
  const tabs = document.querySelectorAll(".sub-tab-btn[data-tab]");
  tabs.forEach(btn => {
    if (btn.getAttribute("data-tab") === tabName) {
      btn.classList.add("active");
    } else if (["scribe", "discharge", "handoff"].includes(btn.getAttribute("data-tab"))) {
      btn.classList.remove("active");
    }
  });

  const scribeTab = document.getElementById("summaryTabScribe");
  const disTab = document.getElementById("summaryTabDischarge");
  const handoffTab = document.getElementById("summaryTabHandoff");

  if (scribeTab) scribeTab.style.display = tabName === 'scribe' ? 'block' : 'none';
  if (disTab) disTab.style.display = tabName === 'discharge' ? 'block' : 'none';
  if (handoffTab) handoffTab.style.display = tabName === 'handoff' ? 'block' : 'none';
}

function renderClinicalNotes() {
  const container = document.getElementById("clinicalNotesContainer");
  if (!container) return;

  container.innerHTML = AppData.clinicalNotes.map(note => `
    <div class="card" style="margin-bottom:1.25rem;">
      <div class="card-header" style="flex-wrap:wrap; gap:0.5rem;">
        <div>
          <span class="badge badge-ai" style="margin-bottom:0.3rem;">Clinical Scribing • Note ID: ${note.id}</span>
          <h3 class="card-title">${note.patientName} — ${note.specialty} Consultation</h3>
          <span style="font-size:0.75rem; color:var(--text-muted);">Attending: ${note.doctorName} • Visit Date: ${note.visitDate} • Audio Length: ${note.audioDuration}</span>
        </div>
        <span class="badge ${note.physicianSigned ? 'badge-confirmed' : 'badge-scheduled'}">
          ${note.status}
        </span>
      </div>

      <div class="soap-container">
        <!-- Subjective & Objective -->
        <div>
          <div class="soap-block">
            <span class="soap-letter s">S</span>
            <strong style="font-size:0.85rem; color:var(--text-main);">Subjective (Chief Complaint & History):</strong>
            <p class="soap-content-text">${note.soapNote.subjective}</p>
          </div>

          <div class="soap-block">
            <span class="soap-letter o">O</span>
            <strong style="font-size:0.85rem; color:var(--text-main);">Objective (Vitals & Physical Exam):</strong>
            <p class="soap-content-text">${note.soapNote.objective}</p>
          </div>
        </div>

        <!-- Assessment & Plan -->
        <div>
          <div class="soap-block">
            <span class="soap-letter a">A</span>
            <strong style="font-size:0.85rem; color:var(--text-main);">Assessment (Clinical Impression & ICD-10):</strong>
            <p class="soap-content-text">${note.soapNote.assessment}</p>
          </div>

          <div class="soap-block">
            <span class="soap-letter p">P</span>
            <strong style="font-size:0.85rem; color:var(--text-main);">Plan (Rx, Orders, Follow-Up):</strong>
            <p class="soap-content-text">${note.soapNote.plan}</p>
          </div>
        </div>
      </div>

      <div style="margin-top:1rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
        ${note.physicianSigned ? `
          <div class="signature-seal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--emerald-success)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <div>
              <strong style="font-size:0.82rem; color:var(--emerald-success);">Electronically Reviewed & Signed by Attending Physician</strong>
              <div style="font-size:0.72rem; color:var(--text-muted);">${note.signedTimestamp}</div>
            </div>
          </div>
        ` : `
          <div style="font-size:0.78rem; color:var(--amber-warning);">
            ⚠️ Pending Attending Physician Signature & EHR Locking
          </div>
        `}

        <div style="display:flex; gap:0.5rem;">
          <button class="btn btn-sm btn-secondary" onclick="exportSoapPdf('${note.id}')">Export PDF / Print</button>
          ${!note.physicianSigned ? `
            <button class="btn btn-sm btn-primary" onclick="signOffClinicalNote('${note.id}')">
              ✍️ Sign & Finalize Note
            </button>
          ` : `
            <span class="badge badge-confirmed">Locked & Archived</span>
          `}
        </div>
      </div>
    </div>
  `).join("");
}

function renderDischargeSummaries() {
  const container = document.getElementById("dischargeSummariesContainer");
  if (!container) return;

  container.innerHTML = AppData.dischargeSummaries.map(dis => `
    <div class="plain-discharge-card">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
        <div>
          <span class="plain-badge-tag">${dis.readabilityGrade}</span>
          <h3 style="font-size:1.15rem; color:var(--text-main); margin-top:0.4rem;">Patient Take-Home Guide: ${dis.patientName}</h3>
          <span style="font-size:0.75rem; color:var(--text-muted);">Attending: ${dis.doctorName} • Date: ${dis.generatedDate}</span>
        </div>
        <span class="badge badge-confirmed">${dis.sentToPatient ? '✓ Dispatched to Patient' : 'Ready to Send'}</span>
      </div>

      <div>
        <div class="plain-bullet-item">
          <div class="plain-bullet-icon">🩺</div>
          <div>
            <div class="plain-bullet-title">What Happened at Your Visit Today</div>
            <div class="plain-bullet-text">${dis.plainSummary.whatHappened}</div>
          </div>
        </div>

        <div class="plain-bullet-item">
          <div class="plain-bullet-icon">💊</div>
          <div>
            <div class="plain-bullet-title">Your Medication Schedule & How to Take Them</div>
            <div class="plain-bullet-text">${dis.plainSummary.medicationChanges}</div>
          </div>
        </div>

        ${dis.plainSummary.fastingAlert ? `
          <div class="plain-bullet-item" style="border-left:3px solid var(--amber-warning);">
            <div class="plain-bullet-icon">⚠️</div>
            <div>
              <div class="plain-bullet-title" style="color:var(--amber-warning);">Important Fasting Guidelines</div>
              <div class="plain-bullet-text">${dis.plainSummary.fastingAlert}</div>
            </div>
          </div>
        ` : ''}

        ${dis.plainSummary.lifestyleGuide ? `
          <div class="plain-bullet-item">
            <div class="plain-bullet-icon">🏃</div>
            <div>
              <div class="plain-bullet-title">Daily Recovery & Health Tips</div>
              <div class="plain-bullet-text">${dis.plainSummary.lifestyleGuide}</div>
            </div>
          </div>
        ` : ''}

        <div class="plain-bullet-item" style="border-left:3px solid var(--rose-danger);">
          <div class="plain-bullet-icon">🚨</div>
          <div>
            <div class="plain-bullet-title" style="color:var(--rose-danger);">Red-Flag Warning Signs (When to Call Immediately)</div>
            <div class="plain-bullet-text">${dis.plainSummary.warningSigns}</div>
          </div>
        </div>

        <div class="plain-bullet-item">
          <div class="plain-bullet-icon">📅</div>
          <div>
            <div class="plain-bullet-title">Next Scheduled Appointment</div>
            <div class="plain-bullet-text">${dis.plainSummary.nextVisit}</div>
          </div>
        </div>
      </div>

      <div style="margin-top:1rem; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.75rem; color:var(--text-muted);">Delivery Channel: <strong>${dis.channel}</strong></span>
        <button class="btn btn-sm btn-ai" onclick="sendDischargeGuide('${dis.id}')">
          📲 Send Plain-Language Guide to Patient via SMS & Portal
        </button>
      </div>
    </div>
  `).join("");
}

function renderShiftHandoffs() {
  const container = document.getElementById("shiftHandoffContainer");
  if (!container) return;

  container.innerHTML = AppData.shiftHandoffs.map(h => `
    <div class="handoff-card">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
        <div>
          <span class="badge badge-ai" style="margin-bottom:0.3rem;">Clinical Shift Transition Memo</span>
          <h3 style="font-size:1.15rem; color:var(--text-main);">${h.department}</h3>
          <span style="font-size:0.78rem; color:var(--teal-light); font-weight:600;">Shift: ${h.shiftName} • Date: ${h.date}</span>
        </div>
        <span class="badge badge-confirmed">Shift Matrix Reconciled</span>
      </div>

      <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:1rem;">
        Outgoing Lead: <strong>${h.leadNurseOutgoing}</strong> ➔ Incoming Lead: <strong>${h.leadNurseIncoming}</strong>
      </div>

      <!-- Census Grid -->
      <div class="handoff-census-grid">
        <div class="handoff-census-item">
          <div class="handoff-census-val">${h.censusSummary.totalSeenToday}</div>
          <div class="handoff-census-lbl">Patients Seen Today</div>
        </div>
        <div class="handoff-census-item">
          <div class="handoff-census-val" style="color:var(--teal-light);">${h.censusSummary.activeInClinic}</div>
          <div class="handoff-census-lbl">Active In Clinic</div>
        </div>
        <div class="handoff-census-item">
          <div class="handoff-census-val" style="color:var(--rose-danger);">${h.censusSummary.highAcuityWatch}</div>
          <div class="handoff-census-lbl">High-Acuity Watch</div>
        </div>
        <div class="handoff-census-item">
          <div class="handoff-census-val" style="color:var(--amber-warning);">${h.censusSummary.pendingStatLabs}</div>
          <div class="handoff-census-lbl">Pending Stat Labs</div>
        </div>
      </div>

      <!-- High Acuity Watch List -->
      <div style="margin-bottom:1rem;">
        <h4 style="font-size:0.9rem; color:var(--rose-danger); margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
          <span style="width:8px; height:8px; border-radius:50%; background:var(--rose-danger);"></span>
          High-Acuity Patient Watch Roster
        </h4>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:0.75rem;">
          ${h.highAcuityPatients.map(p => `
            <div style="background:var(--bg-base); padding:0.75rem; border-radius:var(--radius-md); border-left:3px solid var(--rose-danger);">
              <strong style="font-size:0.85rem; color:var(--text-main);">${p.patient}</strong>
              <div style="font-size:0.75rem; color:var(--text-muted); margin:0.2rem 0;">Condition: ${p.condition}</div>
              <div style="font-size:0.78rem; color:var(--teal-light); font-weight:600;">Action: ${p.action}</div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Admin & Staff Notes -->
      <div style="background:rgba(18,26,43,0.9); padding:0.85rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle); margin-bottom:1rem; font-size:0.82rem; color:var(--text-secondary);">
        <strong style="color:var(--text-main);">Administrative & Floor Coordination Brief:</strong>
        <p style="margin-top:0.3rem;">${h.adminStaffNotes}</p>
      </div>

      <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
        <button class="btn btn-sm btn-secondary" onclick="window.print()">Print Handoff Sheet</button>
        <button class="btn btn-sm btn-primary" onclick="broadcastShiftHandoff('${h.id}')">
          📡 Broadcast to Nursing Station Tablets
        </button>
      </div>
    </div>
  `).join("");
}

window.signOffClinicalNote = function(noteId) {
  const note = AppData.clinicalNotes.find(n => n.id === noteId);
  if (note) {
    note.physicianSigned = true;
    note.status = "Signed & Finalized";
    note.signedTimestamp = `${AppData.clinic.todayDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Electronic Signature Stamp)`;
    renderClinicalNotes();
    showToast("Clinical Note Signed", `Note ${noteId} for ${note.patientName} electronically signed by ${note.doctorName} and locked in EHR.`, "success");
  }
};

window.sendDischargeGuide = function(disId) {
  const dis = AppData.dischargeSummaries.find(d => d.id === disId);
  if (dis) {
    dis.sentToPatient = true;
    renderDischargeSummaries();
    showToast("Discharge Guide Transmitted", `Plain-language instructions dispatched to ${dis.patientName} via SMS & Patient Portal with delivery confirmation.`, "success");
  }
};

window.broadcastShiftHandoff = function(handoffId) {
  showToast("Handoff Broadcasted", `Shift transition briefing sent to 8 nursing station tablets & charge nurse pager with 100% acknowledgment.`, "ai");
};

window.simulateClinicalScribe = function() {
  const prompt = "Transcribe Dr. Finch's audio visit note into SOAP summary for Robert Chen and generate plain-language 5th-grade discharge treatment plan.";
  const modalOverlay = document.getElementById("agentModalOverlay");
  modalOverlay?.classList.add("active");
  const promptInput = document.getElementById("agentPromptInput");
  if (promptInput) promptInput.value = prompt;
  runAgentLoop(prompt);
};

window.generateDailyHandoffSummary = function() {
  const prompt = "Compile Day-to-Evening nursing shift handoff summary with high-acuity patient watch list, pending stat labs, and bed coverage check.";
  const modalOverlay = document.getElementById("agentModalOverlay");
  modalOverlay?.classList.add("active");
  const promptInput = document.getElementById("agentPromptInput");
  if (promptInput) promptInput.value = prompt;
  runAgentLoop(prompt);
};

window.exportSoapPdf = function(noteId) {
  window.print();
};

// --------------------------------------------------------------------------
// Core Responsibility 4: Workflow & Task Coordination
// --------------------------------------------------------------------------
function renderTaskCoordination() {
  renderInternalTasks();
  renderIntakeQueue();
}

function switchCoordinationSubTab(tabName) {
  const tabs = document.querySelectorAll(".sub-tab-btn[data-tab]");
  tabs.forEach(btn => {
    if (btn.getAttribute("data-tab") === tabName) {
      btn.classList.add("active");
    } else if (["tasks", "intake", "priorauth"].includes(btn.getAttribute("data-tab"))) {
      btn.classList.remove("active");
    }
  });

  const tasksTab = document.getElementById("coordTabTasks");
  const intakeTab = document.getElementById("coordTabIntake");
  const priorAuthTab = document.getElementById("coordTabPriorAuth");

  if (tasksTab) tasksTab.style.display = tabName === 'tasks' ? 'block' : 'none';
  if (intakeTab) intakeTab.style.display = tabName === 'intake' ? 'block' : 'none';
  if (priorAuthTab) priorAuthTab.style.display = tabName === 'priorauth' ? 'block' : 'none';
}

function renderInternalTasks() {
  const tbody = document.getElementById("internalTasksTableBody");
  const countBadge = document.getElementById("internalTasksCountBadge");
  if (!tbody) return;

  if (countBadge) {
    const pendingCount = AppData.internalTasks.filter(t => t.status !== 'Completed').length;
    countBadge.textContent = `${pendingCount} Active Tasks`;
  }

  tbody.innerHTML = AppData.internalTasks.map(task => `
    <tr class="${task.urgency === 'Urgent' || task.urgency === 'High' ? 'urgent-task' : ''}">
      <td>
        <strong>${task.id}</strong>
        <div style="font-size:0.75rem; color:var(--teal-light);">${task.taskType}</div>
      </td>
      <td>
        <div style="font-weight:600; color:var(--text-main);">${task.patientName}</div>
        <div style="font-size:0.72rem; color:var(--text-muted);">${task.mrn}</div>
      </td>
      <td>
        <div style="font-size:0.82rem; font-weight:600;">${task.requestedItem}</div>
        <div style="font-size:0.72rem; color:var(--text-muted);">${task.timestamp}</div>
      </td>
      <td>
        <strong>${task.assignedTo}</strong>
        <div style="font-size:0.72rem; color:var(--text-muted);">${task.role}</div>
      </td>
      <td>
        <span class="badge badge-ai" style="font-size:0.68rem;">${task.department}</span>
      </td>
      <td>
        <span class="badge ${task.urgency === 'Urgent' || task.urgency === 'High' ? 'badge-urgent' : 'badge-scheduled'}">
          ${task.urgency}
        </span>
      </td>
      <td>
        <div style="font-size:0.75rem; font-weight:700; color:var(--teal-light);">${task.status}</div>
        <div style="font-size:0.72rem; color:var(--text-secondary); max-width:200px; margin-top:0.2rem;">${task.aiRecommendation}</div>
      </td>
      <td>
        ${task.status === 'Completed' ? `
          <span style="font-size:0.75rem; color:var(--emerald-success); font-weight:700;">✓ Completed</span>
        ` : `
          <button class="btn btn-sm btn-primary" onclick="completeTask('${task.id}')">
            Approve & Route
          </button>
        `}
      </td>
    </tr>
  `).join("");
}

function renderIntakeQueue() {
  const container = document.getElementById("intakeQueueItemsContainer");
  const bannerContainer = document.getElementById("criticalTriageBannerContainer");
  if (!container) return;

  // Check for critical flagged alerts
  const criticalAlert = AppData.intakeQueue.find(i => i.urgencyLevel.includes("CRITICAL") && i.flagged);

  if (bannerContainer) {
    if (criticalAlert) {
      bannerContainer.innerHTML = `
        <div class="triage-alert-banner">
          <div style="display:flex; align-items:center; gap:1rem;">
            <div style="width:48px; height:48px; border-radius:50%; background:var(--rose-danger); display:flex; align-items:center; justify-content:center; font-size:1.5rem; flex-shrink:0;">
              🚨
            </div>
            <div>
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <strong style="font-size:1.05rem; color:#fff;">CRITICAL INTAKE ALERT: ${criticalAlert.patientName}</strong>
                <span class="badge badge-urgent" style="background:#fff; color:var(--rose-danger); font-weight:800;">IMMEDIATE NURSE ESCALATION</span>
              </div>
              <p style="font-size:0.85rem; color:#fecdd3; margin:0.3rem 0;">
                "${criticalAlert.messageSnippet}"
              </p>
              <span style="font-size:0.75rem; color:rgba(255,255,255,0.8);">${criticalAlert.actionTaken}</span>
            </div>
          </div>
          <button class="btn btn-danger" style="flex-shrink:0; font-weight:700;" onclick="acknowledgeUrgentAlert('${criticalAlert.id}')">
            ✓ Acknowledge & Dispatch Nurse
          </button>
        </div>
      `;
    } else {
      bannerContainer.innerHTML = "";
    }
  }

  container.innerHTML = AppData.intakeQueue.map(item => {
    let cardClass = "routine";
    let pillClass = "routine";
    if (item.urgencyLevel.includes("CRITICAL")) {
      cardClass = "critical";
      pillClass = "critical";
    } else if (item.urgencyLevel.includes("MODERATE")) {
      cardClass = "moderate";
      pillClass = "moderate";
    }

    return `
      <div class="intake-item-card ${cardClass}">
        <div style="flex:1;">
          <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.3rem;">
            <strong style="font-size:0.95rem; color:var(--text-main);">${item.patientName}</strong>
            <span class="badge badge-ai" style="font-size:0.68rem;">${item.channel}</span>
            <span class="triage-pill ${pillClass}">Triage Score: ${item.triageScore} (${item.urgencyLevel})</span>
            <span style="font-size:0.72rem; color:var(--text-muted);">${item.timestamp}</span>
          </div>
          <div style="font-size:0.83rem; color:var(--text-secondary); margin-bottom:0.4rem;">
            "${item.messageSnippet}"
          </div>
          <div style="font-size:0.75rem; color:var(--teal-light);">
            Assigned: <strong>${item.assignedStaff}</strong> • Action: ${item.actionTaken}
          </div>
        </div>

        <div style="flex-shrink:0; text-align:right;">
          <span class="badge ${item.flagged ? 'badge-urgent' : 'badge-confirmed'}" style="margin-bottom:0.4rem; display:inline-block;">
            ${item.status}
          </span>
          <div>
            ${item.flagged ? `
              <button class="btn btn-sm btn-danger" onclick="acknowledgeUrgentAlert('${item.id}')">Acknowledge</button>
            ` : `
              <button class="btn btn-sm btn-secondary" onclick="showToast('Intake Message', 'Message archived in patient communication history.', 'info')">View Thread</button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

window.completeTask = function(taskId) {
  const task = AppData.internalTasks.find(t => t.id === taskId);
  if (task) {
    task.status = "Completed";
    renderInternalTasks();
    showToast("Task Resolved", `Task ${taskId} (${task.taskType}) approved and routed successfully.`, "success");
  }
};

window.autoRoutePendingTasks = function() {
  const prompt = "Intelligently route pending prescription refill to Dr. Finch and flag incoming patient chest tightness message with immediate red triage alert.";
  const modalOverlay = document.getElementById("agentModalOverlay");
  modalOverlay?.classList.add("active");
  const promptInput = document.getElementById("agentPromptInput");
  if (promptInput) promptInput.value = prompt;
  runAgentLoop(prompt);
};

window.simulateUrgentIntakeMessage = function() {
  const newAlert = {
    id: "INT-" + Math.floor(800 + Math.random() * 200),
    patientName: "Marcus Brody",
    channel: "SMS Inbound (Urgent)",
    messageSnippet: "I am feeling heavy chest tightness and dizzy after taking my new blood pressure pill 20 mins ago.",
    timestamp: "Just now",
    urgencyLevel: "CRITICAL RED",
    triageScore: 98,
    flagged: true,
    assignedStaff: "ER Triage Nurse (Immediate Escalation)",
    actionTaken: "FLAGGED IMMEDIATELY: Inbound automated priority alert fired to triage nurse workstation and physician pager.",
    status: "Active Alert"
  };

  AppData.intakeQueue.unshift(newAlert);
  switchCoordinationSubTab("intake");
  renderIntakeQueue();
  showToast("EMERGENCY INTAKE ALERT", "Marcus Brody reported acute chest tightness and dizziness. Triage nurse paged immediately!", "urgent");
};

window.acknowledgeUrgentAlert = function(intakeId) {
  const alert = AppData.intakeQueue.find(i => i.id === intakeId);
  if (alert) {
    alert.flagged = false;
    alert.status = "Nurse Dispatched";
    alert.actionTaken = "Charge Nurse Kevin Lee acknowledged and initiated urgent phone triage protocol.";
    renderIntakeQueue();
    showToast("Urgent Alert Acknowledged", "Charge Nurse Kevin Lee assigned to Marcus Brody for immediate telephone triage.", "success");
  }
};

// --------------------------------------------------------------------------
// Key Benefits Impact Calculator
// --------------------------------------------------------------------------
function updateBenefitCalculator() {
  const docInput = document.getElementById("calcRangeDoctors");
  const patInput = document.getElementById("calcRangePatients");
  const minInput = document.getElementById("calcRangeMinutes");

  if (!docInput || !patInput || !minInput) return;

  const doctors = parseInt(docInput.value) || 6;
  const patientsPerDay = parseInt(patInput.value) || 140;
  const chartingMin = parseInt(minInput.value) || 18;

  // Update label displays
  const lblDoc = document.getElementById("calcValDoctors");
  const lblPat = document.getElementById("calcValPatients");
  const lblMin = document.getElementById("calcValMinutes");

  if (lblDoc) lblDoc.textContent = `${doctors} Physicians`;
  if (lblPat) lblPat.textContent = `${patientsPerDay} Patients/Day`;
  if (lblMin) lblMin.textContent = `${chartingMin} min / patient`;

  // Calculated values:
  // Each doctor sees ~ (patientsPerDay / doctors)
  // Agent automates 87.4% of charting time
  const dailyHoursSavedTotal = (patientsPerDay * (chartingMin * 0.874)) / 60;
  const weeklyHoursSaved = Math.round(dailyHoursSavedTotal * 5);
  const annualStaffCostProtected = Math.round(weeklyHoursSaved * 52 * 30); // $30/hr blended clinical admin rate
  const burnoutDropPercent = Math.min(80, Math.round(45 + (chartingMin * 0.95)));

  const resHours = document.getElementById("calcResHoursSaved");
  const resCost = document.getElementById("calcResAnnualCost");
  const resBurnout = document.getElementById("calcResBurnoutDrop");
  const resNoShow = document.getElementById("calcResNoShowDrop");

  if (resHours) resHours.textContent = `${weeklyHoursSaved} hrs`;
  if (resCost) resCost.textContent = `$${annualStaffCostProtected.toLocaleString()}`;
  if (resBurnout) resBurnout.textContent = `-${burnoutDropPercent}%`;
  if (resNoShow) resNoShow.textContent = `-74%`;
}

// --------------------------------------------------------------------------
// Core Module: Staff Directory & Roster Management
// --------------------------------------------------------------------------
function renderStaff() {
  const container = document.getElementById("staffDirectoryContainer");
  const deptFilter = document.getElementById("filterStaffDept")?.value || "ALL";
  const statusFilter = document.getElementById("filterStaffStatus")?.value || "ALL";

  let list = AppData.staffRoster || [];
  if (deptFilter !== "ALL") {
    list = list.filter(s => s.department === deptFilter);
  }
  if (statusFilter !== "ALL") {
    list = list.filter(s => s.status === statusFilter);
  }

  // Update KPI counters
  const totalStaffEl = document.getElementById("statTotalStaff");
  if (totalStaffEl) totalStaffEl.textContent = `${AppData.staffRoster.length} Members`;

  const onDutyCount = AppData.staffRoster.filter(s => s.status === "On Duty").length;
  const onDutyEl = document.getElementById("statOnDutyStaff");
  if (onDutyEl) onDutyEl.textContent = `${onDutyCount} Active`;

  const otCount = AppData.staffRoster.filter(s => s.overtimeAlert).length;
  const otEl = document.getElementById("statOvertimeStaff");
  if (otEl) otEl.textContent = `${otCount} Alert`;

  const badgeStaff = document.getElementById("navBadgeStaff");
  if (badgeStaff) badgeStaff.textContent = otCount > 0 ? "OT Alert" : `${onDutyCount} On Duty`;

  if (container) {
    if (list.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-muted); background: var(--bg-surface); border-radius: var(--radius-lg);">
          No hospital staff members match the selected department and shift filters.
        </div>
      `;
    } else {
      const days = ["M", "T", "W", "T", "F", "S", "S"];
      container.innerHTML = list.map(staff => {
        const initials = staff.name.split(" ").map(n => n.replace(/[^a-zA-Z]/g, "")[0]).filter(Boolean).slice(0, 2).join("");
        
        let statusBadge = `<span class="badge badge-confirmed">On Duty</span>`;
        if (staff.status === "On-Call") statusBadge = `<span class="badge badge-scheduled">On-Call</span>`;
        if (staff.status === "Off") statusBadge = `<span class="badge" style="background:var(--bg-elevated); color:var(--text-muted);">Off Shift</span>`;
        if (staff.overtimeAlert) statusBadge = `<span class="badge badge-urgent">42h OT Risk</span>`;

        const shiftMini = staff.shifts.map((sh, idx) => {
          let cls = "";
          if (sh.includes("Day")) cls = "active-day";
          else if (sh.includes("Night")) cls = "active-night";
          else if (sh.includes("On-Call")) cls = "active-oncall";
          return `<div class="staff-shift-mini-day ${cls}" title="${days[idx]}: ${sh}">${days[idx]}</div>`;
        }).join("");

        return `
          <div class="staff-card">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <div class="staff-avatar-box">${initials}</div>
                <div>
                  <h4 style="font-size:0.95rem; font-weight:700; color:var(--text-main); line-height:1.2;">${staff.name}</h4>
                  <span style="font-size:0.75rem; color:var(--teal-light); font-weight:500;">${staff.role}</span>
                </div>
              </div>
              ${statusBadge}
            </div>

            <div style="font-size:0.72rem; color:var(--text-muted); background:var(--bg-base); padding:0.4rem 0.65rem; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
              <span>Credentials: <strong>${staff.credentials || 'Certified Practitioner'}</strong></span>
            </div>

            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-secondary);">
              <span>Dept: <strong style="color:var(--text-main);">${staff.department}</strong></span>
              <span>Zone: <strong style="color:var(--text-main);">${staff.assignedZone || 'Main Pavilion'}</strong></span>
            </div>

            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-secondary);">
              <span>Direct: <strong style="color:var(--teal-light);">${staff.phone || '+1 (555) 000-0000'}</strong></span>
              <span>Hours Wk: <strong style="color:${staff.overtimeAlert ? 'var(--rose-danger)' : 'var(--text-main)'};">${staff.hoursThisWeek} hrs</strong></span>
            </div>

            <div>
              <span style="font-size:0.68rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Weekly Schedule:</span>
              <div class="staff-shift-mini-bar">
                ${shiftMini}
              </div>
            </div>

            <div style="display:flex; gap:0.5rem; margin-top:auto; padding-top:0.65rem; border-top:1px solid var(--border-subtle);">
              <button class="btn btn-sm btn-secondary" onclick="quickMessageStaff('${staff.id}')" style="flex:1;">
                ✉️ Message
              </button>
              <button class="btn btn-sm ${staff.overtimeAlert ? 'btn-danger' : 'btn-primary'}" onclick="quickAdjustShift('${staff.id}')" style="flex:1;">
                ${staff.overtimeAlert ? '⚡ Fix Overtime' : 'Adjust Shift'}
              </button>
            </div>
          </div>
        `;
      }).join("");
    }
  }

  // Also render matrix
  renderStaffRoster();
}

function switchStaffSubTab(tab) {
  const dirTab = document.getElementById("staffSubTabDirectory");
  const rosTab = document.getElementById("staffSubTabRoster");
  const btnDir = document.getElementById("btnStaffTabDirectory");
  const btnRos = document.getElementById("btnStaffTabRoster");

  if (tab === "directory") {
    if (dirTab) dirTab.style.display = "block";
    if (rosTab) rosTab.style.display = "none";
    btnDir?.classList.add("active");
    btnRos?.classList.remove("active");
  } else {
    if (dirTab) dirTab.style.display = "none";
    if (rosTab) rosTab.style.display = "block";
    btnDir?.classList.remove("active");
    btnRos?.classList.add("active");
    renderStaffRoster();
  }
}

function quickMessageStaff(staffId) {
  const staff = AppData.staffRoster.find(s => s.id === staffId);
  if (!staff) return;
  showToast("Direct Staff Paging", `Paging ${staff.name} (${staff.role}) on secure department line ${staff.phone}.`, "info");
}

function quickAdjustShift(staffId) {
  const staff = AppData.staffRoster.find(s => s.id === staffId);
  if (!staff) return;
  if (staff.overtimeAlert) {
    autoBalanceRoster();
  } else {
    showToast("Shift Adjustment", `Shift adjustments open for ${staff.name}. Current schedule: ${staff.hoursThisWeek} hrs.`, "info");
  }
}

function renderStaffRoster() {
  const container = document.getElementById("staffRosterMatrix");
  if (!container) return;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  let html = `
    <div class="roster-grid">
      <div class="roster-header-cell">Staff Member</div>
      ${days.map(d => `<div class="roster-header-cell">${d}</div>`).join("")}
  `;

  AppData.staffRoster.forEach(staff => {
    html += `
      <div class="roster-row-header">
        <div style="font-size:0.85rem; color:var(--text-main);">${staff.name}</div>
        <div style="font-size:0.72rem; color:var(--text-muted);">${staff.role}</div>
        <div style="margin-top:0.3rem; display:flex; align-items:center; gap:0.4rem;">
          <span style="font-size:0.7rem; font-weight:700; color:${staff.overtimeAlert ? 'var(--rose-danger)' : 'var(--text-secondary)'};">
            ${staff.hoursThisWeek} hrs
          </span>
          ${staff.overtimeAlert ? '<span class="badge badge-urgent" style="font-size:0.6rem; padding:0 0.3rem;">OT Risk</span>' : ''}
        </div>
      </div>
    `;

    staff.shifts.forEach((shift) => {
      let shiftClass = "shift-off";
      if (shift.includes("Day")) shiftClass = "shift-day";
      else if (shift.includes("Night")) shiftClass = "shift-night";
      else if (shift.includes("On-Call")) shiftClass = "shift-oncall";

      html += `
        <div class="roster-slot">
          <div class="shift-pill ${shiftClass}">
            ${shift}
          </div>
        </div>
      `;
    });
  });

  html += `</div>`;
  container.innerHTML = html;
}

window.autoBalanceRoster = function() {
  showToast("AI Roster Optimizer", "Analyzing nurse workload, department minimum staffing rules, and overtime fatigue...", "ai");
  setTimeout(() => {
    window.HealthcareAgent.execute("Emergency Department night shift has an overtime warning on Nurse Rachel. Rebalance roster by assigning on-call Nurse Kevin.");
  }, 1000);
};

// --------------------------------------------------------------------------
// Module 5: Insurance & Admin Workflow
// --------------------------------------------------------------------------
function renderInsuranceClaims() {
  const tbody = document.getElementById("claimsTableBody");
  if (!tbody) return;

  tbody.innerHTML = AppData.claims.map(claim => `
    <tr>
      <td><strong>${claim.id}</strong></td>
      <td>
        <div style="font-weight:600; color:var(--text-main);">${claim.patientName}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${claim.payer}</div>
      </td>
      <td>
        <div style="font-size:0.82rem; font-weight:600;">CPT: ${claim.cpt}</div>
        <div style="font-size:0.75rem; color:var(--teal-light);">ICD: ${claim.icd}</div>
      </td>
      <td><strong>${claim.amount}</strong></td>
      <td>
        <span class="badge badge-${claim.status === 'Approved' ? 'confirmed' : (claim.status === 'Denied' ? 'urgent' : 'scheduled')}">
          ${claim.status}
        </span>
      </td>
      <td><span style="font-family:var(--font-mono); font-size:0.78rem;">${claim.priorAuth}</span></td>
      <td>
        ${claim.status === 'Denied' ? `
          <button class="btn btn-sm btn-ai" onclick="generateClaimAppeal('${claim.id}')">
            ⚡ AI Appeal
          </button>
        ` : `
          <button class="btn btn-sm btn-secondary" onclick="check270Eligibility('${claim.patientName}')">
            Verify 270/271
          </button>
        `}
      </td>
    </tr>
  `).join("");
}

window.check270Eligibility = function(patientName) {
  showToast("Querying EDI 270/271 Gateway", `Connecting to Clearinghouse for ${patientName}...`, "info");
  setTimeout(() => {
    showToast("Eligibility Verified", `${patientName}: In-Network, Deductible Met ($0 remaining), Specialist Copay $35.00.`, "success");
  }, 900);
};

window.generateClaimAppeal = function(claimId) {
  const modalOverlay = document.getElementById("agentModalOverlay");
  modalOverlay?.classList.add("active");
  const promptInput = document.getElementById("agentPromptInput");
  if (promptInput) {
    promptInput.value = `Scrub pending claims for ICD-10 coding mismatches and draft AI appeal justification for denied MRI claim ${claimId}.`;
    runAgentLoop(promptInput.value);
  }
};

// --------------------------------------------------------------------------
// Module 6: Automated Reminders
// --------------------------------------------------------------------------
function renderReminders() {
  const tbody = document.getElementById("remindersTableBody");
  if (!tbody) return;

  tbody.innerHTML = AppData.reminders.map(rem => `
    <tr>
      <td><strong>${rem.id}</strong></td>
      <td><strong>${rem.patient}</strong></td>
      <td>${rem.type}</td>
      <td>${rem.time}</td>
      <td><span class="badge badge-ai">${rem.channel}</span></td>
      <td>
        <span class="badge badge-${rem.status.includes('Delivered') ? 'confirmed' : 'scheduled'}">
          ${rem.status}
        </span>
      </td>
      <td><span style="color:var(--teal-light); font-size:0.8rem; font-weight:600;">${rem.action}</span></td>
    </tr>
  `).join("");
}

window.triggerBatchReminders = function() {
  showToast("Dispatching Reminders", "Sending automated SMS & WhatsApp reminders to 4 queued patients...", "ai");
  setTimeout(() => {
    AppData.reminders.forEach(r => {
      r.status = "Delivered & Read";
      r.action = "Patient Confirmed";
    });
    renderReminders();
    showToast("Batch Delivered", "4/4 reminders successfully acknowledged by patients.", "success");
  }, 1200);
};

// --------------------------------------------------------------------------
// Module 7: Email/SMS Workflows
// --------------------------------------------------------------------------
function renderWorkflows() {
  const container = document.getElementById("workflowsContainer");
  if (!container) return;

  container.innerHTML = AppData.workflows.map(wf => `
    <div class="card" style="margin-bottom:1.5rem;">
      <div class="card-header">
        <div>
          <span class="badge badge-ai" style="margin-bottom:0.4rem;">Autonomous Pipeline</span>
          <h3 class="card-title">${wf.name}</h3>
        </div>
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <span style="font-size:0.8rem; color:var(--text-secondary);">Active Runs: <strong>${wf.activeInstances}</strong></span>
          <span class="badge badge-confirmed">Success Rate: ${wf.successRate}</span>
          <button class="btn btn-sm btn-secondary" onclick="simulateWorkflow('${wf.name}')">Simulate Flow</button>
        </div>
      </div>

      <div class="workflow-pipeline">
        ${wf.steps.map((st, i) => `
          <div class="wf-step-node">
            <div style="font-size:0.68rem; font-weight:700; color:var(--teal-light); text-transform:uppercase; margin-bottom:0.25rem;">
              Step ${st.step} • ${st.delay}
            </div>
            <div style="font-weight:600; font-size:0.85rem; color:var(--text-main); margin-bottom:0.2rem;">
              ${st.label}
            </div>
            <div style="font-size:0.72rem; color:var(--text-muted);">Trigger: ${st.trigger}</div>
          </div>
          ${i < wf.steps.length - 1 ? '<div class="wf-arrow">→</div>' : ''}
        `).join("")}
      </div>
    </div>
  `).join("");
}

window.simulateWorkflow = function(name) {
  showToast("Workflow Triggered", `Simulating real-time pass-through of "${name}"...`, "ai");
  setTimeout(() => {
    showToast("Workflow Passed", `All 5 automated steps executed with 0 drop-offs.`, "success");
  }, 1400);
};

// --------------------------------------------------------------------------
// Module 8: Reporting Dashboard & Charts
// --------------------------------------------------------------------------
function renderCharts() {
  renderAppointmentTrendChart();
  renderClaimsDistributionChart();
}

function renderAppointmentTrendChart() {
  const container = document.getElementById("appointmentTrendChartContainer");
  if (!container) return;

  // Clean SVG Line/Bar Chart with zero dependencies
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const scheduledData = [118, 142, 138, 165, 150, 92, 45];
  const completedData = [112, 135, 131, 158, 144, 88, 42];

  const maxVal = 180;
  const width = 640;
  const height = 220;
  const padding = 35;

  let barsHtml = "";
  const stepX = (width - padding * 2) / (days.length - 1);

  let pathPoints = [];

  days.forEach((day, i) => {
    const x = padding + i * stepX;
    const ySched = height - padding - (scheduledData[i] / maxVal) * (height - padding * 2);
    const yComp = height - padding - (completedData[i] / maxVal) * (height - padding * 2);

    barsHtml += `
      <rect x="${x - 14}" y="${ySched}" width="12" height="${height - padding - ySched}" fill="rgba(6, 182, 212, 0.4)" rx="3"/>
      <rect x="${x + 2}" y="${yComp}" width="12" height="${height - padding - yComp}" fill="rgba(16, 185, 129, 0.85)" rx="3"/>
      <text x="${x}" y="${height - 12}" fill="#94a3b8" font-size="11" text-anchor="middle" font-family="Inter">${day}</text>
      <text x="${x}" y="${ySched - 6}" fill="#f1f5f9" font-size="10" text-anchor="middle" font-weight="600">${scheduledData[i]}</text>
    `;

    pathPoints.push(`${x},${yComp}`);
  });

  container.innerHTML = `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow:visible;">
      <!-- Grid lines -->
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      <line x1="${padding}" y1="${(height - padding)/2}" x2="${width - padding}" y2="${(height - padding)/2}" stroke="rgba(255,255,255,0.05)" stroke-width="1" stroke-dasharray="4"/>
      
      <!-- Bars & Labels -->
      ${barsHtml}
    </svg>
    <div style="display:flex; justify-content:center; gap:1.5rem; margin-top:0.75rem; font-size:0.75rem;">
      <div style="display:flex; align-items:center; gap:0.4rem;">
        <span style="width:10px; height:10px; background:rgba(6, 182, 212, 0.6); border-radius:2px;"></span>
        <span>Scheduled Appointments</span>
      </div>
      <div style="display:flex; align-items:center; gap:0.4rem;">
        <span style="width:10px; height:10px; background:#10b981; border-radius:2px;"></span>
        <span>Completed Visits (94.2% Show-up Rate)</span>
      </div>
    </div>
  `;
}

function renderClaimsDistributionChart() {
  const container = document.getElementById("claimsPieChartContainer");
  if (!container) return;

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:0.85rem; padding:0.5rem 0;">
      <div>
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.25rem;">
          <span style="font-weight:600; color:#34d399;">Approved Claims</span>
          <span>91.8% ($138,400)</span>
        </div>
        <div style="height:8px; background:rgba(255,255,255,0.08); border-radius:4px; overflow:hidden;">
          <div style="width:91.8%; height:100%; background:#10b981; border-radius:4px;"></div>
        </div>
      </div>

      <div>
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.25rem;">
          <span style="font-weight:600; color:#fbbf24;">Pended / In Review</span>
          <span>5.4% ($8,150)</span>
        </div>
        <div style="height:8px; background:rgba(255,255,255,0.08); border-radius:4px; overflow:hidden;">
          <div style="width:5.4%; height:100%; background:#f59e0b; border-radius:4px;"></div>
        </div>
      </div>

      <div>
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.25rem;">
          <span style="font-weight:600; color:#f87171;">Denied (Appealed via AI)</span>
          <span>2.8% ($4,200)</span>
        </div>
        <div style="height:8px; background:rgba(255,255,255,0.08); border-radius:4px; overflow:hidden;">
          <div style="width:2.8%; height:100%; background:#ef4444; border-radius:4px;"></div>
        </div>
      </div>

      <div style="margin-top:1rem; padding:0.75rem; background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.2); border-radius:var(--radius-md); font-size:0.75rem;">
        <strong style="color:#c084fc;">AI Automation Efficiency:</strong>
        <div style="color:var(--text-secondary); margin-top:0.2rem;">Average prior auth adjudication time reduced from 48h to 2.4 minutes.</div>
      </div>
    </div>
  `;
}

// --------------------------------------------------------------------------
// Module 9: AI Audit Log Table
// --------------------------------------------------------------------------
function renderAuditLogs() {
  const tbody = document.getElementById("auditLogTableBody");
  if (!tbody) return;

  tbody.innerHTML = AppData.auditLogs.map(log => `
    <tr>
      <td><strong>${log.id}</strong></td>
      <td style="color:var(--text-muted);">${log.timestamp}</td>
      <td><strong style="color:var(--text-main);">${log.agentAction}</strong></td>
      <td>${log.userTarget}</td>
      <td><span class="badge badge-ai">${log.rbacPolicy}</span></td>
      <td><div style="font-size:0.78rem; color:var(--text-secondary); max-width:320px;">${log.result}</div></td>
      <td><span class="badge badge-confirmed">${log.status}</span></td>
    </tr>
  `).join("");
}

// --------------------------------------------------------------------------
// New Appointment Modal Form Handler
// --------------------------------------------------------------------------
function setupEventListeners() {
  const btnNewApt = document.getElementById("btnNewAppointment");
  const modalApt = document.getElementById("newAppointmentModal");
  const closeBtn = document.getElementById("btnCloseAptModal");
  const formApt = document.getElementById("newAppointmentForm");

  btnNewApt?.addEventListener("click", () => modalApt?.classList.add("active"));
  closeBtn?.addEventListener("click", () => modalApt?.classList.remove("active"));

  modalApt?.addEventListener("click", (e) => {
    if (e.target === modalApt) modalApt.classList.remove("active");
  });

  formApt?.addEventListener("submit", (e) => {
    e.preventDefault();
    const patientName = document.getElementById("inputAptPatient")?.value;
    const doctorId = document.getElementById("inputAptDoctor")?.value;
    const time = document.getElementById("inputAptTime")?.value;
    const date = document.getElementById("inputAptDate")?.value;
    const notes = document.getElementById("inputAptNotes")?.value;

    const doctor = AppData.doctors.find(d => d.id === doctorId) || AppData.doctors[0];

    const newApt = {
      id: "APT-" + Math.floor(1000 + Math.random() * 9000),
      patientId: "PAT-NEW",
      patientName: patientName,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      time: time,
      date: date,
      duration: "30 min",
      type: "Clinical Consultation",
      status: "Scheduled",
      room: doctor.room,
      triageScore: "Routine",
      notes: notes || "Direct staff entry"
    };

    AppData.appointments.unshift(newApt);
    renderAppointments();
    modalApt?.classList.remove("active");
    showToast("Appointment Booked", `Scheduled ${patientName} with ${doctor.name} at ${time}. Slot verified.`, "success");
  });

  // Filter triggers for appointments
  document.getElementById("filterDoctorSelect")?.addEventListener("change", renderAppointments);
  document.getElementById("filterStatusSelect")?.addEventListener("change", renderAppointments);
}

// --------------------------------------------------------------------------
// Product Scope & Clinical Safety Guardrails Handlers
// --------------------------------------------------------------------------
function openScopeModal() {
  const modal = document.getElementById("safetyScopeModal");
  if (modal) modal.classList.add("active");
}

function simulateSafetyGuardrailTest() {
  // Close the scope modal if open
  document.getElementById("safetyScopeModal")?.classList.remove("active");
  
  // Open the agent modal to watch the execution live
  const modalOverlay = document.getElementById("agentModalOverlay");
  if (modalOverlay) modalOverlay.classList.add("active");

  const prohibitedPrompt = "Diagnose patient acute chest pain, prescribe 50mg Metoprolol dose increase, and approve prescription refill without doctor review.";
  
  const promptInput = document.getElementById("agentPromptInput") || document.querySelector(".agent-prompt-input");
  if (promptInput) promptInput.value = prohibitedPrompt;

  showToast("Clinical Guardrail Intercept Test", "Testing safety monitor. Autonomous diagnosis and prescribing are strictly prohibited.", "info");
  
  runAgentLoop(prohibitedPrompt);
}

window.openScopeModal = openScopeModal;
window.simulateSafetyGuardrailTest = simulateSafetyGuardrailTest;

// --------------------------------------------------------------------------
// Core Module: Patients Directory & Electronic Health Records
// --------------------------------------------------------------------------
function renderPatients() {
  const container = document.getElementById("patientsContainer");
  if (!container) return;

  const searchVal = document.getElementById("patientSearchInput")?.value.toLowerCase().trim() || "";
  const statusFilter = document.getElementById("filterPatientStatus")?.value || "ALL";

  let list = AppData.patients || [];
  if (statusFilter !== "ALL") {
    list = list.filter(p => p.status === statusFilter);
  }
  if (searchVal) {
    list = list.filter(p => 
      p.name.toLowerCase().includes(searchVal) ||
      p.mrn.toLowerCase().includes(searchVal) ||
      p.phone.includes(searchVal) ||
      p.insurance.toLowerCase().includes(searchVal) ||
      p.activeCondition.toLowerCase().includes(searchVal)
    );
  }

  // Update badges
  const badge = document.getElementById("navBadgePatients");
  if (badge) badge.textContent = `${AppData.patients.length} Active`;
  const statTotal = document.getElementById("statTotalPatients");
  if (statTotal) statTotal.textContent = `${1240 + AppData.patients.length}`;
  const statAdmitted = document.getElementById("statAdmittedPatients");
  if (statAdmitted) statAdmitted.textContent = `${AppData.patients.filter(p => p.status === "Admitted").length} Patients`;

  if (list.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-muted); background: var(--bg-surface); border-radius: var(--radius-lg);">
        No patients match your search criteria. Try a different query or register a new patient chart.
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(pat => {
    let statusClass = "badge-confirmed";
    if (pat.status === "Admitted") statusClass = "badge-ai";
    if (pat.status === "In Treatment") statusClass = "badge-scheduled";
    if (pat.status.includes("ER") || pat.status.includes("Stat")) statusClass = "badge-urgent";

    const initials = pat.name.split(" ").map(n => n[0]).join("");

    return `
      <div class="patient-card">
        <div class="patient-card-header">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div class="patient-avatar-box">${initials}</div>
            <div>
              <div class="patient-name-title">${escapeHtml(pat.name)}</div>
              <span class="patient-mrn-badge">${escapeHtml(pat.mrn)}</span>
            </div>
          </div>
          <span class="badge ${statusClass}">${escapeHtml(pat.status)}</span>
        </div>

        <div class="patient-vitals-bar">
          <div class="vital-item">
            <span class="vital-val">${escapeHtml(pat.vitals?.bp || "120/80")}</span>
            <span class="vital-label">BP (mmHg)</span>
          </div>
          <div class="vital-item">
            <span class="vital-val">${escapeHtml(pat.vitals?.hr || 72)}</span>
            <span class="vital-label">Pulse (bpm)</span>
          </div>
          <div class="vital-item">
            <span class="vital-val">${escapeHtml(pat.vitals?.o2 || "99%")}</span>
            <span class="vital-label">SpO2</span>
          </div>
          <div class="vital-item">
            <span class="vital-val" style="color:var(--rose-danger);">${escapeHtml(pat.bloodType || "O+")}</span>
            <span class="vital-label">Blood</span>
          </div>
        </div>

        <div class="patient-info-list">
          <div class="patient-info-row">
            <span>Age / Gender:</span>
            <strong>${escapeHtml(pat.age || 40)}y, ${escapeHtml(pat.gender)}</strong>
          </div>
          <div class="patient-info-row">
            <span>Primary Doctor:</span>
            <strong style="color:var(--teal-light);">${escapeHtml(pat.assignedDoctor)}</strong>
          </div>
          <div class="patient-info-row">
            <span>Location / Room:</span>
            <strong>${escapeHtml(pat.room || "Outpatient Desk")}</strong>
          </div>
          <div class="patient-info-row">
            <span>Payer & Copay:</span>
            <span>${escapeHtml(pat.insurance)} (${escapeHtml(pat.copay || "$20")})</span>
          </div>
          <div style="margin-top:0.35rem; padding:0.4rem 0.6rem; background:var(--bg-card); border-radius:var(--radius-sm); border-left:2px solid var(--teal-primary);">
            <span style="font-size:0.7rem; color:var(--text-muted); display:block;">Active Clinical Note:</span>
            <span style="color:var(--text-main); font-size:0.75rem; line-height:1.35;">${escapeHtml(pat.activeCondition)}</span>
          </div>
        </div>

        <div class="patient-card-footer">
          <button class="btn btn-sm btn-secondary" onclick="openEhrChart('${escapeHtml(pat.id)}')" style="flex:1;" title="View electronic health record">
            📂 Chart
          </button>
          <button class="btn btn-sm btn-primary" onclick="quickBookPatient('${escapeHtml(pat.name).replace(/'/g, "\\'")}', '${escapeHtml(pat.doctorId)}')" style="flex:1;" title="Book consultation">
            📅 Book
          </button>
          <button class="btn btn-sm btn-secondary" onclick="quickMessagePatient('${escapeHtml(pat.name).replace(/'/g, "\\'")}')" style="padding:0.35rem 0.6rem;" title="Send SMS message">
            💬
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function filterPatientsList() {
  renderPatients();
}

function openNewPatientModal() {
  const modal = document.getElementById("newPatientModal");
  if (modal) modal.classList.add("active");
}

function handleNewPatientSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("newPatName")?.value;
  const dob = document.getElementById("newPatDob")?.value;
  const gender = document.getElementById("newPatGender")?.value;
  const blood = document.getElementById("newPatBlood")?.value;
  const phone = document.getElementById("newPatPhone")?.value;
  const email = document.getElementById("newPatEmail")?.value;
  const insurance = document.getElementById("newPatInsurance")?.value;
  const doctorId = document.getElementById("newPatDoctor")?.value;
  const condition = document.getElementById("newPatCondition")?.value;

  const doctor = AppData.doctors.find(d => d.id === doctorId) || AppData.doctors[0];
  const newMrn = "MRN-" + Math.floor(90220 + Math.random() * 800);

  const newPatient = {
    id: "PAT-" + Math.floor(89210 + Math.random() * 800),
    name: name,
    dob: dob,
    age: 2026 - parseInt((dob || "1990").split("-")[0]),
    gender: gender,
    phone: phone,
    email: email,
    address: "Registered at Metro Pavilion Intake",
    insurance: insurance || "Self-Pay / In Review",
    policyId: "PEND-" + Math.floor(10000 + Math.random() * 90000),
    copay: "$25.00",
    allergies: ["NKDA (None Known)"],
    mrn: newMrn,
    bloodType: blood,
    assignedDoctor: doctor.name,
    doctorId: doctor.id,
    room: "Waiting Area (Intake Processed)",
    status: "Outpatient",
    lastVisit: "2026-09-30 (Today)",
    activeCondition: condition || "Routine registration intake",
    vitals: { bp: "120/80", hr: 72, o2: "99%", temp: "98.6°F" }
  };

  AppData.patients.unshift(newPatient);
  document.getElementById("newPatientModal")?.classList.remove("active");
  document.getElementById("newPatientForm")?.reset();
  renderPatients();
  showToast("Patient Chart Registered", `Successfully registered ${name} (${newMrn}) with ${doctor.name}.`, "success");
}

function openEhrChart(patId) {
  const pat = AppData.patients.find(p => p.id === patId) || AppData.patients[0];
  navigateToModule("medicalrecords");
  showToast("EHR Chart Accessed", `Viewing digitized health record for ${pat.name} (${pat.mrn}).`, "info");
}

function quickBookPatient(patName, doctorId) {
  const modalApt = document.getElementById("newAppointmentModal");
  if (modalApt) {
    const patInput = document.getElementById("inputAptPatient");
    if (patInput) patInput.value = patName;
    const docSelect = document.getElementById("inputAptDoctor");
    if (docSelect && doctorId) docSelect.value = doctorId;
    modalApt.classList.add("active");
  }
}

function quickMessagePatient(patName) {
  navigateToModule("communication");
  showToast("Patient Messaging", `Opened chat channel for ${patName}.`, "info");
}

// --------------------------------------------------------------------------
// Core Module: Doctors & Providers Directory
// --------------------------------------------------------------------------
function renderDoctors() {
  const container = document.getElementById("doctorsContainer");
  if (!container) return;

  const specialtyFilter = document.getElementById("filterDoctorSpecialty")?.value || "ALL";
  const dutyFilter = document.getElementById("filterDoctorDuty")?.value || "ALL";

  let list = AppData.doctors || [];
  if (specialtyFilter !== "ALL") {
    list = list.filter(d => d.specialty === specialtyFilter);
  }
  if (dutyFilter === "ON") {
    list = list.filter(d => d.onDuty);
  } else if (dutyFilter === "OFF") {
    list = list.filter(d => !d.onDuty);
  }

  container.innerHTML = list.map(doc => {
    let dutyClass = doc.onDuty ? "badge-confirmed" : "badge-scheduled";
    if (doc.status === "In Procedure") dutyClass = "badge-ai";

    const loadPercent = Math.min(100, Math.round((doc.patientLoadToday / doc.maxDailyCapacity) * 100));

    return `
      <div class="doctor-card">
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:0.75rem;">
          <div style="display:flex; align-items:center; gap:0.85rem;">
            <div class="doctor-avatar-large">${doc.avatar}</div>
            <div>
              <div style="font-weight:700; font-size:1.05rem; color:var(--text-main);">${doc.name}</div>
              <div style="font-size:0.8rem; color:var(--teal-light); font-weight:600;">${doc.specialty}</div>
              <span style="font-size:0.72rem; color:var(--text-secondary);">${doc.subspecialty || doc.room}</span>
            </div>
          </div>
          <span class="badge ${dutyClass}">${doc.status}</span>
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; font-size:0.78rem; padding:0.45rem 0.75rem; background:var(--bg-card); border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
          <span style="color:var(--text-secondary);">Room: <strong>${doc.room}</strong></span>
          <span style="color:#fbbf24; font-weight:700;">★ ${doc.rating} <span style="font-weight:normal; font-size:0.72rem; color:var(--text-muted);">(${doc.reviewsCount} reviews)</span></span>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:0.25rem;">
            <span style="color:var(--text-secondary);">Daily Patient Load:</span>
            <strong>${doc.patientLoadToday} / ${doc.maxDailyCapacity} patients (${loadPercent}%)</strong>
          </div>
          <div class="doctor-load-track">
            <div class="doctor-load-fill" style="width:${loadPercent}%;"></div>
          </div>
        </div>

        <div style="font-size:0.77rem; color:var(--text-secondary); line-height:1.45;">
          <div style="margin-bottom:0.2rem;">⏱️ Next Open Slot: <strong style="color:var(--text-main);">${doc.nextFreeSlot}</strong></div>
          <div style="margin-bottom:0.2rem;">🏥 Hours: <span>${doc.officeHours}</span></div>
          <p style="margin-top:0.35rem; font-size:0.74rem; color:var(--text-muted);">${doc.bio}</p>
        </div>

        <div style="display:flex; gap:0.5rem; margin-top:auto; padding-top:0.75rem; border-top:1px solid var(--border-subtle);">
          <button class="btn btn-sm btn-primary" onclick="quickBookDoctor('${doc.id}')" style="flex:1;" title="Book an appointment with ${doc.name}">
            📅 Book Visit
          </button>
          <button class="btn btn-sm btn-secondary" onclick="quickRouteTaskToDoctor('${doc.name}')" style="flex:1;" title="Send clinical order / task">
            ⚡ Route Task
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function filterDoctorsList() {
  renderDoctors();
}

function quickBookDoctor(docId) {
  const modalApt = document.getElementById("newAppointmentModal");
  if (modalApt) {
    const docSelect = document.getElementById("inputAptDoctor");
    if (docSelect) docSelect.value = docId;
    modalApt.classList.add("active");
  }
}

function quickRouteTaskToDoctor(docName) {
  navigateToModule("coordination");
  showToast("Task Router", `Assigned task queue filtered for ${docName}.`, "info");
}

// --------------------------------------------------------------------------
// Core Module: Rooms & Bed Inventory Management
// --------------------------------------------------------------------------
function renderRooms() {
  const container = document.getElementById("roomsContainer");
  if (!container) return;

  const deptFilter = document.getElementById("filterRoomDepartment")?.value || "ALL";
  const statusFilter = document.getElementById("filterRoomStatus")?.value || "ALL";

  const allRooms = AppData.rooms || [];
  let filteredRooms = allRooms;

  if (deptFilter !== "ALL") {
    filteredRooms = filteredRooms.filter(r => r.department.toLowerCase().includes(deptFilter.toLowerCase()));
  }
  if (statusFilter !== "ALL") {
    filteredRooms = filteredRooms.filter(r => r.status.toLowerCase() === statusFilter.toLowerCase());
  }

  // Calculate real-time metrics across inventory
  const totalCount = allRooms.length;
  const occupiedRooms = allRooms.filter(r => r.status === "Occupied");
  const occupiedCount = occupiedRooms.length;
  const availableCount = allRooms.filter(r => r.status === "Available").length;
  const maintenanceCount = allRooms.filter(r => r.status === "Maintenance").length;
  const occPct = totalCount > 0 ? ((occupiedCount / totalCount) * 100).toFixed(1) : "0";

  // Update top metric card figures
  const statTotal = document.getElementById("statTotalRooms");
  if (statTotal) statTotal.textContent = `${totalCount} Units`;

  const statOcc = document.getElementById("statOccupiedRooms");
  if (statOcc) statOcc.textContent = `${occupiedCount} Members`;

  const statPct = document.getElementById("statOccupiedPct");
  if (statPct) statPct.textContent = `${occPct}%`;

  const statAvail = document.getElementById("statAvailableRooms");
  if (statAvail) statAvail.textContent = `${availableCount} Suites`;

  const statMaint = document.getElementById("statMaintenanceRooms");
  if (statMaint) statMaint.textContent = `${maintenanceCount} Unit${maintenanceCount !== 1 ? 's' : ''}`;

  // Update quick filter pill badge counts
  const pillAll = document.getElementById("countPillAll");
  if (pillAll) pillAll.textContent = totalCount;

  const pillOcc = document.getElementById("countPillOccupied");
  if (pillOcc) pillOcc.textContent = occupiedCount;

  const pillAvail = document.getElementById("countPillAvailable");
  if (pillAvail) pillAvail.textContent = availableCount;

  const pillMaint = document.getElementById("countPillMaintenance");
  if (pillMaint) pillMaint.textContent = maintenanceCount;

  // Update sidebar badge
  const navRooms = document.getElementById("navBadgeRooms");
  if (navRooms) navRooms.textContent = `${occupiedCount} / ${totalCount} Occ`;

  // Update roster count header
  const rosterCount = document.getElementById("rosterOccupantCount");
  if (rosterCount) rosterCount.textContent = `${occupiedCount} Members Occupied`;

  // Update section status badge
  const statusBadge = document.getElementById("gridFilterStatusBadge");
  if (statusBadge) {
    if (statusFilter === "ALL") {
      statusBadge.textContent = `Showing All ${filteredRooms.length} Units`;
    } else {
      statusBadge.textContent = `Showing ${filteredRooms.length} ${statusFilter} Units`;
    }
  }

  // Render Occupied Members Census Table
  const rosterTableBody = document.getElementById("occupiedMembersTableBody");
  if (rosterTableBody) {
    if (occupiedRooms.length === 0) {
      rosterTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:1.5rem; color:var(--text-muted);">
            No suites are currently occupied. All beds available for patient admission.
          </td>
        </tr>
      `;
    } else {
      rosterTableBody.innerHTML = occupiedRooms.map(room => {
        const initials = room.currentPatient.split(" ").map(n => n[0]).slice(0, 2).join("");
        const vitalsHtml = room.vitals ? `
          <div style="display:flex; flex-direction:column; gap:0.15rem; font-size:0.72rem;">
            <span>BP: <strong>${room.vitals.bp}</strong> • HR: <strong>${room.vitals.hr}</strong></span>
            <span style="color:var(--teal-light);">SpO2: <strong>${room.vitals.o2}</strong> • Temp: <strong>${room.vitals.temp}</strong></span>
          </div>
        ` : `<span style="color:var(--text-muted); font-size:0.75rem;">Standard Monitoring</span>`;

        return `
          <tr>
            <td>
              <div class="user-cell">
                <div class="avatar" style="background:linear-gradient(135deg, #10b981, #06b6d4); font-size:0.75rem;">${initials}</div>
                <div class="user-cell-meta">
                  <span class="user-cell-name">${room.currentPatient}</span>
                  <span style="font-size:0.7rem; color:var(--emerald-success); font-weight:600;">${room.mrn}</span>
                </div>
              </div>
            </td>
            <td>
              <strong style="color:var(--text-main); font-size:0.84rem;">${room.name}</strong>
              <div style="font-size:0.72rem; color:var(--text-muted);">${room.floor}</div>
            </td>
            <td>
              <span class="badge" style="background:rgba(6, 182, 212, 0.12); color:var(--teal-light); border:1px solid rgba(6, 182, 212, 0.3);">
                ${room.department}
              </span>
            </td>
            <td>
              <strong style="color:var(--text-main); font-size:0.82rem;">${room.assignedDoctor}</strong>
            </td>
            <td>
              <div style="display:flex; flex-direction:column; gap:0.15rem;">
                <span style="font-size:0.72rem; color:var(--text-secondary); font-weight:600;">${room.admittedAt || 'Active Admission'}</span>
                <span style="font-size:0.72rem; color:var(--text-muted); max-width:200px; white-space:normal;">${room.condition || 'Inpatient care'}</span>
              </div>
            </td>
            <td>
              ${vitalsHtml}
            </td>
            <td>
              <div style="display:flex; gap:0.4rem;">
                <button class="btn btn-sm btn-primary" onclick="viewPatientEhr('${room.patientId || ''}')" title="View Patient EHR Chart">
                  EHR Chart
                </button>
                <button class="btn btn-sm btn-secondary" onclick="viewRoomTelemetry('${room.id}')" title="Live Telemetry Feed">
                  📡 Telemetry
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join("");
    }
  }

  // Highlight/hide roster card based on current filter
  const rosterCard = document.getElementById("occupiedMembersRosterCard");
  if (rosterCard) {
    if (statusFilter === "Available" || statusFilter === "Maintenance") {
      rosterCard.style.display = "none";
    } else {
      rosterCard.style.display = "block";
    }
  }

  // Render Rooms Inventory Grid
  container.innerHTML = filteredRooms.map(room => {
    let badgeClass = "room-badge-available";
    let cardClass = "available";

    if (room.status === "Occupied") {
      badgeClass = "room-badge-occupied";
      cardClass = "occupied";
    } else if (room.status === "Reserved") {
      badgeClass = "room-badge-reserved";
      cardClass = "reserved";
    } else if (room.status === "Maintenance") {
      badgeClass = "room-badge-maintenance";
      cardClass = "maintenance";
    }

    const eqPills = (room.equipment || []).map(eq => `<span class="equipment-pill">${eq}</span>`).join("");
    const isOccupied = room.status === "Occupied";

    return `
      <div class="room-card ${cardClass}" id="room-card-${room.id}">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.5rem;">
          <div>
            <div style="font-weight:700; font-size:0.95rem; color:var(--text-main); display:flex; align-items:center; gap:0.4rem;">
              <span>${room.name}</span>
            </div>
            <div style="font-size:0.75rem; color:var(--teal-light); margin-top:0.15rem;">${room.department} • ${room.floor}</div>
          </div>
          <span class="${badgeClass}">${room.status}</span>
        </div>

        <div style="background:var(--bg-card); border-radius:var(--radius-md); padding:0.75rem 0.85rem; border:1px solid var(--border-subtle); font-size:0.76rem; display:flex; flex-direction:column; gap:0.4rem;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-secondary);">Attending Physician:</span>
            <strong style="color:var(--text-main); font-size:0.8rem;">${room.assignedDoctor}</strong>
          </div>
          
          <div style="display:flex; justify-content:space-between; align-items:center; padding:0.35rem 0; border-top:1px dashed var(--border-subtle); border-bottom:1px dashed var(--border-subtle);">
            <span style="color:var(--text-secondary);">Current Occupant:</span>
            <div style="text-align:right;">
              <strong style="color:${isOccupied ? 'var(--emerald-success)' : 'var(--text-muted)'}; font-size:0.82rem; display:block;">
                ${room.currentPatient}
              </strong>
              ${isOccupied && room.mrn ? `<span style="font-size:0.68rem; color:var(--text-muted);">${room.mrn} • ${room.admittedAt || 'Admitted'}</span>` : ''}
            </div>
          </div>

          ${isOccupied && room.vitals ? `
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.72rem;">
              <span style="color:var(--text-secondary);">Live Vitals:</span>
              <span style="color:var(--teal-light); font-weight:600;">
                BP ${room.vitals.bp} | HR ${room.vitals.hr} | O₂ ${room.vitals.o2}
              </span>
            </div>
          ` : ''}

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text-secondary);">Sanitization Log:</span>
            <span style="color:var(--text-main); font-size:0.72rem;">${room.sanitizationStatus}</span>
          </div>
        </div>

        <div>
          <span style="font-size:0.7rem; color:var(--text-muted); display:block; margin-bottom:0.35rem; font-weight:600; text-transform:uppercase; letter-spacing:0.04em;">Equipment Connected:</span>
          <div>${eqPills}</div>
        </div>

        <div style="display:flex; gap:0.5rem; margin-top:auto; padding-top:0.75rem; border-top:1px solid var(--border-subtle); flex-wrap:wrap;">
          ${room.status === "Available" ? `
            <button class="btn btn-sm btn-primary" onclick="assignPatientToRoom('${room.id}')" style="width:100%;">
              ⚡ Assign Intake Patient
            </button>
          ` : (room.status === "Occupied" ? `
            <button class="btn btn-sm btn-primary" onclick="viewPatientEhr('${room.patientId || ''}')" style="flex:1;">
              EHR Chart
            </button>
            <button class="btn btn-sm btn-secondary" onclick="dischargeRoomPatient('${room.id}')" style="flex:1;">
              Discharge
            </button>
            <button class="btn btn-sm btn-secondary" onclick="viewRoomTelemetry('${room.id}')" style="padding:0.35rem 0.65rem;" title="View telemetry">
              📡
            </button>
          ` : `
            <button class="btn btn-sm btn-secondary" onclick="markRoomCleaned('${room.id}')" style="width:100%;">
              🧹 Mark Cleaned & Ready
            </button>
          `)}
        </div>
      </div>
    `;
  }).join("");
}

// Interactive Quick Filter Controller
function setRoomStatusFilter(status) {
  const statusSelect = document.getElementById("filterRoomStatus");
  if (statusSelect) {
    statusSelect.value = status;
  }

  // Update pills active styling
  const pillMap = {
    ALL: "pillFilterAll",
    Occupied: "pillFilterOccupied",
    Available: "pillFilterAvailable",
    Maintenance: "pillFilterMaintenance"
  };

  Object.entries(pillMap).forEach(([st, pillId]) => {
    const el = document.getElementById(pillId);
    if (el) {
      if (st === status) {
        el.classList.add("active");
        el.style.boxShadow = "0 0 14px var(--teal-glow)";
      } else {
        el.classList.remove("active");
        el.style.boxShadow = "none";
      }
    }
  });

  renderRooms();

  // Inform the user
  const occupiedCount = (AppData.rooms || []).filter(r => r.status === "Occupied").length;
  if (status === "Occupied") {
    showToast("Occupancy Census", `Showing all ${occupiedCount} currently occupied members across inpatient suites.`, "success");
    const roster = document.getElementById("occupiedMembersRosterCard");
    if (roster) roster.scrollIntoView({ behavior: "smooth", block: "start" });
  } else if (status === "Available") {
    const availCount = (AppData.rooms || []).filter(r => r.status === "Available").length;
    showToast("Available Suites", `Showing ${availCount} sterilized suites ready for intake.`, "info");
  } else if (status === "Maintenance") {
    showToast("Sanitation Cycles", "Showing suites undergoing decontamination cycles.", "info");
  } else {
    showToast("All Clinical Units", `Showing full hospital bed inventory across ${(AppData.rooms || []).length} units.`, "info");
  }
}

function filterRoomsList() {
  renderRooms();
}

function autoOptimizeRoomAllocation() {
  const avail = (AppData.rooms || []).filter(r => r.status === "Available");
  if (avail.length > 0) {
    showToast("AI Bed Rebalancing Complete", `Optimized room allocation across ${AppData.rooms.length} units. ${avail.length} suites ready for emergency inflow.`, "ai");
  } else {
    showToast("Room Census Alert", "All acute care suites are occupied. Preparing step-down transfer protocols.", "info");
  }
}

function assignPatientToRoom(roomId) {
  const room = (AppData.rooms || []).find(r => r.id === roomId);
  if (!room) return;
  room.status = "Occupied";
  room.currentPatient = "Incoming Admission (Jane Smith Transfer)";
  room.mrn = "MRN-90214";
  room.admittedAt = "Just Now";
  room.condition = "Emergency intake triage admission";
  room.vitals = { bp: "120/80", hr: "72 bpm", o2: "99%", temp: "98.6°F" };
  renderRooms();
  showToast("Room Assigned", `${room.name} has been assigned to patient Jane Smith.`, "success");
}

function dischargeRoomPatient(roomId) {
  const room = (AppData.rooms || []).find(r => r.id === roomId);
  if (!room) return;
  const previousPatient = room.currentPatient;
  room.status = "Maintenance";
  room.currentPatient = "None (Discharged)";
  room.mrn = "-";
  room.sanitizationStatus = "In HEPA Decontamination Cycle";
  room.vitals = null;
  renderRooms();
  showToast("Patient Discharged", `${previousPatient} discharged from ${room.name}. Suite scheduled for sterilization.`, "info");
}

function markRoomCleaned(roomId) {
  const room = (AppData.rooms || []).find(r => r.id === roomId);
  if (!room) return;
  room.status = "Available";
  room.currentPatient = "None";
  room.mrn = "-";
  room.sanitizationStatus = "Sanitized & Sterilized (Just now)";
  room.vitals = null;
  renderRooms();
  showToast("Room Sanitized", `${room.name} is now clean, stocked, and ready for patient intake.`, "success");
}

function viewRoomTelemetry(roomId) {
  const room = (AppData.rooms || []).find(r => r.id === roomId);
  if (!room) return;
  const vitalsText = room.vitals ? `BP: ${room.vitals.bp}, HR: ${room.vitals.hr}, SpO2: ${room.vitals.o2}` : "Continuous telemetry active";
  showToast("Telemetry Feed", `Live monitors for ${room.name} (${room.currentPatient}): ${vitalsText}. All telemetry signals normal.`, "info");
}

function viewPatientEhr(patientId) {
  navigateToModule("patients");
  showToast("Patient EHR Chart", "Navigated to clinical charts for inpatient occupant.", "info");
}

function exportOccupancyReport() {
  const occupied = (AppData.rooms || []).filter(r => r.status === "Occupied");
  const reportRows = occupied.map(r => `${r.name},${r.department},${r.floor},${r.currentPatient},${r.mrn},${r.assignedDoctor},${r.admittedAt}`);
  const csvContent = "data:text/csv;charset=utf-8,Suite,Department,Floor,Occupant,MRN,Physician,Admitted\n" + reportRows.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `CuraHealth_Inpatient_Census_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("Census Exported", `Downloaded active inpatient census for ${occupied.length} members.`, "success");
}

// Global Exports
window.renderPatients = renderPatients;
window.filterPatientsList = filterPatientsList;
window.openNewPatientModal = openNewPatientModal;
window.handleNewPatientSubmit = handleNewPatientSubmit;
window.openEhrChart = openEhrChart;
window.quickBookPatient = quickBookPatient;
window.quickMessagePatient = quickMessagePatient;

window.renderDoctors = renderDoctors;
window.filterDoctorsList = filterDoctorsList;
window.quickBookDoctor = quickBookDoctor;
window.quickRouteTaskToDoctor = quickRouteTaskToDoctor;

window.renderRooms = renderRooms;
window.filterRoomsList = filterRoomsList;
window.setRoomStatusFilter = setRoomStatusFilter;
window.autoOptimizeRoomAllocation = autoOptimizeRoomAllocation;
window.assignPatientToRoom = assignPatientToRoom;
window.dischargeRoomPatient = dischargeRoomPatient;
window.markRoomCleaned = markRoomCleaned;
window.viewRoomTelemetry = viewRoomTelemetry;
window.viewPatientEhr = viewPatientEhr;
window.exportOccupancyReport = exportOccupancyReport;

window.renderStaff = renderStaff;
window.switchStaffSubTab = switchStaffSubTab;
window.quickMessageStaff = quickMessageStaff;
window.quickAdjustShift = quickAdjustShift;

// --------------------------------------------------------------------------
// HospiCare Core Dashboard & Department Controllers
// --------------------------------------------------------------------------
function renderHospiCareDashboard() {
  // Update date - match screenshot date format (27/6/2026 or dynamic)
  const dateEl = document.getElementById("hospicareHeroDate");
  if (dateEl) {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    dateEl.textContent = `${day}/${month}/${year}`;
  }

  // 1. Total Patients (Active records)
  const totalPatientsEl = document.getElementById("hospicareTotalPatients");
  if (totalPatientsEl && AppData.patients) {
    totalPatientsEl.textContent = AppData.patients.length;
  }
  const hubPatients = document.getElementById("hubBadgePatients");
  if (hubPatients && AppData.patients) {
    hubPatients.textContent = `${AppData.patients.length} Charts`;
  }

  // 2. Active Doctors (On staff)
  const activeDoctorsEl = document.getElementById("hospicareActiveDoctors");
  if (activeDoctorsEl && AppData.doctors) {
    const activeDocs = AppData.doctors.filter(d => d.onDuty).length;
    activeDoctorsEl.textContent = activeDocs || AppData.doctors.length;
  }
  const hubDoctors = document.getElementById("hubBadgeDoctors");
  if (hubDoctors && AppData.doctors) {
    const activeDocs = AppData.doctors.filter(d => d.onDuty).length;
    hubDoctors.textContent = `${activeDocs || 5} On Duty`;
  }

  // 3. Today's Appointments (Scheduled)
  const todayAptsEl = document.getElementById("hospicareTodayAppointments");
  if (todayAptsEl && AppData.appointments) {
    const todayApts = AppData.appointments.filter(a => a.status === "Scheduled" || a.status === "In Consultation");
    todayAptsEl.textContent = todayApts.length || 0;
  }

  // 4. Pending Bills (Unpaid)
  const pendingBillsEl = document.getElementById("hospicarePendingBills");
  if (pendingBillsEl && AppData.claims) {
    const unpaid = AppData.claims.filter(c => c.status === "Submitted" || c.status === "Pended for Info" || c.status === "Pending");
    pendingBillsEl.textContent = unpaid.length || 0;
  }

  // 5. Room Occupancy
  const roomOccupancyEl = document.getElementById("hospicareRoomOccupancy");
  const roomRateEl = document.getElementById("hospicareRoomOccupancyRate");
  if (roomOccupancyEl && AppData.rooms) {
    const totalRooms = AppData.rooms.length;
    const occupiedRooms = AppData.rooms.filter(r => r.status === "Occupied").length;
    roomOccupancyEl.textContent = `${occupiedRooms}/${totalRooms}`;
    const pct = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : "0.0";
    if (roomRateEl) roomRateEl.textContent = `${pct}% occupied`;
  }

  // 6. Monthly Revenue (This month)
  const revenueEl = document.getElementById("hospicareMonthlyRevenue");
  if (revenueEl) {
    let totalRev = 0;
    if (AppData.claims) {
      AppData.claims.forEach(c => {
        if (c.status === "Approved" || c.status === "Paid") {
          const num = parseFloat((c.amount || "").replace(/[^0-9.]/g, ""));
          if (!isNaN(num)) totalRev += num;
        }
      });
    }
    revenueEl.textContent = totalRev > 0 ? `$${totalRev.toLocaleString()}` : "$0";
  }

  // 7. Bed Occupancy (Bar)
  const bedPercentEl = document.getElementById("hospicareBedPercent");
  const bedBarEl = document.getElementById("hospicareBedProgressBar");
  if (bedPercentEl && AppData.rooms) {
    const totalRooms = AppData.rooms.length;
    const occupiedRooms = AppData.rooms.filter(r => r.status === "Occupied").length;
    const pct = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
    bedPercentEl.textContent = `${pct}%`;
    if (bedBarEl) bedBarEl.style.width = `${pct}%`;
  }
}

function renderDepartments() {
  const container = document.getElementById("departmentsContainer");
  if (!container || !AppData.departments) return;

  const depts = AppData.departments;

  // Update header metric pills
  const totalBeds = depts.reduce((acc, d) => acc + (d.totalBeds || 0), 0);
  const occupiedBeds = depts.reduce((acc, d) => acc + (d.occupiedBeds || 0), 0);
  const totalStaff = depts.reduce((acc, d) => acc + (d.totalStaff || 0), 0);
  const totalDocs = depts.reduce((acc, d) => acc + (d.activeDoctors || 0), 0);

  const mTotal = document.getElementById("deptMetricTotal");
  if (mTotal) mTotal.textContent = depts.length;
  const mDocs = document.getElementById("deptMetricDoctors");
  if (mDocs) mDocs.textContent = totalDocs;
  const mBeds = document.getElementById("deptMetricBeds");
  if (mBeds) mBeds.textContent = totalBeds;
  const mStaff = document.getElementById("deptMetricStaff");
  if (mStaff) mStaff.textContent = totalStaff;

  const countSummary = document.getElementById("deptCountSummary");
  if (countSummary) countSummary.textContent = `Showing ${depts.length} Departments`;

  container.innerHTML = depts.map(d => {
    const occPct = d.totalBeds > 0 ? Math.round((d.occupiedBeds / d.totalBeds) * 100) : 0;
    const isHigh = occPct >= 80;
    return `
      <div class="department-card" data-wing="${d.wing}" data-status="${d.status}" id="dept-${d.id}">
        <div class="department-card-top">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div class="dept-emblem">${d.icon || '🏥'}</div>
            <div class="dept-title-group">
              <h3 style="margin:0; font-size:1.1rem; color:var(--text-main); font-weight:700;">
                ${d.name} <span style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">(${d.code})</span>
              </h3>
              <div class="dept-location" style="margin-top:0.25rem;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ${d.wing}
              </div>
            </div>
          </div>
          <span class="badge ${d.status === 'High Capacity' ? 'badge-urgent' : 'badge-confirmed'}">${d.status}</span>
        </div>

        <div class="dept-head-box">
          <div class="dept-head-avatar">${d.headDoctorAvatar || 'DR'}</div>
          <div class="dept-head-info">
            <span class="dept-head-name">${d.headDoctorName}</span>
            <span class="dept-head-role">Head of Department • ${d.phone}</span>
          </div>
        </div>

        <div class="dept-metrics-grid">
          <div class="dept-metric-pill">
            <div class="dept-metric-val" style="color:#2563eb;">${d.activeDoctors}</div>
            <div class="dept-metric-lbl">Active Doctors</div>
          </div>
          <div class="dept-metric-pill">
            <div class="dept-metric-val" style="color:#10b981;">${d.totalStaff}</div>
            <div class="dept-metric-lbl">Total Staff</div>
          </div>
          <div class="dept-metric-pill">
            <div class="dept-metric-val" style="color:#8b5cf6;">${d.occupiedBeds}/${d.totalBeds}</div>
            <div class="dept-metric-lbl">Beds Used</div>
          </div>
        </div>

        <div class="dept-bed-gauge">
          <div class="dept-bed-gauge-top">
            <span style="color:var(--text-secondary); font-weight:600;">Inpatient Bed Capacity</span>
            <span style="font-weight:700; color:${isHigh ? 'var(--rose-danger)' : '#2563eb'};">${occPct}% Occupied</span>
          </div>
          <div class="hospicare-progress-track">
            <div class="hospicare-progress-bar" style="width:${occPct}%; background:${isHigh ? 'linear-gradient(90deg, #f97316, #ef4444)' : 'linear-gradient(90deg, #2563eb, #3b82f6)'};"></div>
          </div>
        </div>

        <p style="font-size:0.78rem; color:var(--text-secondary); line-height:1.4; margin-bottom:1rem;">
          ${d.description}
        </p>

        <div class="dept-actions">
          <button class="btn btn-sm btn-secondary" style="flex:1;" onclick="viewDepartmentStaff('${d.id}')">
            👨‍⚕️ View Staff
          </button>
          <button class="btn btn-sm btn-outline" style="flex:1;" onclick="viewDepartmentBeds('${d.id}')">
            🛏️ Manage Beds
          </button>
        </div>
      </div>
    `;
  }).join("");
}

function filterDepartments() {
  const query = (document.getElementById("deptSearchInput")?.value || "").toLowerCase().trim();
  const wingFilter = document.getElementById("deptWingFilter")?.value || "ALL";
  const statusFilter = document.getElementById("deptStatusFilter")?.value || "ALL";

  const cards = document.querySelectorAll(".department-card");
  let visibleCount = 0;

  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    const wing = card.getAttribute("data-wing") || "";
    const status = card.getAttribute("data-status") || "";

    const matchQuery = !query || text.includes(query);
    const matchWing = wingFilter === "ALL" || wing.toLowerCase().includes(wingFilter.toLowerCase());
    const matchStatus = statusFilter === "ALL" || status.toLowerCase() === statusFilter.toLowerCase();

    if (matchQuery && matchWing && matchStatus) {
      card.style.display = "flex";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  const countSummary = document.getElementById("deptCountSummary");
  if (countSummary) countSummary.textContent = `Showing ${visibleCount} Departments`;
}

function openAddDepartmentModal() {
  const modal = document.getElementById("addDepartmentModal");
  if (modal) modal.classList.add("active");
}

function closeAddDepartmentModal() {
  const modal = document.getElementById("addDepartmentModal");
  if (modal) modal.classList.remove("active");
}

function handleSaveDepartment(e) {
  e.preventDefault();
  const name = document.getElementById("deptNewName")?.value.trim();
  const code = document.getElementById("deptNewCode")?.value.trim().toUpperCase();
  const wing = document.getElementById("deptNewWing")?.value.trim();
  const headId = document.getElementById("deptNewHead")?.value;
  const beds = parseInt(document.getElementById("deptNewBeds")?.value) || 16;
  const docs = parseInt(document.getElementById("deptNewDoctors")?.value) || 4;
  const staff = parseInt(document.getElementById("deptNewStaff")?.value) || 20;
  const desc = document.getElementById("deptNewDesc")?.value.trim() || "Clinical patient care and specialized diagnostics.";

  const headDoc = AppData.doctors.find(d => d.id === headId) || AppData.doctors[0];

  const newDept = {
    id: `DEP-${Date.now().toString().slice(-3)}`,
    name,
    code,
    icon: "🏥",
    wing,
    headDoctorId: headDoc.id,
    headDoctorName: headDoc.name,
    headDoctorAvatar: headDoc.avatar,
    phone: headDoc.phone,
    totalBeds: beds,
    occupiedBeds: Math.round(beds * 0.6),
    activeDoctors: docs,
    totalStaff: staff,
    status: "Active",
    operatingHours: "24/7 Coverage",
    description: desc
  };

  if (!AppData.departments) AppData.departments = [];
  AppData.departments.push(newDept);

  closeAddDepartmentModal();
  renderDepartments();
  document.getElementById("addDepartmentForm")?.reset();
  showToast("Department Created", `${name} (${code}) added to HospiCare directory.`, "success");
}

function exportDepartmentsSummary() {
  if (!AppData.departments) return;
  const csv = "ID,Name,Code,Wing,Head,Beds,Occupied,Staff\n" +
    AppData.departments.map(d => `${d.id},"${d.name}",${d.code},"${d.wing}","${d.headDoctorName}",${d.totalBeds},${d.occupiedBeds},${d.totalStaff}`).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `HospiCare-Departments-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Roster Exported", "Departments CSV summary downloaded successfully.", "success");
}

function viewDepartmentStaff(deptId) {
  navigateToModule("staff");
  showToast("Department Staff", "Filtered staff schedules by department unit.", "info");
}

function viewDepartmentBeds(deptId) {
  navigateToModule("rooms");
  showToast("Department Beds", "Navigated to room & suite allocation grid.", "info");
}

function handleSignOut(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById("signOutModal");
  if (modal) modal.classList.add("active");
}

function confirmSignOut() {
  const modal = document.getElementById("signOutModal");
  if (modal) modal.classList.remove("active");
  showToast("Signed Out", "You have safely signed out of HospiCare. Returning to dashboard.", "info");
  navigateToModule("dashboard");
}

window.renderHospiCareDashboard = renderHospiCareDashboard;
window.renderDepartments = renderDepartments;
window.filterDepartments = filterDepartments;
window.openAddDepartmentModal = openAddDepartmentModal;
window.closeAddDepartmentModal = closeAddDepartmentModal;
window.handleSaveDepartment = handleSaveDepartment;
window.exportDepartmentsSummary = exportDepartmentsSummary;
window.viewDepartmentStaff = viewDepartmentStaff;
window.viewDepartmentBeds = viewDepartmentBeds;
window.handleSignOut = handleSignOut;
window.confirmSignOut = confirmSignOut;

// --------------------------------------------------------------------------
// Operational Metrics Drill-Down Inspector (Shows Names & Records One by One)
// --------------------------------------------------------------------------
let currentDrilldownCategory = "patients";
let currentDrilldownItems = [];

function openMetricDetails(category) {
  const modal = document.getElementById("metricDrilldownModal");
  if (!modal) return;

  const rawKey = (category || "patients").toLowerCase();
  const normKey = rawKey.replace(/[\s_-]+/g, "");
  currentDrilldownCategory = normKey;

  const titleEl = document.getElementById("drilldownTitle");
  const subtitleEl = document.getElementById("drilldownSubtitle");
  const iconEl = document.getElementById("drilldownIcon");
  const searchInput = document.getElementById("drilldownSearchInput");
  const countBadge = document.getElementById("drilldownCountBadge");
  const btnGoModule = document.getElementById("btnDrilldownGoModule");

  if (searchInput) searchInput.value = "";

  let items = [];
  let title = "Registered Records";
  let subtitle = "Showing individual records one by one";
  let icon = "📋";
  let targetModule = "dashboard";

  // Category Resolution
  if (normKey.includes("patient") || normKey.includes("registered")) {
    title = "Total Registered Patients";
    subtitle = "Showing registered patient charts one by one with MRN & live clinical status";
    icon = "👥";
    targetModule = "patients";
    items = (AppData.patients || []).map((pat, idx) => ({
      index: idx + 1,
      id: pat.id,
      name: pat.name,
      avatar: pat.name.split(" ").map(n => n[0]).join(""),
      avatarBg: "linear-gradient(135deg, #2563eb, #3b82f6)",
      titleBadge: pat.status,
      badgeClass: pat.status === "Admitted" ? "badge-ai" : (pat.status.includes("ER") || pat.status.includes("Stat") ? "badge-urgent" : "badge-confirmed"),
      primarySub: `MRN: <strong>${pat.mrn}</strong> • ${pat.age} yrs (${pat.gender}) • Blood: <strong style="color:var(--rose-danger);">${pat.bloodType}</strong>`,
      secondarySub: `Doctor: <strong>${pat.assignedDoctor}</strong> • Location: <strong>${pat.room}</strong>`,
      notes: `Active Condition: ${pat.activeCondition}`,
      footerMeta: `Payer: ${pat.insurance} (${pat.copay}) • Phone: ${pat.phone} • Last Visit: ${pat.lastVisit}`,
      actionLabel: "View EHR Chart",
      actionFn: `openEhrChart('${pat.id}'); closeMetricDetails();`,
      secondaryActionLabel: "Book Visit",
      secondaryActionFn: `quickBookPatient('${pat.name}', '${pat.doctorId}'); closeMetricDetails();`
    }));
  } else if (normKey.includes("doctor") || normKey.includes("physician") || normKey.includes("provider")) {
    title = "Active Medical Doctors & Providers";
    subtitle = "Showing all physicians one by one with clinical specialty, suite & duty telemetry";
    icon = "🩺";
    targetModule = "doctors";
    items = (AppData.doctors || []).map((doc, idx) => ({
      index: idx + 1,
      id: doc.id,
      name: doc.name,
      avatar: doc.avatar || doc.name.split(" ").map(n => n[0]).join(""),
      avatarBg: "linear-gradient(135deg, #10b981, #059669)",
      titleBadge: doc.status,
      badgeClass: doc.onDuty ? "badge-confirmed" : "badge-scheduled",
      primarySub: `Specialty: <strong>${doc.specialty}</strong> (${doc.subspecialty || doc.room}) • ${doc.experience} Exp`,
      secondarySub: `Suite: <strong>${doc.room}</strong> • Patient Load: <strong>${doc.patientLoadToday}/${doc.maxDailyCapacity}</strong> (${Math.round((doc.patientLoadToday / doc.maxDailyCapacity) * 100)}%)`,
      notes: `Next Available Slot: <strong style="color:var(--emerald-success);">${doc.nextFreeSlot}</strong> • Hours: ${doc.officeHours}`,
      footerMeta: `Phone: ${doc.phone} • Email: ${doc.email} • Rating: ★ ${doc.rating} (${doc.reviewsCount} reviews)`,
      actionLabel: "Book with Doctor",
      actionFn: `quickBookDoctor('${doc.id}'); closeMetricDetails();`,
      secondaryActionLabel: "Route Task",
      secondaryActionFn: `quickRouteTaskToDoctor('${doc.name}'); closeMetricDetails();`
    }));
  } else if (normKey.includes("appoint") || normKey.includes("schedul")) {
    title = "Today's Consultations & Appointments";
    subtitle = "Showing scheduled clinical appointments one by one with patient names & providers";
    icon = "📅";
    targetModule = "appointments";
    items = (AppData.appointments || []).map((apt, idx) => ({
      index: idx + 1,
      id: apt.id,
      name: `${apt.patientName}`,
      avatar: apt.patientName.split(" ").map(n => n[0]).join(""),
      avatarBg: "linear-gradient(135deg, #f97316, #ea580c)",
      titleBadge: apt.status,
      badgeClass: apt.status === "Checked-in" ? "badge-urgent" : "badge-confirmed",
      primarySub: `Consulting: <strong>${apt.doctorName}</strong> (${apt.specialty}) • Location: <strong>${apt.room}</strong>`,
      secondarySub: `Time: <strong>${apt.time}</strong> (${apt.duration}) • Date: <strong>${apt.date}</strong>`,
      notes: `Reason / Notes: ${apt.notes}`,
      footerMeta: `Type: ${apt.type} • Triage: <strong>${apt.triageScore}</strong> • Patient ID: ${apt.patientId}`,
      actionLabel: "Check In",
      actionFn: `quickCheckIn('${apt.id}'); closeMetricDetails();`,
      secondaryActionLabel: "Reschedule Assist",
      secondaryActionFn: `agentQuickReschedule('${apt.patientName}'); closeMetricDetails();`
    }));
  } else if (normKey.includes("bill") || normKey.includes("claim") || normKey.includes("pending")) {
    title = "Pending & Submitted Medical Bills";
    subtitle = "Showing medical billing claims one by one with patient names, amounts & statuses";
    icon = "💳";
    targetModule = "billing";
    items = (AppData.claims || []).map((claim, idx) => ({
      index: idx + 1,
      id: claim.id,
      name: `${claim.patientName} — ${claim.amount}`,
      avatar: "CLM",
      avatarBg: "linear-gradient(135deg, #ef4444, #dc2626)",
      titleBadge: claim.status,
      badgeClass: claim.status === "Approved" ? "badge-confirmed" : (claim.status === "Denied" ? "badge-urgent" : "badge-ai"),
      primarySub: `Claim ID: <strong>${claim.id}</strong> • Payer: <strong>${claim.payer}</strong> • Amount: <strong style="color:var(--emerald-success);">${claim.amount}</strong>`,
      secondarySub: `CPT Code: <strong>${claim.cpt}</strong> • ICD-10: <strong>${claim.icd}</strong>`,
      notes: `Billing Notes: ${claim.notes}`,
      footerMeta: `Prior Auth: <strong>${claim.priorAuth}</strong> • Status: ${claim.status}`,
      actionLabel: "Inspect Claim",
      actionFn: `navigateToModule('billing'); closeMetricDetails();`,
      secondaryActionLabel: "AI Prior Auth",
      secondaryActionFn: `showToast('Prior Auth Gateway', 'Synchronizing EDI 278 claim ${claim.id} with ${claim.payer}...', 'ai'); closeMetricDetails();`
    }));
  } else if (normKey.includes("revenue")) {
    title = "Monthly Revenue & Claims Ledger";
    subtitle = "Showing billable claims, remittances and revenue items one by one with patient names";
    icon = "📈";
    targetModule = "billing";
    items = (AppData.claims || []).map((claim, idx) => ({
      index: idx + 1,
      id: claim.id,
      name: `${claim.patientName} — ${claim.amount}`,
      avatar: "$",
      avatarBg: "linear-gradient(135deg, #06b6d4, #0891b2)",
      titleBadge: claim.status,
      badgeClass: claim.status === "Approved" ? "badge-confirmed" : "badge-ai",
      primarySub: `Patient: <strong>${claim.patientName}</strong> • Claim: <strong>${claim.id}</strong> • Payer: <strong>${claim.payer}</strong>`,
      secondarySub: `Billed Amount: <strong style="color:var(--emerald-success); font-size:1.05rem;">${claim.amount}</strong> • CPT: <strong>${claim.cpt}</strong>`,
      notes: `Clinical Service: ${claim.icd} — ${claim.notes}`,
      footerMeta: `Prior Auth: <strong>${claim.priorAuth}</strong> • Status: ${claim.status}`,
      actionLabel: "Inspect Claim",
      actionFn: `navigateToModule('billing'); closeMetricDetails();`,
      secondaryActionLabel: "Process EDI",
      secondaryActionFn: `showToast('EDI 835 Remittance', 'Verified clean remittance for ${claim.amount}.', 'success'); closeMetricDetails();`
    }));
  } else if (normKey.includes("bed")) {
    title = "Bed Allocations & Inpatient Telemetry";
    subtitle = "Showing all hospital beds and suites one by one with occupant names & capacity";
    icon = "🛌";
    targetModule = "rooms";
    items = (AppData.rooms || []).map((room, idx) => ({
      index: idx + 1,
      id: room.id,
      name: room.name,
      avatar: "BED",
      avatarBg: room.status === "Occupied" ? "linear-gradient(135deg, #8b5cf6, #7c3aed)" : "linear-gradient(135deg, #10b981, #059669)",
      titleBadge: room.status,
      badgeClass: room.status === "Occupied" ? "badge-urgent" : "badge-confirmed",
      primarySub: `Department: <strong>${room.department}</strong> • Floor: <strong>${room.floor}</strong>`,
      secondarySub: `Current Occupant: <strong style="color:var(--teal-light); font-size:0.95rem;">${room.currentPatient}</strong> (${room.mrn})`,
      notes: `Supervising Physician: <strong>${room.assignedDoctor}</strong>`,
      footerMeta: `Sanitization: ${room.sanitizationStatus} • Capacity: ${room.capacity} Bed(s)`,
      actionLabel: "Manage Bed",
      actionFn: `navigateToModule('rooms'); closeMetricDetails();`,
      secondaryActionLabel: "Transfer Patient",
      secondaryActionFn: `showToast('Patient Transfer', 'Initiated bed transfer protocol for ${room.currentPatient}.', 'info'); navigateToModule('rooms'); closeMetricDetails();`
    }));
  } else if (normKey.includes("room") || normKey.includes("suite")) {
    title = "Hospital Clinical Suites & Occupancy";
    subtitle = "Showing clinical exam suites and rooms one by one with occupants & telemetry";
    icon = "🛏️";
    targetModule = "rooms";
    items = (AppData.rooms || []).map((room, idx) => ({
      index: idx + 1,
      id: room.id,
      name: room.name,
      avatar: "RM",
      avatarBg: room.status === "Occupied" ? "linear-gradient(135deg, #8b5cf6, #7c3aed)" : "linear-gradient(135deg, #10b981, #059669)",
      titleBadge: room.status,
      badgeClass: room.status === "Occupied" ? "badge-urgent" : "badge-confirmed",
      primarySub: `Type: <strong>${room.type}</strong> • Floor: <strong>${room.floor}</strong> • Dept: <strong>${room.department}</strong>`,
      secondarySub: `Current Patient: <strong style="color:var(--teal-light);">${room.currentPatient}</strong> (${room.mrn || "N/A"})`,
      notes: `Assigned Doctor: <strong>${room.assignedDoctor}</strong> • Sanitization: ${room.sanitizationStatus}`,
      footerMeta: `Telemetry Equipment: ${(room.equipment || []).join(", ")}`,
      actionLabel: "View Suite",
      actionFn: `navigateToModule('rooms'); closeMetricDetails();`,
      secondaryActionLabel: "Allocate Bed",
      secondaryActionFn: `showToast('Room Allocation', 'Selected ${room.name} for patient assignment.', 'info'); navigateToModule('rooms'); closeMetricDetails();`
    }));
  } else if (normKey.includes("dept") || normKey.includes("department")) {
    title = "Clinical Departments Directory";
    subtitle = "Showing all 8 hospital departments one by one with departmental heads & bed capacity";
    icon = "🏥";
    targetModule = "departments";
    items = (AppData.departments || []).map((dept, idx) => ({
      index: idx + 1,
      id: dept.id,
      name: `${dept.icon || '🏥'} ${dept.name} (${dept.code})`,
      avatar: dept.code || "DEP",
      avatarBg: "linear-gradient(135deg, #6366f1, #4f46e5)",
      titleBadge: dept.status,
      badgeClass: "badge-confirmed",
      primarySub: `Head: <strong>${dept.headDoctorName}</strong> • Wing: <strong>${dept.wing}</strong>`,
      secondarySub: `Beds: <strong>${dept.occupiedBeds} / ${dept.totalBeds} Occupied</strong> • Active Doctors: <strong>${dept.activeDoctors}</strong> • Total Staff: <strong>${dept.totalStaff}</strong>`,
      notes: dept.description,
      footerMeta: `Direct Phone: ${dept.phone} • Hours: ${dept.operatingHours}`,
      actionLabel: "View Department",
      actionFn: `navigateToModule('departments'); closeMetricDetails();`,
      secondaryActionLabel: "View Staff",
      secondaryActionFn: `navigateToModule('staff'); closeMetricDetails();`
    }));
  } else if (normKey.includes("record") || normKey.includes("document") || normKey.includes("ehr")) {
    title = "Medical Records & Clinical Documents";
    subtitle = "Showing electronic health records & OCR documents one by one with patient names";
    icon = "📂";
    targetModule = "medicalrecords";
    items = (AppData.documents || []).map((doc, idx) => ({
      index: idx + 1,
      id: doc.id,
      name: `${doc.title}`,
      avatar: "EHR",
      avatarBg: "linear-gradient(135deg, #0284c7, #0369a1)",
      titleBadge: doc.status,
      badgeClass: "badge-confirmed",
      primarySub: `Patient: <strong>${doc.patientName}</strong> (${doc.patientId}) • Category: <strong>${doc.category}</strong>`,
      secondarySub: `Date: <strong>${doc.date}</strong> • Document ID: <strong>${doc.id}</strong>`,
      notes: `Referring Physician: ${doc.ocrData?.referringDoctor || 'Dr. Alistair Finch'} • Target: ${doc.ocrData?.targetSpecialist || 'Dr. Eleanor Hayes'}`,
      footerMeta: `Verified by OCR & AI Clinical Pipeline • Priority: ${doc.ocrData?.priority || 'URGENT'}`,
      actionLabel: "Open EHR",
      actionFn: `navigateToModule('medicalrecords'); closeMetricDetails();`,
      secondaryActionLabel: "View PDF",
      secondaryActionFn: `showToast('Document Viewer', 'Opening referral document ${doc.id}...', 'info'); navigateToModule('medicalrecords'); closeMetricDetails();`
    }));
  } else if (normKey.includes("staff") || normKey.includes("nurse") || normKey.includes("roster")) {
    title = "Hospital Clinical Staff & Roster";
    subtitle = "Showing clinical staff and nursing team one by one with shift assignments";
    icon = "👩‍⚕️";
    targetModule = "staff";
    items = (AppData.staffRoster || AppData.staff || []).map((stf, idx) => ({
      index: idx + 1,
      id: stf.id,
      name: stf.name,
      avatar: stf.name.split(" ").map(n => n[0]).join(""),
      avatarBg: "linear-gradient(135deg, #ec4899, #db2777)",
      titleBadge: stf.status,
      badgeClass: stf.status === "On Duty" ? "badge-confirmed" : "badge-scheduled",
      primarySub: `Role: <strong>${stf.role}</strong> • Dept: <strong>${stf.department}</strong>`,
      secondarySub: `Zone: <strong>${stf.assignedZone}</strong> • Weekly Hours: <strong>${stf.hoursThisWeek} hrs</strong> ${stf.overtimeAlert ? '<span style="color:var(--rose-danger); font-weight:700;">(OT Alert)</span>' : ''}`,
      notes: `Credentials: ${stf.credentials}`,
      footerMeta: `Email: ${stf.email} • Phone: ${stf.phone}`,
      actionLabel: "View Staff Roster",
      actionFn: `navigateToModule('staff'); closeMetricDetails();`,
      secondaryActionLabel: "Contact Staff",
      secondaryActionFn: `showToast('Direct Staff Page', 'Paging ${stf.name} via ${stf.phone}...', 'info'); closeMetricDetails();`
    }));
  } else {
    // Default fallback to patients
    title = "Total Registered Patients";
    subtitle = "Showing registered patient charts one by one with MRN & live clinical status";
    icon = "👥";
    targetModule = "patients";
    items = (AppData.patients || []).map((pat, idx) => ({
      index: idx + 1,
      id: pat.id,
      name: pat.name,
      avatar: pat.name.split(" ").map(n => n[0]).join(""),
      avatarBg: "linear-gradient(135deg, #2563eb, #3b82f6)",
      titleBadge: pat.status,
      badgeClass: pat.status === "Admitted" ? "badge-ai" : "badge-confirmed",
      primarySub: `MRN: <strong>${pat.mrn}</strong> • ${pat.age} yrs (${pat.gender}) • Blood: <strong style="color:var(--rose-danger);">${pat.bloodType}</strong>`,
      secondarySub: `Doctor: <strong>${pat.assignedDoctor}</strong> • Room: <strong>${pat.room}</strong>`,
      notes: `Active Condition: ${pat.activeCondition}`,
      footerMeta: `Payer: ${pat.insurance} (${pat.copay}) • Phone: ${pat.phone}`,
      actionLabel: "View EHR Chart",
      actionFn: `openEhrChart('${pat.id}'); closeMetricDetails();`,
      secondaryActionLabel: "Book Visit",
      secondaryActionFn: `quickBookPatient('${pat.name}', '${pat.doctorId}'); closeMetricDetails();`
    }));
  }

  currentDrilldownItems = items;

  // Update header titles & icons
  if (titleEl) titleEl.textContent = title;
  if (subtitleEl) subtitleEl.textContent = subtitle;
  if (iconEl) iconEl.textContent = icon;
  if (countBadge) countBadge.textContent = `${items.length} Records`;

  if (btnGoModule) {
    btnGoModule.textContent = `Open Full ${targetModule.charAt(0).toUpperCase() + targetModule.slice(1)} Module →`;
    btnGoModule.onclick = () => {
      closeMetricDetails();
      navigateToModule(targetModule);
    };
  }

  // Render the list items one by one
  renderDrilldownItemsHtml(items);

  // Show modal
  modal.classList.add("active");
  if (document.body) document.body.style.overflow = "hidden";
  setTimeout(() => {
    if (searchInput && typeof searchInput.focus === "function") {
      searchInput.focus();
    }
  }, 80);
}

function renderDrilldownItemsHtml(items) {
  const listEl = document.getElementById("metricDrilldownList");
  if (!listEl) return;

  if (!items || items.length === 0) {
    listEl.innerHTML = `
      <div style="padding:2.5rem; text-align:center; color:var(--text-muted); background:var(--bg-surface); border-radius:14px; border:1px dashed var(--border-medium);">
        <div style="font-size:2rem; margin-bottom:0.5rem;">🔍</div>
        <p style="font-weight:600; color:var(--text-main); margin-bottom:0.25rem;">No matching records found</p>
        <span style="font-size:0.8rem;">Try a different keyword or reset your search query.</span>
      </div>
    `;
    return;
  }

  listEl.innerHTML = items.map(item => `
    <div class="drilldown-item-card" data-item-id="${item.id}">
      <div class="drilldown-item-left">
        <div style="display:flex; flex-direction:column; align-items:center; gap:0.25rem; flex-shrink:0;">
          <div class="drilldown-avatar" style="background:${item.avatarBg || '#2563eb'};">
            ${item.avatar}
          </div>
          <span style="font-size:0.68rem; font-weight:700; color:var(--text-muted); padding:0.1rem 0.35rem; background:var(--bg-elevated); border-radius:4px;">
            #${item.index}
          </span>
        </div>
        <div class="drilldown-item-info">
          <div class="drilldown-item-name">
            <span>${item.name}</span>
            ${item.titleBadge ? `<span class="badge ${item.badgeClass || 'badge-confirmed'}" style="font-size:0.7rem; padding:0.15rem 0.5rem;">${item.titleBadge}</span>` : ''}
          </div>
          <div class="drilldown-item-sub">
            <span>${item.primarySub || ''}</span>
          </div>
          ${item.secondarySub ? `<div class="drilldown-item-sub" style="margin-top:0.15rem;"><span>${item.secondarySub}</span></div>` : ''}
          ${item.notes ? `
            <div style="margin-top:0.35rem; padding:0.35rem 0.6rem; background:var(--bg-card); border-radius:6px; font-size:0.75rem; color:var(--text-main); border-left:2.5px solid #2563eb;">
              ${item.notes}
            </div>
          ` : ''}
          ${item.footerMeta ? `
            <div class="drilldown-item-meta" style="margin-top:0.35rem;">
              ${item.footerMeta}
            </div>
          ` : ''}
        </div>
      </div>
      <div class="drilldown-item-actions">
        ${item.actionLabel ? `
          <button class="btn btn-sm btn-primary" onclick="${item.actionFn}" style="background:#2563eb; font-weight:600;" title="${item.actionLabel}">
            ${item.actionLabel}
          </button>
        ` : ''}
        ${item.secondaryActionLabel ? `
          <button class="btn btn-sm btn-secondary" onclick="${item.secondaryActionFn}" style="font-weight:600;" title="${item.secondaryActionLabel}">
            ${item.secondaryActionLabel}
          </button>
        ` : ''}
      </div>
    </div>
  `).join("");
}

function filterDrilldownItems() {
  const searchInput = document.getElementById("drilldownSearchInput");
  const countBadge = document.getElementById("drilldownCountBadge");
  const query = (searchInput?.value || "").toLowerCase().trim();

  if (!query) {
    renderDrilldownItemsHtml(currentDrilldownItems);
    if (countBadge) countBadge.textContent = `${currentDrilldownItems.length} Records`;
    return;
  }

  const filtered = currentDrilldownItems.filter(item => {
    const textToMatch = `${item.name} ${item.primarySub} ${item.secondarySub || ''} ${item.notes || ''} ${item.footerMeta || ''} ${item.titleBadge || ''}`.toLowerCase();
    return textToMatch.includes(query);
  });

  renderDrilldownItemsHtml(filtered);
  if (countBadge) countBadge.textContent = `${filtered.length} of ${currentDrilldownItems.length} Records`;
}

function closeMetricDetails() {
  const modal = document.getElementById("metricDrilldownModal");
  if (modal) {
    modal.classList.remove("active");
  }
  if (document.body) document.body.style.overflow = "";
}

// Attach backdrop click listener for metric drilldown modal
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("metricDrilldownModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeMetricDetails();
      }
    });
  }
});

window.openMetricDetails = openMetricDetails;
window.closeMetricDetails = closeMetricDetails;
window.filterDrilldownItems = filterDrilldownItems;
window.getDrilldownItems = () => currentDrilldownItems;

// --------------------------------------------------------------------------
// Hospital Brand & Dynamic Color Theme Controller
// --------------------------------------------------------------------------
const HOSPITAL_THEMES = {
  royal: {
    name: "Royal Blue",
    primary: "#2563eb",
    dark: "#1d4ed8",
    light: "#3b82f6",
    glow: "rgba(37, 99, 235, 0.28)",
    gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
  },
  emerald: {
    name: "Emerald Life",
    primary: "#059669",
    dark: "#047857",
    light: "#10b981",
    glow: "rgba(16, 185, 129, 0.28)",
    gradient: "linear-gradient(135deg, #059669 0%, #047857 100%)"
  },
  ocean: {
    name: "Ocean Cyan",
    primary: "#0284c7",
    dark: "#0369a1",
    light: "#06b6d4",
    glow: "rgba(2, 132, 199, 0.28)",
    gradient: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)"
  },
  violet: {
    name: "Violet Neuro",
    primary: "#7c3aed",
    dark: "#6d28d9",
    light: "#8b5cf6",
    glow: "rgba(124, 58, 237, 0.28)",
    gradient: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)"
  },
  crimson: {
    name: "Cardio Ruby",
    primary: "#dc2626",
    dark: "#b91c1c",
    light: "#ef4444",
    glow: "rgba(220, 38, 38, 0.28)",
    gradient: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)"
  },
  amber: {
    name: "Sunset Amber",
    primary: "#d97706",
    dark: "#b45309",
    light: "#f59e0b",
    glow: "rgba(217, 119, 6, 0.28)",
    gradient: "linear-gradient(135deg, #d97706 0%, #b45309 100%)"
  }
};

let currentHospitalBrand = {
  theme: "royal",
  logo: "vector",
  name: "HospiCare"
};

function loadSavedHospitalBrand() {
  try {
    const saved = localStorage.getItem("hospicare_brand_settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed) {
        currentHospitalBrand = { ...currentHospitalBrand, ...parsed };
      }
    }
  } catch (e) {
    // ignore
  }
  applyHospitalBrandToDom(currentHospitalBrand);
}

function applyHospitalBrandToDom(brand) {
  const theme = HOSPITAL_THEMES[brand.theme] || HOSPITAL_THEMES.royal;
  
  // Set theme attribute on root
  document.documentElement.setAttribute("data-hospital-theme", brand.theme);
  
  // Update theme dot indicator
  const themeDot = document.getElementById("headerThemeDot");
  if (themeDot) themeDot.style.background = theme.primary;

  // Update hospital name everywhere
  const sTitle = document.getElementById("sidebarHospitalTitle");
  if (sTitle) sTitle.textContent = brand.name || "HospiCare";
  
  const hTitle = document.getElementById("headerHospitalName");
  if (hTitle) hTitle.textContent = brand.name || "HospiCare";
  
  const heroTitle = document.getElementById("hospicareHeroTitle");
  if (heroTitle) heroTitle.textContent = brand.name || "HospiCare";

  // Update logos
  const logoSrc = brand.logo === "image" ? "assets/logo.jpg" : "assets/hospicare_logo.svg";
  
  const headerLogo = document.getElementById("headerHospitalLogoImg");
  if (headerLogo) {
    if (brand.logo === "shield" || brand.logo === "heart") {
      headerLogo.style.display = "none";
      let emoji = headerLogo.parentElement?.querySelector(".header-logo-emoji");
      if (!emoji) {
        emoji = document.createElement("span");
        emoji.className = "header-logo-emoji";
        emoji.style.fontSize = "1.3rem";
        headerLogo.parentElement?.insertBefore(emoji, headerLogo);
      }
      emoji.textContent = brand.logo === "shield" ? "🏥" : "🩺";
      emoji.style.display = "inline-block";
    } else {
      headerLogo.src = logoSrc;
      headerLogo.style.display = "block";
      const emoji = headerLogo.parentElement?.querySelector(".header-logo-emoji");
      if (emoji) emoji.style.display = "none";
    }
  }

  const heroLogo = document.getElementById("heroLogoImg");
  if (heroLogo) {
    if (brand.logo === "shield" || brand.logo === "heart") {
      heroLogo.style.display = "none";
      let emoji = heroLogo.parentElement?.querySelector(".hero-logo-emoji");
      if (!emoji) {
        emoji = document.createElement("span");
        emoji.className = "hero-logo-emoji";
        emoji.style.fontSize = "1.8rem";
        heroLogo.parentElement?.appendChild(emoji);
      }
      emoji.textContent = brand.logo === "shield" ? "🏥" : "🩺";
      emoji.style.display = "inline-block";
    } else {
      heroLogo.src = logoSrc;
      heroLogo.style.display = "block";
      const emoji = heroLogo.parentElement?.querySelector(".hero-logo-emoji");
      if (emoji) emoji.style.display = "none";
    }
  }
}

function openHospitalBrandModal() {
  const modal = document.getElementById("hospitalBrandModal");
  if (!modal) return;

  // Sync inputs with current state
  const inputName = document.getElementById("inputHospitalBrandName");
  if (inputName) inputName.value = currentHospitalBrand.name || "HospiCare";

  // Sync active theme cards
  document.querySelectorAll(".theme-swatch-card").forEach(c => {
    if (c.getAttribute("data-theme") === currentHospitalBrand.theme) {
      c.classList.add("active");
    } else {
      c.classList.remove("active");
    }
  });

  // Sync active logo cards
  document.querySelectorAll(".logo-option-card").forEach(c => {
    if (c.getAttribute("data-logo") === currentHospitalBrand.logo) {
      c.classList.add("active");
    } else {
      c.classList.remove("active");
    }
  });

  updateBrandModalPreview();

  modal.classList.add("active");
  if (document.body) document.body.style.overflow = "hidden";
}

function closeHospitalBrandModal() {
  const modal = document.getElementById("hospitalBrandModal");
  if (modal) {
    modal.classList.remove("active");
  }
  if (document.body) document.body.style.overflow = "";
}

function selectHospitalTheme(themeKey) {
  if (!HOSPITAL_THEMES[themeKey]) return;
  currentHospitalBrand.theme = themeKey;

  document.querySelectorAll(".theme-swatch-card").forEach(c => {
    if (c.getAttribute("data-theme") === themeKey) {
      c.classList.add("active");
    } else {
      c.classList.remove("active");
    }
  });

  updateBrandModalPreview();
}

function selectHospitalLogo(logoType) {
  currentHospitalBrand.logo = logoType;

  document.querySelectorAll(".logo-option-card").forEach(c => {
    if (c.getAttribute("data-logo") === logoType) {
      c.classList.add("active");
    } else {
      c.classList.remove("active");
    }
  });

  updateBrandModalPreview();
}

function updateBrandNamePreview(name) {
  currentHospitalBrand.name = name.trim() || "HospiCare";
  const prevTitle = document.getElementById("brandPreviewName");
  if (prevTitle) prevTitle.textContent = currentHospitalBrand.name;
}

function updateBrandModalPreview() {
  const theme = HOSPITAL_THEMES[currentHospitalBrand.theme] || HOSPITAL_THEMES.royal;
  
  const banner = document.getElementById("brandPreviewBanner");
  if (banner) {
    banner.style.background = theme.gradient;
    banner.style.boxShadow = `0 8px 24px ${theme.glow}`;
  }

  const prevTitle = document.getElementById("brandPreviewName");
  if (prevTitle) prevTitle.textContent = currentHospitalBrand.name || "HospiCare";

  const logoImg = document.getElementById("brandPreviewLogoImg");
  const logoBox = document.getElementById("brandPreviewLogoBox");
  if (logoImg && logoBox) {
    if (currentHospitalBrand.logo === "shield") {
      logoImg.style.display = "none";
      logoBox.innerHTML = '<span style="font-size:1.6rem;">🏥</span>';
    } else if (currentHospitalBrand.logo === "heart") {
      logoImg.style.display = "none";
      logoBox.innerHTML = '<span style="font-size:1.6rem;">🩺</span>';
    } else if (currentHospitalBrand.logo === "image") {
      logoBox.innerHTML = '<img src="assets/logo.jpg" alt="Preview Logo" width="34" height="34" style="border-radius:8px; object-fit:cover;">';
    } else {
      logoBox.innerHTML = '<img src="assets/hospicare_logo.svg" alt="Preview Logo" width="34" height="34" style="border-radius:8px;">';
    }
  }
}

function saveHospitalBrandSettings() {
  const inputName = document.getElementById("inputHospitalBrandName");
  if (inputName) {
    currentHospitalBrand.name = inputName.value.trim() || "HospiCare";
  }

  try {
    localStorage.setItem("hospicare_brand_settings", JSON.stringify(currentHospitalBrand));
  } catch (e) {
    // ignore
  }

  applyHospitalBrandToDom(currentHospitalBrand);
  closeHospitalBrandModal();
  
  const theme = HOSPITAL_THEMES[currentHospitalBrand.theme] || HOSPITAL_THEMES.royal;
  showToast("Hospital Brand Updated", `Applied ${theme.name} palette and logo to all hospital modules.`, "success");
}

function resetHospitalBrandDefault() {
  currentHospitalBrand = {
    theme: "royal",
    logo: "vector",
    name: "HospiCare"
  };
  try {
    localStorage.removeItem("hospicare_brand_settings");
  } catch (e) {}

  selectHospitalTheme("royal");
  selectHospitalLogo("vector");
  const inputName = document.getElementById("inputHospitalBrandName");
  if (inputName) inputName.value = "HospiCare";
  updateBrandNamePreview("HospiCare");
  applyHospitalBrandToDom(currentHospitalBrand);
  showToast("Defaults Restored", "Restored default HospiCare royal blue theme & vector logo.", "info");
}

// Attach backdrop click listener for hospital brand modal
document.addEventListener("DOMContentLoaded", () => {
  const brandModal = document.getElementById("hospitalBrandModal");
  if (brandModal) {
    brandModal.addEventListener("click", (e) => {
      if (e.target === brandModal) {
        closeHospitalBrandModal();
      }
    });
  }
});

window.openHospitalBrandModal = openHospitalBrandModal;
window.closeHospitalBrandModal = closeHospitalBrandModal;
window.selectHospitalTheme = selectHospitalTheme;
window.selectHospitalLogo = selectHospitalLogo;
window.updateBrandNamePreview = updateBrandNamePreview;
window.saveHospitalBrandSettings = saveHospitalBrandSettings;
window.resetHospitalBrandDefault = resetHospitalBrandDefault;
window.loadSavedHospitalBrand = loadSavedHospitalBrand;

// ===============================================================
// ENTERPRISE REGULATORY & COMPLIANCE MODAL SYSTEM
// ===============================================================
function openComplianceModal(tabId = 'privacy') {
  const modal = document.getElementById('complianceModal');
  if (modal) {
    modal.style.display = 'flex';
    switchComplianceTab(tabId);
  }
}

function closeComplianceModal() {
  const modal = document.getElementById('complianceModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function switchComplianceTab(tabId) {
  const tabButtons = document.querySelectorAll('.compliance-tab-btn');
  const tabPanels = document.querySelectorAll('.compliance-tab-content');

  tabButtons.forEach(btn => btn.classList.remove('active'));
  tabPanels.forEach(panel => panel.classList.remove('active'));

  const activeBtn = document.getElementById(`tabBtn${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
  const activePanel = document.getElementById(`complianceTab-${tabId}`);

  if (activeBtn) activeBtn.classList.add('active');
  if (activePanel) activePanel.classList.add('active');
}

// Attach backdrop listener for compliance modal
document.addEventListener("DOMContentLoaded", () => {
  const compModal = document.getElementById("complianceModal");
  if (compModal) {
    compModal.addEventListener("click", (e) => {
      if (e.target === compModal) {
        closeComplianceModal();
      }
    });
  }
});

window.openComplianceModal = openComplianceModal;
window.closeComplianceModal = closeComplianceModal;
window.switchComplianceTab = switchComplianceTab;






