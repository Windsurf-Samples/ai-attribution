import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OTEL Commit Viewer',
  description: 'Real-time viewer for git commit traces',
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
