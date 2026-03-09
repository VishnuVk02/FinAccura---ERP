import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const MainLayout = ({ children }) => {
    const { user, loading } = useSelector(state => state.auth);

    if (loading) return <div className="p-5 text-center">Loading...</div>;
    if (!user) return <Navigate to="/login" />;

    return (
        <div className="main-container">
            <Sidebar />
            <div className="content-area">
                <Header />
                <div className="px-4 py-2">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default MainLayout;
