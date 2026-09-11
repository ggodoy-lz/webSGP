import type { Metadata } from "next";

/**
 * Los paneles no deben aparecer en buscadores. Sin esto, `/admin/noticias` y
 * las demás rutas de administración son indexables como cualquier otra página.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
