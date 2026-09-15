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

/** Consultas generales: van a operaciones@. */
export async function POST(req: NextRequest) {
  const demasiados = excedeEnvios(req);
  if (demasiados) return demasiados;

  const datos = await req.json().catch(() => null);
  if (!datos || typeof datos !== "object") return faltanCampos();

  const nombre = campo(datos.nombre, 120);
  const email = campo(datos.email, 254);
  const asunto = campo(datos.asunto, 200);
  const mensaje = campo(datos.mensaje, 5000);
  const empresa = campo(datos.empresa, 160);
  const telefono = campo(datos.telefono, 60);

  if (!nombre || !asunto || !mensaje || !emailValido(email)) return faltanCampos();
  if (!aceptoTerminos(datos)) return noAceptoTerminos();

  return responderFormulario(
    "contacto",
    {
      casilla: "consultas",
      asunto: `Consulta desde la web: ${asunto}`,
      responderA: email,
      datos: [
        ["Nombre", nombre],
        ["Empresa", empresa],
        ["Email", email],
        ["Teléfono", telefono],
        ["Asunto", asunto],
        ["Mensaje", mensaje],
        constanciaDeAceptacion(),
      ],
    },
    { nombre, email, asunto, mensaje, empresa, telefono },
  );
}
