"use client";

import { useState, useEffect } from "react";

interface Config {
  uda: number;
  incidencias: { secundaria: number; necesaria: number; indispensable: number };
  categoriaDefault: number;
  medios: { parlante: number; televisor: number };
  descuentoAforo: number;
}

const DEFAULT_CONFIG: Config = {
  uda: 39200,
  incidencias: { secundaria: 0.33, necesaria: 0.60, indispensable: 1.00 },
  categoriaDefault: 0.24,
  medios: { parlante: 0.15, televisor: 0.12 },
  descuentoAforo: 0.60,
};

export default function AdminTarifarioPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const fetchConfig = async (pw: string) => {
    try {
      const res = await fetch("/api/admin/tarifario", {
        headers: { "x-admin-password": pw },
      });
      if (res.ok) {
        const data = await res.json();
        setConfig({ ...DEFAULT_CONFIG, ...data });
        setAuthenticated(true);
      } else {
        alert("Contraseña incorrecta");
      }
    } catch {
      alert("Error de conexión");
    }
  };

  const handleSave = async () => {
    setStatus("saving");
    try {
      const res = await fetch("/api/admin/tarifario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(config),
      });
      setStatus(res.ok ? "saved" : "error");
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    if (status === "saved") {
      const t = setTimeout(() => setStatus("idle"), 2000);
      return () => clearTimeout(t);
    }
  }, [status]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#212226] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
          <h1 className="font-display font-black text-xl mb-4">Admin Tarifario</h1>
          <p className="text-sm text-gray-500 mb-4">
            Ingresá la contraseña de administrador para continuar.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchConfig(password)}
            placeholder="Contraseña"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm mb-4 outline-none focus:border-[#f0552f]"
          />
          <button
            onClick={() => fetchConfig(password)}
            className="w-full bg-[#212226] hover:bg-[#f0552f] text-white text-xs font-black uppercase tracking-wider py-3 rounded-lg transition-colors"
          >
            Acceder
          </button>
        </div>
      </div>
    );
  }

  const labelCls = "block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1";
  const inputCls = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#f0552f]";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#212226] py-6 px-8">
        <h1 className="font-display font-black text-white text-2xl">
          Admin — Configuración Tarifario
        </h1>
        <p className="text-white/40 text-sm mt-1">
          Modificá los valores del motor de cálculo de tarifas SGP.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        {/* UDA */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="font-display font-black text-lg mb-4">
            Unidad de Derecho de Autor (UDA)
          </h2>
          <label className={labelCls}>Valor en Gs.</label>
          <input
            type="number"
            value={config.uda}
            onChange={(e) =>
              setConfig({ ...config, uda: Number(e.target.value) })
            }
            className={inputCls}
          />
        </section>

        {/* Incidencias */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="font-display font-black text-lg mb-4">
            Porcentajes de Incidencia Musical
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(["secundaria", "necesaria", "indispensable"] as const).map(
              (key) => (
                <div key={key}>
                  <label className={labelCls}>{key} (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={config.incidencias[key]}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        incidencias: {
                          ...config.incidencias,
                          [key]: Number(e.target.value),
                        },
                      })
                    }
                    className={inputCls}
                  />
                </div>
              ),
            )}
          </div>
        </section>

        {/* Categoría */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="font-display font-black text-lg mb-4">
            Categoría por Defecto
          </h2>
          <label className={labelCls}>Índice</label>
          <input
            type="number"
            step="0.01"
            value={config.categoriaDefault}
            onChange={(e) =>
              setConfig({
                ...config,
                categoriaDefault: Number(e.target.value),
              })
            }
            className={inputCls}
          />
        </section>

        {/* Medios de uso */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="font-display font-black text-lg mb-4">
            Medios de Uso
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Parlante</label>
              <input
                type="number"
                step="0.01"
                value={config.medios.parlante}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    medios: {
                      ...config.medios,
                      parlante: Number(e.target.value),
                    },
                  })
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Televisor / Pantalla</label>
              <input
                type="number"
                step="0.01"
                value={config.medios.televisor}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    medios: {
                      ...config.medios,
                      televisor: Number(e.target.value),
                    },
                  })
                }
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* Descuento Aforo */}
        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="font-display font-black text-lg mb-4">
            Descuento de Aforo
          </h2>
          <label className={labelCls}>Porcentaje (ej: 0.60 = 60%)</label>
          <input
            type="number"
            step="0.01"
            value={config.descuentoAforo}
            onChange={(e) =>
              setConfig({
                ...config,
                descuentoAforo: Number(e.target.value),
              })
            }
            className={inputCls}
          />
        </section>

        {/* Save button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={status === "saving"}
            className="bg-[#212226] hover:bg-[#f0552f] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider px-8 py-4 rounded-lg transition-colors"
          >
            {status === "saving" ? "Guardando..." : "Guardar cambios"}
          </button>
          {status === "saved" && (
            <span className="text-sm text-green-600 font-medium">
              Configuración guardada correctamente
            </span>
          )}
          {status === "error" && (
            <span className="text-sm text-red-600 font-medium">
              Error al guardar
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
