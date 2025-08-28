import { Header } from "@/components/common/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import SignInForm from "./components/sign-in-form";
import SignUpForm from "./components/sign-up-form";

// Configurações para evitar pre-render
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const Authentication = async () => {
  return (
    <>
      <Header />
      <div className="m-auto flex w-full flex-col gap-6 p-5 md:m-auto md:w-[80%]">
        <Tabs defaultValue="sign-in">
          <TabsList className="transition-all duration-200">
            <TabsTrigger value="sign-in" className="transition-all duration-200 hover:scale-105 cursor-pointer">Entrar</TabsTrigger>
            <TabsTrigger value="sign-up" className="transition-all duration-200 hover:scale-105 cursor-pointer">Criar Conta</TabsTrigger>
          </TabsList>
          <TabsContent value="sign-in">
            <SignInForm />
          </TabsContent>

          <TabsContent value="sign-up">
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Authentication;
