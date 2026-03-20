import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { productora, nombreObra, nombre, email } = data;

    if (!productora || !nombreObra || !nombre || !email) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    console.log("[SGP ISRC Request]", {
      timestamp: new Date().toISOString(),
      ...data,
    });

    // TODO: Connect to email service or CRM

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
