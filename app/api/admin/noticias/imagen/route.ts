import { NextRequest, NextResponse } from "next/server";
import {
  MAXIMO_BYTES,
  TIPOS_ACEPTADOS,
  borrarImagen,
  esUrlDeImagenValida,
  guardarImagen,
} from "@/lib/imagenes";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "sgp-admin-2026";

function autorizado(req: NextRequest): boolean {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

const NO_AUTORIZADO = NextResponse.json({ error: "No autorizado" }, { status: 401 });

/** Recibe la portada de una noticia, ya reducida por el navegador. */
export async function POST(req: NextRequest) {
  if (!autorizado(req)) return NO_AUTORIZADO;

  let archivo: File | null = null;
  try {
    archivo = (await req.formData()).get("imagen") as File | null;
  } catch {
    return NextResponse.json({ error: "No se recibió la imagen" }, { status: 400 });
  }

  if (!archivo || typeof archivo === "string") {
    return NextResponse.json({ error: "No se recibió la imagen" }, { status: 400 });
  }
  if (!TIPOS_ACEPTADOS.includes(archivo.type)) {
    return NextResponse.json(
      { error: "El archivo tiene que ser una imagen JPG, PNG o WebP" },
      { status: 400 },
    );
  }
  if (archivo.size > MAXIMO_BYTES) {
    return NextResponse.json({ error: "La imagen es demasiado pesada" }, { status: 400 });
  }

  try {
    const url = await guardarImagen(await archivo.arrayBuffer(), archivo.type);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("[noticias] no se pudo guardar la imagen:", error);
    return NextResponse.json({ error: "No se pudo guardar la imagen" }, { status: 500 });
  }
}

/** Borra una portada que se quitó de la noticia. */
export async function DELETE(req: NextRequest) {
  if (!autorizado(req)) return NO_AUTORIZADO;

  const url = new URL(req.url).searchParams.get("url") ?? "";
  // Solo se borran las imágenes que generó el propio panel.
  if (!esUrlDeImagenValida(url)) {
    return NextResponse.json({ error: "Ruta de imagen no válida" }, { status: 400 });
  }

  await borrarImagen(url);
  return NextResponse.json({ ok: true });
}
