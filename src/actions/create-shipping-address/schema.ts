import { z } from "zod";

export const createShippingAddressSchema = z.object({
  email: z.email("E-mail inválido"),
  firstName: z
    .string()
    .min(2, "Primeiro nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  document: z
    .string()
    .min(11, "CPF/CNPJ inválido")
    .max(18, "CPF/CNPJ inválido"),
  phone: z.string().min(1, "Celular é obrigatório"),
  cep: z.string().min(8, "CEP inválido").max(9, "CEP inválido"),
  address: z.string().min(5, "Endereço deve ter pelo menos 5 caracteres"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro deve ter pelo menos 2 caracteres"),
  city: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres"),
  state: z
    .string()
    .min(2, "Estado deve ter pelo menos 2 caracteres")
    .max(2, "Estado deve ter 2 caracteres"),
});

export type CreateShippingAddressSchema = z.infer<
  typeof createShippingAddressSchema
>;
