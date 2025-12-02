import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from '@/src/components/Navbar' // Import the Navbar

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BKTutor E-Learning', // Changed title
  description: 'E-Learning platform for BKU', // Changed description
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <Navbar />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </body>
    </html>
  )
}
