"use client";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAddCartItem } from "@/hooks/mutations/use-add-cart-item";

interface AddToCartButtonProps {
  productVariantId: string;
  quantity: number;
  title: string;
}

const AddToCartButton = ({
  productVariantId,
  quantity,
  title,
}: AddToCartButtonProps) => {
  const addCartItemMutation = useAddCartItem();

  const handleAddToCart = () => {
    addCartItemMutation.mutate(
      {
        productVariantId,
        quantity,
      },
      {
        onSuccess: () => {
          toast.success("Produto adicionado ao carrinho!");
        },
        onError: (error) => {
          console.error("❌ Erro ao adicionar produto ao carrinho:", error);

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
    <Button
      className="cursor-pointer rounded-full transition-all duration-200 hover:scale-105"
      onClick={handleAddToCart}
      disabled={addCartItemMutation.isPending}
    >
      {addCartItemMutation.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adicionando...
        </>
      ) : (
        title
      )}
    </Button>
  );
};

export default AddToCartButton;
