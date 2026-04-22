import type { EventConfig } from "@/types/homepage";

export function getEventConfig(): EventConfig {
  const iso = process.env.NEXT_PUBLIC_EVENT_DATE;
  return {
    event_datetime: iso ?? "",
  };
}
