import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const user = localStorage.getItem('user');
    
    if (!user) {
        // Redirect them to the login page
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;