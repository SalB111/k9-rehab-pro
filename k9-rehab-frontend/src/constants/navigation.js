import {
  FiBookOpen, FiClipboard, FiSettings,
  FiBarChart2, FiHeart, FiCpu, FiFileText,
} from "react-icons/fi";

const NAV = [
  { id: "generator",  label: "Generator",           icon: FiFileText,   desc: "Protocol generator" },
  { id: "dashboard",  label: "Dashboard",           icon: FiBarChart2,  desc: "Clinical analytics" },
  { id: "exercises",  label: "Exercise Library",     icon: FiBookOpen,   desc: "223 evidence-based exercises" },
  { id: "sessions",   label: "SOAP",                icon: FiClipboard,  desc: "SOAP notes & outcomes" },
  { id: "vetai",      label: "Ask Beau",             icon: FiCpu,        desc: "AI clinical assistant" },
  { id: "settings",   label: "Settings",            icon: FiSettings,   desc: "Configuration" },
  { id: "about",      label: "About",               icon: FiHeart,      desc: "Platform & methodology" },
];

export default NAV;
