import { useCallback } from 'react';
import type { StoredResponse, StoredGroups } from '../lib/types';

function responseKey(eventId: string, sessionId: string, slug: string) {
  return `bi:responses:${eventId}:${sessionId}:${slug}`;
}

function groupKey(eventId: string, slug: string) {
  return `bi:groups:${eventId}:${slug}`;
}

export function useResponses(eventId: string, slug: string) {
  const getResponse = useCallback(
    (sessionId: string): StoredResponse | null => {
      const raw = localStorage.getItem(responseKey(eventId, sessionId, slug));
      return raw ? JSON.parse(raw) : null;
    },
    [eventId, slug]
  );

  const saveResponse = useCallback(
    (sessionId: string, data: StoredResponse) => {
      localStorage.setItem(
        responseKey(eventId, sessionId, slug),
        JSON.stringify(data)
      );
    },
    [eventId, slug]
  );

  const getGroupAssignment = useCallback(
    (sessionId: string): string | null => {
      const raw = localStorage.getItem(groupKey(eventId, slug));
      if (!raw) return null;
      const groups: StoredGroups = JSON.parse(raw);
      return groups[sessionId] ?? null;
    },
    [eventId, slug]
  );

  const setGroupAssignment = useCallback(
    (sessionId: string, groupId: string) => {
      const raw = localStorage.getItem(groupKey(eventId, slug));
      const groups: StoredGroups = raw ? JSON.parse(raw) : {};
      groups[sessionId] = groupId;
      localStorage.setItem(groupKey(eventId, slug), JSON.stringify(groups));
    },
    [eventId, slug]
  );

  return { getResponse, saveResponse, getGroupAssignment, setGroupAssignment };
}

// Utility to get all responses for a session (across all participants)
export function getAllResponses(
  eventId: string,
  sessionId: string
): { slug: string; response: StoredResponse }[] {
  const results: { slug: string; response: StoredResponse }[] = [];
  const prefix = `bi:responses:${eventId}:${sessionId}:`;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const slug = key.slice(prefix.length);
      const raw = localStorage.getItem(key);
      if (raw) {
        results.push({ slug, response: JSON.parse(raw) });
      }
    }
  }
  return results;
}

export function clearSessionResponses(eventId: string, sessionId: string) {
  const prefix = `bi:responses:${eventId}:${sessionId}:`;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}
