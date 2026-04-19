// Rehab Calculators — iframe embed of the standalone calculators app
// (deployed at rehab-calculators.vercel.app). Companion to PetCare Nutrition.
// Covers BCS / ideal weight, caloric needs (RER/MER), UWTM buoyancy, goniometric
// ROM, CBPI, FMPI, FGS, and canine/feline phase dosing — all evidence-based
// per Millis & Levine, WSAVA, NRC, AAHA, and Brown/Evangelista/Benito.

export default function RehabCalculatorsView() {
  return (
    <div style={{ width: "100%", height: "calc(100vh - 80px)", padding: 0 }}>
      <iframe
        src="https://rehab-calculators.vercel.app/"
        title="Weight Calculator — Clinical Decision Support"
        style={{
          width: "100%",
          height: "100%",
          border: 0,
          borderRadius: 8,
          background: "#ffffff",
        }}
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}
