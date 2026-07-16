import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import WhyVrajaspice from "@/components/home/WhyVrajaspice";
import ComparisonTable from "@/components/home/ComparisonTable";
import Testimonials from "@/components/home/Testimonials";
import OurStory from "@/components/home/OurStory";
import NewsletterSignup from "@/components/home/NewsletterSignup";
import PoliciesPreview from "@/components/home/PoliciesPreview";
import FinalCTA from "@/components/home/FinalCTA";
import { CATEGORIES, CATEGORY_METADATA } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Vrajaspice — Premium No Onion No Garlic Spices | Spice With Soul",
  description:
    "Shop premium NONG spice blends for satvik cooking. Kitchen King Masala, Garam Masala, Biryani Masala and more. No Onion. No Garlic. No Compromise. Made in India.",
};

/* ─── Brush stroke SVG ───────────────────────────────────────────────── */
function BrushStroke() {
  return (
    <svg
      viewBox="0 0 320 18"
      className="w-full max-w-xs mx-auto mt-2 mb-0"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 13.5C25.5 12 50.5 7.5 77 6C103.5 4.5 131 5.5 158 5C185 4.5 212.5 2 239.5 2.5C266.5 3 293 6.5 317 8.5"
        stroke="#E8721C"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhyVrajaspice />

      {/* Categories Grid Section */}
      <section className="py-16 md:py-24 bg-[#F5EDD8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-[#E8721C] text-sm font-semibold tracking-[0.2em] uppercase mb-3">
              Our Collections
            </p>
            <h2 className="font-serif font-bold text-[#2C1810] text-3xl md:text-4xl mb-4">
              Shop by Category
            </h2>
            <p className="text-[#6B4E37] max-w-xl mx-auto text-base">
              Discover our hand-crafted, small-batch spice blends made with 100% pure, satvik ingredients. No onion, no garlic.
            </p>
            <BrushStroke />
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {CATEGORIES.filter((c) => c !== "All").map((cat) => {
              const meta = CATEGORY_METADATA[cat] || { image: "/placeholder.png", desc: "" };
              return (
                <Link
                  key={cat}
                  href={`/shop?category=${encodeURIComponent(cat)}`}
                  className="group relative h-64 rounded-2xl overflow-hidden border border-[#EDE0C4] hover:border-[#E8721C]/60 hover:shadow-[0_8px_30px_rgba(232,114,28,0.15)] transition-all duration-300 text-left flex flex-col justify-end w-full cursor-pointer"
                >
                  {/* Background image */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={meta.image}
                      alt={cat}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
                  </div>

                  {/* Text content */}
                  <div className="relative z-10 p-4 flex flex-col justify-end h-full w-full">
                    <h3 className="font-serif font-bold text-white text-sm md:text-base mb-1 leading-tight group-hover:text-[#D4A017] transition-colors">
                      {cat}
                    </h3>
                    <p className="text-white/80 text-[10px] md:text-xs line-clamp-2 leading-relaxed mb-3">
                      {meta.desc}
                    </p>
                    <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#D4A017] group-hover:text-[#F5EDD8] transition-colors bg-white/10 group-hover:bg-[#8B1A1A] px-2 py-1 rounded-md border border-[#D4A017]/30 group-hover:border-[#8B1A1A] w-fit">
                      See All
                      <span className="inline-block transform group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#2C1810] text-[#F5EDD8] px-8 py-4 rounded-xl font-bold text-base hover:bg-[#8B1A1A] transition-colors duration-300"
            >
              View All Spices →
            </Link>
          </div>
        </div>
      </section>

      <ComparisonTable />
      <Testimonials />
      <OurStory />
      <NewsletterSignup />
      <PoliciesPreview />
      <FinalCTA />
    </>
  );
}
