import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: 'rgba(248,113,113,0.08)',
          border: '1px solid rgba(248,113,113,0.3)',
          borderRadius: 16,
          padding: 32,
          margin: 20,
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 24,
            fontWeight: 700,
            color: '#f87171',
            marginBottom: 12,
          }}>
            Something went wrong
          </div>
          <div style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 13,
            color: 'rgba(248,113,113,0.7)',
            marginBottom: 20,
          }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </div>
          <button onClick={() => window.location.reload()} style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: '1px solid #f87171',
            background: 'transparent',
            color: '#f87171',
            cursor: 'pointer',
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            fontWeight: 700,
            transition: 'all 0.2s',
          }}>
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
