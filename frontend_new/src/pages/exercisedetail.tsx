import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getExerciseByCode } from "../api/exercises";
import { Exercise } from "../types/exercise";

export default function ExerciseDetail() {
  const { code } = useParams();
  const location = useLocation();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const backToLibrary = `/exercises${location.search}`;

  useEffect(() => {
    if (!code) {
      setLoading(false);
      return;
    }

    getExerciseByCode(code)
      .then((data) => setExercise(data))
      .catch(() => setExercise(null))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="p-6 text-center text-xl font-semibold">
        Loading exercise...
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="p-6 text-center text-xl font-semibold text-red-600">
        Exercise not found.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <p className="mb-4">
        <Link to={backToLibrary} className="text-blue-700 hover:underline">
          Back to Exercise Library
        </Link>
      </p>
      <h1 className="text-4xl font-bold mb-4">{exercise.name}</h1>

      <div className="text-gray-700 mb-6">
        <p><strong>Code:</strong> {exercise.code}</p>
        <p><strong>Category:</strong> {exercise.category}</p>
        <p><strong>Difficulty:</strong> {exercise.difficulty_level}</p>
      </div>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Description</h2>
        <p className="text-gray-800">{exercise.description}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Equipment</h2>
        <ul className="list-disc ml-6 text-gray-800">
          {exercise.equipment.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Setup</h2>
        <p className="text-gray-800">{exercise.setup}</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Steps</h2>
        <ol className="list-decimal ml-6 text-gray-800">
          {exercise.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Good Form</h2>
        <ul className="list-disc ml-6 text-gray-800">
          {exercise.good_form.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Common Mistakes</h2>
        <ul className="list-disc ml-6 text-gray-800">
          {exercise.common_mistakes.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Red Flags</h2>
        <ul className="list-disc ml-6 text-red-600">
          {exercise.red_flags.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Progression</h2>
        <ul className="list-disc ml-6 text-gray-800">
          {exercise.progression.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Contraindications</h2>
        <ul className="list-disc ml-6 text-gray-800">
          {exercise.contraindications.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
