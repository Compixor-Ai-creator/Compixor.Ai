'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  Trash2,
  Star,
  LogOut,
  RefreshCw,
  MessageSquare,
  Clock,
  Check,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackItem {
  id: string;
  tool_name: string;
  rating: number;
  first_name: string | null;
  message: string;
  status: 'pending' | 'approved';
  created_at: string;
}

export default function AdminFeedbackPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');
  const [pendingItems, setPendingItems] = useState<FeedbackItem[]>([]);
  const [approvedItems, setApprovedItems] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // Check current session
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/auth', { cache: 'no-store' });
      const data = await res.json();
      setIsAuthenticated(Boolean(data.authenticated));
      if (data.authenticated) {
        fetchFeedback();
      }
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const fetchFeedback = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/feedback', { cache: 'no-store' });
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      const data = await res.json();
      setPendingItems(data.pending || []);
      setApprovedItems(data.approved || []);
    } catch {
      toast.error('Failed to load feedback records.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error('Please enter the administrator password.');
      return;
    }
    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Authentication failed.');
        return;
      }
      toast.success('Admin login successful.');
      setIsAuthenticated(true);
      setPassword('');
      fetchFeedback();
    } catch {
      toast.error('Network error during login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      setIsAuthenticated(false);
      setPendingItems([]);
      setApprovedItems([]);
      toast.success('Logged out successfully.');
    } catch {
      toast.error('Error logging out.');
    }
  };

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to approve item.');
        return;
      }
      toast.success('Feedback approved.');
      const itemToMove = pendingItems.find((item) => item.id === id);
      if (itemToMove) {
        setPendingItems((prev) => prev.filter((i) => i.id !== id));
        setApprovedItems((prev) => [{ ...itemToMove, status: 'approved' }, ...prev]);
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string, fromApproved: boolean) => {
    if (!confirm('Are you sure you want to permanently delete this feedback?')) return;
    setActionId(id);
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete item.');
        return;
      }
      toast.success('Feedback deleted.');
      if (fromApproved) {
        setApprovedItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        setPendingItems((prev) => prev.filter((i) => i.id !== id));
      }
    } catch {
      toast.error('Network error.');
    } finally {
      setActionId(null);
    }
  };

  // Initial loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-brand-600" />
      </div>
    );
  }

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold font-display text-zinc-900 dark:text-white">
              Compixor Admin
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Enter ADMIN_PASSWORD to manage feedback moderation.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-surface-850 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full btn-primary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Access Dashboard</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Authenticated Dashboard
  const currentList = activeTab === 'pending' ? pendingItems : approvedItems;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black font-display text-zinc-900 dark:text-white">
              Feedback Moderation
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Admin Session
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Review incoming submissions before publishing them live to the home page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFeedback}
            disabled={isLoading}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 flex items-center gap-1.5 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 mt-6 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Review</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono">
            {pendingItems.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('approved')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'approved'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Approved (Public)</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-black/15 font-mono">
            {approvedItems.length}
          </span>
        </button>
      </div>

      {/* List */}
      {currentList.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800">
          <MessageSquare className="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-600 mb-3" />
          <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
            No {activeTab} feedback
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {activeTab === 'pending'
              ? 'All incoming reviews have been moderated.'
              : 'No reviews are currently approved for public display.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((item) => (
            <div
              key={item.id}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-surface-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-5 transition hover:border-brand-500/30"
            >
              <div className="space-y-2 flex-1">
                {/* Meta Row: Rating, Tool Name, Author, Date */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {/* Star Rating */}
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= item.rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-zinc-200 dark:text-zinc-700'
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      {item.rating}/5
                    </span>
                  </div>

                  <span className="text-zinc-300 dark:text-zinc-700">•</span>

                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                    {item.tool_name}
                  </span>

                  <span className="text-zinc-300 dark:text-zinc-700">•</span>

                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {item.first_name || 'Anonymous'}
                  </span>

                  <span className="text-zinc-300 dark:text-zinc-700">•</span>

                  <span className="text-[11px] text-zinc-400 font-mono">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>

                {/* Feedback Message */}
                <p className="text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {item.message}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-start pt-2 md:pt-0">
                {activeTab === 'pending' && (
                  <button
                    onClick={() => handleApprove(item.id)}
                    disabled={actionId === item.id}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(item.id, activeTab === 'approved')}
                  disabled={actionId === item.id}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
