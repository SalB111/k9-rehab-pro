import { useExercises } from "../hooks/useExercises";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";

export default function ExerciseLibrary() {
  const { exercises, loading } = useExercises();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");

  const categories = useMemo(() => {
    const set = new Set(exercises.map((e) => e.category));
    return ["All", ...Array.from(set)];
  }, [exercises]);

  const difficulties = ["All", "Easy", "Moderate", "Advanced"];

  const filtered = useMemo(() => {
    return exercises.filter((e) => {
      const matchesSearch =
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || e.category === category;

      const matchesDifficulty =
        difficulty === "All" || e.difficulty_level === difficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [exercises, search, category, difficulty]);

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

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Search */}
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg p-2 w-full"
        />

        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded-lg p-2 w-full"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Difficulty Filter */}
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="border rounded-lg p-2 w-full"
        >
          {difficulties.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((exercise) => (
          <Link
            key={exercise.code}
            to={`/exercises/${exercise.code}`}
            className="block border rounded-lg p-4 shadow hover:shadow-lg transition bg-white"
          >
            <h2 className="text-xl font-semibold mb-2">{exercise.name}</h2>

            <div className="flex items-center gap-2 mb-2">
              {/* Difficulty Chip */}
              <span
                className={`
                  text-xs font-bold px-2 py-1 rounded-full
                  ${
                    exercise.difficulty_level === "Easy"
                      ? "bg-green-100 text-green-700"
                      : exercise.difficulty_level === "Moderate"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }
                `}
              >
                {exercise.difficulty_level}
              </span>

              {/* Category */}
              <span className="text-xs text-gray-600">
                {exercise.category}
              </span>
            </div>

            <div className="text-sm text-gray-500 mt-2 line-clamp-3">
              {exercise.description}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-gray-500 mt-10 text-lg">
          No exercises match your filters.
        </div>
      )}
    </div>
  );
}