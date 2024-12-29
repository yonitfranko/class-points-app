import './globals.css'

export const metadata = {
  title: 'ניהול נקודות כיתתיות',
  description: 'מערכת לניהול נקודות וצבירת פרסים',
}

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
