import Link from "next/link";

import { categoryTable } from "@/db/schema";

import { Button } from "../ui/button";

interface CategorySelectorProps {
  categories: (typeof categoryTable.$inferSelect)[];
}

const CategorySelector = ({ categories }: CategorySelectorProps) => {
  return (
    <div className="rounded-3xl bg-[#f4f4f5] p-5 md:m-auto md:mt-5 md:w-[80%]">
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <Link
            href={`/category/${category.slug}`}
            key={category.id}
            className="w-full"
          >
            <Button
              variant="ghost"
              className="w-full truncate rounded-3xl bg-[#4c4b4b] p-5 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer"
            >
              {category.name}
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
