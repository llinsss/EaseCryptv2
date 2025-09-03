import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { initTelegram, type TelegramWebApp } from "@/lib/telegram";

interface TelegramContextType {
  webApp: TelegramWebApp | null;
  isReady: boolean;
  user: any;
  themeParams: any;
}

export const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  isReady: false,
  user: null,
  themeParams: null,
});

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState(null);
  const [themeParams, setThemeParams] = useState(null);

  useEffect(() => {
    const tg = initTelegram();
    
    if (tg) {
      setWebApp(tg);
      setUser(tg.initDataUnsafe?.user || null);
      setThemeParams(tg.themeParams || null);
      
      // Apply theme
      if (tg.colorScheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      // Apply Telegram theme colors
      if (tg.themeParams) {
        const root = document.documentElement;
        root.style.setProperty('--tg-bg-color', tg.themeParams.bg_color || '#ffffff');
        root.style.setProperty('--tg-text-color', tg.themeParams.text_color || '#000000');
        root.style.setProperty('--tg-hint-color', tg.themeParams.hint_color || '#999999');
        root.style.setProperty('--tg-link-color', tg.themeParams.link_color || '#0088cc');
        root.style.setProperty('--tg-button-color', tg.themeParams.button_color || '#0088cc');
        root.style.setProperty('--tg-button-text-color', tg.themeParams.button_text_color || '#ffffff');
      }
      
      // Ready the app
      tg.ready();
      tg.expand();
      tg.enableClosingConfirmation();
      
      setIsReady(true);
    } else {
      // Not in Telegram, still allow the app to work
      setIsReady(true);
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ webApp, isReady, user, themeParams }}>
      {children}
    </TelegramContext.Provider>
  );
}

export const useTelegram = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error('useTelegram must be used within TelegramProvider');
  }
  return context;
};
