import { useContext } from "react";
import { TelegramContext } from "@/components/telegram-provider";

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider');
  }
  return context;
}
