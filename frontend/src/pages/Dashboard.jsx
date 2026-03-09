import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, ProgressBar, Table, Button } from 'react-bootstrap';
import { DollarSign, BarChart3, TrendingUp, AlertCircle, ShoppingBag, CheckCircle, Clock, Factory, Users, Activity } from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardRequest } from '../store/slices/dashboardSlice';
import { usePageEnter, useStaggerEnter, useChartEnter } from '../hooks/usePageTransition';

const COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];

const Dashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const {
        generalStats: stats,
        productionStats,
        financeStats,
        exportStats,
        poStats,
        loading
    } = useSelector(state => state.dashboard);

    const [selectedStatus, setSelectedStatus] = useState(null);
    const statusList = [
        'CREATED',
        'IN_PRODUCTION',
        'PRODUCTION_COMPLETED',
        'READY_FOR_EXPORT',
        'EXPORTED',
        'PAYMENT_PENDING',
        'PAYMENT_COMPLETED'
    ];
    const STATUS_COLORS = {
        'CREATED': '#6c757d',
        'IN_PRODUCTION': '#0d6efd',
        'PRODUCTION_COMPLETED': '#0dcaf0',
        'READY_FOR_EXPORT': '#ffc107',
        'EXPORTED': '#212529',
        'PAYMENT_PENDING': '#dc3545',
        'PAYMENT_COMPLETED': '#198754'
    };
    const productionCharts = productionStats || null;
    const summaryStats = productionStats?.summary || null;

    const pageRef = usePageEnter([loading]);
    const cardsRef = useStaggerEnter('.stat-card', [loading]);

    useEffect(() => {
        dispatch(fetchDashboardRequest());
    }, [dispatch, user?.role]);

    if (loading) return <div className="p-5 text-center">Loading Dashboard...</div>;

    const financeCards = [
        { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign />, color: '#10b981', bg: '#ecfdf5' },
        { title: 'Total Expense', value: `₹${stats.totalExpense.toLocaleString()}`, icon: <TrendingUp />, color: '#ef4444', bg: '#fef2f2' },
        { title: 'Net Profit', value: `₹${stats.netProfit.toLocaleString()}`, icon: <BarChart3 />, color: '#6366f1', bg: '#eef2ff' },
        { title: 'Pending Invoices', value: stats.pendingInvoices, icon: <AlertCircle />, color: '#f59e0b', bg: '#fffbeb' },
    ];

    return (
        <div ref={pageRef} className="smooth-scroll">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h2 className="mb-0">Dashboard</h2>
                <Badge bg="primary" className="px-3 py-2">
                    Role: {user?.role?.replace('_', ' ')}
                </Badge>
            </div>

            {/* Production Summary Widget */}
            {summaryStats && (
                <Card className="border-0 shadow-sm mb-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)' }}>
                    <Card.Body className="text-white p-4">
                        <div className="d-flex align-items-center gap-2 mb-4">
                            <Factory size={24} />
                            <h5 className="mb-0 fw-bold">Production Management Overview</h5>
                        </div>
                        <Row>
                            {[
                                { label: 'Avg Efficiency', value: `${summaryStats.avgEfficiency}%` },
                                { label: 'High Performers', value: summaryStats.highPerformingLines, color: 'text-success' },
                                { label: 'Underperformers', value: summaryStats.underperformingLines, color: 'text-warning' },
                                { label: "Today's Output", value: summaryStats.todayProduction },
                                { label: 'Defects Today', value: summaryStats.todayDefects, color: 'text-danger' },
                                { label: 'Active Orders', value: summaryStats.inProgressOrders }
                            ].map((s, i) => (
                                <Col md={2} sm={4} key={i} className="mb-3">
                                    <div className="p-3 rounded bg-white bg-opacity-10 text-center h-100 d-flex flex-column justify-content-center">
                                        <h3 className={`mb-0 fw-bold ${s.color || ''}`}>{s.value}</h3>
                                        <small className="opacity-75">{s.label}</small>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Card.Body>
                </Card>
            )}

            {/* Production Charts Section */}
            {productionCharts && (
                <div className="animate-fade-in">
                    <Row className="mb-4">
                        <Col lg={8}>
                            <Card className="border-0 shadow-sm mb-4 h-100">
                                <Card.Header className="bg-white py-3 border-0">
                                    <h6 className="mb-0 text-muted uppercase tracking-wider small fw-bold">
                                        <BarChart3 size={16} className="me-2" /> Line-wise Efficiency Performance (%)
                                    </h6>
                                </Card.Header>
                                <Card.Body style={{ height: 350 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={productionCharts.lineEfficiency}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                                cursor={{ fill: '#f8fafc' }}
                                            />
                                            <Bar dataKey="efficiency" name="Efficiency %" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={4}>
                            <Card className="border-0 shadow-sm mb-4 h-100">
                                <Card.Header className="bg-white py-3 border-0">
                                    <h6 className="mb-0 text-muted uppercase tracking-wider small fw-bold">
                                        <Activity size={16} className="me-2" /> Production vs Defects
                                    </h6>
                                </Card.Header>
                                <Card.Body style={{ height: 350 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={productionCharts.defectStats}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <Tooltip />
                                            <Legend verticalAlign="top" align="right" />
                                            <Bar dataKey="produced" name="Produced" fill="#10b981" radius={[2, 2, 0, 0]} stackId="a" barSize={20} />
                                            <Bar dataKey="defects" name="Defects" fill="#ef4444" radius={[2, 2, 0, 0]} stackId="a" barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Row className="mb-4">
                        <Col lg={12}>
                            <Card className="border-0 shadow-sm mb-4 h-100">
                                <Card.Header className="bg-white py-3 border-0">
                                    <h6 className="mb-0 text-muted uppercase tracking-wider small fw-bold">
                                        <TrendingUp size={16} className="me-2" /> 7-Day Production Trend
                                    </h6>
                                </Card.Header>
                                <Card.Body style={{ height: 350 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={productionCharts.productionTrend}>
                                            <defs>
                                                <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="output" name="Output (Pcs)" stroke="#6366f1" fillOpacity={1} fill="url(#colorOutput)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>
            )}

            {/* Finance Cards (Only for ADMIN/FINANCE) */}
            {['ADMIN', 'FINANCE_MANAGER'].includes(user?.role) && (
                <div className="animate-fade-in">
                    <Row ref={cardsRef} className="mb-4">
                        {financeCards.map((stat, idx) => (
                            <Col lg={3} md={6} key={idx} className="mb-4">
                                <Card className="stat-card border-0 shadow-sm h-100 card-hover">
                                    <Card.Body className="d-flex align-items-center justify-content-between">
                                        <div>
                                            <p className="text-muted mb-1 small uppercase tracking-wider fw-semibold">{stat.title}</p>
                                            <h4 className="mb-0 fw-bold">{stat.value}</h4>
                                        </div>
                                        <div className="rounded-3 d-flex align-items-center justify-content-center"
                                            style={{ width: 48, height: 48, backgroundColor: stat.bg }}>
                                            {React.cloneElement(stat.icon, { size: 24, color: stat.color })}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {financeStats && (
                        <Row className="mb-4">
                            <Col lg={4}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Header className="bg-white py-3 border-0">
                                        <h6 className="mb-0 text-muted uppercase tracking-wider small fw-bold">
                                            <TrendingUp size={16} className="me-2" /> Revenue by Buyer
                                        </h6>
                                    </Card.Header>
                                    <Card.Body style={{ height: 350 }}>
                                        {financeStats.buyerRevenue?.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={financeStats.buyerRevenue.map(b => ({ name: b['Buyer.name'], value: Number(b.totalAmount) }))}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%" cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        paddingAngle={5}
                                                    >
                                                        {financeStats.buyerRevenue.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value) => `₹${parseFloat(value).toLocaleString()}`} />
                                                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                                                No revenue data available
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col lg={4}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Header className="bg-white py-3 border-0">
                                        <h6 className="mb-0 text-muted uppercase tracking-wider small fw-bold">
                                            <DollarSign size={16} className="me-2" /> Amount Received by Buyer
                                        </h6>
                                    </Card.Header>
                                    <Card.Body style={{ height: 350 }}>
                                        {financeStats.buyerPayments?.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={financeStats.buyerPayments.map(p => ({ name: p.buyerName, value: Number(p.totalReceived) }))}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%" cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        paddingAngle={5}
                                                    >
                                                        {financeStats.buyerPayments.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value) => `₹${parseFloat(value).toLocaleString()}`} />
                                                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                                                No payment data available
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col lg={4}>
                                <Card className="border-0 shadow-sm h-100">
                                    <Card.Header className="bg-white py-3 border-0">
                                        <h6 className="mb-0 text-muted uppercase tracking-wider small fw-bold">
                                            <Activity size={16} className="me-2" /> Expense Distribution
                                        </h6>
                                    </Card.Header>
                                    <Card.Body style={{ height: 350 }}>
                                        {financeStats.expenseCategories?.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={financeStats.expenseCategories.map(e => ({ name: e['Account.name'], value: Number(e.amount) }))}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        cx="50%" cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        paddingAngle={5}
                                                    >
                                                        {financeStats.expenseCategories.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(value) => `₹${parseFloat(value).toLocaleString()}`} />
                                                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                                                No expense data available
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )}
                </div>
            )}

            {/* Export Charts Section */}
            {/* Export Charts Section */}
            {['ADMIN', 'EXPORT_MANAGER', 'PO_MANAGER'].includes(user?.role) && exportStats && (
                <div className="animate-fade-in mt-4">
                    <Row className="mb-4">
                        <Col lg={8}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Header className="bg-white py-3 border-0">
                                    <h6 className="mb-0 text-muted uppercase tracking-wider small fw-bold">
                                        <BarChart3 size={16} className="me-2" /> Export/Import Volume per Buyer
                                    </h6>
                                </Card.Header>
                                <Card.Body style={{ height: 350 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={exportStats.buyerVolume}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="buyerName" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <Tooltip cursor={{ fill: '#dbe3ebff' }} />
                                            <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
                                            <Bar yAxisId="left" dataKey="totalVolume" name="Total Value" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={40} />
                                            <Bar yAxisId="right" dataKey="totalQuantity" name="Total Qty (Pcs)" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={4}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Header className="bg-white py-3 border-0">
                                    <h6 className="mb-0 text-muted uppercase tracking-wider small fw-bold">
                                        <ShoppingBag size={16} className="me-2" /> Order Status Breakdown
                                    </h6>
                                </Card.Header>
                                <Card.Body style={{ height: 350 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={exportStats.orderStatus}
                                                dataKey="count"
                                                nameKey="status"
                                                cx="50%" cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                            >
                                                {exportStats.orderStatus.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>
            )}

            {/* PO Analytics Section */}
            {['ADMIN', 'PO_MANAGER'].includes(user?.role) && poStats && (
                <div className="animate-fade-in mt-4">
                    <Card className="border-0 shadow-sm mb-4 bg-light">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center gap-2 mb-3 text-dark">
                                <ShoppingBag size={20} />
                                <h6 className="mb-0 fw-bold">Purchase Order Summary</h6>
                            </div>
                            <Row>
                                {[
                                    { label: 'Total POs', value: poStats.summary?.totalPOs, color: 'text-primary' },
                                    { label: 'In Production', value: poStats.summary?.inProduction, color: 'text-warning' },
                                    { label: 'Completed', value: poStats.summary?.completed, color: 'text-success' },
                                    { label: 'Total Buyer Value', value: `$ ${poStats.buyerValue?.reduce((acc, b) => acc + parseFloat(b.totalValue), 0).toLocaleString()}`, color: 'text-dark' }
                                ].map((s, i) => (
                                    <Col md={3} key={i}>
                                        <div className="p-3 rounded bg-white shadow-sm border text-center">
                                            <h4 className={`mb-0 fw-bold ${s.color || ''}`}>{s.value}</h4>
                                            <small className="text-muted">{s.label}</small>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </Card.Body>
                    </Card>

                    <Row className="mb-4">
                        <Col lg={7}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Header className="bg-white py-3 border-0">
                                    <h6 className="mb-0 text-muted uppercase tracking-wider small fw-bold">
                                        <BarChart3 size={16} className="me-2" /> Purchase Order Distribution by Buyer
                                    </h6>
                                </Card.Header>
                                <Card.Body style={{ height: 350 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={poStats.buyerValue}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="buyerName" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                            <Tooltip />
                                            <Bar dataKey="totalValue" name="Total Value ($)" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40}>
                                                {poStats.buyerValue?.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={5}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Header className="bg-white py-3 border-0">
                                    <h6 className="mb-0 text-muted uppercase tracking-wider small fw-bold">
                                        <CheckCircle size={16} className="me-2" /> Order Status Distribution
                                    </h6>
                                </Card.Header>
                                <Card.Body className="p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h6 className="mb-0 fw-bold text-primary">Status-wise Tracking List</h6>
                                        {selectedStatus && (
                                            <Button variant="link" size="sm" onClick={() => setSelectedStatus(null)} className="text-decoration-none">
                                                Clear Filter
                                            </Button>
                                        )}
                                    </div>
                                    <Row className="g-3">
                                        {statusList.map(status => {
                                            const statusData = poStats.poStatus?.find(s => s.status === status);
                                            const count = statusData ? parseInt(statusData.count) : 0;
                                            const total = poStats.summary?.totalPOs || 1;
                                            const percentage = (count / total) * 100;
                                            const isActive = selectedStatus === status;

                                            return (
                                                <Col key={status} xs={12}>
                                                    <div
                                                        onClick={() => setSelectedStatus(isActive ? null : status)}
                                                        className={`p-2 px-3 rounded border cursor-pointer transition-all ${isActive ? 'border-primary bg-primary bg-opacity-10 shadow-sm' : 'bg-white hover-bg-light'}`}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                                            <span className="small fw-bold text-uppercase" style={{ fontSize: '10px' }}>{status.replace(/_/g, ' ')}</span>
                                                            <Badge bg={isActive ? 'primary' : 'light'} text={isActive ? 'white' : 'dark'} className="rounded-pill">
                                                                {count}
                                                            </Badge>
                                                        </div>
                                                        <div className="progress" style={{ height: 4 }}>
                                                            <div
                                                                className="progress-bar"
                                                                role="progressbar"
                                                                style={{
                                                                    width: `${percentage}%`,
                                                                    backgroundColor: STATUS_COLORS[status]
                                                                }}
                                                                aria-valuenow={percentage}
                                                                aria-valuemin="0"
                                                                aria-valuemax="100"
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </Col>
                                            );
                                        })}
                                    </Row>
                                </Card.Body>

                            </Card>
                        </Col>
                    </Row>

                    <Row className="mt-4">
                        <Col lg={12}>
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                                    <h6 className="mb-0 text-muted uppercase tracking-wider small fw-bold">
                                        <ShoppingBag size={16} className="me-2" /> Recently Performed PO Orders
                                    </h6>
                                    <Badge bg="primary" pill>Recent Orders</Badge>
                                </Card.Header>
                                <Card.Body className="p-0">
                                    <div className="table-responsive">
                                        <Table hover className="mb-0 align-middle small">
                                            <thead className="bg-light">
                                                <tr>
                                                    <th className="ps-4">Order ID</th>
                                                    <th>Buyer</th>
                                                    <th>Order Date</th>
                                                    <th>Quantity</th>
                                                    <th>Status</th>
                                                    <th className="text-end pe-4">Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {poStats.recentPOs?.filter(po => selectedStatus ? po.status === selectedStatus : true).map(po => (
                                                    <tr key={po.id}>
                                                        <td className="ps-4 fw-bold text-primary">PO-{po.id.toString().padStart(4, '0')}</td>
                                                        <td>{po.buyerName}</td>
                                                        <td>{new Date(po.orderDate).toLocaleDateString()}</td>
                                                        <td>{po.quantity?.toLocaleString()} Pcs</td>
                                                        <td>
                                                            <Badge bg={
                                                                po.status === 'PAYMENT_COMPLETED' ? 'success' :
                                                                    po.status === 'IN_PRODUCTION' ? 'primary' :
                                                                        po.status === 'CREATED' ? 'secondary' : 'info'
                                                            } className="rounded-pill px-2">
                                                                {po.status.replace(/_/g, ' ')}
                                                            </Badge>
                                                        </td>
                                                        <td className="text-end pe-4 fw-bold">$ {parseFloat(po.totalValue).toLocaleString()}</td>
                                                    </tr>
                                                ))}
                                                {(!poStats.recentPOs || poStats.recentPOs.length === 0) && (
                                                    <tr>
                                                        <td colSpan="6" className="text-center py-4 text-muted">No recent orders found</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>
            )}

            {!['ADMIN', 'FINANCE_MANAGER', 'PRODUCTION_MANAGER', 'EXPORT_MANAGER', 'PO_MANAGER'].includes(user?.role) && (
                <div className="p-5 text-center bg-white rounded shadow-sm">
                    <CheckCircle size={48} className="text-success mb-3" />
                    <h4>Welcome to Garment ERP</h4>
                    <p className="text-muted">Use the sidebar to navigate through the modules available for your role.</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
