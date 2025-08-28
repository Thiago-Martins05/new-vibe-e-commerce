import { Suspense } from "react";

import { searchProducts } from "@/actions/search-products";
import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import ProductList from "@/components/common/product-list";

// Configurações para evitar pre-render
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

const SearchResults = async ({ query }: { query: string }) => {
  if (!query) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Busca de Produtos
          </h1>
          <p className="text-gray-600">Digite um termo para buscar produtos</p>
        </div>
      </div>
    );
  }

  const products = await searchProducts({ query });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Resultados da busca
          </h1>
          <p className="text-gray-600">
            {products.length > 0
              ? `${products.length} produto(s) encontrado(s) para "${query}"`
              : `Nenhum produto encontrado para "${query}"`}
          </p>
        </div>

        {products.length > 0 && (
          <ProductList
            products={products}
            title={`Resultados para "${query}"`}
          />
        )}
      </div>
    </div>
  );
};

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { q } = await searchParams;
  const query = q || "";

  return (
    <>
      <Header />
      <Suspense fallback={<div>Carregando...</div>}>
        <SearchResults query={query} />
      </Suspense>
      <Footer />
    </>
  );
};

export default SearchPage;
