import { z } from "zod";

const HASHTAG_RE = /^[\p{L}\p{N}_ -]{1,32}$/u;
// Lenient UUID pattern: matches any 8-4-4-4-12 hex-dash string (including
// test fixtures like `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb` which do not
// carry a valid RFC-4122 version nibble).
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const uuidString = () => z.string().regex(UUID_RE, "Invalid UUID");

export const CreateKudoSchema = z.object({
  recipient_id: uuidString(),
  title: z.string().min(1).max(80),
  message: z.string().min(10).max(2000),
  hashtags: z.array(z.string().regex(HASHTAG_RE)).min(1).max(5),
  attachment_urls: z.array(z.string().url()).max(5).optional().default([]),
  is_anonymous: z.boolean().optional().default(false),
});

export type CreateKudoInput = z.infer<typeof CreateKudoSchema>;

export const DraftPayloadSchema = z.object({
  recipient: z
    .object({
      id: uuidString(),
      display_name: z.string(),
      avatar_url: z.string().nullable().optional(),
      tier: z.enum(["new", "rising", "super", "legend"]),
      department: z.string().optional(),
    })
    .nullable()
    .optional(),
  title: z.string().max(80).optional(),
  message: z.string().max(2000).optional(),
  hashtags: z.array(z.string().regex(HASHTAG_RE)).max(5).optional(),
  attachment_urls: z.array(z.string().url()).max(5).optional(),
  is_anonymous: z.boolean().optional(),
});

export type DraftPayloadInput = z.infer<typeof DraftPayloadSchema>;

export const ReactionSchema = z.object({
  type: z.literal("heart").default("heart"),
});

export type ReactionInput = z.infer<typeof ReactionSchema>;

export const KudosListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  hashtag: z.string().regex(HASHTAG_RE).optional(),
  department: z.string().min(1).max(64).optional(),
});

export type KudosListQuery = z.infer<typeof KudosListQuerySchema>;

export const SunnerSearchSchema = z.object({
  search: z.string().max(64).optional().default(""),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export type SunnerSearch = z.infer<typeof SunnerSearchSchema>;

export const SpotlightFeedQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).optional().default(118),
});

export type SpotlightFeedQuery = z.infer<typeof SpotlightFeedQuerySchema>;

export const LeaderboardQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

export type LeaderboardQuery = z.infer<typeof LeaderboardQuerySchema>;

export const UploadLimits = {
  maxBytes: 5 * 1024 * 1024,
  maxFiles: 5,
  allowedMime: new Set(["image/jpeg", "image/png", "image/webp"]),
} as const;
