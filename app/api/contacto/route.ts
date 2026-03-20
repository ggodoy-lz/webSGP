import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { nombre, email, asunto, mensaje } = data;

    if (!nombre || !email || !asunto || !mensaje) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 });
    }

    console.log("[SGP Contacto]", {
      timestamp: new Date().toISOString(),
      ...data,
    });

    // TODO: Connect to email service

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
