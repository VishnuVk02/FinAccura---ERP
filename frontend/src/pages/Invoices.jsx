import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Table, Badge, Modal, Alert } from 'react-bootstrap';
import { Download, AlertCircle, FileText } from 'lucide-react';
import api from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [pendingOrders, setPendingOrders] = useState({ purchaseOrders: [], exportOrders: [] });
    const [accounts, setAccounts] = useState([]);
    const [units, setUnits] = useState([]);
    const [years, setYears] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        invoiceNumber: '', exportOrderId: '', purchaseOrderId: '', invoiceDate: new Date().toISOString().split('T')[0],
        totalAmount: 0, currency: 'USD', exchangeRate: 83.50, dueDate: '',
        buyerAccountId: '', salesAccountId: '', financialYearId: '', unitId: ''
    });

    const fetchData = async () => {
        try {
            const [inv, ready, acc, unt, yr] = await Promise.all([
                api.get('/transactions/invoices'),
                api.get('/transactions/ready-to-invoice'),
                api.get('/coa'),
                api.get('/organization/units'),
                api.get('/organization/financial-years')
            ]);
            setInvoices(inv.data);
            setPendingOrders(ready.data);
            setUnits(unt.data);
            setYears(yr.data);

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
            await api.post('/transactions/invoices', formData);
            setShowModal(false);
            fetchData();
        } catch (err) { alert(err.response?.data?.message || 'Error generating invoice'); }
    };

    const downloadPDF = (invoice) => {
        const doc = new jsPDF();

        // 1. Company Header (Left: Logo "ACC", Right: Details)
        doc.setFillColor(41, 128, 185); // Professional Blue
        doc.rect(14, 15, 30, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text('ACC', 19, 27);

        doc.setTextColor(40, 40, 40);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text('Ambattur Fashion India.', 50, 20);
        doc.text('Ambattur Estate, Chennai-600058', 50, 25);
        doc.text('Phone: +91 98765-43210 | email: afipl@gmail.com', 50, 30);

        // 2. Invoice Metadata (Top Right)
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text('INVOICE', 200, 25, { align: 'right' });
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(`No: ${invoice.invoiceNumber}`, 200, 32, { align: 'right' });
        doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 200, 37, { align: 'right' });

        doc.setDrawColor(200, 200, 200);
        doc.line(14, 45, 200, 45);

        // 3. Buyer & Order Details (Two Columns)
        // Left Column: Bill To
        const buyerName = invoice.PurchaseOrder?.buyerName || invoice.ExportOrder?.Buyer?.name || 'Customer';
        const buyerInitials = buyerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        doc.setFillColor(240, 240, 240);
        doc.circle(22, 65, 8, 'F');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(10);
        doc.text(buyerInitials, 18.5, 68.5);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text('BILL TO:', 14, 55);
        doc.setFontSize(10);
        doc.text(buyerName, 35, 63);
        doc.setFont("helvetica", "normal");
        doc.text(invoice.ExportOrder?.Buyer?.address || 'Buyer Address Not Provided', 35, 68);
        doc.text(invoice.ExportOrder?.Buyer?.email || 'buyer@email.com', 35, 73);

        // Right Column: Shipment & Order Info
        doc.setFont("helvetica", "bold");
        doc.text('SHIPMENT DETAILS:', 120, 55);
        doc.setFont("helvetica", "normal");
        doc.text(`Order Ref: ${invoice.ExportOrder ? 'EO-' + invoice.ExportOrder.orderNumber : 'PO-#' + invoice.PurchaseOrder?.id}`, 120, 63);
        doc.text(`Port of Loading: ${invoice.extraDetails?.portOfLoading || 'Local Port'}`, 120, 68);
        doc.text(`Method: ${invoice.extraDetails?.shipmentMethod || 'SEA'}`, 120, 73);
        if (invoice.dueDate) doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 120, 78);

        // 4. Product Table
        const tableColumn = ["Style Number", "Fabric", "Fit", "Qty", "Price", "Total"];
        const tableRows = [];

        const styleNo = invoice.PurchaseOrder?.styles?.[0]?.styleNumber || invoice.ExportOrder?.styleName || 'Standard Style';
        const fabric = invoice.PurchaseOrder?.fabricType || 'Cotton';
        const fit = invoice.PurchaseOrder?.fitType || 'Regular';
        const qty = invoice.PurchaseOrder?.quantity || invoice.ExportOrder?.totalQuantity || 1;
        const price = invoice.PurchaseOrder?.pricePerUnit || invoice.ExportOrder?.pricePerUnit || invoice.totalAmount;

        tableRows.push([
            styleNo,
            fabric,
            fit,
            qty.toString(),
            `${invoice.currency} ${parseFloat(price).toFixed(2)}`,
            `${invoice.currency} ${parseFloat(invoice.totalAmount).toFixed(2)}`
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 85,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 9 }
        });

        // 5. Financial Summary
        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFont("helvetica", "bold");
        doc.text('SUMMARY', 140, finalY);
        doc.setFont("helvetica", "normal");
        doc.text('Subtotal:', 140, finalY + 7);
        doc.text(`${invoice.currency} ${parseFloat(invoice.totalAmount).toLocaleString()}`, 200, finalY + 7, { align: 'right' });

        doc.setDrawColor(41, 128, 185);
        doc.setLineWidth(0.5);
        doc.line(140, finalY + 10, 200, finalY + 10);

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text('TOTAL:', 140, finalY + 18);
        doc.text(`${invoice.currency} ${parseFloat(invoice.totalAmount).toLocaleString()}`, 200, finalY + 18, { align: 'right' });

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`(In INR: ₹${parseFloat(invoice.totalAmountInINR).toLocaleString()})`, 200, finalY + 24, { align: 'right' });

        // 6. Footer & Signature
        const footerY = 250;
        doc.setTextColor(0, 0, 0);
        doc.line(14, footerY, 70, footerY);
        doc.text('Authorized Signature', 14, footerY + 5);

        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('THANK YOU FOR YOUR BUSINESS', 105, 275, { align: 'center' });
        doc.text('This is a computer generated invoice and does not require a physical stamp.', 105, 280, { align: 'center' });

        doc.save(`${invoice.invoiceNumber}.pdf`);
    };

    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const totalNotifications = pendingOrders.purchaseOrders.length + pendingOrders.exportOrders.length;

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between mb-4 align-items-center">
                <h2 className="mb-0">Invoice Management</h2>
                <Button onClick={() => setShowModal(true)} variant="primary" className="d-flex align-items-center gap-2 px-4 shadow-sm">
                    <FileText size={18} /> Generate Invoice
                </Button>
            </div>

            {totalNotifications > 0 && (
                <Alert variant="info" className="d-flex align-items-center gap-3 shadow-sm border-0 bg-info bg-opacity-10 text-info mb-4 py-3">
                    <AlertCircle size={24} />
                    <div>
                        <strong className="d-block">Invoices Pending</strong>
                        <span className="small">There are <strong>{totalNotifications}</strong> orders exported or ready for export that need invoices.</span>
                    </div>
                </Alert>
            )}

            <Card className="border-0 shadow-sm overflow-hidden">
                <Table responsive hover className="align-middle mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-4">Invoice #</th>
                            <th>Order ID</th>
                            <th>Buyer</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th className="text-end pe-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-5 text-muted">No invoices found. Generate one to get started.</td></tr>
                        ) : invoices.map(i => {
                            const buyer = i.PurchaseOrder?.buyerName || i.ExportOrder?.Buyer?.name || 'N/A';
                            return (
                                <tr key={i.id}>
                                    <td className="ps-4 fw-bold text-primary">{i.invoiceNumber}</td>
                                    <td>
                                        {i.ExportOrder?.orderNumber ? (
                                            <Badge bg="info" className="fw-normal">EO {i.ExportOrder.orderNumber}</Badge>
                                        ) : i.PurchaseOrder?.id ? (
                                            <Badge bg="primary" className="fw-normal">PO-#{i.PurchaseOrder.id.toString().padStart(4, '0')}</Badge>
                                        ) : 'N/A'}
                                    </td>
                                    <td>{buyer}</td>
                                    <td>
                                        <div className="fw-bold">{i.totalAmount} {i.currency}</div>
                                        <div className="text-muted x-small">₹{parseFloat(i.totalAmountInINR).toLocaleString()}</div>
                                    </td>
                                    <td>
                                        <Badge bg={i.status === 'PAID' ? 'success' : i.status === 'PARTIAL' ? 'warning' : 'danger'} pill className="px-3">
                                            {i.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline-primary"
                                                onClick={() => { setSelectedInvoice(i); setShowViewModal(true); }}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                className="d-flex align-items-center gap-1"
                                                onClick={() => downloadPDF(i)}
                                            >
                                                <Download size={14} /> PDF
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Card>


            <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
                <Modal.Header closeButton><Modal.Title>Invoice Details - {selectedInvoice?.invoiceNumber}</Modal.Title></Modal.Header>
                <Modal.Body className="p-0">
                    <div className="p-5 bg-white">
                        <div className="d-flex justify-content-between mb-5">
                            <div className="d-flex align-items-center gap-3">
                                <div className="bg-primary text-white fw-bold px-3 py-2 rounded" style={{ fontSize: '1.5rem' }}>ACC</div>
                                <div>
                                    <h5 className="mb-0 fw-bold">Advanced Garment Corp.</h5>
                                    <div className="text-muted small">123 Production Way, Textile City</div>
                                </div>
                            </div>
                            <div className="text-end">
                                <h2 className="text-primary fw-bold mb-1">INVOICE</h2>
                                <div className="fw-bold">{selectedInvoice?.invoiceNumber}</div>
                                <div className="text-muted small">Date: {selectedInvoice && new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</div>
                            </div>
                        </div>

                        <Row className="mb-5">
                            <Col md={6}>
                                <h6 className="text-muted text-uppercase small mb-3 fw-bold">Bill To</h6>
                                <div className="d-flex align-items-center gap-3 mb-2">
                                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center fw-bold text-muted" style={{ width: 40, height: 40 }}>
                                        {(selectedInvoice?.PurchaseOrder?.buyerName || selectedInvoice?.ExportOrder?.Buyer?.name || 'C').substring(0, 1)}
                                    </div>
                                    <div className="fw-bold">{selectedInvoice?.PurchaseOrder?.buyerName || selectedInvoice?.ExportOrder?.Buyer?.name}</div>
                                </div>
                                <div className="text-muted ps-5 small">
                                    {selectedInvoice?.ExportOrder?.Buyer?.address || 'Address Not Provided'}<br />
                                    {selectedInvoice?.ExportOrder?.Buyer?.email || 'email@buyer.com'}
                                </div>
                            </Col>
                            <Col md={6} className="text-md-end">
                                <h6 className="text-muted text-uppercase small mb-3 fw-bold">Shipment Details</h6>
                                <div className="small mb-1"><span className="fw-bold">Order Ref:</span> {selectedInvoice?.ExportOrder ? 'EO-' + selectedInvoice.ExportOrder.orderNumber : 'PO-#' + selectedInvoice?.PurchaseOrder?.id}</div>
                                <div className="small mb-1"><span className="fw-bold">Port:</span> {selectedInvoice?.extraDetails?.portOfLoading || 'Local Port'}</div>
                                <div className="small mb-1"><span className="fw-bold">Method:</span> {selectedInvoice?.extraDetails?.shipmentMethod || 'SEA'}</div>
                                <div className="small"><span className="fw-bold">Due Date:</span> {selectedInvoice?.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'N/A'}</div>
                            </Col>
                        </Row>

                        <Table borderless className="mb-4">
                            <thead className="border-bottom border-top">
                                <tr>
                                    <th className="py-3 text-muted small text-uppercase">Description</th>
                                    <th className="py-3 text-muted small text-uppercase text-center">Qty</th>
                                    <th className="py-3 text-muted small text-uppercase text-end">Price</th>
                                    <th className="py-3 text-muted small text-uppercase text-end">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-bottom text-muted">
                                    <td className="py-4">
                                        <div className="text-dark fw-bold">{selectedInvoice?.PurchaseOrder?.styles?.[0]?.styleNumber || selectedInvoice?.ExportOrder?.styleName || 'Garment Style'}</div>
                                        <div className="x-small">{selectedInvoice?.PurchaseOrder?.fabricType || 'Premium Fabric'} | {selectedInvoice?.PurchaseOrder?.fitType || 'Standard Fit'}</div>
                                    </td>
                                    <td className="py-4 text-center">{selectedInvoice?.PurchaseOrder?.quantity || selectedInvoice?.ExportOrder?.totalQuantity || 1}</td>
                                    <td className="py-4 text-end">{selectedInvoice?.currency} {parseFloat(selectedInvoice?.PurchaseOrder?.pricePerUnit || selectedInvoice?.ExportOrder?.pricePerUnit || selectedInvoice?.totalAmount).toFixed(2)}</td>
                                    <td className="py-4 text-end text-dark fw-bold">{selectedInvoice?.currency} {parseFloat(selectedInvoice?.totalAmount).toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </Table>

                        <div className="d-flex justify-content-end mb-5">
                            <div style={{ width: 250 }}>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Subtotal:</span>
                                    <span>{selectedInvoice?.currency} {parseFloat(selectedInvoice?.totalAmount).toLocaleString()}</span>
                                </div>
                                <div className="d-flex justify-content-between border-top pt-3 mt-3">
                                    <span className="h5 fw-bold mb-0">TOTAL:</span>
                                    <span className="h5 fw-bold mb-0 text-primary">{selectedInvoice?.currency} {parseFloat(selectedInvoice?.totalAmount).toLocaleString()}</span>
                                </div>
                                <div className="text-end text-muted small mt-1">
                                    ₹{parseFloat(selectedInvoice?.totalAmountInINR).toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="bg-light p-4 rounded d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="fw-bold small mb-1">Payment Status</h6>
                                <Badge bg={selectedInvoice?.status === 'PAID' ? 'success' : 'danger'}>{selectedInvoice?.status}</Badge>
                            </div>
                            <div className="text-end">
                                <div className="mb-2" style={{ borderBottom: '1px solid #ccc', width: 150, marginLeft: 'auto' }}></div>
                                <div className="small fw-bold">Authorized Signature</div>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="bg-light border-0">
                    <Button variant="secondary" onClick={() => setShowViewModal(false)}>Close</Button>
                    <Button variant="primary" onClick={() => downloadPDF(selectedInvoice)}>Download PDF</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton><Modal.Title>Generate Manual Invoice</Modal.Title></Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Invoice Number</Form.Label>
                                    <Form.Control
                                        required
                                        placeholder="INV-2026-001"
                                        value={formData.invoiceNumber}
                                        onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Select Pending Order</Form.Label>
                                    <Form.Select required value={formData.exportOrderId || formData.purchaseOrderId ? (formData.exportOrderId ? `EO-${formData.exportOrderId}` : `PO-${formData.purchaseOrderId}`) : ''} onChange={e => {
                                        const [type, id] = e.target.value.split('-');
                                        let order;
                                        if (type === 'EO') {
                                            order = pendingOrders.exportOrders.find(o => String(o.id) === id);
                                            const buyerAcc = accounts.find(a => a.name.includes(order?.Buyer?.name));
                                            setFormData({
                                                ...formData,
                                                exportOrderId: id,
                                                purchaseOrderId: '',
                                                totalAmount: order?.totalAmount || 0,
                                                currency: order?.currency || 'USD',
                                                buyerAccountId: buyerAcc?.id || ''
                                            });
                                        } else {
                                            order = pendingOrders.purchaseOrders.find(o => String(o.id) === id);
                                            const buyerAcc = accounts.find(a => a.name.includes(order?.buyerName));
                                            setFormData({
                                                ...formData,
                                                purchaseOrderId: id,
                                                exportOrderId: '',
                                                totalAmount: order?.totalValue || 0,
                                                currency: 'USD',
                                                buyerAccountId: buyerAcc?.id || ''
                                            });
                                        }
                                    }}>
                                        <option value="">Select Order...</option>
                                        <optgroup label="Purchase Orders (PO)">
                                            {pendingOrders.purchaseOrders.map(o => <option key={o.id} value={`PO-${o.id}`}>PO #{o.id.toString().padStart(4, '0')} - {o.buyerName} ({o.totalValue} USD)</option>)}
                                        </optgroup>
                                        <optgroup label="Export Orders (EO)">
                                            {pendingOrders.exportOrders.map(o => <option key={o.id} value={`EO-${o.id}`}>EO {o.orderNumber} - {o.Buyer?.name}</option>)}
                                        </optgroup>
                                    </Form.Select>
                                </Form.Group>
                                <Row>
                                    <Col md={7}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Amount</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={formData.totalAmount}
                                                onChange={e => setFormData({ ...formData, totalAmount: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={5}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Ex. Rate (INR)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                step="0.01"
                                                value={formData.exchangeRate}
                                                onChange={e => setFormData({ ...formData, exchangeRate: e.target.value })}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Business Unit</Form.Label>
                                    <Form.Select required value={formData.unitId} onChange={e => setFormData({ ...formData, unitId: e.target.value })}>
                                        <option value="">Select Unit</option>
                                        {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Financial Year</Form.Label>
                                    <Form.Select required value={formData.financialYearId} onChange={e => setFormData({ ...formData, financialYearId: e.target.value })}>
                                        <option value="">Select Year</option>
                                        {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Invoice Date</Form.Label>
                                    <Form.Control type="date" required value={formData.invoiceDate} onChange={e => setFormData({ ...formData, invoiceDate: e.target.value })} />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Due Date</Form.Label>
                                    <Form.Control type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <hr />
                        <h6>Accounting Entry Mapping</h6>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Buyer Ledger (A/R - Dr)</Form.Label>
                                    <Form.Select required value={formData.buyerAccountId} onChange={e => setFormData({ ...formData, buyerAccountId: e.target.value })}>
                                        <option value="">Select Account</option>
                                        {accounts.filter(a => a.name.includes('Receivable') || a.name.includes('Buyer')).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Sales Ledger (Cr)</Form.Label>
                                    <Form.Select required value={formData.salesAccountId} onChange={e => setFormData({ ...formData, salesAccountId: e.target.value })}>
                                        <option value="">Select Account</option>
                                        {accounts.filter(a => a.name.includes('Sales') || a.name.includes('Revenue')).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Button type="submit" variant="primary" className="w-100 mt-3 py-2 shadow-sm">Generate & Post to Ledger</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Invoices;
