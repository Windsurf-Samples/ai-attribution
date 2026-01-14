import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Attribution Tracker',
  description: 'Real-time AI code attribution tracking for git commits',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}
