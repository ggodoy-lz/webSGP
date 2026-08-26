"use client";

/* eslint-disable @next/next/no-img-element --
   Las piezas de premiación ya vienen optimizadas (WebP, 512 px, ~30 KB
   cada una) y se muestran a tamaño fijo, así que next/image no aporta
   nada y evitarlo ahorra el servicio de optimización de imágenes. */

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

export default function AwardsPreview() {
  const t = useTranslations("awardsPreview");
  const locale = useLocale();

  const panels = [
    {
      title: t("propya"),
      label: "Premios",
      body: "Los premios de la industria fonografica paraguaya.",
      href: "https://www.propyawards.com",
      external: true,
      bg: "#fe3fb6",
      accent: "#ffffff",
      art: "/img/premios/arasunu.webp",
    },
    {
      title: t("streaming"),
      label: "Galardones SGP",
      body: "Reconocimientos por hitos de reproduccion y alcance de fonogramas.",
      href: `/${locale}/galardones`,
      external: false,
      bg: "#4666a6",
      accent: "#f2b33d",
      art: "/img/premios/disco-oro.webp",
    },
  ];

  return (
    <section className="bg-[#212226] py-20 lg:py-24">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        <div className="mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f2b33d] mb-4">
            {t("subtitle")}
          </p>
          <h2 className="font-display font-black text-white text-4xl lg:text-6xl leading-none">
            {t("title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {panels.map((panel, i) => {
            const content = (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative min-h-[360px] overflow-hidden p-8 lg:p-10"
                style={{ backgroundColor: panel.bg }}
              >
                {/* La pieza va entera dentro del panel. Antes sangraba fuera y
                    `overflow-hidden` la cortaba: el trofeo quedaba sin base y
                    el disco con la etiqueta partida, que se leía como un error
                    de maquetado y no como un recorte buscado.

                    En desktop va centrada contra el borde derecho, donde hay
                    lugar de sobra. En mobile el panel es angosto y ahí se
                    cruzaría con el texto, así que baja a la esquina inferior
                    derecha —el enlace queda a la izquierda— y achica. */}
                <img
                  src={panel.art}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="pointer-events-none absolute bottom-5 right-4 h-28 w-28 object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105 lg:bottom-auto lg:right-8 lg:top-1/2 lg:h-52 lg:w-52 lg:-translate-y-1/2"
                />
                <div className="relative z-10 flex min-h-[280px] flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/65 mb-6">
                      {panel.label}
                    </p>
                    <h3 className="font-display font-black text-white text-4xl lg:text-5xl leading-none mb-5">
                      {panel.title}
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed max-w-[15rem] lg:max-w-xs">
                      {panel.body}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest text-white">
                    {t("cta")}
                    <span
                      className="h-px w-8 transition-all group-hover:w-12"
                      style={{ backgroundColor: panel.accent }}
                    />
                  </span>
                </div>
              </motion.div>
            );

            return panel.external ? (
              <a key={panel.title} href={panel.href} target="_blank" rel="noopener noreferrer">
                {content}
              </a>
            ) : (
              <Link key={panel.title} href={panel.href}>
                {content}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
