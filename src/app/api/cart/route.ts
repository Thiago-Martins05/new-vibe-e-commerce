import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

import { SessionManager } from "@/lib/session";
import { db } from "@/db";
import { cartTable, cartItemTable, productVariantTable } from "@/db/schema";

// Função para obter produto real do banco de dados
async function getRealProduct(productVariantId: string) {
  try {
    const productVariant = await db.query.productVariantTable.findFirst({
      where: (productVariant, { eq }) =>
        eq(productVariant.id, productVariantId),
      with: {
        product: true,
      },
    });

    if (!productVariant) {
      throw new Error("Produto não encontrado");
    }

    return {
      id: productVariant.id,
      name: productVariant.name,
      priceInCents: productVariant.priceInCents,
      imageUrl: productVariant.imageUrl,
      product: {
        id: productVariant.product.id,
        name: productVariant.product.name,
      },
    };
  } catch (error) {
    console.error("❌ Erro ao buscar produto no banco:", error);
    throw error;
  }
}

// Função para obter ou criar carrinho do usuário
async function getOrCreateCart(userId: string) {
  try {
    // Buscar carrinho existente
    let cart = await db.query.cartTable.findFirst({
      where: (cart, { eq }) => eq(cart.userId, userId),
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

    // Se não existir, criar novo carrinho
    if (!cart) {
      const [newCart] = await db
        .insert(cartTable)
        .values({
          userId,
        })
        .returning();

      cart = await db.query.cartTable.findFirst({
        where: (cart, { eq }) => eq(cart.id, newCart.id),
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
    }

    return cart;
  } catch (error) {
    console.error("❌ Erro ao obter/criar carrinho:", error);
    throw error;
  }
}

// Função para calcular total do carrinho
function calculateCartTotal(
  items: Array<{
    productVariant: { priceInCents: number };
    quantity: number;
  }>,
) {
  return items.reduce(
    (total, item) => total + item.productVariant.priceInCents * item.quantity,
    0,
  );
}

// Função para formatar carrinho para resposta
function formatCartResponse(cart: {
  id: string;
  userId: string;
  items: Array<{
    id: string;
    productVariantId: string;
    quantity: number;
    productVariant: {
      id: string;
      name: string;
      priceInCents: number;
      imageUrl: string;
      product: {
        id: string;
        name: string;
      };
    };
    createdAt: Date;
  }>;
  createdAt: Date;
}) {
  const items = cart.items.map((item) => ({
    id: item.id,
    productVariantId: item.productVariantId,
    quantity: item.quantity,
    productVariant: {
      id: item.productVariant.id,
      name: item.productVariant.name,
      priceInCents: item.productVariant.priceInCents,
      imageUrl: item.productVariant.imageUrl,
      product: {
        id: item.productVariant.product.id,
        name: item.productVariant.product.name,
      },
    },
    createdAt: item.createdAt,
  }));

  return {
    id: cart.id,
    userId: cart.userId,
    items,
    totalPriceInCents: calculateCartTotal(cart.items),
    createdAt: cart.createdAt,
  };
}

export async function GET(request: NextRequest) {
  try {
    console.log("=== API CART GET - INICIANDO ===");

    // Obter usuário da sessão
    const session = await SessionManager.getSessionFromRequest(request);

    if (!session) {
      console.log("❌ Sessão não encontrada");
      return NextResponse.json(
        { message: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    console.log("✅ Usuário autenticado para carrinho:", session.email);
    console.log("🆔 UserId:", session.userId);

    // Verificar parâmetros da URL
    const url = new URL(request.url);
    const addTestItem = url.searchParams.get("addTestItem");
    const addItem = url.searchParams.get("addItem");

    // Obter ou criar carrinho
    let cart = await getOrCreateCart(session.userId);

    // Se solicitado, adicionar item de teste
    if (addTestItem === "true" || addItem === "true") {
      // Buscar um produto real do banco para teste
      const productVariants = await db.query.productVariantTable.findMany({
        with: {
          product: true,
        },
        limit: 1,
      });

      if (productVariants.length > 0) {
        const testProductVariant = productVariants[0];

        // Verificar se já existe no carrinho
        const existingItem = cart?.items.find(
          (item) => item.productVariantId === testProductVariant.id,
        );

        if (existingItem) {
          // Atualizar quantidade
          await db
            .update(cartItemTable)
            .set({ quantity: existingItem.quantity + 1 })
            .where(eq(cartItemTable.id, existingItem.id));
        } else {
          // Adicionar novo item
          await db.insert(cartItemTable).values({
            cartId: cart!.id,
            productVariantId: testProductVariant.id,
            quantity: 1,
          });
        }

        // Recarregar carrinho
        cart = await getOrCreateCart(session.userId);
        console.log("✅ Item de teste adicionado ao carrinho");
      }
    }

    if (!cart) {
      throw new Error("Erro ao obter carrinho");
    }

    const formattedCart = formatCartResponse(cart);

    console.log(
      "✅ Retornando carrinho:",
      formattedCart.id,
      "com",
      formattedCart.items.length,
      "itens",
    );

    return NextResponse.json(formattedCart);
  } catch (error) {
    console.error("❌ Erro geral na API cart:", error);
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== API CART ADD ITEM - INICIANDO ===");

    // Obter usuário da sessão
    const session = await SessionManager.getSessionFromRequest(request);

    if (!session) {
      console.log("❌ Sessão não encontrada");
      return NextResponse.json(
        { message: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { productVariantId, quantity = 1 } = body;

    if (!productVariantId) {
      return NextResponse.json(
        { message: "ID da variante do produto é obrigatório" },
        { status: 400 },
      );
    }

    console.log("✅ Adicionando produto ao carrinho:", {
      productVariantId,
      quantity,
      userId: session.userId,
    });

    // Verificar se o produto existe
    await getRealProduct(productVariantId);

    // Obter ou criar carrinho
    const cart = await getOrCreateCart(session.userId);

    // Verificar se o produto já existe no carrinho
    const existingItem = cart?.items.find(
      (item) => item.productVariantId === productVariantId,
    );

    if (existingItem) {
      // Se já existe, apenas aumentar a quantidade
      await db
        .update(cartItemTable)
        .set({ quantity: existingItem.quantity + quantity })
        .where(eq(cartItemTable.id, existingItem.id));

      console.log(
        "✅ Quantidade aumentada para produto existente:",
        existingItem.id,
      );
    } else {
      // Se não existe, adicionar novo item
      await db.insert(cartItemTable).values({
        cartId: cart!.id,
        productVariantId,
        quantity,
      });

      console.log("✅ Novo item adicionado ao carrinho");
    }

    // Recarregar carrinho
    const updatedCart = await getOrCreateCart(session.userId);
    if (!updatedCart) {
      throw new Error("Erro ao recarregar carrinho");
    }
    const formattedCart = formatCartResponse(updatedCart);

    console.log("✅ Item processado no carrinho");

    return NextResponse.json({
      success: true,
      message: "Produto adicionado ao carrinho",
      cart: formattedCart,
    });
  } catch (error) {
    console.error("❌ Erro ao adicionar item:", error);
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("=== API CART REMOVE ITEM - INICIANDO ===");

    // Obter usuário da sessão
    const session = await SessionManager.getSessionFromRequest(request);

    if (!session) {
      console.log("❌ Sessão não encontrada");
      return NextResponse.json(
        { message: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    const url = new URL(request.url);
    const itemId = url.searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { message: "ID do item é obrigatório" },
        { status: 400 },
      );
    }

    console.log("✅ Removendo item do carrinho:", {
      itemId,
      userId: session.userId,
    });

    // Obter carrinho
    const cart = await getOrCreateCart(session.userId);

    if (!cart) {
      console.log("❌ Carrinho não encontrado para userId:", session.userId);
      return NextResponse.json(
        { message: "Carrinho não encontrado" },
        { status: 404 },
      );
    }

    // Verificar se o item pertence ao carrinho do usuário
    const item = cart?.items.find((item) => item.id === itemId);

    if (!item) {
      console.log("❌ Item não encontrado no carrinho:", itemId);
      return NextResponse.json(
        { message: "Item não encontrado no carrinho" },
        { status: 404 },
      );
    }

    // Remover item
    await db.delete(cartItemTable).where(eq(cartItemTable.id, itemId));

    console.log("✅ Item removido do carrinho:", itemId);

    // Recarregar carrinho
    const updatedCart = await getOrCreateCart(session.userId);
    if (!updatedCart) {
      throw new Error("Erro ao recarregar carrinho");
    }
    const formattedCart = formatCartResponse(updatedCart);

    return NextResponse.json({
      success: true,
      message: "Produto removido do carrinho",
      cart: formattedCart,
    });
  } catch (error) {
    console.error("❌ Erro ao remover item:", error);
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log("=== API CART UPDATE QUANTITY - INICIANDO ===");

    // Obter usuário da sessão
    const session = await SessionManager.getSessionFromRequest(request);

    if (!session) {
      console.log("❌ Sessão não encontrada");
      return NextResponse.json(
        { message: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { message: "ID do item e quantidade são obrigatórios" },
        { status: 400 },
      );
    }

    if (quantity < 1) {
      return NextResponse.json(
        { message: "Quantidade deve ser maior que 0" },
        { status: 400 },
      );
    }

    console.log("✅ Atualizando quantidade do item:", {
      itemId,
      quantity,
      userId: session.userId,
    });

    // Obter carrinho
    const cart = await getOrCreateCart(session.userId);

    if (!cart) {
      console.log("❌ Carrinho não encontrado para userId:", session.userId);
      return NextResponse.json(
        { message: "Carrinho não encontrado" },
        { status: 404 },
      );
    }

    // Verificar se o item pertence ao carrinho do usuário
    const item = cart?.items.find((item) => item.id === itemId);

    if (!item) {
      return NextResponse.json(
        { message: "Item não encontrado no carrinho" },
        { status: 404 },
      );
    }

    // Atualizar quantidade
    await db
      .update(cartItemTable)
      .set({ quantity })
      .where(eq(cartItemTable.id, itemId));

    console.log("✅ Quantidade atualizada:", itemId, "para", quantity);

    // Recarregar carrinho
    const updatedCart = await getOrCreateCart(session.userId);
    if (!updatedCart) {
      throw new Error("Erro ao recarregar carrinho");
    }
    const formattedCart = formatCartResponse(updatedCart);

    return NextResponse.json({
      success: true,
      message: "Quantidade atualizada",
      cart: formattedCart,
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar quantidade:", error);
    return NextResponse.json(
      {
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 },
    );
  }
}
