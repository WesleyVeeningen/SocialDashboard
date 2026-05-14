'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccounts } from './useAccounts';

export function useScheduledPosts() {
  const { activeAccount } = useAccounts();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchScheduled = useCallback(async () => {
    if (!activeAccount?.token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/facebook/scheduled-posts', {
        headers: { 'x-fb-token': activeAccount.token },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setPosts(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeAccount?.token, activeAccount?.id]);

  useEffect(() => {
    setPosts([]);
    fetchScheduled();
  }, [activeAccount?.id]);

  const deleteScheduledPost = useCallback(async (postId) => {
    if (!activeAccount?.token) throw new Error('No active account');
    const res = await fetch(`/api/facebook/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'x-fb-token': activeAccount.token },
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, [activeAccount?.token]);

  return { posts, isLoading, error, deleteScheduledPost, refresh: fetchScheduled };
}
