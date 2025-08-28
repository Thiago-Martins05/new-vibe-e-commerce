"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useNextAuth } from "@/hooks/use-nextauth";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido!"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres!"),
});

const signUpSchema = z
  .object({
    name: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres!"),
    email: z.string().email("E-mail inválido!"),
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres!"),
    passwordConfirmation: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres!"),
  })
  .refine(
    (data) => {
      return data.password === data.passwordConfirmation;
    },
    {
      error: "As senhas não coincidem.",
      path: ["passwordConfirmation"],
    },
  );

type LoginFormValues = z.infer<typeof loginSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, refreshUser } = useAuth();
  const { signInWithGoogle } = useNextAuth();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await login(values.email, values.password);

      if (result.success) {
        toast.success("Login realizado com sucesso!");
        router.push("/");
      } else {
        toast.error(result.error || "Erro no login. Tente novamente.");
        loginForm.setError("email", {
          message: result.error || "Erro no login",
        });
      }
    } catch (error) {
      toast.error("Erro no login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (values: SignUpFormValues) => {
    setIsLoading(true);
    try {
      console.log("Dados do formulário:", values);

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Conta criada com sucesso!");
        // Atualizar o contexto de autenticação
        await refreshUser();
        router.push("/");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Erro ao criar conta");
        if (errorData.message === "Email já cadastrado") {
          signUpForm.setError("email", {
            message: "E-mail já cadastrado.",
          });
        }
      }
    } catch (error) {
      console.error("Erro no cadastro:", error);
      toast.error("Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();

      if (result.success) {
        toast.success("Login com Google realizado com sucesso!");
        router.push("/");
      } else {
        toast.error(result.error || "Erro no login com Google");
      }
    } catch (error) {
      toast.error("Erro no login com Google. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Resetar formulários
    loginForm.reset();
    signUpForm.reset();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            NEWVIBE
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin
              ? "Entre com suas credenciais para continuar"
              : "Crie sua conta para começar"}
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isLogin ? "Entrar" : "Criar Conta"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Faça login para continuar"
                : "Crie uma conta para continuar"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {isLogin ? (
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(handleLogin)}
                  className="space-y-4"
                >
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite seu email"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite sua senha"
                            type="password"
                            autoComplete="current-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full transition-all duration-200 hover:scale-105 cursor-pointer" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="text-muted-foreground bg-white px-2">
                        Ou continue com
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full transition-all duration-200 hover:scale-105 cursor-pointer"
                    disabled={isLoading}
                    onClick={handleGoogleSignIn}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    {isLoading ? "Entrando..." : "Entrar com Google"}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <Form {...signUpForm}>
                  <form
                    onSubmit={signUpForm.handleSubmit(handleSignUp)}
                    className="space-y-4"
                  >
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Nome
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Digite seu nome"
                        className="focus:ring-primary focus:border-primary w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2"
                        {...signUpForm.register("name")}
                      />
                      {signUpForm.formState.errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {signUpForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="signup-email"
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Email
                      </label>
                      <input
                        id="signup-email"
                        type="email"
                        placeholder="Digite seu email"
                        className="focus:ring-primary focus:border-primary w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2"
                        {...signUpForm.register("email")}
                      />
                      {signUpForm.formState.errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {signUpForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <FormField
                      control={signUpForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite sua senha"
                              type="password"
                              autoComplete="new-password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={signUpForm.control}
                      name="passwordConfirmation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Senha</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite sua senha novamente"
                              type="password"
                              autoComplete="new-password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full transition-all duration-200 hover:scale-105 cursor-pointer"
                      disabled={isLoading}
                    >
                      {isLoading ? "Criando conta..." : "Criar Conta"}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="text-muted-foreground bg-white px-2">
                          Ou continue com
                        </span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full transition-all duration-200 hover:scale-105 cursor-pointer"
                      disabled={isLoading}
                      onClick={handleGoogleSignIn}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      {isLoading ? "Entrando..." : "Entrar com Google"}
                    </Button>
                  </form>
                </Form>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
              </p>
              <Button
                type="button"
                variant="link"
                className="p-0 text-sm transition-all duration-200 hover:scale-105 cursor-pointer"
                onClick={toggleMode}
              >
                {isLogin ? "Criar conta" : "Fazer login"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
