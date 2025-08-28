import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import ProductItem from "@/components/common/product-item";
import { db } from "@/db";
import { categoryTable, productTable } from "@/db/schema";

// Configurações para evitar pre-render
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

const CategoryPage = async ({ params }: CategoryPageProps) => {
  const { slug } = await params;
  const category = await db.query.categoryTable.findFirst({
    where: eq(categoryTable.slug, slug),
  });
  if (!category) {
    return notFound();
  }
  const products = await db.query.productTable.findMany({
    where: eq(productTable.categoryId, category.id),
    with: {
      variants: true,
    },
  });
  return (
    <>
      <Header />
      <div className="md:px-25 space-y-6 px-5">
        <h2 className="text-lg font-semibold md:m-auto md:w-[80%] md:pb-5">
          {category.name}
        </h2>
        <div className="grid grid-cols-2 gap-4 md:gap-2">
          {products.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              textContainerClassName="max-w-full "
            />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CategoryPage;
