"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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

const formSchema = z
  .object({
    name: z.string("Nome inválido").trim().min(3, "Nome inválido!"),
    email: z.email("E-mail inválido!"),
    password: z.string("Senha inválida!").min(8, "Senha inválida!"),
    passwordConfirmation: z.string("Senha inválida!").min(8, "Senha inválida!"),
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

type FormValues = z.infer<typeof formSchema>;

const SignUpForm = () => {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: FormValues) {
    await authClient.signUp.email({
      name: values.name, // required
      email: values.email, // required
      password: values.password, // required
      fetchOptions: {
        onSuccess: () => {
          toast.success("Conta criada com sucesso!");
          router.push("/");
        },
        onError: (error) => {
          if (error.error.code === "USER_ALREADY_EXISTS") {
            toast.error("E-mail já cadastrado.");
          }
          form.setError("email", { message: "E-mail já cadastrado." });
        },
      },
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Criar Conta</CardTitle>
          <CardDescription>Crie uma conta para continuar.</CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite seu Nome"
                        type="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
                name="passwordConfirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Digite a sua senha novamente</FormLabel>
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
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full transition-all duration-300 ease-in-out hover:scale-125 cursor-pointer">
                Criar Conta
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
};

export default SignUpForm;
