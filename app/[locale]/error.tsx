"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

/**
 * Pantalla para un error no controlado. Sin esto, Next muestra la suya, que no
 * se parece al sitio y en producción no dice nada útil.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errorInesperado");

  useEffect(() => {
    // Queda en los logs del servidor para poder rastrearlo por su digest.
    console.error("[error no controlado]", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] bg-[#feffff] flex items-center">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 py-20">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-4">Error</p>
        <div className="w-10 h-[3px] bg-[#f0552f] mb-6" />
        <h1 className="font-display font-black text-[#212226] text-4xl lg:text-5xl mb-4">
          {t("titulo")}
        </h1>
        <p className="text-sm text-[#212226]/55 leading-relaxed max-w-md mb-8">{t("texto")}</p>
        <button
          type="button"
          onClick={reset}
          className="bg-[#212226] hover:bg-[#f0552f] text-white text-xs font-black uppercase tracking-[0.2em] px-8 py-4 transition-colors duration-300"
        >
          {t("reintentar")}
        </button>
        {error.digest && (
          <p className="text-[10px] text-[#212226]/30 mt-6">Referencia: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
