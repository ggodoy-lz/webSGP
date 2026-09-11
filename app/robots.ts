import type { MetadataRoute } from "next";
import { SITIO } from "@/lib/sitio";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Los paneles de carga y las rutas internas no aportan nada en buscadores.
      disallow: ["/es/admin/", "/en/admin/", "/api/"],
    },
    sitemap: `${SITIO}/sitemap.xml`,
  };
}
