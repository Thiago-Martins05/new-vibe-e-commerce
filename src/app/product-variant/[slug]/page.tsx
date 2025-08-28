import { eq } from "drizzle-orm";
import Image from "next/image";
import { notFound } from "next/navigation";

import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import ProductList from "@/components/common/product-list";
import { db } from "@/db";
import { productTable, productVariantTable } from "@/db/schema";
import { formatCentsToBRL } from "@/helpers/money";

import ProductActions from "./components/product-actions";
import VariantSelector from "./components/variant-selector";

// Configurações para evitar pre-render
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ProductVariantPageProps {
  params: Promise<{ slug: string }>;
}

const ProductVariantPage = async ({ params }: ProductVariantPageProps) => {
  const { slug } = await params;

  const productVariant = await db.query.productVariantTable.findFirst({
    where: eq(productVariantTable.slug, slug),
    with: {
      product: {
        with: {
          variants: true,
        },
      },
    },
  });

  if (!productVariant) {
    return notFound();
  }

  const likelyProducts = await db.query.productTable.findMany({
    where: eq(productTable.categoryId, productVariant.product.categoryId),
    with: {
      variants: true,
    },
  });
  return (
    <>
      <Header />
      {/* Mobile */}
      <div className="flex w-full flex-col space-y-6 md:hidden">
        {/* Imagem, usando esta abordagem de botar o tamanho na div com o realtive e colocar na imagem o fill com o object-cover vai manter sempre a imagem em um tamanho adequado sem perder a qualidade de imagem.*/}

        <div className="relative h-[380px] w-full rounded-3xl">
          <Image
            src={productVariant.imageUrl}
            alt={productVariant.name}
            fill
            className="rounded-3xl object-cover px-5"
          />
        </div>

        <div className="space-y-6 px-5">
          <div className="px-5">
            {/* Variantes */}
            <VariantSelector variants={productVariant.product.variants} />
          </div>

          <div className="px-5">
            <h2 className="text-lg font-semibold">
              {productVariant.product.name}
            </h2>
            <h3 className="text-muted-foreground text-sm">
              {productVariant.name}
            </h3>
            <h3 className="text-lg font-semibold">
              {formatCentsToBRL(productVariant.priceInCents)}
            </h3>
          </div>

          <ProductActions productVariantId={productVariant.id} quantity={1} />

          <div className="px-5 pb-5">
            <p className="text-semibold text-sm">
              {productVariant.product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop */}

      <div className="hidden justify-between px-5 md:m-auto md:flex md:w-[80%]">
        <div className="relative h-[380px] w-full rounded-3xl md:flex md:h-[500px] md:w-[500px]">
          <Image
            src={productVariant.imageUrl}
            alt={productVariant.name}
            fill
            className="md:rounded-4xl object-cover"
          />
        </div>

        <div className="w-[40%] space-y-6">
          <div className="px-5">
            <h2 className="text-lg font-semibold">
              {productVariant.product.name}
            </h2>
            <h3 className="text-muted-foreground text-sm">
              {productVariant.name}
            </h3>
            <h3 className="text-lg font-semibold">
              {formatCentsToBRL(productVariant.priceInCents)}
            </h3>

            <div className="mt-5">
              {/* Variantes */}
              <VariantSelector variants={productVariant.product.variants} />
            </div>
          </div>

          <ProductActions productVariantId={productVariant.id} quantity={1} />

          <div className="px-5 pb-5">
            <p className="text-semibold text-sm">
              {productVariant.product.description}
            </p>
          </div>
        </div>
      </div>

      <ProductList title="Talvez você goste" products={likelyProducts} />

      <Footer />
    </>
  );
};

export default ProductVariantPage;
