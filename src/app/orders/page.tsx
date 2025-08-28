import { Suspense } from "react";

import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";

import OrdersClient from "./components/orders-client";

// Configurações para evitar pre-render
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const OrdersPage = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="md:m-auto md:w-[80%]">
        <Header />
      </div>
      <Suspense fallback={<div className="p-8 text-center">Carregando...</div>}>
        <OrdersClient />
      </Suspense>
      <Footer />
    </div>
  );
};

export default OrdersPage;
