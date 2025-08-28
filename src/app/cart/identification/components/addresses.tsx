"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { NumericFormat, PatternFormat } from "react-number-format";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { formatCentsToBRL } from "@/helpers/money";
import { useShippingAddresses } from "@/hooks/queries/use-shipping-addresses";

const addressSchema = z.object({
  recipientName: z.string().min(1, "Nome do destinatário é obrigatório"),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  zipCode: z
    .string()
    .min(1, "CEP é obrigatório")
    .regex(/^\d{5}-\d{3}$/, "CEP deve estar no formato 00000-000"),
  country: z.string().min(1, "País é obrigatório"),
  phone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .regex(
      /^\(\d{2}\) \d{5}-\d{4}$/,
      "Telefone deve estar no formato (11) 99999-9999",
    ),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email deve estar no formato válido (ex: usuario@email.com)"),
  cpfOrCnpj: z
    .string()
    .min(1, "CPF é obrigatório")
    .regex(
      /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
      "CPF deve estar no formato 000.000.000-00",
    ),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressesProps {
  cart: {
    id: string;
    userId: string;
    items: Array<{
      id: string;
      productVariantId: string;
      quantity: number;
      productVariant: {
        id: string;
        name: string;
        priceInCents: number;
        imageUrl: string;
        product: {
          id: string;
          name: string;
        };
      };
      createdAt: string;
    }>;
    totalPriceInCents: number;
    createdAt: string;
  };
}

const Addresses = ({ cart }: AddressesProps) => {
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [showForm, setShowForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    data: addresses,
    isLoading: isLoadingAddresses,
    refetch,
  } = useShippingAddresses();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  const onSubmit = async (data: AddressFormData) => {
    try {
      const isEditing = editingAddressId !== null;
      const url = isEditing
        ? `/api/shipping-addresses/${editingAddressId}`
        : "/api/shipping-addresses";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: data.recipientName,
          street: data.street,
          number: data.number,
          complement: data.complement,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          phone: data.phone,
          email: data.email,
          cpfOrCnpj: data.cpfOrCnpj,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao criar endereço");
      }

      const addressData = await response.json();

      toast({
        title: isEditing
          ? "Endereço atualizado com sucesso!"
          : "Endereço criado com sucesso!",
        description: isEditing
          ? "O endereço foi atualizado na sua conta."
          : "O endereço foi adicionado à sua conta.",
      });

      setShowForm(false);
      setEditingAddressId(null);
      reset();
      refetch(); // Recarregar lista de endereços

      // Selecionar automaticamente o endereço criado/atualizado
      if (!isEditing) {
        setSelectedAddressId(addressData.id);
      }
    } catch (error) {
      toast({
        title: "Erro ao criar endereço",
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
  };

  const handleContinue = async () => {
    if (!selectedAddressId) {
      toast({
        title: "Selecione um endereço",
        description: "Você precisa selecionar um endereço para continuar.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Salvar endereço selecionado no carrinho
      const response = await fetch("/api/cart/shipping-address", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          shippingAddressId: selectedAddressId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao salvar endereço");
      }

      // Salvar endereço selecionado no localStorage também
      localStorage.setItem("selectedAddressId", selectedAddressId);

      toast({
        title: "Endereço salvo com sucesso!",
        description: "Redirecionando para pagamento...",
      });

      // Navegar para a página de pagamento
      router.push("/cart/payment");
    } catch (error) {
      toast({
        title: "Erro ao salvar endereço",
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleEditAddress = (addressId: string) => {
    setEditingAddressId(addressId);
    setShowForm(true);

    // Preencher o formulário com os dados do endereço
    const address = addresses?.find(
      (addr: {
        id: string;
        recipientName: string;
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        phone: string;
        email: string;
        cpfOrCnpj: string;
      }) => addr.id === addressId,
    );
    if (address) {
      setValue("recipientName", address.recipientName);
      setValue("street", address.street);
      setValue("number", address.number);
      setValue("complement", address.complement || "");
      setValue("neighborhood", address.neighborhood);
      setValue("zipCode", address.zipCode);
      setValue("city", address.city);
      setValue("state", address.state);
      setValue("country", address.country);
      setValue("phone", address.phone);
      setValue("email", address.email);
      setValue("cpfOrCnpj", address.cpfOrCnpj);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    setAddressToDelete(addressId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;

    setIsDeleting(addressToDelete);

    try {
      const response = await fetch(
        `/api/shipping-addresses/${addressToDelete}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao excluir endereço");
      }

      toast({
        title: "Endereço excluído com sucesso!",
        description: "O endereço foi removido da sua conta.",
      });

      // Se o endereço excluído era o selecionado, limpar seleção
      if (selectedAddressId === addressToDelete) {
        setSelectedAddressId(null);
      }

      refetch(); // Recarregar lista de endereços
    } catch (error) {
      toast({
        title: "Erro ao excluir endereço",
        description:
          error instanceof Error
            ? error.message
            : "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
      setAddressToDelete(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingAddressId(null);
    setShowForm(false);
    reset();
  };

  return (
    <div className="space-y-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
      {/* Formulário de Endereços */}
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Identificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600">
            Selecione um endereço de entrega ou adicione um novo.
          </p>

          <div className="space-y-6">
            {/* Endereços existentes */}
            {!isLoadingAddresses && addresses && addresses.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Endereços salvos</h3>
                {addresses.map(
                  (address: {
                    id: string;
                    recipientName: string;
                    street: string;
                    number: string;
                    complement?: string;
                    neighborhood: string;
                    city: string;
                    state: string;
                    zipCode: string;
                  }) => (
                    <div
                      key={address.id}
                      className={`rounded-lg border p-4 transition-colors ${
                        selectedAddressId === address.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className="flex-1 cursor-pointer rounded-md p-3 transition-colors hover:bg-gray-50"
                          onClick={() => handleAddressSelect(address.id)}
                        >
                          <p className="font-medium">{address.recipientName}</p>
                          <p className="text-sm text-gray-600">
                            {address.street}, {address.number}
                            {address.complement && ` - ${address.complement}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.neighborhood}, {address.city} -{" "}
                            {address.state}
                          </p>
                          <p className="text-sm text-gray-600">
                            CEP: {address.zipCode}
                          </p>
                        </div>
                        <div className="ml-2 flex items-center space-x-2">
                          {selectedAddressId === address.id && (
                            <div className="text-primary">✓</div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address.id);
                            }}
                            className="h-8 w-8 p-0 hover-zoom-button cursor-pointer transition-colors hover:bg-blue-50 hover:text-blue-600"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(address.id);
                            }}
                            disabled={isDeleting === address.id}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8 p-0 hover-zoom-button cursor-pointer transition-colors"
                          >
                            {isDeleting === address.id ? (
                              <svg
                                className="h-4 w-4 animate-spin"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            {/* Botão adicionar novo endereço */}
            {!showForm && (
              <Button
                variant="outline"
                onClick={() => setShowForm(true)}
                className="w-full py-3 hover-zoom-button cursor-pointer transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                + Adicionar novo endereço
              </Button>
            )}

            {/* Formulário de novo endereço */}
            {showForm && (
              <div className="rounded-lg border p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-medium">
                    {editingAddressId ? "Editar endereço" : "Novo endereço"}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="hover-zoom-button cursor-pointer transition-colors hover:bg-gray-100"
                  >
                    Cancelar
                  </Button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="recipientName">
                      Nome do destinatário *
                    </Label>
                    <Input
                      id="recipientName"
                      {...register("recipientName")}
                      placeholder="Nome completo"
                    />
                    {errors.recipientName && (
                      <p className="text-destructive mt-1 text-sm">
                        {errors.recipientName.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="street">Rua *</Label>
                      <Input
                        id="street"
                        {...register("street")}
                        placeholder="Nome da rua"
                      />
                      {errors.street && (
                        <p className="text-destructive mt-1 text-sm">
                          {errors.street.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="number">Número *</Label>
                      <Input
                        id="number"
                        {...register("number")}
                        placeholder="123"
                      />
                      {errors.number && (
                        <p className="text-destructive mt-1 text-sm">
                          {errors.number.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      {...register("complement")}
                      placeholder="Apartamento, bloco, etc."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="neighborhood">Bairro *</Label>
                      <Input
                        id="neighborhood"
                        {...register("neighborhood")}
                        placeholder="Nome do bairro"
                      />
                      {errors.neighborhood && (
                        <p className="text-destructive mt-1 text-sm">
                          {errors.neighborhood.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="zipCode">CEP *</Label>
                      <PatternFormat
                        customInput={Input}
                        format="#####-###"
                        placeholder="00000-000"
                        mask="_"
                        allowEmptyFormatting={false}
                        onValueChange={(values) => {
                          setValue("zipCode", values.formattedValue);
                        }}
                      />
                      {errors.zipCode && (
                        <p className="text-destructive mt-1 text-sm">
                          {errors.zipCode.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        {...register("city")}
                        placeholder="Nome da cidade"
                      />
                      {errors.city && (
                        <p className="text-destructive mt-1 text-sm">
                          {errors.city.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="state">Estado *</Label>
                      <Input
                        id="state"
                        {...register("state")}
                        placeholder="SP"
                      />
                      {errors.state && (
                        <p className="text-destructive mt-1 text-sm">
                          {errors.state.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="country">País *</Label>
                    <Input
                      id="country"
                      {...register("country")}
                      placeholder="Brasil"
                      defaultValue="Brasil"
                    />
                    {errors.country && (
                      <p className="text-destructive mt-1 text-sm">
                        {errors.country.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Telefone *</Label>
                      <PatternFormat
                        customInput={Input}
                        format="(##) #####-####"
                        placeholder="(11) 99999-9999"
                        mask="_"
                        allowEmptyFormatting={false}
                        onValueChange={(values) => {
                          setValue("phone", values.formattedValue);
                        }}
                      />
                      {errors.phone && (
                        <p className="text-destructive mt-1 text-sm">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="seu@email.com"
                      />
                      {errors.email && (
                        <p className="text-destructive mt-1 text-sm">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cpfOrCnpj">CPF *</Label>
                    <PatternFormat
                      customInput={Input}
                      format="###.###.###-##"
                      placeholder="000.000.000-00"
                      mask="_"
                      allowEmptyFormatting={false}
                      onValueChange={(values) => {
                        setValue("cpfOrCnpj", values.formattedValue);
                      }}
                    />
                    {errors.cpfOrCnpj && (
                      <p className="text-destructive mt-1 text-sm">
                        {errors.cpfOrCnpj.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="hover:bg-primary/90 w-full hover-zoom-button cursor-pointer transition-colors"
                  >
                    {isSubmitting
                      ? editingAddressId
                        ? "Atualizando..."
                        : "Salvando..."
                      : editingAddressId
                        ? "Atualizar endereço"
                        : "Salvar endereço"}
                  </Button>
                </form>
              </div>
            )}

            {/* Mensagem quando não há endereços */}
            {!isLoadingAddresses &&
              (!addresses || addresses.length === 0) &&
              !showForm && (
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-gray-600">
                    Nenhum endereço encontrado. Adicione um novo endereço para
                    continuar.
                  </p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Resumo do Pedido */}
      <Card className="h-fit w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Resumo do Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {/* Itens do Carrinho */}
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-200">
                      <img
                        src={item.productVariant.imageUrl}
                        alt={item.productVariant.product.name}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {item.productVariant.product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.productVariant.name} - Qtd: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium">
                    {formatCentsToBRL(
                      item.productVariant.priceInCents * item.quantity,
                    )}
                  </p>
                </div>
              ))}
            </div>

            {/* Totais */}
            <div className="space-y-3 border-t pt-6">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCentsToBRL(cart.totalPriceInCents)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Entrega:</span>
                <span>GRÁTIS</span>
              </div>
              <div className="flex justify-between border-t pt-3 text-lg font-bold">
                <span>Total:</span>
                <span>{formatCentsToBRL(cart.totalPriceInCents)}</span>
              </div>
            </div>

            {/* Botão Continuar */}
            <Button
              className="hover:bg-primary/90 w-full hover-zoom-button cursor-pointer transition-colors"
              size="lg"
              onClick={handleContinue}
              disabled={!selectedAddressId}
            >
              {selectedAddressId
                ? "Continuar para pagamento"
                : "Selecione um endereço para continuar"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir endereço"
        description="Tem certeza que deseja excluir este endereço? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={confirmDeleteAddress}
        variant="destructive"
      />
    </div>
  );
};

export default Addresses;
