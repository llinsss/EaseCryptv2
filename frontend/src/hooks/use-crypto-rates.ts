import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface CryptoRate {
  priceNgn: number;
  lastUpdated: string;
}

interface CryptoRates {
  BTC: CryptoRate;
  ETH: CryptoRate;
  USDC: CryptoRate;
}

export function useCryptoRates() {
  const { toast } = useToast();

  return useQuery<CryptoRates>({
    queryKey: ["/api/rates"],
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useQuote() {
  return {
    getQuote: async (tokenSymbol: string, amountNgn: number) => {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokenSymbol,
          amountNgn: amountNgn * 100, // Convert to kobo
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get quote");
      }

      return response.json();
    },
  };
}

export function formatCurrency(amount: number, currency = "NGN"): string {
  if (currency === "NGN") {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  }
  
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 6,
    maximumFractionDigits: 8,
  }).format(amount);
}

export function formatCryptoAmount(amount: string | number, symbol: string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (symbol === "USDC") {
    return numAmount.toFixed(2);
  } else if (symbol === "ETH") {
    return numAmount.toFixed(6);
  } else if (symbol === "BTC") {
    return numAmount.toFixed(8);
  }
  
  return numAmount.toString();
}
