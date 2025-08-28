export const formatCentsToBRL = (cents: number) => {
  return new Intl.NumberFormat("pt-br", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
};
