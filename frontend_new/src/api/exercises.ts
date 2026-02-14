import { Exercise } from "../types/exercise";
import { EXERCISES_API_BASE_URL } from "../config/api";

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter((item) => item.length > 0);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    return [trimmed];
  }

  return [];
}

function normalizeDifficulty(value: unknown): Exercise["difficulty_level"] {
  if (value === "Easy" || value === "Moderate" || value === "Advanced") {
    return value;
  }
  return "Moderate";
}

function normalizeExercise(raw: Record<string, unknown>, fallbackCode = ""): Exercise {
  return {
    code: String(raw.code ?? raw.exerciseId ?? fallbackCode),
    name: String(raw.name ?? fallbackCode),
    category: String(raw.category ?? "Unknown"),
    description: String(raw.description ?? ""),
    equipment: toStringArray(raw.equipment),
    setup: String(raw.setup ?? ""),
    steps: toStringArray(raw.steps),
    good_form: toStringArray(raw.good_form),
    common_mistakes: toStringArray(raw.common_mistakes),
    red_flags: toStringArray(raw.red_flags),
    progression: toStringArray(raw.progression),
    contraindications: toStringArray(raw.contraindications),
    difficulty_level: normalizeDifficulty(raw.difficulty_level),
  };
}

function toExerciseArray(payload: unknown): Exercise[] {
  if (Array.isArray(payload)) {
    return payload
      .filter((item) => item && typeof item === "object")
      .map((item) => normalizeExercise(item as Record<string, unknown>));
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const record = payload as Record<string, unknown>;

  if (Array.isArray(record.exercises)) {
    return record.exercises
      .filter((item) => item && typeof item === "object")
      .map((item) => normalizeExercise(item as Record<string, unknown>));
  }

  if (record.exercises && typeof record.exercises === "object") {
    const exercisesObj = record.exercises as Record<string, Record<string, unknown>>;

    return Object.entries(exercisesObj).map(([exerciseCode, ex]) =>
      normalizeExercise(ex, exerciseCode)
    );
  }

  return [];
}

export async function getAllExercises(): Promise<Exercise[]> {
  const res = await fetch(`${EXERCISES_API_BASE_URL}/exercises`);
  if (!res.ok) throw new Error("Failed to fetch exercises");
  const data = await res.json();
  return toExerciseArray(data);
}

export async function getExerciseByCode(code: string): Promise<Exercise> {
  const encoded = encodeURIComponent(code);

  const pluralRes = await fetch(`${EXERCISES_API_BASE_URL}/exercises/${encoded}`);
  if (pluralRes.ok) {
    const data = await pluralRes.json();
    if (data && typeof data === "object") {
      return normalizeExercise(data as Record<string, unknown>, code);
    }
  }

  const singularRes = await fetch(`${EXERCISES_API_BASE_URL}/exercise/${encoded}`);
  if (singularRes.ok) {
    const data = await singularRes.json();
    if (data && typeof data === "object") {
      return normalizeExercise(data as Record<string, unknown>, code);
    }
  }

  const all = await getAllExercises();
  const found = all.find((ex) => ex.code === code);
  if (found) return found;

  throw new Error("Exercise not found");
}
