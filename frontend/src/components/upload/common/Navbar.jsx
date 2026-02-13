import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Upload, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-claude-surface border-b border-claude-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🔐</span>
            <span className="text-xl font-bold text-claude-text">LinkVault</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/upload"
                  className="flex items-center gap-2 px-4 py-2 text-claude-text hover:text-claude-accent transition-colors"
                >
                  <Upload size={18} />
                  <span>Upload</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-claude-text hover:text-claude-accent transition-colors"
                >
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-claude-border">
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-claude-text-secondary" />
                    <span className="text-sm text-claude-text">{user.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-claude-text-secondary hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm px-4 py-2">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;