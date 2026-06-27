import { create } from 'zustand';
import { onAuthChanged } from '../services/auth';
import type { AuthUser } from '../services/api';

interface AuthStore {
  user: AuthUser | null;
  loading: boolean;
}

const useAuthStore = create<AuthStore>((set) => {
  onAuthChanged((user) => set({ user, loading: false }));
  return { user: null, loading: true };
});

export default useAuthStore;
