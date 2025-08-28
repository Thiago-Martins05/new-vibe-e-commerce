import { relations } from "drizzle-orm";
import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import {
  accountTable,
  sessionTable,
  userTable,
  verification,
} from "@/lib/auth-schema";

//Tabela de categorias
export const categoryTable = pgTable("category", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tabela de produtos
export const productTable = pgTable("product", {
  id: uuid().primaryKey().defaultRandom(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categoryTable.id, { onDelete: "set null" }),
  name: text().notNull(),
  slug: text().notNull().unique(),
  description: text().notNull(),
  // priceInCents: integer("price_in_cents").notNull(), -> deixa o preço soment em variantTable pois cada variação do produto pode ter um preço diferente.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tabela de variantes dos produtos
export const productVariantTable = pgTable("product_variant", {
  id: uuid().primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => productTable.id, { onDelete: "cascade" }),
  name: text().notNull(),
  slug: text().notNull().unique(),
  color: text().notNull(),
  priceInCents: integer("price_in_cents").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

//Tabela de endereço do usuário para o carrinho

export const shippingAddressTable = pgTable("shipping_address", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  recipientName: text().notNull(),
  street: text().notNull(),
  number: text().notNull(),
  complement: text(),
  city: text().notNull(),
  state: text().notNull(),
  neighborhood: text().notNull(),
  zipCode: text().notNull(),
  country: text().notNull(),
  phone: text().notNull(),
  email: text().notNull(),
  cpfOrCnpj: text().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

//Tabela de carrinho, um carrinho pertence sempre a um usuário e um carrinho vai ter pelo menos um endereço de entrega
export const cartTable = pgTable("cart", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  shippingAddressId: uuid("shipping_address_id").references(
    () => shippingAddressTable.id,
    { onDelete: "set null" },
  ),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

//Tabela de item do carrinho, um item do carrinho vai ter um id, e ele vai ter um productVariantId, e tambem vai ter uma quantidade com default 1
export const cartItemTable = pgTable("cart_item", {
  id: uuid().primaryKey().defaultRandom(),
  cartId: uuid("cart_id")
    .notNull()
    .references(() => cartTable.id, { onDelete: "cascade" }),
  productVariantId: uuid("product_variant_id")
    .notNull()
    .references(() => productVariantTable.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relação de categorias, 1 categoria pode ter varios produtos.
export const categoryRelations = relations(categoryTable, ({ many }) => ({
  products: many(productTable),
}));

// Relação de produtos, 1 produto tem apenas 1 categoria, onde o categoryId do productTable refencia o id do categoryTable
export const productRelations = relations(productTable, ({ one, many }) => ({
  category: one(categoryTable, {
    fields: [productTable.categoryId],
    references: [categoryTable.id],
  }),
  variants: many(productVariantTable),
}));

// Relação de variantes de produtos,uma variante de produto possui um produto, e o campo productId da tabela de variantes referencia o campo id da tabela de produtos.
export const productVariantRelations = relations(
  productVariantTable,
  ({ one }) => ({
    product: one(productTable, {
      fields: [productVariantTable.productId],
      references: [productTable.id],
    }),
  }),
);

//relação da tabela de endereço com usuario, um endereço pode ter apenas um usuario
export const shippingAddressRelations = relations(
  shippingAddressTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [shippingAddressTable.userId],
      references: [userTable.id],
    }),
  }),
);

//relação de usuario com endereço, um usuario pode ter mais de um endereço
export const userRelations = relations(userTable, ({ many }) => ({
  shippingAddress: many(shippingAddressTable),
}));

//relação do carrinho com o usuario e o endereço de entrega, um carrinho pertence a um usuário e precisa de pelo menos um endereço, e um carrinho vai ter varios itens
export const cartRelations = relations(cartTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [cartTable.userId],
    references: [userTable.id],
  }),
  shippingAddress: one(shippingAddressTable, {
    fields: [cartTable.shippingAddressId],
    references: [shippingAddressTable.id],
  }),
  items: many(cartItemTable),
}));

//relação dos itens do carrinho, cada item vai pertencer a um carrinho, e cada item vai ter um id de variante
export const cartItemRelations = relations(cartItemTable, ({ one }) => ({
  cart: one(cartTable, {
    fields: [cartItemTable.cartId],
    references: [cartTable.id],
  }),
  productVariant: one(productVariantTable, {
    fields: [cartItemTable.productVariantId],
    references: [productVariantTable.id],
  }),
}));

//Tabela de pedidos
export const orderTable = pgTable("order", {
  id: uuid().primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id, { onDelete: "cascade" }),
  shippingAddressId: uuid("shipping_address_id")
    .notNull()
    .references(() => shippingAddressTable.id, { onDelete: "cascade" }),
  totalAmountInCents: integer("total_amount_in_cents").notNull(),
  status: text("status").notNull().default("pending"), // pending, paid, shipped, delivered, cancelled
  stripeSessionId: text("stripe_session_id"),
  orderNumber: text("order_number").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

//Tabela de itens do pedido
export const orderItemTable = pgTable("order_item", {
  id: uuid().primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orderTable.id, { onDelete: "cascade" }),
  productVariantId: uuid("product_variant_id")
    .notNull()
    .references(() => productVariantTable.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  priceInCents: integer("price_in_cents").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

//relação de pedidos com usuário e endereço
export const orderRelations = relations(orderTable, ({ one, many }) => ({
  user: one(userTable, {
    fields: [orderTable.userId],
    references: [userTable.id],
  }),
  shippingAddress: one(shippingAddressTable, {
    fields: [orderTable.shippingAddressId],
    references: [shippingAddressTable.id],
  }),
  items: many(orderItemTable),
}));

//relação dos itens do pedido
export const orderItemRelations = relations(orderItemTable, ({ one }) => ({
  order: one(orderTable, {
    fields: [orderItemTable.orderId],
    references: [orderTable.id],
  }),
  productVariant: one(productVariantTable, {
    fields: [orderItemTable.productVariantId],
    references: [productVariantTable.id],
  }),
}));

//Quando criar uma chave estrangeira na tabela, precisa criar uma relations para ela.

// Exportar todas as tabelas e relações
export const schema = {
  userTable,
  sessionTable,
  accountTable,
  verification,
  categoryTable,
  productTable,
  productVariantTable,
  shippingAddressTable,
  cartTable,
  cartItemTable,
  orderTable,
  orderItemTable,
  // Relações
  userRelations,
  categoryRelations,
  productRelations,
  productVariantRelations,
  shippingAddressRelations,
  cartRelations,
  cartItemRelations,
  orderRelations,
  orderItemRelations,
};
