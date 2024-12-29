import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ניהול נקודות כיתתיות',
  description: 'מערכת לניהול נקודות וצבירת פרסים',
}

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
