const features = [
  {
    title: "Track Anything",
    description:
      "Habits, workouts, learning hours, reading, applications, steps, calories, and more.",
  },
  {
    title: "Daily Accountability",
    description: "See exactly what got done today and what didn't.",
  },
  {
    title: "Understand Progress",
    description:
      "Weekly trends, monthly heatmaps, and completion insights.",
  },
] as const;

export function FeatureCards() {
  return (
    <section className="border-b border-stone-100 bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-xl border border-stone-200 bg-white p-8 transition-colors hover:border-stone-300 hover:shadow-sm"
            >
              <h2 className="text-lg font-semibold tracking-tight text-stone-900">
                {feature.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
