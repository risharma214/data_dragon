import React, { useEffect, useState, useRef } from 'react';
import { 
  Search, 
  Plus,
  Table,
  User,
  Settings,
  Clock,
  LogOut 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Dialog from './Dialog';

const DashboardPage = ({ onNewProject, onOpenProject }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [activeProject, setActiveProject] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [projectToEdit, setProjectToEdit] = useState(null);
  const dropdownRef = useRef(null);



  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log('Full stored user data:', storedUser);
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            console.log('Parsed user data:', parsedUser);
            console.log('User ID from parsed data:', parsedUser.userId);
            setUserInfo(parsedUser);
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            navigate('/login');
        }
    } else {
        navigate('/login');
    }
  }, [navigate]);


  // Fetch projects when user info is available
  useEffect(() => {
    const fetchProjects = async () => {
      if (!userInfo?.userId) return;
    
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/projects?userId=${userInfo.userId}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
    
        const data = await response.json();
        
        // Log the received data for debugging
        console.log('Received projects:', data);
        
        setProjects(data);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    if (userInfo) {  // Only fetch if we have user info
      fetchProjects();
    } else {
      setLoading(false);  // Set loading to false if no user info
    }
  }, [userInfo]);


  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNewProject = () => {
    navigate('/new-project');
  };

  const handleOpenProject = (project) => {
    if (project.files && project.files.length > 0) {
      navigate(`/project/${project._id}/file/${project.files[0]._id}`);
    } else {
      navigate(`/project/${project._id}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');  // Only remove 'user'
    navigate('/');
  };

  // const handleRenameProject = async () => {
  //   try {
  //     console.log('Attempting to rename project:', activeProject._id, newProjectName); // Debug log
      
  //     const response = await fetch(`http://localhost:3001/api/projects/${activeProject._id}/rename`, {
  //       method: 'PATCH',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({ newName: newProjectName })
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.error || 'Failed to rename project');
  //     }

  //     const updatedProject = await response.json();

  //     // Update local state
  //     setProjects(projects.map(project => 
  //       project._id === activeProject._id 
  //         ? { ...project, name: updatedProject.name }
  //         : project
  //     ));

  //     setShowRenameDialog(false);
  //     setNewProjectName('');
      
  //   } catch (error) {
  //     console.error('Error renaming project:', error);
  //     // Add error handling here (e.g., show error message to user)
  //   }
  // };

  const handleRenameProject = async () => {
    console.log('Starting rename with:', { activeProject, newProjectName }); // Debug log
    
    if (!newProjectName.trim()) {
      console.log('Empty project name, aborting');
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:3001/api/projects/${activeProject._id}/rename`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newName: newProjectName.trim() })
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to rename project');
      }
  
      const updatedProject = await response.json();
      console.log('Rename successful:', updatedProject); // Debug log
  
      // Update local state
      setProjects(projects.map(project => 
        project._id === activeProject._id 
          ? { ...project, name: updatedProject.name }
          : project
      ));
  
      setShowRenameDialog(false);
      setNewProjectName('');
      
    } catch (error) {
      console.error('Error renaming project:', error);
      // Add error handling here (e.g., show error message to user)
    }
  };


  const handleDeleteProject = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/projects/${activeProject._id}`, {
        method: 'DELETE'
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete project');
      }
  
      // Update local state
      setProjects(projects.filter(project => project._id !== activeProject._id));
      
      setShowDeleteDialog(false);
      setActiveProject(null);
      
    } catch (error) {
      console.error('Error deleting project:', error);
      // You might want to show an error message to the user here
    }
  };
  
  // const RenameDialog = () => {
  //   const [localProjectName, setLocalProjectName] = useState(projectToEdit?.name || '');
  
  //   useEffect(() => {
  //     if (projectToEdit) {
  //       setLocalProjectName(projectToEdit.name);
  //     }
  //   }, [projectToEdit]);
  
  //   return (
  //     <Dialog 
  //       isOpen={showRenameDialog} 
  //       onClose={() => {
  //         setShowRenameDialog(false);
  //         setProjectToEdit(null);
  //       }}
  //     >
  //       <div className="p-6">
  //         <h3 className="text-lg font-medium mb-4">Rename Project</h3>
  //         <input
  //           type="text"
  //           value={localProjectName}
  //           onChange={(e) => setLocalProjectName(e.target.value)}
  //           placeholder="Enter new name"
  //           className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
  //         />
  //         <div className="flex justify-end gap-3">
  //           <button
  //             onClick={() => {
  //               setShowRenameDialog(false);
  //               setProjectToEdit(null);
  //             }}
  //             className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
  //           >
  //             Cancel
  //           </button>
  //           <button
  //             onClick={() => {
  //               handleRenameProject(localProjectName);
  //               setShowRenameDialog(false);
  //               setProjectToEdit(null);
  //             }}
  //             className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
  //           >
  //             Rename
  //           </button>
  //         </div>
  //       </div>
  //     </Dialog>
  //   );
  // };

  const RenameDialog = () => {
    const [localProjectName, setLocalProjectName] = useState(activeProject?.name || '');

    useEffect(() => {
      if (activeProject) {
        setLocalProjectName(activeProject.name);
      }
    }, [activeProject]);

    const handleRename = async () => {
      if (!localProjectName.trim()) return;

      try {
        const response = await fetch(`http://localhost:3001/api/projects/${activeProject._id}/rename`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ newName: localProjectName.trim() })
        });

        if (!response.ok) {
          throw new Error('Failed to rename project');
        }

        const updatedProject = await response.json();

        // Update local state
        setProjects(projects.map(project => 
          project._id === activeProject._id 
            ? { ...project, name: updatedProject.name }
            : project
        ));

        setShowRenameDialog(false);
        
      } catch (error) {
        console.error('Error renaming project:', error);
      }
    };

    return (
      <Dialog 
        isOpen={showRenameDialog} 
        onClose={() => setShowRenameDialog(false)}
      >
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Rename Project</h3>
          <input
            type="text"
            value={localProjectName}
            onChange={(e) => setLocalProjectName(e.target.value)}
            placeholder="Enter new name"
            className="w-full px-3 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowRenameDialog(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleRename}
              disabled={!localProjectName.trim()}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Rename
            </button>
          </div>
        </div>
      </Dialog>
    );
  };

  const DeleteDialog = () => (
    <Dialog 
      isOpen={showDeleteDialog} 
      onClose={() => setShowDeleteDialog(false)}
    >
      <div className="p-6">
        <h3 className="text-lg font-medium mb-2">Delete Project</h3>
        <p className="text-gray-500 mb-4">
          Are you sure you want to delete this project? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowDeleteDialog(false)}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteProject}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </Dialog>
  );

  
  
  // // Add dialogs to the return statement
  // {showRenameDialog && <RenameDialog />}
  // {showDeleteDialog && <DeleteDialog />}

  // Helper function to format dates
  const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffTime = Math.abs(now - past);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      return diffHours <= 1 ? 'Just now' : `${diffHours} hours ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    console.log(`diffdays = ${diffDays}`)
    console.log(`date recieved = ${date}`)
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="focus:outline-none"
                >
                  {userInfo?.picture ? (
                    <img 
                      src={userInfo.picture}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-transparent hover:ring-gray-200 transition-all"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gray-900 rounded-full flex items-center justify-center text-white">
                      <User size={20} />
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    {userInfo && (
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{userInfo.name}</p>
                        <p className="text-xs text-gray-500">{userInfo.email}</p>
                      </div>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                )}
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
            onClick={handleNewProject}
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
              <span className="text-sm font-medium text-gray-600 group-hover:text-blue-500 transition-colors duration-300">
                New Project
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
          
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              {error}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No projects yet. Create a new project to get started!
            </div>
          ) : (
            <div 
              className="grid gap-5"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gridAutoRows: '160px'
              }}
            >
              {projects.map((project) => (
                <div key={project._id || project.id} className="group relative">
                  {/* Project Card */}
                  <div 
                    onClick={() => handleOpenProject(project)}
                    className="w-full h-full rounded-lg border border-gray-200 p-4 transition-all duration-300 relative bg-white cursor-pointer"
                  >
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
                          <span>{formatTimeAgo(project.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* More Options Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveProject(project);
                      setShowDropdown(project._id === activeProject?._id ? !showDropdown : true);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all z-10"
                  >
                    <svg className="w-4 h-4 text-gray-500" viewBox="0 0 16 16">
                      <circle cx="8" cy="2.5" r="1.5" />
                      <circle cx="8" cy="8" r="1.5" />
                      <circle cx="8" cy="13.5" r="1.5" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && activeProject && activeProject._id === project._id && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-12 right-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDropdown(false);
                          setProjectToEdit(activeProject);
                          setShowRenameDialog(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Rename
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDropdown(false);
                          setShowDeleteDialog(true);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      {showRenameDialog && <RenameDialog />}
      {showDeleteDialog && <DeleteDialog />}
    </div>
  );
};

export default DashboardPage;