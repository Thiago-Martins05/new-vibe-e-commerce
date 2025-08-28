"use server";

import { eq } from "drizzle-orm";
import Stripe from "stripe";

import { db } from "@/db";
import { cartTable, orderItemTable, orderTable } from "@/db/schema";
import { getBaseUrl } from "@/lib/utils";

import {
  CreateCheckoutSessionSchema,
  createCheckoutSessionSchema,
} from "./schema";

export const createCheckoutSession = async (
  data: CreateCheckoutSessionSchema & { userId: string },
) => {
  console.log("createCheckoutSession called with data:", data);

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Stripe configuration not found");
      throw new Error(
        "Configuração de pagamento não encontrada. Entre em contato com o suporte.",
      );
    }

    // Validar dados de entrada
    console.log("Validating input data...");
    createCheckoutSessionSchema.parse(data);

    // Verificar se o usuário está autenticado
    if (!data.userId) {
      console.error("No userId provided");
      throw new Error("Usuário não autenticado. Faça login para continuar.");
    }

    console.log("User authenticated:", data.userId);

    // Buscar carrinho do usuário
    let cart;
    try {
      console.log("Finding cart for user:", data.userId);
      cart = await db.query.cartTable.findFirst({
        where: (cart, { eq }) => eq(cart.userId, data.userId),
        with: {
          items: {
            with: {
              productVariant: {
                with: { product: true },
              },
            },
          },
          shippingAddress: true,
        },
      });
      console.log("Cart found:", !!cart);
    } catch (error) {
      console.error("Error finding cart:", error);
      throw new Error("Erro ao carregar carrinho. Tente novamente.");
    }

    if (!cart) {
      console.error("No cart found");
      throw new Error(
        "Carrinho não encontrado. Adicione produtos ao carrinho.",
      );
    }

    if (!cart.items || cart.items.length === 0) {
      console.error("Cart is empty");
      throw new Error("Carrinho vazio. Adicione produtos para continuar.");
    }

    console.log("Cart items count:", cart.items.length);

    // Atualizar endereço de entrega se necessário
    if (
      !cart.shippingAddress ||
      cart.shippingAddress.id !== data.shippingAddressId
    ) {
      try {
        console.log("Updating shipping address...");
        await db
          .update(cartTable)
          .set({ shippingAddressId: data.shippingAddressId })
          .where(eq(cartTable.id, cart.id));
        console.log("Shipping address updated");
      } catch (error) {
        console.error("Error updating shipping address:", error);
        throw new Error("Erro ao atualizar endereço de entrega.");
      }
    }

    // Configurar Stripe
    let stripe;
    try {
      console.log("Initializing Stripe...");
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
        apiVersion: "2024-06-20",
      });
      console.log("Stripe initialized");
    } catch (error) {
      console.error("Error initializing Stripe:", error);
      throw new Error("Erro na configuração de pagamento.");
    }

    // Gerar URLs
    let baseUrl;
    try {
      console.log("Getting base URL...");
      baseUrl = getBaseUrl();
      console.log("Base URL:", baseUrl);
    } catch {
      baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
      console.log("Fallback base URL:", baseUrl);
    }

    const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/cart/payment?canceled=1`;

    console.log("Success URL:", successUrl);
    console.log("Cancel URL:", cancelUrl);

    // Preparar itens para o Stripe
    const line_items = cart.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "brl",
        unit_amount: item.productVariant.priceInCents,
        product_data: {
          name: `${item.productVariant.product.name} - ${item.productVariant.name}`,
          images: [item.productVariant.imageUrl],
        },
      },
    }));

    console.log("Line items prepared:", line_items.length);

    // Criar o pedido ANTES de redirecionar para o Stripe
    console.log("Creating order before redirect...");
    let orderId: string;
    let orderNumber: string;

    try {
      // Calcular o total do pedido
      const totalAmountInCents = cart.items.reduce(
        (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
        0,
      );

      // Gerar número do pedido
      const timestamp = Date.now();
      orderNumber = String(timestamp).slice(-3);

      // Criar o pedido com status "pending"
      const [newOrder] = await db
        .insert(orderTable)
        .values({
          userId: data.userId,
          shippingAddressId: data.shippingAddressId,
          totalAmountInCents,
          status: "pending", // Status inicial
          orderNumber,
          stripeSessionId: null, // Será atualizado após criar a sessão do Stripe
        })
        .returning();

      orderId = newOrder.id;
      console.log("Order created with ID:", orderId);

      // Criar os itens do pedido
      const orderItems = cart.items.map((item) => ({
        orderId: newOrder.id,
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        priceInCents: item.productVariant.priceInCents,
      }));

      await db.insert(orderItemTable).values(orderItems);
      console.log("Order items created");
    } catch (error) {
      console.error("Error creating order:", error);
      throw new Error("Erro ao criar pedido. Tente novamente.");
    }

    // Validar dados antes de enviar para o Stripe
    try {
      console.log("Validating line items...");

      // Verificar se há itens
      if (line_items.length === 0) {
        throw new Error("Nenhum item encontrado no carrinho");
      }

      // Validar cada item
      line_items.forEach((item, index) => {
        console.log(`Validating item ${index}:`, {
          quantity: item.quantity,
          unit_amount: item.price_data.unit_amount,
          name: item.price_data.product_data.name,
          currency: item.price_data.currency,
        });

        if (!item.quantity || item.quantity <= 0) {
          throw new Error(`Quantidade inválida para o item ${index + 1}`);
        }

        if (!item.price_data.unit_amount || item.price_data.unit_amount <= 0) {
          throw new Error(`Preço inválido para o item ${index + 1}`);
        }

        if (
          !item.price_data.product_data.name ||
          item.price_data.product_data.name.trim() === ""
        ) {
          throw new Error(`Nome do produto inválido para o item ${index + 1}`);
        }

        if (item.price_data.currency !== "brl") {
          throw new Error(`Moeda inválida para o item ${index + 1}`);
        }
      });

      console.log("All line items validated successfully");
    } catch (validationError) {
      console.error("Validation error:", validationError);
      throw validationError;
    }

    // Criar sessão do Stripe
    let checkoutSession: Stripe.Checkout.Session;
    try {
      console.log("Creating Stripe checkout session...");
      checkoutSession = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          cartId: cart.id,
          userId: data.userId,
          shippingAddressId: data.shippingAddressId,
          orderId: orderId, // Incluir o ID do pedido
        },
      });
      console.log("Stripe session created:", checkoutSession.id);

      // Atualizar o pedido com o sessionId do Stripe
      await db
        .update(orderTable)
        .set({ stripeSessionId: checkoutSession.id })
        .where(eq(orderTable.id, orderId));
      console.log("Order updated with Stripe session ID");
    } catch (stripeError) {
      console.error("Stripe error:", stripeError);
      if (stripeError instanceof Stripe.errors.StripeError) {
        // Verificar se é um erro de chave expirada ou inválida
        if (
          stripeError.message.includes("Expired API Key") ||
          stripeError.message.includes("Invalid API Key") ||
          stripeError.message.includes("authentication")
        ) {
          throw new Error(
            "Chave da API do Stripe expirada ou inválida. Entre em contato com o suporte.",
          );
        }
        throw new Error(`Erro no pagamento: ${stripeError.message}`);
      }
      throw new Error("Falha ao processar pagamento. Tente novamente.");
    }

    if (!checkoutSession.url) {
      console.error("No URL in checkout session");
      throw new Error("Falha ao gerar link de pagamento. Tente novamente.");
    }

    console.log("Returning checkout URL:", checkoutSession.url);
    return { url: checkoutSession.url };
  } catch (error) {
    console.error("createCheckoutSession error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro interno do servidor. Tente novamente.");
  }
};
