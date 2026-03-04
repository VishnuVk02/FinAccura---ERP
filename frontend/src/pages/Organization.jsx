import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Table, Modal, Badge } from 'react-bootstrap';
import { Plus, Edit2, Trash2, Calendar, MapPin, Building2 } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const Organization = () => {
    const [years, setYears] = useState([]);
    const [units, setUnits] = useState([]);
    const [orgInfo, setOrgInfo] = useState({
        name: '',
        address: '',
        email: '',
        phone: '',
        website: '',
        currency: 'USD',
        taxId: ''
    });
    const [loading, setLoading] = useState(true);

    const [newYear, setNewYear] = useState({ name: '', startDate: '', endDate: '', isActive: true });
    const [newUnit, setNewUnit] = useState({ name: '', location: '', isActive: true });

    const [editingYear, setEditingYear] = useState(null);
    const [editingUnit, setEditingUnit] = useState(null);
    const [showEditYearModal, setShowEditYearModal] = useState(false);
    const [showEditUnitModal, setShowEditUnitModal] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [yearsRes, unitsRes, orgRes] = await Promise.all([
                api.get('/organization/financial-years'),
                api.get('/organization/units'),
                api.get('/organization')
            ]);
            setYears(yearsRes.data);
            setUnits(unitsRes.data);
            const data = orgRes.data;
            setOrgInfo({
                name: data.name || '',
                address: data.address || '',
                email: data.email || '',
                phone: data.phone || '',
                website: data.website || '',
                currency: data.currency || 'USD',
                taxId: data.taxId || ''
            });
        } catch (err) {
            toast.error('Failed to fetch data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateOrg = async (e) => {
        e.preventDefault();
        try {
            await api.put('/organization', orgInfo);
            toast.success('Organization information updated');
            fetchData();
        } catch (err) {
            toast.error('Error updating profile');
        }
    };

    const handleCreateYear = async (e) => {
        e.preventDefault();
        try {
            await api.post('/organization/financial-years', newYear);
            setNewYear({ name: '', startDate: '', endDate: '', isActive: true });
            toast.success('Financial year added');
            fetchData();
        } catch (err) {
            toast.error('Error creating year');
        }
    };

    const handleUpdateYear = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/organization/financial-years/${editingYear.id}`, editingYear);
            toast.success('Financial year updated');
            setShowEditYearModal(false);
            fetchData();
        } catch (err) {
            toast.error('Error updating year');
        }
    };

    const handleDeleteYear = async (id) => {
        if (window.confirm('Are you sure you want to delete this financial year?')) {
            try {
                await api.delete(`/organization/financial-years/${id}`);
                toast.success('Financial year deleted');
                fetchData();
            } catch (err) {
                toast.error('Error deleting year');
            }
        }
    };

    const handleCreateUnit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/organization/units', newUnit);
            setNewUnit({ name: '', location: '', isActive: true });
            toast.success('Manufacturing unit added');
            fetchData();
        } catch (err) {
            toast.error('Error creating unit');
        }
    };

    const handleUpdateUnit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/organization/units/${editingUnit.id}`, editingUnit);
            toast.success('Manufacturing unit updated');
            setShowEditUnitModal(false);
            fetchData();
        } catch (err) {
            toast.error('Error updating unit');
        }
    };

    const handleDeleteUnit = async (id) => {
        if (window.confirm('Are you sure you want to delete this unit?')) {
            try {
                await api.delete(`/organization/units/${id}`);
                toast.success('Manufacturing unit deleted');
                fetchData();
            } catch (err) {
                toast.error('Error deleting unit');
            }
        }
    };

    const openEditYearModal = (year) => {
        setEditingYear({ ...year });
        setShowEditYearModal(true);
    };

    const openEditUnitModal = (unit) => {
        setEditingUnit({ ...unit });
        setShowEditUnitModal(true);
    };

    return (
        <div className="animate-fade-in p-4">
            <div className="d-flex align-items-center gap-3 mb-4">
                <div className="p-3 bg-primary bg-opacity-10 rounded-3 text-primary">
                    <MapPin size={24} />
                </div>
                <div>
                    <h3 className="mb-0 fw-bold">Organization Setup</h3>
                    <p className="text-muted mb-0">Manage global settings and regional units</p>
                </div>
            </div>

            <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white border-0 py-3">
                    <h5 className="mb-0 d-flex align-items-center gap-2">
                        <Building2 size={18} className="text-primary" />
                        General Information
                    </h5>
                </Card.Header>
                <Card.Body>
                    <Form onSubmit={handleUpdateOrg}>
                        <Row>
                            <Col md={4} className="mb-3">
                                <Form.Label className="small fw-semibold">Organization Name</Form.Label>
                                <Form.Control
                                    value={orgInfo.name}
                                    onChange={e => setOrgInfo({ ...orgInfo, name: e.target.value })}
                                    required
                                    placeholder="Enter company name"
                                />
                            </Col>
                            <Col md={4} className="mb-3">
                                <Form.Label className="small fw-semibold">Email Address</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={orgInfo.email}
                                    onChange={e => setOrgInfo({ ...orgInfo, email: e.target.value })}
                                    placeholder="contact@company.com"
                                />
                            </Col>
                            <Col md={4} className="mb-3">
                                <Form.Label className="small fw-semibold">Phone Number</Form.Label>
                                <Form.Control
                                    value={orgInfo.phone}
                                    onChange={e => setOrgInfo({ ...orgInfo, phone: e.target.value })}
                                    placeholder="+1 234 567 890"
                                />
                            </Col>
                            <Col md={8} className="mb-3">
                                <Form.Label className="small fw-semibold">Address</Form.Label>
                                <Form.Control
                                    as="textarea" rows={1}
                                    value={orgInfo.address}
                                    onChange={e => setOrgInfo({ ...orgInfo, address: e.target.value })}
                                    placeholder="Company street address, city, country"
                                />
                            </Col>
                            <Col md={2} className="mb-3">
                                <Form.Label className="small fw-semibold">Currency</Form.Label>
                                <Form.Control
                                    value={orgInfo.currency}
                                    onChange={e => setOrgInfo({ ...orgInfo, currency: e.target.value })}
                                    placeholder="USD, EUR, INR..."
                                />
                            </Col>
                            <Col md={2} className="mb-3">
                                <Form.Label className="small fw-semibold">Tax / GST ID</Form.Label>
                                <Form.Control
                                    value={orgInfo.taxId}
                                    onChange={e => setOrgInfo({ ...orgInfo, taxId: e.target.value })}
                                    placeholder="Tax ID"
                                />
                            </Col>
                        </Row>
                        <div className="d-flex justify-content-end mt-2">
                            <Button type="submit" variant="primary" className="px-4">Save Profile Changes</Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            <Row>
                <Col lg={6}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white border-0 py-3">
                            <h5 className="mb-0 d-flex align-items-center gap-2">
                                <Calendar size={18} className="text-primary" />
                                Financial Years
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleCreateYear} className="mb-4">
                                <Row className="g-2">
                                    <Col sm={4}>
                                        <Form.Control
                                            placeholder="Name (e.g. 2025-26)"
                                            value={newYear.name}
                                            onChange={e => setNewYear({ ...newYear, name: e.target.value })}
                                            required
                                        />
                                    </Col>
                                    <Col sm={3}>
                                        <Form.Control
                                            type="date"
                                            value={newYear.startDate}
                                            onChange={e => setNewYear({ ...newYear, startDate: e.target.value })}
                                            required
                                        />
                                    </Col>
                                    <Col sm={3}>
                                        <Form.Control
                                            type="date"
                                            value={newYear.endDate}
                                            onChange={e => setNewYear({ ...newYear, endDate: e.target.value })}
                                            required
                                        />
                                    </Col>
                                    <Col sm={2}>
                                        <Button type="submit" variant="primary" className="w-100 d-flex align-items-center justify-content-center gap-2">
                                            <Plus size={18} /> Add
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                            <Table responsive hover size="sm" className="align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-3">Name</th>
                                        <th>Period</th>
                                        <th className="text-center">Status</th>
                                        <th className="text-end pe-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {years.map(y => (
                                        <tr key={y.id}>
                                            <td className="ps-3 fw-medium">{y.name}</td>
                                            <td className="small text-muted">{y.startDate} to {y.endDate}</td>
                                            <td className="text-center">
                                                <Badge bg={y.isActive ? 'success' : 'secondary'} className="rounded-pill">
                                                    {y.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="text-end pe-3">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button variant="outline-primary" size="sm" onClick={() => openEditYearModal(y)} className="p-1">
                                                        <Edit2 size={14} />
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteYear(y.id)} className="p-1">
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {years.length === 0 && !loading && <tr><td colSpan="4" className="text-center py-4 text-muted">No financial years configured.</td></tr>}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={6}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-white border-0 py-3">
                            <h5 className="mb-0 d-flex align-items-center gap-2">
                                <MapPin size={18} className="text-primary" />
                                Manufacturing Units
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleCreateUnit} className="mb-4">
                                <Row className="g-2">
                                    <Col sm={5}>
                                        <Form.Control
                                            placeholder="Unit Name"
                                            value={newUnit.name}
                                            onChange={e => setNewUnit({ ...newUnit, name: e.target.value })}
                                            required
                                        />
                                    </Col>
                                    <Col sm={5}>
                                        <Form.Control
                                            placeholder="Location"
                                            value={newUnit.location}
                                            onChange={e => setNewUnit({ ...newUnit, location: e.target.value })}
                                            required
                                        />
                                    </Col>
                                    <Col sm={2}>
                                        <Button type="submit" variant="primary" className="w-100 d-flex align-items-center justify-content-center gap-2">
                                            <Plus size={18} /> Add
                                        </Button>
                                    </Col>
                                </Row>
                            </Form>
                            <Table responsive hover size="sm" className="align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="ps-3">Name</th>
                                        <th>Location</th>
                                        <th className="text-center">Status</th>
                                        <th className="text-end pe-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {units.map(u => (
                                        <tr key={u.id}>
                                            <td className="ps-3 fw-medium">{u.name}</td>
                                            <td className="small text-muted">{u.location}</td>
                                            <td className="text-center">
                                                <Badge bg={u.isActive ? 'success' : 'secondary'} className="rounded-pill">
                                                    {u.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </td>
                                            <td className="text-end pe-3">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <Button variant="outline-primary" size="sm" onClick={() => openEditUnitModal(u)} className="p-1">
                                                        <Edit2 size={14} />
                                                    </Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteUnit(u.id)} className="p-1">
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {units.length === 0 && !loading && <tr><td colSpan="4" className="text-center py-4 text-muted">No manufacturing units configured.</td></tr>}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Edit Financial Year Modal */}
            <Modal show={showEditYearModal} onHide={() => setShowEditYearModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Financial Year</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUpdateYear}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                value={editingYear?.name || ''}
                                onChange={e => setEditingYear({ ...editingYear, name: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Start Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={editingYear?.startDate || ''}
                                        onChange={e => setEditingYear({ ...editingYear, startDate: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>End Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={editingYear?.endDate || ''}
                                        onChange={e => setEditingYear({ ...editingYear, endDate: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Check
                            type="switch"
                            label="Active"
                            checked={editingYear?.isActive || false}
                            onChange={e => setEditingYear({ ...editingYear, isActive: e.target.checked })}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditYearModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Save Changes</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Unit Modal */}
            <Modal show={showEditUnitModal} onHide={() => setShowEditUnitModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Manufacturing Unit</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUpdateUnit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Unit Name</Form.Label>
                            <Form.Control
                                value={editingUnit?.name || ''}
                                onChange={e => setEditingUnit({ ...editingUnit, name: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                value={editingUnit?.location || ''}
                                onChange={e => setEditingUnit({ ...editingUnit, location: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Check
                            type="switch"
                            label="Active"
                            checked={editingUnit?.isActive || false}
                            onChange={e => setEditingUnit({ ...editingUnit, isActive: e.target.checked })}
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowEditUnitModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit">Save Changes</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Organization;
