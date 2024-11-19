import './App.css';  // or './App.css' depending on where you put the directives
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';  // Import the Header component
import HomePage from './components/HomePage';  // Import the HomePage component
import Editor from './components/Editor';  // Import the Editor component
import Login from './components/LoginPage'
import Dashboard from './components/Dashboard'
import Workspace from './components/Workspace'
import NewProject from './components/NewProject'

function App() {
  return (
    <Router>
      <div className="App">
        {/* Include Header at the top of the page */}
        {/* <Header /> */}
        
        {/* Define Routes */}
        <Routes>
          <Route path="/" element={<NewProject />} />  {/* HomePage Route */}
          <Route path="/editor" element={<Editor />} />  {/* Editor Route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
