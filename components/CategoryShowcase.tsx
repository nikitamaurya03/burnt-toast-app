import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    title: "Main Character Era",
    description: "Campus fits, coffee runs, weekend hangs — outfits that go hard for every moment life throws at you.",
    bg: "bg-gray-900",
    text: "text-gray-300",
  },
  {
    title: "Understood The Assignment",
    description: "Basics that hit different. Details that elevate the whole fit. It's giving effortlessly elevated, no cap.",
    bg: "bg-gray-800",
    text: "text-gray-300",
  },
  {
    title: "Bussin On A Budget",
    description: "₹490–₹1,490 and you're still serving looks. Great value is Burnt Toast's whole personality, fr fr.",
    bg: "bg-gray-700",
    text: "text-gray-300",
  },
];

export default function CategoryShowcase() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-12">
          <p className="text-gray-400 text-xs font-medium tracking-widest uppercase mb-2">
            Style Universes
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900">
            Pick Your Vibe
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto text-sm">
            Drop your occasion to Toastie and watch it serve the perfect look in seconds. Lowkey life-changing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {categories.map(({ title, description, bg, text }) => (
            <div
              key={title}
              className={`group relative rounded-2xl ${bg} p-8 overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
            >
              <p className={`text-xs font-semibold tracking-widest uppercase mb-3 ${text} opacity-60`}>
                Collection
              </p>
              <h3 className="font-display text-2xl font-bold text-white mb-3 leading-tight">
                {title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {description}
              </p>
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 text-sm font-medium text-white hover:gap-3 transition-all duration-200"
              >
                Explore with AI
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-8 sm:p-12 text-center">
          <p className="text-gray-400 text-xs font-medium tracking-widest uppercase mb-3">
            Your Personal Stylist
          </p>
          <h3 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Lowkey don&apos;t know where to start?
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-8 text-sm">
            Drop your occasion, mood, or vibe to Toastie — it builds a full look that slaps in seconds. No cap, bestie.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gray-900 text-white font-semibold text-sm tracking-wider uppercase hover:bg-black hover:scale-105 transition-all duration-300 shadow-md"
          >
            Let Toastie Cook
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
