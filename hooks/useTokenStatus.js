'use client';

import { useState, useEffect } from 'react';

export function useTokenStatus(accounts) {
  const [tokenErrors, setTokenErrors] = useState({});

  useEffect(() => {
    if (!accounts?.length) return;

    Promise.allSettled(
      accounts.map(async (account) => {
        const res = await fetch('/api/facebook/page-info', {
          headers: { 'x-fb-token': account.token },
        });
        const data = await res.json();
        return { id: account.id, hasError: !!data.error };
      })
    ).then((results) => {
      const errors = {};
      results.forEach((r) => {
        if (r.status === 'fulfilled') errors[r.value.id] = r.value.hasError;
        else errors[r.reason?.id] = true;
      });
      setTokenErrors(errors);
    });
  }, [accounts.length]);

  return tokenErrors;
}
