"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getCookie, eraseCookie } from "../lib/utils"
import PaymentModal from "../components/payment-modal"
import Countdown from "../components/countdown"

export default function ProductPage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [marketConfig, setMarketConfig] = useState(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [outTradeNo, setOutTradeNo] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [discountTimer, setDiscountTimer] = useState({
    hours: "00",
    minutes: "59",
    seconds: "50",
  })
  const [username, setUsername] = useState(null)
  const [userInitial, setUserInitial] = useState(null)
  const carouselRef = useRef(null)
  const carouselInterval = useRef(null)

  const baseUrl = "http://127.0.0.1:8091"

  // 检查登录状态
  useEffect(() => {
    const storedUsername = getCookie("username")
    const storedUserInitial = getCookie("userInitial")

    if (storedUsername) {
      setUsername(storedUsername)
      setUserInitial(storedUserInitial || storedUsername.charAt(0))
    }
  }, [])

  // 退出登录
  const logout = () => {
    eraseCookie("username")
    eraseCookie("userInitial")
    setUsername(null)
    setUserInitial(null)
    window.location.reload()
  }

  // 生成随机交易号
  const generateRandomNumber = (length) => {
    let result = ""
    const characters = "0123456789"
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
  }

  // 获取市场配置数据
  useEffect(() => {
    const fetchMarketConfig = async () => {
      setIsLoading(true)
      setError(null)

      const userId = getCookie("username")

      try {
        const response = await fetch(`${baseUrl}/api/v1/gbm/index/query_group_buy_market_config`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId || "guest",
            source: "s01",
            channel: "c01",
            goodsId: "9890001",
          }),
        })

        const data = await response.json()
        if (data.code === "0000") {
          setMarketConfig(data.data)
          console.log("获取市场配置成功:", data.data)

          // 检查当前用户是否已经参与拼团
          if (userId && data.data.teamList && data.data.teamList.length > 0) {
            const userTeam = data.data.teamList.find((team) => team.userId === userId)
            if (userTeam) {
              setOutTradeNo(userTeam.outTradeNo || "")
            }
          }
        } else {
          setError(`获取数据失败: ${data.info || "未知错误"}`)
        }
      } catch (error) {
        console.error("获取市场配置失败:", error)
        setError("网络错误，请检查连接")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMarketConfig()
  }, [router, baseUrl])

  // 锁定支付订单
  const lockPayOrder = async (teamId = null) => {
    const userId = getCookie("username")
    if (!userId) {
      router.push("/login")
      return false
    }

    const generatedOutTradeNo = generateRandomNumber(12)
    setOutTradeNo(generatedOutTradeNo)

    try {
      const postData = {
        userId: userId,
        teamId: teamId,
        activityId: 100123,
        goodsId: "9890001",
        source: "s01",
        channel: "c01",
        outTradeNo: generatedOutTradeNo,
        notifyUrl: `${baseUrl}/api/v1/test/group_buy_notify`,
      }

      const response = await fetch(`${baseUrl}/api/v1/gbm/trade/lock_market_pay_order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      })

      const data = await response.json()
      if (data.code === "0000") {
        return true
      } else {
        setOutTradeNo("")
        alert(data.code + "：" + data.info)
        return false
      }
    } catch (error) {
      console.error("锁定订单失败:", error)
      setOutTradeNo("")
      alert("网络错误，请检查连接")
      return false
    }
  }

  // 结算支付订单
  const settlePayOrder = async () => {
    const userId = getCookie("username")
    if (!userId || !outTradeNo) {
      return false
    }

    try {
      const postData = {
        source: "s01",
        channel: "c01",
        userId: userId,
        outTradeNo: outTradeNo,
        outTradeTime: new Date(),
      }

      const response = await fetch(`${baseUrl}/api/v1/gbm/trade/settlement_market_pay_order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      })

      const data = await response.json()
      if (data.code === "0000") {
        alert("支付&结算成功！")
        // 刷新页面或重新获取数据
        window.location.reload()
        return true
      } else {
        alert(`支付&结算失败：${data.info || "未知错误"}`)
        return false
      }
    } catch (error) {
      console.error("结算订单失败:", error)
      alert("网络错误，请检查连接")
      return false
    }
  }

  // 处理单独购买按钮点击
  const handleBuyAlone = () => {
    const userId = getCookie("username")
    if (!userId) {
      router.push("/login")
      return
    }

    if (marketConfig && marketConfig.goods) {
      setPaymentAmount(marketConfig.goods.originalPrice)
      setPaymentModalOpen(true)
    }
  }

  // 处理开团购买按钮点击
  const handleGroupBuy = async () => {
    const userId = getCookie("username")
    if (!userId) {
      router.push("/login")
      return
    }

    // 如果已经有交易号，直接打开支付弹窗
    if (outTradeNo && marketConfig && marketConfig.goods) {
      setPaymentAmount(marketConfig.goods.payPrice)
      setPaymentModalOpen(true)
      return
    }

    // 锁定订单
    const success = await lockPayOrder(null)
    if (success && marketConfig && marketConfig.goods) {
      setPaymentAmount(marketConfig.goods.payPrice)
      setPaymentModalOpen(true)
    }
  }

  // 处理参与拼团按钮点击
  const handleJoinGroup = async (teamId) => {
    const userId = getCookie("username")
    if (!userId) {
      router.push("/login")
      return
    }

    // 如果已经有交易号，直接打开支付弹窗
    if (outTradeNo && marketConfig && marketConfig.goods) {
      setPaymentAmount(marketConfig.goods.payPrice)
      setPaymentModalOpen(true)
      return
    }

    // 锁定订单
    const success = await lockPayOrder(teamId)
    if (success && marketConfig && marketConfig.goods) {
      setPaymentAmount(marketConfig.goods.payPrice)
      setPaymentModalOpen(true)
    }
  }

  // 检查登录状态
  const checkLogin = (action) => {
    if (username) {
      switch (action) {
        case "buy":
          handleBuyAlone()
          break
        case "group":
          handleGroupBuy()
          break
        case "join":
          handleJoinGroup()
          break
      }
    } else {
      // 保存当前操作到 sessionStorage，登录后可以继续
      sessionStorage.setItem("pendingAction", action)
      // 跳转到登录页
      router.push("/login")
    }
  }

  // 处理支付完成
  async function handlePaymentComplete() {
    // 调用结算接口
    await settlePayOrder()
    setPaymentModalOpen(false)
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

  // 更新折扣倒计时
  useEffect(() => {
    const interval = setInterval(() => {
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

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="retry-button" onClick={() => window.location.reload()}>
          重试
        </button>
      </div>
    )
  }

  // 获取直降价格
  const getDeductionPrice = () => {
    return marketConfig && marketConfig.goods ? marketConfig.goods.deductionPrice : 10
  }

  // 获取再抢人数
  const getRemainingUsers = () => {
    return marketConfig && marketConfig.teamStatistic ? marketConfig.teamStatistic.allTeamUserCount : 2
  }

  // 获取单独购买价格
  const getOriginalPrice = () => {
    return marketConfig && marketConfig.goods ? marketConfig.goods.originalPrice : 100
  }

  // 获取拼团价格
  const getGroupPrice = () => {
    return marketConfig && marketConfig.goods ? marketConfig.goods.payPrice : 90
  }

  return (
    <div className="container">
      {/* 用户信息区域 - 简化版 */}
      <div className="simple-login-bar">
        <div className="login-status">{username ? `欢迎回来，${username}` : "您尚未登录"}</div>
        <div className="login-action">
          {username ? (
            <button className="simple-btn" onClick={logout}>
              退出登录
            </button>
          ) : (
            <button className="simple-btn login" onClick={() => router.push("/login")}>
              登录
            </button>
          )}
        </div>
      </div>

      {/* 轮播图 */}
      <div className="carousel-container">
        <div
          className="carousel"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          <div className="carousel-item">
            <Image
              src="https://bugstack.cn/images/article/product/book/mybatis-03.png?raw=true"
              alt="MyBatis书籍"
              width={600}
              height={250}
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
            />
          </div>
          <div className="carousel-item">
            <Image
              src="https://bugstack.cn/images/article/product/book/mybatis-03.png?raw=true"
              alt="MyBatis书籍"
              width={600}
              height={250}
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
            />
          </div>
          <div className="carousel-item">
            <Image
              src="https://bugstack.cn/images/article/product/book/mybatis-03.png?raw=true"
              alt="MyBatis书籍"
              width={600}
              height={250}
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
            />
          </div>
        </div>
        <div className="carousel-dots">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className={`dot ${currentIndex === index ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
            ></div>
          ))}
        </div>
      </div>

      {/* 商品信息 */}
      <div className="product-info">
        <h1 className="product-title">手写MyBatis: 渐进式源码实践 (全彩)</h1>
        <div className="promotion-banner">
          大促优惠！直降 ¥{getDeductionPrice()}，{getRemainingUsers()}人再抢，参与马上抢到
        </div>
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

      {/* 拼单区域 */}
      <div className="group-buy">
        <div className="group-title">这些人已拼，参与可立即拼成</div>
        <div className="group-users">
          {marketConfig && marketConfig.teamList && marketConfig.teamList.length > 0 ? (
            marketConfig.teamList.map((team, index) => {
              const remaining = team.targetCount - team.lockCount
              // 直接使用后端返回的userId作为用户名
              const userId = team.userId
              // 获取用户ID的第一个字符作为头像显示
              const userInitial = userId.charAt(0)
              // 随机生成购买次数
              const purchaseCount = Math.floor(Math.random() * 20) + 10

              return (
                <div key={index} className="user-item">
                  <div className="user-info">
                    <div className="avatar">{userInitial}</div>
                    <div>
                      <div className="user-name">{userId}</div>
                      <div className="purchase-count">数码买过{purchaseCount}次</div>
                    </div>
                  </div>
                  <div className="group-status">
                    <div className="no-wait">无需等待</div>
                    <div className="status-text">组队仅剩{remaining}人，拼单即将结束</div>
                    <Countdown initialTime={team.validTimeCountdown} />
                    <button
                      className="btn-join"
                      onClick={() => {
                        handleJoinGroup(team.teamId)
                      }}
                    >
                      参与拼团
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="empty-team-message">小伙伴，赶紧去开团吧，做村里最靓的仔。</div>
          )}
        </div>
      </div>

      {/* 底部空间 */}
      <div style={{ height: "100px" }}></div>

      {/* 底部按钮 */}
      <div className="bottom-buttons">
        <button className="bottom-btn btn-buy" onClick={() => checkLogin("buy")}>
          ¥{getOriginalPrice()} 单独购买
        </button>
        <button className="bottom-btn btn-group-buy" onClick={() => checkLogin("group")}>
          ¥{getGroupPrice()} 发起拼单
        </button>
      </div>

      {/* 支付模态弹窗 */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onComplete={handlePaymentComplete}
        amount={paymentAmount}
        outTradeNo={outTradeNo}
      />
    </div>
  )
}
