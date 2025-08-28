import { NextRequest, NextResponse } from "next/server";
import { SessionManager } from "@/lib/session";
import { db } from "@/db";
import { shippingAddressTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    console.log("🔄 Atualizando endereço:", id);

    // Verificar autenticação
    const session = await SessionManager.getSessionFromRequest(request);
    if (!session?.userId) {
      return NextResponse.json(
        { message: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    console.log("✅ Usuário autenticado para atualização:", session.userId);

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
      country,
      phone,
      email,
      cpfOrCnpj,
    } = body;

    // Verificar se o endereço pertence ao usuário
    const existingAddress = await db
      .select()
      .from(shippingAddressTable)
      .where(eq(shippingAddressTable.id, id))
      .limit(1);

    if (existingAddress.length === 0) {
      return NextResponse.json(
        { message: "Endereço não encontrado" },
        { status: 404 },
      );
    }

    if (existingAddress[0].userId !== session.userId) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    // Atualizar o endereço
    const updatedAddress = await db
      .update(shippingAddressTable)
      .set({
        recipientName: name,
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        zipCode,
        country,
        phone,
        email,
        cpfOrCnpj,
      })
      .where(eq(shippingAddressTable.id, id))
      .returning();

    console.log("✅ Endereço atualizado:", updatedAddress[0].id);

    return NextResponse.json(updatedAddress[0]);
  } catch (error) {
    console.error("❌ Erro ao atualizar endereço:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    console.log("🗑️ Excluindo endereço:", id);

    // Verificar autenticação
    const session = await SessionManager.getSessionFromRequest(request);
    if (!session?.userId) {
      return NextResponse.json(
        { message: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    console.log("✅ Usuário autenticado para exclusão:", session.userId);

    // Verificar se o endereço pertence ao usuário
    const existingAddress = await db
      .select()
      .from(shippingAddressTable)
      .where(eq(shippingAddressTable.id, id))
      .limit(1);

    if (existingAddress.length === 0) {
      return NextResponse.json(
        { message: "Endereço não encontrado" },
        { status: 404 },
      );
    }

    if (existingAddress[0].userId !== session.userId) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 403 });
    }

    // Excluir o endereço
    await db
      .delete(shippingAddressTable)
      .where(eq(shippingAddressTable.id, id));

    console.log("✅ Endereço excluído:", id);

    return NextResponse.json({ message: "Endereço excluído com sucesso" });
  } catch (error) {
    console.error("❌ Erro ao excluir endereço:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
