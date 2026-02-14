// ============================================================================
// PATIENT INTAKE FORM COMPONENT - Part 1: Imports and Types
// ============================================================================

import React, { useState, useEffect } from 'react';
import { apiService, PatientData, Protocol } from '../services/api';
import './PatientIntakeForm.css';

// ============================================================================
// DIAGNOSIS OPTIONS
// ============================================================================

const DIAGNOSIS_OPTIONS = [
  { value: 'TPLO', label: 'TPLO (Tibial Plateau Leveling Osteotomy)' },
  { value: 'CCL_CONSERVATIVE', label: 'CCL - Conservative Management' },
  { value: 'FHO', label: 'FHO (Femoral Head Ostectomy)' },
  { value: 'HIP_DYSPLASIA', label: 'Hip Dysplasia' },
  { value: 'ELBOW_DYSPLASIA', label: 'Elbow Dysplasia' },
  { value: 'PATELLAR_LUXATION', label: 'Patellar Luxation' },
  { value: 'FRACTURE_FEMUR', label: 'Femoral Fracture Repair' },
  { value: 'AMPUTATION', label: 'Limb Amputation' }
];

// ============================================================================
// COMMON GOALS
// ============================================================================

const COMMON_GOALS = [
  'Reduce pain and inflammation',
  'Improve range of motion',
  'Strengthen affected limb',
  'Improve balance and proprioception',
  'Return to normal daily activities',
  'Build endurance',
  'Prevent muscle atrophy'
];
// ============================================================================
// PATIENT INTAKE FORM COMPONENT - Part 1: Imports and Types
// ============================================================================

import React, { useState, useEffect } from 'react';
import { apiService, PatientData, Protocol } from '../services/api';
import './PatientIntakeForm.css';

// ============================================================================
// DIAGNOSIS OPTIONS
// ============================================================================

const DIAGNOSIS_OPTIONS = [
  { value: 'TPLO', label: 'TPLO (Tibial Plateau Leveling Osteotomy)' },
  { value: 'CCL_CONSERVATIVE', label: 'CCL - Conservative Management' },
  { value: 'FHO', label: 'FHO (Femoral Head Ostectomy)' },
  { value: 'HIP_DYSPLASIA', label: 'Hip Dysplasia' },
  { value: 'ELBOW_DYSPLASIA', label: 'Elbow Dysplasia' },
  { value: 'PATELLAR_LUXATION', label: 'Patellar Luxation' },
  { value: 'FRACTURE_FEMUR', label: 'Femoral Fracture Repair' },
  { value: 'AMPUTATION', label: 'Limb Amputation' }
];

// ============================================================================
// COMMON GOALS
// ============================================================================

const COMMON_GOALS = [
  'Reduce pain and inflammation',
  'Improve range of motion',
  'Strengthen affected limb',
  'Improve balance and proprioception',
  'Return to normal daily activities',
  'Build endurance',
  'Prevent muscle atrophy'
];

// ============================================================================
// COMPONENT
// ============================================================================

export const PatientIntakeForm: React.FC = () => {
  
  // Form state
  const [formData, setFormData] = useState<PatientData>({
    clientName: '',
    patientName: '',
    species: 'Canine',
    breed: '',
    age: 0,
    weight: 0,
    diagnosis: '',
    painWithActivity: 5,
    mobilityLevel: 5,
    goals: [],
    protocolLength: 8
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedProtocol, setGeneratedProtocol] = useState<Protocol | null>(null);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [customGoal, setCustomGoal] = useState('');

  // Check server health on mount
  useEffect(() => {
    checkServerHealth();
  }, []);

  // Update form data when goals change
  useEffect(() => {
    setFormData(prev => ({ ...prev, goals: selectedGoals }));
  }, [selectedGoals]);

  // Check server health
  const checkServerHealth = async () => {
    try {
      await apiService.checkHealth();
      setServerStatus('online');
    } catch (error) {
      setServerStatus('offline');
      setError('Unable to connect to server. Please ensure the backend is running on http://localhost:3000');
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'weight' || name === 'painWithActivity' || name === 'mobilityLevel' || name === 'protocolLength'
        ? Number(value)
        : value
    }));
  };

  // Handle goal selection
  const handleGoalToggle = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  // Add custom goal
  const handleAddCustomGoal = () => {
    if (customGoal.trim() && !selectedGoals.includes(customGoal.trim())) {
      setSelectedGoals(prev => [...prev, customGoal.trim()]);
      setCustomGoal('');
    }
  };

  // Remove goal
  const handleRemoveGoal = (goal: string) => {
    setSelectedGoals(prev => prev.filter(g => g !== goal));
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.clientName.trim()) {
      setError('Client name is required');
      return false;
    }
    if (!formData.patientName.trim()) {
      setError('Patient name is required');
      return false;
    }
    if (!formData.breed.trim()) {
      setError('Breed is required');
      return false;
    }
    if (formData.age <= 0) {
      setError('Valid age is required');
      return false;
    }
    if (formData.weight <= 0) {
      setError('Valid weight is required');
      return false;
    }
    if (!formData.diagnosis) {
      setError('Diagnosis is required');
      return false;
    }
    if (selectedGoals.length === 0) {
      setError('Please select at least one rehabilitation goal');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.generateProtocol(formData);
      setGeneratedProtocol(response.protocol);
      
      // Scroll to protocol display
      setTimeout(() => {
        document.getElementById('protocol-display')?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
      
    } catch (err: any) {
      setError(err.message || 'Failed to generate protocol');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      clientName: '',
      patientName: '',
      species: 'Canine',
      breed: '',
      age: 0,
      weight: 0,
      diagnosis: '',
      painWithActivity: 5,
      mobilityLevel: 5,
      goals: [],
      protocolLength: 8
    });
    setSelectedGoals([]);
    setCustomGoal('');
    setGeneratedProtocol(null);
    setError(null);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="intake-form-container">
      {/* Header */}
      <header className="form-header">
        <h1>🐾 K9-REHAB-PRO</h1>
        <p className="subtitle">Evidence-Based Canine Rehabilitation</p>
        <div className="server-status">
          Server Status: 
          <span className={`status-indicator status-${serverStatus}`}>
            {serverStatus === 'checking' && ' Checking...'}
            {serverStatus === 'online' && ' ● Online'}
            {serverStatus === 'offline' && ' ● Offline'}
          </span>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
          <button onClick={() => setError(null)} className="close-error">×</button>
        </div>
      )}

      {/* Main Form */}
      {!generatedProtocol && (
        <form onSubmit={handleSubmit} className="intake-form">
          
          {/* Client Information Section */}
          <section className="form-section">
            <h2>Client Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="clientName">
                  Client Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="clientName"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  placeholder="Dr. Smith"
                  required
                />
              </div>
            </div>
          </section>
