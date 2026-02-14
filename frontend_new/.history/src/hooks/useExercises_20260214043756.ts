import { useEffect, useState } from "react";
import { getAllExercises } from "../api/exercises";
import { Exercise } from "../types/exercise";

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllExercises()
      .then(setExercises)
      .finally(() => setLoading(false));
  }, []);

  return { exercises, loading };
}
