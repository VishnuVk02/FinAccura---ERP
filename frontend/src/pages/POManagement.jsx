import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Form, Button, Table, Modal, Badge, Spinner } from 'react-bootstrap';
import { Plus, Search, ShoppingBag, Truck, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { poRequest } from '../store/slices/poSlice';
import api from '../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const POManagement = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { orders, loading } = useSelector(state => state.po);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [buyers, setBuyers] = useState([]);

    const [formData, setFormData] = useState({
        buyerName: '',
        orderDate: new Date().toISOString().split('T')[0],
        exportDate: '',
        quantity: '',
        fabricType: '',
        fitType: '',
        pricePerUnit: '',
        styleNumbers: ['']
    });

    useEffect(() => {
        dispatch({ type: 'po/fetchMyOrders' });
        fetchBuyers();
    }, [dispatch]);

    const fetchBuyers = async () => {
        try {
            const response = await api.get('/export/buyers');
            setBuyers(response.data);
        } catch (error) {
            console.error('Failed to fetch buyers', error);
        }
    };

    const handleAddStyle = () => {
        if (formData.styleNumbers.length < 5) {
            setFormData({ ...formData, styleNumbers: [...formData.styleNumbers, ''] });
        }
    };

    const handleStyleChange = (index, value) => {
        const newStyles = [...formData.styleNumbers];
        newStyles[index] = value;
        setFormData({ ...formData, styleNumbers: newStyles });
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to completely delete this Purchase Order? This will also delete any associated style records and production assignments.')) {
            dispatch({ type: 'po/deletePO', payload: id });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch({
            type: 'po/createPO', payload: {
                ...formData,
                styleNumbers: formData.styleNumbers.filter(s => s.trim() !== '')
            }
        });
        setShowModal(false);
        setFormData({
            buyerName: '',
            orderDate: new Date().toISOString().split('T')[0],
            exportDate: '',
            quantity: '',
            fabricType: '',
            fitType: '',
            pricePerUnit: '',
            styleNumbers: ['']
        });
    };

    const filteredOrders = orders.filter(o =>
        o.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.styles.some(s => s.styleNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusBadge = (status) => {
        const variants = {
            'CREATED': 'secondary',
            'IN_PRODUCTION': 'primary',
            'PRODUCTION_COMPLETED': 'info',
            'READY_FOR_EXPORT': 'warning',
            'EXPORTED': 'dark',
            'PAYMENT_PENDING': 'danger',
            'PAYMENT_COMPLETED': 'success'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status.replace(/_/g, ' ')}</Badge>;
    };

    // Prepare chart data
    const chartData = Object.values(orders.reduce((acc, order) => {
        const buyer = order.buyerName || 'Unknown';
        if (!acc[buyer]) {
            acc[buyer] = { name: buyer, value: 0 };
        }
        acc[buyer].value += parseFloat(order.totalValue);
        return acc;
    }, {})).sort((a, b) => b.value - a.value);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Purchase Order Management</h4>
                    <p className="text-muted small mb-0">Record and track buyer orders</p>
                </div>
                <Button variant="primary" onClick={() => setShowModal(true)} className="d-flex align-items-center gap-2">
                    <Plus size={18} /> New Purchase Order
                </Button>
            </div>

            {/* <Row className="mb-4">
                <Col md={12}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4">
                            <h6 className="mb-4 fw-bold">Total Order Value by Buyer (USD)</h6>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                                        <Tooltip
                                            formatter={(value) => [`$${parseFloat(value).toLocaleString()}`, 'Total Value']}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row> */}

            <Row className="mb-4">
                <Col md={12}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-0">
                            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">My Orders</h6>
                                <div style={{ width: 300 }} className="position-relative">
                                    <Search size={16} className="position-absolute top-50 start-0 translate-middle-y ms-2 text-muted" />
                                    <Form.Control
                                        size="sm"
                                        className="ps-5"
                                        placeholder="Search by buyer or style..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Table responsive hover className="mb-0 align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-4">Order ID</th>
                                        <th>Buyer</th>
                                        <th>Styles</th>
                                        <th>Quantity</th>
                                        <th>Export Date</th>
                                        <th>Status</th>
                                        <th className="text-end">Value</th>
                                        {user?.role === 'ADMIN' && <th className="text-end pe-4">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="7" className="text-center py-5"><Spinner animation="border" size="sm" /></td></tr>
                                    ) : filteredOrders.length === 0 ? (
                                        <tr><td colSpan="7" className="text-center py-5 text-muted">No orders found.</td></tr>
                                    ) : filteredOrders.map(order => (
                                        <tr key={order.id}>
                                            <td className="ps-4 fw-bold">PO-{order.id.toString().padStart(4, '0')}</td>
                                            <td>{order.buyerName}</td>
                                            <td>
                                                {order.styles.map((s, i) => (
                                                    <Badge key={i} bg="light" text="dark" className="me-1 border">{s.styleNumber}</Badge>
                                                ))}
                                            </td>
                                            <td>{order.quantity.toLocaleString()}</td>
                                            <td>{new Date(order.exportDate).toLocaleDateString()}</td>
                                            <td>{getStatusBadge(order.status)}</td>
                                            <td className="text-end fw-bold">${parseFloat(order.totalValue).toLocaleString()}</td>
                                            {user?.role === 'ADMIN' && (
                                                <td className="text-end pe-4">
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(order.id)}
                                                        className="p-1 border-0"
                                                        title="Delete Order"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Create New Purchase Order</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="p-4">
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Buyer Name *</Form.Label>
                                    <Form.Select
                                        required
                                        value={formData.buyerName}
                                        onChange={e => setFormData({ ...formData, buyerName: e.target.value })}
                                    >
                                        <option value="">Select Buyer</option>
                                        {buyers.map(b => (
                                            <option key={b.id} value={b.name}>{b.name} ({b.country})</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Order Date *</Form.Label>
                                    <Form.Control type="date" required value={formData.orderDate} onChange={e => setFormData({ ...formData, orderDate: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Export Date *</Form.Label>
                                    <Form.Control type="date" required value={formData.exportDate} onChange={e => setFormData({ ...formData, exportDate: e.target.value })} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Fabric Type *</Form.Label>
                                    <Form.Control required value={formData.fabricType} onChange={e => setFormData({ ...formData, fabricType: e.target.value })} placeholder="e.g. Cotton Denim" />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Fit Type *</Form.Label>
                                    <Form.Control required value={formData.fitType} onChange={e => setFormData({ ...formData, fitType: e.target.value })} placeholder="e.g. Slim Fit" />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Quantity *</Form.Label>
                                    <Form.Control type="number" required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} placeholder="Total units" />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Price Per Unit (USD) *</Form.Label>
                                    <Form.Control type="number" step="0.01" required value={formData.pricePerUnit} onChange={e => setFormData({ ...formData, pricePerUnit: e.target.value })} />
                                </Form.Group>
                            </Col>
                            <Col md={8}>
                                <Form.Label className="small fw-bold">Style Numbers (Max 5) *</Form.Label>
                                {formData.styleNumbers.map((style, index) => (
                                    <div key={index} className="d-flex mb-2 gap-2">
                                        <Form.Control
                                            required
                                            value={style}
                                            onChange={e => handleStyleChange(index, e.target.value)}
                                            placeholder={`Style ${index + 1}`}
                                        />
                                        {index === formData.styleNumbers.length - 1 && formData.styleNumbers.length < 5 && (
                                            <Button variant="outline-primary" onClick={handleAddStyle} circular="true">+</Button>
                                        )}
                                    </div>
                                ))}
                            </Col>
                        </Row>

                        <div className="bg-light p-3 rounded d-flex justify-content-between align-items-center mt-3">
                            <span className="text-muted">Total Order Value:</span>
                            <span className="h4 mb-0 text-primary">${(formData.quantity * formData.pricePerUnit || 0).toLocaleString()}</span>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Create Purchase Order</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default POManagement;
