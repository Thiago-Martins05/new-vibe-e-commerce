import { desc } from "drizzle-orm";

import CategorySelector from "@/components/common/category-selector";
import ClientOnly from "@/components/common/client-only";
import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import PartnerBrands from "@/components/common/partner-brands";
import ProductList from "@/components/common/product-list";
import HeroBannerDown from "@/components/home/hero-banner-down";
import HeroBannerUp from "@/components/home/hero-banner-up";
import { db } from "@/db";
import { productTable } from "@/db/schema";

const Home = async () => {
  try {
    console.log("Carregando página inicial...");

    // Testar conexão com banco primeiro
    const categories = await db.query.categoryTable.findMany();
    console.log("Categorias carregadas:", categories.length);

    const products = await db.query.productTable.findMany({
      with: {
        variants: true,
      },
    });
    console.log("Produtos carregados:", products.length);

    const newlyCreatedProducts = await db.query.productTable.findMany({
      orderBy: [desc(productTable.createdAt)],
      with: {
        variants: true,
      },
    });
    console.log("Novos produtos carregados:", newlyCreatedProducts.length);

    console.log("Dados carregados com sucesso");

    return (
      <>
        <ClientOnly fallback={<div className="h-16 bg-white"></div>}>
          <Header />
        </ClientOnly>
        <HeroBannerUp />

        <PartnerBrands title="Marcas parceiras" />

        <ProductList products={products} title="Mais vendidos" />

        <div className="px-5">
          <CategorySelector categories={categories} />
        </div>
        <HeroBannerDown />

        <ProductList products={newlyCreatedProducts} title="Novos Produtos" />

        <Footer />
      </>
    );
  } catch (error) {
    console.error("Erro ao carregar página inicial:", error);
    return (
      <>
        <ClientOnly fallback={<div className="h-16 bg-white"></div>}>
          <Header />
        </ClientOnly>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Erro ao carregar
            </h1>
            <p className="text-gray-600">Tente novamente mais tarde</p>
            <p className="mt-2 text-sm text-red-500">
              {error instanceof Error ? error.message : "Erro desconhecido"}
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }
};

export default Home;
