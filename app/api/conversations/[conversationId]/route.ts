import { NextResponse } from 'next/server';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { pusherServer } from '@/app/libs/pusher';
import { userChannel } from '@/app/libs/pusherChannels';
import { safeUserSelect } from '@/app/libs/safeUser';

interface IParams {
    conversationId?: string;
}

export async function DELETE(
    request: Request,
    { params }: { params: IParams }
) {
    try {
        const { conversationId } = params;
        const currentUser = await getCurrentUser();

        if (!currentUser?.id) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Only members may see/act on the conversation. 404 (not 400) avoids an
        // existence oracle for conversation IDs the caller does not belong to.
        const existingConversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userIds: {
                    hasSome: [currentUser.id]
                }
            },
            include: {
                users: { select: safeUserSelect }
            }
        })

        if (!existingConversation) {
            return new NextResponse('Not Found', { status: 404 })
        }

        const deletedConversation = await prisma.conversation.deleteMany({
            where: {
                id: conversationId,
                userIds: {
                    hasSome: [currentUser.id]
                }
            }
        })

        existingConversation.users.forEach((user) => {
            if (user.email) {
                pusherServer.trigger(userChannel(user.email), 'conversation:remove', existingConversation)
            }
        })

        return NextResponse.json(deletedConversation);
    } catch (error: any) {
        console.log(error, 'ERROR_CONVERSATION_DELETE');
        return new NextResponse('Internal Error', { status: 500 })
    }
}
