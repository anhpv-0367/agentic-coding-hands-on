export type KudoTier = "new" | "rising" | "super" | "legend";

export type UserRef = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  tier: KudoTier;
  department?: string;
};

export type Kudo = {
  id: string;
  sender: UserRef;
  recipient: UserRef;
  title: string;
  is_anonymous: boolean;
  message: string;
  hashtags: string[];
  created_at: string;
  heart_count: number;
  liked_by_me: boolean;
  attachment_urls: string[];
  share_url: string;
};

export type KudosStats = {
  received: number;
  sent: number;
  hearts: number;
  boxes_opened: number;
  boxes_unopened: number;
  tier: KudoTier;
};

export type LeaderboardEntry = {
  user: UserRef;
  description: string;
  rank: number;
  meta?: string;
};

export type SpotlightNode = {
  kudo_id: string;
  recipient: UserRef;
  received_at: string;
};

export type SpotlightFeedResponse = {
  total: number;
  nodes: SpotlightNode[];
};

export type KudoListResponse = {
  items: Kudo[];
  next_cursor: string | null;
};

export type GiftBoxRewardKind = "points" | "badge" | "coupon" | "voucher";

export type GiftBoxReward = {
  id: string;
  kind: GiftBoxRewardKind;
  label: string;
  value?: number;
  image_url?: string | null;
};

export type KudosFilters = {
  hashtag?: string;
  department?: string;
};

export type KudosFilterOptions = {
  hashtags: string[];
  departments: string[];
};

export type KudoReactionType = "heart";

export type CreateKudoInput = {
  recipient_id: string;
  title: string;
  message: string;
  hashtags: string[];
  attachment_urls?: string[];
  is_anonymous: boolean;
};

export type ComposeDraftPayload = {
  recipient?: UserRef | null;
  title?: string;
  message?: string;
  hashtags?: string[];
  attachment_urls?: string[];
  is_anonymous?: boolean;
};

export type KudoDraft = {
  payload: ComposeDraftPayload;
  updated_at: string;
};
