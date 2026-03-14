import type { StoredResponse } from './types';

const EVENT_ID = 'sample-workshop';
const SEED_KEY = 'bi:mock-data-seeded';
const PARTICIPANT_COUNT = 50;

// Generate 50 unique slug names
const ADJECTIVES_1 = [
  'eager', 'calm', 'swift', 'kind', 'bold', 'warm', 'cool', 'fair', 'deep', 'true',
  'keen', 'free', 'glad', 'neat', 'pure', 'wise', 'rare', 'soft', 'tall', 'wild',
  'dark', 'fast', 'fine', 'good', 'lean',
];
const ADJECTIVES_2 = [
  'happy', 'brave', 'quiet', 'sharp', 'witty', 'gentle', 'bright', 'sleepy', 'cuddly', 'tiny',
  'clever', 'proud', 'mighty', 'nimble', 'steady', 'vivid', 'humble', 'merry', 'daring', 'loyal',
  'quick', 'sturdy', 'lively', 'placid', 'serene',
];
const ANIMALS = [
  'dolphin', 'falcon', 'tiger', 'otter', 'raven', 'lynx', 'badger', 'hare', 'crane', 'wolf',
  'hawk', 'deer', 'bear', 'fox', 'owl', 'seal', 'wren', 'jay', 'elk', 'puma',
  'dove', 'heron', 'mink', 'vole', 'ibis',
];

function generateSlugs(count: number): string[] {
  const slugs: string[] = [];
  for (let i = 0; i < count; i++) {
    const a1 = ADJECTIVES_1[i % ADJECTIVES_1.length];
    const a2 = ADJECTIVES_2[Math.floor(i / ADJECTIVES_1.length) % ADJECTIVES_2.length];
    const animal = ANIMALS[i % ANIMALS.length];
    slugs.push(`${a1}-${a2}-${animal}`);
  }
  return slugs;
}

// Distribution types keyed by target mean (1-indexed)
// Weights for 5-point scale [index 0..4]
type Weights = [number, number, number, number, number];

// Baseline: mean ~3.7 (0-indexed ~2.7)
// 1*0.03 + 2*0.08 + 3*0.22 + 4*0.42 + 5*0.25 = 3.78
const BASELINE: Weights = [0.03, 0.08, 0.22, 0.42, 0.25];

// Scenario 1: mean ~1.5 (0-indexed ~0.5) — very pessimistic
// 1*0.58 + 2*0.34 + 3*0.06 + 4*0.02 + 5*0.00 = 1.52
const SCENARIO_1: Weights = [0.58, 0.34, 0.06, 0.02, 0.00];

// Scenario 2: mean ~2.4 (0-indexed ~1.4)
// 1*0.18 + 2*0.38 + 3*0.30 + 4*0.12 + 5*0.02 = 2.42
const SCENARIO_2: Weights = [0.18, 0.38, 0.30, 0.12, 0.02];

// Scenario 1 after policies: mean ~3.0 (improvement from 1.5)
// 1*0.08 + 2*0.18 + 3*0.42 + 4*0.24 + 5*0.08 = 3.06
const SCENARIO_1_POST: Weights = [0.08, 0.18, 0.42, 0.24, 0.08];

// Scenario 2 after policies: mean ~3.5 (improvement from 2.4)
// 1*0.04 + 2*0.12 + 3*0.30 + 4*0.36 + 5*0.18 = 3.52
const SCENARIO_2_POST: Weights = [0.04, 0.12, 0.30, 0.36, 0.18];

// Likelihood of scenario 1: mean ~2.8
const LIKELIHOOD_1: Weights = [0.10, 0.25, 0.35, 0.22, 0.08];

// Likelihood of scenario 2: mean ~3.2
const LIKELIHOOD_2: Weights = [0.05, 0.15, 0.35, 0.30, 0.15];

// Seeded pseudo-random for reproducible mock data
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weightedAnswer(weights: Weights, rand: () => number): number {
  const r = rand();
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (r < cumulative) return i;
  }
  return weights.length - 1;
}

const PROBLEM_MAPPING_GROUPS = ['a', 'b', 'c', 'd', 'e', 'f'];
const SOLUTION_DESIGN_GROUPS = ['energy', 'education', 'health', 'labour-market', 'welfare', 'culture'];

function distributeGroups(count: number, groups: string[], rand: () => number): string[] {
  // Even distribution with slight randomness
  const assignments: string[] = [];
  for (let i = 0; i < count; i++) {
    assignments.push(groups[i % groups.length]);
  }
  // Fisher-Yates shuffle
  for (let i = assignments.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [assignments[i], assignments[j]] = [assignments[j], assignments[i]];
  }
  return assignments;
}

export function seedMockData() {
  if (localStorage.getItem(SEED_KEY)) return;

  const rand = mulberry32(42); // deterministic seed
  const slugs = generateSlugs(PARTICIPANT_COUNT);
  const pmGroups = distributeGroups(PARTICIPANT_COUNT, PROBLEM_MAPPING_GROUPS, rand);
  const sdGroups = distributeGroups(PARTICIPANT_COUNT, SOLUTION_DESIGN_GROUPS, rand);
  const now = Date.now();

  slugs.forEach((slug, i) => {
    const submittedAt = new Date(now - (PARTICIPANT_COUNT - i) * 2 * 60_000).toISOString();

    // Session 1: Opening Plenary (q1 = baseline)
    const plenaryResponse: StoredResponse = {
      groupId: null,
      answers: { q1: weightedAnswer(BASELINE, rand) },
      submittedAt,
    };
    localStorage.setItem(
      `bi:responses:${EVENT_ID}:opening-plenary:${slug}`,
      JSON.stringify(plenaryResponse)
    );

    // Session 2: Problem Mapping (q2-q9)
    const pmGroupId = pmGroups[i];
    const problemMappingResponse: StoredResponse = {
      groupId: pmGroupId,
      answers: {
        q2: weightedAnswer(SCENARIO_1, rand),
        q3: weightedAnswer(SCENARIO_1, rand),
        q4: weightedAnswer(SCENARIO_1, rand),
        q5: weightedAnswer(SCENARIO_1, rand),
        q6: weightedAnswer(SCENARIO_2, rand),
        q7: weightedAnswer(SCENARIO_2, rand),
        q8: weightedAnswer(SCENARIO_2, rand),
        q9: weightedAnswer(SCENARIO_2, rand),
      },
      submittedAt,
    };
    localStorage.setItem(
      `bi:responses:${EVENT_ID}:problem-mapping:${slug}`,
      JSON.stringify(problemMappingResponse)
    );
    localStorage.setItem(
      `bi:groups:${EVENT_ID}:${slug}`,
      JSON.stringify({
        'problem-mapping': pmGroupId,
        'solution-design': sdGroups[i],
      })
    );

    // Session 3: Solution Design (q10-q13)
    const sdGroupId = sdGroups[i];
    const solutionDesignResponse: StoredResponse = {
      groupId: sdGroupId,
      answers: {
        q10: weightedAnswer(SCENARIO_1, rand),
        q11: weightedAnswer(SCENARIO_2, rand),
        q12: weightedAnswer(SCENARIO_1_POST, rand),
        q13: weightedAnswer(SCENARIO_2_POST, rand),
      },
      submittedAt,
    };
    localStorage.setItem(
      `bi:responses:${EVENT_ID}:solution-design:${slug}`,
      JSON.stringify(solutionDesignResponse)
    );

    // Session 4: Closing Plenary (q14-q15)
    const closingResponse: StoredResponse = {
      groupId: null,
      answers: {
        q14: weightedAnswer(LIKELIHOOD_1, rand),
        q15: weightedAnswer(LIKELIHOOD_2, rand),
      },
      submittedAt,
    };
    localStorage.setItem(
      `bi:responses:${EVENT_ID}:closing-plenary:${slug}`,
      JSON.stringify(closingResponse)
    );
  });

  localStorage.setItem(SEED_KEY, 'true');
}
