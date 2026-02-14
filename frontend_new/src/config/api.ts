const stripTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const env = import.meta.env;

const API_ORIGIN = stripTrailingSlash(
  env.VITE_API_ORIGIN || "http://localhost:3000"
);

export const CORE_API_BASE_URL = stripTrailingSlash(
  env.VITE_CORE_API_BASE_URL || `${API_ORIGIN}/api`
);

export const EXERCISES_API_BASE_URL = stripTrailingSlash(
  env.VITE_EXERCISES_API_BASE_URL || CORE_API_BASE_URL
);
