export function getLocalDateString(timeZone: string, date: Date = new Date()): string {
  try {
    // 'en-CA' formatter returns YYYY-MM-DD
    const formatter = new Intl.DateTimeFormat('en-CA', { 
      timeZone, 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
    return formatter.format(date);
  } catch (e) {
    console.warn(`Invalid timezone "${timeZone}", falling back to UTC`);
    const formatter = new Intl.DateTimeFormat('en-CA', { 
      timeZone: 'UTC', 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
    return formatter.format(date);
  }
}

export function getLocalMidnightDate(timeZone: string, date: Date = new Date()): Date {
  const localDateStr = getLocalDateString(timeZone, date);
  // Store as an exact UTC midnight date representation of the local day
  return new Date(`${localDateStr}T00:00:00Z`);
}

export function getLocalDayOfWeek(timeZone: string, date: Date = new Date()): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', { 
      timeZone, 
      weekday: 'short' 
    });
    const dayName = formatter.format(date);
    const map: Record<string, number> = {
      'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
    };
    return map[dayName] ?? 0;
  } catch (e) {
    return date.getUTCDay();
  }
}
