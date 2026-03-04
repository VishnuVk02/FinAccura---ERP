import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Alert } from 'react-bootstrap';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useSelector(state => state.auth);

    if (loading) return <div className="p-5 text-center">Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    // If no specific roles required, allow all authenticated users
    if (!allowedRoles || allowedRoles.length === 0) {
        return children;
    }

    // Check if user's role is in the allowed list
    if (!allowedRoles.includes(user.role)) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
                <div className="text-center">
                    <ShieldAlert size={64} className="text-danger mb-3" />
                    <h3 className="text-danger">Access Denied</h3>
                    <p className="text-muted mb-4">
                        You don't have permission to access this section.
                        <br />
                        Your role: <strong>{user.role}</strong>
                    </p>
                    <Alert variant="warning" className="d-inline-block">
                        Contact your administrator if you believe this is an error.
                    </Alert>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
