import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserContent, getUserStats, deleteContent } from '../services/api';
import { Trash2, Copy, Check, Eye, Lock, Clock, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const DashboardPage = () => {
  const { user } = useAuth();
  const [content, setContent] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [contentData, statsData] = await Promise.all([
        getUserContent(),
        getUserStats()
      ]);
      setContent(contentData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (linkId) => {
    try {
      await deleteContent(linkId);
      setContent(content.filter(item => item.link_id !== linkId));
      setDeleteId(null);
      // Refresh stats
      const statsData = await getUserStats();
      setStats(statsData);
    } catch (error) {
      alert('Failed to delete content');
    }
  };

  const handleCopy = (linkId) => {
    const url = `${window.location.origin}/view/${linkId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(linkId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-claude-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-claude-text mb-2">
            Dashboard
          </h1>
          <p className="text-claude-text-secondary">
            Welcome back, {user.username}!
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <p className="text-sm text-claude-text-secondary mb-1">Total Uploads</p>
              <p className="text-3xl font-bold text-claude-text">{stats.total_uploads}</p>
            </div>
            <div className="card">
              <p className="text-sm text-claude-text-secondary mb-1">Active</p>
              <p className="text-3xl font-bold text-green-600">{stats.active_uploads}</p>
            </div>
            <div className="card">
              <p className="text-sm text-claude-text-secondary mb-1">Expired</p>
              <p className="text-3xl font-bold text-gray-400">{stats.expired_uploads}</p>
            </div>
            <div className="card">
              <p className="text-sm text-claude-text-secondary mb-1">Total Views</p>
              <p className="text-3xl font-bold text-claude-accent">{stats.total_views}</p>
            </div>
          </div>
        )}

        {/* Content List */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-claude-text">
            Your Uploads
          </h2>

          {content.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-claude-text-secondary mb-4">
                You haven't uploaded anything yet
              </p>
              <a href="/upload" className="btn-primary">
                Create Your First Link
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {content.map((item) => {
                const expired = isExpired(item.expiry_date) || item.is_deleted;
                
                return (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-claude transition-colors ${
                      expired
                        ? 'bg-gray-50 border-gray-200 opacity-60'
                        : 'bg-white border-claude-border hover:border-claude-accent'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Title */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-claude-text">
                            {item.content_type === 'file' ? item.file_name : 'Text Content'}
                          </span>
                          <span className="text-xs px-2 py-1 rounded bg-gray-100 text-claude-text-secondary">
                            {item.content_type}
                          </span>
                          {expired && (
                            <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                              Expired
                            </span>
                          )}
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-claude-text-secondary mb-2">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>
                              {expired
                                ? 'Expired'
                                : `Expires ${formatDistanceToNow(new Date(item.expiry_date), { addSuffix: true })}`
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye size={14} />
                            <span>
                              {item.view_count} views
                              {item.max_views && ` / ${item.max_views} max`}
                            </span>
                          </div>
                          {item.has_password && (
                            <div className="flex items-center gap-1 text-claude-accent">
                              <Lock size={14} />
                              <span>Protected</span>
                            </div>
                          )}
                          {item.is_one_time && (
                            <div className="flex items-center gap-1 text-orange-600">
                              <Eye size={14} />
                              <span>One-time</span>
                            </div>
                          )}
                        </div>

                        {/* File size */}
                        {item.file_size && (
                          <p className="text-sm text-claude-text-secondary">
                            {(item.file_size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-4">
                        {!expired && (
                          <>
                            <button
                              onClick={() => handleCopy(item.link_id)}
                              className="p-2 hover:bg-gray-100 rounded transition-colors"
                              title="Copy link"
                            >
                              {copiedId === item.link_id ? (
                                <Check size={18} className="text-green-600" />
                              ) : (
                                <Copy size={18} className="text-claude-text-secondary" />
                              )}
                            </button>
                            <a
                              href={`/view/${item.link_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-gray-100 rounded transition-colors"
                              title="Open link"
                            >
                              <ExternalLink size={18} className="text-claude-text-secondary" />
                            </a>
                            <button
                              onClick={() => setDeleteId(item.link_id)}
                              className="p-2 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} className="text-red-600" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Delete Confirmation */}
                    {deleteId === item.link_id && (
                      <div className="mt-4 pt-4 border-t border-claude-border">
                        <p className="text-sm text-claude-text mb-3">
                          Are you sure you want to delete this content? This action cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(item.link_id)}
                            className="btn-primary text-sm px-4 py-2 bg-red-600 hover:bg-red-700"
                          >
                            Yes, Delete
                          </button>
                          <button
                            onClick={() => setDeleteId(null)}
                            className="btn-secondary text-sm px-4 py-2"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;