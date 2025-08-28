"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import OrderCard from "@/components/common/order-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

interface Order {
  id: string;
  orderNumber: string;
  items: Array<{
    id: string;
    productVariant: {
      product: { name: string };
      name: string;
      color: string;
      imageUrl: string;
    };
    quantity: number;
    priceInCents: number;
  }>;
  totalAmountInCents: number;
}

const OrdersClient = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingTestOrders, setIsCreatingTestOrders] = useState(false);

  // Carregar pedidos
  useEffect(() => {
    const loadOrders = async () => {
      // Aguardar a autenticação carregar
      if (authLoading) {
        return;
      }

      if (!isAuthenticated || !user) {
        console.log("⚠️ Usuário não autenticado, não carregando pedidos");
        setIsLoading(false);
        return;
      }

      try {
        console.log("🔍 Carregando pedidos para usuário:", user.id);
        const response = await fetch("/api/orders", {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Importante para enviar cookies
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data);
          console.log("✅ Pedidos carregados:", data.length);
        } else {
          const errorData = await response.json();
          console.error("Erro ao carregar pedidos:", errorData);
          toast.error("Erro ao carregar pedidos");
        }
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
        toast.error("Erro ao carregar pedidos");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [authLoading, isAuthenticated, user]);

  const handleGoHome = () => {
    router.push("/");
  };

  const handleCreateTestOrders = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Faça login para criar pedidos de teste");
      return;
    }

    setIsCreatingTestOrders(true);
    try {
      console.log(
        "Iniciando criação de pedidos de teste para usuário:",
        user.id,
      );

      const response = await fetch("/api/test-create-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Importante para enviar cookies
      });

      console.log("Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Result:", result);
        toast.success("Pedidos de teste criados com sucesso!");

        // Recarregar pedidos
        const ordersResponse = await fetch("/api/orders", {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          setOrders(ordersData);
        } else {
          console.error(
            "Erro ao recarregar pedidos:",
            await ordersResponse.text(),
          );
        }
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);

        let errorMessage = "Erro ao criar pedidos de teste";

        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch {
          // Se não conseguir fazer parse do JSON, usar o texto original
        }

        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Erro ao criar pedidos de teste:", error);
      toast.error("Erro ao criar pedidos de teste");
    } finally {
      setIsCreatingTestOrders(false);
    }
  };

  // Mostrar loading enquanto a autenticação está carregando
  if (authLoading || isLoading) {
    return (
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="text-center">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Meus Pedidos
              </h1>
              <p className="text-gray-600">
                Acompanhe o status de todos os seus pedidos
              </p>
            </div>
            <Card>
              <CardContent className="py-12 text-center">
                <div className="text-gray-400">Carregando pedidos...</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Verificar autenticação
  if (!isAuthenticated || !user) {
    return (
      <div className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="text-center">
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Meus Pedidos
              </h1>
              <p className="text-gray-600">
                Acompanhe o status de todos os seus pedidos
              </p>
            </div>
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mb-4 text-gray-400">
                  <svg
                    className="mx-auto h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Acesso Negado
                </h3>
                <p className="mb-6 text-gray-600">
                  Você precisa estar logado para ver seus pedidos.
                </p>
                <Button
                  className="w-full rounded-full hover-zoom-button cursor-pointer"
                  size="lg"
                  onClick={() => router.push("/authentication/sign-in")}
                >
                  Fazer Login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Cabeçalho */}
          <div className="text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Meus Pedidos
            </h1>
            <p className="text-gray-600">
              Acompanhe o status de todos os seus pedidos
            </p>
          </div>

          {/* Lista de pedidos */}
          {orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => {
                // Calcular subtotal dos itens
                const subtotal = order.items.reduce(
                  (acc, item) => acc + item.priceInCents * item.quantity,
                  0,
                );

                // Mapear itens para o formato esperado pelo OrderCard
                const orderItems = order.items.map((item) => ({
                  id: item.id,
                  productName: item.productVariant.product.name,
                  productVariantName: item.productVariant.name,
                  color: item.productVariant.color,
                  size: "M", // Por enquanto fixo, pode ser adicionado ao schema depois
                  quantity: item.quantity,
                  priceInCents: item.priceInCents,
                  imageUrl: item.productVariant.imageUrl,
                }));

                return (
                  <OrderCard
                    key={order.id}
                    orderNumber={order.orderNumber}
                    items={orderItems}
                    subtotal={subtotal}
                    shippingCost={0} // Por enquanto grátis
                    estimatedTax={0}
                    total={order.totalAmountInCents}
                  />
                );
              })}
            </div>
          ) : (
            <Card className="">
              <CardContent className="py-12 text-center">
                <div className="mb-4 text-gray-400">
                  <svg
                    className="mx-auto h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Nenhum pedido encontrado
                </h3>
                <p className="mb-6 text-gray-600">
                  Você ainda não fez nenhum pedido. Que tal começar a comprar?
                </p>
                <div className="space-y-3">
                  <Button
                    className="w-full rounded-full hover-zoom-button cursor-pointer"
                    size="lg"
                    onClick={handleCreateTestOrders}
                    disabled={isCreatingTestOrders}
                  >
                    {isCreatingTestOrders
                      ? "Criando pedidos..."
                      : "Criar Pedidos de Teste"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-full hover-zoom-button cursor-pointer"
                    size="lg"
                    onClick={handleGoHome}
                  >
                    Ir para Página Inicial
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersClient;
