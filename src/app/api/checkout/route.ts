import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { SessionManager } from "@/lib/session";
import { db } from "@/db";
import {
  orderTable,
  orderItemTable,
  cartTable,
  cartItemTable,
} from "@/db/schema";

// Inicializar Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(request: NextRequest) {
  try {
    console.log("=== API CHECKOUT - INICIANDO ===");

    // Verificar autenticação
    const session = await SessionManager.getSessionFromRequest(request);
    if (!session) {
      console.log("❌ Sessão não encontrada");
      return NextResponse.json(
        { message: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { cart, shippingAddress } = body;

    if (!cart || !shippingAddress) {
      return NextResponse.json(
        { message: "Dados do carrinho e endereço são obrigatórios" },
        { status: 400 },
      );
    }

    if (!cart.items || cart.items.length === 0) {
      return NextResponse.json({ message: "Carrinho vazio" }, { status: 400 });
    }

    console.log("✅ Criando sessão de checkout para:", session.email);

    // Criar linha de itens para o Stripe
    const lineItems = cart.items.map((item: any) => ({
      price_data: {
        currency: "brl",
        product_data: {
          name: item.productVariant.product.name,
          description: item.productVariant.name,
          images: [item.productVariant.imageUrl],
        },
        unit_amount: item.productVariant.priceInCents,
      },
      quantity: item.quantity,
    }));

    // Criar sessão de checkout
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "http://localhost:3000"}/cart/payment`,
      customer_email: session.email,
      metadata: {
        userId: session.userId,
        cartId: cart.id,
        shippingAddressId: shippingAddress.id,
        totalAmount: cart.totalPriceInCents.toString(),
      },
      shipping_address_collection: {
        allowed_countries: ["BR"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "brl",
            },
            display_name: "Entrega Grátis",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 5,
              },
              maximum: {
                unit: "business_day",
                value: 7,
              },
            },
          },
        },
      ],
    });

    console.log("✅ Sessão de checkout criada:", stripeSession.id);

    // Criar pedido imediatamente com status "pending"
    const orderNumber = `ORDER${Date.now()}`;

    const [newOrder] = await db
      .insert(orderTable)
      .values({
        userId: session.userId,
        shippingAddressId: shippingAddress.id,
        totalAmountInCents: cart.totalPriceInCents,
        status: "pending",
        stripeSessionId: stripeSession.id,
        orderNumber,
      })
      .returning();

    console.log("✅ Pedido criado:", newOrder.id);

    // Criar itens do pedido
    for (const cartItem of cart.items) {
      await db.insert(orderItemTable).values({
        orderId: newOrder.id,
        productVariantId: cartItem.productVariantId,
        quantity: cartItem.quantity,
        priceInCents: cartItem.productVariant.priceInCents,
      });
    }

    console.log("✅ Itens do pedido criados");

    return NextResponse.json({
      sessionUrl: stripeSession.url,
      sessionId: stripeSession.id,
      orderId: newOrder.id,
    });
  } catch (error) {
    console.error("❌ Erro ao criar sessão de checkout:", error);
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
