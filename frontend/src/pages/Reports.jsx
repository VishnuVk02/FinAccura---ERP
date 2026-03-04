import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Table } from 'react-bootstrap';
import api from '../services/api';

const Reports = () => {
    const [accounts, setAccounts] = useState([]);
    const [ledger, setLedger] = useState([]);
    const [trialBalance, setTrialBalance] = useState([]);
    const [selectedAcc, setSelectedAcc] = useState('');
    const [dates, setDates] = useState({ start: '2025-04-01', end: '2026-03-31' });

    const fetchAccounts = async () => {
        try {
            const acc = await api.get('/coa');
            const flat = [];
            acc.data.forEach(mg => mg.Groups.forEach(g => g.SubGroups.forEach(sg => sg.Accounts.forEach(a => flat.push(a)))));
            setAccounts(flat);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchAccounts(); fetchTrialBalance(); }, []);

    const fetchLedger = async () => {
        if (!selectedAcc) return;
        const res = await api.get(`/reports/ledger?accountId=${selectedAcc}&startDate=${dates.start}&endDate=${dates.end}`);
        setLedger(res.data);
    };

    const fetchTrialBalance = async () => {
        const res = await api.get('/reports/trial-balance');
        setTrialBalance(res.data);
    };

    return (
        <div>
            <h2>Financial Reports</h2>

            <Row className="mb-4">
                <Col md={12}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h5>General Ledger</h5>
                            <div className="d-flex gap-2 mb-4">
                                <Form.Select onChange={e => setSelectedAcc(e.target.value)}>
                                    <option value="">Select Account</option>
                                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </Form.Select>
                                <Form.Control type="date" value={dates.start} onChange={e => setDates({ ...dates, start: e.target.value })} />
                                <Form.Control type="date" value={dates.end} onChange={e => setDates({ ...dates, end: e.target.value })} />
                                <Button onClick={fetchLedger}>View Ledger</Button>
                            </div>
                            <Table striped bordered>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Voucher #</th>
                                        <th>Type</th>
                                        <th>Narration</th>
                                        <th>Debit</th>
                                        <th>Credit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ledger.map((l, idx) => (
                                        <tr key={idx}>
                                            <td>{l.Voucher?.date}</td>
                                            <td>{l.Voucher?.voucherNumber}</td>
                                            <td>{l.Voucher?.voucherType}</td>
                                            <td>{l.Voucher?.narration}</td>
                                            <td className="text-danger">{l.debitAmount || '-'}</td>
                                            <td className="text-success">{l.creditAmount || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body>
                            <h5>Trial Balance</h5>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Account Name</th>
                                        <th>Total Dr.</th>
                                        <th>Total Cr.</th>
                                        <th>Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {trialBalance.map(b => (
                                        <tr key={b.id}>
                                            <td>{b.name}</td>
                                            <td>{b.totalDebit || 0}</td>
                                            <td>{b.totalCredit || 0}</td>
                                            <td><strong>{(b.totalDebit || 0) - (b.totalCredit || 0)}</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Reports;
