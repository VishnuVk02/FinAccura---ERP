import React from 'react';
import { Navbar, Container, Nav, Dropdown } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { User as UserIcon, LogOut, Bell } from 'lucide-react';
import { Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Header = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { notificationCount, financeNotificationCount } = useSelector(state => state.po);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role === 'PRODUCTION_MANAGER') {
            dispatch({ type: 'po/fetchNotificationCount' });
            const interval = setInterval(() => {
                dispatch({ type: 'po/fetchNotificationCount' });
            }, 60000);
            return () => clearInterval(interval);
        }
        if (user?.role === 'FINANCE_MANAGER') {
            dispatch({ type: 'po/fetchFinanceNotificationCount' });
            const interval = setInterval(() => {
                dispatch({ type: 'po/fetchFinanceNotificationCount' });
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [user, dispatch]);

    const handleLogout = () => {
        dispatch(logout());
    };

    return (
        <Navbar bg="white" expand="lg" className="border-bottom sticky-top">
            <Container fluid>
                <div className="d-flex align-items-center gap-3 ms-auto">
                    {user?.role === 'PRODUCTION_MANAGER' && (
                        <div
                            className="position-relative cursor-pointer p-2 rounded-circle bg-light"
                            onClick={() => navigate('/production?tab=inbound')}
                            title="New Orders Waiting for Production"
                        >
                            <Bell size={20} className="text-dark" />
                            {notificationCount > 0 && (
                                <Badge
                                    pill
                                    bg="danger"
                                    className="position-absolute top-0 start-100 translate-middle"
                                    style={{ fontSize: '0.65rem' }}
                                >
                                    {notificationCount}
                                </Badge>
                            )}
                        </div>
                    )}
                    {user?.role === 'FINANCE_MANAGER' && (
                        <div
                            className="position-relative cursor-pointer p-2 rounded-circle bg-light"
                            onClick={() => {
                                dispatch({ type: 'po/markSeenFinance' });
                                navigate('/invoices');
                            }}
                            title="New Orders Ready for Invoicing"
                        >
                            <Bell size={20} className="text-dark" />
                            {financeNotificationCount > 0 && (
                                <Badge
                                    pill
                                    bg="danger"
                                    className="position-absolute top-0 start-100 translate-middle"
                                    style={{ fontSize: '0.65rem' }}
                                >
                                    {financeNotificationCount}
                                </Badge>
                            )}
                        </div>
                    )}
                    <Dropdown align="end">
                        <Dropdown.Toggle variant="light" className="d-flex align-items-center gap-2 border-0 bg-transparent">
                            <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-dark">{user?.username} ({user?.role?.replace('_', ' ')?.replace('EXPORT', 'EXPORT/IMPORT')})</span>
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                            <Dropdown.Item onClick={handleLogout} className="d-flex align-items-center gap-2">
                                <LogOut size={16} /> Logout
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </Container>
        </Navbar>
    );
};

export default Header;
