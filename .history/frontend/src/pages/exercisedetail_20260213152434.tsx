import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

interface Exercise {
  code: string;
  name: string;
  category: string;
  difficulty_level: string;
  description: string;
}

const ExerciseDetail: React.FC = () => {
  const { code } = useParams();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5001/api/exercises/${code}`
        );
        setExercise(response.data);
      } catch (error) {
        console.error("Error fetching exercise:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [code]);

  if (loading) {
    return <p style={{ padding: "1rem" }}>Loading exercise...</p>;
  }

  if (!exercise) {
    return <p style={{ padding: "1rem" }}>Exercise not found.</p>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h1>{exercise.name}</h1>
      <p><strong>Code:</strong> {exercise.code}</p>
      <p><strong>Category:</strong> {exercise.category}</p>
      <p><strong>Difficulty:</strong> {exercise.difficulty_level}</p>
      <p><strong>Description:</strong> {exercise.description}</p>
    </div>
  );
};

export default ExerciseDetail;