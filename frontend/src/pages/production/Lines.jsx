import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Badge, Card, Spinner, Row, Col } from 'react-bootstrap';
import { Plus, Edit2, Power, Users, User, MapPin, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const Lines = () => {
    const [lines, setLines] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingLine, setEditingLine] = useState(null);
    const [formData, setFormData] = useState({
        lineName: '',
        totalWorkers: '',
        supervisorName: '',
        unitId: '',
        isActive: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [linesRes, unitsRes] = await Promise.all([
                api.get('/production/production-lines'),
                api.get('/organization/units')
            ]);
            setLines(linesRes.data);
            setUnits(unitsRes.data);
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (line = null) => {
        if (line) {
            setEditingLine(line);
            setFormData({
                lineName: line.lineName,
                totalWorkers: line.totalWorkers,
                supervisorName: line.supervisorName,
                unitId: line.unitId,
                isActive: line.isActive
            });
        } else {
            setEditingLine(null);
            setFormData({ lineName: '', totalWorkers: '', supervisorName: '', unitId: '', isActive: true });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLine) {
                await api.put(`/production/production-lines/${editingLine.id}`, formData);
                toast.success('Line updated successfully');
            } else {
                await api.post('/production/production-lines', formData);
                toast.success('Line created successfully');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const toggleStatus = async (line) => {
        try {
            await api.put(`/production/production-lines/${line.id}`, { isActive: !line.isActive });
            toast.success(`Line ${line.isActive ? 'deactivated' : 'activated'} successfully`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to PERMANENTLY delete this line? This action cannot be undone.')) return;
        try {
            await api.delete(`/production/production-lines/${id}`);
            toast.success('Line deleted permanently');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete line. It might have existing production data.');
        }
    };

    if (loading) return <div className="p-5 text-center"><Spinner animation="border" /></div>;

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Production Lines Management</h4>
                <Button variant="primary" onClick={() => handleOpenModal()} className="d-flex align-items-center gap-2">
                    <Plus size={18} /> Create New Line
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-4">Line Name</th>
                            <th>Unit</th>
                            <th>Worker Count</th>
                            <th>Supervisor</th>
                            <th>Status</th>
                            <th className="text-end pe-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lines.map((line) => (
                            <tr key={line.id}>
                                <td className="ps-4 fw-bold text-primary">{line.lineName}</td>
                                <td>
                                    <div className="d-flex align-items-center gap-2">
                                        <MapPin size={14} className="text-muted" />
                                        {line.Unit?.name || 'N/A'}
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex align-items-center gap-2">
                                        <Users size={14} className="text-muted" />
                                        {line.totalWorkers}
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex align-items-center gap-2">
                                        <User size={14} className="text-muted" />
                                        {line.supervisorName}
                                    </div>
                                </td>
                                <td>
                                    <Badge bg={line.isActive ? 'success' : 'secondary'} className="px-3 py-2">
                                        {line.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    </Badge>
                                </td>
                                <td className="text-end pe-4">
                                    <div className="d-flex justify-content-end gap-2">
                                        <Button variant="outline-primary" size="sm" onClick={() => handleOpenModal(line)}>
                                            <Edit2 size={14} />
                                        </Button>
                                        <Button variant={line.isActive ? "outline-warning" : "outline-success"} size="sm" onClick={() => toggleStatus(line)}>
                                            <Power size={14} />
                                        </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(line.id)}>
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editingLine ? 'Edit Production Line' : 'Create New Production Line'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Line Name</Form.Label>
                            <Form.Control
                                type="text" placeholder="e.g. Line A, Stitching Section 1"
                                value={formData.lineName}
                                onChange={(e) => setFormData({ ...formData, lineName: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Unit</Form.Label>
                                    <Form.Select
                                        value={formData.unitId}
                                        onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Unit</option>
                                        {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Worker Count</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.totalWorkers}
                                        onChange={(e) => setFormData({ ...formData, totalWorkers: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Supervisor Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.supervisorName}
                                onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Check
                            type="switch"
                            label="Set as Active"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">{editingLine ? 'Update' : 'Create'} Line</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Lines;
