import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSidebarEnter } from '../hooks/usePageTransition';
import {
    LayoutDashboard,
    Building2,
    BookText,
    Ship,
    Receipt,
    Files,
    Users,
    Factory,
    Info,
    BarChart3,
    ShoppingBag
} from 'lucide-react';

const Sidebar = () => {
    const { user } = useSelector(state => state.auth);
    const sidebarRef = useSidebarEnter();

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'FINANCE_MANAGER', 'EXPORT_MANAGER', 'PRODUCTION_MANAGER', 'PO_MANAGER', 'VIEWER'] },
        { name: 'PO Management', path: '/po-management', icon: <ShoppingBag size={20} />, roles: ['ADMIN', 'PO_MANAGER'] },
        { name: 'Organization', path: '/organization', icon: <Building2 size={20} />, roles: ['ADMIN'] },
        { name: 'Accounts', path: '/coa', icon: <BookText size={20} />, roles: ['ADMIN', 'FINANCE_MANAGER'] },
        { name: 'Buyers', path: '/buyers', icon: <Users size={20} />, roles: ['ADMIN'] },
        { name: 'Export/Import Orders', path: '/orders', icon: <Ship size={20} />, roles: ['ADMIN', 'EXPORT_MANAGER'] },
        { name: 'Invoices', path: '/invoices', icon: <Files size={20} />, roles: ['ADMIN', 'FINANCE_MANAGER', 'EXPORT_MANAGER'] },
        { name: 'Payments', path: '/payments', icon: <Receipt size={20} />, roles: ['ADMIN', 'FINANCE_MANAGER'] },
        { name: 'Reports', path: '/reports', icon: <BarChart3 size={20} />, roles: ['ADMIN', 'FINANCE_MANAGER'] },
        { name: 'Production', path: '/production', icon: <Factory size={20} />, roles: ['ADMIN', 'PRODUCTION_MANAGER'] },
        { name: 'Users', path: '/users', icon: <Users size={20} />, roles: ['ADMIN'] },
        { name: 'About', path: '/about', icon: <Info size={20} />, roles: ['ADMIN', 'FINANCE_MANAGER', 'EXPORT_MANAGER', 'PRODUCTION_MANAGER', 'VIEWER'] },
    ];

    const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

    return (
        <div className="sidebar" ref={sidebarRef}>
            <div className="px-4 mb-4">
                <h4 className="text-white d-flex align-items-center gap-2">
                    <Factory size={24} />
                    FINACCURA
                </h4>
                <small className="text-bold" style={{ fontSize: '0.7rem', fontFamily: "poppins" }}>
                    {user?.role?.replace('_', ' ')}
                </small>
            </div>
            <nav>
                {filteredItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => isActive ? 'active' : ''}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
