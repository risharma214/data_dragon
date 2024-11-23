import React, { useState } from 'react';
import { LogIn, ArrowLeft, Github } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

const GoogleIcon = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    className={className}
    fill="currentColor"
  >
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const LoginPage = () => {
  const [authMode, setAuthMode] = useState('signin');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      console.log('Google login successful:', tokenResponse);
      
      // For now, just store the access token
      localStorage.setItem('googleToken', tokenResponse.access_token);
      
      // Add debug log
      console.log('Attempting to navigate to dashboard...');
      
      // Navigate to dashboard
      navigate('/dashboard');
      
      // Confirm navigation was called
      console.log('Navigation called');
    } catch (err) {
      setError('Failed to authenticate with Google. Please try again.');
      console.error('Google authentication error:', err);
    }
  };

  const login = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => {
      setError('Failed to authenticate with Google. Please try again.');
    },
  });

  return(
    <div className="min-h-screen bg-white">
      {/* Header section */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center h-20 px-4 sm:px-6 lg:px-8">
            <button 
              onClick={handleBack}
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
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <div className="text-center mb-12 relative">
          {/* Background gradient */}
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
          <button 
            onClick={() => login()}  // Added the onClick handler here
            className="w-full bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all"
          >
            <GoogleIcon size={20} />
            Continue with Google
          </button>
          <button className="w-full bg-black text-white px-6 py-4 rounded-xl font-medium flex items-center justify-center gap-3 hover:bg-gray-900 transition-colors">
            <Github size={20} />
            Continue with GitHub
          </button>
        </div>

        {/* Rest of the component remains the same... */}
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
            // onClick={onLogin}
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