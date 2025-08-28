"use server";

import { ilike, or } from "drizzle-orm";

import { db } from "@/db";
import { productTable } from "@/db/schema";

import { searchProductsSchema } from "./schema";

export const searchProducts = async (data: searchProductsSchema) => {
  searchProductsSchema.parse(data);

  const { query } = data;

  if (!query || query.trim().length < 2) {
    return [];
  }

  const products = await db.query.productTable.findMany({
    where: or(
      ilike(productTable.name, `%${query}%`),
      ilike(productTable.description, `%${query}%`),
    ),
    with: {
      variants: true,
      category: true,
    },
    limit: 10, // Limita a 10 resultados
  });

  return products;
};
