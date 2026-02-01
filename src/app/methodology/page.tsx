"use client";

import { useState } from "react";
import { ArrowRight, Layers, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useGetPillarsByType } from "@/hooks/use-pillars";
import { mediaType } from "@/generated/prisma/enums";

// Import components from methodology-utils folder
import {
  StepCard,
  METHODOLOGY_STEPS,
  PillarShowcase,
  PillarSkeleton,
  FormulaSection,
  WhyItMattersSection,
} from "./methodology-utils";

// ============================================
// MAIN METHODOLOGY PAGE COMPONENT
// ============================================

export default function MethodologyPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [hoveredPillar, setHoveredPillar] = useState<string | null>(null);

  // Fetch pillars from database for SERIES media type
  const { data: pillars, isLoading: isPillarsLoading } = useGetPillarsByType(mediaType.SERIES);

  // Calculate total questions across all pillars
  const totalQuestions = pillars?.reduce((sum, p) => sum + p.questions.length, 0) ?? 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-125 h-125 bg-primary/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-100 h-100 bg-primary/5 rounded-full blur-[120px] animate-pulse [animation-delay:1s]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <HeroSection
          pillarsCount={pillars?.length ?? 0}
          totalQuestions={totalQuestions}
          isLoading={isPillarsLoading}
        />

        {/* Steps Section */}
        <StepsSection activeStep={activeStep} onStepHover={setActiveStep} />

        {/* Pillars Section */}
        <PillarsSection
          pillars={pillars}
          isLoading={isPillarsLoading}
          hoveredPillar={hoveredPillar}
          onPillarHover={setHoveredPillar}
        />

        {/* Formula Section */}
        <section className="px-6">
          <div className="max-w-6xl mx-auto">
            <FormulaSection />
          </div>
        </section>

        {/* Why It Matters Section */}
        <section className="py-16 px-6 bg-zinc-950/30">
          <div className="max-w-6xl mx-auto">
            <WhyItMattersSection />
          </div>
        </section>

        {/* CTA Section */}
        <CTASection />
      </div>
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface HeroSectionProps {
  pillarsCount: number;
  totalQuestions: number;
  isLoading: boolean;
}

function HeroSection({ pillarsCount, totalQuestions, isLoading }: HeroSectionProps) {
  return (
    <section className="py-20 md:py-28 px-6">
      <div className="max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20 backdrop-blur-sm mb-6">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-primary tracking-wide uppercase">
            Our Methodology
          </span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-foreground mb-4">
          From Quiz to
          <span className="text-primary"> OTV Score</span>
        </h1>

        {/* Divider */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-16 h-px bg-linear-to-r from-transparent to-primary/40" />
          <Sparkles className="w-4 h-4 text-primary/50" />
          <div className="w-16 h-px bg-linear-to-l from-transparent to-primary/40" />
        </div>

        {/* Description */}
        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-10">
          Discover how we transform your thoughtful ratings into comprehensive, fair, and
          transparent scores for every TV series.
        </p>

        {/* Stats row */}
        <div className="flex flex-wrap justify-center gap-8 mb-10">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {isLoading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : pillarsCount}
            </div>
            <div className="text-sm text-zinc-500">Pillars</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {isLoading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : totalQuestions}
            </div>
            <div className="text-sm text-zinc-500">Questions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">4</div>
            <div className="text-sm text-zinc-500">Steps</div>
          </div>
        </div>

        {/* CTA */}
        <Link href="/rankings">
          <Button size="lg" className="text-base px-8 py-6 shadow-lg shadow-primary/20">
            View Rankings
            <ChevronRight className="ml-1 w-5 h-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

interface StepsSectionProps {
  activeStep: number | null;
  onStepHover: (id: number | null) => void;
}

function StepsSection({ activeStep, onStepHover }: StepsSectionProps) {
  return (
    <section className="py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A simple four-step process that ensures accurate and fair ratings.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-12">
          {METHODOLOGY_STEPS.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              index={index}
              isActive={activeStep === step.id}
              onHover={onStepHover}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface PillarsSectionProps {
  pillars: any[] | undefined;
  isLoading: boolean;
  hoveredPillar: string | null;
  onPillarHover: (id: string | null) => void;
}

function PillarsSection({ pillars, isLoading, hoveredPillar, onPillarHover }: PillarsSectionProps) {
  return (
    <section className="py-16 px-6 bg-zinc-950/50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20 backdrop-blur-sm mb-4">
            <Layers className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary tracking-wide uppercase">
              Rating Pillars
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Core Evaluation Categories
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Every TV series is evaluated across distinct pillars, each focusing on critical
            aspects of quality.
          </p>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <PillarSkeleton key={i} index={i} />
            ))}
          </div>
        )}

        {/* Pillars grid - uses real data */}
        {!isLoading && pillars && pillars.length > 0 && (
          <>
            {/* First row - up to 3 pillars */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pillars.slice(0, 3).map((pillar, index) => (
                <PillarShowcase
                  key={pillar.id}
                  pillar={pillar}
                  index={index}
                  isHovered={hoveredPillar === pillar.id}
                  onHover={onPillarHover}
                />
              ))}
            </div>
            {/* Second row - remaining pillars centered */}
            {pillars.length > 3 && (
              <div
                className={cn(
                  "grid gap-4 mt-4",
                  pillars.length - 3 === 1
                    ? "grid-cols-1 max-w-md mx-auto"
                    : pillars.length - 3 === 2
                      ? "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto"
                      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                )}
              >
                {pillars.slice(3).map((pillar, index) => (
                  <PillarShowcase
                    key={pillar.id}
                    pillar={pillar}
                    index={index + 3}
                    isHovered={hoveredPillar === pillar.id}
                    onHover={onPillarHover}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!isLoading && (!pillars || pillars.length === 0) && (
          <div className="rounded-xl border border-dashed border-zinc-800/60 bg-zinc-900/20 p-12 text-center">
            <Layers className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-zinc-400 mb-2">No pillars configured</h3>
            <p className="text-sm text-zinc-600">
              Pillars will appear here once they are set up by an administrator.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Rate?</h2>
        <p className="text-muted-foreground mb-8">
          Explore our rankings and contribute your own ratings to help build the most
          comprehensive TV rating system.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/rankings">
            <Button size="lg" className="text-base px-8 py-6 shadow-lg shadow-primary/20">
              Browse Rankings
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 py-6 border-primary/30 hover:bg-primary/10"
            >
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
