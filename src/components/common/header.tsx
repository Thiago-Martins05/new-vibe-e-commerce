"use client";

import {
  HomeIcon,
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  TruckIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/contexts/auth-context";

import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "../ui/sheet";
import Cart from "./cart";
import SearchBar from "./search-bar";

const HeaderContent = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { user, logout } = useAuth();

  // Renderizar apenas no cliente para evitar problemas de hidratação
  if (!isClient) {
    return (
      <header className="flex items-center justify-between px-5 py-1 md:m-auto md:max-w-[80%]">
        <Link href="/">
          <Image src="/logo.svg" alt="NEWVIBE" width={100} height={26}></Image>
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-background h-9 w-9 rounded-md border"></div>
          <div className="bg-background h-9 w-9 rounded-md border"></div>
        </div>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between px-5 py-1 md:m-auto md:max-w-[80%]">
      <Link href="/" className="transition-all duration-200 hover:scale-105 cursor-pointer">
        <Image src="/logo.svg" alt="NEWVIBE" width={100} height={26}></Image>
      </Link>

      {/* Barra de pesquisa - visível apenas em md+ */}
      <div className="hidden md:block md:max-w-md md:flex-1 md:px-4">
        <SearchBar />
      </div>

      <div className="flex items-center gap-3">
        <Cart />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="transition-all duration-200 hover:scale-105 cursor-pointer">
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent aria-describedby="header-sheet-description">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription id="header-sheet-description">
                Menu de navegação e opções do usuário
              </SheetDescription>
            </SheetHeader>
            <div className="px-5">
              {user ? (
                <>
                  <div className="mb-5 flex justify-between space-y-6">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="font-semibold capitalize">
                          {user.name?.split(" ")?.[0]?.[0]}
                          {user.name?.split(" ")?.[1]?.[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="font-semibold capitalize">
                          {user.name}
                        </h3>
                        <span className="text-muted-foreground block text-xs">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Separator />

                  <div className="mb-5 mt-6">
                    <div className="flex w-full flex-col space-y-6">
                      <Link href="/" className="flex w-full gap-3 transition-all duration-200 hover:scale-105 hover:text-primary cursor-pointer">
                        <HomeIcon />
                        Início
                      </Link>
                      <Link href="/orders" className="flex w-full gap-3 transition-all duration-200 hover:scale-105 hover:text-primary cursor-pointer">
                        <TruckIcon />
                        Meus Pedidos
                      </Link>
                    </div>
                  </div>

                  <h4 className="py-3 font-light">
                    <span className="font-semibold">NEWVIBE</span> - Estilo que
                    fala por você.
                  </h4>
                  <Separator />

                  <div className="mb-5 mt-6">
                    {" "}
                    <Button
                      variant="outline"
                      size="icon"
                      className="transition-all duration-200 hover:scale-105 cursor-pointer"
                      onClick={() => {
                        try {
                          logout();
                        } catch (error) {
                          console.error("Erro ao fazer logout:", error);
                        }
                      }}
                    >
                      <LogOutIcon />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Olá. Faça seu login!</h2>
                  <Button size="icon" asChild variant="outline" className="transition-all duration-200 hover:scale-105 cursor-pointer">
                    <Link href="/login">
                      <LogInIcon />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export const Header = () => {
  return <HeaderContent />;
};
