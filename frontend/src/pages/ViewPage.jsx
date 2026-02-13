import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Copy, Download, Clock, AlertCircle, Check, Lock, Eye, Hash } from 'lucide-react';
import { getContent, getDownloadUrl } from '../services/api';

const ViewPage = () => {
  const { linkId } = useParams();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // Password state
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    loadContent();
  }, [linkId]);

  const loadContent = async (pwd = null) => {
    try {
      setLoading(true);
      setPasswordError('');
      const response = await getContent(linkId, pwd);
      setContent(response.data);
      setRequiresPassword(false);
    } catch (err) {
      if (err.response?.data?.requires_password) {
        setRequiresPassword(true);
        setPasswordError(err.response.data.message);
      } else {
        setError(
          err.response?.data?.message || 
          'Failed to load content. The link may be invalid or expired.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setPasswordError('Please enter a password');
      return;
    }
    loadContent(password);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content.text_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-claude-accent border-t-transparent mx-auto mb-4" />
          <p className="text-claude-text-secondary">Loading content...</p>
        </div>
      </div>
    );
  }

  // Password Required Screen
  if (requiresPassword && !content) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Lock className="text-claude-accent" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-claude-text">
                Password Required
              </h2>
              <p className="text-sm text-claude-text-secondary">
                This content is password protected
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="input-field"
                autoFocus
              />
              {passwordError && (
                <p className="text-sm text-claude-error mt-2">{passwordError}</p>
              )}
            </div>
            <button type="submit" className="btn-primary w-full">
              Unlock Content
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="text-claude-error flex-shrink-0 mt-1" size={24} />
            <div>
              <h2 className="text-xl font-semibold mb-2 text-claude-text">
                Content Not Found
              </h2>
              <p className="text-claude-text-secondary">{error}</p>
            </div>
          </div>
          <a href="/" className="btn-primary w-full text-center">
            Create New Link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-claude-text">
            🔐 LinkVault
          </h1>
          <p className="text-claude-text-secondary">Secure content sharing</p>
        </div>

        {/* Content Card */}
        <div className="card">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 mb-6 pb-4 border-b border-claude-border">
            <div>
              <p className="text-sm text-claude-text-secondary">Content Type</p>
              <p className="font-medium text-claude-text capitalize">
                {content.content_type}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-claude-text-secondary">Expires At</p>
              <p className="font-medium text-claude-text text-sm">
                {formatDate(content.expires_at)}
              </p>
            </div>
            {content.view_count !== undefined && (
              <div>
                <p className="text-sm text-claude-text-secondary flex items-center gap-1">
                  <Eye size={14} /> Views
                </p>
                <p className="font-medium text-claude-text">
                  {content.view_count}
                  {content.max_views && ` / ${content.max_views}`}
                </p>
              </div>
            )}
            {content.is_one_time && (
              <div className="text-right">
                <p className="text-sm text-orange-600 font-medium flex items-center justify-end gap-1">
                  <Eye size={14} /> One-Time View
                </p>
                <p className="text-xs text-claude-text-secondary">
                  Now deleted
                </p>
              </div>
            )}
          </div>

          {/* One-Time Warning */}
          {content.is_one_time && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-claude">
              <p className="text-sm text-orange-800 flex items-center gap-2">
                <AlertCircle size={16} />
                This was a one-time link and has been permanently deleted
              </p>
            </div>
          )}

          {/* Text Content */}
          {content.content_type === 'text' && (
            <>
              <div className="mb-4">
                <div className="bg-gray-50 rounded-claude p-4 border border-claude-border">
                  <pre className="whitespace-pre-wrap font-mono text-sm text-claude-text break-words">
                    {content.text_content}
                  </pre>
                </div>
              </div>
              <button
                onClick={handleCopy}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check size={18} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copy to Clipboard
                  </>
                )}
              </button>
            </>
          )}

          {/* File Content */}
          {content.content_type === 'file' && (
            <>
              <div className="mb-4 p-4 bg-gray-50 rounded-claude border border-claude-border">
                <p className="text-sm text-claude-text-secondary mb-1">
                  File Name
                </p>
                <p className="font-medium text-claude-text mb-3">
                  {content.file_name}
                </p>
                <div className="flex gap-4 text-sm">
                  <div>
                    <p className="text-claude-text-secondary">Size</p>
                    <p className="font-medium text-claude-text">
                      {(content.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div>
                    <p className="text-claude-text-secondary">Type</p>
                    <p className="font-medium text-claude-text">
                      {content.file_mime_type}
                    </p>
                  </div>
                </div>
              </div>
              <a
                href={getDownloadUrl(linkId, password)}
                download
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download File
              </a>
            </>
          )}
        </div>

        {/* Create New Link */}
        <div className="text-center mt-8">
          <a
            href="/"
            className="text-claude-accent hover:text-claude-accent-hover font-medium"
          >
            Create your own link →
          </a>
        </div>
      </div>
    </div>
  );
};

export default ViewPage;