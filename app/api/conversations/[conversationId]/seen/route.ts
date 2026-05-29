import { NextResponse } from 'next/server';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { pusherServer } from '@/app/libs/pusher';
import { conversationChannel, userChannel } from '@/app/libs/pusherChannels';
import { safeUserSelect } from '@/app/libs/safeUser';

interface IParams {
    conversationId?: string;
};

export async function POST(
    request: Request,
    { params }: { params: IParams },
) {
    try {
        const currentUser = await getCurrentUser();
        const {
            conversationId
        } = params;

        if (!currentUser?.id || !currentUser?.email) return new NextResponse('Unauthorized', { status: 401 });

        // Guard before any DB op: a missing id would make findUnique throw, and the
        // conversationChannel() broadcast below relies on a real string.
        if (!conversationId || typeof conversationId !== 'string') {
            return new NextResponse('Invalid ID', { status: 400 });
        }

        //Find the exisiting conversation
        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId
            },
            include: {
                messages: {
                    include: {
                        seen: { select: safeUserSelect },
                    }
                },
                users: { select: safeUserSelect },
            }
        });

        if (!conversation) return new NextResponse('Invaild ID', { status: 400 });

        // Authorize: only members may mark messages seen or trigger broadcasts.
        if (!conversation.userIds.includes(currentUser.id)) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        //Find the last message
        const lastMessage = conversation.messages[conversation.messages.length - 1];

        if (!lastMessage) return NextResponse.json(conversation);

        //Update seen of last message
        const updatedMessage = await prisma.message.update({
            where: {
                id: lastMessage.id
            },
            include: {
                sender: { select: safeUserSelect },
                seen: { select: safeUserSelect },
            },
            data: {
                seen: {
                    connect: {
                        id: currentUser.id
                    }
                }
            }
        });

        await pusherServer.trigger(userChannel(currentUser.email), 'conversation:update', {
            id: conversationId,
            messages: [updatedMessage]
        })

        if (lastMessage.seenIds.indexOf(currentUser.id) !== -1) {
            return NextResponse.json(conversation);
        }

        await pusherServer.trigger(conversationChannel(conversationId), 'message:update', updatedMessage)

        return NextResponse.json(updatedMessage);
    } catch (error: any) {
        console.log(error, 'ERROR_MESSAGE_SEEN');
        return new NextResponse('Internal Error', { status: 500 })
    }
}
