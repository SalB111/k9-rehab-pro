import {
  FiActivity, FiBookOpen, FiClipboard, FiSettings,
  FiBarChart2, FiHeart, FiCpu,
} from "react-icons/fi";
import { TbDog } from "react-icons/tb";

const NAV = [
  { id: "dashboard",  label: "Dashboard",           icon: FiBarChart2,  desc: "Clinical analytics" },
  { id: "generator",  label: "Diagnostics Workup",  icon: FiActivity,   desc: "Intake & protocol generation" },
  { id: "exercises",  label: "Exercise Library",     icon: FiBookOpen,   desc: "179 evidence-based exercises" },
  { id: "clients",    label: "Patient Records",     icon: TbDog,        desc: "Patient database" },
  { id: "sessions",   label: "SOAP",                icon: FiClipboard,  desc: "SOAP notes & outcomes" },
  { id: "vetai",      label: "Ask Beau",             icon: FiCpu,        desc: "AI clinical assistant" },
  { id: "settings",   label: "Settings",            icon: FiSettings,   desc: "Configuration" },
  { id: "about",      label: "About",               icon: FiHeart,      desc: "Platform & methodology" },
];

export default NAV;
