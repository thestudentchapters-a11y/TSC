import CurrentAffairsEdition from '../models/CurrentAffairsEdition';
import { generateCurrentAffairsEdition } from './currentAffairsAi.service';
import { logger } from '../utils/logger';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Check if the given date is the last calendar day of its month.
 */
export function isLastDayOfMonth(d: Date = new Date()): boolean {
  const nextDay = new Date(d);
  nextDay.setDate(d.getDate() + 1);
  return nextDay.getMonth() !== d.getMonth();
}

/**
 * Calculate the next scheduled release date (last day of the current month).
 */
export function getNextScheduledReleaseDate(from: Date = new Date()): Date {
  const year = from.getFullYear();
  const month = from.getMonth();
  // Day 0 of next month is the last day of current month
  return new Date(year, month + 1, 0, 23, 59, 59);
}

/**
 * Core auto-publish logic:
 * Checks if today is the last day of the current month. If so, and the edition does not
 * yet exist, auto-generates the full edition using AI with non-repeating data and publishes it.
 */
export async function checkAndAutoPublishMonthlyEdition(force = false): Promise<boolean> {
  const now = new Date();
  const isLastDay = isLastDayOfMonth(now);

  if (!isLastDay && !force) {
    logger.info(`[Scheduler] Today is not the last day of ${MONTH_NAMES[now.getMonth()]}. Skipping auto-release.`);
    return false;
  }

  const currentMonth = MONTH_NAMES[now.getMonth()];
  const currentYear = now.getFullYear();

  logger.info(`[Scheduler] Checking Current Affairs edition for ${currentMonth} ${currentYear}...`);

  try {
    const existing = await CurrentAffairsEdition.findOne({
      month: currentMonth,
      year: currentYear,
    });

    if (existing) {
      logger.info(`[Scheduler] Edition for ${currentMonth} ${currentYear} already exists (${existing.status}). No duplicate creation needed.`);
      return false;
    }

    logger.info(`[Scheduler] Auto-generating and releasing new Current Affairs edition for ${currentMonth} ${currentYear}...`);
    const generated = await generateCurrentAffairsEdition(currentMonth, currentYear);

    const doc = await CurrentAffairsEdition.create({
      ...generated,
      status: 'published',
    });

    logger.info(`[Scheduler] Successfully auto-published ${doc.title} (slug: ${doc.slug}) on the last day of ${currentMonth}!`);
    return true;
  } catch (err) {
    logger.error(`[Scheduler] Failed to auto-generate monthly edition for ${currentMonth} ${currentYear}:`, err);
    return false;
  }
}

/**
 * Starts the background auto-publish scheduler when the server boots.
 * Runs an initial check and schedules recurring daily checks.
 */
export function startMonthlyEditionScheduler(): void {
  logger.info('[Scheduler] Current Affairs Monthly Auto-Release Scheduler initialized.');

  // Run on startup after 5 seconds to allow DB connection to stabilize
  setTimeout(() => {
    void checkAndAutoPublishMonthlyEdition(false);
  }, 5000);

  // Check every 6 hours
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  setInterval(() => {
    void checkAndAutoPublishMonthlyEdition(false);
  }, SIX_HOURS);
}
