import prisma from '@/app/libs/prismadb';
import { safeUserSelect } from '@/app/libs/safeUser';

import getCurrentUser from './getCurrentUser';

const getMessages = async (conversationId: string) => {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser?.id) return [];

        // Prisma ignores `undefined` in `where`; without this, a missing id would
        // bypass the membership check below AND leak every message via the
        // `findMany({ where: { conversationId } })` further down. Fail closed.
        if (!conversationId) return [];

        // Fail closed: only return messages for a conversation the user belongs to.
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userIds: {
                    has: currentUser.id
                }
            },
            select: { id: true },
        });

        if (!conversation) return [];

        const messages = await prisma.message.findMany({
            where: {
                conversationId
            },
            include: {
                sender: { select: safeUserSelect },
                seen: { select: safeUserSelect }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        return messages;
    } catch (error: any) {
        return [];
    }
}

export default getMessages;
