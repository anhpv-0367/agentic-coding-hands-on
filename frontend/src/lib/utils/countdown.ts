import type { CountdownValues } from "@/types/homepage";

export function computeRemaining(target: Date, now: Date): CountdownValues {
  const targetMs = target.getTime();
  const nowMs = now.getTime();

  if (!Number.isFinite(targetMs) || !Number.isFinite(nowMs) || targetMs <= nowMs) {
    return { days: 0, hours: 0, minutes: 0, isPast: true };
  }

  const diffMs = targetMs - nowMs;
  const totalMinutes = Math.floor(diffMs / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes, isPast: false };
}

export function zeroPad2(n: number): string {
  const safe = Math.max(0, Math.min(99, Math.floor(n)));
  return safe < 10 ? `0${safe}` : String(safe);
}

export function parseEventDate(iso: string | undefined): Date | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function msUntilNextMinute(now: Date): number {
  const ms = 60_000 - (now.getTime() % 60_000);
  return ms <= 0 ? 60_000 : ms;
}
