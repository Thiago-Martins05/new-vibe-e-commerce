"use client";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

import { productVariantTable } from "@/db/schema";

interface VariantSelectorProps {
  variants: (typeof productVariantTable.$inferSelect)[];
}

const VariantSelector = ({ variants }: VariantSelectorProps) => {
  const { slug } = useParams();
  return (
    <div className="flex items-center gap-4">
      {variants.map((variant) => (
        <Link
          href={`/product-variant/${variant.slug}`}
          key={variant.id}
          className={
            slug === variant.slug 
              ? "border-primary rounded-xl border-2 transition-all duration-200 hover:scale-105 cursor-pointer" 
              : "transition-all duration-200 hover:scale-105 cursor-pointer"
          }
        >
          <Image
            src={variant.imageUrl}
            alt={variant.name}
            width={68}
            height={68}
            className="rounded-xl"
          />
        </Link>
      ))}
    </div>
  );
};

export default VariantSelector;
