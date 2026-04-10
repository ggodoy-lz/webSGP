interface PageHeroProps {
  title: string;
  subtitle: string;
  tag?: string;
  variant?: "cream" | "dark" | "orange" | "blue" | "gold" | "fucsia";
}

const variants = {
  cream:  { bg: "bg-[#f2e2c4]",  title: "text-[#212226]", subtitle: "text-[#212226]/55", tag: "text-[#f0552f]", line: "bg-[#212226]" },
  dark:   { bg: "bg-[#212226]",  title: "text-white",      subtitle: "text-white/50",     tag: "text-[#f0552f]", line: "bg-[#f0552f]" },
  orange: { bg: "bg-[#f0552f]",  title: "text-white",      subtitle: "text-white/70",     tag: "text-white/60",  line: "bg-white" },
  blue:   { bg: "bg-[#4666a6]",  title: "text-white",      subtitle: "text-white/60",     tag: "text-white/60",  line: "bg-white" },
  gold:   { bg: "bg-[#f2b33d]",  title: "text-[#212226]",  subtitle: "text-[#212226]/55", tag: "text-[#212226]/60", line: "bg-[#212226]" },
  fucsia: { bg: "bg-[#fe3fb6]",  title: "text-white",      subtitle: "text-white/70",     tag: "text-white/60",  line: "bg-white" },
};

export default function PageHero({ title, subtitle, tag, variant = "cream" }: PageHeroProps) {
  const v = variants[variant];

  return (
    <section className={`${v.bg} pt-28 lg:pt-32 pb-12 px-4 sm:px-6 lg:px-10 relative overflow-hidden`}>
      {/* Background ghost letter */}
      <div
        className="absolute right-0 top-0 font-display font-black text-[25vw] leading-none select-none pointer-events-none overflow-hidden"
        style={{ color: "transparent", WebkitTextStroke: "1px rgba(0,0,0,0.04)" }}
        aria-hidden
      >
        {title.charAt(0)}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {tag && (
          <div className="flex items-center gap-3 mb-4">
            <div className={`h-px w-8 ${v.line}`} />
            <span className={`text-xs font-bold uppercase tracking-[0.2em] ${v.tag}`}>{tag}</span>
          </div>
        )}
        <div className={`w-12 h-1.5 ${v.line} mb-6`} />
        <h1
          className={`font-display font-black leading-none ${v.title} text-6xl lg:text-8xl`}
        >
          {title}
        </h1>
        <p className={`mt-5 text-base lg:text-lg max-w-2xl leading-relaxed ${v.subtitle}`}>
          {subtitle}
        </p>
      </div>
    </section>
  );
}
