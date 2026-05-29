import bcrypt from 'bcrypt';
import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProivder from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

import prisma from '@/app/libs/prismadb';
import { rateLimit, getClientIp } from '@/app/libs/rateLimit';

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GithubProivder({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'email', type: 'text' },
                password: { label: 'password', type: 'password' },
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Missing input fields');
                };

                // Throttle credential attempts per (email, IP) to slow brute force.
                const ip = getClientIp(req?.headers);
                const limit = rateLimit(`login:${credentials.email}:${ip}`, 10, 15 * 60 * 1000);
                if (!limit.success) {
                    throw new Error('Too many attempts. Please try again later.');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                // Use one generic message so password vs. OAuth-only accounts are
                // indistinguishable to the caller.
                if (!user || !user.hashedPassword) throw new Error('Invalid credentials');

                const isCorrectPassword = await bcrypt.compare(credentials.password, user.hashedPassword);

                if (!isCorrectPassword) throw new Error('Invalid credentials');

                // Never let the password hash flow into the NextAuth token/session.
                const { hashedPassword, ...safeUser } = user;
                return safeUser;
            },

        }),

    ],
    debug: process.env.NODE_ENV === 'development',
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }
