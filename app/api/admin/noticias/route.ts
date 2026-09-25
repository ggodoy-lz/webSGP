import { NextRequest, NextResponse } from "next/server";
import { verificarAdmin } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";
import {
  describirAlmacenamiento,
  guardarNoticias,
  leerNoticias,
  normalizarLista,
  usaBlob,
} from "@/lib/news-store";

/** Devuelve todas las noticias, incluidos los borradores. */
export async function GET(req: NextRequest) {
  const rechazo = verificarAdmin(req);
  if (rechazo) return rechazo;

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
  const rechazo = verificarAdmin(req);
  if (rechazo) return rechazo;

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
