"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import Button from "./Button";

type FormData = {
  tipoNegocio: string;
  aforo: number;
  superficie: number;
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  mensaje: string;
};

const tarifas: Record<string, number> = {
  radio: 1500000, tv: 3000000, bar: 800000, comercio: 500000,
  hotel: 2000000, gimnasio: 600000, evento: 1200000, digital: 2500000, otro: 700000,
};

function calcular(data: Partial<FormData>): number | null {
  if (!data.tipoNegocio) return null;
  const base = tarifas[data.tipoNegocio] ?? 700000;
  const af = data.aforo ? Math.log10(Math.max(data.aforo, 10)) / 2 : 1;
  const sup = data.superficie ? Math.log10(Math.max(data.superficie, 20)) / 2.5 : 1;
  return Math.round(base * af * sup);
}

const fmt = (n: number) => new Intl.NumberFormat("es-PY", { style: "currency", currency: "PYG", minimumFractionDigits: 0 }).format(n);

type Status = "idle" | "sending" | "success" | "error";

const fieldBase = (err?: boolean) => `w-full bg-transparent border-0 border-b px-0 py-3 text-sm outline-none transition-colors placeholder:text-[#212226]/25 ${err ? "border-[#f0552f]" : "border-[#212226]/20 focus:border-[#212226]"}`;

export default function LicenseCalculator() {
  const t = useTranslations("licencias.calculator");
  const [status, setStatus] = useState<Status>("idle");
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();

  const tipo = watch("tipoNegocio");
  const aforo = watch("aforo");
  const superficie = watch("superficie");
  const estimado = calcular({ tipoNegocio: tipo, aforo, superficie });

  const onSubmit = async (data: FormData) => {
    setStatus("sending");
    try {
      const res = await fetch("/api/presupuesto", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, estimado }) });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch { setStatus("error"); }
  };

  const tipos = ["radio","tv","bar","comercio","hotel","gimnasio","evento","digital","otro"] as const;

  return (
    <div className="bg-[#feffff] border-t-4 border-[#212226]">
      {/* Header */}
      <div className="px-8 lg:px-12 py-8 border-b border-[#212226]/10">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-1">Calculadora</p>
        <h3 className="font-display font-black text-[#212226] text-3xl">{t("title")}</h3>
        <p className="text-sm text-[#212226]/40 mt-1">{t("subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-8 lg:px-12 py-10 space-y-10">
        {/* Step 1 */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/40 mb-6">01 — Tipo de uso</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/50 mb-2">{t("fields.tipoNegocio")}</label>
              <select {...register("tipoNegocio", { required: true })} className={`${fieldBase(!!errors.tipoNegocio)} cursor-pointer`}>
                <option value="">{t("fields.tipoNegocioPlaceholder")}</option>
                {tipos.map(tp => <option key={tp} value={tp}>{t(`tiposNegocio.${tp}`)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/50 mb-2">{t("fields.aforo")}</label>
              <input type="number" {...register("aforo", { min: 1 })} placeholder={t("fields.aforoPlaceholder")} className={fieldBase()} />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/50 mb-2">{t("fields.superficie")}</label>
              <input type="number" {...register("superficie", { min: 1 })} placeholder={t("fields.superficiePlaceholder")} className={fieldBase()} />
            </div>
          </div>
        </div>

        {/* Estimado */}
        <AnimatePresence>
          {estimado && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="bg-[#f2e2c4] px-8 py-6 flex items-center justify-between border-l-4 border-[#f0552f]">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/40 mb-1">{t("estimado")}</p>
                  <p className="font-display font-black text-[#f0552f] text-4xl">{fmt(estimado)}</p>
                </div>
                <div className="text-xs text-[#212226]/30 text-right font-medium">por mes / estimado</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2 */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#212226]/40 mb-6">02 — Tus datos</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {([["nombre",true],["empresa",false],["email",true],["telefono",false]] as const).map(([f, req]) => (
              <div key={f}>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/50 mb-2">{t(`fields.${f}`)}</label>
                <input {...register(f, { required: req, ...(f==="email"?{pattern:/^\S+@\S+$/i}:{}) })} placeholder={t(`fields.${f}Placeholder`)} className={fieldBase(!!errors[f])} />
              </div>
            ))}
          </div>
          <div className="mt-6">
            <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/50 mb-2">{t("fields.mensaje")}</label>
            <textarea {...register("mensaje")} rows={3} placeholder={t("fields.mensajePlaceholder")} className={`${fieldBase()} resize-none`} />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Button type="submit" variant="primary" size="lg" disabled={status==="sending"||status==="success"} className="disabled:opacity-40">
            {status==="sending" ? t("sending") : t("submit")}
          </Button>
          <AnimatePresence>
            {status==="success" && <motion.p initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-2 text-sm text-green-700"><CheckCircleIcon className="w-4 h-4" />{t("success")}</motion.p>}
            {status==="error" && <motion.p initial={{opacity:0}} animate={{opacity:1}} className="flex items-center gap-2 text-sm text-[#f0552f]"><ExclamationCircleIcon className="w-4 h-4" />{t("error")}</motion.p>}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
}
