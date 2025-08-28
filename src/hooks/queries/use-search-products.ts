import { useQuery } from "@tanstack/react-query";

import { searchProducts } from "@/actions/search-products";

export const getSearchProductsQueryKey = (query: string) =>
  ["search-products", query] as const;

export const useSearchProducts = (query: string) => {
  return useQuery({
    queryKey: getSearchProductsQueryKey(query),
    queryFn: () => searchProducts({ query }),
    enabled: query.length >= 2, // Só busca se tiver pelo menos 2 caracteres
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
