"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Mail,
  Calendar,
  Star,
  BarChart3,
  Tv,
  Sparkles,
  ChevronRight,
  Settings,
  Award,
  TrendingUp,
  Clock,
  Heart,
  Loader2,
  Camera,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  useUserProfileData,
  useUserHighestRating,
  useUserImages,
  useUpdateProfileImage,
  useUpdateHeroImage,
  useUserSeriesStatusCounts,
} from "@/hooks/use-user-profile";

// Import components from profile-utils folder
import {
  StatCard,
  RecentRatingCard,
  PillarBreakdownCard,
  RecentRatingSkeleton,
  PillarBreakdownSkeleton,
  HighestRatingCard,
  ImageUploadDialog,
  CurrentlyWatchingSection,
  PlaceholderSection,
  ProfileMenu,
  getUserInitials,
} from "./profile-utils";

// ============================================
// MAIN PROFILE PAGE COMPONENT
// ============================================

export default function ProfilePage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();
  const user = session?.user;

  // State for image upload dialogs
  const [showProfileUpload, setShowProfileUpload] = useState(false);
  const [showHeroUpload, setShowHeroUpload] = useState(false);

  // Fetch profile data from database
  const { data: profileData, isLoading: isProfileLoading } = useUserProfileData(user?.id);

  // Fetch highest rating
  const { data: highestRating, isLoading: isHighestRatingLoading } = useUserHighestRating(user?.id);

  // Fetch user images
  const { data: userImages } = useUserImages(user?.id);

  // Fetch series status counts
  const { data: statusCounts, isLoading: isStatusCountsLoading } = useUserSeriesStatusCounts(user?.id);

  // Image upload mutations
  const updateProfileImage = useUpdateProfileImage();
  const updateHeroImage = useUpdateHeroImage();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isSessionPending && !user) {
      router.push("/");
    }
  }, [isSessionPending, user, router]);

  // Loading state for session
  if (isSessionPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Computed values
  const initials = getUserInitials(user.name, user.email);
  const joinDate = profileData?.joinDate
    ? new Date(profileData.joinDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently";
  const stats = profileData?.stats ?? { totalRatings: 0, seriesRated: 0, avgScore: 0 };
  const displayImage = userImages?.profileImage || user.image;
  const heroImage = userImages?.heroImage;

  // Handlers
  const handleProfileImageUpload = (imageUrl: string) => {
    if (user?.id) updateProfileImage.mutate({ userId: user.id, imageUrl });
  };

  const handleHeroImageUpload = (imageUrl: string) => {
    if (user?.id) updateHeroImage.mutate({ userId: user.id, imageUrl });
  };

  return (
    <div className="min-h-screen bg-zinc-950 relative selection:bg-primary/30">
      {/* --- NY BAKGRUND: Ambient Glow & Vignette --- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Huvudsken uppe till höger */}
        <div className="absolute -top-[20%] -right-[10%] w-200 h-200 bg-primary/15 rounded-full blur-[140px] opacity-60" />
        
        {/* Sekundärt sken nere till vänster */}
        <div className="absolute -bottom-[20%] -left-[10%] w-200 h-200 bg-indigo-600/10 rounded-full blur-[160px] opacity-60" />
        
        {/* Accent i mitten (subtil) */}
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-150 h-150 bg-primary/5 rounded-full blur-[120px]" />

        {/* Vinjett: Gör kanterna mörkare för att fokusera på innehållet */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <div className="relative z-10">
        {/* Hero Banner Section */}
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
        <StatsSection stats={stats} highestRating={highestRating} isLoading={isProfileLoading} isHighestRatingLoading={isHighestRatingLoading} />

        {/* Currently Watching Section - Med glas-effekt */}
        <section className="py-12 px-6 border-t border-white/5 bg-zinc-900/20 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto">
            <CurrentlyWatchingSection userId={user?.id} />
          </div>
        </section>

        {/* Main Content Grid */}
        <MainContentSection profileData={profileData} isLoading={isProfileLoading} />

        {/* Bottom Menu Section - Med glas-effekt */}
        <section className="py-12 px-6 border-t border-white/5 bg-zinc-900/20 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <List className="w-5 h-5 text-primary" />
              Your Lists
            </h2>
            <ProfileMenu
              counts={statusCounts ?? { watchlist: 0, seen: 0, watching: 0, favorites: 0 }}
              isLoading={isStatusCountsLoading}
            />
          </div>
        </section>

        {/* Future Features Section */}
        <section className="py-12 px-6 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Coming Soon
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PlaceholderSection
                icon={Award}
                title="Achievements"
                description="Unlock badges and achievements as you rate more shows and reach milestones."
              />
              <PlaceholderSection
                icon={Heart}
                title="Social Features"
                description="Follow friends, share your lists, and see what they're watching."
              />
            </div>
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
// SUB-COMPONENTS (kept in page for simplicity)
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
  stats: { totalRatings: number; seriesRated: number; avgScore: number };
  highestRating: any;
  isLoading: boolean;
  isHighestRatingLoading: boolean;
}

function StatsSection({ stats, highestRating, isLoading, isHighestRatingLoading }: StatsSectionProps) {
  return (
    <section className="py-10 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Your Stats
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Star} label="Total Ratings" value={stats.totalRatings} subtext="across all pillars" delay={0} isLoading={isLoading} />
          <StatCard icon={Tv} label="Series Rated" value={stats.seriesRated} subtext="unique shows" delay={100} isLoading={isLoading} />
          <StatCard
            icon={TrendingUp}
            label="Average Score"
            value={stats.avgScore > 0 ? stats.avgScore.toFixed(1) : "—"}
            subtext="your mean rating"
            color="text-emerald-400"
            delay={200}
            isLoading={isLoading}
          />
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: "300ms" }}>
            <HighestRatingCard rating={highestRating ?? null} isLoading={isHighestRatingLoading} />
          </div>
        </div>
      </div>
    </section>
  );
}

interface MainContentSectionProps {
  profileData: any;
  isLoading: boolean;
}

function MainContentSection({ profileData, isLoading }: MainContentSectionProps) {
  return (
    <section className="py-10 px-6 border-t border-zinc-800/50">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Recent Ratings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Recent Ratings
              </h2>
              {profileData?.recentRatings && profileData.recentRatings.length > 0 && (
                <Link href="/profile/ratings" className="text-sm text-primary hover:underline flex items-center gap-1">
                  View all
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {isLoading && (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <RecentRatingSkeleton key={i} index={i} />
                ))}
              </div>
            )}

            {!isLoading && profileData?.recentRatings && profileData.recentRatings.length > 0 && (
              <div className="space-y-3">
                {profileData.recentRatings.map((rating: any, index: number) => (
                  <RecentRatingCard key={rating.id} rating={rating} index={index} />
                ))}
              </div>
            )}

            {!isLoading && (!profileData?.recentRatings || profileData.recentRatings.length === 0) && (
              <div className="rounded-xl border border-dashed border-zinc-800/60 bg-zinc-900/20 p-12 text-center">
                <Star className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-zinc-400 mb-2">No ratings yet</h3>
                <p className="text-sm text-zinc-600 mb-6">Start rating TV series to build your profile</p>
                <Link href="/rankings">
                  <Button>Browse Rankings</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Right Column - Pillar Breakdown */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Pillar Breakdown
            </h2>

            {isLoading && (
              <div className="space-y-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <PillarBreakdownSkeleton key={i} index={i} />
                ))}
              </div>
            )}

            {!isLoading && profileData?.pillarBreakdown && profileData.pillarBreakdown.length > 0 && (
              <div className="space-y-3">
                {profileData.pillarBreakdown.map((pillar: any, index: number) => (
                  <PillarBreakdownCard key={pillar.pillarId} pillar={pillar} index={index} />
                ))}
              </div>
            )}

            {!isLoading && (!profileData?.pillarBreakdown || profileData.pillarBreakdown.length === 0) && (
              <div className="rounded-xl border border-dashed border-zinc-800/60 bg-zinc-900/20 p-6 text-center">
                <Sparkles className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
                <p className="text-sm text-zinc-500">Rate series to see your pillar breakdown</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
