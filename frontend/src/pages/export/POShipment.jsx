import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Badge, Spinner } from 'react-bootstrap';
import { Truck, CheckCircle } from 'lucide-react';

const POShipment = () => {
    const dispatch = useDispatch();
    const { orders, loading } = useSelector(state => state.po);
    const [showExported, setShowExported] = useState(false);

    useEffect(() => {
        dispatch({ type: 'po/fetchExportReadyOrders' });
    }, [dispatch]);

    const handleUpdateStatus = (id, status) => {
        dispatch({
            type: 'po/updatePOStatus',
            payload: { id, status, department: 'EXPORT' }
        });
    };

    // Filter and sort logic
    const filteredOrders = [...orders]
        .filter(order => showExported
            ? order.status === 'EXPORTED'
            : order.status !== 'EXPORTED'
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">PO Readiness for Export</h5>
                <div className="d-flex gap-2">
                    <Button
                        variant={!showExported ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => setShowExported(false)}
                    >
                        Pending Export
                    </Button>
                    <Button
                        variant={showExported ? "success" : "outline-success"}
                        size="sm"
                        onClick={() => setShowExported(true)}
                    >
                        Exported
                    </Button>
                </div>
            </div>

            <Table responsive hover className="align-middle">
                <thead className="bg-light">
                    <tr>
                        <th>PO #</th>
                        <th>Buyer</th>
                        <th>Quantity</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="5" className="text-center py-4"><Spinner animation="border" size="sm" /></td></tr>
                    ) : filteredOrders.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-4 text-muted">No {showExported ? 'exported' : 'pending'} orders found.</td></tr>
                    ) : filteredOrders.map(order => (
                        <tr key={order.id}>
                            <td className="fw-bold">PO-{order.id.toString().padStart(4, '0')}</td>
                            <td>{order.buyerName}</td>
                            <td>{order.quantity.toLocaleString()}</td>
                            <td>
                                <Badge bg={
                                    order.status === 'PRODUCTION_COMPLETED' ? 'info' :
                                        order.status === 'READY_FOR_EXPORT' ? 'warning' :
                                            order.status === 'PAYMENT_COMPLETED' ? 'success' : 'dark'
                                }>
                                    {order.status.replace(/_/g, ' ')}
                                </Badge>
                            </td>
                            <td className="text-end">
                                {!showExported && order.status === 'PRODUCTION_COMPLETED' && (
                                    <Button
                                        variant="outline-warning"
                                        size="sm"
                                        onClick={() => handleUpdateStatus(order.id, 'READY_FOR_EXPORT')}
                                        className="d-flex align-items-center gap-1 ms-auto"
                                    >
                                        <Truck size={14} /> Mark Ready
                                    </Button>
                                )}
                                {!showExported && (order.status === 'READY_FOR_EXPORT' || order.status === 'PAYMENT_COMPLETED') && (
                                    <Button
                                        variant="outline-dark"
                                        size="sm"
                                        onClick={() => handleUpdateStatus(order.id, 'EXPORTED')}
                                        className="d-flex align-items-center gap-1 ms-auto"
                                    >
                                        <CheckCircle size={14} /> Mark Exported
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

export default POShipment;
