"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import Button from "./Button";

type FormData = { nombre: string; empresa: string; email: string; telefono: string; asunto: string; mensaje: string; };
type Status = "idle"|"sending"|"success"|"error";

const fieldBase = (err?: boolean) => `w-full bg-transparent border-0 border-b px-0 py-3 text-sm outline-none transition-colors placeholder:text-[#212226]/25 ${err ? "border-[#f0552f]" : "border-[#212226]/20 focus:border-[#212226]"}`;

export default function ContactForm() {
  const t = useTranslations("contacto.form");
  const [status, setStatus] = useState<Status>("idle");
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setStatus("sending");
    try {
      const res = await fetch("/api/contacto", { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error();
      setStatus("success");
      reset();
    } catch { setStatus("error"); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {([["nombre",true],["empresa",false],["email",true],["telefono",false]] as const).map(([f, req]) => (
          <div key={f}>
            <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/50 mb-2">{t(`fields.${f}`)}</label>
            <input type={f==="email"?"email":"text"} {...register(f, { required: req, ...(f==="email"?{pattern:/^\S+@\S+$/i}:{}) })} placeholder={t(`fields.${f}Placeholder`)} className={fieldBase(!!errors[f])} />
          </div>
        ))}
      </div>
      <div>
        <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/50 mb-2">{t("fields.asunto")}</label>
        <input {...register("asunto", { required: true })} placeholder={t("fields.asuntoPlaceholder")} className={fieldBase(!!errors.asunto)} />
      </div>
      <div>
        <label className="block text-[10px] font-black uppercase tracking-wider text-[#212226]/50 mb-2">{t("fields.mensaje")}</label>
        <textarea {...register("mensaje", { required: true })} rows={5} placeholder={t("fields.mensajePlaceholder")} className={`${fieldBase(!!errors.mensaje)} resize-none`} />
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
  );
}
