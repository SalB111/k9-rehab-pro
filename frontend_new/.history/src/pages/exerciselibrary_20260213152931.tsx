import React from "react";
import { Link } from "react-router-dom";
import { Exercise } from "../api/exercises";

interface Props {
  exercise: Exercise;
}

const ExerciseCard: React.FC<Props> = ({ exercise }) => {
  return (
    <Link
      to={`/exercises/${exercise.code}`}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1rem",
          background: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          transition: "0.2s",
        }}
      >
        <h3>{exercise.name}</h3>
        <p><strong>Category:</strong> {exercise.category}</p>
        <p><strong>Difficulty:</strong> {exercise.difficulty_level}</p>
      </div>
    </Link>
  );
};

export default ExerciseCard;
