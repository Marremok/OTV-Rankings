import Hero from "@/components/home/hero";
import RankedPreview from "@/components/home/ranked-preview";
import { Target, Scale, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// ── Static philosophy cards ──────────────────────────────────────────────────
const PHILOSOPHY = [
  {
    icon: Target,
    title: "Criteria, not impressions",
    description:
      "Every score is built from specific questions — not a single gut-feel rating. Each point you give has a reason attached to it.",
  },
  {
    icon: Scale,
    title: "Weighted for accuracy",
    description:
      "Not all criteria carry equal weight. The scoring formula reflects what genuinely matters in a great work, not just what's easy to rate.",
  },
  {
    icon: BarChart3,
    title: "Community consensus",
    description:
      "Individual ratings aggregate into a shared score that grows more reliable with every new contribution. Wisdom of the crowd, structured.",
  },
];

export default function Home() {
  return (
    <div className="bg-background">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Hero />

      {/* ── Live rankings preview ──────────────────────────────────────────── */}
      <RankedPreview />

      {/* ── Philosophy strip ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-zinc-950/40 border-t border-border/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.15em] text-primary font-semibold mb-3">
              Our Approach
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Not just another ranking site.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A methodology-first platform where every score is transparent, structured, and
              explainable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {PHILOSOPHY.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="p-6 rounded-xl border border-zinc-800/60 bg-zinc-900/40 backdrop-blur-sm hover:border-zinc-700/60 hover:bg-zinc-900/60 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-zinc-800/80 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="font-bold text-zinc-200 mb-2">{title}</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/methodology">
              <Button variant="outline" className="border-primary/30 hover:bg-primary/10">
                Read our full methodology
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
