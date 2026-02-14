import { Exercise } from "../types/exercise";

const API_URL = "http://localhost:3000";

export async function getAllExercises(): Promise<Exercise[]> {
  const res = await fetch(`${API_URL}/exercises`);
  if (!res.ok) throw new Error("Failed to fetch exercises");
  return res.json();
}

export async function getExerciseByCode(code: string): Promise<Exercise> {
  const res = await fetch(`${API_URL}/exercises/${code}`);
  if (!res.ok) throw new Error("Exercise not found");
  return res.json();
}
