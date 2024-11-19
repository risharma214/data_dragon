import React from 'react';
import { 
  Search, 
  Plus,
  Table,
  User,
  Settings,
  Clock
} from 'lucide-react';

const DashboardPage = ({ onNewProject, onOpenProject }) => {
  const projects = [
    {
      id: 1,
      name: "GMP",
      tables: 8,
      lastEdited: "2 hours ago"
    },
    {
      id: 2,
      name: "Some Other Data",
      tables: 12,
      lastEdited: "Yesterday"
    },
    {
      id: 3,
      name: "Financial Report 🤷‍♂️",
      tables: 5,
      lastEdited: "3 days ago"
    },
    {
      id: 4,
      name: "Annual Report Tables",
      tables: 15,
      lastEdited: "1 week ago"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
              DigiTables
            </div>
            <div className="flex items-center gap-6">
              <button className="text-gray-500 hover:text-gray-900 transition-colors">
                <Settings size={20} />
              </button>
              <div className="h-10 w-10 bg-gray-900 rounded-full flex items-center justify-center text-white">
                <User size={20} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* New Project Section */}
        <div className="mb-12">
          <h2 className="text-lg font-medium text-gray-900 mb-4">New project</h2>
          <button 
            onClick={onNewProject}
            className="w-60 h-40 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-3 relative overflow-hidden group hover:border-transparent transition-colors duration-300"
          >
            {/* Gradient border on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
              background: 'linear-gradient(to right, #ec4899, #3b82f6, #a855f7)',
              padding: '2px'
            }}>
              <div className="w-full h-full bg-white rounded-lg" />
            </div>

            {/* Content with hover effects */}
            <div className="relative flex flex-col items-center gap-3">
              <div className="relative">
                <Plus size={24} className="text-gray-400 group-hover:text-blue-500 transition-colors duration-300 group-hover:scale-110 transform" />
                <div className="absolute inset-0 bg-blue-500/10 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-blue-500 transition-colors duration-300 relative">
                New Project
                <span className="absolute inset-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-full h-0.5 bottom-0 bg-gradient-to-r from-pink-500 via-blue-500 to-purple-500 transition-all duration-300 opacity-0 group-hover:opacity-100" />
              </span>
            </div>

            {/* Background hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Recent projects</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Search projects..."
                className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50/50"
              />
            </div>
          </div>
          
          <div 
            className="grid gap-5"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gridAutoRows: '160px'
            }}
          >
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onOpenProject(project.id)}
                className="group text-left w-full h-full"
              >
                <div className="w-full h-full rounded-lg border border-gray-200 p-4 transition-all duration-300 relative bg-white">
                  {/* Gradient border on hover */}
                  <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                    background: 'linear-gradient(to right, #ec4899, #3b82f6, #a855f7)',
                    padding: '1px'
                  }}>
                    <div className="w-full h-full bg-white rounded-lg" />
                  </div>
                  
                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-between">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {project.name}
                    </h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Table size={14} />
                        <span>{project.tables} tables</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={14} />
                        <span>{project.lastEdited}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
