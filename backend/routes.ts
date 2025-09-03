import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  createTransactionSchema, 
  getQuoteSchema, 
  confirmPaymentSchema,
  type InsertTransaction 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current crypto rates
  app.get("/api/rates", async (req, res) => {
    try {
      // Update rates from CoinGecko API
      await updateRatesFromAPI();
      
      const rates = await storage.getAllCryptoRates();
      const ratesData = rates.reduce((acc, rate) => {
        acc[rate.symbol] = {
          priceNgn: rate.priceNgn / 100, // Convert from kobo to naira
          lastUpdated: rate.lastUpdated,
        };
        return acc;
      }, {} as Record<string, any>);
      
      res.json(ratesData);
    } catch (error) {
      console.error("Error fetching rates:", error);
      res.status(500).json({ message: "Failed to fetch rates" });
    }
  });

  // Get quote for a transaction
  app.post("/api/quote", async (req, res) => {
    try {
      const { tokenSymbol, amountNgn } = getQuoteSchema.parse(req.body);
      
      const rate = await storage.getCryptoRate(tokenSymbol);
      if (!rate) {
        return res.status(404).json({ message: "Rate not found" });
      }
      
      const serviceFee = Math.floor(amountNgn * 0.01); // 1% service fee
      const networkFee = 5000; // ₦50 in kobo
      const totalCost = amountNgn + serviceFee + networkFee;
      
      const cryptoAmount = (amountNgn / rate.priceNgn * 100000000).toString(); // Convert to smallest unit
      
      res.json({
        tokenSymbol,
        amountNgn: amountNgn / 100, // Convert to naira for display
        cryptoAmount,
        exchangeRate: rate.priceNgn / 100,
        serviceFee: serviceFee / 100,
        networkFee: networkFee / 100,
        totalCost: totalCost / 100,
        rateValidUntil: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.errors });
      }
      console.error("Error creating quote:", error);
      res.status(500).json({ message: "Failed to create quote" });
    }
  });

  // Create transaction and payment session
  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = createTransactionSchema.parse(req.body);
      
      const rate = await storage.getCryptoRate(validatedData.tokenSymbol);
      if (!rate) {
        return res.status(404).json({ message: "Rate not found" });
      }
      
      const serviceFee = Math.floor(validatedData.amountNgn * 0.01);
      const networkFee = 5000;
      const totalCost = validatedData.amountNgn + serviceFee + networkFee;
      
      const cryptoAmount = (validatedData.amountNgn / rate.priceNgn * 100000000).toString();
      
      const transactionData: InsertTransaction = {
        tokenSymbol: validatedData.tokenSymbol,
        amountNgn: validatedData.amountNgn,
        cryptoAmount,
        walletAddress: validatedData.walletAddress,
        email: validatedData.email,
        exchangeRate: rate.priceNgn,
        serviceFee,
        networkFee,
        totalCost,
        paymentStatus: "pending",
        virtualAccountNumber: generateVirtualAccountNumber(),
        metadata: null,
      };
      
      const transaction = await storage.createTransaction(transactionData);
      
      // Create payment session
      const paymentSession = await storage.createPaymentSession({
        transactionId: transaction.id,
        sessionData: {
          virtualAccount: transaction.virtualAccountNumber,
          amount: totalCost,
          currency: "NGN",
        },
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        isActive: true,
      });
      
      res.json({
        transactionId: transaction.id,
        sessionId: paymentSession.id,
        virtualAccountNumber: transaction.virtualAccountNumber,
        amount: totalCost / 100,
        expiresAt: paymentSession.expiresAt,
        bankName: "Providus Bank",
        accountName: "EaseCrypt Payments",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request", errors: error.errors });
      }
      console.error("Error creating transaction:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  // Check payment status
  app.get("/api/transactions/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const transaction = await storage.getTransaction(id);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json({
        transactionId: transaction.id,
        status: transaction.paymentStatus,
        cryptoAmount: transaction.cryptoAmount,
        transactionHash: transaction.transactionHash,
        updatedAt: transaction.updatedAt,
      });
    } catch (error) {
      console.error("Error checking payment status:", error);
      res.status(500).json({ message: "Failed to check payment status" });
    }
  });

  // Webhook for payment confirmation (Flutterwave/Paystack)
  app.post("/api/webhook/payment", async (req, res) => {
    try {
      // In production, verify webhook signature
      const { reference, status, amount } = req.body;
      
      // Find transaction by payment reference
      // Note: This is a simplified implementation for mock testing
      // In production, you would search by reference in the database
      console.log(`Looking for transaction with reference: ${reference}`);
      
      // For now, just acknowledge the webhook
      res.json({ message: "Webhook received" });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Confirm payment manually (for testing)
  app.post("/api/transactions/:id/confirm", async (req, res) => {
    try {
      const { id } = req.params;
      const transaction = await storage.getTransaction(id);
      
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Simulate payment confirmation
      await storage.updateTransaction(id, {
        paymentStatus: "paid",
        paymentReference: `REF-${Date.now()}`,
      });
      
      // Simulate Starknet transfer
      setTimeout(async () => {
        await storage.updateTransaction(id, {
          paymentStatus: "confirmed",
          transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        });
      }, 2000);
      
      res.json({ message: "Payment confirmed" });
    } catch (error) {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Failed to confirm payment" });
    }
  });

  // Get transaction history for wallet
  app.get("/api/history/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const transactions = await storage.getTransactionsByWallet(walletAddress);
      
      const history = transactions.map(tx => ({
        id: tx.id,
        tokenSymbol: tx.tokenSymbol,
        amountNgn: tx.amountNgn / 100,
        cryptoAmount: tx.cryptoAmount,
        status: tx.paymentStatus,
        createdAt: tx.createdAt,
        transactionHash: tx.transactionHash,
      }));
      
      res.json(history);
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ message: "Failed to fetch history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions
async function updateRatesFromAPI() {
  try {
    const COINGECKO_API = process.env.COINGECKO_API_KEY || "CG-demo-api-key";
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,usd-coin,starknet&vs_currencies=ngn&x_cg_demo_api_key=${COINGECKO_API}`
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const updates = [
      { symbol: "BTC", priceNgn: Math.floor(data.bitcoin?.ngn * 100) },
      { symbol: "ETH", priceNgn: Math.floor(data.ethereum?.ngn * 100) },
      { symbol: "USDC", priceNgn: Math.floor(data["usd-coin"]?.ngn * 100) },
      { symbol: "STRK", priceNgn: Math.floor(data.starknet?.ngn * 100) },
    ];
    
    for (const update of updates) {
      if (update.priceNgn) {
        await storage.updateCryptoRate(update);
      }
    }
  } catch (error) {
    console.error("Failed to update rates from CoinGecko:", error);
    // Continue with cached rates
  }
}

function generateVirtualAccountNumber(): string {
  // Generate a 10-digit virtual account number
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

async function initiateStarknetTransfer(transaction: any) {
  try {
    // In production, use Starknet.js to send tokens
    const STARKNET_PRIVATE_KEY = process.env.STARKNET_PRIVATE_KEY || "0x123...";
    const STARKNET_RPC_URL = process.env.STARKNET_RPC_URL || "https://starknet-mainnet.public.blastapi.io";
    
    // Simulate Starknet transaction
    console.log(`Initiating Starknet transfer for transaction ${transaction.id}`);
    console.log(`Sending ${transaction.cryptoAmount} ${transaction.tokenSymbol} to ${transaction.walletAddress}`);
    
    // This would be implemented with Starknet.js in production
    const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    
    setTimeout(async () => {
      await storage.updateTransaction(transaction.id, {
        paymentStatus: "confirmed",
        transactionHash: mockTxHash,
      });
    }, 3000);
    
  } catch (error) {
    console.error("Starknet transfer failed:", error);
    await storage.updateTransaction(transaction.id, {
      paymentStatus: "failed",
      metadata: { error: (error as Error).message },
    });
  }
}
