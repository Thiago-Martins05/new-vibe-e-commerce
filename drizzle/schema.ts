import { pgTable, text, timestamp, foreignKey, unique, uuid, integer, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const category = pgTable("category", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("category_slug_unique").on(table.slug),
]);

export const product = pgTable("product", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	categoryId: uuid("category_id").notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [category.id],
			name: "product_category_id_category_id_fk"
		}).onDelete("set null"),
	unique("product_slug_unique").on(table.slug),
]);

export const productVariant = pgTable("product_variant", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	color: text().notNull(),
	priceInCents: integer("price_in_cents").notNull(),
	imageUrl: text("image_url").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [product.id],
			name: "product_variant_product_id_product_id_fk"
		}).onDelete("cascade"),
	unique("product_variant_slug_unique").on(table.slug),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const shippingAddress = pgTable("shipping_address", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
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
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "shipping_address_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const cart = pgTable("cart", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	shippingAddressId: uuid("shipping_address_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "cart_user_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.shippingAddressId],
			foreignColumns: [shippingAddress.id],
			name: "cart_shipping_address_id_shipping_address_id_fk"
		}).onDelete("set null"),
]);

export const cartItem = pgTable("cart_item", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	cartId: uuid("cart_id").notNull(),
	productVariantId: uuid("product_variant_id").notNull(),
	quantity: integer().default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.cartId],
			foreignColumns: [cart.id],
			name: "cart_item_cart_id_cart_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.productVariantId],
			foreignColumns: [productVariant.id],
			name: "cart_item_product_variant_id_product_variant_id_fk"
		}).onDelete("cascade"),
]);
