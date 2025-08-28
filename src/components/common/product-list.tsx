"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { productTable, productVariantTable } from "@/db/schema";

import ProductItem from "./product-item";

// Cada produto vai ter as caracteristicas de produtos e de variantes
interface ProductListProps {
  title: string;
  products: (typeof productTable.$inferSelect & {
    variants: (typeof productVariantTable.$inferSelect)[];
  })[];
}

const ProductList = ({ title, products }: ProductListProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollTo = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; // Ajuste conforme necessário
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  // Verificar botões quando o componente monta e quando a janela é redimensionada
  useEffect(() => {
    checkScrollButtons();

    const handleResize = () => {
      checkScrollButtons();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [products]);

  return (
    <div className="space-y-6 px-3 md:m-auto md:mt-5 md:w-[80%]">
      <h3 className="px-6 font-semibold">{title}</h3>

      <div className="relative">
        {/* Botão Anterior - visível apenas em md+ */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/80 shadow-lg backdrop-blur-sm hover:bg-white hover:scale-105 transition-all duration-200 cursor-pointer md:flex"
          onClick={() => scrollTo("left")}
          disabled={!canScrollLeft}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Container dos produtos */}
        <div
          ref={scrollContainerRef}
          className="flex w-full gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden"
          onScroll={checkScrollButtons}
        >
          {products.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
        </div>

        {/* Botão Próximo - visível apenas em md+ */}
        <Button
          variant="outline"
          size="icon"
          className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white/80 shadow-lg backdrop-blur-sm hover:bg-white hover:scale-105 transition-all duration-200 cursor-pointer md:flex"
          onClick={() => scrollTo("right")}
          disabled={!canScrollRight}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ProductList;
