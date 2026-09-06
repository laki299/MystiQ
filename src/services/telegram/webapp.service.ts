import { TelegramUser } from '../../types/auth.types';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: {
          user?: TelegramUser;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}

export const getTelegramWebApp = () => {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  return null;
};

export const getTelegramUser = (): TelegramUser | null => {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.initDataUnsafe?.user) {
    return webApp.initDataUnsafe.user;
  }
  
  if (import.meta.env.DEV) {
    return {
      id: 999999999,
      first_name: 'DevUser',
      username: 'dev_tester',
      language_code: 'en'
    };
  }
  
  return null;
};

