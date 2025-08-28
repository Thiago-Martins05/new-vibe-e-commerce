"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

interface Order {
  id: string;
  status: string;
  totalInCents: number;
  orderNumber: string;
}

const SuccessPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading: authLoading, refreshUser } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const hasProcessedRef = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  // Verificar se estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Processar pedido quando a página for carregada
  useEffect(() => {
    if (!isClient || authLoading) return; // Só executar no cliente e após autenticação carregar

    const sessionId = searchParams.get("session_id");

    if (hasProcessedRef.current || isProcessing) return;
    hasProcessedRef.current = true;
    setIsProcessing(true);

    const processOrder = async () => {
      try {
        console.log("🔄 Processando pedido com sessionId:", sessionId);

        // Limpar checkout do localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("selectedAddressId");
        }

        if (sessionId) {
          // Buscar o pedido existente via API
          const getOrderResponse = await fetch(
            `/api/orders/by-session/${sessionId}`,
            {
              method: "GET",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            },
          );

          if (getOrderResponse.ok) {
            const orderData = await getOrderResponse.json();
            console.log("✅ Pedido encontrado:", orderData);
            setOrder(orderData);
          } else {
            console.log("❌ Pedido não encontrado");
            toast.error(
              "Pedido não encontrado. Entre em contato com o suporte.",
            );
          }

          // Aguardar um pouco antes de limpar o carrinho
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Limpar o carrinho via API
        const clearCartResponse = await fetch("/api/clear-cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!clearCartResponse.ok) {
          const errorText = await clearCartResponse.text();
          console.error("❌ Erro ao limpar carrinho:", errorText);
        } else {
          console.log("✅ Carrinho limpo com sucesso");
        }

        // Atualizar dados do usuário
        await refreshUser();

        toast.success("Pagamento aprovado!");
      } catch (error) {
        console.error("Erro no processamento do pedido:", error);
        toast.error(
          "Erro ao processar o pedido. Entre em contato com o suporte.",
        );
      } finally {
        setIsProcessing(false);
      }
    };

    processOrder();
  }, [searchParams, isProcessing, router, authLoading, refreshUser, isClient]);

  const handleViewOrder = () => {
    router.push("/orders");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  // Renderizar loading enquanto não estivermos no cliente
  if (!isClient || authLoading) {
    return (
      <>
        <Header />
        <div className="m-auto flex min-h-[70vh] w-full bg-gray-50 px-4 pt-8 md:min-h-[80%] md:w-[80%] md:bg-transparent md:pt-0">
          <Card className="m-auto w-full max-w-md md:max-w-full">
            <CardContent className="space-y-4 p-6 text-center md:flex md:w-full md:justify-around md:space-y-6">
              <div className="space-y-3 md:max-w-md">
                <h1 className="text-2xl font-bold text-gray-900">
                  Carregando...
                </h1>
                <p className="text-sm leading-relaxed text-gray-600">
                  Processando seu pedido...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="m-auto flex min-h-[70vh] w-full bg-gray-50 px-4 pt-8 lg:min-h-[80%] lg:w-[80%] lg:bg-transparent lg:pt-0">
        <Card className="m-auto w-full max-w-md lg:max-w-full">
          <CardContent className="space-y-6 p-6 text-center lg:flex lg:w-full lg:justify-around lg:space-y-6">
            {/* Ilustração */}
            <div className="relative">
              <Image
                src="/finalization.png"
                alt="Pedido confirmado"
                className="mx-auto h-32 w-32 md:h-48 md:w-48"
                width={300}
                height={300}
              />
            </div>

            <div className="space-y-4 lg:max-w-md">
              {/* Mensagem de Confirmação */}
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
                  Pedido Efetuado!
                </h1>
                <p className="text-sm leading-relaxed text-gray-600 lg:text-base">
                  Seu pedido foi efetuado com sucesso. Você pode acompanhar o
                  status na seção de
                  <span className="font-medium"> Meus Pedidos</span>
                </p>
                {order && (
                  <div className="space-y-2 rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
                    <p className="font-medium">Pedido #{order.orderNumber}</p>
                    <p>
                      Status:{" "}
                      <span className="font-medium capitalize">
                        {order.status}
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="space-y-3 pt-4 lg:space-y-4 lg:pt-6">
                <Button
                  className="hover:bg-primary/90 w-full rounded-full transition-colors"
                  size="lg"
                  onClick={handleViewOrder}
                  disabled={isProcessing}
                >
                  Ver meu pedido
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full transition-colors hover:border-gray-300 hover:bg-gray-50"
                  size="lg"
                  onClick={handleGoHome}
                  disabled={isProcessing}
                >
                  Página inicial
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="md:fixed md:bottom-0 md:w-full">
        <Footer />
      </div>
    </>
  );
};

const SuccessPage = () => {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <SuccessPageContent />
    </Suspense>
  );
};

export default SuccessPage;
