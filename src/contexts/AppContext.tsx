import { createContext, useContext, useState, useEffect } from 'react';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import QRCode from 'qrcode';

// Types
type ThemePreference = 'light' | 'dark' | 'system';

interface UrlAnalysis {
  safe: boolean;
  score: number;
  explanation: string;
  concerns: string[];
}

interface UserPreferences {
  theme: ThemePreference;
  enableNotifications: boolean;
  enable2FA: boolean;
}

interface AppContextType {
  // Auth
  user: User | null;
  isLoading: boolean;
  error: string | null;
  is2FARequired: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verify2FA: (code: string) => Promise<void>;
  setup2FA: () => Promise<string>;
  
  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => Promise<void>;
  
  // URL Analysis
  analyzeUrl: (url: string) => Promise<UrlAnalysis>;
  lastAnalysis: UrlAnalysis | null;
  
  // User Preferences
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export const useApp = () => useContext(AppContext);

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [is2FARequired, setIs2FARequired] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [lastAnalysis, setLastAnalysis] = useState<UrlAnalysis | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    enableNotifications: true,
    enable2FA: false,
  });

  // Initialize auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Initialize theme
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(themePreference === 'dark' || (themePreference === 'system' && isDark));
  }, [themePreference]);

  // Load user preferences
  useEffect(() => {
    if (user) {
      loadUserPreferences();
    }
  }, [user]);

  const loadUserPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setPreferences(data);
        setThemePreference(data.theme);
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user?.user_metadata?.enable2FA) {
        setIs2FARequired(true);
        return;
      }

      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;
      setUser(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setIs2FARequired(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during logout');
    }
  };

  const setup2FA = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-2fa-secret');
      if (error) throw error;

      const qrCodeUrl = await QRCode.toDataURL(data.otpauth_url);
      return qrCodeUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error setting up 2FA');
      throw err;
    }
  };

  const verify2FA = async (code: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa', {
        body: { code },
      });

      if (error) throw error;
      setIs2FARequired(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid 2FA code');
      throw err;
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    const newTheme = darkMode ? 'light' : 'dark';
    setThemePreference(newTheme);
    updatePreferences({ theme: newTheme });
  };

  const updatePreferences = async (prefs: Partial<UserPreferences>) => {
    try {
      const newPreferences = { ...preferences, ...prefs };
      const { error } = await supabase
        .from('user_preferences')
        .upsert({ user_id: user?.id, ...newPreferences });

      if (error) throw error;
      setPreferences(newPreferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating preferences');
    }
  };

  const analyzeUrl = async (url: string): Promise<UrlAnalysis> => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-url', {
        body: { url },
      });

      if (error) throw error;

      const analysis: UrlAnalysis = {
        safe: data.safe,
        score: data.score,
        explanation: data.explanation,
        concerns: data.concerns,
      };

      setLastAnalysis(analysis);
      return analysis;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error analyzing URL');
      throw err;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isLoading,
        error,
        is2FARequired,
        login,
        signup,
        logout,
        verify2FA,
        setup2FA,
        darkMode,
        toggleDarkMode,
        themePreference,
        setThemePreference,
        analyzeUrl,
        lastAnalysis,
        preferences,
        updatePreferences,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};