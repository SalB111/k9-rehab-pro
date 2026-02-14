import { useEffect, useState } from "react";
import { getAllExercises } from "../api/exercises";
import { Exercise } from "../types/exercise";

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllExercises()
      .then((data) => {
        setExercises(data);
        setError(null);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Failed to load exercises";
        setError(message);
      })
      .finally(() => setLoading(false));
  }, []);

  return { exercises, loading, error };
}
