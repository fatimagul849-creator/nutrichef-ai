import Link from "next/link";
import HomeChefBrowser from "@/components/home-chef-browser";
import { homeChefs } from "@/lib/home-chefs";

export const metadata = {
  title: "Home Chefs | NutriChef AI",
  description: "Browse prototype local home chefs and their Pakistani meal offerings.",
};

export default function HomeChefsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-stone-50/50 to-emerald-50/30 px-4 py-8 text-stone-800 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 sm:mb-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950">← Back to NutriChef AI</Link>
          <div className="mt-6 max-w-2xl">
            <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">NutriChef Home Chefs</div>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-emerald-950 sm:text-5xl">Find a home chef near you</h1>
            <p className="mt-3 text-base leading-relaxed text-stone-600 sm:text-lg">Browse sample local chefs, explore their everyday Pakistani meals, and prepare a chef choice for the next stage of NutriChef AI.</p>
          </div>
        </header>

        <HomeChefBrowser chefs={homeChefs} />
      </div>
    </main>
  );
}
