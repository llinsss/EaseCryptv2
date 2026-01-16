import { cn } from "@/lib/utils";

interface CryptoIconProps {
  symbol: "BTC" | "ETH" | "USDC";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CryptoIcon({ symbol, size = "md", className }: CryptoIconProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const iconContent = {
    BTC: "₿",
    ETH: "Ξ",
    USDC: "USDC",
  };

  return (
    <div
      className={cn(
        "crypto-icon rounded-full flex items-center justify-center text-white font-semibold",
        `crypto-icon-${symbol.toLowerCase()}`,
        sizeClasses[size],
        className
      )}
      data-testid={`crypto-icon-${symbol.toLowerCase()}`}
    >
      {symbol === "USDC" ? (
        <span className="text-xs font-bold">{symbol}</span>
      ) : (
        <span>{iconContent[symbol]}</span>
      )}
    </div>
  );
}
