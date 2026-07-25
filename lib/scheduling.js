import { DateTime } from 'luxon';

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 16; // 4pm
const BASE_INTERVAL_SEC = 60;
const JITTER_MIN_SEC = 20;
const JITTER_MAX_SEC = 45;

function jitteredInterval() {
  const jitter = Math.floor(Math.random() * (JITTER_MAX_SEC - JITTER_MIN_SEC + 1)) + JITTER_MIN_SEC;
  return BASE_INTERVAL_SEC + jitter; // ~80-105 sec apart, never a flat 60s
}

// Rolls a DateTime forward to the next valid working slot in that timezone
function rollToWorkingSlot(dt) {
  let d = dt;
  // if weekend, roll to next Monday 9am
  while (d.weekday === 6 || d.weekday === 7) {
    d = d.plus({ days: 1 }).set({ hour: WORK_START_HOUR, minute: 0, second: 0 });
  }
  if (d.hour < WORK_START_HOUR) {
    d = d.set({ hour: WORK_START_HOUR, minute: 0, second: 0 });
  } else if (d.hour >= WORK_END_HOUR) {
    d = d.plus({ days: 1 }).set({ hour: WORK_START_HOUR, minute: 0, second: 0 });
    return rollToWorkingSlot(d); // re-check in case it landed on a weekend
  }
  return d;
}

/**
 * Computes the next available scheduled_send_at for a lead in a given timezone,
 * given the current max already-queued time for that same timezone.
 *
 * @param {string} timezone - IANA tz string, e.g. 'America/Chicago'
 * @param {string|null} currentMaxIso - max scheduled_send_at ISO string among
 *        already-approved-but-unsent leads in this same timezone, or null
 * @returns {string} ISO timestamp for scheduled_send_at
 */
export function computeNextSlot(timezone, currentMaxIso) {
  const now = DateTime.now().setZone(timezone);

  if (!currentMaxIso) {
    return rollToWorkingSlot(now).toISO();
  }

  const currentMax = DateTime.fromISO(currentMaxIso, { zone: timezone });
  const candidate = currentMax.plus({ seconds: jitteredInterval() });
  return rollToWorkingSlot(candidate).toISO();
}
