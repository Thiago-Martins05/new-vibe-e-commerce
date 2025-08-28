"use server";

import { headers } from "next/headers";
import Stripe from "stripe";

import { db } from "@/db";
import { orderItemTable, orderTable } from "@/db/schema";
import { auth } from "@/lib/auth";

export const createOrder = async (stripeSessionId: string) => {
  console.log("=== INICIANDO CRIAÇÃO DE PEDIDO ===");
  console.log("StripeSessionId:", stripeSessionId);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  console.log("Session encontrada na action:", session ? "Sim" : "Não");

  // Se não há sessão, tentar usar o sessionId do Stripe para identificar o usuário
  if (!session?.user) {
    console.log(
      "⚠️ Usuário não autenticado na action, tentando usar sessionId do Stripe",
    );

    // Verificar se já existe um pedido para esta sessão
    const existingOrder = await db.query.orderTable.findFirst({
      where: (order, { eq }) => eq(order.stripeSessionId, stripeSessionId),
      with: {
        user: true,
      },
    });

    if (existingOrder) {
      console.log("✅ Pedido já existe para esta sessão:", existingOrder.id);
      return {
        success: true,
        orderId: existingOrder.id,
        orderNumber: existingOrder.orderNumber,
        message: "Pedido já foi criado anteriormente",
      };
    }

    // Se não há pedido existente, não podemos criar sem usuário
    throw new Error(
      "Unauthorized - Usuário não autenticado e não há pedido existente",
    );
  }

  console.log("✅ Usuário autenticado na action:", session.user.email);

  // Verificar se a chave do Stripe está configurada
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log("❌ STRIPE_SECRET_KEY não configurada");
    throw new Error("Stripe não configurado");
  }

  console.log("✅ STRIPE_SECRET_KEY configurada");

  // Verificar se DATABASE_URL está configurada
  if (!process.env.DATABASE_URL) {
    console.log("❌ DATABASE_URL não configurada");
    throw new Error("Banco de dados não configurado");
  }

  console.log("✅ DATABASE_URL configurada");

  // Inicializar Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
  });

  try {
    // Buscar a sessão do Stripe para obter os dados do pedido
    const stripeSession =
      await stripe.checkout.sessions.retrieve(stripeSessionId);

    if (!stripeSession || stripeSession.payment_status !== "paid") {
      throw new Error("Sessão de pagamento inválida ou não paga");
    }

    console.log("🔍 Buscando carrinho do usuário:", session.user.id);

    // Buscar o carrinho do usuário com todos os itens
    const cart = await db.query.cartTable.findFirst({
      where: (cart, { eq }) => eq(cart.userId, session.user.id),
      with: {
        items: {
          with: {
            productVariant: {
              with: {
                product: true,
              },
            },
          },
        },
      },
    });

    console.log("📦 Carrinho encontrado:", cart ? "Sim" : "Não");
    if (cart) {
      console.log("📦 Itens no carrinho:", cart.items.length);
    }

    // Se o carrinho não existir ou estiver vazio, tentar criar pedido baseado na sessão do Stripe
    if (!cart || !cart.items.length) {
      console.log(
        "Carrinho não encontrado, criando pedido baseado na sessão do Stripe",
      );

      // Verificar se já existe um pedido para esta sessão
      const existingOrder = await db.query.orderTable.findFirst({
        where: (order, { eq }) => eq(order.stripeSessionId, stripeSessionId),
      });

      if (existingOrder) {
        console.log("Pedido já existe para esta sessão:", existingOrder.id);
        return {
          success: true,
          orderId: existingOrder.id,
          orderNumber: existingOrder.orderNumber,
          message: "Pedido já foi criado anteriormente",
        };
      }

      // Se não há carrinho, não podemos criar o pedido
      throw new Error("Não foi possível recuperar os dados do carrinho");
    }

    if (!cart.shippingAddressId) {
      throw new Error("Endereço de entrega não selecionado");
    }

    // Verificar se já existe um pedido para esta sessão
    const existingOrder = await db.query.orderTable.findFirst({
      where: (order, { eq }) => eq(order.stripeSessionId, stripeSessionId),
    });

    if (existingOrder) {
      console.log("Pedido já existe para esta sessão:", existingOrder.id);
      return {
        success: true,
        orderId: existingOrder.id,
        orderNumber: existingOrder.orderNumber,
        message: "Pedido já foi criado anteriormente",
      };
    }

    // Calcular o total do pedido
    const totalAmountInCents = cart.items.reduce(
      (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
      0,
    );

    // Gerar número do pedido (formato: 001, 002, etc.)
    const timestamp = Date.now();
    const nextOrderNumber = String(timestamp).slice(-3);

    // Criar o pedido
    const [newOrder] = await db
      .insert(orderTable)
      .values({
        userId: session.user.id,
        shippingAddressId: cart.shippingAddressId,
        totalAmountInCents,
        status: "paid",
        orderNumber: nextOrderNumber,
        stripeSessionId,
      })
      .returning();

    // Criar os itens do pedido
    const orderItems = cart.items.map((item) => ({
      orderId: newOrder.id,
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      priceInCents: item.productVariant.priceInCents,
    }));

    await db.insert(orderItemTable).values(orderItems);

    console.log("Pedido criado com sucesso:", newOrder.id);

    console.log("✅ Pedido criado com sucesso:", newOrder.id);

    return {
      success: true,
      orderId: newOrder.id,
      orderNumber: nextOrderNumber,
      totalAmountInCents,
      itemsCount: cart.items.length,
    };
  } catch (error) {
    console.error("❌ Erro ao criar pedido:", error);
    console.error(
      "Stack trace:",
      error instanceof Error ? error.stack : "No stack trace",
    );
    throw error;
  }
};
