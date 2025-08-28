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
          <TabsList>
            <TabsTrigger value="sign-in">Entrar</TabsTrigger>
            <TabsTrigger value="sign-up">Criar Conta</TabsTrigger>
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
