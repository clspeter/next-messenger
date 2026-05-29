import prisma from '@/app/libs/prismadb';
import { safeUserSelect } from '@/app/libs/safeUser';

import getCurrentUser from './getCurrentUser';

const getConversationsById = async (conversationId: string) => {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser?.id) return null;

        // Prisma ignores `undefined` in `where`; without this, a missing id would
        // drop the `id` filter and return the user's first conversation instead.
        if (!conversationId) return null;

        // Scope by membership: a user may only load a conversation they belong to.
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userIds: {
                    has: currentUser.id
                }
            },
            include: {
                users: { select: safeUserSelect },
            },
        });

        return conversation;
    } catch (error: any) {
        console.log(error, 'SERVER_ERROR')
        return null;
    }
};

export default getConversationsById;
