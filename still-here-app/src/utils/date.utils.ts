// Date utility functions
import {
  format,
  formatDistance,
  isToday,
  isYesterday,
  differenceInDays,
  startOfDay,
  subDays,
  isSameDay,
} from 'date-fns';

/**
 * Format a date as a human-readable string
 * Examples: "Today at 9:15 AM", "Yesterday at 8:30 PM", "Jan 5 at 10:00 AM"
 */
export function formatCheckInDate(date: Date): string {
  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }

  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }

  return format(date, 'MMM d \'at\' h:mm a');
}

/**
 * Get relative time from now
 * Examples: "2 hours ago", "5 days ago"
 */
export function getRelativeTime(date: Date): string {
  return formatDistance(date, new Date(), { addSuffix: true });
}

/**
 * Calculate check-in streak
 * Returns number of consecutive days with at least one check-in
 */
export function calculateStreak(checkIns: Date[]): number {
  if (!checkIns || checkIns.length === 0) return 0;

  // Sort check-ins by date (most recent first)
  const sortedCheckIns = [...checkIns].sort((a, b) => b.getTime() - a.getTime());

  let streak = 0;
  const today = startOfDay(new Date());

  for (let i = 0; i < sortedCheckIns.length; i++) {
    const checkInDate = startOfDay(sortedCheckIns[i]);
    const expectedDate = subDays(today, streak);

    if (isSameDay(checkInDate, expectedDate)) {
      streak++;
    } else if (checkInDate < expectedDate) {
      // Found a gap in check-ins
      break;
    }
  }

  return streak;
}

/**
 * Check if a check-in is needed today
 */
export function needsCheckInToday(lastCheckIn: Date | null): boolean {
  if (!lastCheckIn) return true;
  return !isToday(lastCheckIn);
}

/**
 * Calculate days since last check-in
 */
export function daysSinceLastCheckIn(lastCheckIn: Date | null): number {
  if (!lastCheckIn) return Infinity;
  return differenceInDays(new Date(), lastCheckIn);
}

/**
 * Parse time string (HH:MM) to hour and minute
 */
export function parseTime(timeString: string): { hour: number; minute: number } {
  const [hour, minute] = timeString.split(':').map(Number);
  return { hour, minute };
}

/**
 * Format time for display (9:00 AM)
 */
export function formatTime(timeString: string): string {
  const [hour, minute] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return format(date, 'h:mm a');
}
