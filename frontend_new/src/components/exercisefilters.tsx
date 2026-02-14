import React from "react";

interface ExerciseFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  selectedDifficulty: string;
  setSelectedDifficulty: (value: string) => void;
}

const ExerciseFilters: React.FC<ExerciseFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
}) => {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      {/* SEARCH BAR */}
      <input
        type="text"
        placeholder="Search exercises..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "0.75rem",
          marginBottom: "1rem",
          borderRadius: "6px",
          border: "1px solid #ccc",
          fontSize: "1rem",
        }}
      />

      {/* FILTER ROW */}
      <div style={{ display: "flex", gap: "1rem" }}>
        {/* CATEGORY FILTER */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            flex: 1,
            padding: "0.75rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        >
          <option value="All">All Categories</option>
          <option value="Balance & Proprioception">Balance & Proprioception</option>
          <option value="Sport Conditioning">Sport Conditioning</option>
          <option value="Hydrotherapy">Hydrotherapy</option>
          <option value="Geriatric Care">Geriatric Care</option>
          <option value="Neurological Rehab">Neurological Rehab</option>
          <option value="Post-Surgical">Post-Surgical</option>
          <option value="Complementary Therapy">Complementary Therapy</option>
          <option value="Strengthening">Strengthening</option>
          <option value="Active Assisted">Active Assisted</option>
          <option value="Therapeutic Modalities">Therapeutic Modalities</option>
          <option value="Passive Therapy">Passive Therapy</option>
          <option value="Aquatic Therapy">Aquatic Therapy</option>
          <option value="Functional Training">Functional Training</option>
          <option value="Manual Therapy">Manual Therapy</option>
        </select>

        {/* DIFFICULTY FILTER */}
        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          style={{
            flex: 1,
            padding: "0.75rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "1rem",
          }}
        >
          <option value="All">All Difficulty Levels</option>
          <option value="Easy">Easy</option>
          <option value="Moderate">Moderate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>
    </div>
  );
};

export default ExerciseFilters;