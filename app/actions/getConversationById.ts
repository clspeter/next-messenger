import prisma from '@/app/libs/prismadb';
import { Conversation } from '@prisma/client';

import { FullConversationType } from '../types';
import getCurrentUser from './getCurrentUser';

const getConversationsById = async (conversationId: string) => {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser?.email) return null;

        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                users: true,
            },
        });

        return conversation;
    } catch (error: any) {
        console.log(error, 'SERVER_ERROR')
        return null;
    }
};

export default getConversationsById;
