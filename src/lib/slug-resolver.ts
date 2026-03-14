import type { EventDef, EventConfig } from './types';

export function resolveSlug(
  config: EventConfig,
  slug: string
): { event: EventDef; participantSlug: string } | null {
  for (const event of config.events) {
    const participant = event.participants.find((p) => p.slug === slug);
    if (participant) {
      return { event, participantSlug: participant.slug };
    }
  }
  return null;
}
