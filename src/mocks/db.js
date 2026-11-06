// Synthetic data only.
const T = (cols, rows) => ({ cols, rows });
export const DB = {
  tenantMapUnused: {
    citycare: {
      slug: "citycare",
      name: "CityCare Hospitals",
      plan: "enterprise",
      city: "Bengaluru",
    },
    sunrise: {
      slug: "sunrise",
      name: "Sunrise Clinic",
      plan: "starter",
      city: "Pune",
    },
  },
  accounts: [
    ["admin@medcore.io", "Aarav Mehta", "super_admin", null],
    ["admin@citycare.com", "Neha Kapoor", "hospital_admin", "citycare"],
    ["ceo@citycare.com", "Rajiv Menon", "management", "citycare"],
    ["doctor@citycare.com", "Dr. Asha Rao", "doctor", "citycare"],
    ["nurse@citycare.com", "Maya Thomas", "nurse", "citycare"],
    ["reception@citycare.com", "Pooja Nair", "receptionist", "citycare"],
    ["pharmacy@citycare.com", "Imran Qureshi", "pharmacist", "citycare"],
    ["lab@citycare.com", "Divya Joshi", "lab_tech", "citycare"],
    ["accounts@citycare.com", "Suresh Iyer", "accountant", "citycare"],
    ["hr@citycare.com", "Kavita Rao", "hr_manager", "citycare"],
    ["stores@citycare.com", "Manoj Verma", "inventory_manager", "citycare"],
    ["patient@citycare.com", "Priya Sharma", "patient", null],
    ["admin@sunrise.com", "Dr. Anil Kulkarni", "hospital_admin", "sunrise"],
  ].map(([email, name, role, tenant]) => ({
    email,
    name,
    role,
    tenant,
    password: "Demo@123",
  })),
  patients: T(
    ["ID", "Name", "Age", "Ward", "Status"],
    [
      ["P-1001", "Priya Sharma", 34, "OPD", "Active"],
      ["P-1002", "Ravi Kumar", 58, "ICU", "Admitted"],
      ["P-1003", "Anita Roy", 41, "OPD", "Active"],
      ["P-1004", "Sam Joseph", 9, "Paeds", "Admitted"],
      ["P-1005", "Neha Gupta", 27, "OPD", "Discharged"],
    ],
  ),
  appointments: T(
    ["Ref", "Patient", "Doctor", "Time", "Status"],
    [
      ["APT-501", "Priya Sharma", "Dr. Asha Rao", "09:30", "Confirmed"],
      ["APT-502", "Anita Roy", "Dr. Kavya Iyer", "10:00", "Pending"],
      ["APT-503", "Ravi Kumar", "Dr. Asha Rao", "11:15", "Completed"],
      ["APT-504", "Neha Gupta", "Dr. Sana Khan", "14:00", "Cancelled"],
    ],
  ),
  beds: T(
    ["Bed", "Ward", "Patient", "Nurse", "Status"],
    [
      ["ICU-01", "ICU", "Ravi Kumar", "Maya T.", "Occupied"],
      ["ICU-02", "ICU", "—", "—", "Available"],
      ["PD-04", "Paeds", "Sam Joseph", "Joy K.", "Occupied"],
      ["GW-12", "General", "—", "—", "Cleaning"],
    ],
  ),
  consultations: T(
    ["ID", "Patient", "Doctor", "Summary", "Status"],
    [
      ["C-301", "Ravi Kumar", "Dr. Asha Rao", "Cardiac review", "Completed"],
      [
        "C-302",
        "Priya Sharma",
        "Dr. Asha Rao",
        "Routine check-up",
        "In progress",
      ],
    ],
  ),
  prescriptions: T(
    ["Rx", "Patient", "Doctor", "Items", "Status"],
    [
      ["RX-71", "Ravi Kumar", "Dr. Asha Rao", 3, "Pending"],
      ["RX-72", "Priya Sharma", "Dr. Asha Rao", 2, "Dispensed"],
      ["RX-73", "Sam Joseph", "Dr. Rohan Mehta", 1, "Pending"],
    ],
  ),
  pharmacy: T(
    ["Rx", "Patient", "Items", "Stock check", "Status"],
    [
      ["RX-71", "Ravi Kumar", 3, "All available", "Pending"],
      ["RX-73", "Sam Joseph", 1, "Low stock", "Pending"],
      ["RX-72", "Priya Sharma", 2, "All available", "Dispensed"],
    ],
  ),
  labOrders: T(
    ["Order", "Patient", "Test", "Priority", "Status"],
    [
      ["LB-901", "Ravi Kumar", "Troponin", "Urgent", "Processing"],
      ["LB-902", "Priya Sharma", "CBC", "Routine", "Sample collected"],
      ["LB-903", "Anita Roy", "HbA1c", "Routine", "Completed"],
    ],
  ),
  billing: T(
    ["Invoice", "Patient", "Amount (₹)", "Payer", "Status"],
    [
      ["INV-8801", "Ravi Kumar", "1,24,000", "Insurance", "Pending"],
      ["INV-8802", "Priya Sharma", "1,800", "Self", "Paid"],
      ["INV-8803", "Sam Joseph", "18,500", "Insurance", "Overdue"],
    ],
  ),
  claims: T(
    ["Claim", "Patient", "Insurer", "Amount (₹)", "Status"],
    [
      ["CL-12", "Ravi Kumar", "StarCare", "1,10,000", "Submitted"],
      ["CL-13", "Sam Joseph", "MediSure", "16,000", "Rejected"],
    ],
  ),
  hr: T(
    ["Emp ID", "Name", "Role", "Department", "Status"],
    [
      ["E-001", "Dr. Asha Rao", "Doctor", "Cardiology", "Active"],
      ["E-014", "Maya Thomas", "Nurse", "ICU", "Active"],
      ["E-022", "Pooja Nair", "Receptionist", "Front desk", "On leave"],
      ["E-031", "Manoj Verma", "Inventory Manager", "Stores", "Active"],
    ],
  ),
  roster: T(
    ["Employee", "Mon", "Tue", "Wed", "Status"],
    [
      ["Maya Thomas", "Day", "Day", "Off", "Published"],
      ["Joy K.", "Night", "Night", "Night", "Published"],
      ["Pooja Nair", "Leave", "Leave", "Day", "Draft"],
    ],
  ),
  inventory: T(
    ["SKU", "Item", "Stock", "Reorder level", "Status"],
    [
      ["MED-01", "Paracetamol 500mg", 4200, 1000, "In stock"],
      ["MED-14", "Insulin glargine", 38, 50, "Low stock"],
      ["SUP-07", "Surgical gloves (M)", 120, 400, "Low stock"],
      ["MED-22", "Amoxicillin 250mg", 900, 300, "In stock"],
    ],
  ),
  procurement: T(
    ["PO", "Supplier", "Items", "Value (₹)", "Status"],
    [
      ["PO-410", "Apex Pharma", 6, "2,40,000", "Approved"],
      ["PO-411", "MediSupply Co", 3, "85,000", "Pending approval"],
      ["PO-412", "SurgiCare", 4, "1,10,000", "Delivered"],
    ],
  ),
  reports: T(
    ["Report", "Period", "Owner", "Generated", "Status"],
    [
      ["Revenue by department", "Oct 2026", "Finance", "01 Nov", "Ready"],
      ["Bed occupancy", "Oct 2026", "Operations", "01 Nov", "Ready"],
      ["Doctor utilisation", "Oct 2026", "Management", "31 Oct", "Ready"],
    ],
  ),
  users: T(
    ["Name", "Email", "Role", "MFA", "Status"],
    [
      [
        "Neha Kapoor",
        "admin@citycare.com",
        "Hospital Administrator",
        "Enabled",
        "Active",
      ],
      ["Dr. Asha Rao", "doctor@citycare.com", "Doctor", "Enabled", "Active"],
      [
        "Pooja Nair",
        "reception@citycare.com",
        "Receptionist",
        "Pending",
        "Active",
      ],
    ],
  ),
  audit: T(
    ["Time", "User", "Action", "Resource", "Status"],
    [
      ["09:12", "Dr. Asha Rao", "VIEW", "Patient P-1002", "Logged"],
      ["09:40", "Neha Kapoor", "UPDATE", "Role: Receptionist", "Logged"],
      ["10:05", "Pooja Nair", "EXPORT", "Appointments CSV", "Flagged"],
    ],
  ),
  tenants: T(
    ["Tenant", "City", "Plan", "Users", "Status"],
    [
      ["CityCare Hospitals", "Bengaluru", "Enterprise", 412, "Active"],
      ["Sunrise Clinic", "Pune", "Starter", 28, "Active"],
      ["Lotus Medical", "Delhi", "Professional", 96, "Trial"],
      ["Green Valley Hospital", "Kochi", "Professional", 150, "Suspended"],
    ],
  ),
  plans: T(
    ["Plan", "Price", "Tenants", "MRR (₹)", "Status"],
    [
      ["Starter", "₹24,999/mo", 31, "7,74,969", "Active"],
      ["Professional", "₹74,999/mo", 18, "13,49,982", "Active"],
      ["Enterprise", "Custom", 6, "22,00,000", "Active"],
    ],
  ),
  platformAudit: T(
    ["Time", "Actor", "Action", "Tenant", "Status"],
    [
      ["08:55", "Aarav Mehta", "PLAN_CHANGE", "Lotus Medical", "Logged"],
      ["09:20", "System", "SUSPEND", "Green Valley Hospital", "Logged"],
    ],
  ),
  notifications: [
    ["Critical lab result ready: Troponin (LB-901)", "critical", "2 min ago"],
    ["3 appointments awaiting confirmation", "info", "15 min ago"],
    ["Insulin glargine below reorder level", "warning", "1 hr ago"],
    ["AI: expected ICU occupancy 92% tomorrow", "ai", "2 hr ago"],
  ],
  ai: [
    [
      "No-show risk",
      "6 of tomorrow's 42 appointments have >70% no-show risk. Send reminders now.",
      "Send reminders",
      "Reception, Admin",
    ],
    [
      "Bed demand forecast",
      "ICU occupancy projected at 92% within 24h. Prepare 2 step-down beds.",
      "Open beds",
      "Admin, Nursing",
    ],
    [
      "Stock-out prediction",
      "Insulin glargine will run out in about 4 days at current usage.",
      "Create PO",
      "Inventory",
    ],
    [
      "Billing anomaly",
      "Claim CL-13 resembles 14 previously rejected claims (missing pre-auth).",
      "Review claim",
      "Accounts",
    ],
    [
      "Staffing gap",
      "ICU night shift is 1 nurse short on Wednesday.",
      "Open roster",
      "HR",
    ],
  ],
  automation: [
    [
      "Appointment reminder (24h before)",
      "SMS + app notification",
      "Appointments",
      true,
    ],
    [
      "Low-stock auto purchase request",
      "Creates draft PO at reorder level",
      "Inventory",
      true,
    ],
    [
      "Critical lab result alert",
      "Notify doctor and nurse instantly",
      "Laboratory",
      true,
    ],
    [
      "Overdue invoice follow-up",
      "Email patient after 7 days",
      "Billing",
      false,
    ],
    [
      "Discharge checklist",
      "Tasks for nurse, pharmacy, billing",
      "Admissions",
      false,
    ],
  ],
};

const dd = (n) => {
  const x = new Date();
  x.setDate(x.getDate() + n);
  return (
    x.getFullYear() +
    "-" +
    String(x.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(x.getDate()).padStart(2, "0")
  );
};
DB.appointments = T(
  ["Ref", "Patient", "Doctor", "Date", "Time", "Status", "Contact"],
  [
    [
      "APT-501",
      "Priya Sharma",
      "Dr. Asha Rao",
      dd(2),
      "09:30",
      "Confirmed",
      "patient@citycare.com",
    ],
    [
      "APT-502",
      "Anita Roy",
      "Dr. Kavya Iyer",
      dd(1),
      "10:00",
      "Pending",
      "anita@example.com",
    ],
    [
      "APT-503",
      "Ravi Kumar",
      "Dr. Asha Rao",
      dd(-1),
      "11:00",
      "Completed",
      "ravi@example.com",
    ],
    [
      "APT-504",
      "Neha Gupta",
      "Dr. Rohan Mehta",
      dd(3),
      "14:00",
      "Cancelled",
      "neha@example.com",
    ],
  ],
);
const DC = ["Code", "Department", "Head", "Status"],
  DR = [
    "ID",
    "Name",
    "Department",
    "Qualification",
    "Fee (₹)",
    "Days",
    "Hours",
    "Status",
  ];
DB.departments = T(DC, [
  ["DEP-1", "Cardiology", "Dr. Asha Rao", "Active"],
  ["DEP-2", "Orthopaedics", "Dr. Meera Nair", "Active"],
  ["DEP-3", "Neurology", "Dr. Kavya Iyer", "Active"],
  ["DEP-4", "Paediatrics", "Dr. Rohan Mehta", "Active"],
]);
DB.doctors = T(DR, [
  [
    "D-1",
    "Dr. Asha Rao",
    "Cardiology",
    "MBBS, MD (Cardiology)",
    600,
    "Mon-Sat",
    "09:00-13:00",
    "Active",
  ],
  [
    "D-2",
    "Dr. Meera Nair",
    "Orthopaedics",
    "MBBS, MS (Orthopaedics)",
    550,
    "Mon-Fri",
    "14:00-18:00",
    "Active",
  ],
  [
    "D-3",
    "Dr. Kavya Iyer",
    "Neurology",
    "MBBS, DM (Neurology)",
    700,
    "Tue,Thu,Sat",
    "09:00-13:00",
    "Active",
  ],
  [
    "D-4",
    "Dr. Rohan Mehta",
    "Paediatrics",
    "MBBS, MD (Paediatrics)",
    400,
    "Mon-Fri",
    "09:00-17:00",
    "Active",
  ],
]);
export const SUN = {
  departments: T(DC, [
    ["DEP-1", "General Medicine", "Dr. Anil Kulkarni", "Active"],
  ]),
  doctors: T(DR, [
    [
      "D-1",
      "Dr. Anil Kulkarni",
      "General Medicine",
      "MBBS, MD",
      400,
      "Mon-Sat",
      "09:00-13:00",
      "Active",
    ],
  ]),
};
