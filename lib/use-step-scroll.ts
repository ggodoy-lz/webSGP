"use client";

import { useEffect, useRef } from "react";

/**
 * Devuelve un ref para el contenedor de una calculadora. Cuando cambia el paso,
 * si el tope del contenedor quedó por encima del viewport (el usuario estaba
 * scrolleado hacia abajo), sube hasta él. Si el tope ya se ve, no hace nada:
 * mover la página cuando no hace falta es más molesto que útil.
 */
export function useStepScroll(paso: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  const primeraCarga = useRef(true);

  useEffect(() => {
    if (primeraCarga.current) {
      primeraCarga.current = false;
      return;
    }
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.top >= 0) return;

    // 80px de aire para no pegar el contenido al header fijo.
    window.scrollTo({ top: rect.top + window.scrollY - 80, behavior: "smooth" });
  }, [paso]);

  return ref;
}
