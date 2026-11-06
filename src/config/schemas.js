// Form/workflow schema per table module. status = allowed workflow states, select = dropdown columns, num = numeric columns,
// manualKey = first column is typed by the user (otherwise auto-generated from prefix), readOnly = no create/edit/delete.
const SH = ["Day", "Night", "Off", "Leave"];
export const SCHEMAS = {
  patients: {
    prefix: "P-",
    status: ["Active", "Admitted", "Discharged"],
    select: { Ward: ["OPD", "ICU", "Paeds", "General"] },
    num: ["Age"],
  },
  appointments: {
    prefix: "APT-",
    status: [
      "Pending",
      "Confirmed",
      "Checked-in",
      "In progress",
      "Completed",
      "Cancelled",
      "No-show",
      "Rejected",
    ],
    type: { Date: "date", Time: "time" },
  },
  beds: {
    prefix: "BED-",
    status: ["Available", "Occupied", "Cleaning"],
    select: { Ward: ["ICU", "Paeds", "General"] },
  },
  consultations: { prefix: "C-", status: ["In progress", "Completed"] },
  prescriptions: {
    prefix: "RX-",
    status: ["Pending", "Dispensed"],
    num: ["Items"],
  },
  pharmacy: {
    prefix: "RX-",
    status: ["Pending", "Dispensed"],
    num: ["Items"],
    select: { "Stock check": ["All available", "Low stock", "Out of stock"] },
  },
  labOrders: {
    prefix: "LB-",
    status: ["Sample collected", "Processing", "Completed"],
    select: { Priority: ["Routine", "Urgent"] },
  },
  billing: {
    prefix: "INV-",
    status: ["Pending", "Paid", "Overdue"],
    select: { Payer: ["Self", "Insurance"] },
  },
  claims: { prefix: "CL-", status: ["Submitted", "Approved", "Rejected"] },
  hr: {
    prefix: "E-",
    status: ["Active", "On leave"],
    select: {
      Department: [
        "Cardiology",
        "ICU",
        "Front desk",
        "Stores",
        "Pharmacy",
        "Laboratory",
        "Admin",
      ],
    },
  },
  roster: {
    manualKey: true,
    status: ["Draft", "Published"],
    select: { Mon: SH, Tue: SH, Wed: SH },
  },
  inventory: {
    prefix: "SKU-",
    status: ["In stock", "Low stock"],
    num: ["Stock", "Reorder level"],
  },
  procurement: {
    prefix: "PO-",
    status: ["Pending approval", "Approved", "Delivered"],
    num: ["Items"],
  },
  reports: { manualKey: true, status: ["Ready", "Scheduled"] },
  users: {
    manualKey: true,
    status: ["Active", "Suspended"],
    select: { MFA: ["Enabled", "Pending"] },
  },
  departments: { prefix: "DEP-", status: ["Active", "Inactive"] },
  doctors: {
    prefix: "D-",
    status: ["Active", "Inactive"],
    num: ["Fee (₹)"],
    select: {
      Days: ["Mon-Fri", "Mon-Sat", "Mon,Wed,Fri", "Tue,Thu,Sat", "Sat-Sun"],
      Hours: ["09:00-13:00", "09:00-17:00", "14:00-18:00", "10:00-16:00"],
    },
  },
  audit: { readOnly: true },
  platformAudit: { readOnly: true },
};
