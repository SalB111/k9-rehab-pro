import {
  FiBookOpen, FiClipboard, FiSettings,
  FiBarChart2, FiHeart, FiCpu, FiUsers,
} from "react-icons/fi";

const NAV = [
  { id: "dashboard",  label: "Dashboard",           icon: FiBarChart2,  desc: "Clinical analytics" },
  { id: "clients",    label: "Patients",             icon: FiUsers,      desc: "Patient management" },
  { id: "exercises",  label: "Exercise Library",     icon: FiBookOpen,   desc: "260 evidence-based exercises" },
  { id: "sessions",   label: "SOAP Notes",           icon: FiClipboard,  desc: "SOAP notes & outcomes" },
  { id: "vetai",      label: "B.E.A.U.",             icon: FiCpu,        desc: "Biomedical Evidence-Based Assessment Utility" },
  { id: "settings",   label: "Settings",            icon: FiSettings,   desc: "Configuration" },
  { id: "about",      label: "About",               icon: FiHeart,      desc: "Platform & methodology" },
];

export default NAV;
