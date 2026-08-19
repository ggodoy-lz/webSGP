import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  describirAlmacenamiento,
  guardarNoticias,
  leerNoticias,
  normalizarLista,
  usaBlob,
} from "@/lib/news-store";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "sgp-admin-2026";

function autorizado(req: NextRequest): boolean {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

const NO_AUTORIZADO = NextResponse.json({ error: "No autorizado" }, { status: 401 });

/** Devuelve todas las noticias, incluidos los borradores. */
export async function GET(req: NextRequest) {
  if (!autorizado(req)) return NO_AUTORIZADO;

  return NextResponse.json({
    noticias: await leerNoticias({ fresco: true }),
    almacenamiento: describirAlmacenamiento(),
    persistente: usaBlob(),
  });
}

/**
 * Reemplaza la lista completa. El panel siempre manda todo el conjunto, así que
 * no hace falta un endpoint por noticia y se evita que dos guardados
 * simultáneos dejen la lista a medias.
 */
export async function PUT(req: NextRequest) {
  if (!autorizado(req)) return NO_AUTORIZADO;

  let noticias;
  try {
    const body = await req.json();
    noticias = normalizarLista(body?.noticias);
  } catch {
    return NextResponse.json({ error: "El contenido enviado no es válido" }, { status: 400 });
  }

  try {
    await guardarNoticias(noticias);
  } catch (error) {
    console.error("[noticias] no se pudo guardar:", error);
    return NextResponse.json(
      { error: "No se pudieron guardar las noticias" },
      { status: 500 },
    );
  }

  // Sin esto los cambios tardarían hasta un minuto en verse en el sitio.
  revalidatePath("/[locale]", "page");
  revalidatePath("/[locale]/noticias", "page");
  revalidatePath("/[locale]/noticias/[slug]", "page");

  return NextResponse.json({ ok: true, noticias, persistente: usaBlob() });
}
