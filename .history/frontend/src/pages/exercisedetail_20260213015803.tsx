import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getExerciseByCode } from "../api/exercises";

interface Exercise {
  code: string;
  name: string;
  category: string;
  difficulty_level: string;
  description: string;
  setup?: string;
  steps?: string[];
  contraindications?: string[];
  red_flags?: string[];
  progression?: string[];
}

const ExerciseDetail: React.FC = () => {
  const { code } = useParams();
  const [exercise, setExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        if (!code) return;
        const data = await getExerciseByCode(code);
        setExercise(data);
      } catch (error) {
        console.error("Error fetching exercise:", error);
      }
    };

    fetchExercise();
  }, [code]);

  if (!exercise) {
    return <p style={{ padding: "2rem" }}>Loading exercise...</p>;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      {/* TITLE */}
      <h1 style={{ marginBottom: "0.5rem" }}>{exercise.name}</h1>

      {/* CATEGORY + DIFFICULTY */}
      <p style={{ color: "#666", marginBottom: "1rem" }}>
        {exercise.category} • {exercise.difficulty_level}
      </p>

      {/* DESCRIPTION */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Description</h2>
        <p>{exercise.description}</p>
      </section>

      {/* SETUP */}
      {exercise.setup && (
        <section style={{ marginBottom: "2rem" }}>
          <h2>Setup</h2>
          <p>{exercise.setup}</p>
        </section>
      )}

      {/* STEPS */}
      {exercise.steps && exercise.steps.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h2>Steps</h2>
          <ol>
            {exercise.steps.map((step, index) => (
              <li key={index} style={{ marginBottom: "0.5rem" }}>
                {step}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* CONTRAINDICATIONS */}
      {exercise.contraindications && exercise.contraindications.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h2>Contraindications</h2>
          <ul>
            {exercise.contraindications.map((item, index) => (
              <li key={index} style={{ marginBottom: "0.5rem" }}>
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* RED FLAGS */}
      {exercise.red_flags && exercise.red_flags.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h2>Red Flags</h2>
          <ul>
            {exercise.red_flags.map((flag, index) => (
              <li key={index} style={{ marginBottom: "0.5rem", color: "red" }}>
                {flag}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* PROGRESSION */}
      {exercise.progression && exercise.progression.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h2>Progression</h2>
          <ul>
            {exercise.progression.map((item, index) => (
              <li key={index} style={{ marginBottom: "0.5rem" }}>
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ADD TO PROTOCOL BUTTON */}
      <button
        style={{
          padding: "0.75rem 1.5rem",
          background: "#00c853",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "1rem",
          marginTop: "1rem",
        }}
        onClick={() => alert("Feature coming soon")}
      >
        Add to Protocol
      </button>
    </div>
  );
};

export default ExerciseDetail;