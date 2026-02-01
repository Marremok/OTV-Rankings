"use client";

import { Target, Scale, BarChart3, Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// FEATURES DATA
// ============================================

const FEATURES = [
  {
    icon: Target,
    title: "Precise Evaluation",
    description: "Every aspect of a show is evaluated individually, ensuring no detail is overlooked.",
  },
  {
    icon: Scale,
    title: "Balanced Weights",
    description: "Questions and pillars are weighted based on their importance to overall quality.",
  },
  {
    icon: BarChart3,
    title: "Community Aggregate",
    description: "Individual ratings combine to form a community consensus score.",
  },
  {
    icon: Star,
    title: "No Arbitrary Scores",
    description: "Every score is calculated transparently from specific criteria, not gut feelings.",
  },
];

// ============================================
// COMPONENT: Why It Matters Section
// ============================================

export function WhyItMattersSection() {
  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-full border border-primary/20 backdrop-blur-sm mb-4">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary tracking-wide uppercase">
            Why It Matters
          </span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Fair, Transparent, Structured
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Our methodology ensures every show gets evaluated fairly across all dimensions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className={cn(
                "relative group p-6 rounded-xl transition-all duration-500",
                "border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm",
                "hover:border-zinc-700/60 hover:bg-zinc-900/60",
                "animate-in fade-in slide-in-from-bottom-4 duration-700"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-zinc-800/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-bold text-zinc-200 mb-2">{feature.title}</h4>
              <p className="text-sm text-zinc-500 leading-relaxed">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
