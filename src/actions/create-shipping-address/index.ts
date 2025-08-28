"use server";

import { headers } from "next/headers";

import { db } from "@/db";
import { shippingAddressTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import {
  type CreateShippingAddressSchema,
  createShippingAddressSchema,
} from "./schema";

export const createShippingAddress = async (
  data: CreateShippingAddressSchema,
) => {
  console.log("Dados recebidos:", data);

  // Validar os dados com Zod
  createShippingAddressSchema.parse(data);

  // Obter a sessão do usuário
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  console.log("Usuário autenticado:", session.user.id);

  // Criar o endereço de entrega
  const addressData = {
    userId: session.user.id,
    recipientName: `${data.firstName} ${data.lastName}`,
    street: data.address,
    number: data.number,
    complement: data.complement || null,
    city: data.city,
    state: data.state,
    neighborhood: data.neighborhood,
    zipCode: data.cep,
    country: "Brasil", // Valor padrão para Brasil
    phone: data.phone,
    email: data.email,
    cpfOrCnpj: data.document,
  };

  console.log("Dados para inserção:", addressData);

  const [shippingAddress] = await db
    .insert(shippingAddressTable)
    .values(addressData)
    .returning();

  console.log("Endereço criado:", shippingAddress);
  return shippingAddress;
};
