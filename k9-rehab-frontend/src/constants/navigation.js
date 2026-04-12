import {
  FiBookOpen, FiClipboard, FiSettings,
  FiBarChart2, FiHeart, FiCpu, FiUsers, FiFileText, FiBook,
} from "react-icons/fi";

// Caduceus icon for Ask B.E.A.U. — matches the sidebar logo
const CaduceusIcon = ({ className, ...props }) => (
  <img src="/rod-logo.png" alt="" className={className} style={{ width: 18, height: 18, objectFit: "contain", filter: "brightness(1.3) drop-shadow(0 0 4px rgba(14,165,233,0.4))" }} {...props} />
);

const NAV = [
  { id: "dashboard",  label: "Dashboard",            icon: FiBarChart2,  desc: "Clinical dashboard" },
  { id: "clients",    label: "Patients",             icon: FiUsers,      desc: "Patient management" },
  { id: "exercises",  label: "Exercise Library",     icon: FiBookOpen,   desc: "260 evidence-based exercises" },
  { id: "sessions",   label: "SOAP Notes",           icon: FiClipboard,  desc: "SOAP notes & outcomes" },
  { id: "beau",       label: "Ask B.E.A.U.",          icon: CaduceusIcon, desc: "Biomedical Evidence-Based Analytical Unit" },
  { id: "docs",       label: "Reference",            icon: FiBook,       desc: "Clinical reference" },
  { id: "settings",   label: "Settings",            icon: FiSettings,   desc: "Configuration" },
  { id: "about",      label: "About",               icon: FiHeart,      desc: "Platform & methodology" },
];

export default NAV;
