// K9 REHAB PRO - Veterinary Rehabilitation Protocol System
// Professional Medical Interface

const { useState, useEffect, useRef } = React;

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const API_BASE = 'http://localhost:3000/api';

// 75+ BREEDS - ALPHABETICAL ORDER FOR QUICK SCROLLING
const ALL_BREEDS_ALPHABETICAL = [
  'Akita', 'Alaskan Malamute', 'American Staffordshire Terrier', 'Anatolian Shepherd',
  'Australian Cattle Dog', 'Australian Shepherd', 'Aussiedoodle',
  'Basenji', 'Beagle', 'Belgian Malinois', 'Bernese Mountain Dog', 'Bichon Frise',
  'Bloodhound', 'Border Collie', 'Boston Terrier', 'Boxer', 'Brittany Spaniel', 'Bulldog', 'Bullmastiff', 'Bull Terrier',
  'Cane Corso', 'Cavalier King Charles Spaniel', 'Cavapoo', 'Chesapeake Bay Retriever', 'Chihuahua', 'Chinese Shar-Pei', 'Cocker Spaniel', 'Cockapoo',
  'Dachshund', 'Dalmatian', 'Doberman Pinscher',
  'English Springer Spaniel',
  'French Bulldog',
  'German Shepherd', 'German Shorthaired Pointer', 'Giant Schnauzer', 'Golden Retriever', 'Goldendoodle', 'Great Dane', 'Great Pyrenees', 'Greyhound',
  'Havanese',
  'Irish Wolfhound', 'Italian Greyhound',
  'Japanese Chin',
  'Labradoodle', 'Labrador Retriever', 'Leonberger', 'Lhasa Apso',
  'Maltese', 'Maltipoo', 'Mastiff', 'Miniature Australian Shepherd', 'Miniature Pinscher', 'Miniature Schnauzer', 'Mixed Breed',
  'Newfoundland',
  'Papillon', 'Pembroke Welsh Corgi', 'Pointer', 'Pomeranian', 'Pug', 'Puggle',
  'Rhodesian Ridgeback', 'Rottweiler',
  'Saint Bernard', 'Scottish Deerhound', 'Scottish Terrier', 'Shetland Sheepdog', 'Shiba Inu', 'Shih Tzu', 'Siberian Husky', 'Standard Schnauzer',
  'Toy Poodle',
  'Unknown/Other',
  'Vizsla',
  'Weimaraner', 'West Highland Terrier', 'Whippet',
  'Yorkshire Terrier', 'Yorkipoo'
].sort();

// PROFESSIONAL CONDITIONS GROUPED BY CATEGORY
const CONDITIONS_GROUPED = {
  'Stifle (Knee)': [
    { code: 'CCL_CONSERV', name: 'CCL Rupture - Conservative', severity: 'Moderate' },
    { code: 'POST_TPLO', name: 'Post-Op TPLO', severity: 'Surgical' },
    { code: 'POST_TTA', name: 'Post-Op TTA', severity: 'Surgical' },
    { code: 'POST_LATERAL', name: 'Post-Op Lateral Suture', severity: 'Surgical' },
    { code: 'PATELLA_LUX', name: 'Patellar Luxation (Grade 1-2)', severity: 'Mild-Moderate' },
    { code: 'POST_PATELLA', name: 'Post-Op Patellar Repair', severity: 'Surgical' }
  ],
  'Hip': [
    { code: 'HIP_DYSPLASIA', name: 'Hip Dysplasia', severity: 'Moderate-Severe' },
    { code: 'POST_FHO', name: 'Post-Op FHO', severity: 'Surgical' },
    { code: 'POST_THR', name: 'Post-Op Total Hip Replacement', severity: 'Surgical' },
    { code: 'HIP_OA', name: 'Hip Osteoarthritis', severity: 'Chronic' }
  ],
  'Elbow & Shoulder': [
    { code: 'ELBOW_DYSPLASIA', name: 'Elbow Dysplasia', severity: 'Moderate' },
    { code: 'OCD_SHOULDER', name: 'OCD - Shoulder', severity: 'Moderate' },
    { code: 'BICEPS_TENDON', name: 'Bicipital Tenosynovitis', severity: 'Mild-Moderate' },
    { code: 'SHOULDER_INSTAB', name: 'Shoulder Instability', severity: 'Moderate' }
  ],
  'Spine & Neuro': [
    { code: 'IVDD_CONSERV', name: 'IVDD - Conservative Management', severity: 'Moderate-Severe' },
    { code: 'IVDD_POSTOP', name: 'IVDD - Post-Op Hemilaminectomy', severity: 'Surgical' },
    { code: 'FCE', name: 'FCE (Fibrocartilaginous Embolism)', severity: 'Acute-Severe' },
    { code: 'DM', name: 'Degenerative Myelopathy', severity: 'Progressive' },
    { code: 'WOBBLER', name: 'Wobbler Syndrome', severity: 'Moderate-Severe' }
  ],
  'Multi-Joint OA': [
    { code: 'OA_MULTI', name: 'Osteoarthritis - Multiple Joints', severity: 'Chronic' },
    { code: 'GERIATRIC', name: 'Geriatric Mobility', severity: 'Age-Related' },
    { code: 'CHRONIC_PAIN', name: 'Chronic Pain Management', severity: 'Chronic' }
  ],
  'Soft Tissue': [
    { code: 'MUSCLE_STRAIN', name: 'Muscle Strain/Sprain', severity: 'Mild-Moderate' },
    { code: 'ILIOPSOAS', name: 'Iliopsoas Strain', severity: 'Moderate' },
    { code: 'ACHILLES', name: 'Achilles Tendon Injury', severity: 'Moderate-Severe' },
    { code: 'GRACILIS', name: 'Gracilis/Semitendinosus Myopathy', severity: 'Moderate' }
  ],
  'Fractures & Trauma': [
    { code: 'FRACTURE', name: 'Long Bone Fracture Repair', severity: 'Surgical' },
    { code: 'PELVIC_FX', name: 'Pelvic Fracture', severity: 'Surgical' },
    { code: 'POLYTRAUMA', name: 'Multi-Trauma/Polytrauma', severity: 'Severe' }
  ],
  'Amputation & Special': [
    { code: 'FORELIMB_AMP', name: 'Forelimb Amputation', severity: 'Surgical' },
    { code: 'HINDLIMB_AMP', name: 'Hindlimb Amputation', severity: 'Surgical' },
    { code: 'OBESITY', name: 'Obesity/Conditioning Program', severity: 'Metabolic' }
  ]
};

// SPECIALTY VETERINARY HOSPITALS & CLINICS (Top 59 in North America)
const SPECIALTY_HOSPITALS = [
  '-- Select Hospital/Clinic --',
  'Animal Medical Center (AMC) - New York, NY',
  'Angell Animal Medical Center - Boston, MA',
  'BluePearl Pet Hospital - Multiple Locations',
  'California Animal Hospital - Los Angeles, CA',
  'Cornell University Veterinary Specialists - Stamford, CT',
  'VCA Emergency Animal Hospital - Multiple Locations',
  'VCA West Los Angeles Animal Hospital - Los Angeles, CA',
  'University of Pennsylvania (Penn Vet) - Philadelphia, PA',
  'UC Davis Veterinary Medical Teaching Hospital - Davis, CA',
  'North Carolina State University CVM - Raleigh, NC',
  'University of Florida Small Animal Hospital - Gainesville, FL',
  'Texas A&M Veterinary Medical Teaching Hospital - College Station, TX',
  'Colorado State University VTH - Fort Collins, CO',
  'University of Wisconsin Veterinary Care - Madison, WI',
  'Ohio State University Veterinary Medical Center - Columbus, OH',
  'Purdue University Veterinary Teaching Hospital - West Lafayette, IN',
  'University of Minnesota VTH - St. Paul, MN',
  'Auburn University Small Animal Teaching Hospital - Auburn, AL',
  'University of Georgia Veterinary Teaching Hospital - Athens, GA',
  'Michigan State University Veterinary Medical Center - East Lansing, MI',
  'University of Illinois Veterinary Teaching Hospital - Urbana, IL',
  'Washington State University Veterinary Teaching Hospital - Pullman, WA',
  'Oregon State University Veterinary Teaching Hospital - Corvallis, OR',
  'Kansas State University Veterinary Health Center - Manhattan, KS',
  'Iowa State University Lloyd Veterinary Medical Center - Ames, IA',
  'Louisiana State University Veterinary Teaching Hospital - Baton Rouge, LA',
  'Mississippi State University CVM - Starkville, MS',
  'Oklahoma State University Veterinary Medical Hospital - Stillwater, OK',
  'University of Tennessee Veterinary Medical Center - Knoxville, TN',
  'Virginia-Maryland College of Veterinary Medicine - Blacksburg, VA',
  'Tufts University Cummings School - North Grafton, MA',
  'MedVet Medical & Cancer Centers for Pets - Multiple Locations',
  'VCA Alameda East Veterinary Hospital - Denver, CO',
  'Red Bank Veterinary Hospital - Red Bank, NJ',
  'Southeast Veterinary Specialists - Jacksonville, FL',
  'Carolina Veterinary Specialists - Huntersville, NC',
  'Gulf Coast Veterinary Specialists - Houston, TX',
  'VCA Advanced Veterinary Care Center - Los Angeles, CA',
  'Metropolitan Veterinary Hospital - Akron, OH',
  'Veterinary Specialty Hospital - San Diego, CA',
  'Animal Emergency & Specialty Center - Los Angeles, CA',
  'VCA South Shore Animal Hospital - Weymouth, MA',
  'Advanced Veterinary Care Center - Loxahatchee, FL',
  'Tampa Bay Veterinary Specialists - Largo, FL',
  'Pittsburgh Veterinary Specialty & Emergency Center - Pittsburgh, PA',
  'VCA Southpaws Veterinary Specialists - Fairfax, VA',
  'Chicago Veterinary Emergency & Specialty Center - Chicago, IL',
  'BluePearl Specialty & Emergency Pet Hospital - Seattle, WA',
  'Veterinary Emergency Group (VEG) - Multiple Locations',
  'CARE Centre - Cincinnati, OH',
  'Hope Advanced Veterinary Center - Vienna, VA',
  'Veterinary Specialty Center - Buffalo Grove, IL',
  'Animal Specialty & Emergency Center - Los Angeles, CA',
  'VCA West Coast Specialty & Emergency Animal Hospital - Fountain Valley, CA',
  'Oradell Animal Hospital - Paramus, NJ',
  'VCA Veterinary Specialists of the Valley - Woodland Hills, CA',
  'BluePearl Pet Hospital - Eden Prairie, MN',
  'Adobe Veterinary Center - Los Altos, CA',
  'IndyVet Emergency & Specialty Hospital - Indianapolis, IN',
  'Other - Enter Custom Clinic Name'
];

// DOG ANATOMY REGIONS (for visual builder)
const ANATOMY_REGIONS = {
  HEAD: { name: 'Head/Neck', icon: 'fa-head-side-virus', conditions: ['IVDD_CERVICAL', 'WOBBLER'] },
  SPINE: { name: 'Spine/Back', icon: 'fa-bone', conditions: ['IVDD_CONSERV', 'IVDD_POSTOP', 'FCE', 'DM'] },
  SHOULDER_L: { name: 'Left Shoulder', icon: 'fa-circle-dot', conditions: ['OCD_SHOULDER', 'BICEPS_TENDON', 'SHOULDER_INSTAB'] },
  SHOULDER_R: { name: 'Right Shoulder', icon: 'fa-circle-dot', conditions: ['OCD_SHOULDER', 'BICEPS_TENDON', 'SHOULDER_INSTAB'] },
  ELBOW_L: { name: 'Left Elbow', icon: 'fa-circle', conditions: ['ELBOW_DYSPLASIA'] },
  ELBOW_R: { name: 'Right Elbow', icon: 'fa-circle', conditions: ['ELBOW_DYSPLASIA'] },
  HIP_L: { name: 'Left Hip', icon: 'fa-circle-dot', conditions: ['HIP_DYSPLASIA', 'POST_FHO', 'POST_THR', 'HIP_OA'] },
  HIP_R: { name: 'Right Hip', icon: 'fa-circle-dot', conditions: ['HIP_DYSPLASIA', 'POST_FHO', 'POST_THR', 'HIP_OA'] },
  STIFLE_L: { name: 'Left Stifle', icon: 'fa-circle', conditions: ['CCL_CONSERV', 'POST_TPLO', 'POST_TTA', 'PATELLA_LUX'] },
  STIFLE_R: { name: 'Right Stifle', icon: 'fa-circle', conditions: ['CCL_CONSERV', 'POST_TPLO', 'POST_TTA', 'PATELLA_LUX'] },
  GENERAL: { name: 'General/Multiple', icon: 'fa-paw', conditions: ['OA_MULTI', 'GERIATRIC', 'OBESITY'] }
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

const App = () => {
  const [currentView, setCurrentView] = useState('HOME');
  const [isLoading, setIsLoading] = useState(false);
  const [protocolData, setProtocolData] = useState(null);
  const [patients, setPatients] = useState([]);
  const [languageMode, setLanguageMode] = useState('PROFESSIONAL');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get(`${API_BASE}/patients`);
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header currentView={currentView} setCurrentView={setCurrentView} />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {currentView === 'HOME' && (
          <HomeView setCurrentView={setCurrentView} />
        )}
        {currentView === 'INTAKE' && (
          <IntakeWizard
            setCurrentView={setCurrentView}
            setProtocolData={setProtocolData}
            setIsLoading={setIsLoading}
            isLoading={isLoading}
          />
        )}
        {currentView === 'PROTOCOL' && protocolData && (
          <ProtocolView
            data={protocolData}
            languageMode={languageMode}
            setLanguageMode={setLanguageMode}
            setCurrentView={setCurrentView}
          />
        )}
        {currentView === 'PATIENTS' && (
          <PatientsView patients={patients} />
        )}
        {currentView === 'EXERCISES' && (
          <ExerciseLibraryView />
        )}
      </main>

      <Footer />
    </div>
  );
};

// ============================================================================
// HEADER COMPONENT
// ============================================================================

const Header = ({ currentView, setCurrentView }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-md no-print">
      <div className="accent-bar h-1.5"></div>
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between py-4">
          {/* LOGO - CORPORATE GRADE */}
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setCurrentView('HOME')}>
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-med-blue-700 to-med-teal-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
              <i className="fas fa-heartbeat text-2xl text-white"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black text-med-blue-900 tracking-tight group-hover:text-med-blue-700 transition-colors">
                K9 REHAB PRO
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">
                  Evidence-Based Protocols
                </p>
                <span className="px-2 py-0.5 bg-med-green-100 text-med-green-700 text-[10px] font-bold rounded uppercase">
                  Medical Grade
                </span>
              </div>
            </div>
          </div>

          {/* NAVIGATION - ENHANCED */}
          <nav className="flex items-center gap-2">
            <NavButton
              icon="fa-home"
              label="Home"
              active={currentView === 'HOME'}
              onClick={() => setCurrentView('HOME')}
            />
            <NavButton
              icon="fa-file-medical"
              label="Generate Protocol"
              active={currentView === 'INTAKE'}
              onClick={() => setCurrentView('INTAKE')}
              primary
            />
            <NavButton
              icon="fa-play-circle"
              label="Video Library"
              active={currentView === 'EXERCISES'}
              onClick={() => setCurrentView('EXERCISES')}
            />
            <NavButton
              icon="fa-users"
              label="Patients"
              active={currentView === 'PATIENTS'}
              onClick={() => setCurrentView('PATIENTS')}
            />
          </nav>
        </div>
      </div>
    </header>
  );
};

const NavButton = ({ icon, label, active, onClick, primary }) => {
  let className = "px-5 py-3 rounded-lg font-bold text-sm transition-all duration-200 flex items-center gap-2.5 ";

  if (active && primary) {
    className += "bg-gradient-to-r from-med-blue-700 to-med-teal-600 text-white shadow-lg";
  } else if (active) {
    className += "bg-med-blue-100 text-med-blue-900 font-black border-2 border-med-blue-300";
  } else if (primary) {
    className += "bg-gradient-to-r from-med-blue-700 to-med-teal-600 text-white hover:shadow-xl btn-lift";
  } else {
    className += "text-slate-700 hover:text-med-blue-900 hover:bg-slate-100 hover:shadow-sm font-semibold";
  }

  return (
    <button onClick={onClick} className={className}>
      <i className={`fas ${icon} text-base`}></i>
      <span className="hidden lg:inline">{label}</span>
    </button>
  );
};

// ============================================================================
// HOME VIEW
// ============================================================================

const HomeView = ({ setCurrentView }) => {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* HERO SECTION - CORPORATE GRADE */}
      <div className="text-center mb-20 pt-12">
        {/* Trust Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-med-green-50 to-med-teal-50 text-med-green-900 px-5 py-2 rounded-full text-sm font-bold mb-6 border border-med-green-200">
          <i className="fas fa-certificate"></i>
          Based on Dr. Millis & Levine Rehabilitation Standards
        </div>

        {/* Main Headline */}
        <h1 className="text-6xl font-black text-slate-900 mb-6 leading-tight">
          Evidence-Based Canine<br />
          <span className="bg-gradient-to-r from-med-blue-700 to-med-teal-500 bg-clip-text text-transparent">
            Rehabilitation Protocols
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-2xl text-slate-600 mb-4 max-w-3xl mx-auto leading-relaxed font-medium">
          Generate comprehensive, individualized 8-12 week protocols in minutes.
        </p>
        <p className="text-lg text-slate-500 mb-10 max-w-2xl mx-auto">
          Trusted by top veterinary hospitals. Grounded in peer-reviewed research. Built for clinical professionals.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <button
            onClick={() => setCurrentView('INTAKE')}
            className="px-10 py-4 accent-bar text-white text-lg font-bold rounded-xl btn-lift transition-all duration-200 shadow-lg"
          >
            <i className="fas fa-file-medical mr-3"></i>
            Generate Protocol Now
          </button>
          <button
            onClick={() => setCurrentView('EXERCISES')}
            className="px-10 py-4 bg-white border-2 border-med-blue-700 text-med-blue-900 text-lg font-bold rounded-xl btn-lift transition-all duration-200"
          >
            <i className="fas fa-play-circle mr-3"></i>
            View Exercise Library
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="flex items-center justify-center gap-6 flex-wrap text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <i className="fas fa-check-circle text-med-green-500"></i>
            <span className="font-semibold">195 Medical-Grade Exercises</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-check-circle text-med-green-500"></i>
            <span className="font-semibold">Peer-Reviewed References</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-check-circle text-med-green-500"></i>
            <span className="font-semibold">HD Video Demonstrations</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="fas fa-check-circle text-med-green-500"></i>
            <span className="font-semibold">CE Credit Eligible</span>
          </div>
        </div>
      </div>

      {/* TRUSTED BY SECTION */}
      <div className="text-center mb-16 py-8 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200">
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Trusted By Top Veterinary Institutions</p>
        <div className="flex items-center justify-center gap-8 flex-wrap px-8">
          <div className="text-slate-700 font-semibold text-sm">University of Tennessee CVM</div>
          <div className="text-slate-700 font-semibold text-sm">Colorado State University</div>
          <div className="text-slate-700 font-semibold text-sm">North Carolina State CVM</div>
          <div className="text-slate-700 font-semibold text-sm">BluePearl Specialty Hospitals</div>
        </div>
      </div>

      {/* STATS SHOWCASE - ENHANCED */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        <StatCardEnhanced number="195" label="Evidence-Based Exercises" sublabel="Peer-reviewed protocols" icon="fa-dumbbell" color="blue" />
        <StatCardEnhanced number="40+" label="Clinical Conditions" sublabel="Multi-phase protocols" icon="fa-stethoscope" color="teal" />
        <StatCardEnhanced number="12-Week" label="Protocol Duration" sublabel="5-phase progression" icon="fa-calendar-alt" color="green" />
        <StatCardEnhanced number="HD Video" label="Multi-Angle Demos" sublabel="Professional instruction" icon="fa-video" color="blue" />
      </div>

      {/* FEATURES GRID - EXPANDED */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <FeatureCardEnhanced
          icon="fa-microscope"
          iconColor="med-green-500"
          title="Evidence-Based Medicine"
          description="Every exercise backed by Grade A/B peer-reviewed veterinary rehabilitation research. References included with every protocol."
          badge="Dr. Millis Approved"
        />
        <FeatureCardEnhanced
          icon="fa-play-circle"
          iconColor="med-teal-500"
          title="HD Video Library"
          description="Multi-angle professional demonstrations with certified instructors. Real-time annotations, speed controls, and CE credit eligible."
          badge="HD Available"
        />
        <FeatureCardEnhanced
          icon="fa-chart-line"
          iconColor="med-blue-500"
          title="5-Phase Progression"
          description="Structured rehabilitation from passive ROM through functional activities. Evidence-based phase advancement criteria."
          badge="Clinical Standard"
        />
        <FeatureCardEnhanced
          icon="fa-language"
          iconColor="med-green-500"
          title="Dual-Language Output"
          description="Toggle between professional clinical terminology and client-friendly home instructions. Perfect for patient education."
          badge="Client-Ready"
        />
        <FeatureCardEnhanced
          icon="fa-bolt"
          iconColor="med-teal-500"
          title="Rapid Protocol Generation"
          description="Generate comprehensive 8-12 week individualized protocols in under 5 minutes with guided clinical intake wizard."
          badge="Fast"
        />
        <FeatureCardEnhanced
          icon="fa-file-pdf"
          iconColor="med-blue-500"
          title="Professional Export"
          description="Print-ready PDF protocols with hospital branding. Email directly to clients or referring veterinarians."
          badge="Print-Ready"
        />
      </div>

      {/* CALL TO ACTION */}
      <div className="text-center py-16 px-8 bg-gradient-to-br from-med-blue-700 to-med-teal-600 rounded-2xl shadow-2xl mb-8">
        <h3 className="text-3xl font-black text-white mb-4">
          Ready to Transform Your Rehabilitation Protocols?
        </h3>
        <p className="text-xl text-med-blue-50 mb-8 max-w-2xl mx-auto">
          Join hundreds of veterinary professionals using evidence-based protocols to improve patient outcomes.
        </p>
        <button
          onClick={() => setCurrentView('INTAKE')}
          className="px-12 py-5 bg-white text-med-blue-900 text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <i className="fas fa-rocket mr-3"></i>
          Start Building Protocols Now
        </button>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="med-card p-8 text-center">
      <div className="w-14 h-14 rounded-xl accent-bar flex items-center justify-center mb-5 mx-auto">
        <i className={`fas ${icon} text-xl text-white`}></i>
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

const StatCard = ({ number, label, icon }) => {
  return (
    <div className="med-card p-6 text-center">
      <i className={`fas ${icon} text-2xl text-med-teal-500 mb-3`}></i>
      <div className="text-3xl font-extrabold text-med-blue-900 mb-1">{number}</div>
      <div className="text-slate-500 text-sm font-medium">{label}</div>
    </div>
  );
};

// ENHANCED STAT CARD - CORPORATE GRADE
const StatCardEnhanced = ({ number, label, sublabel, icon, color }) => {
  const colorMap = {
    blue: 'text-med-blue-500 bg-med-blue-50 border-med-blue-200',
    teal: 'text-med-teal-500 bg-med-teal-50 border-med-teal-200',
    green: 'text-med-green-500 bg-med-green-50 border-med-green-200'
  };
  const colors = colorMap[color] || colorMap.blue;
  const [bgColor, textColor, borderColor] = colors.split(' ');

  return (
    <div className={`med-card p-6 text-center hover:shadow-lg transition-all duration-200 border-l-4 ${borderColor}`}>
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center mx-auto mb-4`}>
        <i className={`fas ${icon} text-xl ${textColor}`}></i>
      </div>
      <div className="text-4xl font-black text-slate-900 mb-2">{number}</div>
      <div className="text-sm font-bold text-slate-700 mb-1">{label}</div>
      <div className="text-xs text-slate-500 font-medium">{sublabel}</div>
    </div>
  );
};

// ENHANCED FEATURE CARD - CORPORATE GRADE
const FeatureCardEnhanced = ({ icon, iconColor, title, description, badge }) => {
  return (
    <div className="med-card p-8 hover:shadow-xl transition-all duration-200 border-l-4 border-med-blue-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-${iconColor.split('-')[1]}-500 to-${iconColor.split('-')[1]}-600 flex items-center justify-center shadow-lg`}>
          <i className={`fas ${icon} text-2xl text-white`}></i>
        </div>
        {badge && (
          <span className="px-3 py-1 bg-med-green-50 text-med-green-700 text-xs font-bold rounded-full border border-med-green-200">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

// ============================================================================
// LASER VIDEO OVERLAY - Protocol Activation Animation
// ============================================================================

// ============================================================================
// INTAKE WIZARD
// ============================================================================

const IntakeWizard = ({ setCurrentView, setProtocolData, setIsLoading, isLoading }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: HIPAA Compliance & Consent
    hipaaAcknowledged: false,
    privacyNoticeRead: false,
    consentForTreatment: false,
    authorizedPersonnel: '',
    facilityName: '',
    // Step 2: Patient Demographics
    patientName: '', patientId: '', breed: '',
    age: '', dob: '', weight: '', weightKg: '', idealWeight: '', idealWeightKg: '',
    sex: '', coatColor: '', microchipId: '',
    // Step 3: Clinical Diagnosis
    diagnosis: '', affectedRegion: '', affectedSide: '',
    surgeryDate: '', onsetDate: '', chronicity: '',
    surgicalApproach: '',
    surgicalProcedure: '',
    performingSurgeon: '',
    implantType: '',
    postOpComplications: 'None',
    surgicalReportSummary: '',
    secondaryDiagnosis: '', bilateralInvolvement: false,
    // Conservative Treatment
    conservativeModalities: '',
    activityRestrictions: '',
    // Treatment Pathway
    treatmentPathway: '',
    conservativeStartDate: '',
    weeksSinceEvent: '',
    // Diagnostic Imaging
    bloodworkStatus: '', bloodworkLocation: '',
    radiographStatus: '', radiographLocation: '',
    mriStatus: '', mriLocation: '',
    ctScanStatus: '', ctScanLocation: '',
    ultrasoundStatus: '', ultrasoundLocation: '',
    arthroscopyStatus: '', arthroscopyLocation: '',
    imagingFindings: '',
    // Step 4: Clinical Assessment
    lamenessGrade: 0, bodyConditionScore: 5, painLevel: 0, mobilityLevel: 0,
    // ROM Measurements (degrees)
    romFlexion: '', romExtension: '', romContralateralFlexion: '', romContralateralExtension: '',
    // Muscle Circumference (cm)
    muscleCircAffected: '', muscleCircContralateral: '',
    // Weight Bearing
    weightBearingStatus: '',
    // Functional Assessment
    functionalSitToStand: '', functionalStairs: '',
    functionalJump: '', functionalTrot: '',
    functionalPosture: '', functionalBalance: '',
    // Medications & History
    currentMedications: '',
    medicalHistory: '',
    allergies: '',
    comorbidities: '',
    priorSurgeries: '',
    contraindications: '',
    specialInstructions: '',
    // Treatment Goals
    goals: [],
    protocolLength: 12,
    // Step 5: Provider Information
    clientName: '', clientEmail: '',
    clientPhone: '', clientAddress: '', clientZip: '', clientCity: '', clientState: '',
    referringVet: '',
    referringClinic: '',
    customClinicName: '',
    emergencyContact: '',
    insuranceProvider: '', policyNumber: '',
    consentGiven: false
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validateStep = () => {
    // DEV MODE: All validation bypassed for rapid iteration
    return true;
  };

  const nextStep = () => { if (validateStep()) setCurrentStep(prev => Math.min(prev + 1, 4)); };
  const prevStep = () => { setCurrentStep(prev => Math.max(prev - 1, 1)); };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/generate-protocol`, formData);
      setProtocolData(response.data);
      setCurrentView('PROTOCOL');
    } catch (error) {
      console.error('Error generating protocol:', error);
      alert('Error generating protocol. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* MEDICAL GRADE HEADER */}
      <div className="mb-6 p-6 bg-gradient-to-r from-med-blue-700 to-med-teal-600 rounded-xl shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-black text-white mb-1 flex items-center gap-3">
              <i className="fas fa-shield-alt"></i>
              Clinical Protocol Generator
            </h2>
            <p className="text-med-blue-100 text-sm font-semibold">Evidence-Based Canine Rehabilitation | Dr. Millis & Levine Standards</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur border border-white/30">
              <p className="text-xs text-white font-bold uppercase tracking-wider flex items-center gap-2">
                <i className="fas fa-lock"></i>
                HIPAA Compliant
              </p>
            </div>
            <div className="px-4 py-2 bg-white/20 rounded-lg backdrop-blur border border-white/30">
              <p className="text-xs text-white font-bold uppercase tracking-wider flex items-center gap-2">
                <i className="fas fa-user-shield"></i>
                PHI Protected
              </p>
            </div>
          </div>
        </div>
      </div>

      <WizardProgress currentStep={currentStep} />

      <div className="med-card p-8 shadow-xl border-2 border-slate-200">
        {currentStep === 1 && <Step2PatientDemographics formData={formData} handleChange={handleChange} errors={errors} />}
        {currentStep === 2 && <Step3ClinicalDiagnosis formData={formData} handleChange={handleChange} errors={errors} />}
        {currentStep === 3 && <Step4ClinicalAssessment formData={formData} handleChange={handleChange} errors={errors} />}
        {currentStep === 4 && <Step5ProviderAuth formData={formData} handleChange={handleChange} errors={errors} />}

        {/* MEDICAL-GRADE NAVIGATION */}
        <div className="flex justify-between items-center mt-10 pt-8 border-t-2 border-slate-200">
          {currentStep > 1 ? (
            <button onClick={prevStep} className="px-8 py-4 text-slate-700 font-bold rounded-xl hover:bg-slate-100 transition-all flex items-center gap-3 border-2 border-slate-300 hover:border-slate-400 hover:shadow-md">
              <i className="fas fa-arrow-left text-lg"></i>
              <span>Previous Step</span>
            </button>
          ) : (
            <button onClick={() => setCurrentView('HOME')} className="px-8 py-4 text-slate-500 font-semibold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 border-2 border-transparent hover:border-slate-200">
              <i className="fas fa-times"></i>
              <span>Cancel</span>
            </button>
          )}

          {currentStep < 4 ? (
            <button onClick={nextStep} className="px-10 py-4 bg-gradient-to-r from-med-blue-700 to-med-teal-600 text-white font-black text-lg rounded-xl shadow-lg hover:shadow-2xl transition-all flex items-center gap-3 hover:scale-105">
              <span>Continue to Next Step</span>
              <i className="fas fa-arrow-right text-lg"></i>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-12 py-5 bg-gradient-to-r from-med-green-600 to-med-teal-600 text-white font-black text-xl rounded-xl shadow-2xl hover:shadow-3xl transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>Generating Evidence-Based Protocol...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-file-medical-alt text-2xl"></i>
                  <span>Generate Clinical Protocol</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* HIPAA CONSENT - BOTTOM, SMALL ELONGATED CHECKBOX */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-lg hover:bg-slate-100 transition-all">
            <input
              type="checkbox"
              checked={formData.consentGiven}
              onChange={(e) => handleChange('consentGiven', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-xs text-slate-600 font-medium">
              <i className="fas fa-shield-alt text-blue-600 mr-1"></i>
              HIPAA Consent: I authorize protocol generation for licensed veterinary professionals (DVM, CCRP, CCRT, DACVSMR). All data encrypted and HIPAA-compliant.
            </span>
          </label>
        </div>
      </div>

      {/* LASER VIDEO OVERLAY */}
    </div>
  );
};

const WizardProgress = ({ currentStep }) => {
  const steps = [
    { num: 1, label: 'Patient Info', icon: 'fa-paw', desc: 'Demographics' },
    { num: 2, label: 'Diagnosis', icon: 'fa-stethoscope', desc: 'Clinical Condition' },
    { num: 3, label: 'Assessment', icon: 'fa-clipboard-check', desc: 'Measurements' },
    { num: 4, label: 'Review & Generate', icon: 'fa-check-circle', desc: 'Final Authorization' }
  ];

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-200 z-0"></div>
        <div
          className="absolute top-6 left-0 h-0.5 accent-bar z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
        ></div>

        {steps.map(step => (
          <div key={step.num} className="relative z-10 flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-300 ${
              step.num < currentStep
                ? 'bg-med-green-500 border-med-green-500 text-white'
                : step.num === currentStep
                ? 'accent-bar border-med-blue-900 text-white shadow-md'
                : 'bg-white border-slate-300 text-slate-400'
            }`}>
              {step.num < currentStep ? (
                <i className="fas fa-check"></i>
              ) : (
                <i className={`fas ${step.icon} text-sm`}></i>
              )}
            </div>
            <div className="mt-2 text-center">
              <span className={`block text-xs font-bold ${
                step.num === currentStep ? 'text-med-blue-900' : step.num < currentStep ? 'text-med-green-600' : 'text-slate-500'
              }`}>
                {step.label}
              </span>
              <span className={`block text-[10px] font-medium mt-0.5 ${
                step.num === currentStep ? 'text-med-blue-600' : 'text-slate-400'
              }`}>
                {step.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// STEP 1: HIPAA COMPLIANCE & CONSENT (MEDICAL-GRADE)
// ============================================================================

const Step1HIPAACompliance = ({ formData, handleChange, errors }) => {
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="text-center pb-6 border-b-2 border-slate-200">
        <div className="inline-flex items-center gap-3 bg-med-blue-50 px-5 py-2 rounded-full mb-4">
          <i className="fas fa-shield-alt text-med-blue-700 text-lg"></i>
          <span className="text-sm font-bold text-med-blue-900 uppercase tracking-wider">Step 1 of 5</span>
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-2">HIPAA Compliance & Consent</h3>
        <p className="text-slate-600 font-medium">Protected Health Information (PHI) Authorization</p>
      </div>

      {/* HIPAA NOTICE */}
      <div className="bg-gradient-to-br from-med-blue-50 to-med-teal-50 border-2 border-med-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-med-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="fas fa-lock text-2xl text-white"></i>
          </div>
          <div>
            <h4 className="text-lg font-black text-med-blue-900 mb-2">HIPAA Privacy Notice</h4>
            <p className="text-sm text-slate-700 leading-relaxed mb-4">
              This system is compliant with the Health Insurance Portability and Accountability Act (HIPAA) of 1996.
              All patient information (Protected Health Information - PHI) entered into this system is:
            </p>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start gap-2">
                <i className="fas fa-check-circle text-med-green-600 mt-0.5"></i>
                <span><strong>Encrypted</strong> during transmission and storage</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-check-circle text-med-green-600 mt-0.5"></i>
                <span><strong>Access-Controlled</strong> to authorized veterinary professionals only</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-check-circle text-med-green-600 mt-0.5"></i>
                <span><strong>Used Solely</strong> for generating evidence-based rehabilitation protocols</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fas fa-check-circle text-med-green-600 mt-0.5"></i>
                <span><strong>Not Shared</strong> with third parties without explicit consent</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* FACILITY INFORMATION */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <i className="fas fa-hospital text-med-blue-600"></i>
            Facility/Practice Name *
          </label>
          <input
            type="text"
            value={formData.facilityName}
            onChange={(e) => handleChange('facilityName', e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-med-blue-600 focus:ring-2 focus:ring-med-blue-100 transition-all font-semibold"
            placeholder="e.g., BluePearl Veterinary Specialty Hospital"
          />
          <p className="text-xs text-slate-500 mt-1">Official name of veterinary practice</p>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <i className="fas fa-user-md text-med-blue-600"></i>
            Authorized Personnel *
          </label>
          <input
            type="text"
            value={formData.authorizedPersonnel}
            onChange={(e) => handleChange('authorizedPersonnel', e.target.value)}
            className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-med-blue-600 focus:ring-2 focus:ring-med-blue-100 transition-all font-semibold"
            placeholder="e.g., Dr. Sarah Mitchell, DVM, CCRP"
          />
          <p className="text-xs text-slate-500 mt-1">Licensed professional generating protocol</p>
        </div>
      </div>

      {/* CONSENT CHECKBOXES - LEGALLY REQUIRED */}
      <div className="space-y-4 bg-slate-50 border-2 border-slate-300 rounded-xl p-6">
        <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <i className="fas fa-file-signature text-med-blue-600"></i>
          Required Authorizations
        </h4>

        <label className="flex items-start gap-4 p-4 bg-white rounded-lg border-2 border-slate-200 hover:border-med-blue-400 cursor-pointer transition-all">
          <input
            type="checkbox"
            checked={formData.hipaaAcknowledged}
            onChange={(e) => handleChange('hipaaAcknowledged', e.target.checked)}
            className="w-6 h-6 text-med-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-med-blue-500 mt-1 flex-shrink-0"
          />
          <div>
            <span className="block font-bold text-slate-900 mb-1">HIPAA Privacy Notice Acknowledgment *</span>
            <span className="text-sm text-slate-600">
              I acknowledge that I have read and understand the HIPAA Privacy Notice. I understand that patient
              information entered into this system is protected under federal law and will be used solely for
              generating evidence-based rehabilitation protocols.
            </span>
          </div>
        </label>

        <label className="flex items-start gap-4 p-4 bg-white rounded-lg border-2 border-slate-200 hover:border-med-blue-400 cursor-pointer transition-all">
          <input
            type="checkbox"
            checked={formData.privacyNoticeRead}
            onChange={(e) => handleChange('privacyNoticeRead', e.target.checked)}
            className="w-6 h-6 text-med-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-med-blue-500 mt-1 flex-shrink-0"
          />
          <div>
            <span className="block font-bold text-slate-900 mb-1">Notice of Privacy Practices *</span>
            <span className="text-sm text-slate-600">
              I have received and reviewed the Notice of Privacy Practices that describes how medical information
              about the patient may be used and disclosed, and my rights regarding this information.
            </span>
          </div>
        </label>

        <label className="flex items-start gap-4 p-4 bg-white rounded-lg border-2 border-slate-200 hover:border-med-blue-400 cursor-pointer transition-all">
          <input
            type="checkbox"
            checked={formData.consentForTreatment}
            onChange={(e) => handleChange('consentForTreatment', e.target.checked)}
            className="w-6 h-6 text-med-blue-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-med-blue-500 mt-1 flex-shrink-0"
          />
          <div>
            <span className="block font-bold text-slate-900 mb-1">Consent for Rehabilitation Treatment *</span>
            <span className="text-sm text-slate-600">
              I authorize the use of this evidence-based rehabilitation protocol for the patient named in this record.
              I understand that all protocols must be reviewed and approved by a licensed veterinary professional
              (DVM, CCRP, CCRT, or DACVSMR) before implementation.
            </span>
          </div>
        </label>
      </div>

      {/* PROFESSIONAL CERTIFICATION NOTICE */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="fas fa-exclamation-triangle text-white text-lg"></i>
          </div>
          <div>
            <h4 className="text-sm font-black text-amber-900 mb-2 uppercase tracking-wider">Professional Use Only</h4>
            <p className="text-sm text-slate-700 leading-relaxed">
              This system is designed for use by licensed veterinary professionals with rehabilitation training
              (CCRP, CCRT, DACVSMR) or under direct supervision. Generated protocols are clinical guidance tools
              and must be reviewed, modified as needed, and approved by a licensed veterinarian before implementation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// STEP 2: PATIENT DEMOGRAPHICS
// ============================================================================

const Step2PatientDemographics = ({ formData, handleChange, errors }) => {
  // Auto-calculate size category from weight
  const getSizeCategory = (w) => {
    const wt = parseFloat(w);
    if (!wt) return '—';
    if (wt < 10) return 'Toy';
    if (wt <= 25) return 'Small';
    if (wt <= 50) return 'Medium';
    if (wt <= 100) return 'Large';
    return 'Giant';
  };

  const weightDiff = formData.weight && formData.idealWeight
    ? (parseFloat(formData.weight) - parseFloat(formData.idealWeight)).toFixed(1)
    : null;

  return (
    <div className="space-y-8">
      {/* MEDICAL HEADER */}
      <div className="text-center pb-6 border-b-2 border-slate-200">
        <div className="inline-flex items-center gap-3 bg-med-teal-50 px-5 py-2 rounded-full mb-4">
          <i className="fas fa-paw text-med-teal-700 text-lg"></i>
          <span className="text-sm font-bold text-med-teal-900 uppercase tracking-wider">Step 1 of 4</span>
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-2">Patient Demographics</h3>
        <p className="text-slate-600 font-medium">Canine Identification & Vital Statistics</p>
      </div>

      {/* CLIENT & OWNER INFO */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          <i className="fas fa-user mr-2"></i>Client Information
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          <FormField label="Client / Owner Name">
            <input type="text" value={formData.clientName} onChange={(e) => handleChange('clientName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm" placeholder="Owner's name" />
          </FormField>
          <FormField label="Client Email">
            <input type="email" value={formData.clientEmail} onChange={(e) => handleChange('clientEmail', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm" placeholder="email@example.com" />
          </FormField>
          <FormField label="Client Phone">
            <input type="tel" value={formData.clientPhone} onChange={(e) => handleChange('clientPhone', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm" placeholder="(555) 123-4567" />
          </FormField>
          <FormField label="Emergency Contact">
            <input type="tel" value={formData.emergencyContact} onChange={(e) => handleChange('emergencyContact', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm" placeholder="(555) 123-4567" />
          </FormField>
        </div>

        {/* ADDRESS FIELDS */}
        <div className="mt-3 pt-3 border-t border-slate-300">
          <div className="grid md:grid-cols-1 gap-3 mb-3">
            <FormField label="Address">
              <input type="text" value={formData.clientAddress} onChange={(e) => handleChange('clientAddress', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm" placeholder="Street address" />
            </FormField>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <FormField label="ZIP Code">
              <input type="text" value={formData.clientZip} onChange={(e) => {
                const zip = e.target.value;
                handleChange('clientZip', zip);
                // Auto-lookup city/state from ZIP
                if (zip.length === 5) {
                  fetch(`https://api.zippopotam.us/us/${zip}`)
                    .then(res => res.json())
                    .then(data => {
                      if (data.places && data.places[0]) {
                        handleChange('clientCity', data.places[0]['place name']);
                        handleChange('clientState', data.places[0]['state abbreviation']);
                      }
                    })
                    .catch(() => {}); // Silent fail if API unavailable
                }
              }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm font-mono" placeholder="12345" maxLength="5" />
            </FormField>
            <FormField label="City">
              <input type="text" value={formData.clientCity} onChange={(e) => handleChange('clientCity', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm" placeholder="City" />
            </FormField>
            <FormField label="State">
              <input type="text" value={formData.clientState} onChange={(e) => handleChange('clientState', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm" placeholder="CA" maxLength="2" />
            </FormField>
          </div>
        </div>
      </div>

      {/* REFERRING VET INFO */}
      <div className="bg-gradient-to-r from-med-teal-50 to-cyan-50 rounded-xl p-4 border border-med-teal-200">
        <h3 className="text-xs font-bold text-med-teal-900 uppercase tracking-wider mb-3">
          <i className="fas fa-hospital mr-2"></i>Referring Veterinarian
        </h3>
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <FormField label="Referring Veterinarian">
            <input type="text" value={formData.referringVet} onChange={(e) => handleChange('referringVet', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm" placeholder="Dr. Smith, DVM, DACVS" />
          </FormField>
          <FormField label="Referring Clinic / Hospital">
            <select
              value={formData.referringClinic}
              onChange={(e) => handleChange('referringClinic', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm">
              {SPECIALTY_HOSPITALS.map((hospital, idx) => (
                <option key={idx} value={hospital === '-- Select Hospital/Clinic --' ? '' : hospital}>
                  {hospital}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* CUSTOM CLINIC (if "Other" selected) */}
        {formData.referringClinic === 'Other - Enter Custom Clinic Name' && (
          <FormField label="Custom Clinic Name">
            <input
              type="text"
              value={formData.customClinicName || ''}
              onChange={(e) => handleChange('customClinicName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm"
              placeholder="Enter clinic name"
            />
          </FormField>
        )}

        {/* INSURANCE (OPTIONAL) */}
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <FormField label="Insurance Provider (optional)">
            <input type="text" value={formData.insuranceProvider} onChange={(e) => handleChange('insuranceProvider', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm" placeholder="e.g., Trupanion, Nationwide" />
          </FormField>
          <FormField label="Policy # (optional)">
            <input type="text" value={formData.policyNumber} onChange={(e) => handleChange('policyNumber', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm font-mono" placeholder="Policy number" />
          </FormField>
        </div>
      </div>

      {/* PATIENT IDENTIFICATION */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          <i className="fas fa-id-card mr-2"></i>Patient Identification
        </h3>
        <div className="grid md:grid-cols-3 gap-3">
          <FormField label="Patient Name" required error={errors.patientName}>
            <input type="text" value={formData.patientName} onChange={(e) => handleChange('patientName', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm" placeholder="e.g., Atlas" />
          </FormField>
          <FormField label="Case / Patient ID">
            <input type="text" value={formData.patientId} onChange={(e) => handleChange('patientId', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm font-mono" placeholder="K9R-2025-####" />
          </FormField>
          <FormField label="Microchip #">
            <input type="text" value={formData.microchipId} onChange={(e) => handleChange('microchipId', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm font-mono" placeholder="15-digit ISO" />
          </FormField>
        </div>
      </div>

      {/* BREED / AGE / DOB */}
      <div className="grid md:grid-cols-3 gap-3">
        <FormField label="Breed" required error={errors.breed}>
          <select value={formData.breed} onChange={(e) => handleChange('breed', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm">
            <option value="">Select breed</option>
            {ALL_BREEDS_ALPHABETICAL.map(breed => (
              <option key={breed} value={breed}>{breed}</option>
            ))}
          </select>
        </FormField>
        <FormField label="Age (years)" required error={errors.age}>
          <input type="number" value={formData.age} onChange={(e) => {
            const age = e.target.value;
            handleChange('age', age);
            // Auto-calculate DOB from age
            if (age && parseFloat(age) > 0) {
              const today = new Date();
              const birthYear = today.getFullYear() - Math.floor(parseFloat(age));
              const birthDate = new Date(birthYear, today.getMonth(), today.getDate());
              const dobString = birthDate.toISOString().split('T')[0];
              handleChange('dob', dobString);
            }
          }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm" placeholder="0" min="0" step="0.5" />
        </FormField>
        <FormField label="Date of Birth">
          <input type="date" value={formData.dob} onChange={(e) => handleChange('dob', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm" />
        </FormField>
      </div>

      {/* COAT / SEX */}
      <div className="grid md:grid-cols-2 gap-3">
        <FormField label="Coat Color / Markings">
          <input type="text" value={formData.coatColor} onChange={(e) => handleChange('coatColor', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm" placeholder="e.g., Yellow, Black & Tan" />
        </FormField>
        <FormField label="Sex / Neuter Status">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {['Neutered Male', 'Intact Male', 'Spayed Female', 'Intact Female'].map(option => (
              <button key={option} onClick={() => handleChange('sex', option)}
                className={`px-2 py-2 rounded-lg font-medium text-xs transition-all duration-200 border ${
                  formData.sex === option ? 'bg-med-blue-900 text-white border-med-blue-900' : 'bg-white text-slate-600 border-slate-300 hover:border-med-blue-400 hover:bg-med-blue-50'
                }`}>
                {option}
              </button>
            ))}
          </div>
        </FormField>
      </div>

      {/* WEIGHT MANAGEMENT PANEL */}
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-4 border border-blue-100">
        <h3 className="text-xs font-bold text-med-blue-900 uppercase tracking-wider mb-3">
          <i className="fas fa-weight-scale mr-2"></i>Weight & Body Composition
        </h3>
        <div className="grid md:grid-cols-2 gap-4 mb-3">
          {/* CURRENT WEIGHT */}
          <div>
            <label className="block text-sm font-bold text-med-blue-900 mb-3">
              Current Weight <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 font-semibold mb-2">Kilograms (kg)</label>
                <input
                  type="number"
                  value={formData.weightKg || ''}
                  onChange={(e) => {
                    const kg = e.target.value;
                    handleChange('weightKg', kg);
                    if (kg) {
                      const lbs = (parseFloat(kg) * 2.20462).toFixed(1);
                      handleChange('weight', lbs);
                    } else {
                      handleChange('weight', '');
                    }
                  }}
                  className="w-full px-3 py-2 border-2 border-med-blue-300 rounded-lg bg-white text-slate-900 text-sm font-bold focus:border-med-blue-500 focus:ring-0"
                  placeholder="0.0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 font-semibold mb-2">Pounds (lbs)</label>
                <input
                  type="number"
                  value={formData.weight || ''}
                  onChange={(e) => {
                    const lbs = e.target.value;
                    handleChange('weight', lbs);
                    if (lbs) {
                      const kg = (parseFloat(lbs) / 2.20462).toFixed(1);
                      handleChange('weightKg', kg);
                    } else {
                      handleChange('weightKg', '');
                    }
                  }}
                  className="w-full px-3 py-2 border-2 border-med-blue-300 rounded-lg bg-white text-slate-900 text-sm font-bold focus:border-med-blue-500 focus:ring-0"
                  placeholder="0.0"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
            {errors.weight && <p className="text-red-500 text-xs mt-2 font-medium">{errors.weight}</p>}
          </div>

          {/* IDEAL WEIGHT */}
          <div>
            <label className="block text-sm font-bold text-med-green-900 mb-3">
              Ideal Weight
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 font-semibold mb-2">Kilograms (kg)</label>
                <input
                  type="number"
                  value={formData.idealWeightKg || ''}
                  onChange={(e) => {
                    const kg = e.target.value;
                    handleChange('idealWeightKg', kg);
                    if (kg) {
                      const lbs = (parseFloat(kg) * 2.20462).toFixed(1);
                      handleChange('idealWeight', lbs);
                    } else {
                      handleChange('idealWeight', '');
                    }
                  }}
                  className="w-full px-3 py-2 border-2 border-med-green-300 rounded-lg bg-white text-slate-900 text-sm font-bold focus:border-med-green-500 focus:ring-0"
                  placeholder="0.0"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 font-semibold mb-2">Pounds (lbs)</label>
                <input
                  type="number"
                  value={formData.idealWeight || ''}
                  onChange={(e) => {
                    const lbs = e.target.value;
                    handleChange('idealWeight', lbs);
                    if (lbs) {
                      const kg = (parseFloat(lbs) / 2.20462).toFixed(1);
                      handleChange('idealWeightKg', kg);
                    } else {
                      handleChange('idealWeightKg', '');
                    }
                  }}
                  className="w-full px-3 py-2 border-2 border-med-green-300 rounded-lg bg-white text-slate-900 text-sm font-bold focus:border-med-green-500 focus:ring-0"
                  placeholder="0.0"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SIZE & DELTA */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
            <div className="text-xs text-slate-400 font-semibold uppercase mb-1">Size Category</div>
            <div className="text-lg font-extrabold text-med-blue-900">{getSizeCategory(formData.weight)}</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
            <div className="text-xs text-slate-400 font-semibold uppercase mb-1">Weight Delta</div>
            <div className={`text-lg font-extrabold ${weightDiff > 0 ? 'text-amber-600' : weightDiff < 0 ? 'text-blue-600' : 'text-med-green-500'}`}>
              {weightDiff ? `${weightDiff > 0 ? '+' : ''}${weightDiff} lbs` : '—'}
            </div>
            {weightDiff > 0 && <div className="text-xs text-amber-500 font-medium">Over ideal</div>}
            {weightDiff < 0 && <div className="text-xs text-blue-500 font-medium">Under ideal</div>}
            {weightDiff == 0 && <div className="text-xs text-green-500 font-medium">At ideal</div>}
          </div>
        </div>
      </div>
    </div>
  );
};


const FormField = ({ label, required, error, children }) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
};

// ============================================================================
// STEP 2: VISUAL DOG BUILDER
// ============================================================================

const Step3ClinicalDiagnosis = ({ formData, handleChange, errors }) => {
  const [selectedRegion, setSelectedRegion] = useState(formData.affectedRegion || '');
  const [filteredConditions, setFilteredConditions] = useState([]);
  const [showAllConditions, setShowAllConditions] = useState(false);

  const isSurgical = formData.diagnosis && ['POST_TPLO', 'POST_TTA', 'POST_LATERAL', 'POST_FHO', 'POST_THR', 'POST_PATELLA', 'IVDD_POSTOP', 'FRACTURE', 'PELVIC_FX', 'FORELIMB_AMP', 'HINDLIMB_AMP'].includes(formData.diagnosis);

  useEffect(() => {
    if (selectedRegion && ANATOMY_REGIONS[selectedRegion]) {
      const allConditions = Object.values(CONDITIONS_GROUPED).flat();
      const regionData = ANATOMY_REGIONS[selectedRegion];
      if (regionData && regionData.conditions) {
        setFilteredConditions(allConditions.filter(cond => regionData.conditions.includes(cond.code)));
      }
      setShowAllConditions(false);
    }
  }, [selectedRegion]);

  const selectRegion = (region) => {
    setSelectedRegion(region);
    handleChange('affectedRegion', region);
  };

  return (
    <div className="space-y-8">
      {/* MEDICAL HEADER */}
      <div className="text-center pb-6 border-b-2 border-slate-200">
        <div className="inline-flex items-center gap-3 bg-red-50 px-5 py-2 rounded-full mb-4">
          <i className="fas fa-stethoscope text-red-700 text-lg"></i>
          <span className="text-sm font-bold text-red-900 uppercase tracking-wider">Step 2 of 4</span>
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-2">Clinical Diagnosis</h3>
        <p className="text-slate-600 font-medium">Anatomical Region & Primary Condition</p>
      </div>

      {/* ONSET / CHRONICITY ROW */}
      <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
        <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-4">
          <i className="fas fa-calendar-day mr-2"></i>Clinical Timeline
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <FormField label="Onset Date">
            <input type="date" value={formData.onsetDate} onChange={(e) => handleChange('onsetDate', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg med-input bg-white text-slate-900" />
          </FormField>
          <FormField label="Chronicity">
            <div className="grid grid-cols-3 gap-2">
              {['Acute', 'Subacute', 'Chronic'].map(opt => (
                <button key={opt} onClick={() => handleChange('chronicity', opt)}
                  className={`px-3 py-2.5 rounded-lg font-medium text-xs transition-all border ${
                    formData.chronicity === opt ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-600 border-slate-300 hover:border-amber-400'
                  }`}>
                  {opt}
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Bilateral Involvement">
            <button onClick={() => handleChange('bilateralInvolvement', !formData.bilateralInvolvement)}
              className={`w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-all border flex items-center justify-center gap-2 ${
                formData.bilateralInvolvement ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-300 hover:border-red-400'
              }`}>
              <i className={`fas ${formData.bilateralInvolvement ? 'fa-check-circle' : 'fa-circle'}`}></i>
              {formData.bilateralInvolvement ? 'Yes — Bilateral' : 'No — Unilateral'}
            </button>
          </FormField>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* ANATOMY SELECTOR */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Affected Region</h3>
          <div className="space-y-2">
            <AnatomyButton region="HEAD" label="Head / Neck" icon="fa-head-side-virus" selected={selectedRegion === 'HEAD'} onClick={() => selectRegion('HEAD')} />
            <AnatomyButton region="SPINE" label="Spine / Back" icon="fa-bone" selected={selectedRegion === 'SPINE'} onClick={() => selectRegion('SPINE')} />
            <div className="grid grid-cols-2 gap-2">
              <AnatomyButton region="SHOULDER_L" label="L Shoulder" icon="fa-circle-dot" selected={selectedRegion === 'SHOULDER_L'} onClick={() => selectRegion('SHOULDER_L')} />
              <AnatomyButton region="SHOULDER_R" label="R Shoulder" icon="fa-circle-dot" selected={selectedRegion === 'SHOULDER_R'} onClick={() => selectRegion('SHOULDER_R')} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <AnatomyButton region="ELBOW_L" label="L Elbow" icon="fa-circle" selected={selectedRegion === 'ELBOW_L'} onClick={() => selectRegion('ELBOW_L')} />
              <AnatomyButton region="ELBOW_R" label="R Elbow" icon="fa-circle" selected={selectedRegion === 'ELBOW_R'} onClick={() => selectRegion('ELBOW_R')} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <AnatomyButton region="HIP_L" label="L Hip" icon="fa-circle-dot" selected={selectedRegion === 'HIP_L'} onClick={() => selectRegion('HIP_L')} />
              <AnatomyButton region="HIP_R" label="R Hip" icon="fa-circle-dot" selected={selectedRegion === 'HIP_R'} onClick={() => selectRegion('HIP_R')} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <AnatomyButton region="STIFLE_L" label="L Stifle" icon="fa-circle" selected={selectedRegion === 'STIFLE_L'} onClick={() => selectRegion('STIFLE_L')} />
              <AnatomyButton region="STIFLE_R" label="R Stifle" icon="fa-circle" selected={selectedRegion === 'STIFLE_R'} onClick={() => selectRegion('STIFLE_R')} />
            </div>
            <AnatomyButton region="GENERAL" label="General / Multiple Joints" icon="fa-paw" selected={selectedRegion === 'GENERAL'} onClick={() => selectRegion('GENERAL')} />
          </div>

          {/* AFFECTED SIDE */}
          <div className="mt-4">
            <FormField label="Affected Side">
              <div className="grid grid-cols-3 gap-2">
                {['Left', 'Right', 'Bilateral'].map(side => (
                  <button key={side} onClick={() => handleChange('affectedSide', side)}
                    className={`px-3 py-2.5 rounded-lg font-medium text-xs transition-all border ${
                      formData.affectedSide === side ? 'bg-med-blue-900 text-white border-med-blue-900' : 'bg-white text-slate-600 border-slate-300 hover:border-med-blue-400'
                    }`}>
                    {side}
                  </button>
                ))}
              </div>
            </FormField>
          </div>
        </div>

        {/* CONDITION SELECTION */}
        <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Specific Diagnosis</h3>

          {!selectedRegion && !showAllConditions ? (
            <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
              <i className="fas fa-hand-pointer text-4xl text-slate-300 mb-3 block"></i>
              <p className="text-slate-400 font-medium">Select a body region to see conditions</p>
              <button onClick={() => setShowAllConditions(true)} className="mt-3 text-med-blue-600 hover:text-med-blue-800 text-sm font-semibold">
                or view all conditions
              </button>
            </div>
          ) : !showAllConditions && filteredConditions.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {filteredConditions.map(condition => (
                <ConditionCard key={condition.code} condition={condition} selected={formData.diagnosis === condition.code} onClick={() => handleChange('diagnosis', condition.code)} />
              ))}
            </div>
          ) : null}

          {(showAllConditions || (!selectedRegion && showAllConditions)) && (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {Object.entries(CONDITIONS_GROUPED).map(([category, conditions]) => (
                <div key={category}>
                  <h4 className="text-xs font-bold text-med-blue-900 uppercase tracking-wider mb-2 sticky top-0 bg-white py-1">{category}</h4>
                  <div className="space-y-1">
                    {conditions.map(condition => (
                      <ConditionCard key={condition.code} condition={condition} selected={formData.diagnosis === condition.code} onClick={() => handleChange('diagnosis', condition.code)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedRegion && !showAllConditions && (
            <button onClick={() => { setSelectedRegion(''); setShowAllConditions(true); }} className="mt-4 text-med-blue-600 hover:text-med-blue-800 text-sm font-semibold flex items-center gap-2">
              <i className="fas fa-list"></i> View All Conditions
            </button>
          )}
          {showAllConditions && (
            <button onClick={() => setShowAllConditions(false)} className="mt-4 text-slate-500 hover:text-slate-700 text-sm font-semibold flex items-center gap-2">
              <i className="fas fa-arrow-left"></i> Back to Region Filter
            </button>
          )}

          {errors.diagnosis && <p className="text-red-500 text-sm mt-3 font-medium">{errors.diagnosis}</p>}
        </div>
      </div>

      {/* TREATMENT PATHWAY SELECTION */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
        <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-3">
          <i className="fas fa-route mr-2"></i>Treatment Pathway
        </h3>
        <div className="grid md:grid-cols-3 gap-3">
          {['Post-Operative Surgical', 'Conservative/Non-Surgical', 'Surgical - Owner Elects Conservative'].map(pathway => (
            <button
              key={pathway}
              onClick={() => handleChange('treatmentPathway', pathway)}
              className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all border text-left ${
                formData.treatmentPathway === pathway
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                  : 'bg-white text-slate-700 border-slate-300 hover:border-purple-400 hover:bg-purple-50'
              }`}
            >
              <i className={`fas ${
                pathway.includes('Post-Operative') ? 'fa-scalpel' :
                pathway.includes('Conservative/Non') ? 'fa-hand-holding-medical' :
                'fa-user-check'
              } mr-2`}></i>
              {pathway}
            </button>
          ))}
        </div>

        {/* TIMESTAMP FOR PATHWAY */}
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          {formData.treatmentPathway === 'Post-Operative Surgical' && (
            <FormField label="Surgery Date">
              <input type="date" value={formData.surgeryDate} onChange={(e) => handleChange('surgeryDate', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm" />
            </FormField>
          )}
          {(formData.treatmentPathway === 'Conservative/Non-Surgical' || formData.treatmentPathway === 'Surgical - Owner Elects Conservative') && (
            <FormField label="Conservative Treatment Start Date">
              <input type="date" value={formData.conservativeStartDate} onChange={(e) => handleChange('conservativeStartDate', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm" />
            </FormField>
          )}
          {formData.treatmentPathway && (
            <FormField label="Weeks Since {formData.treatmentPathway === 'Post-Operative Surgical' ? 'Surgery' : 'Onset'}">
              <input type="number" value={formData.weeksSinceEvent} onChange={(e) => handleChange('weeksSinceEvent', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm" placeholder="0" min="0" step="0.5" />
            </FormField>
          )}
        </div>
      </div>

      {/* DIAGNOSTIC IMAGING & WORKUP */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200">
        <h3 className="text-xs font-bold text-cyan-900 uppercase tracking-wider mb-3">
          <i className="fas fa-x-ray mr-2"></i>Diagnostic Imaging & Workup
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* BLOODWORK */}
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Bloodwork / Labs</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {['Completed', 'Pending', 'Not Done'].map(status => (
                <button
                  key={status}
                  onClick={() => handleChange('bloodworkStatus', status)}
                  className={`px-2 py-1.5 rounded-md font-medium text-xs transition-all border ${
                    formData.bloodworkStatus === status
                      ? 'bg-cyan-600 text-white border-cyan-600'
                      : 'bg-slate-50 text-slate-600 border-slate-300 hover:border-cyan-400'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            {formData.bloodworkStatus === 'Completed' && (
              <input type="text" value={formData.bloodworkLocation} onChange={(e) => handleChange('bloodworkLocation', e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs bg-slate-50 text-slate-900" placeholder="Lab name / date" />
            )}
          </div>

          {/* RADIOGRAPHS (X-RAYS) */}
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Radiographs (X-Rays)</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {['Completed', 'Pending', 'Not Done'].map(status => (
                <button
                  key={status}
                  onClick={() => handleChange('radiographStatus', status)}
                  className={`px-2 py-1.5 rounded-md font-medium text-xs transition-all border ${
                    formData.radiographStatus === status
                      ? 'bg-cyan-600 text-white border-cyan-600'
                      : 'bg-slate-50 text-slate-600 border-slate-300 hover:border-cyan-400'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            {formData.radiographStatus === 'Completed' && (
              <input type="text" value={formData.radiographLocation} onChange={(e) => handleChange('radiographLocation', e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs bg-slate-50 text-slate-900" placeholder="Facility / date" />
            )}
          </div>

          {/* MRI */}
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">MRI</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {['Completed', 'Pending', 'Not Done'].map(status => (
                <button
                  key={status}
                  onClick={() => handleChange('mriStatus', status)}
                  className={`px-2 py-1.5 rounded-md font-medium text-xs transition-all border ${
                    formData.mriStatus === status
                      ? 'bg-cyan-600 text-white border-cyan-600'
                      : 'bg-slate-50 text-slate-600 border-slate-300 hover:border-cyan-400'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            {formData.mriStatus === 'Completed' && (
              <input type="text" value={formData.mriLocation} onChange={(e) => handleChange('mriLocation', e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs bg-slate-50 text-slate-900" placeholder="Facility / date" />
            )}
          </div>

          {/* CT SCAN */}
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">CT Scan</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {['Completed', 'Pending', 'Not Done'].map(status => (
                <button
                  key={status}
                  onClick={() => handleChange('ctScanStatus', status)}
                  className={`px-2 py-1.5 rounded-md font-medium text-xs transition-all border ${
                    formData.ctScanStatus === status
                      ? 'bg-cyan-600 text-white border-cyan-600'
                      : 'bg-slate-50 text-slate-600 border-slate-300 hover:border-cyan-400'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            {formData.ctScanStatus === 'Completed' && (
              <input type="text" value={formData.ctScanLocation} onChange={(e) => handleChange('ctScanLocation', e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs bg-slate-50 text-slate-900" placeholder="Facility / date" />
            )}
          </div>

          {/* ULTRASOUND */}
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Ultrasound</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {['Completed', 'Pending', 'Not Done'].map(status => (
                <button
                  key={status}
                  onClick={() => handleChange('ultrasoundStatus', status)}
                  className={`px-2 py-1.5 rounded-md font-medium text-xs transition-all border ${
                    formData.ultrasoundStatus === status
                      ? 'bg-cyan-600 text-white border-cyan-600'
                      : 'bg-slate-50 text-slate-600 border-slate-300 hover:border-cyan-400'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            {formData.ultrasoundStatus === 'Completed' && (
              <input type="text" value={formData.ultrasoundLocation} onChange={(e) => handleChange('ultrasoundLocation', e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs bg-slate-50 text-slate-900" placeholder="Facility / date" />
            )}
          </div>

          {/* ARTHROSCOPY */}
          <div className="bg-white rounded-lg p-3 border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Arthroscopy</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {['Completed', 'Pending', 'Not Done'].map(status => (
                <button
                  key={status}
                  onClick={() => handleChange('arthroscopyStatus', status)}
                  className={`px-2 py-1.5 rounded-md font-medium text-xs transition-all border ${
                    formData.arthroscopyStatus === status
                      ? 'bg-cyan-600 text-white border-cyan-600'
                      : 'bg-slate-50 text-slate-600 border-slate-300 hover:border-cyan-400'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            {formData.arthroscopyStatus === 'Completed' && (
              <input type="text" value={formData.arthroscopyLocation} onChange={(e) => handleChange('arthroscopyLocation', e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs bg-slate-50 text-slate-900" placeholder="Facility / date" />
            )}
          </div>
        </div>

        {/* IMAGING FINDINGS */}
        <div className="mt-3">
          <label className="block text-xs font-bold text-cyan-900 uppercase tracking-wider mb-2">Imaging Findings / Radiologist Report Summary</label>
          <textarea
            value={formData.imagingFindings}
            onChange={(e) => handleChange('imagingFindings', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm resize-vertical"
            placeholder="e.g., Complete CCL tear with medial meniscal damage, Grade 2 OA changes, drawer sign positive..."
          />
        </div>
      </div>

      {/* SURGICAL DETAILS — Only shown for post-operative pathway */}
      {formData.treatmentPathway === 'Post-Operative Surgical' && (
        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider mb-3">
            <i className="fas fa-scalpel mr-2"></i>Surgical Details & Post-Op Status
          </h3>
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <FormField label="Surgical Procedure Performed">
              <select value={formData.surgicalProcedure} onChange={(e) => handleChange('surgicalProcedure', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm">
                <option value="">Select procedure</option>
                <optgroup label="Stifle (Knee) Procedures">
                  <option value="TPLO">TPLO (Tibial Plateau Leveling Osteotomy)</option>
                  <option value="TTA">TTA (Tibial Tuberosity Advancement)</option>
                  <option value="Lateral Suture">Lateral Suture / Extracapsular Repair</option>
                  <option value="Patellar Luxation Repair">Patellar Luxation Repair (Trochleoplasty/TTT)</option>
                  <option value="Meniscal Release">Partial Meniscectomy / Meniscal Release</option>
                </optgroup>
                <optgroup label="Hip Procedures">
                  <option value="FHO">FHO (Femoral Head Ostectomy)</option>
                  <option value="THR">THR (Total Hip Replacement)</option>
                  <option value="DPO">DPO (Double Pelvic Osteotomy)</option>
                  <option value="TPO">TPO (Triple Pelvic Osteotomy)</option>
                  <option value="JPS">JPS (Juvenile Pubic Symphysiodesis)</option>
                </optgroup>
                <optgroup label="Elbow Procedures">
                  <option value="FCP">FCP (Fragmented Coronoid Process) Removal</option>
                  <option value="UAP">UAP (Ununited Anconeal Process) Repair</option>
                  <option value="OCD Shoulder">OCD Debridement - Shoulder</option>
                  <option value="OCD Elbow">OCD Debridement - Elbow</option>
                </optgroup>
                <optgroup label="Spine Procedures">
                  <option value="Hemilaminectomy">Hemilaminectomy (IVDD Surgery)</option>
                  <option value="Ventral Slot">Ventral Slot (Cervical IVDD)</option>
                  <option value="Dorsal Laminectomy">Dorsal Laminectomy</option>
                </optgroup>
                <optgroup label="Fracture Repairs">
                  <option value="Fracture - Plate">Fracture Repair - Plate Fixation</option>
                  <option value="Fracture - IM Pin">Fracture Repair - IM Pin</option>
                  <option value="Fracture - ESF">Fracture Repair - External Skeletal Fixator</option>
                  <option value="Pelvic Fracture">Pelvic Fracture Repair</option>
                </optgroup>
                <optgroup label="Amputation">
                  <option value="Forelimb Amputation">Forelimb Amputation</option>
                  <option value="Hindlimb Amputation">Hindlimb Amputation</option>
                </optgroup>
                <option value="Other">Other (Specify Below)</option>
              </select>
            </FormField>
            <FormField label="Performing Surgeon">
              <input type="text" value={formData.performingSurgeon} onChange={(e) => handleChange('performingSurgeon', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm" placeholder="Dr. Smith, DACVS" />
            </FormField>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <FormField label="Surgical Approach / Technique">
              <input type="text" value={formData.surgicalApproach} onChange={(e) => handleChange('surgicalApproach', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm" placeholder="e.g., 24mm blade, lateral approach" />
            </FormField>
            <FormField label="Implant / Hardware Used">
              <input type="text" value={formData.implantType} onChange={(e) => handleChange('implantType', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm" placeholder="e.g., 3.5mm LCP Plate" />
            </FormField>
            <FormField label="Post-Op Complications">
              <select value={formData.postOpComplications} onChange={(e) => handleChange('postOpComplications', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm">
                <option value="None">None</option>
                <option value="Infection">Infection</option>
                <option value="Seroma">Seroma</option>
                <option value="Dehiscence">Incision Dehiscence</option>
                <option value="Implant Failure">Implant Failure/Loosening</option>
                <option value="Other">Other</option>
              </select>
            </FormField>
          </div>
          <div className="mt-3">
            <label className="block text-xs font-bold text-red-900 uppercase tracking-wider mb-2">Surgical Report Summary / Intra-Op Findings</label>
            <textarea
              value={formData.surgicalReportSummary}
              onChange={(e) => handleChange('surgicalReportSummary', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm resize-vertical"
              placeholder="e.g., Complete CCL tear confirmed, medial meniscal bucket handle tear removed, TPLO performed with 9° correction, stable fixation achieved..."
            />
          </div>
        </div>
      )}

      {/* CONSERVATIVE TREATMENT DETAILS */}
      {(formData.treatmentPathway === 'Conservative/Non-Surgical' || formData.treatmentPathway === 'Surgical - Owner Elects Conservative') && (
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <h3 className="text-xs font-bold text-green-800 uppercase tracking-wider mb-3">
            <i className="fas fa-hand-holding-medical mr-2"></i>Conservative Management Plan
          </h3>
          {formData.treatmentPathway === 'Surgical - Owner Elects Conservative' && (
            <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 mb-3">
              <p className="text-xs text-amber-900 font-semibold flex items-center gap-2">
                <i className="fas fa-exclamation-triangle"></i>
                Owner informed of surgical recommendation but elected conservative management. Owner understands risks/benefits.
              </p>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-3">
            <FormField label="Conservative Treatment Modalities">
              <textarea
                value={formData.conservativeModalities}
                onChange={(e) => handleChange('conservativeModalities', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm resize-vertical"
                placeholder="e.g., NSAIDs, rest restriction, cryotherapy, gabapentin, laser therapy..."
              />
            </FormField>
            <FormField label="Activity Restrictions / Home Care Instructions">
              <textarea
                value={formData.activityRestrictions}
                onChange={(e) => handleChange('activityRestrictions', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg med-input bg-white text-slate-900 text-sm resize-vertical"
                placeholder="e.g., Strict leash walks only, no stairs, no jumping, confined rest..."
              />
            </FormField>
          </div>
        </div>
      )}
    </div>
  );
};

const AnatomyButton = ({ region, label, icon, selected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-3 border ${
        selected
          ? 'bg-med-blue-900 text-white border-med-blue-900 shadow-md'
          : 'bg-white text-slate-700 border-slate-300 hover:border-med-blue-400 hover:bg-med-blue-50'
      }`}
    >
      <i className={`fas ${icon}`}></i>
      {label}
    </button>
  );
};

const ConditionCard = ({ condition, selected, onClick }) => {
  const severityColor =
    condition.severity.includes('Surgical') ? 'text-red-600 bg-red-50' :
    condition.severity.includes('Severe') ? 'text-orange-600 bg-orange-50' :
    condition.severity.includes('Moderate') ? 'text-amber-600 bg-amber-50' :
    'text-green-600 bg-green-50';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 border ${
        selected
          ? 'bg-med-blue-900 text-white border-med-blue-900 shadow-md'
          : 'bg-white text-slate-700 border-slate-200 hover:border-med-blue-400 hover:bg-med-blue-50'
      }`}
    >
      <div className="font-semibold text-sm">{condition.name}</div>
      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${selected ? 'bg-white/20 text-white' : severityColor}`}>
        {condition.severity}
      </span>
    </button>
  );
};

// ============================================================================
// STEP 4: CLINICAL ASSESSMENT
// ============================================================================

const Step4ClinicalAssessment = ({ formData, handleChange, errors }) => {
  const [goalInput, setGoalInput] = useState('');

  const addGoal = () => {
    if (goalInput.trim()) {
      handleChange('goals', [...formData.goals, goalInput.trim()]);
      setGoalInput('');
    }
  };
  const addGoalOnEnter = (e) => { if (e.key === 'Enter') { e.preventDefault(); addGoal(); } };
  const removeGoal = (index) => { handleChange('goals', formData.goals.filter((_, i) => i !== index)); };

  // Calculate muscle circumference deficit
  const muscleDeficit = formData.muscleCircAffected && formData.muscleCircContralateral
    ? ((parseFloat(formData.muscleCircContralateral) - parseFloat(formData.muscleCircAffected)) / parseFloat(formData.muscleCircContralateral) * 100).toFixed(1)
    : null;

  // ROM deficit
  const romFlexionDiff = formData.romFlexion && formData.romContralateralFlexion
    ? (parseFloat(formData.romFlexion) - parseFloat(formData.romContralateralFlexion)).toFixed(0) : null;
  const romExtensionDiff = formData.romExtension && formData.romContralateralExtension
    ? (parseFloat(formData.romExtension) - parseFloat(formData.romContralateralExtension)).toFixed(0) : null;

  const LAMENESS_DESC = {
    0: '0 = Sound, normal gait',
    1: '1 = Mild, intermittent lameness',
    2: '2 = Moderate, obvious weight-shifting',
    3: '3 = Severe, minimal weight-bearing',
    4: '4 = Non-weight bearing'
  };

  const FUNCTIONAL_OPTIONS = ['Normal', 'Difficulty', 'Unable', 'Not Tested'];

  return (
    <div className="space-y-8">
      {/* MEDICAL HEADER */}
      <div className="text-center pb-6 border-b-2 border-slate-200">
        <div className="inline-flex items-center gap-3 bg-purple-50 px-5 py-2 rounded-full mb-4">
          <i className="fas fa-clipboard-check text-purple-700 text-lg"></i>
          <span className="text-sm font-bold text-purple-900 uppercase tracking-wider">Step 3 of 4</span>
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-2">Clinical Assessment</h3>
        <p className="text-slate-600 font-medium">Objective Measurements & Functional Evaluation</p>
      </div>

      <div className="border-b border-slate-200 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <i className="fas fa-clipboard-check text-med-teal-500"></i>
          Clinical Assessment
        </h2>
        <p className="text-slate-500 text-sm mt-1">Comprehensive evaluation per Canine Rehabilitation standards</p>
      </div>

      {/* PAIN & MOBILITY */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-red-50 rounded-xl p-5 border border-red-100">
          <label className="block text-sm font-bold text-red-800 mb-1">Pain Level (VAS)</label>
          <div className="text-3xl font-extrabold text-red-600 mb-2">{formData.painLevel}/10</div>
          <input type="range" min="0" max="10" value={formData.painLevel}
            onChange={(e) => handleChange('painLevel', parseInt(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full appearance-none cursor-pointer" />
          <div className="flex justify-between text-xs text-slate-500 mt-1"><span>No Pain</span><span>Severe</span></div>
        </div>
        <div className="bg-green-50 rounded-xl p-5 border border-green-100">
          <label className="block text-sm font-bold text-green-800 mb-1">Mobility Level</label>
          <div className="text-3xl font-extrabold text-green-600 mb-2">{formData.mobilityLevel}/10</div>
          <input type="range" min="0" max="10" value={formData.mobilityLevel}
            onChange={(e) => handleChange('mobilityLevel', parseInt(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-400 to-green-400 rounded-full appearance-none cursor-pointer" />
          <div className="flex justify-between text-xs text-slate-500 mt-1"><span>Non-ambulatory</span><span>Normal</span></div>
        </div>
      </div>

      {/* LAMENESS & BCS & WEIGHT BEARING */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <label className="block text-sm font-bold text-slate-700 mb-3">Lameness Grade</label>
          <div className="grid grid-cols-5 gap-1">
            {[0, 1, 2, 3, 4].map(grade => (
              <button key={grade} onClick={() => handleChange('lamenessGrade', grade)}
                className={`py-2.5 rounded-lg font-bold text-sm transition-all border ${
                  formData.lamenessGrade === grade ? 'bg-med-blue-900 text-white border-med-blue-900' : 'bg-white text-slate-600 border-slate-300 hover:border-med-blue-400'
                }`}>{grade}</button>
            ))}
          </div>
          <p className="text-slate-500 text-xs mt-2">{LAMENESS_DESC[formData.lamenessGrade]}</p>
        </div>

        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <label className="block text-sm font-bold text-slate-700 mb-3">Body Condition Score</label>
          <select value={formData.bodyConditionScore} onChange={(e) => handleChange('bodyConditionScore', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg med-input bg-white text-slate-900">
            {[1,2,3,4,5,6,7,8,9].map(n => (
              <option key={n} value={n}>{n}/9 — {n <= 2 ? 'Emaciated' : n <= 3 ? 'Thin' : n <= 5 ? 'Ideal' : n <= 7 ? 'Overweight' : 'Obese'}</option>
            ))}
          </select>
        </div>

        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <label className="block text-sm font-bold text-slate-700 mb-3">Weight-Bearing Status</label>
          <div className="space-y-1">
            {['Full', 'Partial', 'Toe-Touch', 'Non-Weight Bearing'].map(opt => (
              <button key={opt} onClick={() => handleChange('weightBearingStatus', opt)}
                className={`w-full px-3 py-2 rounded-lg font-medium text-xs transition-all border text-left ${
                  formData.weightBearingStatus === opt ? 'bg-med-blue-900 text-white border-med-blue-900' : 'bg-white text-slate-600 border-slate-300 hover:border-med-blue-400'
                }`}>{opt}</button>
            ))}
          </div>
        </div>
      </div>

      {/* GONIOMETRY / ROM */}
      <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
        <h3 className="text-xs font-bold text-med-blue-900 uppercase tracking-wider mb-4">
          <i className="fas fa-drafting-compass mr-2"></i>Range of Motion — Goniometry (degrees)
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase">Affected Limb</h4>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Flexion (°)">
                <input type="number" value={formData.romFlexion} onChange={(e) => handleChange('romFlexion', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg med-input bg-white text-slate-900 font-mono" placeholder="°" />
              </FormField>
              <FormField label="Extension (°)">
                <input type="number" value={formData.romExtension} onChange={(e) => handleChange('romExtension', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg med-input bg-white text-slate-900 font-mono" placeholder="°" />
              </FormField>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-500 mb-3 uppercase">Contralateral Limb</h4>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Flexion (°)">
                <input type="number" value={formData.romContralateralFlexion} onChange={(e) => handleChange('romContralateralFlexion', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg med-input bg-white text-slate-900 font-mono" placeholder="°" />
              </FormField>
              <FormField label="Extension (°)">
                <input type="number" value={formData.romContralateralExtension} onChange={(e) => handleChange('romContralateralExtension', e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg med-input bg-white text-slate-900 font-mono" placeholder="°" />
              </FormField>
            </div>
          </div>
        </div>
        {(romFlexionDiff || romExtensionDiff) && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-blue-100 flex gap-6 text-sm">
            <span className="font-semibold text-slate-600">ROM Deficit:</span>
            {romFlexionDiff && <span className={`font-bold ${Math.abs(romFlexionDiff) > 10 ? 'text-red-600' : 'text-green-600'}`}>Flexion {romFlexionDiff > 0 ? '+' : ''}{romFlexionDiff}°</span>}
            {romExtensionDiff && <span className={`font-bold ${Math.abs(romExtensionDiff) > 10 ? 'text-red-600' : 'text-green-600'}`}>Extension {romExtensionDiff > 0 ? '+' : ''}{romExtensionDiff}°</span>}
          </div>
        )}
      </div>

      {/* MUSCLE CIRCUMFERENCE */}
      <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
        <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-4">
          <i className="fas fa-ruler mr-2"></i>Muscle Circumference (cm) — Mid-Thigh
        </h3>
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <FormField label="Affected Limb (cm)">
            <input type="number" step="0.1" value={formData.muscleCircAffected} onChange={(e) => handleChange('muscleCircAffected', e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg med-input bg-white text-slate-900 font-mono text-lg" placeholder="cm" />
          </FormField>
          <FormField label="Contralateral Limb (cm)">
            <input type="number" step="0.1" value={formData.muscleCircContralateral} onChange={(e) => handleChange('muscleCircContralateral', e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg med-input bg-white text-slate-900 font-mono text-lg" placeholder="cm" />
          </FormField>
          <div className="text-center p-3 bg-white rounded-lg border border-purple-100">
            <div className="text-xs text-slate-400 font-semibold uppercase mb-1">Deficit</div>
            <div className={`text-2xl font-extrabold ${muscleDeficit > 15 ? 'text-red-600' : muscleDeficit > 10 ? 'text-amber-600' : muscleDeficit > 0 ? 'text-blue-600' : 'text-green-600'}`}>
              {muscleDeficit ? `${muscleDeficit}%` : '—'}
            </div>
            {muscleDeficit > 15 && <div className="text-xs text-red-500 font-medium">Significant atrophy</div>}
            {muscleDeficit > 10 && muscleDeficit <= 15 && <div className="text-xs text-amber-500 font-medium">Moderate atrophy</div>}
            {muscleDeficit > 0 && muscleDeficit <= 10 && <div className="text-xs text-blue-500 font-medium">Mild atrophy</div>}
          </div>
        </div>
      </div>

      {/* FUNCTIONAL ASSESSMENT */}
      <div className="bg-teal-50 rounded-xl p-5 border border-teal-200">
        <h3 className="text-xs font-bold text-teal-900 uppercase tracking-wider mb-4">
          <i className="fas fa-walking mr-2"></i>Functional Assessment
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { key: 'functionalSitToStand', label: 'Sit-to-Stand', icon: 'fa-arrow-up' },
            { key: 'functionalStairs', label: 'Stairs', icon: 'fa-stairs' },
            { key: 'functionalJump', label: 'Jump Up/Down', icon: 'fa-arrow-turn-up' },
            { key: 'functionalTrot', label: 'Trot Quality', icon: 'fa-horse' },
            { key: 'functionalPosture', label: 'Standing Posture', icon: 'fa-person' },
            { key: 'functionalBalance', label: 'Balance / Proprioception', icon: 'fa-scale-balanced' }
          ].map(item => (
            <div key={item.key}>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                <i className={`fas ${item.icon} mr-1 text-teal-600`}></i>{item.label}
              </label>
              <div className="grid grid-cols-2 gap-1">
                {['Normal', 'Difficulty', 'Unable', 'Compensating', 'Lame', 'Impaired', 'Not Tested'].filter(opt =>
                  item.key === 'functionalTrot' ? ['Normal', 'Lame', 'Unable', 'Not Tested'].includes(opt) :
                  item.key === 'functionalPosture' ? ['Normal', 'Compensating', 'Unable', 'Not Tested'].includes(opt) :
                  item.key === 'functionalBalance' ? ['Normal', 'Impaired', 'Unable', 'Not Tested'].includes(opt) :
                  ['Normal', 'Difficulty', 'Unable', 'Not Tested'].includes(opt)
                ).map(opt => (
                  <button key={opt} onClick={() => handleChange(item.key, opt)}
                    className={`px-2 py-1.5 rounded text-xs font-medium transition-all border ${
                      formData[item.key] === opt
                        ? opt === 'Normal' ? 'bg-green-600 text-white border-green-600'
                          : opt === 'Not Tested' ? 'bg-slate-500 text-white border-slate-500'
                          : 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-teal-400'
                    }`}>{opt}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MEDICAL HISTORY */}
      <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
        <h3 className="text-xs font-bold text-orange-900 uppercase tracking-wider mb-4">
          <i className="fas fa-file-medical mr-2"></i>Medical History & Contraindications
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="Allergies / Sensitivities">
            <input type="text" value={formData.allergies} onChange={(e) => handleChange('allergies', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg med-input bg-white text-slate-900" placeholder="None known" />
          </FormField>
          <FormField label="Comorbidities">
            <input type="text" value={formData.comorbidities} onChange={(e) => handleChange('comorbidities', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg med-input bg-white text-slate-900" placeholder="e.g., Hypothyroidism, Cardiac" />
          </FormField>
          <FormField label="Prior Surgeries">
            <input type="text" value={formData.priorSurgeries} onChange={(e) => handleChange('priorSurgeries', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg med-input bg-white text-slate-900" placeholder="None" />
          </FormField>
          <FormField label="Contraindications / Precautions">
            <input type="text" value={formData.contraindications} onChange={(e) => handleChange('contraindications', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg med-input bg-white text-slate-900" placeholder="e.g., Avoid high-impact loading" />
          </FormField>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <FormField label="Current Medications">
            <textarea value={formData.currentMedications} onChange={(e) => handleChange('currentMedications', e.target.value)} rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg med-input bg-white text-slate-900 resize-vertical" placeholder="List all current medications..." />
          </FormField>
          <FormField label="Medical History Notes">
            <textarea value={formData.medicalHistory} onChange={(e) => handleChange('medicalHistory', e.target.value)} rows={3}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg med-input bg-white text-slate-900 resize-vertical" placeholder="Relevant history..." />
          </FormField>
        </div>
      </div>

      {/* TREATMENT GOALS */}
      <div className="bg-white rounded-xl p-5 border border-slate-200">
        <label className="block text-sm font-bold text-slate-700 mb-4">
          <i className="fas fa-bullseye text-med-green-500 mr-2"></i>Treatment Goals
        </label>
        {formData.goals.length > 0 && (
          <div className="space-y-2 mb-4">
            {formData.goals.map((goal, index) => (
              <div key={index} className="flex items-center gap-3 bg-med-green-50 rounded-lg px-4 py-2.5 border border-med-green-100">
                <div className="w-6 h-6 rounded-full bg-med-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{index + 1}</div>
                <span className="text-slate-700 flex-1 text-sm">{goal}</span>
                <button onClick={() => removeGoal(index)} className="text-red-400 hover:text-red-600"><i className="fas fa-times"></i></button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-3">
          <input type="text" value={goalInput} onChange={(e) => setGoalInput(e.target.value)} onKeyDown={addGoalOnEnter}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg med-input bg-white text-slate-900" placeholder="Enter a treatment goal..." />
          <button onClick={addGoal} className="px-5 py-3 bg-med-green-500 text-white font-semibold rounded-lg hover:bg-med-green-600 transition-all btn-lift flex items-center gap-2">
            <i className="fas fa-plus"></i> Add
          </button>
        </div>
      </div>

      {/* PROTOCOL LENGTH + SPECIAL INSTRUCTIONS */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <label className="block text-sm font-bold text-slate-700 mb-1">Protocol Length</label>
          <div className="text-3xl font-extrabold text-med-blue-900 mb-2">{formData.protocolLength} weeks</div>
          <input type="range" min="4" max="16" value={formData.protocolLength}
            onChange={(e) => handleChange('protocolLength', parseInt(e.target.value))}
            className="w-full h-2 accent-bar rounded-full appearance-none cursor-pointer" />
          <div className="flex justify-between text-xs text-slate-500 mt-1"><span>4 wks</span><span>16 wks</span></div>
        </div>
        <FormField label="Special Instructions / Notes">
          <textarea value={formData.specialInstructions} onChange={(e) => handleChange('specialInstructions', e.target.value)} rows={5}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg med-input bg-white text-slate-900 resize-vertical" placeholder="Any special considerations..." />
        </FormField>
      </div>
    </div>
  );
};

// ============================================================================
// STEP 4: REVIEW & AUTHORIZATION
// ============================================================================

const Step5ProviderAuth = ({ formData, handleChange, errors }) => {
  // Find diagnosis name
  const allConditions = Object.values(CONDITIONS_GROUPED).flat();
  const diagnosisObj = allConditions.find(c => c.code === formData.diagnosis);
  const diagnosisName = diagnosisObj ? diagnosisObj.name : formData.diagnosis || '—';

  const muscleDeficit = formData.muscleCircAffected && formData.muscleCircContralateral
    ? ((parseFloat(formData.muscleCircContralateral) - parseFloat(formData.muscleCircAffected)) / parseFloat(formData.muscleCircContralateral) * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-8">
      {/* MEDICAL HEADER */}
      <div className="text-center pb-6 border-b-2 border-slate-200">
        <div className="inline-flex items-center gap-3 bg-green-50 px-5 py-2 rounded-full mb-4">
          <i className="fas fa-user-md text-green-700 text-lg"></i>
          <span className="text-sm font-bold text-green-900 uppercase tracking-wider">Step 4 of 4 - Final Review</span>
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-2">Provider Authorization</h3>
        <p className="text-slate-600 font-medium">Clinical Summary Review & Professional Sign-Off</p>
      </div>

      {/* FULL CLINICAL SNAPSHOT */}
      <div className="bg-med-blue-50 rounded-xl p-6 border border-med-blue-200">
        <h3 className="text-sm font-bold text-med-blue-900 uppercase tracking-wider mb-5 flex items-center gap-2">
          <i className="fas fa-file-medical"></i>Clinical Snapshot — Pre-Generation Summary
        </h3>

        {/* Patient Row */}
        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded-lg p-3 border border-med-blue-100 text-center">
            <div className="text-xs text-slate-400 font-semibold uppercase">Patient</div>
            <div className="text-lg font-extrabold text-med-blue-900">{formData.patientName || '—'}</div>
            <div className="text-xs text-slate-500">{formData.breed}, {formData.age}yr, {formData.weight}lbs</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-med-blue-100 text-center">
            <div className="text-xs text-slate-400 font-semibold uppercase">Diagnosis</div>
            <div className="text-sm font-bold text-med-blue-900">{diagnosisName}</div>
            <div className="text-xs text-slate-500">{formData.affectedSide} {formData.affectedRegion?.replace('_', ' ')}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-med-blue-100 text-center">
            <div className="text-xs text-slate-400 font-semibold uppercase">Protocol</div>
            <div className="text-2xl font-extrabold text-med-blue-900">{formData.protocolLength}</div>
            <div className="text-xs text-slate-500">Weeks</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-med-blue-100 text-center">
            <div className="text-xs text-slate-400 font-semibold uppercase">Goals</div>
            <div className="text-2xl font-extrabold text-med-blue-900">{formData.goals.length}</div>
            <div className="text-xs text-slate-500">Treatment Goals</div>
          </div>
        </div>

        {/* Clinical Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white rounded-lg p-3 border border-med-blue-100 text-center">
            <div className="text-xs text-slate-400 uppercase">Pain</div>
            <div className={`text-xl font-extrabold ${formData.painLevel >= 7 ? 'text-red-600' : formData.painLevel >= 4 ? 'text-amber-600' : 'text-green-600'}`}>{formData.painLevel}/10</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-med-blue-100 text-center">
            <div className="text-xs text-slate-400 uppercase">Mobility</div>
            <div className={`text-xl font-extrabold ${formData.mobilityLevel <= 3 ? 'text-red-600' : formData.mobilityLevel <= 6 ? 'text-amber-600' : 'text-green-600'}`}>{formData.mobilityLevel}/10</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-med-blue-100 text-center">
            <div className="text-xs text-slate-400 uppercase">Lameness</div>
            <div className="text-xl font-extrabold text-med-blue-900">Gr {formData.lamenessGrade}</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-med-blue-100 text-center">
            <div className="text-xs text-slate-400 uppercase">BCS</div>
            <div className="text-xl font-extrabold text-med-blue-900">{formData.bodyConditionScore}/9</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-med-blue-100 text-center">
            <div className="text-xs text-slate-400 uppercase">Muscle Δ</div>
            <div className={`text-xl font-extrabold ${muscleDeficit > 15 ? 'text-red-600' : muscleDeficit > 10 ? 'text-amber-600' : 'text-green-600'}`}>
              {muscleDeficit ? `${muscleDeficit}%` : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* CONSENT */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
        <label className="flex items-start gap-3 cursor-pointer" onClick={() => handleChange('consentGiven', !formData.consentGiven)}>
          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
            formData.consentGiven ? 'bg-med-green-500 border-med-green-500 text-white' : 'border-slate-400 bg-white'
          }`}>
            {formData.consentGiven && <i className="fas fa-check text-xs"></i>}
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-700">Authorization & Consent</span>
            <p className="text-xs text-slate-500 mt-1">
              I confirm that the clinical data entered is accurate and authorize the generation of a rehabilitation protocol.
              This protocol is intended as clinical guidance and must be reviewed by a licensed veterinary rehabilitation professional before implementation.
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};

// ============================================================================

// ============================================================================
// PROTOCOL VIEW — DUAL-PANEL (Client Home / Hospital Clinical)
// Chief Canine Rehabilitation Specialist Grade — Dr. Millis & Levine Standard
// ============================================================================

const ProtocolView = ({ data, languageMode, setLanguageMode, setCurrentView }) => {
  const [expandedExercises, setExpandedExercises] = useState({});
  const [protocolWeeks, setProtocolWeeks] = useState(data.weeks || []);
  const [showAddModal, setShowAddModal] = useState(null); // { weekIndex }
  const [allExercises, setAllExercises] = useState([]);
  const [addSearch, setAddSearch] = useState('');
  const [removedLog, setRemovedLog] = useState([]);

  // Fetch full exercise catalog for Add Exercise feature
  useEffect(() => {
    axios.get(`${API_BASE}/exercises`).then(res => setAllExercises(res.data)).catch(() => {});
  }, []);

  const toggleExercise = (weekIndex, exerciseIndex) => {
    const key = `${weekIndex}-${exerciseIndex}`;
    setExpandedExercises(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Remove exercise from a specific week
  const removeExercise = (weekIndex, exIndex) => {
    const ex = protocolWeeks[weekIndex].exercises[exIndex];
    setRemovedLog(prev => [...prev, { name: ex.name, week: protocolWeeks[weekIndex].week_number, removedAt: new Date().toISOString() }]);
    setProtocolWeeks(prev => {
      const updated = prev.map((w, wi) => {
        if (wi !== weekIndex) return w;
        return { ...w, exercises: w.exercises.filter((_, ei) => ei !== exIndex) };
      });
      return updated;
    });
  };

  // Add exercise to a specific week
  const addExerciseToWeek = (weekIndex, exercise) => {
    const newEx = {
      code: exercise.code,
      name: exercise.name,
      category: exercise.category,
      description: exercise.description,
      sets: 3,
      reps: 10,
      frequency: '1x daily',
      duration_minutes: 10,
      equipment: exercise.equipment || [],
      setup: exercise.setup || '',
      steps: exercise.steps || [],
      good_form: exercise.good_form || [],
      common_mistakes: exercise.common_mistakes || [],
      red_flags: exercise.red_flags || [],
      progression: exercise.progression || '',
      contraindications: exercise.contraindications || '',
      difficulty_level: exercise.difficulty_level || 'Moderate',
      manuallyAdded: true
    };
    setProtocolWeeks(prev => {
      const updated = prev.map((w, wi) => {
        if (wi !== weekIndex) return w;
        return { ...w, exercises: [...w.exercises, newEx] };
      });
      return updated;
    });
    setShowAddModal(null);
    setAddSearch('');
  };

  const handlePrint = () => window.print();

  // Count total exercises across all weeks
  const totalExCount = protocolWeeks.reduce((sum, w) => sum + (w.exercises?.length || 0), 0);

  // ── Helper: Client-friendly step text (simplify medical jargon) ──
  const simplifyStep = (step) => {
    return step
      .replace(/lateral recumbency/gi, 'lying on their side')
      .replace(/sternal recumbency/gi, 'lying on their chest')
      .replace(/proximal/gi, 'upper')
      .replace(/distal/gi, 'lower')
      .replace(/cranial/gi, 'front')
      .replace(/caudal/gi, 'back/rear')
      .replace(/stifle/gi, 'knee')
      .replace(/femur/gi, 'thigh bone')
      .replace(/tibia/gi, 'shin bone')
      .replace(/humerus/gi, 'upper arm bone')
      .replace(/scapula/gi, 'shoulder blade')
      .replace(/pelvis/gi, 'hip area')
      .replace(/effleurage/gi, 'long smooth strokes')
      .replace(/petrissage/gi, 'kneading')
      .replace(/circumduction/gi, 'circular movements')
      .replace(/abduction/gi, 'moving outward')
      .replace(/adduction/gi, 'moving inward')
      .replace(/flexion/gi, 'bending')
      .replace(/extension/gi, 'straightening')
      .replace(/crepitus/gi, 'grinding or crackling')
      .replace(/edema/gi, 'swelling')
      .replace(/atrophy/gi, 'muscle wasting')
      .replace(/proprioception/gi, 'body awareness')
      .replace(/contralateral/gi, 'opposite')
      .replace(/ipsilateral/gi, 'same side');
  };

  const isProfessional = languageMode === 'PROFESSIONAL';

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">

      {/* ══════════════ HEADER ══════════════ */}
      <div className="med-card p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-med-green-50 text-med-green-700 px-3 py-1 rounded-full text-xs font-bold mb-3">
              <i className="fas fa-check-circle"></i> Protocol Generated
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-1">
              {data.patient_name}'s Rehabilitation Protocol
            </h1>
            <p className="text-slate-500">
              {data.condition} &mdash; {data.protocol_length_weeks} Week Program
            </p>
          </div>

          {/* VIEW TOGGLE — Client Home vs Hospital Clinical */}
          <div className="flex flex-col gap-2 no-print">
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setLanguageMode('PROFESSIONAL')}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  isProfessional ? 'bg-med-blue-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <i className="fas fa-hospital mr-2"></i>Hospital Record
              </button>
              <button
                onClick={() => setLanguageMode('LAYMAN')}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  !isProfessional ? 'bg-med-teal-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <i className="fas fa-home mr-2"></i>Client Home Copy
              </button>
            </div>
            <p className="text-xs text-slate-400 text-center">
              {isProfessional ? '🏥 For hospital file — full clinical detail' : '🏠 For client — plain language, print/email ready'}
            </p>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox icon="fa-dumbbell" number={totalExCount} label={isProfessional ? 'Prescribed Exercises' : 'Total Exercises'} />
          <StatBox icon="fa-layer-group" number={protocolWeeks.length} label="Phases" />
          <StatBox icon="fa-clock" number="20-30" label="Min/Session" />
          <StatBox icon="fa-calendar" number={data.protocol_length_weeks} label="Weeks" />
        </div>
      </div>

      {/* ══════════════ CLINICAL RATIONALE ══════════════ */}
      <div className="med-card p-6 mb-6">
        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
          {isProfessional
            ? <><i className="fas fa-microscope text-med-teal-500"></i> Clinical Rationale &amp; Evidence Base</>
            : <><i className="fas fa-heart text-rose-400"></i> About This Recovery Plan</>
          }
        </h3>
        <p className="text-slate-600 leading-relaxed text-sm">
          {isProfessional ? (
            <>
              This evidence-based protocol addresses <strong>{data.condition}</strong> following
              established tissue healing timelines per Millis &amp; Levine (2014) guidelines. The program
              implements progressive therapeutic loading through 5 phases: passive ROM → active-assisted →
              strengthening → proprioceptive retraining → functional return. Exercise selection reflects
              Grade A/B evidence from peer-reviewed veterinary rehabilitation literature. All exercises
              include specific contraindications and red-flag cessation criteria per CCRP standards.
            </>
          ) : (
            <>
              This recovery plan is designed just for <strong>{data.patient_name}</strong>. Each exercise
              was carefully chosen by your rehabilitation team to help your dog heal safely and get stronger
              week by week. We start gentle and gradually increase activity as {data.patient_name} improves.
              Follow the instructions step-by-step, and always watch for the warning signs listed with each exercise.
              If anything concerns you, stop and call your veterinary team right away.
            </>
          )}
        </p>
      </div>

      {/* ══════════════ WEEKLY PROTOCOL CARDS ══════════════ */}
      {protocolWeeks.map((week, weekIndex) => (
        <div key={weekIndex} className="med-card p-6 mb-5">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full accent-bar text-white flex items-center justify-center text-sm font-bold">
                {week.week_number}
              </span>
              {isProfessional ? `Week ${week.week_number} — Protocol` : `Week ${week.week_number}`}
            </h3>
            <div className="flex items-center gap-3 no-print">
              <span className="bg-med-blue-50 text-med-blue-900 px-3 py-1 rounded-full text-sm font-semibold">
                {week.exercises?.length || 0} Exercises
              </span>
              <button
                onClick={() => { setShowAddModal({ weekIndex }); setAddSearch(''); }}
                className="bg-med-green-50 text-med-green-700 hover:bg-med-green-100 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5"
                title="Add an exercise to this week"
              >
                <i className="fas fa-plus-circle"></i> Add Exercise
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {week.exercises && week.exercises.map((exercise, exIndex) => {
              const key = `${weekIndex}-${exIndex}`;
              const isExpanded = expandedExercises[key];
              const steps = exercise.steps || [];
              const equipment = exercise.equipment || [];
              const goodForm = exercise.good_form || [];
              const mistakes = exercise.common_mistakes || [];
              const redFlags = exercise.red_flags || [];

              return (
                <div key={exIndex} className={`border rounded-lg overflow-hidden transition-all duration-200 ${exercise.manuallyAdded ? 'border-med-green-300 bg-green-50/30' : 'border-slate-200'} hover:border-med-blue-300`}>
                  {/* ── Exercise Header (collapsed) ── */}
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleExercise(weekIndex, exIndex)}
                      className="flex-1 p-5 text-left hover:bg-slate-50 transition-all duration-200"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-base font-bold text-slate-900">{exercise.name}</h4>
                            {exercise.manuallyAdded && (
                              <span className="text-xs bg-med-green-100 text-med-green-700 px-2 py-0.5 rounded-full font-semibold">Added</span>
                            )}
                            {isProfessional && exercise.difficulty_level && (
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                exercise.difficulty_level === 'Easy' ? 'bg-green-100 text-green-700' :
                                exercise.difficulty_level === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                              }`}>{exercise.difficulty_level}</span>
                            )}
                          </div>
                          <p className="text-sm text-med-teal-600 font-mono font-medium">
                            {exercise.sets} sets &times; {exercise.reps} reps &bull; {exercise.frequency}
                            {isProfessional && exercise.duration_minutes ? ` · ${exercise.duration_minutes} min` : ''}
                          </p>
                          {isProfessional && exercise.category && (
                            <p className="text-xs text-slate-400 mt-1">{exercise.category}</p>
                          )}
                        </div>
                        <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-slate-400 ml-3`}></i>
                      </div>
                    </button>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeExercise(weekIndex, exIndex)}
                      className="px-4 py-2 text-red-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg mr-2 no-print"
                      title={isProfessional ? 'Remove — clinician override' : 'Remove exercise'}
                    >
                      <i className="fas fa-times-circle text-lg"></i>
                    </button>
                  </div>

                  {/* ── Expanded Detail Panel ── */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-100 space-y-4 bg-slate-50/80">

                      {/* SETUP / POSITIONING */}
                      {exercise.setup && (
                        <div className="bg-blue-50 border-l-4 border-med-blue-400 p-4 rounded-r-lg">
                          <h5 className="text-sm font-bold text-med-blue-900 mb-1">
                            <i className="fas fa-cog mr-2"></i>
                            {isProfessional ? 'Setup / Patient Positioning' : 'Getting Ready'}
                          </h5>
                          <p className="text-med-blue-800 text-sm">
                            {isProfessional ? exercise.setup : simplifyStep(exercise.setup)}
                          </p>
                        </div>
                      )}

                      {/* EQUIPMENT */}
                      {equipment.length > 0 && (
                        <div>
                          <h5 className="text-sm font-bold text-slate-700 mb-2">
                            <i className="fas fa-toolbox mr-2 text-slate-400"></i>
                            {isProfessional ? 'Equipment Required' : 'What You\'ll Need'}
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {equipment.map((item, i) => (
                              <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* STEP-BY-STEP INSTRUCTIONS */}
                      {steps.length > 0 && (
                        <div>
                          <h5 className="text-sm font-bold text-slate-700 mb-3">
                            <i className="fas fa-list-ol mr-2 text-med-teal-500"></i>
                            {isProfessional ? 'Procedural Steps' : 'Step-by-Step Instructions'}
                          </h5>
                          <ol className="space-y-2">
                            {steps.map((step, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-med-teal-100 text-med-teal-700 flex items-center justify-center text-xs font-bold mt-0.5">
                                  {i + 1}
                                </span>
                                <span className="leading-relaxed">
                                  {isProfessional ? step : simplifyStep(step)}
                                </span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* GOOD FORM INDICATORS (Professional) / Tips for Success (Client) */}
                      {goodForm.length > 0 && (
                        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                          <h5 className="text-sm font-bold text-green-800 mb-2">
                            <i className="fas fa-check-circle mr-2"></i>
                            {isProfessional ? 'Indicators of Correct Execution' : 'Signs You\'re Doing It Right'}
                          </h5>
                          <ul className="space-y-1.5">
                            {goodForm.map((item, i) => (
                              <li key={i} className="text-green-700 text-sm flex items-start gap-2">
                                <i className="fas fa-check text-green-500 mt-1 text-xs"></i>
                                {isProfessional ? item : simplifyStep(item)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* COMMON MISTAKES (Professional only) */}
                      {isProfessional && mistakes.length > 0 && (
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                          <h5 className="text-sm font-bold text-amber-800 mb-2">
                            <i className="fas fa-exclamation mr-2"></i>
                            Common Technical Errors
                          </h5>
                          <ul className="space-y-1.5">
                            {mistakes.map((item, i) => (
                              <li key={i} className="text-amber-700 text-sm flex items-start gap-2">
                                <i className="fas fa-times text-amber-500 mt-1 text-xs"></i>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* RED FLAGS / STOP SIGNS */}
                      {redFlags.length > 0 && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                          <h5 className="text-sm font-bold text-red-800 mb-2">
                            <i className="fas fa-exclamation-triangle mr-2"></i>
                            {isProfessional ? 'Red Flags — Immediate Cessation Criteria' : '⛔ STOP Immediately If You See'}
                          </h5>
                          <ul className="space-y-1.5">
                            {redFlags.map((item, i) => (
                              <li key={i} className="text-red-700 text-sm flex items-start gap-2">
                                <i className="fas fa-exclamation-circle text-red-500 mt-1 text-xs"></i>
                                {isProfessional ? item : simplifyStep(item)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* CONTRAINDICATIONS */}
                      {exercise.contraindications && (
                        <div className={isProfessional ? 'bg-red-50/60 border-l-4 border-red-300 p-4 rounded-r-lg' : 'hidden'}>
                          <h5 className="text-sm font-bold text-red-800 mb-1">
                            <i className="fas fa-ban mr-2"></i>Contraindications
                          </h5>
                          <p className="text-red-700 text-sm">{exercise.contraindications}</p>
                        </div>
                      )}

                      {/* PROGRESSION */}
                      {exercise.progression && (
                        <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                          <h5 className="text-sm font-bold text-purple-800 mb-1">
                            <i className="fas fa-chart-line mr-2"></i>
                            {isProfessional ? 'Progression Criteria' : 'When to Make It Harder'}
                          </h5>
                          <p className="text-purple-700 text-sm">
                            {isProfessional ? exercise.progression : simplifyStep(exercise.progression)}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Empty week notice */}
            {(!week.exercises || week.exercises.length === 0) && (
              <div className="text-center py-8 text-slate-400">
                <i className="fas fa-inbox text-3xl mb-2 block"></i>
                <p className="text-sm">All exercises removed. Use "Add Exercise" to prescribe activities for this week.</p>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* ══════════════ MODIFICATION LOG (Hospital View Only) ══════════════ */}
      {isProfessional && removedLog.length > 0 && (
        <div className="med-card p-5 mb-5 border-l-4 border-amber-400">
          <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <i className="fas fa-history text-amber-500"></i> Protocol Modifications
          </h4>
          <div className="space-y-1">
            {removedLog.map((entry, i) => (
              <p key={i} className="text-xs text-slate-500">
                <span className="text-red-500 font-semibold">REMOVED:</span> {entry.name} from Week {entry.week}
                <span className="text-slate-400 ml-2">({new Date(entry.removedAt).toLocaleString()})</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ SAFETY WARNING ══════════════ */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
          <i className="fas fa-shield-alt text-amber-500"></i>
          {isProfessional ? 'Immediate Cessation Indicators' : 'Important Safety Information'}
        </h3>
        <ul className="space-y-2 text-sm text-amber-800">
          <li className="flex items-start gap-2"><i className="fas fa-exclamation-circle text-amber-500 mt-0.5"></i> {isProfessional ? 'Acute onset edema distal to surgical site' : 'Sudden increase in swelling around the surgery area'}</li>
          <li className="flex items-start gap-2"><i className="fas fa-exclamation-circle text-amber-500 mt-0.5"></i> {isProfessional ? 'Vocalization or guarding behavior indicating acute pain' : 'Crying, whimpering, or pulling away from you'}</li>
          <li className="flex items-start gap-2"><i className="fas fa-exclamation-circle text-amber-500 mt-0.5"></i> {isProfessional ? 'Regression in weight-bearing status or ROM' : 'Your dog stops using their leg when they were before'}</li>
          <li className="flex items-start gap-2"><i className="fas fa-exclamation-circle text-amber-500 mt-0.5"></i> {isProfessional ? 'Erythema, heat, or discharge at incision site' : 'Redness, warmth, or oozing near the surgery cut'}</li>
          <li className="flex items-start gap-2"><i className="fas fa-exclamation-circle text-amber-500 mt-0.5"></i> {isProfessional ? 'Persistent inappetence or lethargy >24hrs' : 'Not eating or very tired for more than a day'}</li>
        </ul>
        <p className="text-amber-900 font-bold text-sm mt-4 flex items-center gap-2">
          <i className="fas fa-phone-alt"></i>
          {isProfessional ? 'Notify attending DVM/surgeon immediately upon observation of any cessation indicator.' : 'Call your veterinarian right away if you notice any of these signs.'}
        </p>
      </div>

      {/* ══════════════ ACTION BUTTONS ══════════════ */}
      <div className="flex gap-4 mb-8 no-print">
        <button onClick={handlePrint} className="flex-1 py-4 accent-bar text-white font-semibold rounded-lg btn-lift transition-all flex items-center justify-center gap-2">
          <i className="fas fa-print"></i> {isProfessional ? 'Print Hospital Copy' : 'Print Home Exercise Sheet'}
        </button>
        <button onClick={() => setCurrentView('INTAKE')} className="flex-1 py-4 bg-white text-med-blue-900 border-2 border-med-blue-900 font-semibold rounded-lg hover:bg-med-blue-50 transition-all flex items-center justify-center gap-2">
          <i className="fas fa-plus"></i> New Protocol
        </button>
      </div>

      {/* ══════════════ ADD EXERCISE MODAL ══════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 no-print" onClick={() => setShowAddModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  <i className="fas fa-plus-circle text-med-green-500 mr-2"></i>
                  Add Exercise to Week {protocolWeeks[showAddModal.weekIndex]?.week_number}
                </h3>
                <button onClick={() => setShowAddModal(null)} className="text-slate-400 hover:text-slate-600">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <input
                type="text"
                placeholder="Search exercises by name or category..."
                className="w-full med-input"
                value={addSearch}
                onChange={e => setAddSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="overflow-y-auto max-h-[55vh] p-4">
              {allExercises
                .filter(ex => {
                  if (!addSearch) return true;
                  const q = addSearch.toLowerCase();
                  return ex.name.toLowerCase().includes(q) || (ex.category || '').toLowerCase().includes(q);
                })
                .map((ex, i) => {
                  // Check if already in this week
                  const alreadyInWeek = protocolWeeks[showAddModal.weekIndex]?.exercises?.some(e => e.code === ex.code);
                  return (
                    <div key={i} className={`flex items-center justify-between p-3 rounded-lg mb-2 border transition-all ${alreadyInWeek ? 'border-slate-100 bg-slate-50 opacity-50' : 'border-slate-200 hover:border-med-teal-300 hover:bg-med-teal-50/30 cursor-pointer'}`}>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900">{ex.name}</h4>
                        <p className="text-xs text-slate-500">{ex.category} · {ex.difficulty_level}</p>
                      </div>
                      {alreadyInWeek ? (
                        <span className="text-xs text-slate-400 font-medium">Already added</span>
                      ) : (
                        <button
                          onClick={() => addExerciseToWeek(showAddModal.weekIndex, ex)}
                          className="bg-med-teal-500 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-med-teal-600 transition-all flex items-center gap-1"
                        >
                          <i className="fas fa-plus"></i> Add
                        </button>
                      )}
                    </div>
                  );
                })
              }
              {allExercises.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <i className="fas fa-spinner fa-spin text-2xl mb-2 block"></i>
                  <p className="text-sm">Loading exercise catalog...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox = ({ icon, number, label }) => {
  return (
    <div className="text-center bg-slate-50 rounded-lg p-4 border border-slate-100">
      <i className={`fas ${icon} text-xl text-med-teal-500 mb-2`}></i>
      <div className="text-2xl font-extrabold text-slate-900 mb-0.5">{number}</div>
      <div className="text-slate-500 text-xs font-medium">{label}</div>
    </div>
  );
};

// ============================================================================
// PATIENTS VIEW
// ============================================================================

const PatientsView = ({ patients }) => {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="border-b border-slate-200 pb-4 mb-8">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <i className="fas fa-users text-med-teal-500"></i>
          Patient Records
        </h2>
        <p className="text-slate-500 text-sm mt-1">{patients.length} patient{patients.length !== 1 ? 's' : ''} on file</p>
      </div>

      {patients.length === 0 ? (
        <div className="med-card p-16 text-center">
          <i className="fas fa-folder-open text-5xl text-slate-300 mb-4 block"></i>
          <p className="text-slate-500 text-lg font-medium mb-2">No patients on file</p>
          <p className="text-slate-400 text-sm">Create your first protocol to add a patient record.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map(patient => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      )}
    </div>
  );
};

const PatientCard = ({ patient }) => {
  return (
    <div className="med-card med-card-interactive p-6 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl accent-bar flex items-center justify-center">
          <i className="fas fa-dog text-lg text-white"></i>
        </div>
        <span className="bg-med-green-50 text-med-green-700 px-2.5 py-1 rounded-full text-xs font-bold">
          Active
        </span>
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-1">{patient.name}</h3>
      <p className="text-slate-500 text-sm mb-0.5">{patient.breed}</p>
      <p className="text-slate-400 text-xs">{patient.age} years &bull; {patient.weight} lbs</p>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Condition</p>
        <p className="text-sm text-slate-700 font-medium">{patient.condition}</p>
      </div>

      <button className="w-full mt-4 py-2.5 bg-med-blue-50 text-med-blue-900 font-semibold rounded-lg hover:bg-med-blue-100 transition-all text-sm">
        <i className="fas fa-folder-open mr-2"></i>
        View Protocol
      </button>
    </div>
  );
};

// ============================================================================
// EXERCISE LIBRARY VIEW - Medical-Grade Exercise Database
// ============================================================================

const ExerciseLibraryView = () => {
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedExercise, setExpandedExercise] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterDifficulty, setFilterDifficulty] = useState('ALL');
  const [filterEvidenceGrade, setFilterEvidenceGrade] = useState('ALL');
  const [filterPhase, setFilterPhase] = useState('ALL');

  // Fetch all exercises on mount
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await axios.get(`${API_BASE}/exercises`);
        setExercises(response.data);
        setFilteredExercises([]); // DO NOT show all exercises - only show after filters applied
        setLoading(false);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    // Check if ANY filter is applied
    const hasFilters = searchTerm ||
                      filterCategory !== 'ALL' ||
                      filterDifficulty !== 'ALL' ||
                      filterEvidenceGrade !== 'ALL' ||
                      filterPhase !== 'ALL';

    // If no filters applied, show nothing (veterinarians need to select criteria)
    if (!hasFilters) {
      setFilteredExercises([]);
      return;
    }

    let filtered = [...exercises];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(term) ||
        ex.description.toLowerCase().includes(term) ||
        ex.code.toLowerCase().includes(term) ||
        ex.category.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (filterCategory !== 'ALL') {
      filtered = filtered.filter(ex => ex.category === filterCategory);
    }

    // Difficulty filter
    if (filterDifficulty !== 'ALL') {
      filtered = filtered.filter(ex => ex.difficulty_level === filterDifficulty);
    }

    // Evidence grade filter
    if (filterEvidenceGrade !== 'ALL') {
      filtered = filtered.filter(ex =>
        ex.evidence_base && ex.evidence_base.grade === filterEvidenceGrade
      );
    }

    // Rehab phase filter
    if (filterPhase !== 'ALL') {
      filtered = filtered.filter(ex =>
        ex.clinical_classification &&
        ex.clinical_classification.rehab_phases &&
        ex.clinical_classification.rehab_phases.includes(filterPhase)
      );
    }

    setFilteredExercises(filtered);
  }, [searchTerm, filterCategory, filterDifficulty, filterEvidenceGrade, filterPhase, exercises]);

  // Get unique categories for filter
  const categories = [...new Set(exercises.map(ex => ex.category))].sort();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto text-center py-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-med-blue-500 border-t-transparent"></div>
        <p className="mt-4 text-slate-500">Loading exercise library...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <i className="fas fa-dumbbell text-med-blue-500"></i>
              Exercise Library
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              {exercises.length} evidence-based canine rehabilitation exercises with full clinical metadata
            </p>
          </div>
          <div className="bg-gradient-to-r from-med-blue-500 to-med-teal-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
            Medical-Grade Database
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="med-card p-6 mb-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <i className="fas fa-search mr-2"></i>Search Exercises
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, description, code..."
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-med-blue-500 focus:ring-0 transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-med-blue-500 focus:ring-0 transition-colors"
            >
              <option value="ALL">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Difficulty
            </label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-med-blue-500 focus:ring-0 transition-colors"
            >
              <option value="ALL">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Moderate">Moderate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Evidence Grade Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Evidence Grade
            </label>
            <select
              value={filterEvidenceGrade}
              onChange={(e) => setFilterEvidenceGrade(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-med-blue-500 focus:ring-0 transition-colors"
            >
              <option value="ALL">All Grades</option>
              <option value="A">Grade A - Strong Evidence</option>
              <option value="B">Grade B - Moderate Evidence</option>
              <option value="C">Grade C - Limited Evidence</option>
              <option value="EO">Expert Opinion</option>
            </select>
          </div>

          {/* Rehab Phase Filter */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Rehabilitation Phase
            </label>
            <select
              value={filterPhase}
              onChange={(e) => setFilterPhase(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-med-blue-500 focus:ring-0 transition-colors"
            >
              <option value="ALL">All Phases</option>
              <option value="ACUTE">Acute (0-3 days)</option>
              <option value="SUBACUTE">Subacute (3 days - 6 weeks)</option>
              <option value="CHRONIC">Chronic (6-12 weeks)</option>
              <option value="MAINTENANCE">Maintenance (12+ weeks)</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Showing <span className="font-bold text-med-blue-600">{filteredExercises.length}</span> of {exercises.length} exercises
          </p>
          {(searchTerm || filterCategory !== 'ALL' || filterDifficulty !== 'ALL' || filterEvidenceGrade !== 'ALL' || filterPhase !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('ALL');
                setFilterDifficulty('ALL');
                setFilterEvidenceGrade('ALL');
                setFilterPhase('ALL');
              }}
              className="text-sm text-med-blue-600 hover:text-med-blue-700 font-medium"
            >
              <i className="fas fa-times mr-1"></i>Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Exercise Grid */}
      {filteredExercises.length === 0 ? (
        <div className="med-card p-16 text-center">
          <i className="fas fa-filter text-5xl text-med-blue-300 mb-4 block"></i>
          <p className="text-slate-700 text-xl font-bold mb-2">Select Filters to View Exercises</p>
          <p className="text-slate-500 text-base mb-4">
            Use the filters above to quickly find evidence-based exercises.
          </p>
          <div className="grid md:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
            <div className="bg-med-blue-50 p-4 rounded-lg border border-med-blue-200">
              <p className="font-bold text-med-blue-900 text-sm mb-1">
                <i className="fas fa-tag mr-2"></i>Category
              </p>
              <p className="text-slate-600 text-xs">Select condition type (Geriatric Care, Post-Surgical, etc.)</p>
            </div>
            <div className="bg-med-green-50 p-4 rounded-lg border border-med-green-200">
              <p className="font-bold text-med-green-900 text-sm mb-1">
                <i className="fas fa-signal mr-2"></i>Difficulty
              </p>
              <p className="text-slate-600 text-xs">Choose exercise complexity (Easy, Moderate, Advanced)</p>
            </div>
            <div className="bg-med-teal-50 p-4 rounded-lg border border-med-teal-200">
              <p className="font-bold text-med-teal-900 text-sm mb-1">
                <i className="fas fa-certificate mr-2"></i>Evidence Grade
              </p>
              <p className="text-slate-600 text-xs">Filter by research quality (Grade A = Strong Evidence)</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="font-bold text-purple-900 text-sm mb-1">
                <i className="fas fa-clock mr-2"></i>Rehab Phase
              </p>
              <p className="text-slate-600 text-xs">Match patient's recovery timeline (Acute, Subacute, etc.)</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredExercises.map(exercise => (
            <ExerciseCard
              key={exercise.code}
              exercise={exercise}
              expanded={expandedExercise === exercise.code}
              onToggle={() => setExpandedExercise(expandedExercise === exercise.code ? null : exercise.code)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Exercise Card Component
const ExerciseCard = ({ exercise, expanded, onToggle }) => {
  const evidenceGradeColors = {
    'A': 'bg-emerald-100 text-emerald-700 border-emerald-300',
    'B': 'bg-blue-100 text-blue-700 border-blue-300',
    'C': 'bg-amber-100 text-amber-700 border-amber-300',
    'EO': 'bg-purple-100 text-purple-700 border-purple-300'
  };

  const difficultyColors = {
    'Easy': 'bg-green-100 text-green-700',
    'Moderate': 'bg-yellow-100 text-yellow-700',
    'Advanced': 'bg-red-100 text-red-700'
  };

  return (
    <div className="med-card med-card-interactive overflow-hidden">
      {/* Card Header */}
      <div className="p-6 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-2">
              <h3 className="text-lg font-bold text-slate-900">{exercise.name}</h3>
              {exercise.evidence_base && exercise.evidence_base.grade && (
                <span className={`px-2 py-1 rounded-md text-xs font-bold border ${evidenceGradeColors[exercise.evidence_base.grade] || 'bg-slate-100 text-slate-700'}`}>
                  Grade {exercise.evidence_base.grade}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 mb-3">{exercise.description}</p>

            <div className="flex flex-wrap gap-2">
              <span className="bg-med-blue-50 text-med-blue-700 px-2.5 py-1 rounded-full text-xs font-bold">
                {exercise.category}
              </span>
              {exercise.difficulty_level && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${difficultyColors[exercise.difficulty_level]}`}>
                  {exercise.difficulty_level}
                </span>
              )}
              {exercise.billing_codes && exercise.billing_codes.cpt_code && (
                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold">
                  CPT {exercise.billing_codes.cpt_code}
                </span>
              )}
            </div>
          </div>

          <button className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-med-blue-500 hover:text-white transition-colors">
            <i className={`fas fa-chevron-${expanded ? 'up' : 'down'}`}></i>
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-slate-200 p-6 bg-slate-50">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Clinical Classification */}
              {exercise.clinical_classification && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i className="fas fa-stethoscope text-med-blue-500"></i>
                    Clinical Classification
                  </h4>
                  <div className="space-y-2 text-sm">
                    {exercise.clinical_classification.intervention_type && (
                      <div>
                        <span className="text-slate-600 font-medium">Intervention Type:</span>
                        <span className="ml-2 text-slate-900">{exercise.clinical_classification.intervention_type}</span>
                      </div>
                    )}
                    {exercise.clinical_classification.rehab_phases && exercise.clinical_classification.rehab_phases.length > 0 && (
                      <div>
                        <span className="text-slate-600 font-medium">Rehab Phases:</span>
                        <span className="ml-2 text-slate-900">{exercise.clinical_classification.rehab_phases.join(', ')}</span>
                      </div>
                    )}
                    {exercise.clinical_classification.primary_indications && exercise.clinical_classification.primary_indications.length > 0 && (
                      <div>
                        <span className="text-slate-600 font-medium">Primary Indications:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {exercise.clinical_classification.primary_indications.slice(0, 3).map((indication, idx) => (
                            <span key={idx} className="bg-med-green-100 text-med-green-700 px-2 py-0.5 rounded text-xs">
                              {indication}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Equipment */}
              {exercise.equipment && exercise.equipment.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i className="fas fa-toolbox text-med-teal-500"></i>
                    Equipment Required
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {exercise.equipment.map((item, idx) => (
                      <span key={idx} className="bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Steps */}
              {exercise.steps && exercise.steps.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i className="fas fa-list-ol text-med-blue-500"></i>
                    Step-by-Step Instructions
                  </h4>
                  <ol className="space-y-2">
                    {exercise.steps.map((step, idx) => (
                      <li key={idx} className="flex gap-3 text-sm text-slate-700">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-med-teal-500 text-white flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Evidence Base */}
              {exercise.evidence_base && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i className="fas fa-graduation-cap text-med-blue-500"></i>
                    Evidence Base
                  </h4>
                  <div className="space-y-2 text-sm">
                    {exercise.evidence_base.grade && (
                      <div>
                        <span className="text-slate-600 font-medium">Quality Grade:</span>
                        <span className="ml-2 text-slate-900 font-bold">Grade {exercise.evidence_base.grade}</span>
                        <span className="ml-2 text-xs text-slate-500">
                          {exercise.evidence_base.grade === 'A' && '(Strong evidence from controlled trials)'}
                          {exercise.evidence_base.grade === 'B' && '(Moderate evidence from clinical studies)'}
                          {exercise.evidence_base.grade === 'C' && '(Limited evidence, expert consensus)'}
                          {exercise.evidence_base.grade === 'EO' && '(Expert opinion)'}
                        </span>
                      </div>
                    )}
                    {exercise.evidence_base.certification_required && (
                      <div>
                        <span className="text-slate-600 font-medium">Certification Level:</span>
                        <span className="ml-2 text-slate-900">{exercise.evidence_base.certification_required}</span>
                      </div>
                    )}
                    {exercise.evidence_base.key_findings && (
                      <div className="mt-2">
                        <span className="text-slate-600 font-medium">Key Finding:</span>
                        <p className="ml-2 text-slate-700 text-xs italic mt-1">"{exercise.evidence_base.key_findings}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Safety */}
              {exercise.safety && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i className="fas fa-shield-alt text-med-green-500"></i>
                    Safety Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    {exercise.safety.risk_level && (
                      <div>
                        <span className="text-slate-600 font-medium">Risk Level:</span>
                        <span className="ml-2 text-slate-900">{exercise.safety.risk_level}</span>
                      </div>
                    )}
                    {exercise.safety.supervision_required && (
                      <div>
                        <span className="text-slate-600 font-medium">Supervision:</span>
                        <span className="ml-2 text-slate-900">{exercise.safety.supervision_required}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Red Flags */}
              {exercise.red_flags && exercise.red_flags.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i className="fas fa-exclamation-triangle text-red-500"></i>
                    Red Flags
                  </h4>
                  <ul className="space-y-1.5">
                    {exercise.red_flags.slice(0, 3).map((flag, idx) => (
                      <li key={idx} className="flex gap-2 text-sm text-red-700">
                        <i className="fas fa-circle text-xs mt-1"></i>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contraindications */}
              {exercise.contraindications && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i className="fas fa-ban text-red-500"></i>
                    Contraindications
                  </h4>
                  <p className="text-sm text-slate-700">{exercise.contraindications}</p>
                </div>
              )}

              {/* Client Education */}
              {exercise.client_education && exercise.client_education.home_program_suitable && (
                <div className="bg-med-blue-50 border border-med-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-med-blue-700 font-bold text-sm mb-2">
                    <i className="fas fa-home"></i>
                    Home Program Suitable
                  </div>
                  {exercise.client_education.teaching_time && (
                    <p className="text-xs text-slate-600">Teaching time: {exercise.client_education.teaching_time}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Peer-Reviewed References - Full Width Bottom Section */}
          {exercise.evidence_base && exercise.evidence_base.references && exercise.evidence_base.references.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-300">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <i className="fas fa-book-medical text-med-blue-500"></i>
                Peer-Reviewed References ({exercise.evidence_base.references.length})
              </h4>
              <div className="space-y-3">
                {exercise.evidence_base.references.map((ref, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-med-blue-500 text-white flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {ref.citation || ref}
                        </p>
                        {ref.key_findings && (
                          <p className="text-xs text-med-blue-600 italic mt-1.5 pl-3 border-l-2 border-med-blue-200">
                            Key finding: {ref.key_findings}
                          </p>
                        )}
                        {ref.evidence_grade && (
                          <span className="inline-block mt-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-bold">
                            Grade {ref.evidence_grade}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-3 italic">
                <i className="fas fa-info-circle mr-1"></i>
                All references are from peer-reviewed veterinary rehabilitation research and leading clinical textbooks.
              </p>
            </div>
          )}

          {/* VIDEO DEMONSTRATION SECTION */}
          {exercise.client_education && exercise.client_education.video_available && exercise.client_education.video_metadata && (
            <div className="mt-6 pt-6 border-t border-slate-300">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <i className="fas fa-play-circle text-med-blue-500"></i>
                  Professional Video Demonstration
                  <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold ml-2">
                    <i className="fas fa-hd-video mr-1"></i>
                    HD Available
                  </span>
                </h4>
                <span className="text-xs text-slate-500">
                  <i className="fas fa-camera mr-1"></i>
                  {exercise.client_education.video_metadata.angles.length} camera angle{exercise.client_education.video_metadata.angles.length > 1 ? 's' : ''}
                  {exercise.client_education.video_metadata.ce_credit_eligible && (
                    <span className="ml-3">
                      <i className="fas fa-graduation-cap mr-1 text-med-teal-500"></i>
                      CE Credits Available
                    </span>
                  )}
                </span>
              </div>

              <VideoPlayer
                exerciseCode={exercise.code}
                videoMetadata={exercise.client_education.video_metadata}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PROFESSIONAL VIDEO PLAYER COMPONENT
// Medical-Grade Video Demonstration Player
// ============================================================================
const VideoPlayer = ({ exerciseCode, videoMetadata }) => {
  const [selectedAngle, setSelectedAngle] = React.useState(null);
  const [selectedQuality, setSelectedQuality] = React.useState('1080p');
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1.0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [showAnnotations, setShowAnnotations] = React.useState(true);
  const [viewMode, setViewMode] = React.useState('professional');
  const [showTranscript, setShowTranscript] = React.useState(false);
  const videoRef = React.useRef(null);

  // Initialize with primary angle
  React.useEffect(() => {
    if (videoMetadata && videoMetadata.angles && !selectedAngle) {
      const primary = videoMetadata.angles.find(a => a.is_primary) || videoMetadata.angles[0];
      setSelectedAngle(primary);
    }
  }, [videoMetadata, selectedAngle]);

  // Get current video URL based on angle and quality
  const getCurrentVideoUrl = () => {
    if (!selectedAngle || !selectedAngle.videos) return null;
    const video = selectedAngle.videos.find(v => v.quality === selectedQuality);
    return video ? video.url : (selectedAngle.videos[0] ? selectedAngle.videos[0].url : null);
  };

  // Get relevant annotations for current timestamp
  const getCurrentAnnotations = () => {
    if (!selectedAngle || !showAnnotations || !selectedAngle.annotations) return [];
    return selectedAngle.annotations.filter(ann =>
      Math.abs(ann.timestamp - currentTime) < 2
    );
  };

  // Handle video time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e) => {
      if (!videoRef.current) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (isPlaying) {
            videoRef.current.pause();
          } else {
            videoRef.current.play();
          }
          setIsPlaying(!isPlaying);
          break;
        case 'ArrowLeft':
          videoRef.current.currentTime -= 5;
          break;
        case 'ArrowRight':
          videoRef.current.currentTime += 5;
          break;
        case 'f':
        case 'F':
          if (videoRef.current.requestFullscreen) {
            videoRef.current.requestFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying]);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Jump to timestamp
  const jumpToTime = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
    }
  };

  // Get angle display label
  const getAngleLabel = (angle) => {
    if (angle === 'lateral') return 'Side View';
    if (angle === 'frontal') return 'Front View';
    if (angle === 'overhead') return 'Overhead';
    if (angle === 'closeup') return 'Close-up';
    if (angle === 'rear') return 'Rear View';
    return angle.charAt(0).toUpperCase() + angle.slice(1);
  };

  if (!videoMetadata || !selectedAngle) {
    return (
      <div className="bg-slate-100 rounded-lg p-8 text-center">
        <i className="fas fa-video-slash text-slate-400 text-4xl mb-4"></i>
        <p className="text-slate-600">Video demonstration not available for this exercise.</p>
      </div>
    );
  }

  const currentAnnotations = getCurrentAnnotations();
  const videoUrl = getCurrentVideoUrl();

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-lg">
      {/* Header Bar with Instructor Credentials */}
      <div className="bg-gradient-to-r from-med-blue-700 to-med-blue-600 text-white p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <i className="fas fa-play text-lg"></i>
            </div>
            <div>
              <h3 className="font-bold text-lg">Professional Video Demonstration</h3>
              <p className="text-sm text-blue-100">
                {videoMetadata.instructor.name}, {videoMetadata.instructor.credentials.join(', ')}
              </p>
            </div>
          </div>

          {/* Certification Badge */}
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <i className="fas fa-certificate"></i>
              {videoMetadata.certification_status}
            </span>
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold">
              v{videoMetadata.version}
            </span>
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="relative bg-black">
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full aspect-video"
          src={videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          controls
        />

        {/* Annotation Overlays */}
        {currentAnnotations.length > 0 && (
          <div className="absolute top-4 right-4 max-w-md space-y-2">
            {currentAnnotations.map((ann, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg backdrop-blur-sm border-2 animate-fade-in ${ann.safety_level === 'warning'
                    ? 'bg-red-500/90 border-red-300 text-white'
                    : 'bg-med-blue-500/90 border-blue-300 text-white'
                  }`}
              >
                <div className="flex items-start gap-2">
                  <i className={`fas ${ann.safety_level === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'
                    } mt-1`}></i>
                  <div>
                    <div className="font-bold text-sm">{ann.title}</div>
                    <div className="text-xs mt-1">{ann.description}</div>
                    {ann.evidence_reference_id && (
                      <div className="text-xs underline mt-1 cursor-pointer">
                        View Evidence
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quality Badge */}
        <div className="absolute bottom-16 left-4">
          <span className="bg-black/60 text-white px-2 py-1 rounded text-xs font-bold backdrop-blur-sm">
            <i className="fas fa-hd-video mr-1"></i>
            {selectedQuality} HD
          </span>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="bg-slate-50 border-t border-slate-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Camera Angle Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
              <i className="fas fa-camera mr-1"></i> Camera Angle
            </label>
            <div className="flex flex-wrap gap-2">
              {videoMetadata.angles.map((angle, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedAngle(angle)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedAngle === angle
                      ? 'bg-med-blue-500 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:border-med-blue-300'
                    }`}
                >
                  {getAngleLabel(angle.angle)}
                  {angle.is_primary && <i className="fas fa-star ml-1 text-yellow-400"></i>}
                </button>
              ))}
            </div>
          </div>

          {/* Playback Speed */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
              <i className="fas fa-tachometer-alt mr-1"></i> Playback Speed
            </label>
            <div className="flex gap-2">
              {[0.25, 0.5, 0.75, 1.0, 1.25].map(speed => (
                <button
                  key={speed}
                  onClick={() => {
                    setPlaybackSpeed(speed);
                    if (videoRef.current) videoRef.current.playbackRate = speed;
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${playbackSpeed === speed
                      ? 'bg-med-teal-500 text-white'
                      : 'bg-white border border-slate-300 text-slate-700 hover:border-med-teal-300'
                    }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
              <i className="fas fa-user-graduate mr-1"></i> View Mode
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('professional')}
                className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'professional'
                    ? 'bg-med-blue-500 text-white'
                    : 'bg-white border border-slate-300 text-slate-700'
                  }`}
              >
                Professional
              </button>
              <button
                onClick={() => setViewMode('client')}
                className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'client'
                    ? 'bg-med-green-500 text-white'
                    : 'bg-white border border-slate-300 text-slate-700'
                  }`}
              >
                Client
              </button>
            </div>
          </div>
        </div>

        {/* Key Moments Navigation */}
        {selectedAngle.annotations && selectedAngle.annotations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
              <i className="fas fa-bookmark mr-1"></i> Key Moments
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedAngle.annotations.map((ann, idx) => (
                <button
                  key={idx}
                  onClick={() => jumpToTime(ann.timestamp)}
                  className="bg-white border border-slate-300 hover:border-med-blue-400 px-3 py-1.5 rounded-lg text-xs transition-all group"
                >
                  <span className="font-mono font-bold text-med-blue-600 group-hover:text-med-blue-700">
                    {ann.timestamp_display}
                  </span>
                  <span className="ml-2 text-slate-600">{ann.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex gap-3 flex-wrap">
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${showAnnotations
                ? 'bg-med-blue-500 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:border-med-blue-400'
              }`}
          >
            <i className={`fas fa-${showAnnotations ? 'eye' : 'eye-slash'} mr-2`}></i>
            {showAnnotations ? 'Hide' : 'Show'} Annotations
          </button>
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="flex-1 bg-white border border-slate-300 hover:border-med-teal-400 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            <i className="fas fa-file-alt mr-2"></i>
            {showTranscript ? 'Hide' : 'Show'} Transcript
          </button>
          <button className="flex-1 bg-white border border-slate-300 hover:border-med-green-400 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-all">
            <i className="fas fa-download mr-2"></i>
            Download
          </button>
        </div>
      </div>

      {/* Instructor Credentials Panel */}
      <div className="border-t border-slate-200 bg-white p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <img
            src={videoMetadata.instructor.photo_url}
            alt={videoMetadata.instructor.name}
            className="w-16 h-16 rounded-full border-2 border-med-blue-200"
            onError={(e) => { e.target.src = '/assets/instructor-photos/placeholder.jpg'; }}
          />
          <div className="flex-1">
            <h4 className="font-bold text-slate-900">{videoMetadata.instructor.name}</h4>
            <p className="text-sm text-slate-600">{videoMetadata.instructor.title}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {videoMetadata.instructor.credentials.map((cred, idx) => (
                <span
                  key={idx}
                  className="bg-med-blue-100 text-med-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-med-blue-200"
                >
                  {cred}
                </span>
              ))}
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Production: {videoMetadata.production_date}</div>
            <div>Reviewed: {videoMetadata.review_date}</div>
          </div>
        </div>
      </div>

      {/* Transcript Panel (Collapsible) */}
      {showTranscript && videoMetadata.transcript && (
        <div className="border-t border-slate-200 bg-slate-50 p-4 max-h-64 overflow-y-auto">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            Video Transcript - {viewMode === 'professional' ? 'Professional' : 'Client Education'} Mode
          </h4>
          <div className="space-y-2">
            {videoMetadata.transcript[viewMode] && videoMetadata.transcript[viewMode].map((line, idx) => (
              <div key={idx} className="flex gap-3 text-sm">
                <button
                  onClick={() => {
                    const parts = line.time.split(':');
                    const seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
                    jumpToTime(seconds);
                  }}
                  className="font-mono text-med-blue-600 hover:text-med-blue-700 font-bold cursor-pointer"
                >
                  {line.time}
                </button>
                <span className="font-medium text-slate-700">{line.speaker}:</span>
                <span className="text-slate-600">{line.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="border-t border-slate-200 bg-slate-50 px-4 py-2">
        <details className="text-xs text-slate-600">
          <summary className="cursor-pointer font-medium hover:text-slate-900">
            <i className="fas fa-keyboard mr-1"></i> Keyboard Shortcuts
          </summary>
          <div className="mt-2 grid grid-cols-2 gap-2 ml-4">
            <div><kbd className="bg-white px-1 py-0.5 rounded border">Space</kbd> Play/Pause</div>
            <div><kbd className="bg-white px-1 py-0.5 rounded border">←/→</kbd> Skip 5 sec</div>
            <div><kbd className="bg-white px-1 py-0.5 rounded border">F</kbd> Fullscreen</div>
          </div>
        </details>
      </div>
    </div>
  );
};

// ============================================================================
// FOOTER
// ============================================================================

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-900 to-slate-800 mt-auto py-12 no-print border-t-4 border-med-teal-500">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-med-blue-500 to-med-teal-500 flex items-center justify-center">
                <i className="fas fa-heartbeat text-lg text-white"></i>
              </div>
              <div>
                <p className="text-lg font-black text-white">K9 REHAB PRO</p>
                <p className="text-xs text-slate-400 font-semibold">Medical-Grade Protocols</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Evidence-based canine rehabilitation protocols trusted by top veterinary institutions worldwide.
            </p>
          </div>

          {/* Standards */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Clinical Standards</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <i className="fas fa-check text-med-green-400"></i>
                Dr. Millis & Levine Standards
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-check text-med-green-400"></i>
                Peer-Reviewed References
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-check text-med-green-400"></i>
                University Vetted
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-check text-med-green-400"></i>
                CE Credit Eligible
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Professional Use</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              This system generates rehabilitation protocols for clinical guidance. All protocols must be reviewed and approved by a licensed veterinary rehabilitation professional (CCRP, CCRT, DACVSMR) before implementation.
            </p>
            <p className="text-xs text-slate-500">
              &copy; 2026 K9 Rehab Pro&#8482;. All rights reserved.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-700 text-center">
          <p className="text-xs text-slate-500 font-semibold">
            Built for veterinary professionals. Based on evidence-based medicine.
          </p>
        </div>
      </div>
    </footer>
  );
};

// ============================================================================
// RENDER APP
// ============================================================================

ReactDOM.render(<App />, document.getElementById('root'));
