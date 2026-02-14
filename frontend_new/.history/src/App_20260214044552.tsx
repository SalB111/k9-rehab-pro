export interface Exercise {
  code: string;
  name: string;
  category: string;
  description: string;
  equipment: string[];
  setup: string;
  steps: string[];
  good_form: string[];
  common_mistakes: string[];
  red_flags: string[];
  progression: string[];
  contraindications: string[];
  difficulty_level: "Easy" | "Moderate" | "Advanced";
}