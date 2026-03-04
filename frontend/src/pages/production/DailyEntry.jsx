import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Card, Spinner, Row, Col, Alert, Badge } from 'react-bootstrap';
import { Plus, TrendingUp, AlertTriangle, Clock, Calendar, CheckSquare } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrdersRequest, fetchAllocationRequest, saveDailyEntryRequest, fetchReportsByDateRequest } from '../../store/slices/productionSlice';
import { toast } from 'react-hot-toast';

const DailyEntry = () => {
    const dispatch = useDispatch();
    const { orders: allOrders, currentAllocation: allocation, reportsForDate, loading } = useSelector(state => state.production);
    const orders = allOrders.filter(o => o.status === 'IN_PROGRESS');

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        productionOrderId: '',
        productionDate: new Date().toISOString().split('T')[0],
        totalProduced: 0,
        totalDefects: 0,
        remarks: ''
    });
    const [calculatedEfficiency, setCalculatedEfficiency] = useState(null);

    useEffect(() => {
        dispatch(fetchOrdersRequest());
    }, [dispatch]);

    useEffect(() => {
        if (formData.productionDate) {
            dispatch(fetchReportsByDateRequest(formData.productionDate));
        }
    }, [formData.productionDate, dispatch]);

    const filteredOrders = orders.filter(order => {
        const alreadyReported = reportsForDate.some(r => r.productionOrderId == order.id);
        return !alreadyReported;
    });

    // Fetch allocation when order or date changes
    useEffect(() => {
        const order = orders.find(o => o.id == formData.productionOrderId);
        if (order && formData.productionDate) {
            dispatch(fetchAllocationRequest({ lineId: order.lineId, date: formData.productionDate }));
        }
    }, [formData.productionOrderId, formData.productionDate, orders, dispatch]);

    // Auto-calculate efficiency preview
    useEffect(() => {
        if (allocation && formData.totalProduced) {
            const { presentWorkers, standardOutputPerWorker, workingHours } = allocation;
            const expected = presentWorkers * standardOutputPerWorker * workingHours;
            if (expected > 0) {
                const efficiency = (formData.totalProduced / expected) * 100;
                setCalculatedEfficiency(efficiency.toFixed(2));
            } else {
                setCalculatedEfficiency(null);
            }
        } else {
            setCalculatedEfficiency(null);
        }
    }, [formData.totalProduced, allocation]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const order = orders.find(o => o.id == formData.productionOrderId);
        const newTotal = (order?.producedQuantity || 0) + parseInt(formData.totalProduced || 0);

        if (parseInt(formData.totalDefects) > parseInt(formData.totalProduced)) {
            return toast.error('Defects cannot exceed total produced pieces');
        }

        if (order && newTotal > order.targetQuantity) {
            return toast.error(`Production exceeds target! Remaining capacity: ${order.targetQuantity - order.producedQuantity}`);
        }

        if (!allocation) {
            return toast.error('Worker allocation for this date and line is required.');
        }

        dispatch(saveDailyEntryRequest({
            ...formData,
            workingHours: allocation.workingHours
        }));

        setShowModal(false);
        setFormData({
            productionOrderId: '',
            productionDate: new Date().toISOString().split('T')[0],
            totalProduced: '',
            totalDefects: '',
            remarks: ''
        });
    };

    if (loading && orders.length === 0) return <div className="p-5 text-center"><Spinner animation="border" /></div>;

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Daily Production Entry</h4>
                <Button variant="success" onClick={() => setShowModal(true)} className="d-flex align-items-center gap-2">
                    <Plus size={18} /> New Daily Entry
                </Button>
            </div>

            <Row>
                <Col md={12}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white py-3 border-0">
                            <h6 className="mb-0 text-muted uppercase tracking-wider small">Active Assignment Summary</h6>
                        </Card.Header>
                        <Table responsive hover className="mb-0">
                            <thead className="bg-light">
                                <tr>
                                    <th className="ps-4">Production Line</th>
                                    <th>Style / Order</th>
                                    <th>Target</th>
                                    <th>Produced</th>
                                    <th>Defects</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td className="ps-4 fw-bold">{order.ProductionLine?.lineName}</td>
                                        <td>
                                            <div className="fw-bold">{order.ExportOrder?.styleName || order.PurchaseOrder?.fabricType || 'N/A'}</div>
                                            <small className="text-muted">{order.ExportOrder?.orderNumber || (order.PurchaseOrder ? `PO #${order.purchaseOrderId}` : 'N/A')}</small>
                                        </td>
                                        <td>{order.targetQuantity}</td>
                                        <td className="text-success fw-bold">{order.producedQuantity}</td>
                                        <td className="text-danger">{order.defectQuantity}</td>
                                        <td><Badge bg="primary">{order.status}</Badge></td>
                                    </tr>
                                ))}
                                {orders.length === 0 && <tr><td colSpan="6" className="text-center py-4">No active production orders found.</td></tr>}
                            </tbody>
                        </Table>
                    </Card>
                </Col>
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Daily Production Data Form</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="p-4">
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Select Active Production Order</Form.Label>
                                    <Form.Select
                                        value={formData.productionOrderId}
                                        onChange={(e) => setFormData({ ...formData, productionOrderId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Order...</option>
                                        {filteredOrders.map(o => (
                                            <option key={o.id} value={o.id}>
                                                {o.ProductionLine?.lineName} - {o.ExportOrder?.styleName || o.PurchaseOrder?.fabricType} ({o.ExportOrder?.orderNumber || `PO #${o.purchaseOrderId}`})
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Production Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={formData.productionDate}
                                        onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Total Produced (Pcs)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="0"
                                        value={formData.totalProduced}
                                        onChange={(e) => setFormData({ ...formData, totalProduced: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Total Defects (Pcs)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="0"
                                        value={formData.totalDefects}
                                        onChange={(e) => setFormData({ ...formData, totalDefects: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Remarks</Form.Label>
                            <Form.Control
                                as="textarea" rows={2}
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            />
                        </Form.Group>

                        {allocation ? (
                            <div className="bg-light p-3 rounded mb-3 border">
                                <Row className="small">
                                    <Col xs={6} md={3}><strong>Present Workers:</strong><br />{allocation.presentWorkers}</Col>
                                    <Col xs={6} md={3}><strong>Std Output:</strong><br />{allocation.standardOutputPerWorker}</Col>
                                    <Col xs={6} md={3}><strong>Working Hours:</strong><br />{allocation.workingHours}h</Col>
                                    <Col xs={6} md={3}><strong>Shift:</strong><br />{allocation.shiftType}</Col>
                                </Row>
                            </div>
                        ) : formData.productionOrderId && (
                            <Alert variant="warning" className="small py-2 border-0 shadow-sm d-flex align-items-center gap-2">
                                <AlertTriangle size={14} />
                                No worker allocation found for this line and date. Efficiency cannot be calculated.
                            </Alert>
                        )}

                        {(() => {
                            const selectedOrder = orders.find(o => o.id == formData.productionOrderId);
                            const newTotal = (selectedOrder?.producedQuantity || 0) + (parseInt(formData.totalProduced) || 0);
                            if (selectedOrder && newTotal > selectedOrder.targetQuantity) {
                                return (
                                    <Alert variant="danger" className="d-flex align-items-center gap-3 py-2 border-0 shadow-sm">
                                        <AlertTriangle />
                                        <div className="flex-grow-1">
                                            <strong>Warning: Quantity Overflow!</strong>
                                            <div className="small opacity-75">
                                                New total ({newTotal}) will exceed target ({selectedOrder.targetQuantity}).
                                                Max pieces allowed: {selectedOrder.targetQuantity - selectedOrder.producedQuantity}
                                            </div>
                                        </div>
                                    </Alert>
                                );
                            }
                            return null;
                        })()}

                        {calculatedEfficiency && (
                            <Alert variant={calculatedEfficiency > 90 ? 'success' : calculatedEfficiency < 70 ? 'danger' : 'warning'} className="d-flex align-items-center gap-3 py-2 border-0 shadow-sm">
                                <TrendingUp />
                                <div className="flex-grow-1">
                                    <strong>Calculated Shift Efficiency: {calculatedEfficiency}%</strong>
                                    <div className="small opacity-75">Based on actual presence and line standard.</div>
                                </div>
                                <CheckSquare className="text-success" />
                            </Alert>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="bg-light border-0 p-3">
                        <Button variant="secondary" onClick={() => setShowModal(false)} className="px-4 shadow-sm border-0">Cancel</Button>
                        <Button variant="success" type="submit" className="px-4 shadow-sm border-0" disabled={!allocation}>Submit Daily Entry</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default DailyEntry;
