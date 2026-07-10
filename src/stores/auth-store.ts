import { create } from 'zustand';
import { api, setToken, clearToken, getStoredToken } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/api-endpoints';

interface User {
  id: string;
  name: string;
  email: string;
  workspaceId?: string;
  workspace?: { id: string; name: string; slug: string };
  role?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    workspaceName: string;
  }) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isInitialized: false,

  login: async (email, password) => {
    const res = await api<{
      accessToken: string;
      user: User;
    }>(API_ENDPOINTS.auth.createSession, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(res.accessToken);
    set({
      user: res.user,
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
    });
  },

  register: async (data) => {
    const res = await api<{
      accessToken: string;
      user: User;
    }>(API_ENDPOINTS.auth.createAccount, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setToken(res.accessToken);
    set({
      user: res.user,
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
    });
  },

  logout: () => {
    clearToken();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
    });
  },

  fetchUser: async () => {
    const token = getStoredToken();
    if (!token) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await api<User>(API_ENDPOINTS.auth.profile);
      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      });
    } catch {
      clearToken();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
    }
  },
}));
