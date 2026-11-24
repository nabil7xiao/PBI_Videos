/**
 * Simple protection against password guessing: after 5 failed logins for the
 * same email within 15 minutes, further attempts are refused until the window
 * passes. Kept in memory, which is fine for a single shop server.
 */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const failures = new Map<string, number[]>();

function recent(key: string) {
  const now = Date.now();
  const list = (failures.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  failures.set(key, list);
  return list;
}

export function isLockedOut(key: string): boolean {
  return recent(key).length >= MAX_FAILURES;
}

export function recordFailure(key: string) {
  recent(key).push(Date.now());
}

export function clearFailures(key: string) {
  failures.delete(key);
}
