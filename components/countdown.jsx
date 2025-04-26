"use client"

import { useState, useEffect } from "react"

export default function Countdown({ initialTime }) {
  const [timeLeft, setTimeLeft] = useState(initialTime || "00:00:00")

  useEffect(() => {
    // 解析初始时间
    const parseTime = (timeString) => {
      const [hours, minutes, seconds] = timeString.split(":").map(Number)
      return hours * 3600 + minutes * 60 + seconds
    }

    // 格式化时间
    const formatTime = (totalSeconds) => {
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    }

    let totalSeconds = parseTime(initialTime)

    // 设置倒计时
    const interval = setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds -= 1
        setTimeLeft(formatTime(totalSeconds))
      } else {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [initialTime])

  return <div className="countdown">{timeLeft}</div>
}
