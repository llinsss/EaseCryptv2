import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { CryptoIcon } from "@/components/ui/crypto-icon";
import { useToast } from "@/hooks/use-toast";
import { useTelegram } from "@/hooks/use-telegram";
import { useCryptoRates, formatCurrency, formatCryptoAmount } from "@/hooks/use-crypto-rates";
import { 
  isValidStarknetAddress, 
  validateAmount, 
  calculateCryptoAmount, 
  calculateFees,
  copyToClipboard,
  formatTransactionDate,
  saveTransactionToHistory
} from "@/lib/crypto";
import { hapticFeedback, showTelegramAlert } from "@/lib/telegram";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  QrCode, 
  Copy, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Download,
  Share,
  Headphones,
  Plus,
  Gift,
  ExternalLink,
  Loader2
} from "lucide-react";

type PageType = "input" | "summary" | "payment" | "loading" | "success";

type TokenSymbol = "BTC" | "ETH" | "USDC";

interface TransactionData {
  tokenSymbol: TokenSymbol;
  amountNgn: number;
  walletAddress: string;
  email?: string;
  cryptoAmount: number;
  exchangeRate: number;
  serviceFee: number;
  networkFee: number;
  totalCost: number;
  transactionId?: string;
  sessionId?: string;
  virtualAccountNumber?: string;
  bankName?: string;
  accountName?: string;
  expiresAt?: Date;
  transactionHash?: string;
}

export default function CryptoBuyApp() {
  const [currentPage, setCurrentPage] = useState<PageType>("input");
  const [transactionData, setTransactionData] = useState<TransactionData>({
    tokenSymbol: "BTC",
    amountNgn: 0,
    walletAddress: "",
    email: "",
    cryptoAmount: 0,
    exchangeRate: 0,
    serviceFee: 0,
    networkFee: 0,
    totalCost: 0,
  });

  const { webApp, isReady } = useTelegram();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: rates, isLoading: ratesLoading, error: ratesError } = useCryptoRates();

  // Page navigation
  const navigateToPage = (page: PageType) => {
    hapticFeedback("impact", "light");
    setCurrentPage(page);
  };

  // Get quote mutation
  const getQuoteMutation = useMutation({
    mutationFn: async (data: { tokenSymbol: TokenSymbol; amountNgn: number }) => {
      const response = await apiRequest("POST", "/api/quote", {
        tokenSymbol: data.tokenSymbol,
        amountNgn: data.amountNgn * 100, // Convert to kobo
      });
      return response.json();
    },
    onSuccess: (data) => {
      setTransactionData(prev => ({
        ...prev,
        cryptoAmount: parseFloat(data.cryptoAmount),
        exchangeRate: data.exchangeRate,
        serviceFee: data.serviceFee,
        networkFee: data.networkFee,
        totalCost: data.totalCost,
      }));
      navigateToPage("summary");
    },
    onError: (error: any) => {
      toast({
        title: "Quote Failed",
        description: error.message || "Failed to get quote. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (data: TransactionData) => {
      const response = await apiRequest("POST", "/api/transactions", {
        tokenSymbol: data.tokenSymbol,
        amountNgn: data.amountNgn * 100, // Convert to kobo
        walletAddress: data.walletAddress,
        email: data.email,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setTransactionData(prev => ({
        ...prev,
        transactionId: data.transactionId,
        sessionId: data.sessionId,
        virtualAccountNumber: data.virtualAccountNumber,
        bankName: data.bankName,
        accountName: data.accountName,
        expiresAt: new Date(data.expiresAt),
      }));
      navigateToPage("payment");
    },
    onError: (error: any) => {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to create transaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Confirm payment mutation
  const confirmPaymentMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await apiRequest("POST", `/api/transactions/${transactionId}/confirm`);
      return response.json();
    },
    onSuccess: () => {
      navigateToPage("loading");
      // Start polling for transaction status
      setTimeout(() => {
        checkTransactionStatus();
      }, 3000);
    },
    onError: (error: any) => {
      toast({
        title: "Payment Confirmation Failed",
        description: error.message || "Failed to confirm payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Check transaction status
  const checkTransactionStatus = async () => {
    if (!transactionData.transactionId) return;

    try {
      const response = await apiRequest("GET", `/api/transactions/${transactionData.transactionId}/status`);
      const data = await response.json();

      if (data.status === "confirmed") {
        setTransactionData(prev => ({
          ...prev,
          transactionHash: data.transactionHash,
        }));
        
        // Save to local history
        saveTransactionToHistory({
          ...transactionData,
          transactionHash: data.transactionHash,
          status: "confirmed",
        });
        
        hapticFeedback("notification", "success");
        navigateToPage("success");
      } else if (data.status === "failed") {
        toast({
          title: "Transaction Failed",
          description: "Payment could not be processed. Please contact support.",
          variant: "destructive",
        });
        navigateToPage("input");
      } else {
        // Continue polling
        setTimeout(checkTransactionStatus, 5000);
      }
    } catch (error) {
      console.error("Status check failed:", error);
      setTimeout(checkTransactionStatus, 5000);
    }
  };

  // Calculate crypto amount when rates or amount changes
  useEffect(() => {
    if (rates && transactionData.amountNgn > 0) {
      const rate = rates[transactionData.tokenSymbol]?.priceNgn;
      if (rate) {
        const crypto = calculateCryptoAmount(transactionData.amountNgn, rate);
        setTransactionData(prev => ({
          ...prev,
          cryptoAmount: crypto,
          exchangeRate: rate,
        }));
      }
    }
  }, [rates, transactionData.amountNgn, transactionData.tokenSymbol]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading CryptoEase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-bottom">
      {/* Input Page */}
      {currentPage === "input" && (
        <InputPage
          rates={rates}
          ratesLoading={ratesLoading}
          ratesError={ratesError}
          transactionData={transactionData}
          setTransactionData={setTransactionData}
          onGetQuote={() => getQuoteMutation.mutate({
            tokenSymbol: transactionData.tokenSymbol,
            amountNgn: transactionData.amountNgn,
          })}
          isLoading={getQuoteMutation.isPending}
        />
      )}

      {/* Summary Page */}
      {currentPage === "summary" && (
        <SummaryPage
          transactionData={transactionData}
          onBack={() => navigateToPage("input")}
          onContinue={() => createTransactionMutation.mutate(transactionData)}
          isLoading={createTransactionMutation.isPending}
        />
      )}

      {/* Payment Page */}
      {currentPage === "payment" && (
        <PaymentPage
          transactionData={transactionData}
          onBack={() => navigateToPage("summary")}
          onPaymentConfirm={() => {
            if (transactionData.transactionId) {
              confirmPaymentMutation.mutate(transactionData.transactionId);
            }
          }}
          isLoading={confirmPaymentMutation.isPending}
        />
      )}

      {/* Loading Page */}
      {currentPage === "loading" && (
        <LoadingPage transactionData={transactionData} />
      )}

      {/* Success Page */}
      {currentPage === "success" && (
        <SuccessPage
          transactionData={transactionData}
          onNewTransaction={() => {
            setTransactionData({
              tokenSymbol: "BTC",
              amountNgn: 0,
              walletAddress: "",
              email: "",
              cryptoAmount: 0,
              exchangeRate: 0,
              serviceFee: 0,
              networkFee: 0,
              totalCost: 0,
            });
            navigateToPage("input");
          }}
        />
      )}
    </div>
  );
}

// Input Page Component
function InputPage({ 
  rates, 
  ratesLoading, 
  ratesError, 
  transactionData, 
  setTransactionData, 
  onGetQuote, 
  isLoading 
}: any) {
  const { toast } = useToast();

  const handleTokenChange = (token: TokenSymbol) => {
    hapticFeedback("selection");
    setTransactionData((prev: any) => ({
      ...prev,
      tokenSymbol: token,
    }));
  };

  const handleAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    setTransactionData((prev: any) => ({
      ...prev,
      amountNgn: amount,
    }));
  };

  const handleGetQuote = () => {
    // Validate inputs
    const amountValidation = validateAmount(transactionData.amountNgn);
    if (!amountValidation.isValid) {
      toast({
        title: "Invalid Amount",
        description: amountValidation.error,
        variant: "destructive",
      });
      return;
    }

    if (!transactionData.walletAddress.trim()) {
      toast({
        title: "Invalid Wallet Address",
        description: "Please enter a valid wallet address",
        variant: "destructive",
      });
      return;
    }

    hapticFeedback("impact", "medium");
    onGetQuote();
  };

  const currentRate = rates?.[transactionData.tokenSymbol]?.priceNgn;

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="px-4 py-6 text-center bg-gradient-to-br from-primary to-accent text-primary-foreground">
        <div className="flex items-center justify-center mb-2">
          <i className="fas fa-bitcoin-sign text-2xl mr-2"></i>
          <h1 className="text-2xl font-bold">CryptoEase</h1>
        </div>
        <h2 className="text-lg font-semibold mb-1">Buy Crypto Easily</h2>
        <p className="text-sm opacity-90">Purchase cryptocurrency with fiat currency. No account needed.</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Rate Error Alert */}
        {ratesError && (
          <Alert variant="destructive" data-testid="rates-error">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load current rates. Using cached rates.
            </AlertDescription>
          </Alert>
        )}

        {/* Token Selection */}
        <Card data-testid="token-selection-card">
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-3 block">Select Token</Label>
            <Select
              value={transactionData.tokenSymbol}
              onValueChange={handleTokenChange}
              data-testid="token-select"
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
              <span>Current Rate</span>
              <span data-testid="current-rate" className="font-medium">
                {ratesLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : currentRate ? (
                  `${formatCurrency(currentRate)} / ${transactionData.tokenSymbol}`
                ) : (
                  "Rate unavailable"
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Amount Input */}
        <Card data-testid="amount-input-card">
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-3 block">Amount to Send (NGN)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground font-medium">₦</span>
              <Input
                type="number"
                placeholder="1,000"
                className="pl-8"
                min="1000"
                max="500000"
                value={transactionData.amountNgn || ""}
                onChange={(e) => handleAmountChange(e.target.value)}
                data-testid="amount-input"
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Min: ₦1,000</span>
              <span>Max: ₦500,000</span>
            </div>
            <div data-testid="crypto-amount" className="mt-2 text-sm text-accent font-medium">
              ≈ {formatCryptoAmount(transactionData.cryptoAmount, transactionData.tokenSymbol)} {transactionData.tokenSymbol}
            </div>
          </CardContent>
        </Card>

        {/* Wallet Address */}
        <Card data-testid="wallet-address-card">
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-3 block">Your Wallet Address</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="0x..."
                className="flex-1"
                value={transactionData.walletAddress}
                onChange={(e) => setTransactionData((prev: any) => ({
                  ...prev,
                  walletAddress: e.target.value,
                }))}
                data-testid="wallet-input"
              />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                data-testid="qr-scan-button"
                onClick={() => {
                  hapticFeedback("impact", "light");
                  toast({
                    title: "QR Scanner",
                    description: "QR scanning will be available soon",
                  });
                }}
              >
                <QrCode className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email (Optional) */}
        <Card data-testid="email-card">
          <CardContent className="p-4">
            <Label className="text-sm font-medium mb-3 block">Email Address (Optional)</Label>
            <Input
              type="email"
              placeholder="example@email.com"
              value={transactionData.email}
              onChange={(e) => setTransactionData((prev: any) => ({
                ...prev,
                email: e.target.value,
              }))}
              data-testid="email-input"
            />
            <p className="text-xs text-muted-foreground mt-2">For transaction receipts and updates</p>
          </CardContent>
        </Card>

        {/* Warning */}
        <Alert data-testid="warning-alert">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium">Important Notice</p>
            <p className="text-xs mt-1">Double-check your wallet address. Funds sent to wrong addresses cannot be recovered.</p>
          </AlertDescription>
        </Alert>

        {/* Get Quote Button */}
        <Button
          className="w-full telegram-button"
          onClick={handleGetQuote}
          disabled={isLoading || !transactionData.amountNgn || !transactionData.walletAddress}
          data-testid="get-quote-button"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Getting Quote...
            </>
          ) : (
            "GET QUOTE"
          )}
        </Button>
      </div>
    </div>
  );
}

// Summary Page Component
function SummaryPage({ transactionData, onBack, onContinue, isLoading }: any) {
  const fees = calculateFees(transactionData.amountNgn);

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card border-b border-border">
        <Button variant="ghost" size="icon" onClick={onBack} data-testid="back-button">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold">Transaction Summary</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-6">
        {/* Transaction Overview */}
        <Card data-testid="transaction-overview">
          <CardContent className="p-4">
            <div className="text-center mb-4">
              <CryptoIcon symbol={transactionData.tokenSymbol} size="lg" className="mx-auto mb-2" />
              <h3 className="font-semibold text-lg">{transactionData.tokenSymbol} Purchase</h3>
              <p className="text-sm text-muted-foreground">You're buying {transactionData.tokenSymbol} with NGN</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">You Send</span>
                <span className="font-semibold" data-testid="summary-amount">
                  {formatCurrency(transactionData.amountNgn)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">You Receive</span>
                <span className="font-semibold text-accent" data-testid="summary-receive">
                  ≈ {formatCryptoAmount(transactionData.cryptoAmount, transactionData.tokenSymbol)} {transactionData.tokenSymbol}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Details */}
        <Card data-testid="rate-details">
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Rate Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Exchange Rate</span>
                <span data-testid="summary-rate">
                  1 {transactionData.tokenSymbol} = {formatCurrency(transactionData.exchangeRate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network Fee</span>
                <span>{formatCurrency(fees.networkFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Fee (1%)</span>
                <span data-testid="service-fee">{formatCurrency(fees.serviceFee)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total Cost</span>
                <span data-testid="total-cost">{formatCurrency(fees.totalCost)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rate Notice */}
        <Alert data-testid="rate-notice">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium">Rate Protection</p>
            <p className="mt-1">This rate is guaranteed for 10 minutes after payment initiation.</p>
          </AlertDescription>
        </Alert>

        {/* Wallet Address Confirmation */}
        <Card data-testid="wallet-confirmation">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Receiving Address</h4>
            <div className="bg-muted rounded p-3 text-sm font-mono break-all" data-testid="confirm-wallet">
              {transactionData.walletAddress}
            </div>
          </CardContent>
        </Card>

        {/* Continue Button */}
        <Button
          className="w-full telegram-button"
          onClick={onContinue}
          disabled={isLoading}
          data-testid="continue-payment-button"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Transaction...
            </>
          ) : (
            "Continue to Payment"
          )}
        </Button>
      </div>
    </div>
  );
}

// Payment Page Component
function PaymentPage({ transactionData, onBack, onPaymentConfirm, isLoading }: any) {
  const { toast } = useToast();

  const handleCopyAccount = async () => {
    if (transactionData.virtualAccountNumber) {
      const success = await copyToClipboard(transactionData.virtualAccountNumber);
      if (success) {
        hapticFeedback("notification", "success");
        toast({
          title: "Copied!",
          description: "Account number copied to clipboard",
        });
      }
    }
  };

  const handleCopyDetails = async () => {
    const details = `Account Number: ${transactionData.virtualAccountNumber}\nBank: ${transactionData.bankName}\nAccount Name: ${transactionData.accountName}\nAmount: ${formatCurrency(transactionData.totalCost)}`;
    const success = await copyToClipboard(details);
    if (success) {
      hapticFeedback("notification", "success");
      toast({
        title: "Copied!",
        description: "Payment details copied to clipboard",
      });
    }
  };

  const handleTimeout = () => {
    toast({
      title: "Payment Expired",
      description: "Payment time has expired. Please start a new transaction.",
      variant: "destructive",
    });
    // Navigate back to input after a delay
    setTimeout(() => onBack(), 2000);
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Header with Timer */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-primary-foreground/80">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Payment Details</h1>
          <div className="w-10"></div>
        </div>
        <div className="text-center">
          <div className="text-sm opacity-80">Time Remaining</div>
          <CountdownTimer
            initialTime={600} // 10 minutes
            onExpired={handleTimeout}
            data-testid="payment-countdown"
          />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Virtual Account Details */}
        <Card data-testid="payment-details-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-university text-primary"></i>
              Bank Transfer Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Account Number</Label>
              <div className="flex items-center justify-between bg-muted rounded-lg p-3 mt-1">
                <span className="font-mono text-lg font-semibold" data-testid="account-number">
                  {transactionData.virtualAccountNumber}
                </span>
                <Button variant="ghost" size="sm" onClick={handleCopyAccount} data-testid="copy-account-button">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Bank Name</Label>
              <div className="bg-muted rounded-lg p-3 mt-1">
                <span className="font-semibold">{transactionData.bankName}</span>
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Account Name</Label>
              <div className="bg-muted rounded-lg p-3 mt-1">
                <span className="font-semibold">{transactionData.accountName}</span>
              </div>
            </div>

            <div>
              <Label className="text-sm text-muted-foreground">Amount to Transfer</Label>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mt-1">
                <span className="font-bold text-lg text-accent" data-testid="payment-amount">
                  {formatCurrency(transactionData.totalCost)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card data-testid="payment-instructions">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">How to Pay</h4>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                <div className="flex-1">
                  <p className="text-sm">Open your banking app or dial <strong>*737#</strong></p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                <div className="flex-1">
                  <p className="text-sm">Transfer the <strong>exact amount</strong> shown above</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                <div className="flex-1">
                  <p className="text-sm">Use the account number: <strong>{transactionData.virtualAccountNumber}</strong></p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">4</div>
                <div className="flex-1">
                  <p className="text-sm">Click <strong>"I've Made the Payment"</strong> below</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warning */}
        <Alert variant="destructive" data-testid="payment-warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium">Important</p>
            <p className="mt-1">Transfer the exact amount within the time limit. Partial payments will be refunded.</p>
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full telegram-button"
            onClick={onPaymentConfirm}
            disabled={isLoading}
            data-testid="payment-confirm-button"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                I've Made the Payment
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleCopyDetails}
            data-testid="copy-details-button"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Account Details
          </Button>
        </div>

        {/* Support */}
        <div className="text-center">
          <Button variant="ghost" className="text-primary text-sm" data-testid="support-button">
            <Headphones className="w-4 h-4 mr-1" />
            Need Help? Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}

// Loading Page Component
function LoadingPage({ transactionData }: any) {
  return (
    <div className="max-w-md mx-auto h-screen flex items-center justify-center">
      <div className="text-center p-8" data-testid="loading-page">
        <div className="mb-6">
          <div className="spinner mx-auto mb-4"></div>
          <div className="pulse-animation">
            <h2 className="text-xl font-semibold mb-2">Confirming Payment...</h2>
            <p className="text-muted-foreground">This usually takes 1-2 minutes</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span className="text-sm">Verifying bank transfer</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 bg-muted rounded-full"></div>
              <span className="text-sm text-muted-foreground">Processing crypto transfer</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-muted rounded-full"></div>
              <span className="text-sm text-muted-foreground">Sending to your wallet</span>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-xs text-muted-foreground" data-testid="transaction-id">
          Transaction ID: #{transactionData.transactionId?.slice(-8)}
        </div>
      </div>
    </div>
  );
}

// Success Page Component
function SuccessPage({ transactionData, onNewTransaction }: any) {
  const { toast } = useToast();

  const handleDownloadReceipt = () => {
    toast({
      title: "Download Started",
      description: "Receipt PDF will be available soon",
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: "CryptoEase Transaction",
      text: `Successfully purchased ${formatCryptoAmount(transactionData.cryptoAmount, transactionData.tokenSymbol)} ${transactionData.tokenSymbol} for ${formatCurrency(transactionData.totalCost)}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        hapticFeedback("notification", "success");
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback
      const success = await copyToClipboard(shareData.text);
      if (success) {
        toast({
          title: "Copied!",
          description: "Transaction details copied to clipboard",
        });
      }
    }
  };

  return (
    <div className="max-w-md mx-auto" data-testid="success-page">
      {/* Success Header */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Transaction Complete!</h1>
        <p className="text-green-100">Your crypto has been sent successfully</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Success Summary */}
        <Card data-testid="success-summary">
          <CardContent className="p-4">
            <div className="text-center mb-4">
              <CryptoIcon symbol={transactionData.tokenSymbol} size="lg" className="mx-auto mb-2" />
              <h3 className="font-semibold text-lg">Payment Successful!</h3>
              <p className="text-accent text-xl font-bold mt-1" data-testid="success-amount">
                {formatCryptoAmount(transactionData.cryptoAmount, transactionData.tokenSymbol)} {transactionData.tokenSymbol}
              </p>
              <p className="text-sm text-muted-foreground">has been sent to your wallet</p>
            </div>
          </CardContent>
        </Card>

        {/* Receipt Details */}
        <Card data-testid="receipt-details">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-receipt text-primary"></i>
              Transaction Receipt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono" data-testid="receipt-transaction-id">
                #{transactionData.transactionId?.slice(-8)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-semibold">{formatCurrency(transactionData.totalCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Crypto Received</span>
              <span className="font-semibold text-accent">
                {formatCryptoAmount(transactionData.cryptoAmount, transactionData.tokenSymbol)} {transactionData.tokenSymbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Exchange Rate</span>
              <span>{formatCurrency(transactionData.exchangeRate)}/{transactionData.tokenSymbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date & Time</span>
              <span data-testid="transaction-date">{formatTransactionDate(new Date())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network</span>
              <span>Starknet</span>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Address */}
        <Card data-testid="wallet-details">
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Sent to Wallet</h4>
            <div className="bg-muted rounded p-3 text-sm font-mono break-all">
              {transactionData.walletAddress}
            </div>
            {transactionData.transactionHash && (
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <ExternalLink className="w-3 h-3" />
                <a href="#" className="text-primary" data-testid="view-transaction-link">
                  View on Starkscan
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full telegram-button"
            onClick={handleDownloadReceipt}
            data-testid="download-receipt-button"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF Receipt
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleShare}
              data-testid="share-button"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              data-testid="support-button"
            >
              <Headphones className="w-4 h-4 mr-2" />
              Support
            </Button>
          </div>

          <Button
            className="w-full telegram-button"
            onClick={onNewTransaction}
            data-testid="new-transaction-button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Start New Transaction
          </Button>
        </div>

        {/* Referral Banner */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200" data-testid="referral-banner">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Gift className="text-purple-500 w-5 h-5" />
              <div className="flex-1">
                <p className="font-medium text-sm">Earn 50% Fee Discount</p>
                <p className="text-xs text-muted-foreground">Refer friends and get discounted trading fees</p>
              </div>
              <Button variant="ghost" size="sm" className="text-primary" data-testid="referral-share-button">
                Share →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
