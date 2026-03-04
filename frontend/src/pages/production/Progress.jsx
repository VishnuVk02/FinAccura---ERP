import React, { useState, useEffect } from 'react';
import { Row, Col, Card, ProgressBar, Badge, Table, Spinner } from 'react-bootstrap';
import { Target, CheckCircle, Clock, ArrowUpRight, AlertTriangle, Info } from 'lucide-react';
import api from '../../services/api';

const Progress = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/production/production-orders');
                setOrders(res.data);
            } catch (error) {
                console.error('Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <div className="p-5 text-center"><Spinner animation="border" /></div>;

    const inProgress = orders.filter(o => o.status === 'IN_PROGRESS');
    const completed = orders.filter(o => o.status === 'COMPLETED');

    return (
        <div className="animate-fade-in">
            <h4 className="mb-4">Order Progress Tracking</h4>

            <Row className="mb-4">
                <Col md={4}>
                    <Card className="border-0 shadow-sm bg-primary text-white p-3 h-100">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="opacity-75 mb-1 uppercase small">Total Assignments</h6>
                                <h3 className="mb-0 fw-bold">{orders.length}</h3>
                            </div>
                            <Target size={32} className="opacity-50" />
                        </div>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm bg-success text-white p-3 h-100">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="opacity-75 mb-1 uppercase small">Completed</h6>
                                <h3 className="mb-0 fw-bold">{completed.length}</h3>
                            </div>
                            <CheckCircle size={32} className="opacity-50" />
                        </div>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 shadow-sm bg-info text-white p-3 h-100">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="opacity-75 mb-1 uppercase small">In Progress</h6>
                                <h3 className="mb-0 fw-bold">{inProgress.length}</h3>
                            </div>
                            <Clock size={32} className="opacity-50" />
                        </div>
                    </Card>
                </Col>
            </Row>

            <h5 className="mb-3 d-flex align-items-center gap-2">
                <ArrowUpRight size={20} className="text-primary" /> Active Order Progress
            </h5>

            <Row>
                {inProgress.map(order => {
                    const produced = order.producedQuantity || 0;
                    const target = order.targetQuantity || 1;
                    const progress = Math.min(100, Math.round((produced / target) * 100));
                    const remaining = Math.max(0, target - produced);
                    const defectRate = ((order.defectQuantity / (produced || 1)) * 100).toFixed(1);

                    return (
                        <Col lg={4} md={6} key={order.id} className="mb-4">
                            <Card className="border-0 shadow-sm h-100 overflow-hidden">
                                <div className="p-3 bg-light border-bottom d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="fw-bold">{order.ExportOrder?.styleName || order.PurchaseOrder?.fabricType || 'N/A'}</div>
                                        <small className="text-muted">{order.ProductionLine?.lineName} - {order.ExportOrder?.orderNumber || (order.PurchaseOrder ? `PO #${order.PurchaseOrderId}` : 'N/A')}</small>
                                    </div>
                                    <Badge bg="primary">IN PROGRESS</Badge>
                                </div>
                                <Card.Body>
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="small text-muted">Completion Progress</span>
                                            <span className="small fw-bold">{progress}%</span>
                                        </div>
                                        <ProgressBar now={progress} variant={progress > 90 ? 'success' : 'primary'} style={{ height: 8 }} />
                                    </div>

                                    <Row className="text-center g-2 mb-3">
                                        <Col xs={6}>
                                            <div className="p-2 bg-light rounded">
                                                <div className="small text-muted">Target</div>
                                                <div className="fw-bold">{target.toLocaleString()}</div>
                                            </div>
                                        </Col>
                                        <Col xs={6}>
                                            <div className="p-2 bg-light rounded">
                                                <div className="small text-muted">Produced</div>
                                                <div className="fw-bold">{produced.toLocaleString()}</div>
                                            </div>
                                        </Col>
                                        <Col xs={6}>
                                            <div className="p-2 bg-light rounded">
                                                <div className="small text-muted">Remaining</div>
                                                <div className="fw-bold text-primary">{remaining.toLocaleString()}</div>
                                            </div>
                                        </Col>
                                        <Col xs={6}>
                                            <div className="p-2 bg-light rounded">
                                                <div className="small text-muted">Defects</div>
                                                <div className="fw-bold text-danger">{order.defectQuantity}</div>
                                            </div>
                                        </Col>
                                    </Row>

                                    <div className="d-flex align-items-center gap-2 small text-muted">
                                        <AlertTriangle size={14} className={defectRate > 5 ? 'text-danger' : 'text-success'} />
                                        Defect Rate: <span className="fw-semibold">{defectRate}%</span>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    );
                })}
                {inProgress.length === 0 && (
                    <Col xs={12}>
                        <div className="text-center p-5 bg-white rounded shadow-sm">
                            <Info size={40} className="text-muted mb-3" />
                            <p className="mb-0 text-muted">No active production orders found in the system.</p>
                        </div>
                    </Col>
                )}
            </Row>
        </div>
    );
};

export default Progress;
