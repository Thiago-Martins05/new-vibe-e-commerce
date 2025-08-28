"use client";

import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCentsToBRL } from "@/helpers/money";

import OrderItem from "./order-item";

interface OrderItem {
  id: string;
  productName: string;
  productVariantName: string;
  color: string;
  size: string;
  quantity: number;
  priceInCents: number;
  imageUrl: string;
}

interface OrderCardProps {
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  estimatedTax: number;
  total: number;
}

const OrderCard = ({
  orderNumber,
  items,
  subtotal,
  shippingCost,
  total,
}: OrderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <Button
          variant="ghost"
          className="h-auto w-full justify-between p-0"
          onClick={toggleExpanded}
        >
          <span className="text-lg font-medium">
            Número do Pedido #{orderNumber}
          </span>
          {isExpanded ? (
            <ChevronUpIcon className="h-5 w-5 text-purple-600" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-purple-600" />
          )}
        </Button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          {/* Lista de itens */}
          <div className="mb-6 space-y-2">
            {items.map((item) => (
              <OrderItem
                key={item.id}
                productName={item.productName}
                productVariantName={item.productVariantName}
                color={item.color}
                size={item.size}
                quantity={item.quantity}
                priceInCents={item.priceInCents}
                imageUrl={item.imageUrl}
              />
            ))}
          </div>

          {/* Resumo do pedido */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCentsToBRL(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Transporte e Manuseio</span>
              <span className="text-green-600">
                {shippingCost === 0 ? "Grátis" : formatCentsToBRL(shippingCost)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taxa Estimada</span>
              <span>—</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{formatCentsToBRL(total)}</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default OrderCard;
