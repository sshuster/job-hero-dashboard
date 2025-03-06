import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";
import { User } from '@/lib/types';
import { loginApi, registerApi, logoutApi, fetchCurrentUser } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // First try to get user from localStorage (for mock admin)
        const storedUser = localStorage.getItem('mockUser');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setLoading(false);
          return;
        }

        // Then try to fetch from backend
        const userData = await fetchCurrentUser();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Check for mock admin user
      if (email === 'admin@example.com' && password === 'admin') {
        const mockAdminUser: User = {
          id: 'admin',
          name: 'Administrator',
          email: 'admin@example.com',
          role: 'admin'
        };
        setUser(mockAdminUser);
        localStorage.setItem('mockUser', JSON.stringify(mockAdminUser));
        toast.success('Logged in as Admin');
        return true;
      }

      // Otherwise, try to login through the API
      const userData = await loginApi(email, password);
      if (userData) {
        setUser(userData);
        toast.success('Logged in successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const userData = await registerApi(name, email, password);
      if (userData) {
        setUser(userData);
        toast.success('Registered successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Clear mock user if it exists
      if (localStorage.getItem('mockUser')) {
        localStorage.removeItem('mockUser');
        setUser(null);
        toast.success('Logged out successfully');
        return;
      }

      // Otherwise logout through API
      await logoutApi();
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
