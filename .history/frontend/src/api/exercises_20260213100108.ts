import axios from "axios";

export interface Exercise {
  code: string;
  name: string;
  category: string;
  difficulty_level: string;
  description: string;
}

export const getExercises = async (): Promise<Exercise[]> => {
  const response = await axios.get("http://localhost:5001/api/exercises");
  return response.data;
};

export const getExerciseByCode = async (code: string): Promise<Exercise> => {
  const response = await axios.get(
    `http://localhost:5001/api/exercises/${code}`,
  );
  return response.data;
};
