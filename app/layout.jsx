import "./globals.css"

export const metadata = {
    title: "拼多多风格电商页面",
    description: "手写MyBatis: 渐进式源码实践 (全彩)",
}

export default function RootLayout({ children }) {
    return (
        <html lang="zh-CN">
        <body>{children}</body>
        </html>
    )
}
