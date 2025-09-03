import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tokenSymbol: text("token_symbol").notNull(), // BTC, ETH, USDC
  amountNgn: integer("amount_ngn").notNull(), // Amount in NGN kobo
  cryptoAmount: text("crypto_amount").notNull(), // Crypto amount as string for precision
  walletAddress: text("wallet_address").notNull(),
  email: text("email"),
  exchangeRate: integer("exchange_rate").notNull(), // Rate in NGN kobo
  serviceFee: integer("service_fee").notNull(),
  networkFee: integer("network_fee").notNull(),
  totalCost: integer("total_cost").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, confirmed, failed
  paymentReference: text("payment_reference"),
  virtualAccountNumber: text("virtual_account_number"),
  transactionHash: text("transaction_hash"), // Starknet transaction hash
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata"), // Additional payment gateway data
});

export const cryptoRates = pgTable("crypto_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  symbol: text("symbol").notNull().unique(), // BTC, ETH, USDC
  priceNgn: integer("price_ngn").notNull(), // Price in NGN kobo
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const paymentSessions = pgTable("payment_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionId: varchar("transaction_id").references(() => transactions.id),
  sessionData: jsonb("session_data").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCryptoRateSchema = createInsertSchema(cryptoRates).omit({
  id: true,
  lastUpdated: true,
});

export const insertPaymentSessionSchema = createInsertSchema(paymentSessions).omit({
  id: true,
  createdAt: true,
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type CryptoRate = typeof cryptoRates.$inferSelect;
export type InsertCryptoRate = z.infer<typeof insertCryptoRateSchema>;
export type PaymentSession = typeof paymentSessions.$inferSelect;
export type InsertPaymentSession = z.infer<typeof insertPaymentSessionSchema>;

// Validation schemas for API endpoints
export const createTransactionSchema = z.object({
  tokenSymbol: z.enum(["BTC", "ETH", "USDC"]),
  amountNgn: z.number().min(100000).max(50000000), // ₦1,000 to ₦500,000 in kobo
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid Starknet address"),
  email: z.string().email().optional(),
});

export const getQuoteSchema = z.object({
  tokenSymbol: z.enum(["BTC", "ETH", "USDC"]),
  amountNgn: z.number().min(100000).max(50000000),
});

export const confirmPaymentSchema = z.object({
  transactionId: z.string().uuid(),
  paymentReference: z.string(),
});
