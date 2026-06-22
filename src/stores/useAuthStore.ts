import { create } from 'zustand';
import { User } from 'firebase/auth';
import { onAuthChanged } from '../services/auth';

interface AuthStore {
  user: User | null;
  loading: boolean;
}

const useAuthStore = create<AuthStore>((set) => {
  onAuthChanged((user) => set({ user, loading: false }));
  return { user: null, loading: true };
});

export default useAuthStore;
