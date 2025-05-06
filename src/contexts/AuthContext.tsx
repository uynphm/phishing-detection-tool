import { createContext, useContext, useState, useEffect } from 'react';

type User = {
  id: string;
  email: string;
  name: string;
  password?: string; // optional — only required for signup
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUsername: (username: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  updateUsername: async () => {},
  isLoading: false,
  error: null,
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

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("http://localhost:5001/api/login", {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: email, password})
      });
      const data = await response.json()

      if (data.id == null) {
        throw new Error(data.message);
      }

      const loggedInUser = { 
        id: data.id,
        email, 
        name: data.name || email // Use backend name if available, fallback to email
      };
      setUser(loggedInUser);
      localStorage.setItem('phishguard_user', JSON.stringify(loggedInUser));
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
      // Simple email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password length for security
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const response = await fetch("http://localhost:5001/api/signup", {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: email, password})
      });
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message);
      }

      const newUser = { 
        id: email,
        email: email, 
        password: password,
        name: name
      };
      setUser(newUser);
      localStorage.setItem('phishguard_user', JSON.stringify(newUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUsername = async (username: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!username.trim()) {
        throw new Error('Username cannot be empty');
      }

      if (user) {
        const updatedUser = { ...user, name: username };
        setUser(updatedUser);
        localStorage.setItem('phishguard_user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating username');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/logout", {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
  
      const data = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('phishguard_user');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      logout,
      updateUsername, 
      isLoading, 
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};