import type { Drill, Metric, Rep, Skill } from './types';

const DAY = 24 * 60 * 60 * 1000;

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Consecutive days with at least one rep, ending today (or yesterday if today has none yet). */
export function streak(reps: Rep[], now = Date.now()): number {
  const days = new Set(reps.map((r) => dayKey(r.startedAt)));
  let cursor = now;
  if (!days.has(dayKey(cursor))) cursor -= DAY;
  let count = 0;
  while (days.has(dayKey(cursor))) {
    count += 1;
    cursor -= DAY;
  }
  return count;
}

export function repsForSkill(reps: Rep[], skillId: string): Rep[] {
  return reps.filter((r) => r.skillId === skillId).sort((a, b) => a.startedAt - b.startedAt);
}

export function metricSeries(reps: Rep[], metric: Metric): number[] {
  return reps.filter((r) => r.reviewed && metric.id in r.scores).map((r) => r.scores[metric.id]);
}

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Rotate through the skill's drills so each day suggests a different one. */
export function drillOfTheDay(skill: Skill, reps: Rep[], now = Date.now()): Drill | undefined {
  if (skill.drills.length === 0) return undefined;
  const dayIndex = Math.floor(now / DAY);
  return skill.drills[dayIndex % skill.drills.length];
}

export function principleOfTheDay(skill: Skill, now = Date.now()) {
  if (skill.principles.length === 0) return undefined;
  const dayIndex = Math.floor(now / DAY);
  return skill.principles[dayIndex % skill.principles.length];
}

export function pickPrompt(drill: Drill): string | undefined {
  if (drill.prompts.length === 0) return undefined;
  return drill.prompts[Math.floor(Math.random() * drill.prompts.length)];
}

export function formatDuration(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function formatMetricValue(metric: Metric, value: number): string {
  switch (metric.kind) {
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'duration':
      return formatDuration(value);
    default:
      return String(Math.round(value * 10) / 10);
  }
}

export const DRILL_TYPE_LABEL: Record<Drill['type'], string> = {
  record: 'Record',
  write: 'Write',
  timed: 'Timed',
  log: 'Log',
};

export const METRIC_KIND_LABEL: Record<Metric['kind'], string> = {
  scale: 'Scale 1–5',
  count: 'Count',
  boolean: 'Yes/No',
  duration: 'Time',
};
