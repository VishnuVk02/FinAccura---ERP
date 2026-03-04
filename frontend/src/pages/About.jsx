import React, { useEffect, useRef } from 'react';
import { Row, Col, Card, Badge } from 'react-bootstrap';
import gsap from 'gsap';
import { useSelector } from 'react-redux';
import {
    LayoutDashboard, Building2, BookText, Ship, Files, Receipt,
    BarChart3, Factory, Users, Shield, ArrowRight, CheckCircle,
    Info, UserCheck, Eye, DollarSign, Wrench
} from 'lucide-react';

const About = () => {
    const { user } = useSelector(state => state.auth);
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            const sections = containerRef.current.querySelectorAll('.about-section');
            gsap.fromTo(sections,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
            );
        }
    }, []);

    const modules = [
        {
            name: 'Dashboard',
            icon: <LayoutDashboard size={28} />,
            color: '#6366f1',
            description: 'Your command center — see overall business health at a glance.',
            details: [
                'Total Revenue, Expenses, and Net Profit',
                'Pending invoices count',
                'Revenue vs Payments chart (monthly)',
                'Buyer-wise revenue breakdown',
                'Invoice and Order status distribution',
                'Production overview (for production managers)'
            ]
        },
        {
            name: 'Organization',
            icon: <Building2 size={28} />,
            color: '#06b6d4',
            description: 'Manage your company information and financial year settings.',
            details: [
                'Set company name, address, and contact details',
                'Manage financial years (start date, end date)',
                'Define measurement units (PCS, Dozen, Meters)'
            ]
        },
        {
            name: 'Chart of Accounts',
            icon: <BookText size={28} />,
            color: '#10b981',
            description: 'The accounting backbone — organize all financial accounts in a structured hierarchy.',
            details: [
                'Main Groups: Assets, Liabilities, Income, Expense',
                'Groups: Current Assets, Fixed Assets, Direct Expenses, etc.',
                'Sub Groups: Bank Accounts, Raw Materials, Labour Wages, etc.',
                'Individual Accounts: HDFC Bank, Fabric Purchase, Sewing Wages, etc.',
                'Every transaction links to these accounts for proper bookkeeping'
            ]
        },
        {
            name: 'Export/Import Orders',
            icon: <Ship size={28} />,
            color: '#8b5cf6',
            description: 'Track orders from international buyers — from creation to shipment.',
            details: [
                'Create orders with buyer, quantity, price, and delivery date',
                'Track order status: Created → Shipped → Completed',
                'Link orders to specific buyers and financial years',
                'View all orders with filtering and status tracking'
            ]
        },
        {
            name: 'Invoices',
            icon: <Files size={28} />,
            color: '#f59e0b',
            description: 'Generate and manage invoices for shipped orders.',
            details: [
                'Create invoices linked to export orders',
                'Track invoice status: Pending, Partial, Paid',
                'View outstanding amounts per invoice',
                'Link invoices to payment records'
            ]
        },
        {
            name: 'Payments',
            icon: <Receipt size={28} />,
            color: '#ef4444',
            description: 'Record and track all incoming payments from buyers.',
            details: [
                'Record payments against specific invoices',
                'Track payment mode: Bank Transfer, Cheque, etc.',
                'Link payments to bank accounts from Chart of Accounts',
                'View payment history with reference numbers'
            ]
        },
        {
            name: 'Reports',
            icon: <BarChart3 size={28} />,
            color: '#0ea5e9',
            description: 'Financial reports for analysis and decision-making.',
            details: [
                'Ledger Report: Account-wise transaction history',
                'Trial Balance: Debit vs Credit summary for all accounts',
                'Useful for auditing and financial review'
            ]
        },
        {
            name: 'Production',
            icon: <Factory size={28} />,
            color: '#ea580c',
            description: 'Monitor garment production across all lines and sections.',
            details: [
                'View production lines with capacity and worker count',
                'Track production orders with progress percentage',
                'Daily output vs target charts',
                'Efficiency tracking by line and section',
                'Defect rate monitoring and trend analysis',
                'Sections: Cutting → Sewing → Finishing → Packing'
            ]
        },
        {
            name: 'User Management',
            icon: <Users size={28} />,
            color: '#dc2626',
            description: 'Admin-only section to manage user accounts and roles.',
            details: [
                'Create and delete user accounts',
                'Assign roles to control access',
                'View all registered users'
            ]
        }
    ];

    const rolesInfo = [
        { name: 'Admin', icon: <Shield size={20} />, color: '#ef4444', access: 'Full access to all modules, user management, and system settings.' },
        { name: 'Finance Manager', icon: <DollarSign size={20} />, color: '#10b981', access: 'Dashboard, Chart of Accounts, Invoices, Payments, and Financial Reports.' },
        { name: 'Production Manager', icon: <Wrench size={20} />, color: '#f59e0b', access: 'Dashboard (production overview) and full Production module.' },
        { name: 'Export/Import Manager', icon: <Ship size={20} />, color: '#6366f1', access: 'Dashboard, Organization, Export/Import Orders, and Invoices.' },
        { name: 'Viewer', icon: <Eye size={20} />, color: '#8b5cf6', access: 'Dashboard only (read-only, limited data).' },
    ];

    const workflow = [
        { step: 1, title: 'Setup Organization', desc: 'Enter company details, create financial year, and define units of measurement.' },
        { step: 2, title: 'Build Chart of Accounts', desc: 'Create account groups and individual accounts for tracking money flow (income, expense, assets, liabilities).' },
        { step: 3, title: 'Add Buyers', desc: 'Register international buyers with their country, currency, contact, and payment terms.' },
        { step: 4, title: 'Create Export/Import Orders', desc: 'When a buyer places an order, create it with quantity, price, and delivery date.' },
        { step: 5, title: 'Start Production', desc: 'Production manager tracks cutting, sewing, finishing — monitoring efficiency, output, and defects daily.' },
        { step: 6, title: 'Generate Invoice', desc: 'Once the order is shipped, generate an invoice for the buyer with the total amount.' },
        { step: 7, title: 'Record Payments', desc: 'When the buyer pays (full or partial), record the payment against the invoice.' },
        { step: 8, title: 'Review Reports', desc: 'Finance manager reviews ledger reports and trial balance for financial health of the business.' },
    ];

    return (
        <div ref={containerRef}>
            {/* Header */}
            <div className="about-section text-center mb-5">
                <div className="d-inline-block p-3 rounded-circle mb-3" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                    <Info size={40} color="white" />
                </div>
                <h2 className="fw-bold">About Garment ERP</h2>
                <p className="text-muted mx-auto" style={{ maxWidth: 600 }}>
                    A complete Enterprise Resource Planning system designed for garment manufacturing companies.
                    Manage orders, production, invoicing, payments, and financial reporting — all in one place.
                </p>
                <Badge bg="primary" className="px-3 py-2">Logged in as: {user?.username} ({user?.role?.replace('_', ' ')})</Badge>
            </div>

            {/* Modules */}
            <div className="about-section mb-5">
                <h3 className="mb-4 d-flex align-items-center gap-2">
                    <LayoutDashboard size={24} /> System Modules
                </h3>
                <Row>
                    {modules.map((mod, idx) => (
                        <Col lg={4} md={6} key={idx} className="mb-4">
                            <Card className="border-0 shadow-sm h-100 card-hover">
                                <Card.Body>
                                    <div className="d-flex align-items-center gap-3 mb-3">
                                        <div className="rounded-3 d-flex align-items-center justify-content-center"
                                            style={{ width: 48, height: 48, backgroundColor: mod.color + '15' }}>
                                            {React.cloneElement(mod.icon, { color: mod.color })}
                                        </div>
                                        <h5 className="mb-0">{mod.name}</h5>
                                    </div>
                                    <p className="text-muted small mb-2">{mod.description}</p>
                                    <ul className="list-unstyled mb-0">
                                        {mod.details.map((d, i) => (
                                            <li key={i} className="small mb-1 d-flex align-items-start gap-2">
                                                <CheckCircle size={14} className="flex-shrink-0 mt-1" style={{ color: mod.color }} />
                                                {d}
                                            </li>
                                        ))}
                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Roles */}
            <div className="about-section mb-5">
                <h3 className="mb-4 d-flex align-items-center gap-2">
                    <UserCheck size={24} /> User Roles & Access
                </h3>
                <Row>
                    {rolesInfo.map((role, idx) => (
                        <Col md={6} lg={4} key={idx} className="mb-3">
                            <Card className="border-0 shadow-sm h-100" style={{ borderLeft: `4px solid ${role.color}` }}>
                                <Card.Body className="d-flex align-items-start gap-3">
                                    <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                                        style={{ width: 40, height: 40, backgroundColor: role.color + '15' }}>
                                        {React.cloneElement(role.icon, { color: role.color })}
                                    </div>
                                    <div>
                                        <h6 className="mb-1">{role.name}</h6>
                                        <p className="text-muted small mb-0">{role.access}</p>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* Workflow */}
            <div className="about-section mb-5">
                <h3 className="mb-4 d-flex align-items-center gap-2">
                    <ArrowRight size={24} /> How It Works — Step by Step
                </h3>
                <div className="workflow-timeline">
                    {workflow.map((w, idx) => (
                        <div key={idx} className="d-flex align-items-start gap-3 mb-4">
                            <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fw-bold text-white"
                                style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #667eea, #764ba2)', fontSize: '0.9rem' }}>
                                {w.step}
                            </div>
                            <div>
                                <h6 className="mb-1">{w.title}</h6>
                                <p className="text-muted small mb-0">{w.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <Card className="border-0 text-center py-3" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Card.Body className="text-white">
                    <p className="mb-0">
                        <strong>Garment ERP</strong> — Built for efficiency, designed for simplicity.
                    </p>
                </Card.Body>
            </Card>
        </div>
    );
};

export default About;
