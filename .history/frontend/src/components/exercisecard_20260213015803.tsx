import React from "react";
import { useNavigate } from "react-router-dom";

interface Exercise {
  code: string;
  name: string;
  category: string;
  difficulty_level: string;
  description: string;
}

interface ExerciseCardProps {
  exercise: Exercise;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/exercises/${exercise.code}`);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "1rem",
        cursor: "pointer",
        transition: "0.2s",
        background: "#fff",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1.02)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 4px 12px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      <h3 style={{ marginBottom: "0.5rem" }}>{exercise.name}</h3>

      <p style={{ fontSize: "0.9rem", color: "#666" }}>
        {exercise.category}
      </p>

      <span
        style={{
          display: "inline-block",
          marginTop: "0.5rem",
          padding: "0.3rem 0.6rem",
          borderRadius: "6px",
          background:
            exercise.difficulty_level === "Easy"
              ? "#d4f8d4"
              : exercise.difficulty_level === "Moderate"
              ? "#fff4c2"
              : "#ffd4d4",
          color: "#333",
          fontSize: "0.85rem",
        }}
      >
        {exercise.difficulty_level}
      </span>
    </div>
  );
};

export default ExerciseCard;