export async function getAllExercises() {
  const response = await fetch("http://localhost:3000/exercises");

  if (!response.ok) {
    throw new Error("Failed to fetch exercises");
  }

  return response.json();
}

export async function getExerciseByCode(code: string) {
  const response = await fetch(`http://localhost:3000/exercises/${code}`);

  if (!response.ok) {
    throw new Error("Failed to fetch exercise");
  }

  return response.json();
}
