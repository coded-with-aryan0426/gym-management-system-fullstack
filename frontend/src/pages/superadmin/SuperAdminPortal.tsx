import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, AlertTriangle, ArrowRight, Terminal } from 'lucide-react';
import './superadmin-portal.css';

const MASTER_PASSPHRASE = 'Aryan@maker';

// Matrix rain characters
const MATRIX_CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';

const SuperAdminPortal: React.FC = () => {
    const navigate = useNavigate();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [passphrase, setPassphrase] = useState('');
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [typedText, setTypedText] = useState('');
    const [showTransition, setShowTransition] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input on mount
    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 500);
    }, []);

    // Terminal typing animation
    useEffect(() => {
        const text = '> SECURE ACCESS TERMINAL v3.7.1';
        let i = 0;
        const timer = setInterval(() => {
            if (i <= text.length) {
                setTypedText(text.slice(0, i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, 40);
        return () => clearInterval(timer);
    }, []);

    // Matrix rain effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationId: number;
        const columns: number[] = [];
        let w = 0;
        let h = 0;

        const resize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            const fontSize = 14;
            const cols = Math.floor(w / fontSize);
            columns.length = 0;
            for (let i = 0; i < cols; i++) {
                columns.push(Math.random() * h / fontSize);
            }
        };

        resize();
        window.addEventListener('resize', resize);

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = '#00ff41';
            ctx.font = '14px monospace';

            for (let i = 0; i < columns.length; i++) {
                const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
                const x = i * 14;
                const y = columns[i] * 14;

                // Random brightness variation
                const brightness = Math.random();
                if (brightness > 0.95) {
                    ctx.fillStyle = '#ffffff';
                } else if (brightness > 0.8) {
                    ctx.fillStyle = '#00ff41';
                } else {
                    ctx.fillStyle = `rgba(0, 255, 65, ${0.1 + brightness * 0.4})`;
                }

                ctx.fillText(char, x, y);

                if (y > h && Math.random() > 0.975) {
                    columns[i] = 0;
                }
                columns[i]++;
            }

            animationId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (passphrase === MASTER_PASSPHRASE) {
            // Success — show transition then navigate
            setShowTransition(true);
            sessionStorage.setItem('sa_auth', 'true');
            setTimeout(() => {
                navigate('/superadmin');
            }, 1800);
        } else {
            // Fail
            setAttempts(prev => prev + 1);
            setShake(true);
            setError(
                attempts >= 2
                    ? `ACCESS DENIED — Attempt ${attempts + 1}. Security logged.`
                    : 'INVALID PASSPHRASE — Access denied.'
            );
            setTimeout(() => setShake(false), 500);
            setPassphrase('');
        }
    }, [passphrase, attempts, navigate]);

    // Success transition overlay
    if (showTransition) {
        return (
            <div className="portal__transition">
                <Terminal size={32} color="#00ff41" />
                <div className="portal__transition-text">AUTHENTICATING...</div>
                <div className="portal__transition-bar">
                    <div className="portal__transition-fill" />
                </div>
                <div className="portal__transition-text" style={{ fontSize: 11, opacity: 0.5, marginTop: 8 }}>
                    Initializing Super Admin Control Panel
                </div>
            </div>
        );
    }

    return (
        <div className="portal">
            {/* Matrix Rain Canvas */}
            <canvas ref={canvasRef} className="portal__canvas" />

            {/* Scanline Overlay */}
            <div className="portal__glitch-overlay" />

            {/* Login Card */}
            <div className={`portal__card ${shake ? 'portal__card--shake' : ''}`}>
                {/* Terminal Bar */}
                <div className="portal__terminal-bar">
                    <div className="portal__terminal-dots">
                        <span className="portal__terminal-dot portal__terminal-dot--red" />
                        <span className="portal__terminal-dot portal__terminal-dot--yellow" />
                        <span className="portal__terminal-dot portal__terminal-dot--green" />
                    </div>
                    <span className="portal__terminal-title">admin@titan:~</span>
                </div>

                {/* Logo */}
                <div className="portal__logo">
                    <div className="portal__logo-icon">
                        <Shield size={18} color="#000" strokeWidth={2.5} />
                    </div>
                    <span className="portal__logo-text">TITAN</span>
                </div>
                <div className="portal__subtitle">Creator Access Portal</div>

                {/* Typing animation */}
                <div className="portal__type-text">
                    <span>{typedText}</span>
                    <span className="portal__cursor-blink" />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="portal__field">
                        <label className="portal__field-label">Master Passphrase</label>
                        <div className="portal__input-wrapper">
                            <span className="portal__input-prefix">
                                <Lock size={13} />
                            </span>
                            <input
                                ref={inputRef}
                                type="password"
                                className={`portal__input ${error ? 'portal__input--error' : ''}`}
                                value={passphrase}
                                onChange={e => { setPassphrase(e.target.value); setError(''); }}
                                placeholder="••••••••••"
                                autoComplete="off"
                                spellCheck={false}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="portal__error">
                            <AlertTriangle size={12} />
                            {error}
                        </div>
                    )}

                    <button type="submit" className="portal__submit">
                        <span>Authenticate</span>
                        <ArrowRight size={14} />
                    </button>
                </form>

                <div className="portal__footer">
                    ENCRYPTED CHANNEL · AES-256 · {new Date().getFullYear()}
                </div>
            </div>
        </div>
    );
};

export default SuperAdminPortal;
