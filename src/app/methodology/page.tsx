"use client";

import { useState } from "react";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Import components from methodology-utils folder
import {
  StepCard,
  METHODOLOGY_STEPS,
  FormulaSection,
  WhyItMattersSection,
} from "./methodology-utils";

// ============================================
// MAIN METHODOLOGY PAGE COMPONENT
// ============================================

export default function MethodologyPage() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

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
        <HeroSection />

        {/* Steps Section */}
        <StepsSection activeStep={activeStep} onStepHover={setActiveStep} />

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

function HeroSection() {
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
          From Ratings to
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
          Discover how we transform structured, thoughtful ratings into comprehensive, fair, and
          transparent scores — across every type of media we cover.
        </p>

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
            A simple four-step process that ensures accurate and fair ratings across all media types.
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

function CTASection() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Rate?</h2>
        <p className="text-muted-foreground mb-8">
          Explore our rankings and contribute your own ratings to help build the most
          comprehensive and structured rating system on the internet.
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
