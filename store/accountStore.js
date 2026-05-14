import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAccountStore = create(
  persist(
    (set, get) => ({
      accounts: [],
      activeAccountId: null,

      addAccount: (account) => {
        const id = crypto.randomUUID();
        const newAccount = { ...account, id };
        set((s) => ({
          accounts: [...s.accounts, newAccount],
          activeAccountId: s.activeAccountId ?? id,
        }));
        return id;
      },

      removeAccount: (id) => {
        set((s) => {
          const remaining = s.accounts.filter((a) => a.id !== id);
          return {
            accounts: remaining,
            activeAccountId:
              s.activeAccountId === id
                ? (remaining[0]?.id ?? null)
                : s.activeAccountId,
          };
        });
      },

      setActiveAccount: (id) => set({ activeAccountId: id }),

      updateAccount: (id, updates) => {
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }));
      },

      getActiveAccount: () => {
        const s = get();
        return s.accounts.find((a) => a.id === s.activeAccountId) ?? null;
      },
    }),
    {
      name: 'fb-dashboard-accounts',
    }
  )
);

export default useAccountStore;
