import React, { useState } from "react";

interface PatientIntakeData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  patientName: string;
  breed: string;
  age: string;
  weight: string;
  surgeryStatus: string;
  diagnosis: string;
  notes: string;
}

const PatientIntakeForm: React.FC = () => {
  const [formData, setFormData] = useState<PatientIntakeData>({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    patientName: "",
    breed: "",
    age: "",
    weight: "",
    surgeryStatus: "",
    diagnosis: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted Intake Form:", formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "1rem" }}>
      <h2>Patient Intake Form</h2>

      <label>Client Name</label>
      <input name="clientName" value={formData.clientName} onChange={handleChange} />

      <label>Client Email</label>
      <input name="clientEmail" value={formData.clientEmail} onChange={handleChange} />

      <label>Client Phone</label>
      <input name="clientPhone" value={formData.clientPhone} onChange={handleChange} />

      <label>Patient Name</label>
      <input name="patientName" value={formData.patientName} onChange={handleChange} />

      <label>Breed</label>
      <input name="breed" value={formData.breed} onChange={handleChange} />

      <label>Age</label>
      <input name="age" value={formData.age} onChange={handleChange} />

      <label>Weight</label>
      <input name="weight" value={formData.weight} onChange={handleChange} />

      <label>Surgery Status</label>
      <select name="surgeryStatus" value={formData.surgeryStatus} onChange={handleChange}>
        <option value="">Select...</option>
        <option value="no-surgery">No Surgery</option>
        <option value="post-surgical">Post-Surgical</option>
        <option value="client-elects-no-surgery">Client Elects No Surgery</option>
      </select>

      <label>Diagnosis</label>
      <input name="diagnosis" value={formData.diagnosis} onChange={handleChange} />

      <label>Notes</label>
      <textarea name="notes" value={formData.notes} onChange={handleChange} />

      <button type="submit" style={{ marginTop: "1rem" }}>
        Submit
      </button>
    </form>
  );
};

export default PatientIntakeForm;