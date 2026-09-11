import { NextRequest } from "next/server";
import { excedeEnvios, FALTAN_CAMPOS, responderFormulario } from "@/lib/formulario";
import { campo, emailValido } from "@/lib/validacion";

export async function POST(req: NextRequest) {
  const demasiados = excedeEnvios(req);
  if (demasiados) return demasiados;

  const datos = await req.json().catch(() => null);
  if (!datos) return FALTAN_CAMPOS;

  const productora = campo(datos.productora, 160);
  const nombreObra = campo(datos.nombreObra, 300);
  const nombre = campo(datos.nombre, 120);
  const email = campo(datos.email, 254);
  const artista = campo(datos.artista, 200);
  const anio = campo(datos.anio, 10);
  const telefono = campo(datos.telefono, 60);
  const cantidad = campo(datos.cantidad, 10) || String(datos.cantidad ?? "");

  if (!productora || !nombreObra || !nombre || !emailValido(email)) return FALTAN_CAMPOS;

  return responderFormulario(
    "isrc",
    {
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
      ],
    },
    { productora, nombreObra, artista, anio, cantidad, nombre, email, telefono },
  );
}
