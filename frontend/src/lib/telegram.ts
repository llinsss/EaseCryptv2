declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: any;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  
  // Methods
  ready(): void;
  expand(): void;
  close(): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  showAlert(message: string, callback?: () => void): void;
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void;
  showPopup(params: any, callback?: (buttonId: string) => void): void;
  
  // Haptic feedback
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
  
  // Cloud storage
  CloudStorage: {
    setItem(key: string, value: string, callback?: (error: string | null, success: boolean) => void): void;
    getItem(key: string, callback: (error: string | null, value: string | null) => void): void;
    getItems(keys: string[], callback: (error: string | null, values: Record<string, string>) => void): void;
    removeItem(key: string, callback?: (error: string | null, success: boolean) => void): void;
    removeItems(keys: string[], callback?: (error: string | null, success: boolean) => void): void;
    getKeys(callback: (error: string | null, keys: string[]) => void): void;
  };
  
  // Main button
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isProgressVisible: boolean;
    isActive: boolean;
    
    setText(text: string): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive?: boolean): void;
    hideProgress(): void;
  };
  
  // Back button
  BackButton: {
    isVisible: boolean;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
  };
  
  // Events
  onEvent(eventType: string, eventHandler: () => void): void;
  offEvent(eventType: string, eventHandler: () => void): void;
}

export function initTelegram(): TelegramWebApp | null {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  
  // Mock for development/testing
  if (typeof window !== 'undefined' && !window.Telegram) {
    console.warn('Telegram WebApp not available, using mock implementation');
    return createMockTelegramWebApp();
  }
  
  return null;
}

function createMockTelegramWebApp(): TelegramWebApp {
  return {
    initData: '',
    initDataUnsafe: {},
    version: '6.0',
    platform: 'web',
    colorScheme: 'light',
    themeParams: {
      bg_color: '#ffffff',
      text_color: '#000000',
      hint_color: '#999999',
      link_color: '#0088cc',
      button_color: '#0088cc',
      button_text_color: '#ffffff',
    },
    isExpanded: false,
    viewportHeight: window.innerHeight,
    viewportStableHeight: window.innerHeight,
    headerColor: '#ffffff',
    backgroundColor: '#ffffff',
    isClosingConfirmationEnabled: false,
    
    ready: () => {},
    expand: () => {},
    close: () => {},
    enableClosingConfirmation: () => {},
    disableClosingConfirmation: () => {},
    showAlert: (message: string, callback?: () => void) => {
      alert(message);
      callback?.();
    },
    showConfirm: (message: string, callback?: (confirmed: boolean) => void) => {
      const result = confirm(message);
      callback?.(result);
    },
    showPopup: (params: any, callback?: (buttonId: string) => void) => {
      alert(params.message || 'Popup');
      callback?.('ok');
    },
    
    HapticFeedback: {
      impactOccurred: () => {},
      notificationOccurred: () => {},
      selectionChanged: () => {},
    },
    
    CloudStorage: {
      setItem: (key: string, value: string, callback?: (error: string | null, success: boolean) => void) => {
        try {
          localStorage.setItem(`tg_${key}`, value);
          callback?.(null, true);
        } catch (error) {
          callback?.(error as string, false);
        }
      },
      getItem: (key: string, callback: (error: string | null, value: string | null) => void) => {
        try {
          const value = localStorage.getItem(`tg_${key}`);
          callback(null, value);
        } catch (error) {
          callback(error as string, null);
        }
      },
      getItems: (keys: string[], callback: (error: string | null, values: Record<string, string>) => void) => {
        try {
          const values: Record<string, string> = {};
          keys.forEach(key => {
            const value = localStorage.getItem(`tg_${key}`);
            if (value) values[key] = value;
          });
          callback(null, values);
        } catch (error) {
          callback(error as string, {});
        }
      },
      removeItem: (key: string, callback?: (error: string | null, success: boolean) => void) => {
        try {
          localStorage.removeItem(`tg_${key}`);
          callback?.(null, true);
        } catch (error) {
          callback?.(error as string, false);
        }
      },
      removeItems: (keys: string[], callback?: (error: string | null, success: boolean) => void) => {
        try {
          keys.forEach(key => localStorage.removeItem(`tg_${key}`));
          callback?.(null, true);
        } catch (error) {
          callback?.(error as string, false);
        }
      },
      getKeys: (callback: (error: string | null, keys: string[]) => void) => {
        try {
          const keys = Object.keys(localStorage).filter(key => key.startsWith('tg_')).map(key => key.substring(3));
          callback(null, keys);
        } catch (error) {
          callback(error as string, []);
        }
      },
    },
    
    MainButton: {
      text: '',
      color: '#0088cc',
      textColor: '#ffffff',
      isVisible: false,
      isProgressVisible: false,
      isActive: true,
      
      setText: () => {},
      onClick: () => {},
      offClick: () => {},
      show: () => {},
      hide: () => {},
      enable: () => {},
      disable: () => {},
      showProgress: () => {},
      hideProgress: () => {},
    },
    
    BackButton: {
      isVisible: false,
      onClick: () => {},
      offClick: () => {},
      show: () => {},
      hide: () => {},
    },
    
    onEvent: () => {},
    offEvent: () => {},
  };
}

// Utility functions for common Telegram operations
export function hapticFeedback(type: 'impact' | 'notification' | 'selection', style?: string) {
  const tg = initTelegram();
  if (!tg?.HapticFeedback) return;
  
  switch (type) {
    case 'impact':
      tg.HapticFeedback.impactOccurred(style as any || 'light');
      break;
    case 'notification':
      tg.HapticFeedback.notificationOccurred(style as any || 'success');
      break;
    case 'selection':
      tg.HapticFeedback.selectionChanged();
      break;
  }
}

export function showTelegramAlert(message: string): Promise<void> {
  return new Promise((resolve) => {
    const tg = initTelegram();
    if (tg) {
      tg.showAlert(message, resolve);
    } else {
      alert(message);
      resolve();
    }
  });
}

export function showTelegramConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const tg = initTelegram();
    if (tg) {
      tg.showConfirm(message, resolve);
    } else {
      resolve(confirm(message));
    }
  });
}
