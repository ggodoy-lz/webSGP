import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  describirAlmacenamiento,
  guardarGalardones,
  leerGalardones,
  normalizarContenido,
  usaBlob,
} from "@/lib/galardones-store";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "sgp-admin-2026";

function autorizado(req: NextRequest): boolean {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

const NO_AUTORIZADO = NextResponse.json({ error: "No autorizado" }, { status: 401 });

/** Devuelve todo el contenido, incluidos los galardones sin publicar. */
export async function GET(req: NextRequest) {
  if (!autorizado(req)) return NO_AUTORIZADO;

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
  if (!autorizado(req)) return NO_AUTORIZADO;

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
