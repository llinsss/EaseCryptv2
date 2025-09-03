// Starknet address validation
export function isValidStarknetAddress(address: string): boolean {
  // Basic Starknet address validation
  return /^0x[a-fA-F0-9]{64}$/.test(address);
}

// Format Starknet address for display
export function formatStarknetAddress(address: string): string {
  if (!address) return "";
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Amount validation
export function validateAmount(amount: number): { isValid: boolean; error?: string } {
  if (isNaN(amount) || amount <= 0) {
    return { isValid: false, error: "Amount must be a positive number" };
  }
  
  if (amount < 1000) {
    return { isValid: false, error: "Minimum amount is ₦1,000" };
  }
  
  if (amount > 500000) {
    return { isValid: false, error: "Maximum amount is ₦500,000" };
  }
  
  return { isValid: true };
}

// Calculate crypto amount from NGN
export function calculateCryptoAmount(amountNgn: number, rateNgn: number): number {
  if (rateNgn <= 0) return 0;
  return amountNgn / rateNgn;
}

// Calculate fees
export function calculateFees(amountNgn: number): {
  serviceFee: number;
  networkFee: number;
  totalFees: number;
  totalCost: number;
} {
  const serviceFee = Math.floor(amountNgn * 0.01); // 1%
  const networkFee = 50; // Fixed ₦50
  const totalFees = serviceFee + networkFee;
  const totalCost = amountNgn + totalFees;
  
  return {
    serviceFee,
    networkFee,
    totalFees,
    totalCost,
  };
}

// Generate transaction reference
export function generateTransactionRef(): string {
  return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
}

// Local storage helpers for transaction history
export function saveTransactionToHistory(transaction: any) {
  try {
    const history = getTransactionHistory();
    history.unshift({
      ...transaction,
      timestamp: new Date().toISOString(),
    });
    
    // Keep only last 50 transactions
    const limitedHistory = history.slice(0, 50);
    localStorage.setItem("crypto_transaction_history", JSON.stringify(limitedHistory));
  } catch (error) {
    console.error("Failed to save transaction to history:", error);
  }
}

export function getTransactionHistory(): any[] {
  try {
    const history = localStorage.getItem("crypto_transaction_history");
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Failed to get transaction history:", error);
    return [];
  }
}

export function clearTransactionHistory() {
  try {
    localStorage.removeItem("crypto_transaction_history");
  } catch (error) {
    console.error("Failed to clear transaction history:", error);
  }
}

// Copy to clipboard helper
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      textArea.remove();
      return successful;
    }
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

// Format date for display
export function formatTransactionDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// QR Code generation (mock implementation)
export function generateQRCodeURL(data: string): string {
  // In production, use a proper QR code library or service
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
}
