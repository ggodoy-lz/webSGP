import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import TarifarioHub from "@/components/ui/TarifarioHub";
import { getCotizacionUSD } from "@/lib/bcp-cotizacion";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("tarifarioPage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function TarifarioPage() {
  const cotizacion = await getCotizacionUSD();

  return (
    <section className="min-h-[calc(100vh-68px)] bg-[#f2e2c4] pb-8 pt-20 lg:pb-10 lg:pt-20">
      <div className="mx-auto max-w-screen-xl px-6 lg:px-10">
        <Suspense fallback={null}>
          <TarifarioHub cotizacion={cotizacion} />
        </Suspense>
      </div>
    </section>
  );
}
