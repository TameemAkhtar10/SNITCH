import React, { useEffect, useState } from 'react'
import './Toast.css'

const Toast = ({ message, type = 'error', onClose, duration = 4000 }) => {
    const [isVisible, setIsVisible] = useState(!!message)

    useEffect(() => {
        if (!message) {
            setIsVisible(false)
            return
        }

        setIsVisible(true)
        const timer = setTimeout(() => {
            setIsVisible(false)
            setTimeout(onClose, 300) // Allow animation to finish
        }, duration)

        return () => clearTimeout(timer)
    }, [message, onClose, duration])

    if (!isVisible) return null

    return (
        <div className={`toast toast-${type} ${isVisible ? 'toast-show' : 'toast-hide'}`}>
            <div className="toast-content">
                {type === 'error' && <span className="toast-icon error-icon">✕</span>}
                {type === 'success' && <span className="toast-icon success-icon">✓</span>}
                {type === 'info' && <span className="toast-icon info-icon">ℹ</span>}
                <p className="toast-message">{message}</p>
            </div>
            <button className="toast-close" onClick={onClose} aria-label="Close notification">×</button>
        </div>
    )
}

export default Toast
