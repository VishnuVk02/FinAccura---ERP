import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Badge, Spinner, Modal, Form, Row, Col } from 'react-bootstrap';
import { Play, CheckCircle, Factory, Calendar, Hash, Plus } from 'lucide-react';
import { fetchProductionDataRequest } from '../../store/slices/productionSlice';

const POInbound = () => {
    const dispatch = useDispatch();
    const { orders, loading } = useSelector(state => state.po);
    const { lines } = useSelector(state => state.production);

    const [showModal, setShowModal] = React.useState(false);
    const [selectedPO, setSelectedPO] = React.useState(null);
    const [formData, setFormData] = React.useState({
        lineId: '',
        targetQuantity: 0,
        assignedDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        dispatch({ type: 'po/fetchProductionOrders' });
        dispatch(fetchProductionDataRequest());
    }, [dispatch]);

    useEffect(() => {
        if (lines.length > 0 && !formData.lineId && selectedPO) {
            setFormData(prev => ({ ...prev, lineId: lines[0].id }));
        }
    }, [lines, selectedPO]);

    const handleViewPO = (order) => {
        setSelectedPO(order);
        setFormData({
            lineId: lines[0]?.id || '',
            targetQuantity: order.quantity,
            assignedDate: new Date().toISOString().split('T')[0]
        });
        setShowModal(true);
    };

    const handleAssignmentSubmit = (e) => {
        e.preventDefault();
        if (!selectedPO?.id) {
            toast.error('No purchase order selected');
            return;
        }
        if (!formData.lineId) {
            toast.error('Please select a production line');
            return;
        }
        if (parseInt(formData.targetQuantity) <= 0) {
            toast.error('Target quantity must be greater than zero');
            return;
        }
        dispatch({
            type: 'po/startProduction',
            payload: {
                id: selectedPO.id,
                ...formData
            }
        });
        setShowModal(false);
    };

    const handleUpdateStatus = (id, status) => {
        dispatch({
            type: 'po/updatePOStatus',
            payload: { id, status, department: 'PRODUCTION' }
        });
    };

    return (
        <div className="animate-fade-in">
            <h5 className="mb-3">Inbound Purchase Orders</h5>
            <Table responsive hover className="align-middle">
                <thead className="bg-light">
                    <tr>
                        <th>PO #</th>
                        <th>Buyer</th>
                        <th className="text-center">Styles</th>
                        <th>Quantity</th>
                        <th>Export Date</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="6" className="text-center py-4"><Spinner animation="border" size="sm" /></td></tr>
                    ) : orders.length === 0 ? (
                        <tr><td colSpan="6" className="text-center py-4 text-muted">No inbound orders for production.</td></tr>
                    ) : orders.map(order => (
                        <tr key={order.id}>
                            <td className="fw-bold">PO-{order.id.toString().padStart(4, '0')}</td>
                            <td>{order.buyerName}</td>
                            <td className="text-center">
                                <Badge bg="light" text="dark" className="border">
                                    {order.styles?.length || 0}Styles
                                </Badge>
                            </td>
                            <td className="fw-semibold">{order.quantity.toLocaleString()}</td>
                            <td>{new Date(order.exportDate).toLocaleDateString()}</td>
                            <td>
                                <Badge bg={order.status === 'CREATED' ? 'secondary' : 'primary'}>
                                    {order.status}
                                </Badge>
                            </td>
                            <td className="text-end">
                                {order.status === 'CREATED' && (
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleViewPO(order)}
                                        className="d-flex align-items-center gap-1 ms-auto"
                                    >
                                        <Plus size={14} /> View & Assign
                                    </Button>
                                )}
                                {order.status === 'IN_PRODUCTION' && (
                                    <Button
                                        variant="outline-success"
                                        size="sm"
                                        onClick={() => handleUpdateStatus(order.id, 'PRODUCTION_COMPLETED')}
                                        className="d-flex align-items-center gap-1 ms-auto"
                                    >
                                        <CheckCircle size={14} /> Complete Production
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-primary text-white border-0">
                    <Modal.Title className="h6">Purchase Order Details & Assignment</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAssignmentSubmit}>
                    <Modal.Body className="p-4">
                        {selectedPO && (
                            <>
                                <Row className="mb-4 g-3">
                                    <Col md={6}>
                                        <div className="p-3 bg-light rounded border-start border-4 border-primary">
                                            <p className="mb-1 small text-muted text-uppercase fw-bold ls-1">Buyer Information</p>
                                            <h5 className="mb-0 text-primary">{selectedPO.buyerName}</h5>
                                            <div className="mt-2 small text-muted">
                                                <Badge bg="white" text="dark" className="border me-2">PO-{selectedPO.id.toString().padStart(4, '0')}</Badge>
                                                <span>Export: {new Date(selectedPO.exportDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="p-3 bg-light rounded border-start border-4 border-info h-100">
                                            <p className="mb-1 small text-muted text-uppercase fw-bold ls-1">Product Details</p>
                                            <div className="d-flex flex-wrap gap-2 mb-2">
                                                <Badge bg="info" className="fw-normal">{selectedPO.fabricType}</Badge>
                                                <Badge bg="info" className="fw-normal">{selectedPO.fitType}</Badge>
                                            </div>
                                            <h6 className="mb-0">Total Quantity: <span className="text-info">{selectedPO.quantity.toLocaleString()} Pcs</span></h6>
                                        </div>
                                    </Col>
                                    <Col md={12}>
                                        <div className="p-3 bg-light rounded border">
                                            <p className="mb-2 small text-muted text-uppercase fw-bold ls-1">Styles included</p>
                                            <div className="d-flex flex-wrap gap-2">
                                                {selectedPO.styles?.map((s, i) => (
                                                    <Badge key={i} bg="white" text="dark" className="border py-2 px-3 fw-normal">
                                                        <Hash size={12} className="me-1 text-muted" /> {s.styleNumber}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <hr className="my-4" />
                                <h6 className="mb-3 d-flex align-items-center gap-2">
                                    <Factory size={18} className="text-primary" /> Assign Production Line
                                </h6>

                                <Row className="g-3">
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold text-muted">Select Production Line</Form.Label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0"><Factory size={16} /></span>
                                                <Form.Select
                                                    className="border-start-0 shadow-none"
                                                    value={formData.lineId}
                                                    onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                                                    required
                                                >
                                                    <option value="">Select a line...</option>
                                                    {lines.map(line => (
                                                        <option key={line.id} value={line.id}>
                                                            {line.lineName} ({line.supervisorName})
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold text-muted">Target Quantity</Form.Label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0"><Hash size={16} /></span>
                                                <Form.Control
                                                    className="border-start-0 shadow-none"
                                                    type="number"
                                                    value={formData.targetQuantity}
                                                    onChange={(e) => setFormData({ ...formData, targetQuantity: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold text-muted">Assigned Date</Form.Label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-end-0"><Calendar size={16} /></span>
                                                <Form.Control
                                                    className="border-start-0 shadow-none"
                                                    type="date"
                                                    value={formData.assignedDate}
                                                    onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="border-0 p-4 pt-0">
                        <Button variant="light" onClick={() => setShowModal(false)} className="px-4 fw-semibold text-muted shadow-sm">Cancel</Button>
                        <Button variant="primary" type="submit" className="px-4 fw-bold shadow-sm d-flex align-items-center gap-2">
                            <Play size={16} /> Start Production
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default POInbound;
