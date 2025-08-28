import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { shippingAddressTable } from "@/db/schema";
import { SessionManager } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    // Obter usuário da sessão
    const session = await SessionManager.getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { message: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    console.log("✅ Usuário autenticado para endereços:", session.email);

    // Buscar os endereços de entrega do usuário
    const addresses = await db.query.shippingAddressTable.findMany({
      where: (shippingAddress, { eq }) =>
        eq(shippingAddress.userId, session.userId),
      orderBy: (shippingAddress, { desc }) => [desc(shippingAddress.createdAt)],
    });

    console.log("✅ Endereços encontrados:", addresses.length);
    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Error getting shipping addresses:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Obter usuário da sessão
    const session = await SessionManager.getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { message: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      name,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      zipCode,
    } = body;

    // Validar campos obrigatórios
    if (
      !name ||
      !street ||
      !number ||
      !neighborhood ||
      !city ||
      !state ||
      !zipCode
    ) {
      return NextResponse.json(
        { message: "Todos os campos obrigatórios devem ser preenchidos" },
        { status: 400 },
      );
    }

    // Criar novo endereço
    const newAddress = await db
      .insert(shippingAddressTable)
      .values({
        userId: session.userId,
        recipientName: name,
        street,
        number,
        complement: complement || null,
        neighborhood,
        city,
        state,
        zipCode,
        country: "Brasil",
        phone: "",
        email: session.email,
        cpfOrCnpj: "",
      })
      .returning();

    console.log("✅ Endereço criado:", newAddress[0].id);
    return NextResponse.json(newAddress[0]);
  } catch (error) {
    console.error("Error creating shipping address:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
