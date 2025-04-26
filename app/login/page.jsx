"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { setCookie } from "../../lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({
    username: false,
    password: false,
  })
  const [pendingAction, setPendingAction] = useState(null)

  // 检查是否有待处理的操作
  useEffect(() => {
    const action = sessionStorage.getItem("pendingAction")
    if (action) {
      setPendingAction(action)
    }
  }, [])

  // 处理登录
  function handleLogin(event) {
    event.preventDefault()

    // 简单验证
    const newErrors = {
      username: !username.trim(),
      password: !password.trim(),
    }

    setErrors(newErrors)

    if (!newErrors.username && !newErrors.password) {
      // 简单登录逻辑，实际应用中应该有后端验证
      // 这里我们只是模拟登录成功
      const userInitial = username.charAt(0)

      // 设置 cookie，保存用户信息
      setCookie("username", username, 7) // 保存7天
      setCookie("userInitial", userInitial, 7)

      // 清除待处理的操作
      if (pendingAction) {
        sessionStorage.removeItem("pendingAction")
      }

      // 登录成功后跳回商品详情页
      router.push("/")
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1 className="login-title">欢迎登录 - 聚多多拼团</h1>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <input
              type="text"
              id="username"
              className={`form-input ${errors.username ? "error" : ""}`}
              placeholder="用户名"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                if (e.target.value.trim()) {
                  setErrors((prev) => ({ ...prev, username: false }))
                }
              }}
              required
            />
            {errors.username && <div className="error-message">用户名不能为空</div>}
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              className={`form-input ${errors.password ? "error" : ""}`}
              placeholder="密码"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (e.target.value.trim()) {
                  setErrors((prev) => ({ ...prev, password: false }))
                }
              }}
              required
            />
            {errors.password && <div className="error-message">密码不能为空</div>}
          </div>

          <div className="login-tips">
            <h3>拼团小贴士</h3>
            <p>1. 拼团需要不同的用户一起参与，人数越多优惠越大！</p>
            <p>2. 登录后可以立即参与拼团，享受超低价格！</p>
            <p>3. 邀请好友一起拼，双方都能获得额外优惠！</p>
          </div>

          <button type="submit" className="login-btn">
            登录
          </button>

          <div className="back-link">
            <Link href="/">返回商品页</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
