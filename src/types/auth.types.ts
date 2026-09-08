export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  telegramUser: TelegramUser | null;
  firebaseUid: string | null;
  error: string | null;
}
