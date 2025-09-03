import { 
  type Transaction, 
  type InsertTransaction, 
  type CryptoRate, 
  type InsertCryptoRate,
  type PaymentSession,
  type InsertPaymentSession 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Transactions
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined>;
  getTransactionsByWallet(walletAddress: string): Promise<Transaction[]>;
  
  // Crypto Rates
  getCryptoRate(symbol: string): Promise<CryptoRate | undefined>;
  updateCryptoRate(rate: InsertCryptoRate): Promise<CryptoRate>;
  getAllCryptoRates(): Promise<CryptoRate[]>;
  
  // Payment Sessions
  createPaymentSession(session: InsertPaymentSession): Promise<PaymentSession>;
  getPaymentSession(id: string): Promise<PaymentSession | undefined>;
  updatePaymentSession(id: string, updates: Partial<PaymentSession>): Promise<PaymentSession | undefined>;
  cleanupExpiredSessions(): Promise<void>;
}

export class MemStorage implements IStorage {
  private transactions: Map<string, Transaction>;
  private cryptoRates: Map<string, CryptoRate>;
  private paymentSessions: Map<string, PaymentSession>;

  constructor() {
    this.transactions = new Map();
    this.cryptoRates = new Map();
    this.paymentSessions = new Map();
    
    // Initialize default crypto rates (will be updated from API)
    this.initializeDefaultRates();
  }

  private initializeDefaultRates() {
    const defaultRates = [
      { symbol: "BTC", priceNgn: 9542000000 }, // ₦95,420,000 in kobo
      { symbol: "ETH", priceNgn: 528000000 },  // ₦5,280,000 in kobo
      { symbol: "USDC", priceNgn: 165000 },    // ₦1,650 in kobo
      { symbol: "STRK", priceNgn: 120000 },    // ₦1,200 in kobo
    ];

    defaultRates.forEach(rate => {
      const id = randomUUID();
      const cryptoRate: CryptoRate = {
        id,
        symbol: rate.symbol,
        priceNgn: rate.priceNgn,
        lastUpdated: new Date(),
      };
      this.cryptoRates.set(rate.symbol, cryptoRate);
    });
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      email: insertTransaction.email || null,
      virtualAccountNumber: insertTransaction.virtualAccountNumber || null,
      paymentReference: insertTransaction.paymentReference || null,
      transactionHash: insertTransaction.transactionHash || null,
      metadata: insertTransaction.metadata || null,
      paymentStatus: insertTransaction.paymentStatus || "pending",
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;
    
    const updated = { ...transaction, ...updates, updatedAt: new Date() };
    this.transactions.set(id, updated);
    return updated;
  }

  async getTransactionsByWallet(walletAddress: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(tx => tx.walletAddress === walletAddress)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getCryptoRate(symbol: string): Promise<CryptoRate | undefined> {
    return this.cryptoRates.get(symbol);
  }

  async updateCryptoRate(rate: InsertCryptoRate): Promise<CryptoRate> {
    const existing = this.cryptoRates.get(rate.symbol);
    const id = existing?.id || randomUUID();
    
    const cryptoRate: CryptoRate = {
      id,
      symbol: rate.symbol,
      priceNgn: rate.priceNgn,
      lastUpdated: new Date(),
    };
    
    this.cryptoRates.set(rate.symbol, cryptoRate);
    return cryptoRate;
  }

  async getAllCryptoRates(): Promise<CryptoRate[]> {
    return Array.from(this.cryptoRates.values());
  }

  async createPaymentSession(insertSession: InsertPaymentSession): Promise<PaymentSession> {
    const id = randomUUID();
    const session: PaymentSession = {
      ...insertSession,
      transactionId: insertSession.transactionId || null,
      isActive: insertSession.isActive || null,
      id,
      createdAt: new Date(),
    };
    this.paymentSessions.set(id, session);
    return session;
  }

  async getPaymentSession(id: string): Promise<PaymentSession | undefined> {
    return this.paymentSessions.get(id);
  }

  async updatePaymentSession(id: string, updates: Partial<PaymentSession>): Promise<PaymentSession | undefined> {
    const session = this.paymentSessions.get(id);
    if (!session) return undefined;
    
    const updated = { ...session, ...updates };
    this.paymentSessions.set(id, updated);
    return updated;
  }

  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    const expiredKeys: string[] = [];
    this.paymentSessions.forEach((session, id) => {
      if (session.expiresAt < now) {
        expiredKeys.push(id);
      }
    });
    expiredKeys.forEach(id => this.paymentSessions.delete(id));
  }
}

export const storage = new MemStorage();
