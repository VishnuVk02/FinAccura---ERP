import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Table, Modal, Nav, Badge } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { fetchDashboardRequest } from '../store/slices/dashboardSlice';
import api from '../services/api';
import POPayments from './finance/POPayments';

const Payments = () => {
    const dispatch = useDispatch();
    const [payments, setPayments] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [units, setUnits] = useState([]);
    const [years, setYears] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState('receipt');
    const [formData, setFormData] = useState({
        invoiceId: '', paymentDate: '', amount: 0, currency: '',
        exchangeRate: 83.50, receivedAmountInINR: 0, bankAccountId: '',
        buyerAccountId: '', expenseAccountId: '', financialYearId: '', unitId: '', narration: ''
    });

    const fetchData = async () => {
        try {
            const [pay, inv, acc, unt, yr] = await Promise.all([
                api.get('/transactions/payments'), api.get('/transactions/invoices'),
                api.get('/coa'), api.get('/organization/units'),
                api.get('/organization/financial-years')
            ]);
            setPayments(pay.data); setInvoices(inv.data);
            setUnits(unt.data); setYears(yr.data);
            const flatAccounts = [];
            acc.data.forEach(mg => mg.Groups.forEach(g => g.SubGroups.forEach(sg => sg.Accounts.forEach(a => flatAccounts.push(a)))));
            setAccounts(flatAccounts);

            // Auto-select unit and financial year defaults
            setFormData(prev => ({
                ...prev,
                unitId: unt.data.length > 0 ? unt.data[0].id : '',
                financialYearId: yr.data.length > 0 ? yr.data.find(y => y.isActive)?.id || yr.data[0].id : ''
            }));
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (activeTab === 'receipt') {
                await api.post('/transactions/payments', formData);
            } else {
                await api.post('/transactions/expenses', formData);
            }
            setShowModal(false);
            fetchData();
            dispatch(fetchDashboardRequest());
        } catch (err) { alert(err.response?.data?.message || 'Error recording transaction'); }
    };

    return (
        <div>
            <div className="d-flex justify-content-between mb-4">
                <h2>Payment Receipts & Expenses</h2>
                <Button onClick={() => setShowModal(true)}>Record Transaction</Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Invoice #</th>
                                <th>Amount ($)</th>
                                <th>Ex. Rate</th>
                                <th>Received (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(p => (
                                <tr key={p.id}>
                                    <td>{new Date(p.paymentDate).toLocaleDateString()}</td>
                                    <td>{p.Invoice?.invoiceNumber}</td>
                                    <td>{p.amount} {p.currency}</td>
                                    <td>{p.exchangeRate}</td>
                                    <td><strong>{p.receivedAmountInINR}</strong></td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm mt-4">
                <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Pending Invoices & Receipts</h5>
                </Card.Header>
                <Card.Body>
                    <Table responsive hover>
                        <thead>
                            <tr>
                                <th>Invoice #</th>
                                <th>Buyer</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(inv => (
                                <tr key={inv.id}>
                                    <td>{inv.invoiceNumber}</td>
                                    <td>{inv.PurchaseOrder?.buyerName || inv.ExportOrder?.Buyer?.name || 'Unknown'}</td>
                                    <td>{inv.totalAmount} {inv.currency}</td>
                                    <td>
                                        <Badge bg={inv.status === 'PAID' ? 'success' : inv.status === 'PARTIAL' ? 'warning' : 'danger'}>
                                            {inv.status}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            disabled={inv.status === 'PAID'}
                                            onClick={() => {
                                                const buyerName = inv.PurchaseOrder?.buyerName || inv.ExportOrder?.Buyer?.name;
                                                const buyerAcc = accounts.find(a =>
                                                    a.name === `Accounts Receivable - ${buyerName}` ||
                                                    a.name.includes(buyerName)
                                                );
                                                setFormData({
                                                    ...formData,
                                                    invoiceId: inv.id,
                                                    amount: inv.totalAmount,
                                                    currency: inv.currency,
                                                    receivedAmountInINR: inv.totalAmount * formData.exchangeRate,
                                                    buyerAccountId: buyerAcc ? buyerAcc.id : ''
                                                });
                                                setActiveTab('receipt');
                                                setShowModal(true);
                                            }}
                                        >
                                            Record Payment
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm mt-4">
                <Card.Header className="bg-white py-3">
                    <h5 className="mb-0">Purchase Order Payments</h5>
                </Card.Header>
                <Card.Body className="p-4">
                    <POPayments />
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton><Modal.Title>Record Transaction</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Nav variant="tabs" className="mb-4" activeKey={activeTab} onSelect={k => setActiveTab(k)}>
                        <Nav.Item>
                            <Nav.Link eventKey="receipt">Invoice Receipt (Buyer)</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="expense">Company Expense</Nav.Link>
                        </Nav.Item>
                    </Nav>

                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={12}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Financial Year</Form.Label>
                                            <Form.Select value={formData.financialYearId} onChange={e => setFormData({ ...formData, financialYearId: e.target.value })} required>
                                                <option value="">Select Year</option>
                                                {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Business Unit</Form.Label>
                                            <Form.Select value={formData.unitId} onChange={e => setFormData({ ...formData, unitId: e.target.value })} required>
                                                <option value="">Select Unit</option>
                                                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <hr />
                            </Col>

                            {activeTab === 'receipt' && (
                                <>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Invoice</Form.Label>
                                            <Form.Select required value={formData.invoiceId} onChange={e => {
                                                const inv = invoices.find(i => i.id === parseInt(e.target.value));
                                                const buyerName = inv?.PurchaseOrder?.buyerName || inv?.ExportOrder?.Buyer?.name;
                                                const buyerAcc = accounts.find(a =>
                                                    a.name === `Accounts Receivable - ${buyerName}` ||
                                                    a.name.includes(buyerName)
                                                );
                                                setFormData({
                                                    ...formData,
                                                    invoiceId: e.target.value,
                                                    amount: inv?.totalAmount || 0,
                                                    currency: inv?.currency || '',
                                                    receivedAmountInINR: (inv?.totalAmount || 0) * formData.exchangeRate,
                                                    buyerAccountId: buyerAcc ? buyerAcc.id : ''
                                                });
                                            }}>
                                                <option value="">Select Invoice</option>
                                                {invoices.map(i => <option key={i.id} value={i.id}>{i.invoiceNumber} - {i.totalAmount} {i.currency} - {i.PurchaseOrder?.buyerName || i.ExportOrder?.Buyer?.name}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Amount ({formData.currency || 'Foreign Currency'})</Form.Label>
                                            <Form.Control type="number" step="0.01" value={formData.amount} onChange={e => { const amt = parseFloat(e.target.value) || 0; setFormData({ ...formData, amount: amt, receivedAmountInINR: amt * formData.exchangeRate }) }} />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Exchange Rate (1 {formData.currency || 'USD'} to INR)</Form.Label>
                                            <Form.Control type="number" step="0.01" value={formData.exchangeRate} onChange={e => { const xr = parseFloat(e.target.value) || 0; setFormData({ ...formData, exchangeRate: xr, receivedAmountInINR: formData.amount * xr }) }} />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Received Amount (INR)</Form.Label>
                                            <Form.Control type="number" value={formData.receivedAmountInINR} readOnly />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Bank Account (Debit)</Form.Label>
                                            <Form.Select required value={formData.bankAccountId} onChange={e => setFormData({ ...formData, bankAccountId: e.target.value })}>
                                                <option value="">Select Bank (Dr)</option>
                                                {accounts.filter(a => a.isBankAccount).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Buyer Ledger (Credit)</Form.Label>
                                            <Form.Select required value={formData.buyerAccountId} onChange={e => setFormData({ ...formData, buyerAccountId: e.target.value })}>
                                                <option value="">Select Buyer A/c (Cr)</option>
                                                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Payment Date</Form.Label>
                                            <Form.Control type="date" required onChange={e => setFormData({ ...formData, paymentDate: e.target.value })} />
                                        </Form.Group>
                                    </Col>
                                </>
                            )}

                            {activeTab === 'expense' && (
                                <>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Expense LEDGER (Debit)</Form.Label>
                                            <Form.Select required onChange={e => setFormData({ ...formData, expenseAccountId: e.target.value })}>
                                                <option value="">Select Expense Type</option>
                                                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Bank Account (Credit)</Form.Label>
                                            <Form.Select required onChange={e => setFormData({ ...formData, bankAccountId: e.target.value })}>
                                                <option value="">Select Bank</option>
                                                {accounts.filter(a => a.isBankAccount).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                            </Form.Select>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Expense Date</Form.Label>
                                            <Form.Control type="date" required onChange={e => setFormData({ ...formData, expenseDate: e.target.value })} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Total Amount (INR)</Form.Label>
                                            <Form.Control type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} />
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Narration / Description</Form.Label>
                                            <Form.Control as="textarea" rows={3} placeholder="EB Bill for Jan 2026..." value={formData.narration} onChange={e => setFormData({ ...formData, narration: e.target.value })} />
                                        </Form.Group>
                                    </Col>
                                </>
                            )}
                        </Row>
                        <Button type="submit" className="w-100 mt-3">{activeTab === 'receipt' ? 'Post Receipt & Clear Invoice' : 'Track Company Expense'}</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Payments;
