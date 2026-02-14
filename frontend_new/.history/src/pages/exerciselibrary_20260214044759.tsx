import { useExercises } from "../hooks/useExercises";
import { Link } from "react-router-dom";

export default function ExerciseLibrary() {
  const { exercises, loading } = useExercises();

  if (loading) {
    return (
      <div className="p-6 text-center text-xl font-semibold">
        Loading exercises…
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Exercise Library</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <Link
            key={exercise.code}
            to={`/exercises/${exercise.code}`}
            className="block border rounded-lg p-4 shadow hover:shadow-lg transition bg-white"
          >
            <h2 className="text-xl font-semibold mb-2">{exercise.name}</h2>

            <div className="text-sm text-gray-600 mb-1">
              <strong>Category:</strong> {exercise.category}
            </div>

            <div className="text-sm text-gray-600 mb-1">
              <strong>Difficulty:</strong> {exercise.difficulty_level}
            </div>

            <div className="text-sm text-gray-500 mt-2 line-clamp-3">
              {exercise.description}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
