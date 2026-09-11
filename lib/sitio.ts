/**
 * Dirección pública del sitio.
 *
 * La necesitan el sitemap, el robots.txt y las etiquetas para compartir en
 * redes, que exigen URL absolutas: con rutas relativas, al compartir el enlace
 * no se ve la imagen ni el título.
 *
 * El dominio definitivo todavía no está confirmado con SGP. Mientras tanto se
 * toma `NEXT_PUBLIC_SITIO` si está definida, y si no la que Vercel asigna al
 * despliegue, que siempre existe en producción.
 */
function resolver(): string {
  const propia = process.env.NEXT_PUBLIC_SITIO;
  if (propia) return propia.replace(/\/+$/, "");

  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export const SITIO = resolver();
