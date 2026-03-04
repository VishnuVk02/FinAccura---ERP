import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Badge, Spinner } from 'react-bootstrap';
import { Truck, CheckCircle } from 'lucide-react';

const POShipment = () => {
    const dispatch = useDispatch();
    const { orders, loading } = useSelector(state => state.po);

    useEffect(() => {
        dispatch({ type: 'po/fetchExportReadyOrders' });
    }, [dispatch]);

    const handleUpdateStatus = (id, status) => {
        dispatch({
            type: 'po/updatePOStatus',
            payload: { id, status, department: 'EXPORT' }
        });
    };

    return (
        <div className="animate-fade-in">
            <h5 className="mb-3">PO Readiness for Export</h5>
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
                    ) : orders.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-4 text-muted">No orders ready for export.</td></tr>
                    ) : orders.map(order => (
                        <tr key={order.id}>
                            <td className="fw-bold">PO-{order.id.toString().padStart(4, '0')}</td>
                            <td>{order.buyerName}</td>
                            <td>{order.quantity.toLocaleString()}</td>
                            <td>
                                <Badge bg={
                                    order.status === 'PRODUCTION_COMPLETED' ? 'info' :
                                        order.status === 'READY_FOR_EXPORT' ? 'warning' : 'dark'
                                }>
                                    {order.status}
                                </Badge>
                            </td>
                            <td className="text-end">
                                {order.status === 'PRODUCTION_COMPLETED' && (
                                    <Button
                                        variant="outline-warning"
                                        size="sm"
                                        onClick={() => handleUpdateStatus(order.id, 'READY_FOR_EXPORT')}
                                        className="d-flex align-items-center gap-1 ms-auto"
                                    >
                                        <Truck size={14} /> Mark Ready
                                    </Button>
                                )}
                                {order.status === 'READY_FOR_EXPORT' && (
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
