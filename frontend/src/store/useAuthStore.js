import { create } from 'zustand';
import {
  signup as apiSignup,
  login as apiLogin,
  fetchMe,
  setToken,
  getToken,
} from '../api/client.js';

const useAuthStore = create((set) => ({
  user: null,
  authReady: false,   // true once we've checked for an existing session
  authLoading: false,
  authError: null,

  /** On app boot: if a token exists, validate it and restore the user. */
  init: async () => {
    const token = getToken();
    if (!token) {
      set({ authReady: true });
      return;
    }
    try {
      const res = await fetchMe();
      set({ user: res.user, authReady: true });
    } catch {
      setToken(null); // stale/expired token
      set({ user: null, authReady: true });
    }
  },

  signup: async (email, password, name) => {
    set({ authLoading: true, authError: null });
    try {
      const res = await apiSignup(email, password, name);
      setToken(res.token);
      set({ user: res.user, authLoading: false });
      return true;
    } catch (err) {
      set({ authLoading: false, authError: err.message });
      return false;
    }
  },

  login: async (email, password) => {
    set({ authLoading: true, authError: null });
    try {
      const res = await apiLogin(email, password);
      setToken(res.token);
      set({ user: res.user, authLoading: false });
      return true;
    } catch (err) {
      set({ authLoading: false, authError: err.message });
      return false;
    }
  },

  logout: () => {
    setToken(null);
    set({ user: null });
  },

  clearAuthError: () => set({ authError: null }),
}));

export default useAuthStore;
