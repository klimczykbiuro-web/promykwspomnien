const DEFAULT_TIMEZONE = process.env.APACZKA_BUSINESS_TIMEZONE || "Europe/Warsaw";

function getZonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value || "0");

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
  }).formatToParts(date);

  const label = parts.find((part) => part.type === "timeZoneName")?.value || "GMT+0";
  const match = label.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);

  if (!match) {
    return 0;
  }

  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2] || "0");
  const minutes = Number(match[3] || "0");

  return sign * (hours * 60 + minutes);
}

function zonedDateToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string
) {
  const guess = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const offset1 = getTimeZoneOffsetMinutes(guess, timeZone);
  const adjusted1 = new Date(guess.getTime() - offset1 * 60_000);
  const offset2 = getTimeZoneOffsetMinutes(adjusted1, timeZone);

  if (offset1 === offset2) {
    return adjusted1;
  }

  return new Date(guess.getTime() - offset2 * 60_000);
}

function addDaysToParts(parts: { year: number; month: number; day: number }, days: number) {
  const utc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  utc.setUTCDate(utc.getUTCDate() + days);
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

export function getShippingBusinessWindow(now = new Date(), timeZone = DEFAULT_TIMEZONE) {
  const zonedNow = getZonedParts(now, timeZone);
  const startLocalDate =
    zonedNow.hour >= 10
      ? { year: zonedNow.year, month: zonedNow.month, day: zonedNow.day }
      : addDaysToParts({ year: zonedNow.year, month: zonedNow.month, day: zonedNow.day }, -1);

  const windowStart = zonedDateToUtc(
    startLocalDate.year,
    startLocalDate.month,
    startLocalDate.day,
    10,
    0,
    0,
    timeZone
  );
  const windowEnd = new Date(windowStart.getTime() + 24 * 60 * 60 * 1000);

  const businessDay = `${startLocalDate.year}-${String(startLocalDate.month).padStart(2, "0")}-${String(startLocalDate.day).padStart(2, "0")}`;

  return {
    timeZone,
    businessDay,
    windowStart,
    windowEnd,
  };
}
