"use client";

import { SearchIcon, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { formatCentsToBRL } from "@/helpers/money";
import { useSearchProducts } from "@/hooks/queries/use-search-products";

import { Button } from "../ui/button";
import { Input } from "../ui/input";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const searchResult = useSearchProducts(query);
  const products = searchResult.data || [];
  const isLoading = searchResult.isLoading || false;

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Abrir dropdown quando digitar
  useEffect(() => {
    if (query.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  const handleProductClick = () => {
    setIsOpen(false);
    setQuery("");
  };

  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
  };

  // Renderizar apenas no cliente para evitar problemas de hidratação
  if (!isClient) {
    return (
      <div className="relative w-full max-w-md">
        <div className="relative">
          <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Buscar produtos..."
            className="w-full pl-10 pr-10"
            disabled
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <SearchIcon className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Buscar produtos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-10"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 transition-all duration-200 hover:scale-110 cursor-pointer"
              onClick={clearSearch}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </form>

      {/* Dropdown de resultados */}
      {isOpen && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-lg border bg-white shadow-lg">
          <div className="max-h-96 overflow-y-auto p-2">
            {isLoading ? (
              <div className="text-muted-foreground p-4 text-center text-sm">
                Buscando...
              </div>
            ) : products && products.length > 0 ? (
              <div className="space-y-2">
                {products.map((product: unknown) => {
                  const productData = product as {
                    id: string;
                    name: string;
                    category?: { name: string };
                    variants: Array<{
                      slug: string;
                      imageUrl: string;
                      priceInCents: number;
                    }>;
                  };
                  const firstVariant = productData.variants[0];

                  // Verificar se firstVariant existe
                  if (!firstVariant) {
                    return null;
                  }

                  return (
                    <Link
                      key={productData.id}
                      href={`/product-variant/${firstVariant.slug}`}
                      onClick={handleProductClick}
                      className="hover:bg-muted flex items-center gap-3 rounded-md p-2 transition-all duration-200 hover:scale-105 cursor-pointer"
                    >
                      <Image
                        src={firstVariant.imageUrl}
                        alt={productData.name}
                        width={40}
                        height={40}
                        className="rounded-md object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {productData.name}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          {productData.category?.name}
                        </p>
                        <p className="text-xs font-semibold">
                          {formatCentsToBRL(firstVariant.priceInCents)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : query.length >= 2 ? (
              <div className="text-muted-foreground p-4 text-center text-sm">
                Nenhum produto encontrado
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
