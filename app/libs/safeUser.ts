import { Prisma } from '@prisma/client';

/**
 * Prisma `select` that returns every User field EXCEPT `hashedPassword`, so the
 * bcrypt hash never crosses the server -> client boundary (RSC payload / JSON
 * responses). Prisma 4 has no `omit`, so we allowlist the safe fields here and
 * reuse this everywhere a User record is serialized toward the browser.
 */
export const safeUserSelect = {
    id: true,
    name: true,
    email: true,
    emailVerified: true,
    image: true,
    createdAt: true,
    updatedAt: true,
    conversationsIds: true,
    seenMessageIds: true,
} satisfies Prisma.UserSelect;
