import React, { useState, useCallback } from 'react'

const ToastContext = React.createContext()

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const value = { addToast, removeToast }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      maxWidth: 400,
    }}>
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function Toast({ toast, onRemove }) {
  const bgColor = toast.type === 'error' ? 'rgba(248,113,113,0.1)' : 
                  toast.type === 'success' ? 'rgba(74,222,128,0.1)' : 
                  'rgba(255,200,50,0.1)'
  
  const borderColor = toast.type === 'error' ? 'rgba(248,113,113,0.3)' : 
                      toast.type === 'success' ? 'rgba(74,222,128,0.3)' : 
                      'rgba(255,200,50,0.3)'
  
  const textColor = toast.type === 'error' ? '#f87171' : 
                    toast.type === 'success' ? '#4ade80' : 
                    '#ffc832'

  const icon = toast.type === 'error' ? '✕' : 
               toast.type === 'success' ? '✓' : 
               'ℹ'

  return (
    <div style={{
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: 12,
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      animation: 'slideIn 0.3s ease-out',
    }}>
      <span style={{
        fontSize: 16,
        color: textColor,
        fontWeight: 700,
      }}>
        {icon}
      </span>
      <span style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: 12,
        color: '#fff',
        flex: 1,
      }}>
        {toast.message}
      </span>
      <button onClick={() => onRemove(toast.id)} style={{
        background: 'none',
        border: 'none',
        color: textColor,
        cursor: 'pointer',
        fontSize: 14,
        padding: 4,
        transition: 'opacity 0.2s',
      }}
      onMouseEnter={(e) => e.target.style.opacity = '0.6'}
      onMouseLeave={(e) => e.target.style.opacity = '1'}>
        ✕
      </button>
    </div>
  )
}
