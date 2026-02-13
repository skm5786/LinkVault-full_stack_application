import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Upload, Lock, Clock, Shield, Eye, Trash2 } from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            🔐 LinkVault
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Share files and text securely with temporary, password-protected links.
            Your content, your control.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to={isAuthenticated ? "/upload" : "/register"}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Clock className="text-blue-600" size={32} />}
            title="Auto-Expiring Links"
            description="Set custom expiration times from 10 minutes to 30 days. Content automatically deletes after expiry."
          />
          <FeatureCard
            icon={<Lock className="text-blue-600" size={32} />}
            title="Password Protection"
            description="Add an extra layer of security with password-protected links. Only those with the password can access."
          />
          <FeatureCard
            icon={<Eye className="text-blue-600" size={32} />}
            title="One-Time Links"
            description="Create links that self-destruct after first view. Perfect for highly sensitive information."
          />
          <FeatureCard
            icon={<Shield className="text-blue-600" size={32} />}
            title="View Limits"
            description="Control how many times your content can be accessed. Automatically deleted after max views."
          />
          <FeatureCard
            icon={<Trash2 className="text-blue-600" size={32} />}
            title="Manual Delete"
            description="Changed your mind? Delete your content anytime before it expires from your dashboard."
          />
          <FeatureCard
            icon={<Upload className="text-blue-600" size={32} />}
            title="Files & Text"
            description="Share files up to 50MB or paste text content. Support for images, documents, and more."
          />
        </div>

        {/* How It Works */}
        <div className="mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Upload Content"
              description="Choose a file or paste text. Set expiration time and optional password."
            />
            <StepCard
              number="2"
              title="Get Your Link"
              description="Receive a unique, secure link to share with anyone you choose."
            />
            <StepCard
              number="3"
              title="Share Safely"
              description="Content automatically deletes after expiry or view limit. You stay in control."
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center bg-blue-600 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to share securely?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Create your first secure link in seconds. No credit card required.
          </p>
          <Link
            to={isAuthenticated ? "/upload" : "/register"}
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Start Sharing Now
          </Link>
        </div>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const StepCard = ({ number, title, description }) => (
  <div className="text-center">
    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
      {number}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default HomePage;