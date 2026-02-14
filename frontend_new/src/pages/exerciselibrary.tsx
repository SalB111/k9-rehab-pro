import { useExercises } from "../hooks/useExercises";
import { Link, useSearchParams } from "react-router-dom";
import { useMemo } from "react";

export default function ExerciseLibrary() {
  const { exercises, loading, error } = useExercises();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "All";
  const difficulty = searchParams.get("difficulty") ?? "All";

  const updateParams = (next: { q?: string; category?: string; difficulty?: string }) => {
    const params = new URLSearchParams(searchParams);

    const qVal = next.q ?? search;
    const categoryVal = next.category ?? category;
    const difficultyVal = next.difficulty ?? difficulty;

    if (qVal) params.set("q", qVal);
    else params.delete("q");

    if (categoryVal !== "All") params.set("category", categoryVal);
    else params.delete("category");

    if (difficultyVal !== "All") params.set("difficulty", difficultyVal);
    else params.delete("difficulty");

    setSearchParams(params);
  };

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

  const groupedByCategory = useMemo(() => {
    const grouped = new Map<string, typeof filtered>();

    for (const exercise of filtered) {
      if (!grouped.has(exercise.category)) {
        grouped.set(exercise.category, []);
      }
      grouped.get(exercise.category)!.push(exercise);
    }

    return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const openCategories = useMemo(() => {
    const raw = searchParams.get("open") ?? "";
    return new Set(raw.split("|").filter(Boolean));
  }, [searchParams]);

  const toggleCategory = (categoryName: string) => {
    const params = new URLSearchParams(searchParams);
    const next = new Set(openCategories);

    if (next.has(categoryName)) {
      next.delete(categoryName);
    } else {
      next.add(categoryName);
    }

    const openValue = Array.from(next).join("|");
    if (openValue) params.set("open", openValue);
    else params.delete("open");

    setSearchParams(params);
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-xl font-semibold">
        Loading exercises...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-xl font-semibold text-red-600">
        Failed to load exercises: {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Exercise Library</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={(e) => updateParams({ q: e.target.value })}
          className="border rounded-lg p-2 w-full"
        />

        <select
          value={category}
          onChange={(e) => updateParams({ category: e.target.value })}
          className="border rounded-lg p-2 w-full"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={difficulty}
          onChange={(e) => updateParams({ difficulty: e.target.value })}
          className="border rounded-lg p-2 w-full"
        >
          {difficulties.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {groupedByCategory.map(([groupName, groupExercises]) => {
          const isOpen = openCategories.has(groupName);

          return (
            <section key={groupName} className="border rounded-lg bg-white shadow-sm">
              <button
                type="button"
                onClick={() => toggleCategory(groupName)}
                className="w-full text-left px-4 py-3 font-semibold text-lg flex items-center justify-between"
              >
                <span>{groupName}</span>
                <span className="text-sm text-gray-600">
                  {groupExercises.length} exercises {isOpen ? "[-]" : "[+]"}
                </span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-2">
                  {groupExercises.map((exercise) => (
                    <Link
                      key={exercise.code}
                      to={`/exercises/${exercise.code}`}
                      className="block border rounded-md px-3 py-2 hover:bg-gray-50"
                    >
                      <div className="font-medium">{exercise.name}</div>
                      <div className="text-sm text-gray-600">
                        Difficulty: {exercise.difficulty_level}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-gray-500 mt-10 text-lg">
          No exercises match your filters.
        </div>
      )}
    </div>
  );
}
