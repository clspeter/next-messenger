import prisma from '@/app/libs/prismadb'
import { safeUserSelect } from '@/app/libs/safeUser'
import getCurrentUser from "./getCurrentUser"

const getConversations = async () => {
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) return [];

    try {
        const conversations = await prisma.conversation.findMany({
            orderBy: {
                lastMessageAt: 'desc'
            },
            where: {
                userIds: {
                    has: currentUser.id
                }
            },
            include: {
                users: { select: safeUserSelect },
                messages: {
                    include: {
                        sender: { select: safeUserSelect },
                        seen: { select: safeUserSelect }
                    }
                }
            }
        });

        return conversations;
    } catch (error: any) {
        return [];
    }
}

export default getConversations;
