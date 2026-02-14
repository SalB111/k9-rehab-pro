import React from "react";
import ExerciseCard from "./exercisecard";

interface Exercise {
  code: string;
  name: string;
  category: string;
  difficulty_level: string;
  description: string;
}

interface ExerciseGridProps {
  exercises: Exercise[];
}

const ExerciseGrid: React.FC<ExerciseGridProps> = ({ exercises }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "1.5rem",
        marginTop: "2rem",
      }}
    >
      {exercises.map((exercise) => (
        <ExerciseCard key={exercise.code} exercise={exercise} />
      ))}
    </div>
  );
};

export default ExerciseGrid;