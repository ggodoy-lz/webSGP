import { NextRequest } from "next/server";
import { excedeEnvios, FALTAN_CAMPOS, responderFormulario } from "@/lib/formulario";
import { campo, emailValido } from "@/lib/validacion";

const guaranies = (valor: unknown): string => {
  const n = Number(valor);
  return Number.isFinite(n) && n > 0 ? `Gs. ${n.toLocaleString("es-PY")}` : "";
};

export async function POST(req: NextRequest) {
  const demasiados = excedeEnvios(req);
  if (demasiados) return demasiados;

  const datos = await req.json().catch(() => null);
  if (!datos) return FALTAN_CAMPOS;

  const tipoNegocio = campo(datos.tipoNegocio, 60);
  const nombre = campo(datos.nombre, 120);
  const email = campo(datos.email, 254);
  const empresa = campo(datos.empresa, 160);
  const telefono = campo(datos.telefono, 60);
  const mensaje = campo(datos.mensaje, 5000);
  const aforo = campo(datos.aforo, 20) || String(datos.aforo ?? "");
  const superficie = campo(datos.superficie, 20) || String(datos.superficie ?? "");

  if (!tipoNegocio || !nombre || !emailValido(email)) return FALTAN_CAMPOS;

  return responderFormulario(
    "presupuesto",
    {
      asunto: `Solicitud de presupuesto: ${empresa || nombre}`,
      responderA: email,
      datos: [
        ["Tipo de negocio", tipoNegocio],
        ["Aforo", aforo],
        ["Superficie (m²)", superficie],
        // Es la estimación que vio en pantalla, no un presupuesto emitido.
        ["Estimación mostrada en la web", guaranies(datos.estimado)],
        ["Nombre", nombre],
        ["Empresa", empresa],
        ["Email", email],
        ["Teléfono", telefono],
        ["Mensaje", mensaje],
      ],
    },
    { tipoNegocio, aforo, superficie, nombre, empresa, email, telefono, mensaje, estimado: datos.estimado },
  );
}
