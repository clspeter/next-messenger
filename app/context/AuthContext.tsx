'use client'

import { SessionProvider } from 'next-auth/react'

interface AuthContexProps {
    children: React.ReactNode
}

export default function AuthContext({ children }: AuthContexProps) {
    return <SessionProvider>{children}</SessionProvider>
}