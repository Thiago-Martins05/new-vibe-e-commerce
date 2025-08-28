"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAddCartItem } from "@/hooks/mutations/use-add-cart-item";

import AddToCartButton from "./add-to-cart-button";

interface ProductActionsProps {
  productVariantId: string;
  quantity: 1;
}

const ProductActions = ({ productVariantId }: ProductActionsProps) => {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const addCartItemMutation = useAddCartItem();

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleBuyNow = () => {
    addCartItemMutation.mutate(
      {
        productVariantId,
        quantity,
      },
      {
        onSuccess: () => {
          toast.success("Produto adicionado ao carrinho!");
          router.push("/cart/identification");
        },
        onError: (error) => {
          console.error("Erro ao adicionar produto:", error);

          // Verificar se é um erro de autenticação
          if (error.message === "Usuário não autenticado") {
            toast.error(
              "Você precisa estar logado para adicionar produtos ao carrinho",
            );
            // Redirecionar para a página de login usando window.location diretamente
            if (typeof window !== "undefined") {
              window.location.href = "/authentication";
            }
          } else {
            toast.error("Erro ao adicionar produto ao carrinho");
          }
        },
      },
    );
  };

  return (
    <>
      <div className="px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              <MinusIcon className="h-4 w-4" />
            </Button>
            <span className="w-8 text-center">{quantity}</span>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleIncrement}
              className="transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-5">
        <AddToCartButton
          productVariantId={productVariantId}
          quantity={quantity}
          title="Adicionar ao Carrinho"
        />
        <Button
          className="rounded-full transition-all duration-200 hover:scale-105 cursor-pointer"
          onClick={handleBuyNow}
          disabled={addCartItemMutation.isPending}
        >
          {addCartItemMutation.isPending ? "Adicionando..." : "Comprar Agora"}
        </Button>
      </div>
    </>
  );
};

export default ProductActions;
