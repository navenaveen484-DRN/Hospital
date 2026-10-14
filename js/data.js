/**
 * Healthcare Administrative Agent - Reactive State & Mock Data Store
 */

const AppData = {
  // Clinic Details
  clinic: {
    name: "HospiCare Medical Center",
    branch: "Main Campus - Metro Pavilion",
    agentStatus: "HospiCare AI Platform Active",
    todayDate: "27/6/2026"
  },

  // Doctors & Providers
  // Doctors & Providers Directory
  doctors: [
    {
      id: "DOC-101",
      name: "Dr. Alistair Finch",
      specialty: "Cardiology",
      subspecialty: "Interventional & Structural Heart",
      room: "Suite 302",
      avatar: "AF",
      rating: 4.9,
      reviewsCount: 148,
      onDuty: true,
      status: "On Duty",
      experience: "16 Years",
      education: "Harvard Medical School, MD",
      phone: "+1 (555) 392-1001",
      email: "a.finch@curahealth.org",
      patientLoadToday: 8,
      maxDailyCapacity: 12,
      nextFreeSlot: "11:15 AM",
      officeHours: "08:00 AM - 04:30 PM",
      bio: "Chief of Interventional Cardiology with expertise in coronary angiography, stent placements, and telemetry monitoring."
    },
    {
      id: "DOC-102",
      name: "Dr. Eleanor Hayes",
      specialty: "Gastroenterology",
      subspecialty: "Therapeutic Endoscopy & Hepatology",
      room: "Suite 415",
      avatar: "EH",
      rating: 4.8,
      reviewsCount: 112,
      onDuty: true,
      status: "In Procedure",
      experience: "12 Years",
      education: "Johns Hopkins University, MD",
      phone: "+1 (555) 392-1002",
      email: "e.hayes@curahealth.org",
      patientLoadToday: 6,
      maxDailyCapacity: 10,
      nextFreeSlot: "01:30 PM",
      officeHours: "07:30 AM - 03:30 PM",
      bio: "Specializing in advanced diagnostic endoscopy, colonoscopy, and inpatient gastrointestinal evaluations."
    },
    {
      id: "DOC-103",
      name: "Dr. Marcus Vance",
      specialty: "Neurology",
      subspecialty: "Neurophysiology & Stroke Prevention",
      room: "Suite 210",
      avatar: "MV",
      rating: 4.9,
      reviewsCount: 94,
      onDuty: false,
      status: "Off Duty (On-Call 6PM)",
      experience: "19 Years",
      education: "Columbia University Vagelos, MD",
      phone: "+1 (555) 392-1003",
      email: "m.vance@curahealth.org",
      patientLoadToday: 0,
      maxDailyCapacity: 10,
      nextFreeSlot: "Tomorrow 09:00 AM",
      officeHours: "09:00 AM - 05:00 PM",
      bio: "Board-certified neurologist focusing on complex migraine protocols, neuromuscular diagnostics, and stroke rehabilitation."
    },
    {
      id: "DOC-104",
      name: "Dr. Sophia Patel",
      specialty: "Pediatrics",
      subspecialty: "General & Adolescent Health",
      room: "Suite 104",
      avatar: "SP",
      rating: 4.95,
      reviewsCount: 168,
      onDuty: true,
      status: "On Duty",
      experience: "9 Years",
      education: "Stanford University School of Medicine, MD",
      phone: "+1 (555) 392-1004",
      email: "s.patel@curahealth.org",
      patientLoadToday: 11,
      maxDailyCapacity: 14,
      nextFreeSlot: "03:15 PM",
      officeHours: "08:30 AM - 05:00 PM",
      bio: "Passionate pediatric care provider certified in neonatal resuscitation, developmental screenings, and immunizations."
    },
    {
      id: "DOC-105",
      name: "Dr. Julian Reyes",
      specialty: "Orthopedics",
      subspecialty: "Sports Medicine & Joint Reconstruction",
      room: "Suite 501",
      avatar: "JR",
      rating: 4.7,
      reviewsCount: 88,
      onDuty: true,
      status: "On Duty",
      experience: "14 Years",
      education: "UCSF School of Medicine, MD",
      phone: "+1 (555) 392-1005",
      email: "j.reyes@curahealth.org",
      patientLoadToday: 7,
      maxDailyCapacity: 10,
      nextFreeSlot: "02:00 PM",
      officeHours: "08:00 AM - 04:00 PM",
      bio: "Orthopedic surgeon specializing in arthroscopic knee and shoulder repair, casting, and non-surgical joint therapies."
    },
    {
      id: "DOC-106",
      name: "Dr. Elena Rostova",
      specialty: "Emergency Medicine",
      subspecialty: "Trauma & Acute Resuscitation",
      room: "ER Trauma Bay A",
      avatar: "ER",
      rating: 4.9,
      reviewsCount: 204,
      onDuty: true,
      status: "Active ER Shift",
      experience: "11 Years",
      education: "Yale School of Medicine, MD",
      phone: "+1 (555) 392-1006",
      email: "e.rostova@curahealth.org",
      patientLoadToday: 14,
      maxDailyCapacity: 18,
      nextFreeSlot: "Stat Emergency Intake",
      officeHours: "24/7 Rotational Coverage",
      bio: "Attending Emergency Medicine physician managing high-acuity chest pain triage, trauma admissions, and stat life support."
    }
  ],

  // Clinical Departments & Specialized Hospital Units
  departments: [
    {
      id: "DEP-101",
      name: "Cardiology",
      code: "CARD",
      icon: "❤️",
      wing: "East Wing, 3rd Floor",
      headDoctorId: "DOC-101",
      headDoctorName: "Dr. Alistair Finch",
      headDoctorAvatar: "AF",
      phone: "+1 (555) 392-3001",
      totalBeds: 24,
      occupiedBeds: 18,
      activeDoctors: 5,
      totalStaff: 28,
      status: "Active",
      operatingHours: "24/7 Inpatient & ICU",
      description: "Comprehensive cardiac catheterization, echocardiography, rhythm monitoring, and acute coronary care unit."
    },
    {
      id: "DEP-102",
      name: "Emergency & Trauma",
      code: "EMRG",
      icon: "🚨",
      wing: "Ground Level, Pavilion A",
      headDoctorId: "DOC-106",
      headDoctorName: "Dr. Elena Rostova",
      headDoctorAvatar: "ER",
      phone: "+1 (555) 392-3002",
      totalBeds: 32,
      occupiedBeds: 26,
      activeDoctors: 8,
      totalStaff: 46,
      status: "High Capacity",
      operatingHours: "24/7 Level 1 Trauma Care",
      description: "Rapid acute resuscitation, polytrauma stabilization, rapid stroke triage, and emergency diagnostics."
    },
    {
      id: "DEP-103",
      name: "Neurology",
      code: "NEUR",
      icon: "🧠",
      wing: "West Wing, 2nd Floor",
      headDoctorId: "DOC-103",
      headDoctorName: "Dr. Marcus Vance",
      headDoctorAvatar: "MV",
      phone: "+1 (555) 392-3003",
      totalBeds: 18,
      occupiedBeds: 12,
      activeDoctors: 4,
      totalStaff: 22,
      status: "Active",
      operatingHours: "08:00 AM - 07:00 PM",
      description: "Stroke management, EEG diagnostics, neurovascular consultations, and rehabilitation protocols."
    },
    {
      id: "DEP-104",
      name: "Pediatrics & Adolescent Care",
      code: "PED",
      icon: "🧸",
      wing: "North Pavilion, 1st Floor",
      headDoctorId: "DOC-104",
      headDoctorName: "Dr. Sophia Patel",
      headDoctorAvatar: "SP",
      phone: "+1 (555) 392-3004",
      totalBeds: 20,
      occupiedBeds: 14,
      activeDoctors: 6,
      totalStaff: 30,
      status: "Active",
      operatingHours: "07:30 AM - 08:30 PM",
      description: "Neonatal intensive care (NICU), pediatric wellness, acute infectious disease care, and pediatric surgery."
    },
    {
      id: "DEP-105",
      name: "Gastroenterology",
      code: "GI",
      icon: "🔬",
      wing: "South Wing, 4th Floor",
      headDoctorId: "DOC-102",
      headDoctorName: "Dr. Eleanor Hayes",
      headDoctorAvatar: "EH",
      phone: "+1 (555) 392-3005",
      totalBeds: 14,
      occupiedBeds: 9,
      activeDoctors: 3,
      totalStaff: 18,
      status: "Active",
      operatingHours: "07:30 AM - 05:30 PM",
      description: "Endoscopy suites, therapeutic colonoscopy, liver & pancreatic disease center, and outpatient procedures."
    },
    {
      id: "DEP-106",
      name: "Orthopedics & Sports Medicine",
      code: "ORTH",
      icon: "🦴",
      wing: "Central Tower, 5th Floor",
      headDoctorId: "DOC-105",
      headDoctorName: "Dr. Marcus Vance",
      headDoctorAvatar: "MV",
      phone: "+1 (555) 392-3006",
      totalBeds: 22,
      occupiedBeds: 16,
      activeDoctors: 4,
      totalStaff: 24,
      status: "Active",
      operatingHours: "08:00 AM - 06:00 PM",
      description: "Joint replacement surgery, sports injury rehabilitation, fracture reduction, and arthroscopic procedures."
    },
    {
      id: "DEP-107",
      name: "Oncology & Infusion Center",
      code: "ONC",
      icon: "🎗️",
      wing: "Cancer Pavilion, 3rd Floor",
      headDoctorId: "DOC-101",
      headDoctorName: "Dr. Alistair Finch",
      headDoctorAvatar: "AF",
      phone: "+1 (555) 392-3007",
      totalBeds: 16,
      occupiedBeds: 11,
      activeDoctors: 4,
      totalStaff: 22,
      status: "Active",
      operatingHours: "08:00 AM - 06:00 PM",
      description: "Outpatient chemotherapy infusion, targeted immunotherapy, clinical trials, and oncology multidisciplinary tumor board."
    },
    {
      id: "DEP-108",
      name: "Diagnostic Radiology & Imaging",
      code: "RAD",
      icon: "📡",
      wing: "Basement Level B1, Imaging Center",
      headDoctorId: "DOC-102",
      headDoctorName: "Dr. Eleanor Hayes",
      headDoctorAvatar: "EH",
      phone: "+1 (555) 392-3008",
      totalBeds: 10,
      occupiedBeds: 4,
      activeDoctors: 4,
      totalStaff: 20,
      status: "Active",
      operatingHours: "24/7 Imaging Availability",
      description: "3T MRI scanners, 128-slice CT, digital fluoroscopy, ultrasound Doppler, and interventional radiology."
    }
  ],

  // Patients Directory & Clinical EHR Records
  patients: [
    {
      id: "PAT-89201",
      name: "Jane L. Smith",
      dob: "1978-05-12",
      age: 48,
      gender: "Female",
      phone: "+1 (555) 492-8102",
      email: "jane.smith@example.com",
      address: "742 Evergreen Terr, Metro City",
      insurance: "BlueCross Premier PPO",
      policyId: "BC-984420-A",
      copay: "$25.00",
      allergies: ["Penicillin", "Latex"],
      mrn: "MRN-90214",
      bloodType: "A+",
      assignedDoctor: "Dr. Eleanor Hayes",
      doctorId: "DOC-102",
      room: "Room 402 - Bed A",
      status: "Admitted",
      lastVisit: "2026-09-30 (Today)",
      activeCondition: "Persistent abdominal pain, diagnostic endoscopy prepped",
      vitals: { bp: "118/76", hr: 72, o2: "99%", temp: "98.4°F" }
    },
    {
      id: "PAT-89202",
      name: "Robert M. Chen",
      dob: "1985-11-20",
      age: 40,
      gender: "Male",
      phone: "+1 (555) 819-3329",
      email: "r.chen@example.com",
      address: "108 Marina Blvd, Metro City",
      insurance: "Aetna Health Fund",
      policyId: "AET-330192-B",
      copay: "$30.00",
      allergies: ["None Known"],
      mrn: "MRN-90215",
      bloodType: "O+",
      assignedDoctor: "Dr. Alistair Finch",
      doctorId: "DOC-101",
      room: "Suite 302",
      status: "Outpatient",
      lastVisit: "2026-09-30 (Today)",
      activeCondition: "Post-cardiac stent follow-up, dual antiplatelet regimen",
      vitals: { bp: "122/78", hr: 68, o2: "98%", temp: "98.6°F" }
    },
    {
      id: "PAT-89203",
      name: "Maria Gonzalez",
      dob: "1992-03-14",
      age: 34,
      gender: "Female",
      phone: "+1 (555) 774-1290",
      email: "maria.g@example.com",
      address: "512 Park Central, Metro City",
      insurance: "UnitedHealthcare Choice",
      policyId: "UHC-77129-C",
      copay: "$20.00",
      allergies: ["Sulfa Drugs"],
      mrn: "MRN-90216",
      bloodType: "B+",
      assignedDoctor: "Dr. Eleanor Hayes",
      doctorId: "DOC-102",
      room: "Infusion Suite 01",
      status: "In Treatment",
      lastVisit: "2026-09-29",
      activeCondition: "Infusion protocol, biologics tolerance check",
      vitals: { bp: "114/72", hr: 74, o2: "99%", temp: "98.2°F" }
    },
    {
      id: "PAT-89204",
      name: "David K. Miller",
      dob: "1964-08-30",
      age: 62,
      gender: "Male",
      phone: "+1 (555) 304-9812",
      email: "david.miller@example.com",
      address: "318 Highland Ave, Metro City",
      insurance: "Medicare Part B + Humana",
      policyId: "MED-449102-D",
      copay: "$15.00",
      allergies: ["Aspirin"],
      mrn: "MRN-90217",
      bloodType: "O-",
      assignedDoctor: "Dr. Julian Reyes",
      doctorId: "DOC-105",
      room: "Suite 501",
      status: "Outpatient",
      lastVisit: "2026-09-28",
      activeCondition: "Chronic hypertension, orthopedic knee arthralgia",
      vitals: { bp: "138/88", hr: 76, o2: "97%", temp: "98.7°F" }
    },
    {
      id: "PAT-89205",
      name: "Sarah Jenkins",
      dob: "1999-01-25",
      age: 27,
      gender: "Female",
      phone: "+1 (555) 612-4091",
      email: "s.jenkins@example.com",
      address: "904 Beacon Way, Metro City",
      insurance: "Cigna Open Access",
      policyId: "CIG-88214-E",
      copay: "$35.00",
      allergies: ["Codeine"],
      mrn: "MRN-90218",
      bloodType: "AB+",
      assignedDoctor: "Dr. Julian Reyes",
      doctorId: "DOC-105",
      room: "Room 405 - Bed A (Prepped)",
      status: "Scheduled Surgery",
      lastVisit: "2026-09-29",
      activeCondition: "Right knee meniscus tear, arthroscopy prior auth approved",
      vitals: { bp: "116/74", hr: 70, o2: "100%", temp: "98.5°F" }
    },
    {
      id: "PAT-89206",
      name: "Marcus Brody",
      dob: "1972-04-18",
      age: 54,
      gender: "Male",
      phone: "+1 (555) 293-8841",
      email: "m.brody@example.com",
      address: "220 River Oaks, Metro City",
      insurance: "BlueCross Select HMO",
      policyId: "BC-119204-M",
      copay: "$40.00",
      allergies: ["ACE Inhibitors"],
      mrn: "MRN-90219",
      bloodType: "A-",
      assignedDoctor: "Dr. Elena Rostova",
      doctorId: "DOC-106",
      room: "ER Trauma Bay B",
      status: "Stat ER Observation",
      lastVisit: "2026-09-30 (Just now)",
      activeCondition: "Acute substernal chest discomfort, stat telemetry observation",
      vitals: { bp: "144/92", hr: 98, o2: "96%", temp: "99.0°F" }
    }
  ],

  // Clinical Suites, Exam Rooms & Bed Inventory
  rooms: [
    {
      id: "ROOM-302",
      name: "Suite 302 - Cardiology Exam",
      type: "Exam Suite",
      department: "Cardiology",
      floor: "3rd Floor",
      status: "Occupied",
      assignedDoctor: "Dr. Alistair Finch",
      currentPatient: "Robert M. Chen",
      mrn: "MRN-90215",
      equipment: ["12-Lead ECG", "Echocardiogram", "Defibrillator", "Telemetry Monitor"],
      sanitizationStatus: "Cleaned (08:30 AM)",
      capacity: 1
    },
    {
      id: "ROOM-415",
      name: "Suite 415 - Endoscopy & GI Procedure",
      type: "Procedure Suite",
      department: "Gastroenterology",
      floor: "4th Floor",
      status: "Available",
      assignedDoctor: "Dr. Eleanor Hayes",
      currentPatient: "None (Standby)",
      mrn: "-",
      equipment: ["HD Video Endoscope", "Fluoroscopy C-Arm", "Suction Unit", "CO2 Insufflator"],
      sanitizationStatus: "Sanitized & Sterilized",
      capacity: 1
    },
    {
      id: "ROOM-210",
      name: "Suite 210 - Neurology Diagnostic Lab",
      type: "Diagnostic Lab",
      department: "Neurology",
      floor: "2nd Floor",
      status: "Occupied",
      assignedDoctor: "Dr. Marcus Vance",
      currentPatient: "Sarah Jenkins",
      mrn: "MRN-90218",
      equipment: ["Digital EEG", "EMG System", "Fundus Camera", "Reflex Stroboscope"],
      sanitizationStatus: "Cleaned (09:15 AM)",
      capacity: 1
    },
    {
      id: "ROOM-104",
      name: "Suite 104 - Pediatric Consultation",
      type: "Consultation Room",
      department: "Pediatrics",
      floor: "1st Floor",
      status: "Available",
      assignedDoctor: "Dr. Sophia Patel",
      currentPatient: "None",
      mrn: "-",
      equipment: ["Pediatric Vitals Hub", "Ophthalmoscope", "Nebulizer Station"],
      sanitizationStatus: "Sanitized & Stocked",
      capacity: 1
    },
    {
      id: "ROOM-501",
      name: "Suite 501 - Orthopedic Casting & Exam",
      type: "Procedure Suite",
      department: "Orthopedics",
      floor: "5th Floor",
      status: "Occupied",
      assignedDoctor: "Dr. Julian Reyes",
      currentPatient: "David K. Miller",
      mrn: "MRN-90217",
      equipment: ["Mini C-Arm X-Ray", "Plaster/Fiberglass Dispenser", "Goniometer Set"],
      sanitizationStatus: "In Service",
      capacity: 1
    },
    {
      id: "ROOM-ER-A",
      name: "ER Trauma Bay A - Resuscitation",
      type: "Trauma Bay",
      department: "Emergency Medicine",
      floor: "Ground Floor",
      status: "Reserved",
      assignedDoctor: "Dr. Elena Rostova",
      currentPatient: "Emergency Standby",
      mrn: "-",
      equipment: ["Rapid Infuser", "Mechanical Ventilator", "Stat Blood Gas Analyzer", "Crash Cart A"],
      sanitizationStatus: "Stat Ready 100%",
      capacity: 2
    },
    {
      id: "ROOM-ER-B",
      name: "ER Trauma Bay B - Acute Triage",
      type: "Trauma Bay",
      department: "Emergency Medicine",
      floor: "Ground Floor",
      status: "Occupied",
      assignedDoctor: "Dr. Elena Rostova",
      currentPatient: "Marcus Brody",
      mrn: "MRN-90219",
      equipment: ["Crash Cart B", "Non-Invasive Pacing", "Suction Unit"],
      sanitizationStatus: "Active Treatment",
      capacity: 1
    },
    {
      id: "ROOM-INF-01",
      name: "Infusion Suite 01 - Chemotherapy",
      type: "Infusion Bay",
      department: "Oncology & Infusion",
      floor: "2nd Floor",
      status: "Occupied",
      assignedDoctor: "Dr. Eleanor Hayes",
      currentPatient: "Maria Gonzalez",
      mrn: "MRN-90216",
      equipment: ["Smart Infusion Pumps (4x)", "Recliner Bed", "Anaphylaxis Stat Kit"],
      sanitizationStatus: "Active Infusion",
      capacity: 1
    },
    {
      id: "ROOM-INF-02",
      name: "Infusion Suite 02 - IV Hydration",
      type: "Infusion Bay",
      department: "Oncology & Infusion",
      floor: "2nd Floor",
      status: "Available",
      assignedDoctor: "Dr. Alistair Finch",
      currentPatient: "None",
      mrn: "-",
      equipment: ["Smart Infusion Pumps (2x)", "Vitals Monitor"],
      sanitizationStatus: "Sanitized & Prepped",
      capacity: 1
    },
    {
      id: "ROOM-BED-402A",
      name: "Room 402 - Bed A (Inpatient Telemetry)",
      type: "Inpatient Bed",
      department: "Internal Medicine",
      floor: "4th Floor",
      status: "Occupied",
      assignedDoctor: "Dr. Alistair Finch",
      currentPatient: "Jane L. Smith",
      mrn: "MRN-90214",
      equipment: ["Wireless Telemetry", "Oxygen Port", "Nurse Call Bedside"],
      sanitizationStatus: "Occupied - Daily Service",
      capacity: 1
    },
    {
      id: "ROOM-BED-402B",
      name: "Room 402 - Bed B (Inpatient Telemetry)",
      type: "Inpatient Bed",
      department: "Internal Medicine",
      floor: "4th Floor",
      status: "Maintenance",
      assignedDoctor: "None",
      currentPatient: "None",
      mrn: "-",
      equipment: ["Telemetry Hub", "Oxygen Port"],
      sanitizationStatus: "Deep Cleaning / Hepa Filter Cycle",
      capacity: 1
    },
    {
      id: "ROOM-BED-405A",
      name: "Room 405 - Bed A (Private Post-Surgical)",
      type: "Private Bed",
      department: "Surgery",
      floor: "4th Floor",
      status: "Available",
      assignedDoctor: "Dr. Julian Reyes",
      currentPatient: "None (Reserved for Sarah Jenkins)",
      mrn: "-",
      equipment: ["PCA Pump", "Sequential Compression Device", "Patient Lift"],
      sanitizationStatus: "Sanitized & Ready",
      capacity: 1
    }
  ],

  // Appointments
  appointments: [
    {
      id: "APT-1001",
      patientId: "PAT-89201",
      patientName: "Jane L. Smith",
      doctorId: "DOC-102",
      doctorName: "Dr. Eleanor Hayes",
      specialty: "Gastroenterology",
      time: "09:30 AM",
      date: "2026-09-30",
      duration: "30 min",
      type: "Urgent Consultation",
      status: "Checked-in",
      room: "Suite 415",
      triageScore: "Priority 2",
      notes: "Referred by Dr. Finch for endoscopy evaluation"
    },
    {
      id: "APT-1002",
      patientId: "PAT-89202",
      patientName: "Robert M. Chen",
      doctorId: "DOC-101",
      doctorName: "Dr. Alistair Finch",
      specialty: "Cardiology",
      time: "10:15 AM",
      date: "2026-09-30",
      duration: "45 min",
      type: "Post-op Follow-up",
      status: "Confirmed",
      room: "Suite 302",
      triageScore: "Routine",
      notes: "Echo review and blood pressure medication titrate"
    },
    {
      id: "APT-1003",
      patientId: "PAT-89203",
      patientName: "Maria Gonzalez",
      doctorId: "DOC-104",
      doctorName: "Dr. Sophia Patel",
      specialty: "Pediatrics",
      time: "11:00 AM",
      date: "2026-09-30",
      duration: "30 min",
      type: "Annual Wellness",
      status: "Scheduled",
      room: "Suite 104",
      triageScore: "Routine",
      notes: "Immunization schedule review"
    },
    {
      id: "APT-1004",
      patientId: "PAT-89204",
      patientName: "David K. Miller",
      doctorId: "DOC-101",
      doctorName: "Dr. Alistair Finch",
      specialty: "Cardiology",
      time: "02:00 PM",
      date: "2026-09-30",
      duration: "30 min",
      type: "Medication Refill",
      status: "Scheduled",
      room: "Suite 302",
      triageScore: "Routine",
      notes: "ACE inhibitor renewal request"
    },
    {
      id: "APT-1005",
      patientId: "PAT-89205",
      patientName: "Sarah Jenkins",
      doctorId: "DOC-105",
      doctorName: "Dr. Julian Reyes",
      specialty: "Orthopedics",
      time: "03:30 PM",
      date: "2026-10-01",
      duration: "45 min",
      type: "Pre-Surgery Assessment",
      status: "Confirmed",
      room: "Suite 501",
      triageScore: "High",
      notes: "Prior auth approved for right knee arthroscopy"
    }
  ],

  // Patient Communications (Omnichannel Inbox)
  messages: [
    {
      id: "MSG-401",
      patientId: "PAT-89201",
      patientName: "Jane L. Smith",
      channel: "SMS",
      lastTimestamp: "10 mins ago",
      unread: true,
      category: "Pre-Visit Triage",
      thread: [
        { sender: "patient", text: "Hello, should I stop eating breakfast before my 9:30 AM endoscopy appointment today?", time: "08:15 AM" },
        { sender: "ai-bot", text: "Hello Ms. Smith, CuraHealth AI here. Yes, please remain fasting (no food or liquids) for at least 6 hours prior to your endoscopy procedure. Dr. Hayes' team is ready for you.", time: "08:16 AM" },
        { sender: "patient", text: "Got it! I am in the parking garage now. Where should I check in?", time: "09:12 AM" }
      ]
    },
    {
      id: "MSG-402",
      patientId: "PAT-89202",
      patientName: "Robert M. Chen",
      channel: "Portal",
      lastTimestamp: "1 hour ago",
      unread: false,
      category: "Prescription Refill",
      thread: [
        { sender: "patient", text: "Dr. Finch, my Metoprolol 25mg is down to 2 days of tablets. Can we renew it at Walgreens?", time: "08:45 AM" },
        { sender: "staff", text: "Dr. Finch approved the 90-day refill. The prescription has been transmitted to Walgreens on Main St.", time: "09:05 AM" }
      ]
    },
    {
      id: "MSG-403",
      patientId: "PAT-89205",
      patientName: "Sarah Jenkins",
      channel: "WhatsApp",
      lastTimestamp: "Yesterday",
      unread: false,
      category: "Insurance Question",
      thread: [
        { sender: "patient", text: "Has Cigna approved my knee surgery scheduled for tomorrow?", time: "Yesterday 4:10 PM" },
        { sender: "ai-bot", text: "Great news Sarah! Prior authorization #PA-77291 was approved by Cigna with zero patient deductible remainder. Your surgery is confirmed.", time: "Yesterday 4:11 PM" }
      ]
    }
  ],

  // Medical Documents & OCR
  documents: [
    {
      id: "DOC-REF-001",
      title: "Urgent Medical Referral - Dr. Alistair Finch",
      patientId: "PAT-89201",
      patientName: "Jane L. Smith",
      category: "Clinical Referral",
      date: "2026-09-28",
      status: "Verified",
      fileUrl: "assets/sample_referral.jpg",
      ocrData: {
        hospital: "St. Jude's University Hospital",
        referringDoctor: "Dr. Alistair Finch, MD, MRCP",
        targetSpecialist: "Dr. Eleanor Hayes (Gastroenterology)",
        priority: "URGENT",
        extractedICD: "R10.9 (Unspecified Abdominal Pain)",
        signatureVerified: true,
        summary: "Patient presents with persistent abdominal pain, unexplained weight loss. Referred for urgent diagnostic endoscopy."
      }
    },
    {
      id: "DOC-PA-002",
      title: "Prior Authorization Approval - Cigna Healthcare",
      patientId: "PAT-89205",
      patientName: "Sarah Jenkins",
      category: "Prior Authorization",
      date: "2026-09-29",
      status: "Verified",
      fileUrl: "assets/sample_referral.jpg",
      ocrData: {
        hospital: "CuraHealth Surgical Center",
        referringDoctor: "Dr. Julian Reyes",
        targetSpecialist: "Orthopedic Surgery",
        priority: "Standard Pre-Cert",
        extractedICD: "M23.22 (Tear of meniscus, right knee)",
        signatureVerified: true,
        summary: "Authorization #PA-77291 granted for CPT 29881. Valid for 90 days."
      }
    },
    {
      id: "DOC-LAB-003",
      title: "Comprehensive Metabolic Panel (CMP)",
      patientId: "PAT-89202",
      patientName: "Robert M. Chen",
      category: "Lab Diagnostics",
      date: "2026-09-25",
      status: "Needs Review",
      fileUrl: "assets/sample_referral.jpg",
      ocrData: {
        hospital: "Quest Diagnostics Central Lab",
        referringDoctor: "Dr. Alistair Finch",
        targetSpecialist: "Cardiology",
        priority: "Routine",
        extractedICD: "Z01.810 (Preoperative exam)",
        signatureVerified: true,
        summary: "Potassium 4.2 mEq/L (Normal), Creatinine 0.9 mg/dL (Normal). eGFR > 90."
      }
    }
  ],

  // Staff Scheduling (Weekly Roster)
  staffRoster: [
    {
      id: "STF-01",
      name: "Dr. Alistair Finch",
      role: "Attending Cardiologist",
      department: "Cardiology",
      credentials: "MD, FACC • Harvard Medical",
      email: "a.finch@curahealth.org",
      phone: "+1 (555) 902-1144",
      status: "On Duty",
      assignedZone: "Cardiology Suite 302",
      shifts: ["Day (07-15)", "Day (07-15)", "Day (07-15)", "Off", "Day (07-15)", "On-Call", "Off"],
      hoursThisWeek: 36,
      overtimeAlert: false
    },
    {
      id: "STF-02",
      name: "Dr. Eleanor Hayes",
      role: "Senior Gastroenterologist",
      department: "Gastroenterology",
      credentials: "MD, AGAF • Johns Hopkins",
      email: "e.hayes@curahealth.org",
      phone: "+1 (555) 881-2299",
      status: "On Duty",
      assignedZone: "GI Endoscopy 415",
      shifts: ["Day (07-15)", "Day (07-15)", "Off", "Day (07-15)", "Day (07-15)", "Off", "Off"],
      hoursThisWeek: 32,
      overtimeAlert: false
    },
    {
      id: "STF-03",
      name: "Nurse Rachel Adams",
      role: "Charge Nurse (Emergency)",
      department: "Emergency Dept",
      credentials: "BSN, RN, CEN • 8 yrs Exp",
      email: "r.adams@curahealth.org",
      phone: "+1 (555) 723-9901",
      status: "On Duty",
      assignedZone: "ER Trauma Bay A",
      shifts: ["Night (23-07)", "Night (23-07)", "Off", "Night (23-07)", "Night (23-07)", "Night (23-07)", "Off"],
      hoursThisWeek: 42,
      overtimeAlert: true
    },
    {
      id: "STF-04",
      name: "Nurse Kevin Lee",
      role: "Triage & Critical Care RN",
      department: "Emergency Dept",
      credentials: "BSN, RN, CCRN • 6 yrs Exp",
      email: "k.lee@curahealth.org",
      phone: "+1 (555) 619-3388",
      status: "On Duty",
      assignedZone: "ER Triage Station",
      shifts: ["Evening (15-23)", "Evening (15-23)", "Evening (15-23)", "Off", "Off", "Evening (15-23)", "On-Call"],
      hoursThisWeek: 34,
      overtimeAlert: false
    },
    {
      id: "STF-05",
      name: "Dr. Elena Rostova",
      role: "Lead Trauma Surgeon",
      department: "Emergency Dept",
      credentials: "MD, FACS • Stanford Medicine",
      email: "e.rostova@curahealth.org",
      phone: "+1 (555) 441-8822",
      status: "On-Call",
      assignedZone: "Surgical Suite 04",
      shifts: ["Night (23-07)", "Night (23-07)", "Night (23-07)", "Night (23-07)", "Off", "Off", "Off"],
      hoursThisWeek: 32,
      overtimeAlert: false
    },
    {
      id: "STF-06",
      name: "Nurse Sarah Jenkins",
      role: "Inpatient Telemetry Lead RN",
      department: "Internal Medicine",
      credentials: "MSN, RN, PCCN • 9 yrs Exp",
      email: "s.jenkins.rn@curahealth.org",
      phone: "+1 (555) 309-4411",
      status: "On Duty",
      assignedZone: "Telemetry 402 Station",
      shifts: ["Day (07-15)", "Day (07-15)", "Day (07-15)", "Day (07-15)", "Off", "Off", "Off"],
      hoursThisWeek: 32,
      overtimeAlert: false
    },
    {
      id: "STF-07",
      name: "Marcus Brody",
      role: "Radiologic Technologist (CT/MRI)",
      department: "Radiology & Imaging",
      credentials: "AS, RT(R)(CT) • ARRT Certified",
      email: "m.brody@curahealth.org",
      phone: "+1 (555) 552-7711",
      status: "On Duty",
      assignedZone: "MRI Imaging Pavilion 2",
      shifts: ["Day (07-15)", "Off", "Day (07-15)", "Day (07-15)", "Day (07-15)", "Off", "Off"],
      hoursThisWeek: 32,
      overtimeAlert: false
    },
    {
      id: "STF-08",
      name: "Emily Vance",
      role: "Lead Clinical Pharmacist",
      department: "Pharmacy & Infusion",
      credentials: "PharmD, BCPS • Columbia Univ",
      email: "e.vance@curahealth.org",
      phone: "+1 (555) 918-6622",
      status: "On Duty",
      assignedZone: "Central Pharmacy 1B",
      shifts: ["Day (08-16)", "Day (08-16)", "Day (08-16)", "Day (08-16)", "Day (08-16)", "Off", "Off"],
      hoursThisWeek: 40,
      overtimeAlert: false
    },
    {
      id: "STF-09",
      name: "Carlos Rivera",
      role: "Senior Billing & Prior Auth Lead",
      department: "Revenue Cycle",
      credentials: "CPB, CPC, CRCR • AAPC Certified",
      email: "c.rivera@curahealth.org",
      phone: "+1 (555) 334-1188",
      status: "On Duty",
      assignedZone: "Patient Financial Services",
      shifts: ["Day (08-16)", "Day (08-16)", "Day (08-16)", "Day (08-16)", "Day (08-16)", "Off", "Off"],
      hoursThisWeek: 40,
      overtimeAlert: false
    }
  ],

  // Insurance & Admin Claims
  claims: [
    {
      id: "CLM-8924",
      patientName: "Jane L. Smith",
      payer: "BlueCross Premier",
      cpt: "43239 (EGD Biopsy)",
      icd: "R10.9 (Abdominal pain)",
      amount: "$2,850.00",
      status: "Approved",
      priorAuth: "PA-99120",
      notes: "Clean claim approved within 2.4s by EDI Gateway"
    },
    {
      id: "CLM-8925",
      patientName: "David K. Miller",
      payer: "Medicare Part B",
      cpt: "99214 (Office Visit L4)",
      icd: "I10 (Essential Hypertension)",
      amount: "$280.00",
      status: "Submitted",
      priorAuth: "N/A",
      notes: "Pending 837P adjudication"
    },
    {
      id: "CLM-8926",
      patientName: "Robert M. Chen",
      payer: "Aetna Health",
      cpt: "93306 (TTE Doppler)",
      icd: "I25.10 (CAD)",
      amount: "$1,450.00",
      status: "Pended for Info",
      priorAuth: "PA-66412",
      notes: "Requires updated cardiologist clinical chart note"
    },
    {
      id: "CLM-8927",
      patientName: "Sarah Jenkins",
      payer: "Cigna Health",
      cpt: "29881 (Knee Arthroscopy)",
      icd: "M23.22 (Meniscus Tear)",
      amount: "$7,200.00",
      status: "Approved",
      priorAuth: "PA-77291",
      notes: "Co-pay collected at intake: $75.00"
    },
    {
      id: "CLM-8928",
      patientName: "Liam O'Connor",
      payer: "UnitedHealthcare",
      cpt: "70553 (Brain MRI w/ Contrast)",
      icd: "G43.909 (Migraine)",
      amount: "$3,100.00",
      status: "Denied",
      priorAuth: "Missing",
      notes: "Denied for lack of prior conservative therapy justification. AI Appeal ready."
    }
  ],

  // Automated Reminders Queue
  reminders: [
    {
      id: "REM-01",
      patient: "Jane L. Smith",
      type: "Fasting & Check-in",
      time: "Today 07:00 AM",
      channel: "SMS + WhatsApp",
      status: "Delivered & Read",
      action: "Confirmed by Patient"
    },
    {
      id: "REM-02",
      patient: "Robert M. Chen",
      type: "24h Pre-Visit Reminder",
      time: "Today 08:00 AM",
      channel: "SMS",
      status: "Delivered",
      action: "Response: YES"
    },
    {
      id: "REM-03",
      patient: "David K. Miller",
      type: "Medication Refill Alert",
      time: "Today 11:30 AM",
      channel: "Voice Call + SMS",
      status: "Queued",
      action: "Pending Dispatch"
    },
    {
      id: "REM-04",
      patient: "Sarah Jenkins",
      type: "Pre-Op Prep Instructions",
      time: "Tomorrow 09:00 AM",
      channel: "Email + SMS",
      status: "Scheduled",
      action: "Pending Dispatch"
    }
  ],

  // Visual Multi-Step Workflows
  workflows: [
    {
      id: "WF-01",
      name: "New Patient Digital Onboarding",
      activeInstances: 18,
      successRate: "98.5%",
      steps: [
        { step: 1, label: "Online Booking Received", trigger: "Web / EMR Event", delay: "Instant" },
        { step: 2, label: "Send Welcome SMS & Intake Link", trigger: "Automated SMS", delay: "Immediate" },
        { step: 3, label: "Insurance Real-time 270/271 Check", trigger: "AI Gateway", delay: "30s" },
        { step: 4, label: "24h Pre-Visit Fasting Reminder", trigger: "Scheduled Queue", delay: "-24h to appt" },
        { step: 5, label: "Arrival Geofence & Mobile Check-In", trigger: "Patient GPS/SMS", delay: "On Site" }
      ]
    },
    {
      id: "WF-02",
      name: "Prior Authorization & Claims Appeal",
      activeInstances: 7,
      successRate: "92.1%",
      steps: [
        { step: 1, label: "Doctor Orders Diagnostic/Procedure", trigger: "EHR Order", delay: "Instant" },
        { step: 2, label: "AI Extracts ICD-10 & Medical Necessity", trigger: "OCR & LLM", delay: "15s" },
        { step: 3, label: "Submit 278 Electronic Prior Auth", trigger: "Payer API", delay: "Immediate" },
        { step: 4, label: "Auto-Draft Appeal If Denied", trigger: "Condition Check", delay: "Within 2h" },
        { step: 5, label: "Notify Patient & Clinic Coordinator", trigger: "Omnichannel Alert", delay: "Instant" }
      ]
    },
    {
      id: "WF-03",
      name: "Post-Procedure Recovery Care",
      activeInstances: 12,
      successRate: "96.8%",
      steps: [
        { step: 1, label: "Patient Discharged", trigger: "EMR Status", delay: "Instant" },
        { step: 2, label: "Day 1 Pain Score & Medication SMS", trigger: "Patient Outreach", delay: "+24 hours" },
        { step: 3, label: "AI Triage of Patient Response", trigger: "NLP Classifier", delay: "Immediate" },
        { step: 4, label: "Escalate to On-Call Nurse if Pain > 6", trigger: "Rule Engine", delay: "Urgent" },
        { step: 5, label: "Day 7 Telehealth Booking", trigger: "Auto Scheduler", delay: "+7 days" }
      ]
    }
  ],

  // Appointment Waitlist & Auto-Fill Queue
  waitlist: [
    {
      id: "WAIT-01",
      patientName: "David K. Miller",
      mrn: "MRN-90217",
      phone: "+1 (555) 304-9812",
      doctorId: "DOC-101",
      doctorName: "Dr. Alistair Finch",
      specialty: "Cardiology",
      urgency: "High",
      requestedWindow: "Morning (09:00 - 11:30 AM)",
      notes: "Standby for urgent cardiology slot if cancellation occurs",
      status: "Active Waitlist",
      addedDate: "2026-09-29"
    },
    {
      id: "WAIT-02",
      patientName: "Emily Vance",
      mrn: "MRN-90222",
      phone: "+1 (555) 721-9981",
      doctorId: "DOC-102",
      doctorName: "Dr. Eleanor Hayes",
      specialty: "Gastroenterology",
      urgency: "Medium",
      requestedWindow: "Midday (11:00 - 02:00 PM)",
      notes: "Standby for endoscopy consult or cancellation",
      status: "Active Waitlist",
      addedDate: "2026-09-30"
    },
    {
      id: "WAIT-03",
      patientName: "Carlos Mendez",
      mrn: "MRN-90225",
      phone: "+1 (555) 441-2091",
      doctorId: "DOC-105",
      doctorName: "Dr. Julian Reyes",
      specialty: "Orthopedics",
      urgency: "Routine",
      requestedWindow: "Afternoon (02:00 - 04:30 PM)",
      notes: "Post-sprain joint evaluation standby",
      status: "Active Waitlist",
      addedDate: "2026-09-30"
    }
  ],

  // Incoming Faxes Stream & Categorization Queue
  faxes: [
    {
      id: "FAX-4091",
      sourceClinic: "St. Jude's Specialty Clinics",
      senderNumber: "+1 (555) 882-9011",
      timestamp: "10:18 AM Today",
      pages: 3,
      documentType: "Clinical Referral",
      suggestedCategory: "Gastroenterology Referral",
      patientMatch: "Jane L. Smith (MRN-90214)",
      targetDoctor: "Dr. Eleanor Hayes",
      extractedICD: "R10.9 (Unspecified Abdominal Pain)",
      status: "Pending Categorization",
      rawSnippet: "Urgent consultation requested for 48yo female with recurring upper GI pain. Referring Provider: Dr. Alistair Finch. Expedited scheduling recommended.",
      priority: "Urgent"
    },
    {
      id: "FAX-4092",
      sourceClinic: "Quest Central Diagnostic Labs",
      senderNumber: "+1 (555) 301-4450",
      timestamp: "09:42 AM Today",
      pages: 2,
      documentType: "Lab Diagnostic Report",
      suggestedCategory: "Lipid & Metabolic Panel",
      patientMatch: "Robert M. Chen (MRN-90215)",
      targetDoctor: "Dr. Alistair Finch",
      extractedICD: "I25.10 (Atherosclerotic Heart Disease)",
      status: "Categorized & Ready to File",
      rawSnippet: "Serum Troponin <0.01 ng/mL (Normal). Total Cholesterol: 182 mg/dL. Triglycerides: 140 mg/dL. Fasting Glucose: 96 mg/dL.",
      priority: "Routine"
    },
    {
      id: "FAX-4093",
      sourceClinic: "BlueCross Pre-Cert Operations",
      senderNumber: "+1 (800) 555-0199",
      timestamp: "08:15 AM Today",
      pages: 1,
      documentType: "Prior Authorization Approval",
      suggestedCategory: "EDI 278 Written Verification",
      patientMatch: "Sarah Jenkins (MRN-90218)",
      targetDoctor: "Dr. Julian Reyes",
      extractedICD: "M23.22 (Meniscus Tear, Right Knee)",
      status: "Pending Filing",
      rawSnippet: "Authorization Reference #PA-77291. Procedure: Outpatient Knee Arthroscopy (CPT 29881). Approved for 90 days from service date.",
      priority: "Standard"
    },
    {
      id: "FAX-4094",
      sourceClinic: "Metro Pediatrics Associates",
      senderNumber: "+1 (555) 732-1188",
      timestamp: "Yesterday 04:30 PM",
      pages: 4,
      documentType: "Patient Intake Form & Records",
      suggestedCategory: "Immunization & Growth History",
      patientMatch: "Maria Gonzalez (MRN-90216)",
      targetDoctor: "Dr. Sophia Patel",
      extractedICD: "Z00.129 (Routine Child Health Exam)",
      status: "Filed to EHR Chart",
      rawSnippet: "Complete childhood vaccine record, pediatric growth percentiles, parental consent signed, and updated insurance card copy.",
      priority: "Routine"
    }
  ],

  // Administrative Summaries: Clinical Scribing & Visit Notes (Physician Review)
  clinicalNotes: [
    {
      id: "SCRIBE-101",
      patientId: "PAT-89201",
      patientName: "Jane L. Smith",
      doctorId: "DOC-102",
      doctorName: "Dr. Eleanor Hayes",
      specialty: "Gastroenterology",
      visitDate: "2026-09-30",
      audioDuration: "03:42 min",
      status: "Pending Physician Sign-Off",
      soapNote: {
        subjective: "Patient is a 48-year-old female presenting with 3-week history of persistent epigastric pain, exacerbated postprandially. Denies hematemesis or melena. Reports mild nausea and 4-lb unintentional weight loss. Complies with current omeprazole 20mg daily with minimal relief.",
        objective: "Vitals: BP 118/76, HR 72, Temp 98.4°F, BMI 23.4. Abdomen: Soft, mild tenderness to deep palpation in epigastric region, no rebound or guarding. Normal active bowel sounds. No hepatosplenomegaly.",
        assessment: "Epigastric pain, suspected peptic ulcer disease vs. gastritis. ICD-10: R10.9 (Unspecified abdominal pain) & K29.70 (Gastritis, unspecified).",
        plan: "1. Schedule diagnostic esophagogastroduodenoscopy (EGD) under conscious sedation within 7 days. 2. Up-titrate Omeprazole to 40mg BID. 3. Fasting lab panel: H. pylori stool antigen and CBC. 4. Patient instructed on NPO guidelines."
      },
      physicianSigned: false,
      signedTimestamp: null
    },
    {
      id: "SCRIBE-102",
      patientId: "PAT-89202",
      patientName: "Robert M. Chen",
      doctorId: "DOC-101",
      doctorName: "Dr. Alistair Finch",
      specialty: "Cardiology",
      visitDate: "2026-09-30",
      audioDuration: "04:15 min",
      status: "Signed & Finalized",
      soapNote: {
        subjective: "6-month post-cardiac stent follow-up. Patient reports exercising 30 minutes daily with zero angina or dyspnea on exertion. Sleep quality improved, denies peripheral edema or dizziness.",
        objective: "BP 122/78 sitting, HR 64 regular. Heart: S1/S2 present, no murmurs, gallops, or rubs. Lungs: Clear to auscultation bilaterally. Extremities: Zero pedal edema, pedal pulses 2+ bilaterally.",
        assessment: "Stable post-coronary stent (DES to LAD). Hypertension well controlled. ICD-10: Z95.5 (Presence of coronary angioplasty implant) & I10 (Essential hypertension).",
        plan: "1. Continue Aspirin 81mg daily and Clopidogrel 75mg daily. 2. Continue Metoprolol Tartrate 25mg BID. 3. Repeat fasting lipid profile in 6 months. 4. Return to clinic in 6 months or PRN."
      },
      physicianSigned: true,
      signedTimestamp: "2026-09-30 11:15 AM (Dr. Alistair Finch, MD)"
    }
  ],

  // Administrative Summaries: Plain-Language Patient Discharge & Treatment Plans
  dischargeSummaries: [
    {
      id: "DIS-201",
      patientId: "PAT-89201",
      patientName: "Jane L. Smith",
      doctorName: "Dr. Eleanor Hayes",
      generatedDate: "2026-09-30",
      readabilityGrade: "Grade 5.2 (Plain-Language Certified)",
      plainSummary: {
        whatHappened: "Dr. Hayes examined your stomach today for your ongoing belly pain. Your exam is stable, and we are scheduling a camera look at your stomach (an endoscopy) to find the exact cause.",
        medicationChanges: "Take your Omeprazole capsule twice every day (one 30 minutes before breakfast, one before dinner) instead of once a day.",
        fastingAlert: "IMPORTANT: Do NOT eat or drink anything (including water, coffee, or mints) after midnight before your upcoming endoscopy appointment.",
        warningSigns: "Call our emergency nurse line immediately if you have: throwing up blood, black or tarry bowel movements, severe sudden belly pain, or high fever over 101°F.",
        nextVisit: "Your diagnostic endoscopy is scheduled for Tuesday, Oct 6 at 09:30 AM in Suite 415."
      },
      sentToPatient: true,
      channel: "SMS & Patient Portal"
    },
    {
      id: "DIS-202",
      patientId: "PAT-89202",
      patientName: "Robert M. Chen",
      doctorName: "Dr. Alistair Finch",
      generatedDate: "2026-09-30",
      readabilityGrade: "Grade 5.0 (Plain-Language Certified)",
      plainSummary: {
        whatHappened: "Your heart stent check-up with Dr. Finch looked wonderful! Your blood pressure is right where it needs to be and your heart rhythm is normal.",
        medicationChanges: "Keep taking your Aspirin (81mg once a day) and Clopidogrel blood thinner (75mg once a day). Dr. Finch renewed your Metoprolol refill at Walgreens.",
        lifestyleGuide: "Keep walking 30 minutes every day. Limit salty foods to keep your blood pressure steady.",
        warningSigns: "Call 911 immediately if you feel heavy chest pressure, pain spreading to your left arm or jaw, or sudden trouble breathing.",
        nextVisit: "Routine check-up in 6 months on April 15, 2027 at 10:15 AM."
      },
      sentToPatient: true,
      channel: "SMS & Patient Portal"
    }
  ],

  // Administrative Summaries: Daily Shift Handoff Summaries (Nursing & Admin Staff)
  shiftHandoffs: [
    {
      id: "HANDOFF-01",
      date: "2026-09-30",
      shiftName: "Day Shift (07:00 - 15:00) → Evening Shift (15:00 - 23:00)",
      department: "Ambulatory Clinic & Infusion Pavilion",
      leadNurseOutgoing: "Nurse Rachel Adams, BSN (Charge)",
      leadNurseIncoming: "Nurse Kevin Lee, RN",
      censusSummary: {
        totalSeenToday: 42,
        activeInClinic: 6,
        highAcuityWatch: 2,
        pendingStatLabs: 1
      },
      highAcuityPatients: [
        {
          patient: "Jane L. Smith (Suite 415)",
          condition: "Pre-EGD severe epigastric pain",
          action: "Ensure NPO status confirmed. Check IV line access before 16:00."
        },
        {
          patient: "David K. Miller (Suite 302)",
          condition: "Hypertensive urgency monitor (BP 164/98 initially)",
          action: "Recheck blood pressure at 15:30. Titrate lisinopril if systolic > 160."
        }
      ],
      pendingStatTasks: [
        "Stat Trop-I lab result for room 3 awaiting Quest fax sign-off",
        "Prior auth approval from BlueCross for tomorrow's 08:30 AM case"
      ],
      adminStaffNotes: "Autonomous AI Agent has cleared 91% of daily intake paperwork and balanced evening on-call roster. Zero overtime violations on active floor."
    }
  ],

  // Workflow & Task Coordination: Internal Task Router
  internalTasks: [
    {
      id: "TSK-301",
      taskType: "Prescription Refill Request",
      patientName: "David K. Miller",
      mrn: "MRN-90217",
      requestedItem: "Lisinopril 20mg Tablet - 90 Day Supply",
      assignedTo: "Dr. Alistair Finch",
      role: "Attending Cardiologist",
      department: "Cardiology",
      urgency: "Routine",
      status: "Assigned & In Queue",
      timestamp: "10:05 AM Today",
      aiRecommendation: "Auto-approve: Lab creatinine normal (0.9 mg/dL) within last 30 days. No contraindications."
    },
    {
      id: "TSK-302",
      taskType: "Stat Lab Order Verification",
      patientName: "Jane L. Smith",
      mrn: "MRN-90214",
      requestedItem: "Pre-Op Complete Blood Count & Coagulation Panel",
      assignedTo: "Nurse Rachel Adams, BSN",
      role: "Charge Nurse",
      department: "Ambulatory Care",
      urgency: "Urgent",
      status: "Assigned & In Queue",
      timestamp: "09:50 AM Today",
      aiRecommendation: "Expedited phlebotomy order linked to EGD procedure slot."
    },
    {
      id: "TSK-303",
      taskType: "Prior Authorization Coordination",
      patientName: "Liam O'Connor",
      mrn: "MRN-90220",
      requestedItem: "Brain MRI with Contrast (CPT 70553) - Denial Appeal",
      assignedTo: "Billing & Prior Auth Specialist",
      role: "Insurance Coordinator",
      department: "Financial Clearance",
      urgency: "High",
      status: "AI Appeal Draft Ready",
      timestamp: "09:12 AM Today",
      aiRecommendation: "AI generated 2-page medical necessity appeal citing failure of 6-week triptan therapy."
    },
    {
      id: "TSK-304",
      taskType: "External Records Retrieval",
      patientName: "Maria Gonzalez",
      mrn: "MRN-90216",
      requestedItem: "Transfer Pediatric Growth Chart & Records from Kaiser",
      assignedTo: "Front Desk Administrator",
      role: "Intake Coordinator",
      department: "Pediatrics",
      urgency: "Routine",
      status: "Completed",
      timestamp: "08:30 AM Today",
      aiRecommendation: "Digital fax categorized and filed to EHR chart automatically."
    }
  ],

  // Workflow & Task Coordination: Live Intake Queue Monitor
  intakeQueue: [
    {
      id: "INT-801",
      patientName: "Marcus Brody",
      channel: "SMS Inbound",
      messageSnippet: "I am feeling heavy chest tightness and dizzy after taking my new blood pressure pill 20 mins ago.",
      timestamp: "Just now",
      urgencyLevel: "CRITICAL RED",
      triageScore: 98,
      flagged: true,
      assignedStaff: "ER Triage Nurse (Immediate Escalation)",
      actionTaken: "FLAGGED IMMEDIATELY: Inbound automated priority alert fired to triage nurse workstation and physician pager.",
      status: "Active Alert"
    },
    {
      id: "INT-802",
      patientName: "Jane L. Smith",
      channel: "Patient Portal",
      messageSnippet: "Can I drink a small sip of water to take my morning blood pressure tablet before the endoscopy?",
      timestamp: "12 mins ago",
      urgencyLevel: "MODERATE AMBER",
      triageScore: 62,
      flagged: false,
      assignedStaff: "Gastroenterology Coordinator",
      actionTaken: "AI Smart Reply sent: Patient advised small sip acceptable for cardiac meds only.",
      status: "Resolved by AI"
    },
    {
      id: "INT-803",
      patientName: "Sarah Jenkins",
      channel: "WhatsApp",
      messageSnippet: "What time should I arrive tomorrow morning for my knee surgery check-in?",
      timestamp: "25 mins ago",
      urgencyLevel: "ROUTINE GREEN",
      triageScore: 18,
      flagged: false,
      assignedStaff: "Front Desk Admin",
      actionTaken: "Auto-replied with parking instructions, suite 501 arrival time (08:15 AM), and ID reminder.",
      status: "Resolved by AI"
    }
  ],

  // Key Benefits Showcase Metrics & Impact Calculator Model
  keyBenefits: {
    burnout: {
      title: "Reduces Administrative Burnout",
      summary: "Takes over repetitive charting and paperwork, allowing doctors and nurses to focus on direct patient care.",
      hoursSavedPerPhysicianDay: 4.8,
      chartingAutomationRate: "87.4%",
      burnoutIndexReduction: "62%",
      annualHoursSavedClinic: "3,840 hrs",
      testimonial: "Dr. Alistair Finch: 'The AI agent handles SOAP scribing, prior auth submissions, and routine charting before I even finish rounds. I finally leave the clinic on time.'"
    },
    onboarding: {
      title: "Faster Patient Onboarding",
      summary: "Speeds up insurance verification, intake paperwork, and registration before the patient enters the clinic.",
      avgIntakeTimeMinutes: 3.2,
      industryBaselineMinutes: 18.0,
      preArrivalCompletionRate: "94.6%",
      ediVerificationVelocity: "1.4 seconds",
      testimonial: "Intake Coordinator: 'Patients arrive with their 270/271 insurance verified, questionnaires tagged into the EHR, and copays settled via SMS.'"
    },
    continuity: {
      title: "Improved Care Continuity",
      summary: "Ensures patient records, lab summaries, and follow-up tasks are accurate and filed without delay.",
      lostDocumentRate: "0.00%",
      chartFilingCompliance: "100%",
      postDischargeFollowUpRate: "98.2%",
      emergencyReadmissionDrop: "-28.4%",
      testimonial: "Chief Medical Officer: 'Zero dropped referral faxes. Discharge plans are translated into plain English for patients, closing the loop on patient safety.'"
    }
  },

  // Clinical Scope & Safety Guardrails Policy
  scopeGuardrails: {
    status: "ENFORCED_ACTIVE",
    complianceLevel: "100% Administrative Only",
    lastAudited: "2026-09-30 08:00 UTC",
    coreScopeTitle: "GOOD INITIAL SCOPE",
    prohibitedScopeTitle: "AVOID AS YOUR FIRST PRODUCT",
    approvedScope: [
      {
        id: "SCOPE-SCHED",
        name: "Scheduling",
        icon: "✓",
        description: "Books, reschedules, and cancels patient appointments across clinic calendars.",
        status: "APPROVED",
        safeguards: "Provider calendar conflict detection & room slot reservation"
      },
      {
        id: "SCOPE-REMIND",
        name: "Reminders",
        icon: "✓",
        description: "Sends automated reminders via SMS or email to reduce no-shows.",
        status: "APPROVED",
        safeguards: "Multi-channel delivery verification & TCPA opt-out compliance"
      },
      {
        id: "SCOPE-DOCS",
        name: "Administrative documents",
        icon: "✓",
        description: "Digitizes, tags, and files medical documents, lab results, and referral letters.",
        status: "APPROVED",
        safeguards: "Deterministic OCR extraction & HIPAA encrypted repository storage"
      },
      {
        id: "SCOPE-STAFF",
        name: "Staff workflows",
        icon: "✓",
        description: "Prepares shift handoffs, monitors overtime hours, and balances coverage.",
        status: "APPROVED",
        safeguards: "Acuity-to-nurse staffing ratios and mandatory break compliance"
      },
      {
        id: "SCOPE-REPORTS",
        name: "Reports",
        icon: "✓",
        description: "Generates operational summaries, audit trails, and executive administrative metrics.",
        status: "APPROVED",
        safeguards: "Immutable SHA-256 cryptographic logging & deterministic KPIs"
      },
      {
        id: "SCOPE-COORD",
        name: "Appointment coordination",
        icon: "✓",
        description: "Manages waitlists and fills sudden cancellations automatically.",
        status: "APPROVED",
        safeguards: "Standby patient acuity prioritization & SMS acceptance verification"
      },
      {
        id: "SCOPE-COMM",
        name: "Administrative communication",
        icon: "✓",
        description: "Delivers intake questionnaires, appointment notices, and clinic policy updates.",
        status: "APPROVED",
        safeguards: "Standardized non-clinical templates & emergency symptom detection traps"
      },
      {
        id: "SCOPE-DATA",
        name: "Data organization",
        icon: "✓",
        description: "Updates Electronic Health Records (EHR) with intake forms and categorizes faxes.",
        status: "APPROVED",
        safeguards: "Strict MRN matching & duplicate chart record prevention"
      }
    ],
    restrictedScope: [
      {
        id: "BLOCK-DIAG",
        name: "Autonomous diagnosis",
        icon: "✗",
        description: "AI attempting to diagnose pathology, disease, or medical conditions from symptoms.",
        policy: "STRICTLY PROHIBITED",
        guardrailAction: "Symptom queries trigger urgent human nurse/physician triage alert only; agent provides zero diagnostic opinion."
      },
      {
        id: "BLOCK-TREAT",
        name: "Treatment recommendations",
        icon: "✗",
        description: "AI prescribing clinical therapies, surgical recommendations, or medical advice.",
        policy: "STRICTLY PROHIBITED",
        guardrailAction: "Clinical Scribe generates draft transcription only; requiring licensed physician review, revision, and signature."
      },
      {
        id: "BLOCK-MEDS",
        name: "Medication decisions",
        icon: "✗",
        description: "AI adjusting drug dosages, approving refills, or altering pharmaceutical regimens.",
        policy: "STRICTLY PROHIBITED",
        guardrailAction: "Refills are purely packaged as administrative routing tasks for authorized pharmacist/MD sign-off."
      },
      {
        id: "BLOCK-CLIN",
        name: "Autonomous clinical decisions",
        icon: "✗",
        description: "AI making independent clinical judgments without licensed human review.",
        policy: "STRICTLY PROHIBITED",
        guardrailAction: "100% Human-in-the-loop (HITL) mandatory lock on all clinical chart filings and orders."
      }
    ]
  },

  // Clinical Rooms & Bed Inventory
  rooms: [
    {
      id: "ROOM-301",
      name: "Cardiology Telemetry Suite 301",
      department: "Cardiology",
      floor: "Floor 3 - West Wing",
      status: "Occupied",
      currentPatient: "Robert M. Chen",
      mrn: "MRN-90215",
      patientId: "PAT-89202",
      assignedDoctor: "Dr. Alistair Finch",
      admittedAt: "Today, 08:30 AM",
      condition: "Post-cardiac stent placement, continuous telemetry monitoring",
      sanitizationStatus: "Continuous HEPA Air Filtration Active",
      vitals: { bp: "122/78", hr: "68 bpm", o2: "98%", temp: "98.6°F" },
      equipment: ["12-Lead ECG", "Telemetry Vitals Beacon", "Defibrillator", "IV Infusion Pump"]
    },
    {
      id: "ROOM-402",
      name: "Gastroenterology Acute Suite 402",
      department: "Gastroenterology",
      floor: "Floor 4 - Endoscopy Pavilion",
      status: "Occupied",
      currentPatient: "Jane L. Smith",
      mrn: "MRN-90214",
      patientId: "PAT-89201",
      assignedDoctor: "Dr. Eleanor Hayes",
      admittedAt: "Today, 07:45 AM",
      condition: "Persistent acute abdominal pain, diagnostic endoscopy prep",
      sanitizationStatus: "Pre-Procedure Sterile Protocol Verified",
      vitals: { bp: "118/76", hr: "72 bpm", o2: "99%", temp: "98.4°F" },
      equipment: ["Video Endoscope Tower", "O2 Blender", "Suction Unit", "Smart Vital Monitor"]
    },
    {
      id: "ROOM-405",
      name: "Surgical Prep & Recovery Bed 405",
      department: "Orthopedics",
      floor: "Floor 4 - Surgical Day Care",
      status: "Occupied",
      currentPatient: "Sarah Jenkins",
      mrn: "MRN-90218",
      patientId: "PAT-89205",
      assignedDoctor: "Dr. Julian Reyes",
      admittedAt: "Today, 09:15 AM",
      condition: "Right knee meniscus arthroscopy prepped, EDI 278 approved",
      sanitizationStatus: "Surgical Prep Certified Level 3",
      vitals: { bp: "116/74", hr: "70 bpm", o2: "100%", temp: "98.5°F" },
      equipment: ["Surgical Telemetry", "Cold Compression Cryo-Cuff", "Pulse Oximeter"]
    },
    {
      id: "ROOM-210",
      name: "Neurology Diagnostic Suite 210",
      department: "Neurology",
      floor: "Floor 2 - Neurosciences",
      status: "Occupied",
      currentPatient: "David K. Miller",
      mrn: "MRN-90217",
      patientId: "PAT-89204",
      assignedDoctor: "Dr. Marcus Vance",
      admittedAt: "Yesterday, 04:00 PM",
      condition: "Neuromuscular stroke rehab & cranial nerve evaluation",
      sanitizationStatus: "Sterile & Hospital Grade Inspected",
      vitals: { bp: "138/88", hr: "76 bpm", o2: "97%", temp: "98.7°F" },
      equipment: ["EEG Telemetry Cart", "EMG Diagnostic System", "Bedside Ultrasound"]
    },
    {
      id: "ROOM-104",
      name: "Pediatric Care Room 104",
      department: "Pediatrics",
      floor: "Floor 1 - Children's Wing",
      status: "Occupied",
      currentPatient: "Leo Martinez",
      mrn: "MRN-90220",
      patientId: "PAT-89207",
      assignedDoctor: "Dr. Sophia Patel",
      admittedAt: "Today, 10:00 AM",
      condition: "Pediatric bronchial airway monitoring & nebulizer treatment",
      sanitizationStatus: "Pediatric Clean Room Standard ISO-7",
      vitals: { bp: "98/62", hr: "95 bpm", o2: "98%", temp: "99.1°F" },
      equipment: ["Pediatric Oximetry", "Aerosolized Nebulizer", "Smart Bed Scale"]
    },
    {
      id: "ROOM-101",
      name: "Emergency Trauma Bay 1",
      department: "Emergency Medicine",
      floor: "Floor 1 - Acute Triage ER",
      status: "Occupied",
      currentPatient: "Michael A. Torres",
      mrn: "MRN-90219",
      patientId: "PAT-89206",
      assignedDoctor: "Dr. Elena Rostova",
      admittedAt: "Today, 06:15 AM",
      condition: "Acute blunt chest trauma intake, stabilized under telemetry",
      sanitizationStatus: "Level-1 Trauma Rapid Sterile Protocol",
      vitals: { bp: "128/82", hr: "84 bpm", o2: "96%", temp: "98.8°F" },
      equipment: ["Rapid Blood Infuser", "Crash Cart 01", "Transport Ventilator", "FAST Ultrasound"]
    },
    {
      id: "ROOM-201",
      name: "Oncology & Infusion Bay 3",
      department: "Oncology & Infusion",
      floor: "Floor 2 - Outpatient Infusion",
      status: "Occupied",
      currentPatient: "Maria Gonzalez",
      mrn: "MRN-90216",
      patientId: "PAT-89203",
      assignedDoctor: "Dr. Eleanor Hayes",
      admittedAt: "Today, 08:00 AM",
      condition: "Biologics monoclonal antibody infusion protocol cycle 4",
      sanitizationStatus: "Sterile Cleanroom Standard Verified",
      vitals: { bp: "114/72", hr: "74 bpm", o2: "99%", temp: "98.2°F" },
      equipment: ["Dual Alaris Infusion Pump", "Comfort Recliner", "Vital Sign Beacon"]
    },
    {
      id: "ROOM-302",
      name: "Cardiology Consult Suite 302",
      department: "Cardiology",
      floor: "Floor 3 - West Wing",
      status: "Available",
      currentPatient: "None",
      mrn: "-",
      patientId: null,
      assignedDoctor: "Dr. Alistair Finch",
      admittedAt: "-",
      condition: "Sanitized & pre-stocked for cardiac admissions",
      sanitizationStatus: "Sanitized & Sterilized (09:30 AM)",
      vitals: null,
      equipment: ["12-Lead ECG", "Automated BP Cuff", "Wall Ophthalmoscope"]
    },
    {
      id: "ROOM-501",
      name: "Orthopedics Consult Suite 501",
      department: "Orthopedics",
      floor: "Floor 5 - Musculoskeletal Center",
      status: "Available",
      currentPatient: "None",
      mrn: "-",
      patientId: null,
      assignedDoctor: "Dr. Julian Reyes",
      admittedAt: "-",
      condition: "Ready for joint evaluations and post-op casting",
      sanitizationStatus: "Cleaned & Inspected (09:45 AM)",
      vitals: null,
      equipment: ["Digital PACS X-Ray Viewer", "Cast Cutter", "Goniometer System"]
    },
    {
      id: "ROOM-102",
      name: "Emergency Resuscitation Bay 2",
      department: "Emergency Medicine",
      floor: "Floor 1 - Acute Triage ER",
      status: "Available",
      currentPatient: "None",
      mrn: "-",
      patientId: null,
      assignedDoctor: "Dr. Elena Rostova",
      admittedAt: "-",
      condition: "Stat Code Blue & emergency walk-in ready",
      sanitizationStatus: "Sterilized & Restocked (Just now)",
      vitals: null,
      equipment: ["Crash Cart 02", "Biphasic Defibrillator", "Difficult Airway Cart"]
    },
    {
      id: "ROOM-204",
      name: "Internal Medicine Telemetry 204",
      department: "Internal Medicine",
      floor: "Floor 2 - East Wing",
      status: "Available",
      currentPatient: "None",
      mrn: "-",
      patientId: null,
      assignedDoctor: "Dr. Alistair Finch",
      admittedAt: "-",
      condition: "Available for inpatient acute step-down intake",
      sanitizationStatus: "Deep Terminal Cleaned (10:15 AM)",
      vitals: null,
      equipment: ["Central Telemetry Transmitter", "Smart Bed Scale", "Suction Unit"]
    },
    {
      id: "ROOM-415",
      name: "Endoscopy Procedure Suite 415",
      department: "Gastroenterology",
      floor: "Floor 4 - Endoscopy Pavilion",
      status: "Maintenance",
      currentPatient: "None (Cycle Active)",
      mrn: "-",
      patientId: null,
      assignedDoctor: "Dr. Eleanor Hayes",
      admittedAt: "-",
      condition: "Undergoing routine HEPA autoclave decontamination",
      sanitizationStatus: "In HEPA Decontamination Cycle (Est. 20 min)",
      vitals: null,
      equipment: ["Steris Autoclave Unit", "Negative Pressure Ventilation"]
    }
  ],

  // AI Autonomous Audit Log
  auditLogs: [
    {
      id: "LOG-9901",
      timestamp: "10:14 AM",
      agentAction: "Rescheduled appointment APT-1004",
      userTarget: "David K. Miller",
      rbacPolicy: "Auto-permitted (Front Desk Policy #4B)",
      result: "Calendar slot verified, patient notified via SMS",
      status: "SUCCESS"
    },
    {
      id: "LOG-9902",
      timestamp: "09:48 AM",
      agentAction: "Verified Prior Auth PA-77291 for Cigna",
      userTarget: "Sarah Jenkins",
      rbacPolicy: "Admin Tier-1 Approved",
      result: "EDI 278 status: APPROVED. Co-pay $75.00",
      status: "SUCCESS"
    },
    {
      id: "LOG-9903",
      timestamp: "09:15 AM",
      agentAction: "Parsed medical referral DOC-REF-001 with OCR",
      userTarget: "Jane L. Smith",
      rbacPolicy: "Clinical Data Ingestion Policy",
      result: "Extracted ICD-10 R10.9, auto-assigned to Dr. Eleanor Hayes",
      status: "SUCCESS"
    }
  ]
};

// Global helper to persist in window
window.AppData = AppData;
