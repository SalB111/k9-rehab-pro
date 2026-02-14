import { Exercise } from "../types/exercise";

const API_URL = "http://localhost:3000";

export async function getAllExercises(): Promise<Exercise[]> {
  try {
    const res = await fetch(`${API_URL}/exercises`);
    if (!res.ok) {
      throw new Error("Failed to fetch exercises");
    }
    return await res.json();
  } catch (err) {
    console.error("API error (getAllExercises):", err);
    throw err;
  }
}

export async function getExerciseByCode(code: string): Promise<Exercise> {
  try {
    const res = await fetch(`${API_URL}/exercises/${code}`);
    if (!res.ok) {
      throw new Error(`Exercise not found: ${code}`);
    }
    return await res.json();
  } catch (err) {
    console.error("API error (getExerciseByCode):", err);
    throw err;
  }
}
