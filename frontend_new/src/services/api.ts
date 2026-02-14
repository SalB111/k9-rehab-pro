// ============================================================================
// K9-REHAB-PRO API SERVICE
// Handles all communication with the backend server
// ============================================================================

import { CORE_API_BASE_URL } from "../config/api";

// ============================================================================
// TYPES
// ============================================================================

export interface PatientData {
  clientName: string;
  patientName: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  diagnosis: string;
  painWithActivity: number;
  mobilityLevel: number;
  goals: string[];
  protocolLength: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  dosage: string;
  frequency: string;
  precautions: string[];
}

export interface WeeklyProtocol {
  weekNumber: number;
  exercises: Exercise[];
  weeklyGoals: string[];
  progressionCriteria: string[];
}

export interface Protocol {
  protocolId: string;
  patientName: string;
  diagnosis: string;
  diagnosisName: string;
  rehabStage: string;
  protocolLength: number;
  weeklyProtocol: WeeklyProtocol[];
  safetyConsiderations: string[];
  homeExerciseGuidelines: string[];
}

export interface GenerateProtocolResponse {
  protocol: Protocol;
  database?: {
    saved: boolean;
    patient_id: number;
    protocol_id: string;
  };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

class ApiService {
  
  /**
   * Generate a new rehabilitation protocol
   */
  async generateProtocol(patientData: PatientData): Promise<GenerateProtocolResponse> {
    try {
      const response = await fetch(`${CORE_API_BASE_URL}/generate-protocol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate protocol');
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating protocol:', error);
      throw error;
    }
  }

  /**
   * Get supported conditions
   */
  async getConditions(): Promise<any> {
    try {
      const response = await fetch(`${CORE_API_BASE_URL}/conditions`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch conditions');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching conditions:', error);
      throw error;
    }
  }

  /**
   * Check server health
   */
  async checkHealth(): Promise<any> {
    try {
      const response = await fetch(`${CORE_API_BASE_URL}/health`);
      
      if (!response.ok) {
        throw new Error('Server health check failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking server health:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
