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

/** Solicitudes de código ISRC: van a isrc@. */
export async function POST(req: NextRequest) {
  const demasiados = excedeEnvios(req);
  if (demasiados) return demasiados;

  const datos = await req.json().catch(() => null);
  if (!datos || typeof datos !== "object") return faltanCampos();

  const productora = campo(datos.productora, 160);
  const nombreObra = campo(datos.nombreObra, 300);
  const nombre = campo(datos.nombre, 120);
  const email = campo(datos.email, 254);
  const artista = campo(datos.artista, 200);
  const anio = campo(datos.anio, 10);
  const telefono = campo(datos.telefono, 60);
  const cantidad = campo(datos.cantidad, 10) || String(datos.cantidad ?? "");

  if (!productora || !nombreObra || !nombre || !emailValido(email)) return faltanCampos();
  if (!aceptoTerminos(datos)) return noAceptoTerminos();

  return responderFormulario(
    "isrc",
    {
      casilla: "isrc",
      asunto: `Solicitud de código ISRC: ${productora}`,
      responderA: email,
      datos: [
        ["Productora", productora],
        ["Obra", nombreObra],
        ["Artista", artista],
        ["Año", anio],
        ["Cantidad de códigos", cantidad],
        ["Solicitante", nombre],
        ["Email", email],
        ["Teléfono", telefono],
        constanciaDeAceptacion(),
      ],
    },
    { productora, nombreObra, artista, anio, cantidad, nombre, email, telefono },
  );
}
