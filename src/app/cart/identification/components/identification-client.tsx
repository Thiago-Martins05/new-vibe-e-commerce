"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { useCart } from "@/hooks/queries/use-cart";
import { useAuth } from "@/contexts/auth-context";

import Addresses from "./addresses";

const IdentificationClient = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: cart, isLoading, error } = useCart();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    // Se não estiver autenticado, marcar para redirecionar
    if (!isAuthenticated) {
      setShouldRedirect(true);
      return;
    }

    // Se a API falhar e não há carrinho, marcar para redirecionar
    if (error && !cart) {
      setShouldRedirect(true);
      return;
    }

    // Se há carrinho mas está vazio, marcar para redirecionar
    if (cart && (!cart.items || cart.items.length === 0)) {
      setShouldRedirect(true);
      return;
    }
  }, [isAuthenticated, error, cart]);

  // Efeito separado para redirecionamento
  useEffect(() => {
    if (shouldRedirect) {
      router.push("/");
    }
  }, [shouldRedirect, router]);

  // Se estiver carregando, mostrar loading
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen flex-col">
          <div className="container mx-auto flex-1 px-4 py-2">
            <div className="mx-auto max-w-4xl space-y-6 md:w-[70%] md:gap-6">
              <div className="text-center">
                <h1 className="mb-2 text-2xl font-bold">Carregando...</h1>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  // Se deve redirecionar, mostrar loading
  if (shouldRedirect) {
    return (
      <>
        <Header />
        <div className="flex min-h-screen flex-col">
          <div className="container mx-auto flex-1 px-4 py-2">
            <div className="mx-auto max-w-4xl space-y-6 md:w-[70%] md:gap-6">
              <div className="text-center">
                <h1 className="mb-2 text-2xl font-bold">Redirecionando...</h1>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  // Se não há carrinho válido, não renderizar nada
  if (!cart || !cart.items || cart.items.length === 0) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="flex min-h-screen flex-col">
        <div className="container mx-auto flex-1 px-4 py-2">
          <div className="mx-auto max-w-4xl space-y-6 md:w-[70%] md:gap-6">
            {/* Cabeçalho */}
            <div className="text-center">
              <h1 className="mb-2 text-2xl font-bold">Identificação</h1>
              <p className="text-gray-600">
                Cadastre e/ou selecione o endereço desejado
              </p>
            </div>

            <Addresses cart={cart} />
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default IdentificationClient;
