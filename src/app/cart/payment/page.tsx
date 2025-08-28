"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCentsToBRL } from "@/helpers/money";
import { useShippingAddresses } from "@/hooks/queries/use-shipping-addresses";

const PaymentPage = () => {
  const router = useRouter();
  const { data: addresses } = useShippingAddresses();
  const [cart, setCart] = useState<any>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Buscar carrinho da API
    const fetchCart = async () => {
      try {
        const response = await fetch("/api/cart", {
          credentials: "include",
        });
        if (response.ok) {
          const cartData = await response.json();
          setCart(cartData);
        } else {
          toast.error("Erro ao carregar carrinho");
          router.push("/");
        }
      } catch (error) {
        console.error("Erro ao buscar carrinho:", error);
        toast.error("Erro ao carregar carrinho");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    // Buscar endereço selecionado do localStorage
    const savedAddressId = localStorage.getItem("selectedAddressId");
    if (savedAddressId) {
      setSelectedAddressId(savedAddressId);
    } else {
      toast.error("Selecione um endereço de entrega");
      router.push("/cart/identification");
      return;
    }

    fetchCart();
  }, [router]);

  const selectedAddress = addresses?.find(
    (address) => address.id === selectedAddressId,
  );

  const handlePayment = async () => {
    if (!selectedAddress || !cart) {
      toast.error("Dados incompletos para pagamento");
      return;
    }

    try {
      setIsProcessing(true);

      // Criar sessão de checkout no Stripe
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          cart: cart,
          shippingAddress: selectedAddress,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao processar pagamento");
      }

      const { sessionUrl } = await response.json();

      // Redirecionar para o Stripe
      window.location.href = sessionUrl;
    } catch (error) {
      console.error("Erro no pagamento:", error);
      toast.error("Erro ao processar pagamento. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-gray-400">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Carregando...</h3>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    router.push("/");
    return null;
  }

  if (!selectedAddress) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Endereço não encontrado
          </h3>
          <p className="text-gray-600">
            Por favor, selecione um endereço válido
          </p>
          <Button
            onClick={() => router.push("/cart/identification")}
            className="mt-4 hover-zoom-button cursor-pointer"
          >
            Voltar para endereços
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Cabeçalho */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold sm:text-3xl">Finalizar Compra</h1>
          <p className="text-gray-600">
            Confirme seus dados e realize o pagamento
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Resumo do Pedido */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lista de itens */}
              <div className="space-y-4">
                {cart.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-gray-200">
                        <img
                          src={item.productVariant.imageUrl}
                          alt={item.productVariant.name}
                          className="h-full w-full rounded-lg object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {item.productVariant.product.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {item.productVariant.name} - Qtd: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-medium">
                      {formatCentsToBRL(
                        item.productVariant.priceInCents * item.quantity,
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totais */}
              <div className="space-y-3 border-t pt-6">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCentsToBRL(cart.totalPriceInCents)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Entrega:</span>
                  <span>GRÁTIS</span>
                </div>
                <div className="flex justify-between border-t pt-3 text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatCentsToBRL(cart.totalPriceInCents)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço de Entrega */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Endereço de Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="font-medium">{selectedAddress.recipientName}</p>
                <p className="text-sm text-gray-600">
                  {selectedAddress.street}, {selectedAddress.number}
                  {selectedAddress.complement &&
                    `, ${selectedAddress.complement}`}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedAddress.neighborhood}, {selectedAddress.city}-
                  {selectedAddress.state}
                </p>
                <p className="text-sm text-gray-600">
                  CEP: {selectedAddress.zipCode}
                </p>
                {selectedAddress.phone && (
                  <p className="text-sm text-gray-600">
                    Tel: {selectedAddress.phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botões */}
        <div className="flex flex-col items-center gap-4 pt-4 lg:flex-row lg:justify-center">
          <Button
            variant="outline"
            onClick={() => router.push("/cart/identification")}
            className="w-full max-w-md rounded-full hover-zoom-button cursor-pointer transition-colors hover:border-gray-300 hover:bg-gray-50"
            size="lg"
          >
            Voltar para endereços
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            className="hover:bg-primary/90 w-full max-w-md rounded-full hover-zoom-button cursor-pointer transition-colors"
            size="lg"
          >
            {isProcessing
              ? "Processando..."
              : `Pagar ${formatCentsToBRL(cart.totalPriceInCents)}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
