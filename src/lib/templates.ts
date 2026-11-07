import { newId } from './id';
import type { Drill, Metric, Principle, Skill } from './types';

/** A template is a Skill without ids or timestamps. */
export type SkillTemplate = {
  id: string;
  name: string;
  color: string;
  summary: string;
  principles: string[];
  drills: Omit<Drill, 'id'>[];
  metrics: Omit<Metric, 'id'>[];
};

export const TEMPLATES: SkillTemplate[] = [
  {
    id: 'articulation',
    name: 'Articulation',
    color: '#2F55D4',
    summary: 'Turn thoughts into clear, simple speech.',
    principles: [
      'Pick one main point before you speak',
      'Simplify until only the core is left',
      'Clarity over fancy words',
      'Record yourself and listen back',
    ],
    drills: [
      {
        name: 'One-point explanation',
        description: 'Explain the topic in 60 seconds. Decide your one main point before you press record.',
        type: 'record',
        durationSec: 60,
        prompts: [
          'Why do cities get traffic jams?',
          'How does the internet reach your phone?',
          'Why do people procrastinate?',
          'What makes a good teacher?',
          'Why is sleep important?',
          'How do banks make money?',
          'Why do we have seasons?',
          'What makes a team work well?',
        ],
      },
      {
        name: 'Simplify it',
        description: 'Write the idea in full, then rewrite it as one plain sentence a 12-year-old would understand.',
        type: 'write',
        durationSec: 300,
        prompts: [
          'Explain what your job is.',
          'Explain a decision you made recently and why.',
          'Explain a hobby to someone who has never tried it.',
        ],
      },
      {
        name: 'Filler-word hunt',
        description: 'Talk for 3 minutes about your day. Afterwards, count every "um", "like" and "you know".',
        type: 'record',
        durationSec: 180,
        prompts: [],
      },
    ],
    metrics: [
      { name: 'One clear main point', kind: 'scale', higherIsBetter: true },
      { name: 'Filler words', kind: 'count', higherIsBetter: false, hint: '"um", "like", "you know"' },
      { name: 'Used plain words', kind: 'boolean', higherIsBetter: true },
    ],
  },
  {
    id: 'writing-clearly',
    name: 'Writing clearly',
    color: '#0F766E',
    summary: 'Short, direct writing people actually read.',
    principles: [
      'Lead with the conclusion',
      'One idea per paragraph',
      'Cut every word that does no work',
    ],
    drills: [
      {
        name: 'Bottom line first',
        description: 'Write a short message where the first sentence says what you need.',
        type: 'write',
        durationSec: 300,
        prompts: ['Ask your manager for a day off.', 'Report a bug to a developer.', 'Invite a friend to an event.'],
      },
      {
        name: 'Half the words',
        description: 'Take something you wrote and rewrite it in half the words.',
        type: 'write',
        durationSec: 600,
        prompts: [],
      },
    ],
    metrics: [
      { name: 'Point is in the first sentence', kind: 'boolean', higherIsBetter: true },
      { name: 'Clarity', kind: 'scale', higherIsBetter: true },
      { name: 'Time to write', kind: 'duration', higherIsBetter: false },
    ],
  },
  {
    id: 'drawing-basics',
    name: 'Drawing basics',
    color: '#7C3AED',
    summary: 'Build observation and line control.',
    principles: ['Draw what you see, not what you know', 'Big shapes first, details last', 'Confident lines over many small ones'],
    drills: [
      {
        name: 'Two-minute gesture',
        description: 'Sketch an object in front of you in 2 minutes. Capture the overall shape only.',
        type: 'timed',
        durationSec: 120,
        prompts: ['A mug', 'Your hand', 'A chair', 'A shoe', 'A plant'],
      },
      {
        name: 'Line control',
        description: 'Fill a page with straight lines and circles. Log how it went.',
        type: 'log',
        durationSec: 600,
        prompts: [],
      },
    ],
    metrics: [
      { name: 'Proportions', kind: 'scale', higherIsBetter: true },
      { name: 'Line confidence', kind: 'scale', higherIsBetter: true },
    ],
  },
];

export function skillFromTemplate(t: SkillTemplate): Skill {
  return {
    id: newId('sk_'),
    name: t.name,
    color: t.color,
    templateId: t.id,
    createdAt: Date.now(),
    principles: t.principles.map((text): Principle => ({ id: newId('pr_'), text })),
    drills: t.drills.map((d): Drill => ({ ...d, prompts: [...d.prompts], id: newId('dr_') })),
    metrics: t.metrics.map((m): Metric => ({ ...m, id: newId('me_') })),
  };
}

export const SKILL_COLORS = ['#2F55D4', '#0F766E', '#7C3AED', '#B4410C', '#BE185D', '#4D7C0F'];

export function emptySkill(name: string, color = SKILL_COLORS[0]): Skill {
  return {
    id: newId('sk_'),
    name,
    color,
    createdAt: Date.now(),
    principles: [],
    drills: [
      {
        id: newId('dr_'),
        name: 'Practice rep',
        description: 'Do one focused rep, then review it.',
        type: 'timed',
        durationSec: 300,
        prompts: [],
      },
    ],
    metrics: [{ id: newId('me_'), name: 'How it went', kind: 'scale', higherIsBetter: true }],
  };
}
