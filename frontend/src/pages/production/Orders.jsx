import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Badge, Card, Spinner, Row, Col, ProgressBar } from 'react-bootstrap';
import { Plus, ClipboardList, Target, CheckCircle, Package } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [lines, setLines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ordersRes, linesRes] = await Promise.all([
                api.get('/production/production-orders'),
                api.get('/production/production-lines')
            ]);
            setOrders(ordersRes.data);
            setLines(linesRes.data.filter(l => l.isActive));
        } catch (error) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };


    if (loading) return <div className="p-5 text-center"><Spinner animation="border" /></div>;

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Production Assignment</h4>
            </div>

            <Card className="border-0 shadow-sm">
                <Table responsive hover className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th className="ps-4">Order #</th>
                            <th>Target Line</th>
                            <th>Target Qty</th>
                            <th>Delivery Date</th>
                            <th>Produced</th>
                            <th>Defects</th>
                            <th>Progress</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.filter(order => order.isProductionStarted).map((order) => {
                            const progress = Math.min(100, Math.round((order.producedQuantity / order.targetQuantity) * 100));
                            return (
                                <tr key={order.id}>
                                    <td className="ps-4">
                                        <div className="fw-bold text-primary">
                                            {order.ExportOrder?.orderNumber || (order.PurchaseOrder ? `PO-${order.purchaseOrderId.toString().padStart(4, '0')}` : 'N/A')}
                                        </div>
                                        <small className="text-muted">
                                            {order.ExportOrder?.styleName || (order.PurchaseOrder ? `${order.PurchaseOrder.buyerName} (${order.PurchaseOrder.fabricType})` : 'N/A')}
                                        </small>
                                    </td>
                                    <td>{order.ProductionLine?.lineName}</td>
                                    <td className="fw-semibold">{order.targetQuantity?.toLocaleString()}</td>
                                    <td>
                                        {order.ExportOrder?.exportDate
                                            ? new Date(order.ExportOrder.exportDate).toLocaleDateString()
                                            : order.PurchaseOrder?.exportDate
                                                ? new Date(order.PurchaseOrder.exportDate).toLocaleDateString()
                                                : '-'}
                                    </td>
                                    <td>{order.producedQuantity?.toLocaleString()}</td>
                                    <td>
                                        <Badge bg={order.defectQuantity > (order.targetQuantity * 0.05) ? 'danger' : 'light'} text={order.defectQuantity > (order.targetQuantity * 0.05) ? 'white' : 'dark'}>
                                            {order.defectQuantity}
                                        </Badge>
                                    </td>
                                    <td style={{ width: '180px' }}>
                                        <div className="d-flex align-items-center gap-2">
                                            <ProgressBar now={progress} variant={progress === 100 ? 'success' : 'primary'} style={{ height: 6, flexGrow: 1 }} />
                                            <small className="fw-bold">{progress}%</small>
                                        </div>
                                    </td>
                                    <td>
                                        <Badge bg={order.status === 'COMPLETED' ? 'success' : 'primary'}>
                                            {order.status}
                                        </Badge>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
};


export default Orders;
