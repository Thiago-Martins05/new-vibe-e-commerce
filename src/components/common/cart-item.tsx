import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { formatCentsToBRL } from "@/helpers/money";
import { useRemoveCartItem } from "@/hooks/mutations/use-remove-cart-item";
import { useUpdateCartItemQuantity } from "@/hooks/mutations/use-update-cart-item-quantity";

import { Button } from "../ui/button";

interface CartItemProps {
  id: string;
  productName: string;
  productVariantName: string;
  productVariantImageUrl: string;
  productVariantPriceInCents: number;
  quantity: number;
}

const CartItem = ({
  id,
  productName,
  productVariantName,
  productVariantImageUrl,
  productVariantPriceInCents,
  quantity,
}: CartItemProps) => {
  const removeCartItemMutation = useRemoveCartItem();
  const updateQuantityMutation = useUpdateCartItemQuantity();

  const handleDeleteClick = () => {
    removeCartItemMutation.mutate(
      { itemId: id },
      {
        onSuccess: () => {
          toast.success("Produto removido do carrinho");
        },
        onError: () => {
          toast.error("Erro ao remover produto do carrinho");
        },
      },
    );
  };

  const handleDecreaseQuantityClick = () => {
    if (quantity <= 1) {
      toast.error("Quantidade mínima é 1");
      return;
    }

    updateQuantityMutation.mutate(
      { itemId: id, quantity: quantity - 1 },
      {
        onSuccess: () => {
          toast.success("Quantidade diminuída");
        },
        onError: () => {
          toast.error("Erro ao diminuir quantidade");
        },
      },
    );
  };

  const handleIncreaseQuantityClick = () => {
    updateQuantityMutation.mutate(
      { itemId: id, quantity: quantity + 1 },
      {
        onSuccess: () => {
          toast.success("Quantidade aumentada");
        },
        onError: () => {
          toast.error("Erro ao aumentar quantidade");
        },
      },
    );
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Image
          src={productVariantImageUrl}
          alt={productVariantName}
          width={78}
          height={78}
          className="rounded-2xl pb-2"
        />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">{productName}</p>
          <p className="text-muted-foreground text-xs font-medium">
            {productVariantName}
          </p>
          <div className="flex w-[80px] items-center justify-between rounded-lg border p-1">
            <Button
              className="h-4 w-4 transition-all duration-200 hover:scale-110 cursor-pointer"
              variant="ghost"
              onClick={handleDecreaseQuantityClick}
              disabled={
                removeCartItemMutation.isPending ||
                updateQuantityMutation.isPending
              }
            >
              <MinusIcon className="h-2 w-2" />
            </Button>
            <p className="text-xs font-semibold">{quantity}</p>
            <Button
              className="h-4 w-4 transition-all duration-200 hover:scale-110 cursor-pointer"
              variant="ghost"
              onClick={handleIncreaseQuantityClick}
              disabled={
                removeCartItemMutation.isPending ||
                updateQuantityMutation.isPending
              }
            >
              <PlusIcon className="h-2 w-2" />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <p className="text-sm font-bold">
          {formatCentsToBRL(productVariantPriceInCents * quantity)}
        </p>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 transition-all duration-200 hover:scale-105 cursor-pointer"
          onClick={handleDeleteClick}
          disabled={
            removeCartItemMutation.isPending || updateQuantityMutation.isPending
          }
        >
          <TrashIcon />
        </Button>
      </div>
    </div>
  );
};

export default CartItem;
