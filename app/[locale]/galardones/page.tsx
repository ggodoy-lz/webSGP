import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("galardones");
  return { title: t("hero.title"), description: t("hero.subtitle") };
}

function DiscoOro({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="30" fill="#f2b33d" stroke="#d4982a" strokeWidth="2"/>
      <circle cx="32" cy="32" r="12" fill="#d4982a"/>
      <circle cx="32" cy="32" r="4" fill="#f2b33d"/>
      <circle cx="32" cy="32" r="28" fill="none" stroke="#d4982a" strokeWidth="0.5" opacity="0.5"/>
    </svg>
  );
}

function DiscoPlatino({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="30" fill="#d5cfc6" stroke="#b5ad9f" strokeWidth="2"/>
      <circle cx="32" cy="32" r="12" fill="#b5ad9f"/>
      <circle cx="32" cy="32" r="4" fill="#d5cfc6"/>
      <circle cx="32" cy="32" r="28" fill="none" stroke="#b5ad9f" strokeWidth="0.5" opacity="0.5"/>
    </svg>
  );
}

function DiscoDiamante({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="30" fill="#4666a6" stroke="#374f82" strokeWidth="2"/>
      <circle cx="32" cy="32" r="12" fill="#374f82"/>
      <circle cx="32" cy="32" r="4" fill="#4666a6"/>
      <circle cx="32" cy="32" r="28" fill="none" stroke="#374f82" strokeWidth="0.5" opacity="0.5"/>
      <path d="M32 8 L38 20 L32 16 L26 20 Z" fill="#8ba3d0" opacity="0.6"/>
    </svg>
  );
}

const artists = [
  { artista: "Beto Ayala", obra: "Alma Guaraní", nivel: "Diamante", streams: "1.2M", color: "#4666a6", Icon: DiscoDiamante },
  { artista: "Mara Flores", obra: "Corazón Paraguay", nivel: "Platino", streams: "650K", color: "#8a847a", Icon: DiscoPlatino },
  { artista: "Grupo Cañaveral", obra: "Fiesta Paraguaya", nivel: "Platino", streams: "590K", color: "#8a847a", Icon: DiscoPlatino },
  { artista: "Pedro Giménez", obra: "Madrugada", nivel: "Oro", streams: "210K", color: "#f2b33d", Icon: DiscoOro },
  { artista: "Luna Nueva", obra: "Entre Ríos", nivel: "Oro", streams: "180K", color: "#f2b33d", Icon: DiscoOro },
];

const propyaCats = ["Producción del Año","Artista Revelación","Álbum del Año","Canción del Año","Mejor Producción Folclórica","Mejor Producción Pop","Mejor Producción Urbana","Trayectoria"];

export default function GalardonesPage() {
  const t = useTranslations("galardones");

  return (
    <>
      <PageHero title={t("hero.title")} subtitle={t("hero.subtitle")} variant="gold" tag="SGP" />

      {/* Streaming levels */}
      <section className="bg-[#feffff] py-20">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
            <div className="lg:col-span-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-4">Reconocimientos</p>
              <div className="w-10 h-[3px] bg-[#f0552f] mb-6" />
              <h2 className="font-display font-black text-[#212226] text-3xl lg:text-4xl mb-4">{t("streaming.title")}</h2>
              <p className="text-[#212226]/55 text-sm leading-relaxed max-w-xl">{t("streaming.description")}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 lg:mt-0 mt-4 self-start">
              {[{Icon:DiscoOro,lbl:t("streaming.niveles.oro"),c:"#f2b33d",r:"100K+"},
                {Icon:DiscoPlatino,lbl:t("streaming.niveles.platino"),c:"#d5cfc6",r:"500K+"},
                {Icon:DiscoDiamante,lbl:t("streaming.niveles.diamante"),c:"#4666a6",r:"1M+"}].map(lvl => (
                <div key={lvl.lbl} className="text-center p-5 bg-[#f2e2c4] border-t-2" style={{borderColor:lvl.c}}>
                  <div className="flex justify-center mb-2"><lvl.Icon className="w-10 h-10" /></div>
                  <div className="font-display font-black text-[#212226] text-sm">{lvl.lbl}</div>
                  <div className="text-[10px] text-[#212226]/40 mt-0.5">{lvl.r}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Artists table */}
          <div className="border-t-2 border-[#212226]">
            <div className="grid grid-cols-4 bg-[#212226] text-white/40 text-[10px] font-black uppercase tracking-widest px-6 py-3">
              <span>Artista</span><span>Obra</span><span>Nivel</span><span className="text-right">Streams</span>
            </div>
            {artists.map((a, i) => (
              <div key={i} className="grid grid-cols-4 items-center px-6 py-5 border-b border-[#212226]/10 hover:bg-[#f2e2c4] transition-colors group">
                <span className="font-display font-black text-[#212226] text-lg">{a.artista}</span>
                <span className="text-[#212226]/55 text-sm">{a.obra}</span>
                <span className="font-black text-sm flex items-center gap-2" style={{color:a.color}}>
                  <a.Icon className="w-5 h-5" /> {a.nivel}
                </span>
                <span className="text-right text-[#212226]/40 text-sm font-mono">{a.streams}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Propya — fucsia */}
      <section className="bg-[#fe3fb6] py-20">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-4">Premios</p>
              <div className="w-10 h-[3px] bg-white mb-6" />
              <h2 className="font-display font-black text-white text-3xl lg:text-4xl mb-4">{t("propya.title")}</h2>
              <p className="text-white/70 text-sm leading-relaxed mb-8">{t("propya.description")}</p>
              <a
                href="https://www.propyawards.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-[#212226] hover:bg-[#2c2f36] p-7 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display font-black text-[#fe3fb6] text-2xl">I Propya Awards</div>
                    <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Asunción · 2025</div>
                  </div>
                  <svg className="w-10 h-10 text-[#fe3fb6] group-hover:scale-110 transition-transform" viewBox="0 0 64 64" fill="none">
                    <path d="M32 6L38 22H50L40 32L44 48L32 38L20 48L24 32L14 22H26Z" fill="currentColor"/>
                    <path d="M32 52V56M24 54L22 58M40 54L42 58" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </a>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-4">{t("propya.categorias")}</p>
              <div className="border-t border-white/20">
                {propyaCats.map((cat, i) => (
                  <div key={cat} className="flex items-center gap-5 py-4 border-b border-white/10 hover:pl-3 transition-all">
                    <span className="font-display font-black text-white/30 text-xs w-5 shrink-0">{String(i+1).padStart(2,"0")}</span>
                    <span className="text-white/80 text-sm">{cat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
