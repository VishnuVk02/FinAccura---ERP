import React, { useState } from 'react';
import { Nav, Card, Badge } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    Factory, ClipboardList, PlusCircle, BarChart2, Users,
    LayoutDashboard, Info
} from 'lucide-react';
import { useEffect } from 'react';

import Lines from './production/Lines';
import Orders from './production/Orders';
import DailyEntry from './production/DailyEntry';
import Progress from './production/Progress';
import Workers from './production/Workers';
import POInbound from './production/POInbound';
import { ShoppingBag, Calendar } from 'lucide-react';

import { usePageEnter } from '../hooks/usePageTransition';

const Production = () => {
    const [searchParams] = useSearchParams();
    const initialTab = searchParams.get('tab') || 'progress';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [commonDate, setCommonDate] = useState(new Date().toISOString().split('T')[0]);
    const pageRef = usePageEnter();
    const dispatch = useDispatch();

    const tabs = [
        { id: 'progress', label: 'Order Progress', icon: <BarChart2 size={18} />, component: <Progress /> },
        { id: 'lines', label: 'Lines Management', icon: <Factory size={18} />, component: <Lines /> },
        { id: 'orders', label: 'Production Orders', icon: <ClipboardList size={18} />, component: <Orders /> },
        { id: 'daily', label: 'Daily Entry', icon: <PlusCircle size={18} />, component: <DailyEntry commonDate={commonDate} /> },
        { id: 'workers', label: 'Worker Allocation', icon: <Users size={18} />, component: <Workers commonDate={commonDate} /> },
        { id: 'inbound', label: 'Inbound POs', icon: <ShoppingBag size={18} />, component: <POInbound /> },
    ];

    useEffect(() => {
        if (activeTab === 'inbound') {
            dispatch({ type: 'po/markSeenByProduction' });
        }
    }, [activeTab, dispatch]);

    return (
        <div ref={pageRef} className="pb-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h2 className="mb-1 d-flex align-items-center gap-2">
                        <Factory size={28} className="text-primary" /> Production Operations
                    </h2>
                    <p className="text-muted mb-0 small">Manage end-to-end garment production activities and tracking.</p>
                </div>
                <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2 bg-white border rounded px-2 py-1 shadow-sm">
                        <Calendar size={16} className="text-primary" />
                        <input
                            type="date"
                            className="border-0 shadow-none small fw-semibold"
                            style={{ outline: 'none', cursor: 'pointer' }}
                            value={commonDate}
                            onChange={(e) => setCommonDate(e.target.value)}
                        />
                    </div>
                    <div className="d-none d-md-block">
                        <Badge bg="light" text="dark" className="border px-3 py-2 fw-normal">
                            <Info size={14} className="me-2 text-primary" /> Standard Rate: 8 Pcs/Hr
                        </Badge>
                    </div>
                </div>
            </div>

            <Card className="border-0 shadow-sm mb-4 overflow-hidden">
                <Card.Header className="bg-white p-0 border-0">
                    <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="px-3 pt-2">
                        {tabs.map(tab => (
                            <Nav.Item key={tab.id}>
                                <Nav.Link eventKey={tab.id} className="d-flex align-items-center gap-2 px-4 py-3 border-0 rounded-0 transition-all">
                                    {tab.icon}
                                    <span className="fw-semibold">{tab.label}</span>
                                </Nav.Link>
                            </Nav.Item>
                        ))}
                    </Nav>
                </Card.Header>
                <Card.Body className="p-4 bg-white" style={{ minHeight: '600px' }}>
                    {tabs.find(t => t.id === activeTab)?.component}
                </Card.Body>
            </Card>

            <style>{`
                .nav-tabs .nav-link {
                    color: #64748b;
                    border-bottom: 3px solid transparent !important;
                }
                .nav-tabs .nav-link.active {
                    color: #6366f1 !important;
                    background: transparent !important;
                    border-bottom: 3px solid #6366f1 !important;
                }
                .nav-tabs .nav-link:hover:not(.active) {
                    border-bottom: 3px solid #e2e8f0 !important;
                }
            `}</style>
        </div>
    );
};

export default Production;
