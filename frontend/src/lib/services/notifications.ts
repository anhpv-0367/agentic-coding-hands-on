import type { NotificationSummary } from "@/types/homepage";

export function getNotificationsSummary(): NotificationSummary {
  return {
    unread_count: 0,
    last_updated: null,
  };
}
