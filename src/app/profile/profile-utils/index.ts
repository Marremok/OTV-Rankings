// Profile utilities - re-export all components and utilities

// Card components
export {
  StatCard,
  RecentRatingCard,
  PillarBreakdownCard,
  HighestRatingCard,
  RecentRatingSkeleton,
  PillarBreakdownSkeleton,
} from "./cards";
export type { StatCardProps, RecentRatingCardProps, PillarBreakdownCardProps, HighestRatingCardProps } from "./cards";

// Image upload components
export { ImageUploadDialog } from "./image-upload";
export type { ImageUploadDialogProps, UploadProgress } from "./image-upload";

// Section components
export { CurrentlyWatchingSection, PlaceholderSection } from "./sections";
export type { CurrentlyWatchingSectionProps, PlaceholderSectionProps } from "./sections";

// Menu components
export { ProfileMenu, CompactProfileMenu } from "./menu";
export type { ProfileMenuProps, SeriesStatusCounts, CompactMenuProps } from "./menu";

// Utility functions
export { capitalize, formatDate, getUserInitials, getScoreColor } from "./utils";
