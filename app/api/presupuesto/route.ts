import { NextRequest } from "next/server";
import {
  aceptoTerminos,
  constanciaDeAceptacion,
  excedeEnvios,
  faltanCampos,
  noAceptoTerminos,
  responderFormulario,
} from "@/lib/formulario";
import { campo, emailValido } from "@/lib/validacion";

const guaranies = (valor: unknown): string => {
  const n = Number(valor);
  return Number.isFinite(n) && n > 0 ? `Gs. ${n.toLocaleString("es-PY")}` : "";
};

/**
 * Solicitudes de licencia: van a licencias@.
 *
 * Hoy ninguna página la usa. El único componente que la llamaba tenía un
 * tarifario inventado y se eliminó; queda lista, con su casilla, para cuando
 * exista el formulario real de solicitud.
 */
export async function POST(req: NextRequest) {
  const demasiados = excedeEnvios(req);
  if (demasiados) return demasiados;

  const datos = await req.json().catch(() => null);
  if (!datos || typeof datos !== "object") return faltanCampos();

  const tipoNegocio = campo(datos.tipoNegocio, 60);
  const nombre = campo(datos.nombre, 120);
  const email = campo(datos.email, 254);
  const empresa = campo(datos.empresa, 160);
  const telefono = campo(datos.telefono, 60);
  const mensaje = campo(datos.mensaje, 5000);
  const aforo = campo(datos.aforo, 20) || String(datos.aforo ?? "");
  const superficie = campo(datos.superficie, 20) || String(datos.superficie ?? "");

  if (!tipoNegocio || !nombre || !emailValido(email)) return faltanCampos();
  if (!aceptoTerminos(datos)) return noAceptoTerminos();

  return responderFormulario(
    "licencia",
    {
      casilla: "licencias",
      asunto: `Solicitud de licencia: ${empresa || nombre}`,
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
        constanciaDeAceptacion(),
      ],
    },
    { tipoNegocio, aforo, superficie, nombre, empresa, email, telefono, mensaje, estimado: datos.estimado },
  );
}
