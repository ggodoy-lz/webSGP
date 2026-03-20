import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("galardones");
  return { title: t("hero.title"), description: t("hero.subtitle") };
}

const artists = [
  { artista: "Beto Ayala", obra: "Alma Guaraní", nivel: "Diamante", streams: "1.2M", color: "#4666a6", icon: "💎" },
  { artista: "Mara Flores", obra: "Corazón Paraguay", nivel: "Platino", streams: "650K", color: "#8a847a", icon: "🥈" },
  { artista: "Grupo Cañaveral", obra: "Fiesta Paraguaya", nivel: "Platino", streams: "590K", color: "#8a847a", icon: "🥈" },
  { artista: "Pedro Giménez", obra: "Madrugada", nivel: "Oro", streams: "210K", color: "#f2b33d", icon: "🥇" },
  { artista: "Luna Nueva", obra: "Entre Ríos", nivel: "Oro", streams: "180K", color: "#f2b33d", icon: "🥇" },
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
              <h2 className="font-display font-black text-[#212226] text-4xl lg:text-5xl mb-4">{t("streaming.title")}</h2>
              <p className="text-[#212226]/55 text-sm leading-relaxed max-w-xl">{t("streaming.description")}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 lg:mt-0 mt-4 self-start">
              {[{icon:"🥇",lbl:t("streaming.niveles.oro"),c:"#f2b33d",r:"100K+"},
                {icon:"🥈",lbl:t("streaming.niveles.platino"),c:"#d5cfc6",r:"500K+"},
                {icon:"💎",lbl:t("streaming.niveles.diamante"),c:"#4666a6",r:"1M+"}].map(lvl => (
                <div key={lvl.lbl} className="text-center p-5 bg-[#f2e2c4] border-t-2" style={{borderColor:lvl.c}}>
                  <div className="text-3xl mb-2">{lvl.icon}</div>
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
                <span className="font-black text-sm" style={{color:a.color}}>{a.icon} {a.nivel}</span>
                <span className="text-right text-[#212226]/40 text-sm font-mono">{a.streams}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Propya */}
      <section className="bg-[#f2b33d] py-20">
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/50 mb-4">Premios</p>
              <div className="w-10 h-[3px] bg-[#212226] mb-6" />
              <h2 className="font-display font-black text-[#212226] text-4xl lg:text-5xl mb-4">{t("propya.title")}</h2>
              <p className="text-[#212226]/60 text-sm leading-relaxed mb-8">{t("propya.description")}</p>
              <div className="bg-[#212226] p-7 flex items-center justify-between">
                <div>
                  <div className="font-display font-black text-[#f2b33d] text-2xl">I Propya Awards</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Asunción · 2025</div>
                </div>
                <span className="text-5xl">🏆</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/50 mb-4">{t("propya.categorias")}</p>
              <div className="border-t border-[#212226]/20">
                {propyaCats.map((cat, i) => (
                  <div key={cat} className="flex items-center gap-5 py-4 border-b border-[#212226]/10 hover:pl-3 transition-all">
                    <span className="font-display font-black text-[#212226]/30 text-xs w-5 shrink-0">{String(i+1).padStart(2,"0")}</span>
                    <span className="text-[#212226]/70 text-sm">{cat}</span>
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
