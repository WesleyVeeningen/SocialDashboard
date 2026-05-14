'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccounts } from './useAccounts';

export function useNotifications() {
  const { activeAccount } = useAccounts();
  const [conversations, setConversations] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch_ = useCallback(async () => {
    if (!activeAccount?.token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/facebook/notifications', {
        headers: { 'x-fb-token': activeAccount.token },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setConversations(data.conversations ?? []);
      setMentions(data.mentions ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeAccount?.token, activeAccount?.id]);

  useEffect(() => {
    setConversations([]);
    setMentions([]);
    fetch_();
    const interval = setInterval(fetch_, 60_000);
    return () => clearInterval(interval);
  }, [activeAccount?.id]);

  const totalUnread = conversations.reduce((s, c) => s + (c.unread_count ?? 0), 0);

  return { conversations, mentions, isLoading, error, totalUnread, refresh: fetch_ };
}
