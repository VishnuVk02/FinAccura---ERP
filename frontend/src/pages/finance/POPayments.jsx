import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Badge, Spinner } from 'react-bootstrap';
import { CreditCard, CheckCircle } from 'lucide-react';

const POPayments = () => {
    const dispatch = useDispatch();
    const { orders, loading } = useSelector(state => state.po);

    useEffect(() => {
        dispatch({ type: 'po/fetchFinanceOrders' });
    }, [dispatch]);

    const handleUpdateStatus = (id, status) => {
        dispatch({
            type: 'po/updatePOStatus',
            payload: { id, status, department: 'FINANCE' }
        });
    };

    return (
        <div className="animate-fade-in">
            <h5 className="mb-3">PO Payment Tracking</h5>
            <Table responsive hover className="align-middle">
                <thead className="bg-light">
                    <tr>
                        <th>PO #</th>
                        <th>Buyer</th>
                        <th>Value</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="5" className="text-center py-4"><Spinner animation="border" size="sm" /></td></tr>
                    ) : orders.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-4 text-muted">No exported orders pending payment.</td></tr>
                    ) : orders.map(order => (
                        <tr key={order.id}>
                            <td className="fw-bold">PO-{order.id.toString().padStart(4, '0')}</td>
                            <td>{order.buyerName}</td>
                            <td className="fw-bold text-success">${parseFloat(order.totalValue).toLocaleString()}</td>
                            <td>
                                <Badge bg={
                                    order.status === 'EXPORTED' ? 'dark' :
                                        order.status === 'PAYMENT_PENDING' ? 'danger' : 'success'
                                }>
                                    {order.status}
                                </Badge>
                            </td>
                            <td className="text-end">
                                {order.status === 'EXPORTED' && (
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleUpdateStatus(order.id, 'PAYMENT_PENDING')}
                                        className="d-flex align-items-center gap-1 ms-auto"
                                    >
                                        <CreditCard size={14} /> Request Payment
                                    </Button>
                                )}
                                {order.status === 'PAYMENT_PENDING' && (
                                    <Button
                                        variant="outline-success"
                                        size="sm"
                                        onClick={() => handleUpdateStatus(order.id, 'PAYMENT_COMPLETED')}
                                        className="d-flex align-items-center gap-1 ms-auto"
                                    >
                                        <CheckCircle size={14} /> Confirm Payment
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default POPayments;
