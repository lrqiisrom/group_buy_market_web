"use client"

import { useState, useEffect } from "react"

export default function PaymentModal({ isOpen, onClose, onComplete, amount, actionType }) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true)
        } else {
            const timer = setTimeout(() => {
                setIsVisible(false)
            }, 300)
            return () => {
                clearTimeout(timer)
            }
        }
    }, [isOpen])

    if (!isOpen && !isVisible) return null

    return (
        <div className="modal-overlay" style={{ opacity: isOpen ? 1 : 0 }} onClick={onClose}>
            <div
                className="modal-container"
                style={{ transform: isOpen ? "scale(1)" : "scale(0.95)" }}
                onClick={(e) => {
                    e.stopPropagation()
                }}
            >
                <div className="modal-content">
                    <h2 className="modal-title">请扫码支付</h2>
                    <p className="modal-amount">支付金额 ¥{amount}</p>

                    <div className="qr-code">
                        <div className="qr-code-text">二维码</div>
                    </div>

                    <div className="modal-buttons">
                        <button className="cancel-button" onClick={onClose}>
                            取消支付
                        </button>
                        <button className="complete-button" onClick={onComplete}>
                            完成支付
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
