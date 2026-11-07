/**
 * Rotoskill's core model. Nothing here is specific to one skill:
 * a Skill is just principles + drills + metrics, and a Rep is one
 * practice attempt scored against the skill's metrics.
 */

/** How a metric is scored during review. */
export type MetricKind = 'scale' | 'count' | 'boolean' | 'duration';

/** How a drill is performed during a session. */
export type DrillType = 'record' | 'write' | 'timed' | 'log';

export type Principle = {
  id: string;
  text: string;
};

export type Drill = {
  id: string;
  name: string;
  description: string;
  type: DrillType;
  /** Target length of one rep, in seconds. */
  durationSec: number;
  /** Optional prompts; one is picked at random for each rep. */
  prompts: string[];
};

export type Metric = {
  id: string;
  name: string;
  kind: MetricKind;
  /** For counts like "filler words", lower is better. */
  higherIsBetter: boolean;
  hint?: string;
};

export type Skill = {
  id: string;
  name: string;
  color: string;
  principles: Principle[];
  drills: Drill[];
  metrics: Metric[];
  createdAt: number;
  templateId?: string;
};

export type Rep = {
  id: string;
  skillId: string;
  drillId: string;
  startedAt: number;
  durationSec: number;
  prompt?: string;
  /** Local file URI of the recording, for `record` drills. */
  audioUri?: string;
  /** Written answer, for `write` drills. */
  text?: string;
  /** metricId → value. scale: 1–5, count: n, boolean: 0/1, duration: seconds. */
  scores: Record<string, number>;
  note?: string;
  reviewed: boolean;
};

export type AppData = {
  version: 1;
  skills: Skill[];
  reps: Rep[];
  activeSkillId: string | null;
};
