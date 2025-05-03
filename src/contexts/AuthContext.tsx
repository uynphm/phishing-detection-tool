import { createContext, useContext, useState, useEffect } from 'react';
//import QRCode from 'qrcode.react';

type User = {
  id: string;
  email: string;
  name: string;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string, code?: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  setupTwoFactor: () => Promise<{ secret: string; qrCode: string }>;
  enableTwoFactor: (code: string) => Promise<boolean>;
  verifyTwoFactor: (code: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  isLoading: false,
  error: null,
  setupTwoFactor: async () => ({ secret: '', qrCode: '' }),
  enableTwoFactor: async () => false,
  verifyTwoFactor: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('phishguard_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string, code?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'demo@example.com' && password === 'password') {
        const mockUser = { 
          id: '1', 
          email, 
          name: 'Demo User',
          twoFactorEnabled: true,
          twoFactorSecret: 'DEMOSECRET123'
        };

        if (mockUser.twoFactorEnabled && !code) {
          throw new Error('2FA_REQUIRED');
        }

        if (mockUser.twoFactorEnabled && code) {
          const isValid = await verifyTwoFactor(code);
          if (!isValid) {
            throw new Error('Invalid 2FA code');
          }
        }

        setUser(mockUser);
        localStorage.setItem('phishguard_user', JSON.stringify(mockUser));
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser = { 
        id: Date.now().toString(), 
        email, 
        name,
        password,
        twoFactorEnabled: false
      };
      setUser(newUser);
      localStorage.setItem('phishguard_user', JSON.stringify(newUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  const setupTwoFactor = async () => {
    try {
      const speakeasy = await import('speakeasy');
      const secret = speakeasy.generateSecret({
        name: `PhishGuard:${user?.email}`
      });

      const otpauthUrl = speakeasy.otpauthURL({
        secret: secret.base32,
        label: user?.email || '',
        issuer: 'PhishGuard'
      });

      return {
        secret: secret.base32,
        qrCode: otpauthUrl
      };
    } catch (err) {
      console.error('Error setting up 2FA:', err);
      throw new Error('Failed to setup two-factor authentication');
    }
  };

  const enableTwoFactor = async (code: string) => {
    if (!user?.twoFactorSecret) return false;

    try {
      const speakeasy = await import('speakeasy');
      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code
      });

      if (isValid) {
        const updatedUser = {
          ...user,
          twoFactorEnabled: true
        };
        setUser(updatedUser);
        localStorage.setItem('phishguard_user', JSON.stringify(updatedUser));
      }

      return isValid;
    } catch (err) {
      console.error('Error enabling 2FA:', err);
      return false;
    }
  };

  const verifyTwoFactor = async (code: string) => {
    if (!user?.twoFactorSecret) return false;

    try {
      const speakeasy = await import('speakeasy');
      return speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: code,
        window: 1
      });
    } catch (err) {
      console.error('Error verifying 2FA code:', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('phishguard_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout, 
      isLoading, 
      error,
      setupTwoFactor,
      enableTwoFactor,
      verifyTwoFactor
    }}>
      {children}
    </AuthContext.Provider>
  );
};