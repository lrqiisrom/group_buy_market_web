"use client"
import Image from "next/image"

export default function PaymentModal({ isOpen, onClose, onComplete, amount, outTradeNo }) {
  if (!isOpen) return null

  return (
    <div id="paymentModal" className="modal">
      <div className="modal-content">
        <h2>请扫码支付</h2>
        <br />
        <p id="paymentAmount" style={{ color: "red" }}>
          支付金额：￥{amount}
        </p>
        <Image
          src="https://picx.zhimg.com/80/v2-c6fdaba20fb939f99e4051d23c30ae06_1440w.jpeg"
          alt="支付二维码"
          className="qr-code"
          width={200}
          height={200}
        />
        <p id="outTradeNo">{outTradeNo}</p>
        <div className="button-group">
          <button id="cancelPayment" onClick={onClose}>
            取消支付
          </button>
          <button id="completePayment" onClick={onComplete}>
            支付完成
          </button>
        </div>
      </div>
    </div>
  )
}
