'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccounts } from './useAccounts';

export function usePosts() {
  const { activeAccount } = useAccounts();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchPosts = useCallback(async (cursor = null) => {
    if (!activeAccount?.token) return;
    setIsLoading(true);
    setError(null);

    try {
      const url = cursor
        ? `/api/facebook/posts?after=${cursor}`
        : '/api/facebook/posts';

      const res = await fetch(url, {
        headers: { 'x-fb-token': activeAccount.token },
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      if (cursor) {
        setPosts((prev) => [...prev, ...(data.data || [])]);
      } else {
        setPosts(data.data || []);
      }

      const after = data.paging?.cursors?.after;
      const hasNext = !!data.paging?.next;
      setNextCursor(after || null);
      setHasMore(hasNext);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeAccount?.token, activeAccount?.id]);

  useEffect(() => {
    setPosts([]);
    setNextCursor(null);
    setHasMore(false);
    fetchPosts();
  }, [activeAccount?.id]);

  const loadMore = useCallback(() => {
    if (nextCursor) fetchPosts(nextCursor);
  }, [nextCursor, fetchPosts]);

  const createPost = useCallback(async (message, photoAlreadyPosted = false, scheduled_publish_time = null) => {
    if (!activeAccount?.token) throw new Error('No active account');

    if (photoAlreadyPosted) {
      await fetchPosts();
      return;
    }

    const res = await fetch('/api/facebook/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-fb-token': activeAccount.token,
      },
      body: JSON.stringify({ message, ...(scheduled_publish_time ? { scheduled_publish_time } : {}) }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    if (!scheduled_publish_time) await fetchPosts();
    return data;
  }, [activeAccount?.token, fetchPosts]);

  const deletePost = useCallback(async (postId) => {
    if (!activeAccount?.token) throw new Error('No active account');
    const res = await fetch(`/api/facebook/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'x-fb-token': activeAccount.token },
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    return data;
  }, [activeAccount?.token]);

  const editPost = useCallback(async (postId, message) => {
    if (!activeAccount?.token) throw new Error('No active account');
    const res = await fetch(`/api/facebook/posts/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-fb-token': activeAccount.token },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, message } : p));
    return data;
  }, [activeAccount?.token]);

  return {
    posts,
    isLoading,
    error,
    hasMore,
    loadMore,
    createPost,
    deletePost,
    editPost,
    refresh: () => fetchPosts(),
  };
}
