import React, { useState } from 'react';
import { LogIn, ArrowLeft, User } from 'lucide-react';

const LoginPage = ({ onBack, onLogin }) => {
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'

  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center h-20 px-4 sm:px-6 lg:px-8">
            <button 
              onClick={onBack}
              className="mr-8 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              DigiTables
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-12 relative">
          {/* Subtle gradient blur in background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-x-0 top-0 h-96 w-full bg-gradient-to-r from-pink-100/30 via-blue-100/30 to-purple-100/30 blur-3xl opacity-50" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600">
            {authMode === 'signin' 
              ? 'Sign in to access your digitized tables and projects'
              : 'Start your journey to effortless table digitization'
            }
          </p>
        </div>

        {/* Auth Options */}
        <div className="space-y-4 mb-8">
          <button className="w-full bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all">
            <User size={20} />
            Continue with Google
          </button>
          <button className="w-full bg-black text-white px-6 py-4 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-gray-900 transition-colors">
            <User size={20} />
            Continue with GitHub
          </button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">or continue with email</span>
          </div>
        </div>

        {/* Email Form */}
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <input 
              type="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="you@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input 
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              placeholder="••••••••"
            />
          </div>

          {authMode === 'signin' && (
            <div className="flex items-center justify-end">
              <button className="text-sm text-blue-500 hover:text-blue-600 transition-colors">
                Forgot password?
              </button>
            </div>
          )}

          <button 
            onClick={onLogin}
            className="w-full bg-black text-white px-6 py-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors"
          >
            <LogIn size={20} />
            {authMode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Auth Mode */}
        <p className="mt-8 text-center text-gray-600">
          {authMode === 'signin' ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
            className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
          >
            {authMode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </main>
    </div>
  );
};

export default LoginPage;
