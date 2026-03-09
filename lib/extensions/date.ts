export function addYearsToDate(baseDate: Date, yearsToAdd: number): Date {
  const next = new Date(baseDate);
  const originalDay = next.getDate();
  next.setFullYear(next.getFullYear() + yearsToAdd);
  if (next.getDate() !== originalDay) next.setDate(0);
  return next;
}
