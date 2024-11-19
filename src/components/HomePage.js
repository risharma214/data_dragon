import React from 'react';
import { Upload, LogIn, ArrowRight } from 'lucide-react';

const LandingPage = ({ onLogin, onGuest }) => {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-right gradient blob */}
        <div 
          className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full"
          style={{
            background: 'linear-gradient(to bottom right, rgba(236, 72, 153, 0.03), rgba(59, 130, 246, 0.03), rgba(168, 85, 247, 0.03))',
            filter: 'blur(80px)',
          }}
        />
        
        {/* Bottom-left gradient blob */}
        <div 
          className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 rounded-full"
          style={{
            background: 'linear-gradient(to top left, rgba(236, 72, 153, 0.03), rgba(59, 130, 246, 0.03), rgba(168, 85, 247, 0.03))',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-4xl font-bold bg-gradient-to-r text-gray-950 bg-clip-text text-transparent">
              DigiTables
            </div>
            <button 
              onClick={onLogin}
              className="group relative bg-black text-white px-8 py-4 rounded-full font-semibold flex items-center justify-center gap-2 overflow-hidden"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center mb-16 relative">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6">
            Transform PDF tables into
            <span className="block mt-2 bg-gradient-to-r from-pink-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              Actionable Data
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            Turn your PDF tables into structured, editable data in seconds. 
            Smart AI detection meets intuitive editing for perfect results.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={onGuest}
              className="group relative bg-black text-white px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 overflow-hidden"
            >
              {/* Button Gradient Hover Effect */}
              <div className="absolute inset-0 w-full h-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                   style={{
                     background: 'linear-gradient(to right, #ec4899, #3b82f6, #a855f7)',
                     opacity: 0,
                   }}
              />
              <div className="relative flex items-center gap-2">
                <Upload size={20} />
                Try Free as Guest
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </div>
            </button>
            <button 
              onClick={onLogin}
              className="relative group px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-white hover:bg-gray-50 transition-colors"
              style={{
                boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            >
              <LogIn size={20} />
              Log In to see Projects
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Instant Detection",
              description: "Advanced AI automatically identifies and extracts tables from your PDFs"
            },
            {
              title: "Smart Recognition",
              description: "Accurate text and structure recognition with built-in error correction"
            },
            {
              title: "Easy Refinement",
              description: "Intuitive spreadsheet interface for reviewing and perfecting results"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="relative group bg-white rounded-xl p-6 transition-all duration-300"
              style={{
                boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)'
              }}
            >
              {/* Card Hover Effect */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   style={{
                     background: 'linear-gradient(to right, #ec4899, #3b82f6, #a855f7)',
                     padding: '1px'
                   }}>
                <div className="w-full h-full bg-white rounded-xl" />
              </div>
              
              {/* Content */}
              <div className="relative">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="mt-24 text-center">
          <p className="text-gray-500 font-medium mb-8">Trusted by data professionals worldwide</p>
          <div className="flex justify-center items-center gap-12 opacity-50">
            {[1, 2, 3, 4].map((logo) => (
              <div 
                key={logo}
                className="h-12 w-32 bg-gray-100 rounded-lg flex items-center justify-center"
              >
                <span className="text-gray-400">Logo {logo}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;