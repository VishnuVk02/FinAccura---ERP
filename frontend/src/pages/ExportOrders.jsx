import { Row, Col, Card, Form, Button, Table, Badge, Modal, Nav } from 'react-bootstrap';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import POShipment from './export/POShipment';
import { Ship, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';

const ExportOrders = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [buyers, setBuyers] = useState([]);
    const [units, setUnits] = useState([]);
    const [years, setYears] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        orderNumber: '', styleName: '', buyerId: '', unitId: '', financialYearId: '',
        orderDate: '', deliveryDate: '', totalQuantity: 0, pricePerUnit: 0,
        totalAmount: 0, currency: 'USD', exchangeRate: 1.0
    });

    const fetchData = async () => {
        try {
            const [ord, buy, unt, yr] = await Promise.all([
                api.get('/export/orders'),
                api.get('/export/buyers'),
                api.get('/organization/units'),
                api.get('/organization/financial-years')
            ]);
            setOrders(ord.data);
            setBuyers(buy.data);
            setUnits(unt.data);
            setYears(yr.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch data');
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleBuyerChange = (id) => {
        const buyer = buyers.find(b => b.id === parseInt(id));
        setFormData({
            ...formData,
            buyerId: id,
            currency: buyer ? buyer.currency : 'USD'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const total = parseFloat(formData.totalQuantity) * parseFloat(formData.pricePerUnit);
            const payload = {
                ...formData,
                totalQuantity: parseInt(formData.totalQuantity),
                pricePerUnit: parseFloat(formData.pricePerUnit),
                totalAmount: total,
                exchangeRate: parseFloat(formData.exchangeRate || 1.0),
                buyerId: parseInt(formData.buyerId),
                unitId: parseInt(formData.unitId),
                financialYearId: parseInt(formData.financialYearId)
            };
            await api.post('/export/orders', payload);
            toast.success('Export/Import Order Created!');
            setShowModal(false);
            setFormData({
                orderNumber: '', styleName: '', buyerId: '', unitId: '', financialYearId: '',
                orderDate: '', deliveryDate: '', totalQuantity: 0, pricePerUnit: 0,
                totalAmount: 0, currency: 'USD', exchangeRate: 1.0
            });
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error creating order');
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/export/orders/${id}/status`, { status });
            toast.success(`Order marked as ${status}`);
            fetchData();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error updating order status');
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0 fw-bold">Export/Import Orders</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}>+ New Export/Import Order</Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white p-0 border-0">
                    <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="px-3 pt-2">
                        <Nav.Item>
                            <Nav.Link eventKey="orders" className="d-flex align-items-center gap-2 px-4 py-3 border-0 rounded-0">
                                <Ship size={18} /> <span>Manual Orders</span>
                            </Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="shipment" className="d-flex align-items-center gap-2 px-4 py-3 border-0 rounded-0">
                                <Truck size={18} /> <span>PO Shipments</span>
                            </Nav.Link>
                        </Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body className="p-0">
                    {activeTab === 'orders' ? (
                        <Table responsive hover className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Order #</th>
                                    <th>Style / Order</th>
                                    <th>Buyer</th>
                                    <th>Quantity</th>
                                    <th>Total Amount</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th className="pe-4 text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(o => (
                                    <tr key={o.id}>
                                        <td className="ps-4"><strong>{o.orderNumber}</strong></td>
                                        <td>
                                            <div className="fw-semibold">{o.styleName}</div>
                                            <small className="text-muted text-uppercase">{o.orderNumber}</small>
                                        </td>
                                        <td>
                                            <div className="fw-semibold">{o.Buyer?.name}</div>
                                            <small className="text-muted">{o.Buyer?.country}</small>
                                        </td>
                                        <td>{o.totalQuantity.toLocaleString()}</td>
                                        <td className="fw-bold">
                                            {o.currency} {parseFloat(o.totalAmount).toLocaleString()}
                                        </td>
                                        <td>{new Date(o.orderDate).toLocaleDateString()}</td>
                                        <td>
                                            <Badge bg={o.status === 'CREATED' ? 'primary' : o.status === 'SHIPPED' ? 'warning' : 'success'}>
                                                {o.status}
                                            </Badge>
                                        </td>
                                        <td className="pe-4 text-end">
                                            {o.status === 'CREATED' && (
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    onClick={() => handleUpdateStatus(o.id, 'SHIPPED')}
                                                    className="d-flex align-items-center gap-1 ms-auto"
                                                >
                                                    <Truck size={14} /> Mark Shipped
                                                </Button>
                                            )}
                                            {o.status === 'SHIPPED' && (
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    onClick={() => handleUpdateStatus(o.id, 'COMPLETED')}
                                                    className="d-flex align-items-center gap-1 ms-auto"
                                                >
                                                    <Ship size={14} /> Mark Completed
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="text-center py-5 text-muted">No export/import orders found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    ) : (
                        <div className="p-4">
                            <POShipment />
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton><Modal.Title className="fw-bold">Create Export/Import Order</Modal.Title></Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Order Number</Form.Label>
                                    <Form.Control
                                        required
                                        placeholder="e.g. EX-2024-001"
                                        value={formData.orderNumber}
                                        onChange={e => setFormData({ ...formData, orderNumber: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Style Name / Description</Form.Label>
                                    <Form.Control
                                        required
                                        placeholder="e.g. Denim Jkt"
                                        value={formData.styleName}
                                        onChange={e => setFormData({ ...formData, styleName: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Buyer</Form.Label>
                                    <Form.Select required value={formData.buyerId} onChange={e => handleBuyerChange(e.target.value)}>
                                        <option value="">Select Buyer</option>
                                        {buyers.map(b => <option key={b.id} value={b.id}>{b.name} ({b.country} - {b.currency})</option>)}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Unit</Form.Label>
                                    <Form.Select required value={formData.unitId} onChange={e => setFormData({ ...formData, unitId: e.target.value })}>
                                        <option value="">Select manufacturing Unit</option>
                                        {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Financial Year</Form.Label>
                                    <Form.Select required value={formData.financialYearId} onChange={e => setFormData({ ...formData, financialYearId: e.target.value })}>
                                        <option value="">Select Year</option>
                                        {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Total Quantity (Pcs)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                required
                                                value={formData.totalQuantity}
                                                onChange={e => setFormData({ ...formData, totalQuantity: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold">Price Per Unit ({formData.currency})</Form.Label>
                                            <Form.Control
                                                type="number"
                                                step="0.01"
                                                required
                                                value={formData.pricePerUnit}
                                                onChange={e => setFormData({ ...formData, pricePerUnit: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Order Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        required
                                        value={formData.orderDate}
                                        onChange={e => setFormData({ ...formData, orderDate: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold">Delivery Deadline</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formData.deliveryDate}
                                        onChange={e => setFormData({ ...formData, deliveryDate: e.target.value })}
                                    />
                                </Form.Group>
                                {formData.currency !== 'INR' && (
                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-primary">Exchange Rate (1 {formData.currency} = ? INR)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            step="0.01"
                                            required
                                            value={formData.exchangeRate}
                                            onChange={e => setFormData({ ...formData, exchangeRate: e.target.value })}
                                        />
                                    </Form.Group>
                                )}
                            </Col>
                        </Row>
                        <div className="mt-4 p-3 bg-light rounded d-flex justify-content-between align-items-center">
                            <div>
                                <small className="text-muted d-block uppercase tracking-wider">Estimated Total Amount</small>
                                <h4 className="mb-0 fw-bold">{formData.currency} {(parseFloat(formData.totalQuantity || 0) * parseFloat(formData.pricePerUnit || 0)).toLocaleString()}</h4>
                                {formData.currency !== 'INR' && (
                                    <small className="text-primary fw-bold">
                                        ≈ ₹ {(parseFloat(formData.totalQuantity || 0) * parseFloat(formData.pricePerUnit || 0) * parseFloat(formData.exchangeRate || 1)).toLocaleString()} INR
                                    </small>
                                )}
                            </div>
                            <Button type="submit" variant="primary" size="lg" className="px-5">Create Export/Import Order</Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ExportOrders;
