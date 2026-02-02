import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'agent';
}

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  isManager: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = (): void => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token) {
        setIsLoading(false);
        router.push('/login');
        return;
      }

      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch {
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isAgent: user?.role === 'agent',
    isManager: user?.role === 'manager',
  };
};

export default useAuth;
