import { PrismaClient } from '@prisma/client';

declare global {
    var prisma: PrismaClient | undefined;
}

const client = globalThis.prisma || new PrismaClient();
// Reuse one client across hot-reloads in development; never cache in production.
if (process.env.NODE_ENV !== 'production') globalThis.prisma = client;

export default client;