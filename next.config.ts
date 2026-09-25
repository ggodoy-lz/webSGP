import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/**
 * Cabeceras de seguridad para todas las respuestas. Vercel ya agrega HSTS.
 *
 * La política de contenido se limita a lo que no depende de cómo Next inserta
 * sus scripts: impedir que otro sitio muestre este dentro de un marco (para
 * engañar a alguien con clics sobre el panel), y bloquear `<base>` y plugins.
 */
const CABECERAS_DE_SEGURIDAD = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  },
];

const nextConfig: NextConfig = {
  // No anunciar el framework en cada respuesta.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: CABECERAS_DE_SEGURIDAD }];
  },
};

export default withNextIntl(nextConfig);
