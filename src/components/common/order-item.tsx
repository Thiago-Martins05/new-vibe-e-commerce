import Image from "next/image";

import { formatCentsToBRL } from "@/helpers/money";

interface OrderItemProps {
  productName: string;
  productVariantName: string;
  color: string;
  size: string;
  quantity: number;
  priceInCents: number;
  imageUrl: string;
}

const OrderItem = ({
  productName,
  productVariantName,
  color,
  size,
  quantity,
  priceInCents,
  imageUrl,
}: OrderItemProps) => {
  return (
    <div className="flex items-center space-x-3 p-3">
      <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-gray-200">
        <Image
          src={imageUrl}
          alt={productName}
          width={64}
          height={64}
          className="h-full w-full rounded-lg object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">
          {productName}
        </p>
        <p className="truncate text-sm text-gray-600">{productVariantName}</p>
        <p className="text-sm text-gray-500">
          {color} | {size} | {quantity}
        </p>
        <p className="text-sm font-medium text-gray-900">
          {formatCentsToBRL(priceInCents)}
        </p>
      </div>
    </div>
  );
};

export default OrderItem;
