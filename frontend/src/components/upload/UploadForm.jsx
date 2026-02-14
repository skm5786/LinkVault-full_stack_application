import React, { useState } from 'react';
import { Upload, FileText, Clock, Lock, Eye, Hash, AlertCircle } from 'lucide-react';
import { uploadText, uploadFile } from '../../services/api';

const UploadForm = ({ onUploadSuccess }) => {
  const [activeTab, setActiveTab] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [expiryMinutes, setExpiryMinutes] = useState('10');
  
  // Bonus feature states
  const [password, setPassword] = useState('');
  const [isOneTime, setIsOneTime] = useState(false);
  const [maxViews, setMaxViews] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      const options = {
        expiry_minutes: expiryMinutes ? parseFloat(expiryMinutes) : null,
        password: password || null,
        is_one_time: isOneTime,
        max_views: maxViews ? parseInt(maxViews) : null
      };

      if (activeTab === 'text') {
        if (!textContent.trim()) {
          throw new Error('Please enter some text');
        }
        result = await uploadText(textContent, options);
      } else {
        if (!selectedFile) {
          throw new Error('Please select a file');
        }
        result = await uploadFile(selectedFile, options);
      }

      onUploadSuccess(result.data);
      
      // Reset form
      setTextContent('');
      setSelectedFile(null);
      setExpiryMinutes('10');
      setPassword('');
      setIsOneTime(false);
      setMaxViews('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-claude-text">
        Share Content Securely
      </h2>

      {/* Tab Selection */}
      <div className="flex gap-2 mb-6 border-b border-claude-border">
        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'text'
              ? 'text-claude-accent border-b-2 border-claude-accent'
              : 'text-claude-text-secondary hover:text-claude-text'
          }`}
        >
          <FileText size={18} />
          Text
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('file')}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
            activeTab === 'file'
              ? 'text-claude-accent border-b-2 border-claude-accent'
              : 'text-claude-text-secondary hover:text-claude-text'
          }`}
        >
          <Upload size={18} />
          File
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-claude flex items-start gap-2">
          <AlertCircle className="text-claude-error flex-shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Content Input */}
        {activeTab === 'text' ? (
          <div>
            <label className="block text-sm font-medium mb-2 text-claude-text">
              Enter your text
            </label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste your text here..."
              rows={8}
              className="input-field resize-none font-mono text-sm"
              disabled={loading}
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-2 text-claude-text">
              Select a file
            </label>
            <div className="border-2 border-dashed border-claude-border rounded-claude p-8 text-center hover:border-claude-accent transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={loading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload size={32} className="text-claude-text-secondary" />
                {selectedFile ? (
                  <div>
                    <p className="font-medium text-claude-text">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-claude-text-secondary">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="font-medium text-claude-text">
                      Click to select file
                    </p>
                    <p className="text-sm text-claude-text-secondary">
                      Maximum size: 50MB
                    </p>
                  </>
                )}
              </label>
            </div>
          </div>
        )}

        {/* Expiry Time */}
        <div>
          <label className="block text-sm font-medium mb-2 text-claude-text flex items-center gap-2">
            <Clock size={16} />
            Expiry time
          </label>
          <select
            value={expiryMinutes}
            onChange={(e) => setExpiryMinutes(e.target.value)}
            className="input-field"
            disabled={loading}
          >
            <option value="10">10 minutes</option>
            <option value="0.75">45 seconds</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="360">6 hours</option>
            <option value="1440">24 hours</option>
            <option value="10080">7 days</option>
            <option value="52560000">permanent</option>
          </select>
        </div>

        {/* Advanced Options Toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-claude-accent hover:text-claude-accent-hover font-medium flex items-center gap-1"
        >
          {showAdvanced ? '▼' : '▶'} Advanced Options (Password, View Limits, One-Time)
        </button>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-claude border border-claude-border">
            {/* Password Protection */}
            <div>
              <label className="block text-sm font-medium mb-2 text-claude-text flex items-center gap-2">
                <Lock size={16} />
                Password Protection (Optional)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave empty for no password"
                className="input-field"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-claude-text-secondary">
                🔒 Viewers will need this password to access content
              </p>
            </div>

            {/* Max Views */}
            <div>
              <label className="block text-sm font-medium mb-2 text-claude-text flex items-center gap-2">
                <Hash size={16} />
                Maximum Views (Optional)
              </label>
              <input
                type="number"
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                placeholder="Unlimited"
                min="1"
                className="input-field"
                disabled={loading || isOneTime}
              />
              <p className="mt-1 text-xs text-claude-text-secondary">
                📊 Content will be deleted after this many views
              </p>
            </div>

            {/* One-Time View */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="one-time"
                checked={isOneTime}
                onChange={(e) => {
                  setIsOneTime(e.target.checked);
                  if (e.target.checked) setMaxViews('');
                }}
                className="mt-1"
                disabled={loading}
              />
              <div>
                <label htmlFor="one-time" className="block text-sm font-medium text-claude-text flex items-center gap-2">
                  <Eye size={16} />
                  One-Time View
                </label>
                <p className="text-xs text-claude-text-secondary mt-1">
                  👁️ Content will be automatically deleted after first view
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={18} />
              Generate Shareable Link
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;