import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/db";
import {
  orderTable,
  orderItemTable,
  cartTable,
  cartItemTable,
} from "@/db/schema";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    console.log("=== WEBHOOK STRIPE RECEBIDO ===");

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.log("❌ Assinatura do webhook não encontrada");
      return NextResponse.json(
        { error: "Assinatura não encontrada" },
        { status: 400 },
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.log("❌ Erro ao verificar assinatura:", err);
      return NextResponse.json(
        { error: "Assinatura inválida" },
        { status: 400 },
      );
    }

    console.log("✅ Evento verificado:", event.type);

    // Processar apenas eventos de checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("💰 Pagamento concluído para sessão:", session.id);
      console.log("📊 Status do pagamento:", session.payment_status);
      console.log("👤 Customer ID:", session.customer);
      console.log("📦 Metadata:", session.metadata);

      // Verificar se o pagamento foi aprovado
      if (session.payment_status === "paid") {
        // Buscar o pedido pelo sessionId
        const existingOrder = await db.query.orderTable.findFirst({
          where: (order, { eq }) => eq(order.stripeSessionId, session.id),
        });

        if (existingOrder) {
          console.log("✅ Pedido encontrado:", existingOrder.id);

          // Atualizar status do pedido para "paid"
          await db
            .update(orderTable)
            .set({
              status: "paid",
            })
            .where(eq(orderTable.id, existingOrder.id));

          console.log("✅ Status do pedido atualizado para 'paid'");

          // Limpar carrinho após pagamento aprovado
          const { cartId } = session.metadata;
          if (cartId) {
            await db
              .delete(cartItemTable)
              .where(eq(cartItemTable.cartId, cartId));
            console.log("✅ Carrinho limpo após pagamento aprovado");
          }
        } else {
          console.log("❌ Pedido não encontrado para sessionId:", session.id);
        }

        // Aqui você pode adicionar lógica adicional:
        // - Enviar email de confirmação
        // - Atualizar estoque
        // - Notificar sistemas externos
      } else {
        console.log("⚠️ Pagamento não foi aprovado:", session.payment_status);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Erro no webhook:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
