// components/ai/StructuredDataRenderer.tsx — Renders structured AI responses

import React from 'react';

interface StructuredDataRendererProps {
  data: unknown;
  type?: string;
}

export default function StructuredDataRenderer({ data, type }: StructuredDataRendererProps) {
  if (!data) return null;

  const parsed = typeof data === 'string' ? safeParse(data) : data;
  if (!parsed) return null;

  // Auto-detect type from data shape
  const detectedType = type || detectType(parsed);

  switch (detectedType) {
    case 'exercise':
      return <ExerciseCard data={parsed as ExerciseData} />;
    case 'exercise_list':
      return <ExerciseList data={parsed as ExerciseData[]} />;
    case 'protocol':
      return <ProtocolPreview data={parsed as ProtocolData} />;
    case 'safety_alert':
      return <SafetyAlert data={parsed as SafetyData} />;
    case 'storyboard':
      return <StoryboardPreview data={parsed as StoryboardData} />;
    default:
      return <GenericData data={parsed} />;
  }
}

// ─── Type interfaces ───

interface ExerciseData {
  code?: string;
  name?: string;
  category?: string;
  difficulty?: string | number;
  description?: string;
  indications?: string[];
  contraindications?: string[];
  sets?: string;
  reps?: string;
  duration?: string;
}

interface ProtocolData {
  name?: string;
  condition?: string;
  phases?: Array<{
    name: string;
    weeks: string;
    exercises?: Array<{ name: string; code?: string }>;
  }>;
  totalWeeks?: number;
}

interface SafetyData {
  level?: 'warning' | 'danger' | 'info';
  title?: string;
  message?: string;
  contraindications?: string[];
  recommendations?: string[];
}

interface StoryboardData {
  exerciseCode?: string;
  exerciseName?: string;
  totalFrames?: number;
  frames?: Array<{
    frameNumber: number;
    title?: string;
    description?: string;
  }>;
}

// ─── Sub-components ───

function ExerciseCard({ data }: { data: ExerciseData }) {
  return (
    <div className="structured-card structured-card--exercise">
      <div className="structured-card__header">
        <span className="structured-card__badge">{data.category || 'Exercise'}</span>
        {data.difficulty && (
          <span className="structured-card__difficulty">
            Level {data.difficulty}
          </span>
        )}
      </div>
      <div className="structured-card__title">
        {data.code && <code className="structured-card__code">{data.code}</code>}
        {data.name}
      </div>
      {data.description && (
        <p className="structured-card__desc">{data.description}</p>
      )}
      <div className="structured-card__details">
        {data.sets && <span>Sets: {data.sets}</span>}
        {data.reps && <span>Reps: {data.reps}</span>}
        {data.duration && <span>Duration: {data.duration}</span>}
      </div>
      {data.indications && data.indications.length > 0 && (
        <div className="structured-card__tags">
          {data.indications.map((ind, i) => (
            <span key={i} className="structured-card__tag structured-card__tag--good">{ind}</span>
          ))}
        </div>
      )}
      {data.contraindications && data.contraindications.length > 0 && (
        <div className="structured-card__tags">
          {data.contraindications.map((c, i) => (
            <span key={i} className="structured-card__tag structured-card__tag--warn">{c}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function ExerciseList({ data }: { data: ExerciseData[] }) {
  return (
    <div className="structured-list">
      {data.map((ex, i) => (
        <ExerciseCard key={i} data={ex} />
      ))}
    </div>
  );
}

function ProtocolPreview({ data }: { data: ProtocolData }) {
  return (
    <div className="structured-card structured-card--protocol">
      <div className="structured-card__header">
        <span className="structured-card__badge">Protocol</span>
        {data.totalWeeks && <span>{data.totalWeeks} weeks</span>}
      </div>
      <div className="structured-card__title">{data.name || data.condition}</div>
      {data.phases && (
        <div className="structured-card__phases">
          {data.phases.map((phase, i) => (
            <div key={i} className="structured-card__phase">
              <div className="structured-card__phase-header">
                <strong>{phase.name}</strong>
                <span className="structured-card__phase-weeks">{phase.weeks}</span>
              </div>
              {phase.exercises && (
                <ul className="structured-card__phase-exercises">
                  {phase.exercises.map((ex, j) => (
                    <li key={j}>
                      {ex.code && <code>{ex.code}</code>} {ex.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SafetyAlert({ data }: { data: SafetyData }) {
  const level = data.level || 'warning';
  return (
    <div className={`structured-alert structured-alert--${level}`}>
      <div className="structured-alert__icon">
        {level === 'danger' ? '🚫' : level === 'warning' ? '⚠️' : 'ℹ️'}
      </div>
      <div className="structured-alert__body">
        {data.title && <div className="structured-alert__title">{data.title}</div>}
        {data.message && <p>{data.message}</p>}
        {data.contraindications && data.contraindications.length > 0 && (
          <ul className="structured-alert__list">
            {data.contraindications.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        )}
        {data.recommendations && data.recommendations.length > 0 && (
          <div className="structured-alert__recs">
            <strong>Recommendations:</strong>
            <ul>
              {data.recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function StoryboardPreview({ data }: { data: StoryboardData }) {
  return (
    <div className="structured-card structured-card--storyboard">
      <div className="structured-card__header">
        <span className="structured-card__badge">Storyboard</span>
        {data.totalFrames && <span>{data.totalFrames} frames</span>}
      </div>
      <div className="structured-card__title">
        {data.exerciseCode && <code className="structured-card__code">{data.exerciseCode}</code>}
        {data.exerciseName}
      </div>
      {data.frames && data.frames.slice(0, 4).map((frame, i) => (
        <div key={i} className="structured-card__frame">
          <span className="structured-card__frame-num">Frame {frame.frameNumber}</span>
          <span>{frame.title || frame.description}</span>
        </div>
      ))}
      {data.frames && data.frames.length > 4 && (
        <div className="structured-card__more">+{data.frames.length - 4} more frames</div>
      )}
    </div>
  );
}

function GenericData({ data }: { data: unknown }) {
  return (
    <pre className="structured-card structured-card--generic">
      <code>{JSON.stringify(data, null, 2)}</code>
    </pre>
  );
}

// ─── Helpers ───

function safeParse(str: string): unknown {
  try { return JSON.parse(str); } catch { return null; }
}

function detectType(data: unknown): string {
  if (Array.isArray(data)) {
    if (data.length > 0 && (data[0] as Record<string, unknown>).code) return 'exercise_list';
    return 'generic';
  }
  const obj = data as Record<string, unknown>;
  if (obj.contraindications && obj.level) return 'safety_alert';
  if (obj.phases) return 'protocol';
  if (obj.frames || obj.totalFrames) return 'storyboard';
  if (obj.code && (obj.name || obj.category)) return 'exercise';
  return 'generic';
}
