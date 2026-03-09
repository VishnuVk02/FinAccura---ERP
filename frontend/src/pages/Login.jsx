import React, { useEffect, useRef, useState } from 'react';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { loginRequest } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { Factory } from 'lucide-react';
import gsap from 'gsap';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const dispatch = useDispatch();
    const { user, error: authError, loading } = useSelector(state => state.auth);
    const navigate = useNavigate();
    const cardRef = useRef(null);
    const bgRef = useRef(null);

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        // Card entrance animation
        if (cardRef.current) {
            gsap.fromTo(cardRef.current,
                { opacity: 0, y: 50, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.2)' }
            );
        }
        // Background gradient animation
        if (bgRef.current) {
            gsap.fromTo(bgRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 1.2, ease: 'power2.out' }
            );
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(loginRequest({ email, password }));
    };

    return (
        <div ref={bgRef} style={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #000328 0%, #00458e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Container className="d-flex align-items-center justify-content-center">
                <Card ref={cardRef} style={{
                    maxWidth: '420px',
                    width: '100%',
                    borderRadius: '20px',
                    boxShadow: '10px 10px 40px rgba(238, 227, 227, 0.58)',
                    backdropFilter: 'blur(10px)',
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                }} className="border-0">
                    <Card.Body className="p-5">
                        <div className="text-center mb-4">
                            <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                                style={{ width: 60, height: 60, background: 'linear-gradient(135deg, #000328, #00458e)' }}>
                                <Factory size={30} color="white" />
                            </div>
                            <h3 className="fw-bold mb-1">FINACCURA</h3>
                            <p className="text-muted small">Sign in to your account</p>
                        </div>

                        {authError && <Alert variant="danger" className="py-2 small">{authError}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label className="small fw-semibold">Email Address</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="admin@erp.com"
                                    className="py-2"
                                />
                            </Form.Group>
                            <Form.Group className="mb-4">
                                <Form.Label className="small fw-semibold">Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="py-2"
                                />
                            </Form.Group>
                            <Button type="submit" className="w-100 py-2 fw-semibold"
                                style={{ background: 'linear-gradient(135deg, #000328, #00458e)', border: 'none' }}>
                                Sign In
                            </Button>
                        </Form>

                        <div className="mt-4 text-center">
                            <p className="text-muted small mb-1">Test Credentials:</p>
                            <p className="text-muted small mb-0"><code>admin@erp.com</code> / <code>admin123</code></p>
                        </div>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
};

export default Login;
