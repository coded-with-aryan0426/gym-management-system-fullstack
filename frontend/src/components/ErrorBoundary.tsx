import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorId = Math.random().toString(36).substring(2, 10).toUpperCase();

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0c',
          color: '#f0f0f5',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          padding: 24,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Grid pattern */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
          {/* Glow */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(circle 500px at 50% 50%, rgba(239,68,68,0.05) 0%, transparent 100%)',
          }} />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 520 }}>
            {/* Icon */}
            <div style={{
              width: 120, height: 120, borderRadius: 32, margin: '0 auto 32px',
              background: 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))',
              border: '1px solid rgba(239,68,68,0.15)',
              boxShadow: '0 0 60px rgba(239,68,68,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, letterSpacing: -0.5 }}>
              Something Went Wrong
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.45)', marginBottom: 24 }}>
              An unexpected error occurred. Our team has been notified. Please try refreshing.
            </p>

            {/* Error terminal */}
            {this.state.error && (
              <div style={{
                background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, padding: '16px 20px', textAlign: 'left', marginBottom: 28,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 11, lineHeight: 1.8,
                color: 'rgba(255,255,255,0.5)', maxHeight: 140, overflow: 'auto',
              }}>
                <div><span style={{ color: '#ef4444' }}>× ERROR</span> {this.state.error.message}</div>
                <div><span style={{ color: '#f59e0b' }}>ID</span> {errorId}</div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '13px 28px', border: 'none', borderRadius: 12,
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 4px 16px rgba(239,68,68,0.25)', fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  padding: '13px 28px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.65)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                Go Home
              </button>
            </div>

            {/* Error info cards */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }}>
              <div style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, textAlign: 'center', minWidth: 100 }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Error ID</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)', fontFamily: 'monospace' }}>{errorId}</div>
              </div>
              <div style={{ padding: '14px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, textAlign: 'center', minWidth: 100 }}>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>Time</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', zIndex: 1 }}>
            If this persists, contact <a href="/contact" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>support</a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
