import type { StoredResponse } from './types';

const EVENT_ID = 'sample-workshop';
const SEED_KEY = 'bi:mock-data-seeded';

const MOCK_NAMES = [
  'eager-happy-dolphin',
  'calm-wise-falcon',
  'swift-brave-tiger',
  'kind-witty-otter',
  'bold-quiet-raven',
  'warm-sharp-lynx',
  'cool-keen-badger',
  'fair-quick-hare',
  'deep-calm-crane',
  'true-bold-wolf',
];

// Weighted random to produce realistic distributions (slightly positive skew)
function weightedAnswer(scaleSize: number): number {
  const weights = [0.08, 0.15, 0.30, 0.30, 0.17]; // slight positive lean
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < scaleSize; i++) {
    cumulative += weights[i] ?? 1 / scaleSize;
    if (r < cumulative) return i;
  }
  return scaleSize - 1;
}

const BREAKOUT_GROUPS = ['growth', 'operations', 'talent'];

function assignGroups(count: number): string[] {
  // Distribute roughly evenly with some randomness
  const assignments: string[] = [];
  for (let i = 0; i < count; i++) {
    assignments.push(BREAKOUT_GROUPS[i % BREAKOUT_GROUPS.length]);
  }
  // Shuffle
  for (let i = assignments.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [assignments[i], assignments[j]] = [assignments[j], assignments[i]];
  }
  return assignments;
}

export function seedMockData() {
  // Only seed once
  if (localStorage.getItem(SEED_KEY)) return;

  const groupAssignments = assignGroups(MOCK_NAMES.length);

  // Stagger submission times over past 30 minutes for realism
  const now = Date.now();

  MOCK_NAMES.forEach((slug, i) => {
    const submittedAt = new Date(now - (MOCK_NAMES.length - i) * 3 * 60_000).toISOString();

    // Opening plenary (q1: 5-point, q2: 5-point)
    const plenaryResponse: StoredResponse = {
      groupId: null,
      answers: {
        q1: weightedAnswer(5),
        q2: weightedAnswer(5),
      },
      submittedAt,
    };
    localStorage.setItem(
      `bi:responses:${EVENT_ID}:opening-plenary:${slug}`,
      JSON.stringify(plenaryResponse)
    );

    // Breakout session (q3: 5-point, q4: 5-point)
    const groupId = groupAssignments[i];
    const breakoutResponse: StoredResponse = {
      groupId,
      answers: {
        q3: weightedAnswer(5),
        q4: weightedAnswer(5),
      },
      submittedAt,
    };
    localStorage.setItem(
      `bi:responses:${EVENT_ID}:breakout-priorities:${slug}`,
      JSON.stringify(breakoutResponse)
    );

    // Save group assignment
    localStorage.setItem(
      `bi:groups:${EVENT_ID}:${slug}`,
      JSON.stringify({ 'breakout-priorities': groupId })
    );
  });

  localStorage.setItem(SEED_KEY, 'true');
}
