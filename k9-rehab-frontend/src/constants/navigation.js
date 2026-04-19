import {
  FiBookOpen, FiClipboard, FiSettings,
  FiBarChart2, FiHeart, FiCpu, FiUsers, FiFileText, FiBook, FiActivity, FiEdit3,
} from "react-icons/fi";

const NAV = [
  { id: "dashboard",  label: "Dashboard",            icon: FiBarChart2,  desc: "Clinical dashboard" },
  { id: "clients",    label: "Patients",             icon: FiUsers,      desc: "Patient management" },
  { id: "exercises",  label: "Exercise Library",     icon: FiBookOpen,   desc: "260 evidence-based exercises" },
  { id: "sessions",   label: "SOAP Notes",           icon: FiClipboard,  desc: "SOAP notes & outcomes" },
  { id: "beau",       label: "Ask B.E.A.U.",          icon: FiCpu,        desc: "Biomedical Evidence-Based Analytical Unit" },
  { id: "helsinki",   label: "Helsinki Index",       icon: FiEdit3,      desc: "Chronic pain questionnaire (print for client)" },
  { id: "beau-metrics", label: "PetCare Nutrition",  icon: FiActivity,   desc: "AI nutrition & rehab protocols" },
  { id: "docs",       label: "Reference",            icon: FiBook,       desc: "Clinical reference" },
  { id: "settings",   label: "Settings",            icon: FiSettings,   desc: "Configuration" },
  { id: "about",      label: "About",               icon: FiHeart,      desc: "Platform & methodology" },
];

export default NAV;
