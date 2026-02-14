import React, { useEffect, useState } from "react";
import ExerciseGrid from "../components/exercisegrid";
import axios from "axios";

interface Exercise {
  code: string;
  name: string;
  category: string;
  difficulty_level: string;
  description: string;
}

const ExerciseLibrary: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/exercises");
        setExercises(response.data);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  if (loading) {
    return <p style={{ padding: "1rem" }}>Loading exercises...</p>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Exercise Library</h1>
      <ExerciseGrid exercises={exercises} />
    </div>
  );
};

export default ExerciseLibrary;