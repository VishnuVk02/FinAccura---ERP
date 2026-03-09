import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Card, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { Plus, Users, Calendar, Clock, Briefcase, TrendingUp } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductionDataRequest, saveAllocationRequest } from '../../store/slices/productionSlice';
import { toast } from 'react-hot-toast';

const Workers = ({ commonDate }) => {
    const dispatch = useDispatch();
    const { allocations, lines: allLines, loading } = useSelector(state => state.production);
    const lines = allLines.filter(l => l.isActive);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        lineId: '',
        shiftType: 'DAY',
        plannedWorkers: '',
        presentWorkers: '',
        standardOutputPerWorker: '8', // default 8
        workingHours: '8', // default 8
        supervisorName: '',
        allocationDate: commonDate || new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        dispatch(fetchProductionDataRequest());
    }, [dispatch]);

    useEffect(() => {
        if (commonDate) {
            setFormData(prev => ({ ...prev, allocationDate: commonDate }));
        }
    }, [commonDate]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (Number(formData.presentWorkers) > Number(formData.plannedWorkers)) {
            return toast.error('Present workers cannot exceed planned workers');
        }

        dispatch(saveAllocationRequest(formData));
        setShowModal(false);
        setFormData({ lineId: '', shiftType: 'DAY', plannedWorkers: '', presentWorkers: '', standardOutputPerWorker: '8', workingHours: '8', supervisorName: '', allocationDate: commonDate || new Date().toISOString().split('T')[0] });
    };

    if (loading && allocations.length === 0) return <div className="p-5 text-center"><Spinner animation="border" /></div>;

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Worker & Shift Allocation</h4>
                <Button variant="info" onClick={() => setShowModal(true)} className="d-flex align-items-center gap-2 text-white">
                    <Plus size={18} /> Allocate Workers
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white py-3 border-0">
                    <div className="d-flex align-items-center gap-2">
                        <Users size={18} className="text-info" />
                        <h6 className="mb-0">Recent Shift Allocations</h6>
                    </div>
                </Card.Header>
                <Table responsive hover className="mb-0">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-4">Date</th>
                            <th>Production Line</th>
                            <th>Shift Type</th>
                            <th>Planned</th>
                            <th>Present</th>
                            <th>Std Output</th>
                            <th>Hours</th>
                            <th>Supervisor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allocations.map(alloc => (
                            <tr key={alloc.id}>
                                <td className="ps-4">
                                    <div className="d-flex align-items-center gap-2">
                                        <Calendar size={14} className="text-muted" />
                                        {alloc.allocationDate}
                                    </div>
                                </td>
                                <td className="fw-bold">{alloc.ProductionLine?.lineName}</td>
                                <td>
                                    <Badge bg={alloc.shiftType === 'DAY' ? 'warning' : 'dark'} text={alloc.shiftType === 'DAY' ? 'dark' : 'white'} className="px-3">
                                        <Clock size={12} className="me-1" /> {alloc.shiftType}
                                    </Badge>
                                </td>
                                <td>{alloc.plannedWorkers}</td>
                                <td className="text-info fw-bold">{alloc.presentWorkers}</td>
                                <td>{alloc.standardOutputPerWorker}</td>
                                <td>{alloc.workingHours}h</td>
                                <td>{alloc.supervisorName || '-'}</td>
                            </tr>
                        ))}
                        {allocations.length === 0 && <tr><td colSpan="8" className="text-center py-4 text-muted">No worker allocations recorded yet.</td></tr>}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Daily Worker Allocation</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="p-4">
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Production Line</Form.Label>
                                    <Form.Select
                                        value={formData.lineId}
                                        onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Line...</option>
                                        {lines.filter(line => {
                                            const isAlreadyAllocated = allocations.some(alloc =>
                                                alloc.lineId == line.id &&
                                                alloc.allocationDate === formData.allocationDate &&
                                                alloc.shiftType === formData.shiftType
                                            );
                                            return !isAlreadyAllocated;
                                        }).map(l => (
                                            <option key={l.id} value={l.id}>{l.lineName}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Supervisor Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Optional"
                                        value={formData.supervisorName}
                                        onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Shift Type</Form.Label>
                                    <Form.Select
                                        value={formData.shiftType}
                                        onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}
                                        required
                                    >
                                        <option value="DAY">Day Shift</option>
                                        <option value="NIGHT">Night Shift</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Planned Workers</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.plannedWorkers}
                                        onChange={(e) => setFormData({ ...formData, plannedWorkers: e.target.value })}
                                        required
                                        min="0"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Present Workers</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.presentWorkers}
                                        onChange={(e) => setFormData({ ...formData, presentWorkers: e.target.value })}
                                        required
                                        min="0"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Std Output / Worker</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.standardOutputPerWorker}
                                        onChange={(e) => setFormData({ ...formData, standardOutputPerWorker: e.target.value })}
                                        required
                                        min="1"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Working Hours</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.5"
                                        value={formData.workingHours}
                                        onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                                        required
                                        min="0.5"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Allocation Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={formData.allocationDate}
                                onChange={(e) => setFormData({ ...formData, allocationDate: e.target.value })}
                                required
                            />
                        </Form.Group>

                        <div className="p-3 bg-light rounded x-small text-muted">
                            <TrendingUp size={12} className="me-1" /> Efficiency will be recalculated based on actual strength assigned.
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                        <Button variant="info" type="submit" className="text-white px-4">Save Allocation</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Workers;
