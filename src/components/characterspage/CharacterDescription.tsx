"use client";

interface CharacterDescriptionProps {
  name: string;
  description?: string | null;
}

export function CharacterDescription({ name, description }: CharacterDescriptionProps) {
  return (
    <section className="relative py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-1 max-w-15 bg-linear-to-r from-primary to-transparent" />
          <h2 className="text-xs font-bold text-primary uppercase tracking-[0.3em]">About</h2>
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">{name}</h3>
        <p className="text-lg md:text-xl leading-relaxed text-zinc-400 font-light max-w-3xl">
          {description || "No description available for this character yet."}
        </p>
        <div className="mt-8 flex items-center gap-3">
          <div className="w-12 h-1 bg-linear-to-r from-primary to-primary/50 rounded-full" />
          <div className="w-6 h-1 bg-primary/30 rounded-full" />
          <div className="w-3 h-1 bg-primary/20 rounded-full" />
        </div>
      </div>
    </section>
  );
}
