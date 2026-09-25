import { NextRequest, NextResponse } from "next/server";
import { verificarAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import {
  describirAlmacenamiento,
  guardarGalardones,
  leerGalardones,
  normalizarContenido,
  usaBlob,
} from "@/lib/galardones-store";

/** Devuelve todo el contenido, incluidos los galardones sin publicar. */
export async function GET(req: NextRequest) {
  const rechazo = verificarAdmin(req);
  if (rechazo) return rechazo;

  return NextResponse.json({
    contenido: await leerGalardones({ fresco: true }),
    almacenamiento: describirAlmacenamiento(),
    persistente: usaBlob(),
  });
}

/**
 * Reemplaza el contenido completo. El panel siempre manda todo, así se evita
 * que dos guardados simultáneos dejen la lista a medias.
 */
export async function PUT(req: NextRequest) {
  const rechazo = verificarAdmin(req);
  if (rechazo) return rechazo;

  let contenido;
  try {
    contenido = normalizarContenido((await req.json())?.contenido);
  } catch {
    return NextResponse.json({ error: "El contenido enviado no es válido" }, { status: 400 });
  }

  try {
    await guardarGalardones(contenido);
  } catch (error) {
    console.error("[galardones] no se pudo guardar:", error);
    return NextResponse.json(
      { error: "No se pudieron guardar los galardones" },
      { status: 500 },
    );
  }

  revalidatePath("/[locale]/galardones", "page");

  return NextResponse.json({ ok: true, contenido, persistente: usaBlob() });
}
