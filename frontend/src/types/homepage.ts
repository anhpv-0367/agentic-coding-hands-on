export type AwardSlug =
  | "top-talent"
  | "top-project"
  | "top-project-leader"
  | "best-manager"
  | "signature-2025-creator"
  | "mvp";

export type AwardCategory = {
  slug: AwardSlug;
  i18nKey: string;
  imageUrl: string;
  order: number;
};

export type EventConfig = {
  event_datetime: string;
};

export type NotificationSummary = {
  unread_count: number;
  last_updated: string | null;
};

export type UserRole = "user" | "admin";

export type CountdownValues = {
  days: number;
  hours: number;
  minutes: number;
  isPast: boolean;
};
