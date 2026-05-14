'use client';

import useAccountStore from '@/store/accountStore';

export function useAccounts() {
  const accounts = useAccountStore((s) => s.accounts);
  const activeAccountId = useAccountStore((s) => s.activeAccountId);
  const addAccount = useAccountStore((s) => s.addAccount);
  const removeAccount = useAccountStore((s) => s.removeAccount);
  const setActiveAccount = useAccountStore((s) => s.setActiveAccount);
  const updateAccount = useAccountStore((s) => s.updateAccount);
  const getActiveAccount = useAccountStore((s) => s.getActiveAccount);

  const activeAccount = getActiveAccount();

  return {
    accounts,
    activeAccountId,
    activeAccount,
    addAccount,
    removeAccount,
    setActiveAccount,
    updateAccount,
  };
}
