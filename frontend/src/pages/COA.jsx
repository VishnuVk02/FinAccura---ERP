import React, { useState, useEffect } from 'react';
import { Card, Accordion, ListGroup, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import { Folder, FileText, Plus } from 'lucide-react';
import api from '../services/api';

const COA = () => {
    const [coa, setCoa] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('GROUP'); // GROUP, SUBGROUP, ACCOUNT
    const [parentId, setParentId] = useState(null);
    const [formData, setFormData] = useState({ name: '', nature: 'DEBIT', openingBalance: 0 });

    const fetchData = async () => {
        try {
            const res = await api.get('/coa');
            setCoa(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            if (modalType === 'GROUP') await api.post('/coa/groups', { ...formData, mainGroupId: parentId });
            else if (modalType === 'SUBGROUP') await api.post('/coa/sub-groups', { name: formData.name, groupId: parentId });
            else if (modalType === 'ACCOUNT') await api.post('/coa/accounts', { ...formData, subGroupId: parentId });

            setShowModal(false);
            setFormData({ name: '', nature: 'DEBIT', openingBalance: 0 });
            fetchData();
        } catch (err) { alert('Error creating item'); }
    };

    const openModal = (type, parent) => {
        setModalType(type);
        setParentId(parent);
        setShowModal(true);
    };

    return (
        <div>
            <h2 className="mb-4">Chart of Accounts</h2>

            <Accordion defaultActiveKey="0">
                {coa.map((mg, mgIdx) => (
                    <Accordion.Item eventKey={mgIdx.toString()} key={mg.id}>
                        <Accordion.Header className="d-flex justify-content-between">
                            <div className="d-flex align-items-center gap-2">
                                <Folder size={18} color="#007bff" />
                                <strong>{mg.name} ({mg.nature})</strong>
                            </div>
                        </Accordion.Header>
                        <Accordion.Body>
                            <Button size="sm" variant="outline-primary" className="mb-3" onClick={() => openModal('GROUP', mg.id)}>
                                <Plus size={14} /> Add Group
                            </Button>
                            <div className="ms-4">
                                {mg.Groups?.map(g => (
                                    <div key={g.id} className="mb-3">
                                        <div className="d-flex align-items-center justify-content-between border-bottom pb-1 mb-2">
                                            <span className="text-primary fw-bold">{g.name}</span>
                                            <Button size="sm" variant="link" onClick={() => openModal('SUBGROUP', g.id)}>+ SubGroup</Button>
                                        </div>
                                        <div className="ms-4">
                                            {g.SubGroups?.map(sg => (
                                                <div key={sg.id} className="mb-2">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <span className="text-secondary">{sg.name}</span>
                                                        <Button size="sm" variant="link" className="text-muted" onClick={() => openModal('ACCOUNT', sg.id)}>+ Account (Ledger)</Button>
                                                    </div>
                                                    <ListGroup className="ms-4 mt-1 shadow-sm">
                                                        {sg.Accounts?.map(acc => (
                                                            <ListGroup.Item key={acc.id} className="d-flex align-items-center gap-2 border-0 border-start border-4 border-info py-1">
                                                                <FileText size={14} /> {acc.name}
                                                            </ListGroup.Item>
                                                        ))}
                                                    </ListGroup>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                ))}
            </Accordion>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton><Modal.Title>Add {modalType}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCreate}>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </Form.Group>
                        {modalType === 'ACCOUNT' && (
                            <Form.Group className="mb-3">
                                <Form.Label>Opening Balance</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={formData.openingBalance}
                                    onChange={e => setFormData({ ...formData, openingBalance: e.target.value })}
                                />
                            </Form.Group>
                        )}
                        <Button type="submit" className="w-100">Create</Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default COA;
