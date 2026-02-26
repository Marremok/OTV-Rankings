// Card components
export {
  StatCard,
  MediaRatingStatCard,
  RecentRatingCard,
  PillarBreakdownCard,
  HighestRatingCard,
  FavoriteCharacterCard,
  RecentRatingSkeleton,
  PillarBreakdownSkeleton,
} from "./cards";
export type { StatCardProps, MediaRatingStatCardProps, RecentRatingCardProps, PillarBreakdownCardProps, HighestRatingCardProps } from "./cards";

// Image upload components
export { ImageUploadDialog } from "./image-upload";
export type { ImageUploadDialogProps, UploadProgress } from "./image-upload";

// Section components
export { CurrentlyWatchingSection } from "./sections";
export type { CurrentlyWatchingSectionProps } from "./sections";

// Media list preview section (Seen / Watchlist)
export { MediaListPreviewSection } from "./MediaListPreviewSection";

// Favorites components
export { FavoriteSection, FavoriteCard, AddFavoriteDialog, ReplaceFavoriteDialog } from "./favorites";
export type { FavoriteSectionProps, FavoriteCardProps } from "./favorites";

// Menu components
export { ProfileMenu, CompactProfileMenu } from "./menu";
export type { ProfileMenuProps, SeriesStatusCounts, CompactMenuProps } from "./menu";

// Series list page component
export { SeriesListPage } from "./SeriesListPage";
export type { SeriesListPageProps } from "./SeriesListPage";

// Utility functions
export { capitalize, formatDate, getUserInitials, getScoreColor } from "./utils";
