'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccounts } from './useAccounts';

export function useComments(postId) {
  const { activeAccount } = useAccounts();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async () => {
    if (!activeAccount?.token || !postId) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/facebook/comments?postId=${postId}`, {
        headers: { 'x-fb-token': activeAccount.token },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setComments(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [activeAccount?.token, postId]);

  useEffect(() => {
    setComments([]);
    fetchComments();
  }, [postId, activeAccount?.id]);

  const addComment = useCallback(async (targetId, message) => {
    if (!activeAccount?.token) throw new Error('No active account');

    const res = await fetch(`/api/facebook/comments/${targetId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-fb-token': activeAccount.token,
      },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    await fetchComments();
    return data;
  }, [activeAccount?.token, fetchComments]);

  const hideComment = useCallback(async (commentId) => {
    if (!activeAccount?.token) throw new Error('No active account');
    const res = await fetch(`/api/facebook/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'x-fb-token': activeAccount.token },
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
  }, [activeAccount?.token]);

  const deleteComment = useCallback(async (commentId) => {
    if (!activeAccount?.token) throw new Error('No active account');
    const res = await fetch(`/api/facebook/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'x-fb-token': activeAccount.token },
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }, [activeAccount?.token]);

  const bulkHide = useCallback(async (ids) => {
    await Promise.allSettled(ids.map(hideComment));
    await fetchComments();
  }, [hideComment, fetchComments]);

  const bulkDelete = useCallback(async (ids) => {
    await Promise.allSettled(ids.map(deleteComment));
    await fetchComments();
  }, [deleteComment, fetchComments]);

  const toggleLike = useCallback(async (commentId, liked) => {
    if (!activeAccount?.token) throw new Error('No active account');
    const method = liked ? 'DELETE' : 'POST';
    const res = await fetch(`/api/facebook/likes/${commentId}`, {
      method,
      headers: { 'x-fb-token': activeAccount.token },
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  }, [activeAccount?.token]);

  return {
    comments,
    isLoading,
    error,
    addComment,
    toggleLike,
    hideComment,
    deleteComment,
    bulkHide,
    bulkDelete,
    refresh: fetchComments,
  };
}
