// Media registry: every video / photo the UI can show. Files live in /public (self-hosted, relative paths, works offline and in standalone/).
// A missing or broken file NEVER breaks the page: the UI falls back to the poster, then to a navy-to-teal gradient with the label.
// Drop real footage with the exact file names below (see public/videos/README.txt). Set `credit` (e.g. "Pexels") once a licence needs one: the footer prints every non-empty credit.
// Your original Mixkit hospital clips (free licence) stay as a LAST-RESORT online fallback: each slot tries its self-hosted ./videos file first, then these. Self-host them (see public/videos/README.txt) to work fully offline.
const MX = "https://assets.mixkit.co/videos/";
const HALL = {
    alt: [MX + "4745/4745-720.mp4", MX + "4745/4745-360.mp4"],
    altPoster: MX + "4745/4745-thumb-360-0.jpg",
  },
  DESK = {
    alt: [MX + "4766/4766-720.mp4", MX + "4766/4766-360.mp4"],
    altPoster: MX + "4766/4766-thumb-720-0.jpg",
  };
const V = (name, label, r, dir = "journey/") => ({
  mp4: `./videos/${dir}${name}.mp4`,
  webm: `./videos/${dir}${name}.webm`,
  poster: `./images/posters/${name}.jpg`,
  label,
  credit: r ? "Mixkit" : "",
  ...r,
});
const P = (file, label, credit = "") => ({
  mp4: "",
  webm: "",
  poster: `./images/${file}.webp`,
  label,
  credit,
}); // photo only (add mp4/webm here to turn a page hero into a looping video)
export const hero = V(
  "hero",
  "Doctor walking down a hospital hallway",
  HALL,
  "",
);
export const journey = [
  V("01-find-hospital", "Hospital footage: finding a hospital", HALL),
  V("02-choose-doctor", "Hospital footage: choosing a doctor", HALL),
  V("03-book-slot", "Hospital footage: reception and booking", DESK),
  V("04-check-in", "Hospital footage: front desk check-in", DESK),
  V("05-consultation", "Hospital footage: doctor consultation", HALL),
  V("06-laboratory", "Hospital footage: diagnostics and laboratory", HALL),
  V("07-ward-care", "Hospital footage: treatment and ward care", HALL),
  V("08-pharmacy-billing", "Hospital footage: pharmacy and billing", DESK),
  V("09-follow-up", "Hospital footage: follow-up and records", HALL),
];
export const workspace = [
  V("front-desk", "Clinic staff at a hospital reception", DESK, "workspace/"),
  V(
    "clinical-team",
    "Clinical team in a hospital corridor",
    HALL,
    "workspace/",
  ),
  V(
    "administration",
    "Hospital staff at the reception office",
    DESK,
    "workspace/",
  ),
];
export const pages = {
  hospitals: P("pages/hospitals", "Hospital building exterior"),
  doctors: P("pages/doctors", "Doctor with a patient"),
  services: P("pages/services", "Clinical team at work"),
  howItWorks: P("pages/how-it-works", "Patient and reception staff"),
  about: P("pages/about", "Hospital team"),
  contact: P("pages/contact", "Hospital reception"),
};
// Role clips reuse the journey / workspace files, so a handful of videos covers every dashboard. Point a role at its own file to override.
const [find, doc, book, checkin, consult, lab, ward, pharm, follow] = journey,
  [desk, clinical, admin] = workspace;
export const roles = {
  super_admin: admin,
  hospital_admin: admin,
  management: admin,
  doctor: consult,
  nurse: ward,
  receptionist: desk,
  pharmacist: pharm,
  lab_tech: lab,
  accountant: pharm,
  hr_manager: admin,
  inventory_manager: pharm,
  patient: desk,
};
// Extra real photographs (all .webp, under 200 KB): hospital exteriors rotate by hospital index.
export const photos = {
  hospitals: ["exterior-1", "exterior-2", "exterior-3", "exterior-4"].map(
    (n, i) => ({
      src: `./images/hospitals/${n}.webp`,
      alt: "Hospital building exterior " + (i + 1),
    }),
  ),
  team: { src: "./images/about-team.webp", alt: "Hospital care team" },
  reception: {
    src: "./images/contact-reception.webp",
    alt: "Hospital reception desk",
  },
  timeline: [
    {
      src: "./images/timeline-patient.webp",
      alt: "Patient booking an appointment",
    },
    { src: "./images/timeline-hospital.webp", alt: "Hospital staff at work" },
    {
      src: "./images/timeline-platform.webp",
      alt: "Operations team monitoring the platform",
    },
  ],
  empty: {
    appointments: {
      src: "./images/empty-appointments.webp",
      alt: "Clinic reception waiting area",
    },
  },
};
export const credits = () => [
  ...new Set(
    [hero, ...journey, ...workspace, ...Object.values(pages)]
      .map((m) => m.credit)
      .filter(Boolean),
  ),
];
