"use client";

import { LucideShoppingBag, ShoppingBagIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { formatCentsToBRL } from "@/helpers/money";
import { useCart } from "@/hooks/queries/use-cart";
import { useAddCartItem } from "@/hooks/mutations/use-add-cart-item";

import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import CartItem from "./cart-item";

export const Cart = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    console.log("🛒 Cart Component - Montado");
  }, []);

  const cartResult = useCart();
  const cart = cartResult.data;
  const error = cartResult.error;
  const isLoading = cartResult.isLoading;

  // Debug logs
  console.log("🛒 Cart Component - Estado:", {
    isLoading,
    error: error?.message,
    cartItems: cart?.items?.length || 0,
    cart: cart,
  });

  // Renderizar apenas no cliente para evitar problemas de hidratação
  if (!isClient) {
    return (
      <Button variant="outline" size="icon">
        <ShoppingBagIcon />
      </Button>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="transition-all duration-200 hover:scale-110 cursor-pointer">
          <ShoppingBagIcon />
        </Button>
      </SheetTrigger>
      <SheetContent aria-describedby="sheet-description">
        <SheetHeader>
          <SheetTitle className="text-md flex gap-2">
            <LucideShoppingBag className="" />
            Carrinho
          </SheetTitle>
          <SheetDescription id="sheet-description">
            Gerencie os itens do seu carrinho de compras
          </SheetDescription>
        </SheetHeader>

        <div className="flex h-full flex-col px-3 pb-5">
          {isLoading ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 text-gray-400">
                <ShoppingBagIcon className="mx-auto h-16 w-16 animate-pulse" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Carregando...
              </h3>
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 text-gray-400">
                <ShoppingBagIcon className="mx-auto h-16 w-16" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Erro ao carregar carrinho
              </h3>
              <p className="mb-6 text-sm text-gray-600">
                Faça login para acessar seu carrinho
              </p>
              <Button asChild>
                <Link href="/authentication">Fazer Login</Link>
              </Button>
            </div>
          ) : cart && cart.items && cart.items.length > 0 ? (
            <>
              <div className="flex h-full max-h-full flex-col gap-5 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="flex h-full flex-col gap-5">
                    {cart.items.map((item: unknown) => (
                      <CartItem
                        key={(item as { id: string }).id}
                        id={(item as { id: string }).id}
                        productName={
                          (
                            item as {
                              productVariant: { product: { name: string } };
                            }
                          ).productVariant.product.name
                        }
                        productVariantName={
                          (item as { productVariant: { name: string } })
                            .productVariant.name
                        }
                        productVariantImageUrl={
                          (item as { productVariant: { imageUrl: string } })
                            .productVariant.imageUrl
                        }
                        productVariantPriceInCents={
                          (item as { productVariant: { priceInCents: number } })
                            .productVariant.priceInCents
                        }
                        quantity={(item as { quantity: number }).quantity}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex flex-col gap-4">
                <Separator />

                <div className="flex items-center justify-between text-xs font-medium">
                  <p>Subtotal:</p>
                  <p>{formatCentsToBRL(cart?.totalPriceInCents ?? 0)}</p>
                </div>

                <Separator />
                <div className="flex items-center justify-between text-xs font-medium">
                  <p>Entrega:</p>
                  <p>GRÁTIS</p>
                </div>

                <Separator />
                <div className="flex items-center justify-between text-xs font-medium">
                  <p>Total:</p>
                  <p>{formatCentsToBRL(cart?.totalPriceInCents ?? 0)}</p>
                </div>

                <Button className="mb-15 mt-5 rounded-full transition-all duration-200 hover:scale-110 cursor-pointer" asChild>
                  <Link href="/cart/identification">Finalizar compra</Link>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 text-gray-400">
                <ShoppingBagIcon className="mx-auto h-16 w-16" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Carrinho vazio
              </h3>
              <p className="mb-6 text-sm text-gray-600">
                Adicione produtos ao seu carrinho para começar a comprar
              </p>
              <div className="flex flex-col gap-2">
                <Button asChild className="transition-all duration-200 hover:scale-110 cursor-pointer">
                  <Link href="/">Continuar comprando</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
