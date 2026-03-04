import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Table, Badge, Modal } from 'react-bootstrap';
import { Trash2, UserPlus } from 'lucide-react';
import api from '../services/api';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        roleName: 'VIEWER'
    });

    const fetchData = async () => {
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            setShowModal(false);
            setFormData({ username: '', email: '', password: '', roleName: 'VIEWER' });
            fetchData();
        } catch (err) {
            alert('Error creating user: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this user?')) {
            try {
                await api.delete(`/auth/users/${id}`);
                fetchData();
            } catch (err) {
                alert('Error deleting user');
            }
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>User Management</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    <UserPlus size={18} className="me-2" /> Create New User
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Table responsive hover className="align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td><strong>{user.username}</strong></td>
                                    <td>{user.email}</td>
                                    <td>
                                        <Badge bg={user.Role?.name === 'ADMIN' ? 'danger' : 'info'}>
                                            {user.Role?.name}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge bg={user.isActive ? 'success' : 'secondary'}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="text-end">
                                        {user.Role?.name !== 'ADMIN' && (
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleDelete(user.id)}
                                                title="Delete User"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Role</Form.Label>
                            <Form.Select
                                value={formData.roleName}
                                onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                            >
                                <option value="VIEWER">VIEWER</option>
                                <option value="FINANCE_MANAGER">FINANCE_MANAGER</option>
                                <option value="EXPORT_MANAGER">EXPORT/IMPORT MANAGER</option>
                                <option value="ADMIN">ADMIN</option>
                            </Form.Select>
                        </Form.Group>
                        <Button type="submit" className="w-100">Create User</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Users;
