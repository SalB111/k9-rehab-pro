import {
  FiBookOpen, FiClipboard, FiSettings,
  FiBarChart2, FiHeart, FiCpu, FiUsers, FiFileText, FiBook,
} from "react-icons/fi";

const NAV = [
  { id: "dashboard",  label: "Dashboard",            icon: FiBarChart2,  desc: "Clinical dashboard" },
  { id: "clients",    label: "Patients",             icon: FiUsers,      desc: "Patient management" },
  { id: "exercises",  label: "Exercise Library",     icon: FiBookOpen,   desc: "260 evidence-based exercises" },
  { id: "sessions",   label: "SOAP Notes",           icon: FiClipboard,  desc: "SOAP notes & outcomes" },
  { id: "beau",       label: "B.E.A.U.",             icon: FiCpu,        desc: "Biomedical Evidence-Based Analytical Unit" },
  { id: "docs",       label: "Reference",            icon: FiBook,       desc: "Clinical reference" },
  { id: "settings",   label: "Settings",            icon: FiSettings,   desc: "Configuration" },
  { id: "about",      label: "About",               icon: FiHeart,      desc: "Platform & methodology" },
];

export default NAV;
