// Cookie 操作函数
export function setCookie(name: string, value: string, days?: number) {
    if (typeof window === "undefined") return

    let expires = ""
    if (days) {
        const date = new Date()
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
        expires = "; expires=" + date.toUTCString()
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/"
}

export function getCookie(name: string) {
    if (typeof window === "undefined") return null

    const nameEQ = name + "="
    const ca = document.cookie.split(";")
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) === " ") c = c.substring(1, c.length)
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
}

export function eraseCookie(name: string) {
    if (typeof window === "undefined") return
    document.cookie = name + "=; Max-Age=-99999999; path=/"
}

// 检查登录状态
export function isLoggedIn() {
    return getCookie("username") !== null
}

// 简化版的 cn 函数，不依赖 clsx 和 tailwind-merge
export function cn(...classes: string[]) {
    return classes.filter(Boolean).join(" ")
}
