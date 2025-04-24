"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getCookie, eraseCookie, isLoggedIn } from "../lib/utils"
import PaymentModal from "../components/payment-modal"

export default function ProductPage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [username, setUsername] = useState(null)
  const [userInitial, setUserInitial] = useState(null)
  const [countdowns, setCountdowns] = useState(["00:05:49", "00:05:49"])
  const [discountTimer, setDiscountTimer] = useState({
    hours: "00",
    minutes: "59",
    seconds: "50",
  })
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [currentAction, setCurrentAction] = useState("")

  // 检查登录并处理
  function checkLogin(action) {
    if (isLoggedIn()) {
      handleAction(action)
    } else {
      // 保存当前操作到 sessionStorage，登录后可以继续
      if (typeof window !== "undefined") {
        sessionStorage.setItem("pendingAction", action)
        // 跳转到登录页
        router.push("/login")
      }
    }
  }

  // 处理购买/拼单操作
  function handleAction(action) {
    setCurrentAction(action)

    // 根据操作类型设置支付金额
    switch (action) {
      case "buy":
        setPaymentAmount(100)
        break
      case "group":
        setPaymentAmount(80)
        break
      case "join":
        setPaymentAmount(40)
        break
    }

    // 打开支付模态框
    setPaymentModalOpen(true)
  }

  // 处理支付完成
  function handlePaymentComplete() {
    const username = getCookie("username")

    // 关闭支付模态框
    setPaymentModalOpen(false)

    // 根据操作类型显示不同的成功消息
    switch (currentAction) {
      case "buy":
        alert(username + "，您已成功购买！感谢您的支持！")
        break
      case "group":
        alert(username + "，您已成功发起拼单！邀请好友一起来拼吧！")
        break
      case "join":
        alert(username + "，您已成功参与拼单！")
        break
    }
  }

  // 退出登录
  function logout() {
    eraseCookie("username")
    eraseCookie("userInitial")
    setUsername(null)
    setUserInitial(null)
    alert("您已退出登录")
  }

  // 检查是否有待处理的操作
  function checkPendingAction() {
    if (typeof window !== "undefined") {
      const pendingAction = sessionStorage.getItem("pendingAction")
      if (pendingAction && isLoggedIn()) {
        sessionStorage.removeItem("pendingAction")
        handleAction(pendingAction)
      }
    }
  }

  // 自动轮播
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % 3)
    }, 3000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  // 更新倒计时
  useEffect(() => {
    const interval = setInterval(() => {
      // 更新拼单倒计时
      setCountdowns((prevCountdowns) =>
          prevCountdowns.map((countdown) => {
            const parts = countdown.split(":")
            const hours = Number.parseInt(parts[0], 10)
            const minutes = Number.parseInt(parts[1], 10)
            const seconds = Number.parseInt(parts[2], 10)

            let totalSeconds = hours * 3600 + minutes * 60 + seconds

            if (totalSeconds > 0) {
              totalSeconds--

              const newHours = Math.floor(totalSeconds / 3600)
              const newMinutes = Math.floor((totalSeconds % 3600) / 60)
              const newSeconds = totalSeconds % 60

              return (
                  String(newHours).padStart(2, "0") +
                  ":" +
                  String(newMinutes).padStart(2, "0") +
                  ":" +
                  String(newSeconds).padStart(2, "0")
              )
            }
            return countdown
          }),
      )

      // 更新折扣倒计时
      setDiscountTimer((prev) => {
        const hours = Number.parseInt(prev.hours, 10)
        const minutes = Number.parseInt(prev.minutes, 10)
        const seconds = Number.parseInt(prev.seconds, 10)

        let totalSeconds = hours * 3600 + minutes * 60 + seconds

        if (totalSeconds > 0) {
          totalSeconds--

          const newHours = Math.floor(totalSeconds / 3600)
          const newMinutes = Math.floor((totalSeconds % 3600) / 60)
          const newSeconds = totalSeconds % 60

          return {
            hours: String(newHours).padStart(2, "0"),
            minutes: String(newMinutes).padStart(2, "0"),
            seconds: String(newSeconds).padStart(2, "0"),
          }
        }
        return prev
      })
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  // 加载用户信息
  useEffect(() => {
    const storedUsername = getCookie("username")
    const storedUserInitial = getCookie("userInitial")

    if (storedUsername) {
      setUsername(storedUsername)
      setUserInitial(storedUserInitial)
    }

    checkPendingAction()
  }, [])

  return (
      <div className="container">
        {/* 用户信息区域 - 登录后显示 */}
        {username && (
            <div className="user-profile">
              <div className="user-avatar">{userInitial}</div>
              <div className="welcome-text">欢迎回来，{username}</div>
              <button className="logout-btn" onClick={logout}>
                退出登录
              </button>
            </div>
        )}

        {/* 轮播图 */}
        <div className="carousel-container">
          <div
              className="carousel"
              style={{
                width: "300%",
                transform: "translateX(-" + currentIndex * (100 / 3) + "%)",
              }}
          >
            {[0, 1, 2].map((index) => (
                <div key={index} className="carousel-item">
                  <Image
                      src="https://bugstack.cn/images/article/product/book/mybatis-03.png?raw=true"
                      alt="MyBatis书籍"
                      width={600}
                      height={250}
                      style={{ objectFit: "cover", width: "100%", height: "100%" }}
                  />
                </div>
            ))}
          </div>
          <div className="carousel-dots">
            {[0, 1, 2].map((index) => (
                <div
                    key={index}
                    className={"dot " + (currentIndex === index ? "active" : "")}
                    onClick={() => {
                      setCurrentIndex(index)
                    }}
                ></div>
            ))}
          </div>
        </div>

        {/* 商品信息 */}
        <div className="product-info">
          <h1 className="product-title">手写MyBatis: 渐进式源码实践 (全彩)</h1>
          <div className="promotion-banner">大促优惠！直降 ¥60，76人再抢，参与马上抢到</div>
        </div>

        {/* 限时折扣 */}
        <div className="discount-timer">
          <div>
            <span className="discount-label">限时8折</span>
            <span>最后60分钟</span>
          </div>
          <div className="timer">
            <span className="timer-box">{discountTimer.hours}</span>
            <span className="timer-separator">:</span>
            <span className="timer-box">{discountTimer.minutes}</span>
            <span className="timer-separator">:</span>
            <span className="timer-box">{discountTimer.seconds}</span>
          </div>
        </div>

        {/* 配送信息 */}
        <div className="shipping-info">先用后付 | 支持0元下单，确认收货后再付款</div>

        {/* 标签 */}
        <div className="tags-container">
          <div className="tag">最快1小时发货</div>
          <div className="tag">回头客好店✨2024年入选</div>
          <div className="tag">正品保障</div>
        </div>

        {/* 拼单区域 */}
        <div className="group-buy">
          <div className="group-title">这些人已拼，参与可立即拼成</div>
          <div className="group-users">
            {["小傅哥", "李二狗"].map((name, index) => (
                <div key={index} className="user-item">
                  <div className="user-info">
                    <div className="avatar">{name.charAt(0)}</div>
                    <div>
                      <div className="user-name">{name}</div>
                      <div className="purchase-count">数码买过{index === 0 ? "22" : "11"}次</div>
                    </div>
                  </div>
                  <div className="group-status">
                    <div className="no-wait">无需等待</div>
                    <div className="status-text">拼单即将结束</div>
                    <div className="countdown">{countdowns[index]}</div>
                    <button
                        className="btn-join"
                        onClick={() => {
                          checkLogin("join")
                        }}
                    >
                      立即拼成
                    </button>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* 底部空间 */}
        <div style={{ height: "100px" }}></div>

        {/* 底部按钮 */}
        <div className="bottom-buttons">
          <button
              className="bottom-btn btn-buy"
              onClick={() => {
                checkLogin("buy")
              }}
          >
            ¥100 单独购买
          </button>
          <button
              className="bottom-btn btn-group-buy"
              onClick={() => {
                checkLogin("group")
              }}
          >
            ¥80 发起拼单
          </button>
        </div>

        {/* 支付模态弹窗 */}
        <PaymentModal
            isOpen={paymentModalOpen}
            onClose={() => {
              setPaymentModalOpen(false)
            }}
            onComplete={handlePaymentComplete}
            amount={paymentAmount}
            actionType={currentAction}
        />
      </div>
  )
}
