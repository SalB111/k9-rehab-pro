import axios from "axios";

export interface Exercise {
  code: string;
  name: string;
  category: string;
  difficulty_level: string;
  description: string;
}

const API_URL = "http://localhost:5001/api/exercises";

export const getAllExercises = async (): Promise<Exercise[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getExerciseByCode = async (code: string): Promise<Exercise> => {
  const response = await axios.get(`${API_URL}/${code}`);
  return response.data;
};
