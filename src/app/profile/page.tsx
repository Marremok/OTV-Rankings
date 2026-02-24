"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Mail,
  Calendar,
  Star,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Trophy,
  Settings,
  Camera,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useUserProfileData,
  useUserImages,
  useUpdateProfileImage,
  useUpdateHeroImage,
} from "@/hooks/use-user-profile";

import {
  StatCard,
  ImageUploadDialog,
  CurrentlyWatchingSection,
  FavoriteSection,
  MediaListPreviewSection,
  getUserInitials,
} from "@/components/profile";

// ============================================
// MAIN PROFILE PAGE COMPONENT
// ============================================

export default function ProfilePage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();
  const user = session?.user;

  const [showProfileUpload, setShowProfileUpload] = useState(false);
  const [showHeroUpload, setShowHeroUpload] = useState(false);

  const { data: profileData, isLoading: isProfileLoading } = useUserProfileData(user?.id);
  const { data: userImages } = useUserImages(user?.id);

  const updateProfileImage = useUpdateProfileImage();
  const updateHeroImage = useUpdateHeroImage();

  useEffect(() => {
    if (!isSessionPending && !user) {
      router.push("/");
    }
  }, [isSessionPending, user, router]);

  if (isSessionPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = getUserInitials(user.name, user.email);
  const joinDate = profileData?.joinDate
    ? new Date(profileData.joinDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently";
  const stats = profileData?.stats ?? null;
  const displayImage = userImages?.profileImage || user.image;
  const heroImage = userImages?.heroImage;

  const handleProfileImageUpload = (imageUrl: string) => {
    if (user?.id) updateProfileImage.mutate({ userId: user.id, imageUrl });
  };

  const handleHeroImageUpload = (imageUrl: string) => {
    if (user?.id) updateHeroImage.mutate({ userId: user.id, imageUrl });
  };

  return (
    <div className="min-h-screen bg-zinc-950 relative selection:bg-primary/30">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-200 h-200 bg-primary/15 rounded-full blur-[140px] opacity-60" />
        <div className="absolute -bottom-[20%] -left-[10%] w-200 h-200 bg-indigo-600/10 rounded-full blur-[160px] opacity-60" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-150 h-150 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <div className="relative z-10">
        {/* Hero Banner */}
        <HeroBanner heroImage={heroImage} onEditClick={() => setShowHeroUpload(true)} />

        {/* Profile Header */}
        <ProfileHeader
          user={user}
          displayImage={displayImage}
          initials={initials}
          joinDate={joinDate}
          onEditAvatarClick={() => setShowProfileUpload(true)}
        />

        {/* Stats Section */}
        <StatsSection stats={stats} isLoading={isProfileLoading} />

        {/* Currently Watching */}
        <section className="py-8 px-4 md:py-12 md:px-6 border-t border-white/5 bg-zinc-900/20 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto">
            <CurrentlyWatchingSection userId={user?.id} />
          </div>
        </section>

        {/* Favorite Shows */}
        <section className="py-8 px-4 md:py-12 md:px-6 border-t border-white/5 bg-zinc-900/20 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto">
            <FavoriteSection userId={user.id} isOwner={true} mediaType="SERIES" title="Favorite Shows" />
          </div>
        </section>

        {/* Favorite Characters */}
        <section className="py-8 px-4 md:py-12 md:px-6 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <FavoriteSection userId={user.id} isOwner={true} mediaType="CHARACTER" title="Favorite Characters" />
          </div>
        </section>

        {/* Seen */}
        <section className="py-8 px-4 md:py-12 md:px-6 border-t border-white/5 bg-zinc-900/20 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto">
            <MediaListPreviewSection
              userId={user.id}
              status="seen"
              title="Seen"
              viewAllHref="/profile/seen"
            />
          </div>
        </section>

        {/* Watchlist */}
        <section className="py-8 px-4 md:py-12 md:px-6 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <MediaListPreviewSection
              userId={user.id}
              status="watchlist"
              title="Watchlist"
              viewAllHref="/profile/watchlist"
            />
          </div>
        </section>
      </div>

      {/* Image Upload Dialogs */}
      <ImageUploadDialog
        isOpen={showProfileUpload}
        onClose={() => setShowProfileUpload(false)}
        onUpload={handleProfileImageUpload}
        title="Update Profile Picture"
        aspectRatio="square"
        isLoading={updateProfileImage.isPending}
      />
      <ImageUploadDialog
        isOpen={showHeroUpload}
        onClose={() => setShowHeroUpload(false)}
        onUpload={handleHeroImageUpload}
        title="Update Profile Banner"
        aspectRatio="wide"
        isLoading={updateHeroImage.isPending}
      />
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function HeroBanner({ heroImage, onEditClick }: { heroImage: string | null | undefined; onEditClick: () => void }) {
  return (
    <section className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
      {heroImage ? (
        <img src={heroImage} alt="Profile banner" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-linear-to-br from-zinc-900 via-zinc-800 to-zinc-900">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-size-[2rem_2rem] opacity-20" />
        </div>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />
      <button
        onClick={onEditClick}
        className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-white/80 hover:text-white hover:bg-black/70 transition-all duration-300"
      >
        <Camera className="w-4 h-4" />
        <span className="text-sm">Edit Banner</span>
      </button>
    </section>
  );
}

interface ProfileHeaderProps {
  user: { name?: string | null; email: string; image?: string | null };
  displayImage: string | null | undefined;
  initials: string;
  joinDate: string;
  onEditAvatarClick: () => void;
}

function ProfileHeader({ user, displayImage, initials, joinDate, onEditAvatarClick }: ProfileHeaderProps) {
  return (
    <section className="relative -mt-16 md:-mt-20 px-6 pb-8 border-b border-zinc-800/50">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="absolute -inset-2 rounded-full bg-linear-to-br from-primary/20 to-primary/5 blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-zinc-800 flex items-center justify-center text-3xl font-bold text-white overflow-hidden border-4 border-background shadow-xl">
              {displayImage ? (
                <img src={displayImage} alt={user.name || "User"} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">{initials}</span>
              )}
            </div>
            <button
              onClick={onEditAvatarClick}
              className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-zinc-800 border-2 border-background flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all duration-300 shadow-lg"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>

          {/* User info */}
          <div className="flex-1 pb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{user.name || "Anonymous User"}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
              <div className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Joined {joinDate}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

interface StatsSectionProps {
  stats: {
    totalRatings: number
    avgScore: number
    highestRating: { score: number; title: string; slug: string | null } | null
    lowestRating: { score: number; title: string; slug: string | null } | null
  } | null
  isLoading: boolean
}

function StatsSection({ stats, isLoading }: StatsSectionProps) {
  const avgDisplay = stats && stats.avgScore > 0 ? stats.avgScore.toFixed(2) : "—"
  const highDisplay = stats?.highestRating ? stats.highestRating.score.toFixed(2) : "—"
  const lowDisplay = stats?.lowestRating ? stats.lowestRating.score.toFixed(2) : "—"

  return (
    <section className="py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Your Stats
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Star}
            label="Total Ratings"
            value={stats?.totalRatings ?? 0}
            subtext="across all media"
            delay={0}
            isLoading={isLoading}
          />
          <StatCard
            icon={TrendingUp}
            label="Average Score"
            value={avgDisplay}
            subtext="your mean rating"
            color="text-emerald-400"
            delay={100}
            isLoading={isLoading}
          />
          <StatCard
            icon={Trophy}
            label="Highest Rating"
            value={highDisplay}
            subtext={stats?.highestRating?.title ?? "No ratings yet"}
            color="text-amber-400"
            delay={200}
            isLoading={isLoading}
          />
          <StatCard
            icon={TrendingDown}
            label="Lowest Rating"
            value={lowDisplay}
            subtext={stats?.lowestRating?.title ?? "No ratings yet"}
            color="text-zinc-400"
            delay={300}
            isLoading={isLoading}
          />
        </div>
      </div>
    </section>
  );
}
