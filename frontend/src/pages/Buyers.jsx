import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Table, Modal } from 'react-bootstrap';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Buyers = () => {
    const [buyers, setBuyers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        country: '',
        currency: 'USD',
        contactPerson: '',
        email: '',
        paymentTerms: ''
    });

    const fetchData = async () => {
        try {
            const res = await api.get('/export/buyers');
            setBuyers(res.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch buyers');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/export/buyers/${editId}`, formData);
                toast.success('Buyer updated successfully');
            } else {
                await api.post('/export/buyers', formData);
                toast.success('Buyer created successfully');
            }
            setShowModal(false);
            setEditId(null);
            fetchData();
            setFormData({
                name: '', country: '', currency: 'USD',
                contactPerson: '', email: '', paymentTerms: ''
            });
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || `Error ${editId ? 'updating' : 'creating'} buyer`);
        }
    };

    const handleEdit = (buyer) => {
        setFormData({
            name: buyer.name,
            country: buyer.country,
            currency: buyer.currency,
            contactPerson: buyer.contactPerson || '',
            email: buyer.email || '',
            paymentTerms: buyer.paymentTerms || ''
        });
        setEditId(buyer.id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this buyer?')) {
            try {
                await api.delete(`/export/buyers/${id}`);
                toast.success('Buyer deleted successfully');
                fetchData();
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || 'Error deleting buyer');
            }
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditId(null);
        setFormData({
            name: '', country: '', currency: 'USD',
            contactPerson: '', email: '', paymentTerms: ''
        });
    };

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Buyer Management</h4>
                <Button variant="primary" onClick={() => setShowModal(true)} className="d-flex align-items-center gap-2">
                    <Plus size={18} /> Add New Buyer
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-4">Company Name</th>
                            <th>Country</th>
                            <th>Currency</th>
                            <th>Contact Person</th>
                            <th>Email</th>
                            <th>Payment Terms</th>
                            <th className="text-end pe-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {buyers.map(b => (
                            <tr key={b.id}>
                                <td className="ps-4 fw-bold">{b.name}</td>
                                <td>{b.country}</td>
                                <td>{b.currency}</td>
                                <td>{b.contactPerson || '-'}</td>
                                <td>{b.email || '-'}</td>
                                <td>{b.paymentTerms || '-'}</td>
                                <td className="text-end pe-4">
                                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(b)}>
                                        <Edit2 size={16} />
                                    </Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(b.id)}>
                                        <Trash2 size={16} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {buyers.length === 0 && (
                            <tr>
                                <td colSpan="7" className="text-center py-4 text-muted">No buyers found.</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editId ? 'Edit Buyer' : 'Add New Buyer'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Company Name *</Form.Label>
                            <Form.Control
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Country *</Form.Label>
                                    <Form.Control
                                        required
                                        value={formData.country}
                                        onChange={e => setFormData({ ...formData, country: e.target.value })}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Currency *</Form.Label>
                                    <Form.Select
                                        required
                                        value={formData.currency}
                                        onChange={e => setFormData({ ...formData, currency: e.target.value })}
                                    >
                                        <option value="USD">USD - US Dollar</option>
                                        <option value="EUR">EUR - Euro</option>
                                        <option value="GBP">GBP - British Pound</option>
                                        <option value="INR">INR - Indian Rupee</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Contact Person</Form.Label>
                            <Form.Control
                                value={formData.contactPerson}
                                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Payment Terms</Form.Label>
                            <Form.Control
                                placeholder="e.g. Net 30, LC at Sight"
                                value={formData.paymentTerms}
                                onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                        <Button variant="primary" type="submit">{editId ? 'Save Changes' : 'Create Buyer'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Buyers;
