// Role registry: layout, accent, module access (r|rw). Key order = sidebar order. Backend returns the same shape via /me.
const R=(label,layout,accent,access)=>({label,layout,accent,access:{dashboard:"r",...access,notifications:"rw",profile:"rw"}});
export const ROLES={
 super_admin:R("Platform Owner","platform","#4f46e5",{registrations:"rw",tenants:"rw",plans:"rw",demoRequests:"rw",outbox:"r",platformAudit:"r"}),
 hospital_admin:R("Hospital Administrator","executive","#0369a1",{setup:"rw",departments:"rw",doctors:"rw",patients:"rw",appointments:"rw",beds:"rw",users:"rw",hr:"r",billing:"r",inventory:"r",reports:"r",ai:"r",automation:"rw",audit:"r",subscription:"rw"}),
 management:R("Hospital Manager","executive","#7c3aed",{departments:"r",doctors:"r",reports:"r",billing:"r",beds:"r",appointments:"r",hr:"r",users:"r",ai:"r",audit:"r",subscription:"r"}),
 accountant:R("Billing Staff","executive","#047857",{billing:"rw",claims:"rw",reports:"r",procurement:"r"}),
 hr_manager:R("HR Manager","executive","#be185d",{hr:"rw",roster:"rw",users:"r",reports:"r"}),
 doctor:R("Doctor","clinical","#0f766e",{doctors:"r",patients:"rw",appointments:"rw",consultations:"rw",prescriptions:"rw",labOrders:"rw",beds:"r",ai:"r"}),
 nurse:R("Nurse","clinical","#0891b2",{patients:"r",beds:"rw",consultations:"r",prescriptions:"r",labOrders:"r",roster:"r"}),
 pharmacist:R("Pharmacist","clinical","#16a34a",{prescriptions:"r",pharmacy:"rw",inventory:"r"}),
 lab_tech:R("Laboratory Staff","clinical","#a16207",{labOrders:"rw",patients:"r"}),
 receptionist:R("Receptionist","front","#ea580c",{doctors:"r",patients:"rw",appointments:"rw",billing:"r",beds:"r"}),
 inventory_manager:R("Inventory Manager","front","#9333ea",{inventory:"rw",procurement:"rw",pharmacy:"r",reports:"r"}),
 patient:R("Patient","front","#2563eb",{myAppointments:"rw"})};
export const STAFF_ROLES=["management","doctor","nurse","receptionist","pharmacist","lab_tech","accountant","hr_manager","inventory_manager"];
