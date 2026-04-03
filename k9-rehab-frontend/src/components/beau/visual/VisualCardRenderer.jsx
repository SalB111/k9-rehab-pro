import React, { lazy, Suspense } from "react";

const ExerciseInstructionCard = lazy(() => import("./cards/ExerciseInstructionCard"));
const AnatomyDiagramCard = lazy(() => import("./cards/AnatomyDiagramCard"));
const RecoveryTimelineCard = lazy(() => import("./cards/RecoveryTimelineCard"));
const ExerciseProgressionCard = lazy(() => import("./cards/ExerciseProgressionCard"));

const CARD_MAP = {
  exercise_instruction: ExerciseInstructionCard,
  anatomy_diagram: AnatomyDiagramCard,
  recovery_timeline: RecoveryTimelineCard,
  exercise_progression: ExerciseProgressionCard,
};

export default function VisualCardRenderer({ card }) {
  if (!card || !card.type) return null;
  const Comp = CARD_MAP[card.type];
  if (!Comp) return <div style={{ padding: 12, color: "#A32D2D", fontSize: 12 }}>Unknown card type: {card.type}</div>;

  return (
    <div style={{ margin: "12px 0", borderRadius: 10, overflow: "hidden", border: "1px solid var(--k9-border)", background: "var(--k9-surface)" }}>
      <Suspense fallback={<div style={{ padding: 20, textAlign: "center", color: "#6a737d", fontSize: 12 }}>Loading card...</div>}>
        <Comp card={card} />
      </Suspense>
    </div>
  );
}
