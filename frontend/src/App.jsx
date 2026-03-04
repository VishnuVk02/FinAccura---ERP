import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from './store/slices/authSlice';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Organization from './pages/Organization';
import COA from './pages/COA';
import ExportOrders from './pages/ExportOrders';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import Buyers from './pages/Buyers';
import Reports from './pages/Reports';
import UsersPage from './pages/Users';
import Production from './pages/Production';
import About from './pages/About';
import POManagement from './pages/POManagement';

function App() {
    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(initializeAuth());
    }, [dispatch]);

    if (loading) return <div className="p-5 text-center">Loading Application...</div>;

    return (
        <>
            <Toaster position="top-right" reverseOrder={false} />
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={
                        <MainLayout>
                            <Dashboard />
                        </MainLayout>
                    } />

                    <Route path="/po-management" element={
                        <MainLayout>
                            <ProtectedRoute allowedRoles={['ADMIN', 'PO_MANAGER']}>
                                <POManagement />
                            </ProtectedRoute>
                        </MainLayout>
                    } />

                    <Route path="/organization" element={
                        <MainLayout>
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <Organization />
                            </ProtectedRoute>
                        </MainLayout>
                    } />

                    <Route path="/coa" element={
                        <MainLayout>
                            <ProtectedRoute allowedRoles={['ADMIN', 'FINANCE_MANAGER']}>
                                <COA />
                            </ProtectedRoute>
                        </MainLayout>
                    } />

                    <Route path="/orders" element={
                        <MainLayout>
                            <ProtectedRoute allowedRoles={['ADMIN', 'EXPORT_MANAGER']}>
                                <ExportOrders />
                            </ProtectedRoute>
                        </MainLayout>
                    } />

                    <Route path="/buyers" element={
                        <MainLayout>
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <Buyers />
                            </ProtectedRoute>
                        </MainLayout>
                    } />

                    <Route path="/invoices" element={
                        <MainLayout>
                            <ProtectedRoute allowedRoles={['ADMIN', 'FINANCE_MANAGER', 'EXPORT_MANAGER']}>
                                <Invoices />
                            </ProtectedRoute>
                        </MainLayout>
                    } />

                    <Route path="/payments" element={
                        <MainLayout>
                            <ProtectedRoute allowedRoles={['ADMIN', 'FINANCE_MANAGER']}>
                                <Payments />
                            </ProtectedRoute>
                        </MainLayout>
                    } />

                    <Route path="/reports" element={
                        <MainLayout>
                            <ProtectedRoute allowedRoles={['ADMIN', 'FINANCE_MANAGER']}>
                                <Reports />
                            </ProtectedRoute>
                        </MainLayout>
                    } />

                    <Route path="/production" element={
                        <MainLayout>
                            <ProtectedRoute allowedRoles={['ADMIN', 'PRODUCTION_MANAGER']}>
                                <Production />
                            </ProtectedRoute>
                        </MainLayout>
                    } />

                    <Route path="/users" element={
                        <MainLayout>
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <UsersPage />
                            </ProtectedRoute>
                        </MainLayout>
                    } />

                    <Route path="/about" element={
                        <MainLayout>
                            <About />
                        </MainLayout>
                    } />
                </Routes>
            </Router>
        </>
    );
}

export default App;
