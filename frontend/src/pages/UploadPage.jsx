import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import UploadForm from '../components/upload/UploadForm';

const UploadPage = () => {
  const [uploadedContent, setUploadedContent] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleUploadSuccess = (data) => {
    setUploadedContent(data);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(uploadedContent.share_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNewUpload = () => {
    setUploadedContent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      {uploadedContent ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="text-green-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Link Created Successfully!
              </h2>
              <p className="text-gray-600">
                Share this link with anyone you want to give access
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 font-mono break-all flex-1">
                  {uploadedContent.share_url}
                </p>
                <button
                  onClick={handleCopy}
                  className="ml-4 p-2 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                  title="Copy link"
                >
                  {copied ? (
                    <Check size={20} className="text-green-600" />
                  ) : (
                    <Copy size={20} className="text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-gray-500">Content Type</p>
                <p className="font-medium capitalize">{uploadedContent.content_type}</p>
              </div>
              <div>
                <p className="text-gray-500">Expires In</p>
                <p className="font-medium">{uploadedContent.expires_in_minutes} minutes</p>
              </div>
              {uploadedContent.has_password && (
                <div>
                  <p className="text-gray-500">Password Protected</p>
                  <p className="font-medium text-orange-600">Yes</p>
                </div>
              )}
              {uploadedContent.is_one_time && (
                <div>
                  <p className="text-gray-500">One-Time View</p>
                  <p className="font-medium text-orange-600">Yes</p>
                </div>
              )}
              {uploadedContent.max_views && (
                <div>
                  <p className="text-gray-500">Max Views</p>
                  <p className="font-medium">{uploadedContent.max_views}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleNewUpload}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Another Link
            </button>
          </div>
        </div>
      ) : (
        <UploadForm onUploadSuccess={handleUploadSuccess} />
      )}
    </div>
  );
};

export default UploadPage;