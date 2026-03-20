"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import Button from "./Button";

type FormData = { productora: string; nombreObra: string; artista: string; anio: string; cantidad: number; nombre: string; email: string; telefono: string; };
type Status = "idle"|"sending"|"success"|"error";

const fieldBase = (err?: boolean) => `w-full bg-transparent border-0 border-b px-0 py-3 text-sm outline-none transition-colors placeholder:text-[#212226]/25 ${err ? "border-[#f0552f]" : "border-[#212226]/20 focus:border-[#212226]"}`;

const fields = [["productora","text",true],["nombreObra","text",true],["artista","text",false],["anio","text",false],["cantidad","number",false],["nombre","text",true],["email","email",true],["telefono","text",false]] as const;

export default function ISRCForm() {
  const t = useTranslations("isrc.form");
  const [status, setStatus] = useState<Status>("idle");
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setStatus("sending");
    try {
      const res = await fetch("/api/isrc", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch { setStatus("error"); }
  };

  return (
    <div className="bg-[#feffff] border-t-4 border-[#212226] p-8 lg:p-10">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0552f] mb-1">Solicitud</p>
      <h3 className="font-display font-black text-[#212226] text-2xl mb-8">{t("title")}</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {fields.map(([field, type, required]) => (
            <div key={field}>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/50 mb-2">{t(`fields.${field}`)}</label>
              <input type={type} {...register(field, { required, ...(field==="email"?{pattern:/^\S+@\S+$/i}:{}) })} placeholder={t(`fields.${field}Placeholder`)} className={fieldBase(!!errors[field as keyof FormData])} />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Button type="submit" variant="primary" disabled={status==="sending"||status==="success"} className="disabled:opacity-40">
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
