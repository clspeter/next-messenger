import './globals.css';

import { Inter } from 'next/font/google';

import ActiveStatus from './components/ActiveStatus';
import AuthContext from './context/AuthContext';
import ToasterContext from './context/ToasterContext';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Next Messenger',
  description: 'Messenger clone built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthContext>
          <ToasterContext />
          <ActiveStatus />
          {children}
        </AuthContext>
      </body>
    </html>
  )
}
