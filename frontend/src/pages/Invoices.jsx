import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Table, Badge, Modal } from 'react-bootstrap';
import api from '../services/api';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [orders, setOrders] = useState([]);
    const [accounts, setAccounts] = useState([]); // To select Buyer and Sales accounts
    const [units, setUnits] = useState([]);
    const [years, setYears] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        invoiceNumber: '', exportOrderId: '', invoiceDate: '', totalAmount: 0,
        currency: 'USD', dueDate: '', buyerAccountId: '', salesAccountId: '',
        financialYearId: '', unitId: ''
    });

    const fetchData = async () => {
        try {
            const [inv, ord, acc, unt, yr] = await Promise.all([
                api.get('/transactions/invoices'), api.get('/export/orders'),
                api.get('/coa'), api.get('/organization/units'),
                api.get('/organization/financial-years')
            ]);
            setInvoices(inv.data); setOrders(ord.data); setUnits(unt.data); setYears(yr.data);

            // Flatten accounts from COA structure for selection
            const flatAccounts = [];
            acc.data.forEach(mg => mg.Groups.forEach(g => g.SubGroups.forEach(sg => sg.Accounts.forEach(a => flatAccounts.push(a)))));
            setAccounts(flatAccounts);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/transactions/invoices', formData);
            setShowModal(false); fetchData();
        } catch (err) { alert('Error generating invoice'); }
    };

    return (
        <div>
            <div className="d-flex justify-content-between mb-4">
                <h2>Sales Invoices</h2>
                <Button onClick={() => setShowModal(true)}>Generate Invoice</Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Order #</th>
                                <th>Amount</th>
                                <th>Invoice Date</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(i => (
                                <tr key={i.id}>
                                    <td><strong>{i.invoiceNumber}</strong></td>
                                    <td>
                                        {i.ExportOrder?.orderNumber ? (
                                            <Badge bg="info">EO {i.ExportOrder.orderNumber}</Badge>
                                        ) : i.PurchaseOrder?.id ? (
                                            <Badge bg="primary">PO #{i.PurchaseOrder.id}</Badge>
                                        ) : 'N/A'}
                                    </td>
                                    <td>{i.totalAmount} {i.currency}</td>
                                    <td>{new Date(i.invoiceDate).toLocaleDateString()}</td>
                                    <td>{i.dueDate ? new Date(i.dueDate).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <Badge bg={i.status === 'PAID' ? 'success' : i.status === 'PARTIAL' ? 'warning' : 'danger'}>{i.status}</Badge>
                                    </td>
                                    <td>
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={() => {
                                                const subject = `Invoice ${i.invoiceNumber} from Garment ERP`;
                                                const body = `Dear Customer,\n\nPlease find the invoice ${i.invoiceNumber} for the amount of ${i.totalAmount} ${i.currency}.\n\nRegards,\nFinance Team`;
                                                window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                                            }}
                                        >
                                            Forward to Email
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton><Modal.Title>Generate New Invoice</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Invoice Number</Form.Label>
                                    <Form.Control required onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Export/Import Order</Form.Label>
                                    <Form.Select required onChange={e => {
                                        const order = orders.find(o => String(o.id) === String(e.target.value));
                                        setFormData({
                                            ...formData,
                                            exportOrderId: e.target.value,
                                            totalAmount: order ? order.totalAmount : 0,
                                            currency: order ? order.currency : 'USD'
                                        });
                                    }}>
                                        <option value="">Select Order</option>
                                        {orders.map(o => <option key={o.id} value={o.id}>{o.orderNumber} - {o.Buyer?.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                <Row>
                                    <Col md={7}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Total Amount</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={formData.totalAmount}
                                                onChange={e => setFormData({ ...formData, totalAmount: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={5}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Ex. Rate (to INR)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                step="0.01"
                                                value={formData.exchangeRate || 80}
                                                onChange={e => setFormData({ ...formData, exchangeRate: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Unit</Form.Label>
                                    <Form.Select required onChange={e => setFormData({ ...formData, unitId: e.target.value })}>
                                        <option value="">Select Unit</option>
                                        {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Financial Year</Form.Label>
                                    <Form.Select required onChange={e => setFormData({ ...formData, financialYearId: e.target.value })}>
                                        <option value="">Select Year</option>
                                        {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Invoice Date</Form.Label>
                                    <Form.Control type="date" required onChange={e => setFormData({ ...formData, invoiceDate: e.target.value })} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Due Date</Form.Label>
                                    <Form.Control type="date" onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <hr />
                        <h6>Accounting Entry Mapping</h6>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Buyer Ledger (A/R)</Form.Label>
                                    <Form.Select required onChange={e => setFormData({ ...formData, buyerAccountId: e.target.value })}>
                                        <option value="">Select Account</option>
                                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Sales Revenue Ledger</Form.Label>
                                    <Form.Select required onChange={e => setFormData({ ...formData, salesAccountId: e.target.value })}>
                                        <option value="">Select Account</option>
                                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Button type="submit" className="w-100 mt-3">Generate & Post to Ledger</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Invoices;
