import React from "react";
import ExerciseCard from "./exercisecard";
import { Exercise } from "../api/exercises";

interface Props {
  exercises: Exercise[];
}

const ExerciseGrid: React.FC<Props> = ({ exercises }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "1rem",
        padding: "1rem",
      }}
    >
      {exercises.map((exercise) => (
        <ExerciseCard key={exercise.code} exercise={exercise} />
      ))}
    </div>
  );
};

export default ExerciseGrid;
