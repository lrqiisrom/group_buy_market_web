"use client"

import { useState } from "react"
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

            // 登录成功后跳回商品详情页
            router.push("/")
        }
    }

    return (
        <div className="login-container">
            <div className="login-header">
                <div className="login-logo">拼多多</div>
                <div className="login-slogan">多实惠，多乐趣</div>
            </div>

            <div className="login-tips">
                <h3>拼团小贴士</h3>
                <p>1. 拼团需要不同的用户一起参与，人数越多优惠越大！</p>
                <p>2. 登录后可以立即参与拼团，享受超低价格！</p>
                <p>3. 邀请好友一起拼，双方都能获得额外优惠！</p>
            </div>

            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="username" className="form-label">
                        用户名
                    </label>
                    <input
                        type="text"
                        id="username"
                        className="form-input"
                        placeholder="请输入用户名"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value)
                        }}
                        required
                    />
                    {errors.username && (
                        <div className="error-message" style={{ display: "block" }}>
                            用户名不能为空
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="password" className="form-label">
                        密码
                    </label>
                    <input
                        type="password"
                        id="password"
                        className="form-input"
                        placeholder="请输入密码"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value)
                        }}
                        required
                    />
                    {errors.password && (
                        <div className="error-message" style={{ display: "block" }}>
                            密码不能为空
                        </div>
                    )}
                </div>

                <button type="submit" className="login-btn">
                    登录
                </button>
            </form>

            <div className="back-link">
                <Link href="/">返回商品页</Link>
            </div>
        </div>
    )
}
