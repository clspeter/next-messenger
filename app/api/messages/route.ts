import { NextResponse } from 'next/server';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { pusherServer } from '@/app/libs/pusher';
import { conversationChannel, userChannel } from '@/app/libs/pusherChannels';
import { safeUserSelect } from '@/app/libs/safeUser';

const MAX_MESSAGE_LENGTH = 4000;

export async function POST(
    request: Request,
) {
    try {
        const currentUser = await getCurrentUser();
        const body = await request.json();
        const { message, image, conversationId } = body;

        if (!currentUser?.id || !currentUser?.email) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Validate input shape.
        if (typeof conversationId !== 'string' || !conversationId) {
            return new NextResponse('Invalid conversationId', { status: 400 });
        }
        const hasText = typeof message === 'string' && message.trim().length > 0;
        const hasImage = typeof image === 'string' && image.length > 0;
        if (!hasText && !hasImage) {
            return new NextResponse('Empty message', { status: 400 });
        }
        if (hasText && message.length > MAX_MESSAGE_LENGTH) {
            return new NextResponse('Message too long', { status: 400 });
        }
        if (hasImage) {
            try {
                if (new URL(image).protocol !== 'https:') {
                    return new NextResponse('Invalid image URL', { status: 400 });
                }
            } catch {
                return new NextResponse('Invalid image URL', { status: 400 });
            }
        }

        // Authorize: the sender must be a member of the conversation.
        const conversation = await prisma.conversation.findFirst({
            where: { id: conversationId, userIds: { has: currentUser.id } },
            select: { id: true },
        });
        if (!conversation) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        const newMessage = await prisma.message.create({
            data: {
                body: hasText ? message : undefined,
                image: hasImage ? image : undefined,
                conversation: {
                    connect: { id: conversationId }
                },
                sender: {
                    connect: { id: currentUser.id }
                },
                seen: {
                    connect: { id: currentUser.id }
                },
            },
            include: {
                seen: { select: safeUserSelect },
                sender: { select: safeUserSelect },
            }
        });

        const updatedConversation = await prisma.conversation.update({
            where: {
                id: conversationId
            },
            data: {
                lastMessageAt: new Date(),
                messages: {
                    connect: {
                        id: newMessage.id
                    }
                }
            },
            include: {
                users: { select: safeUserSelect },
                messages: {
                    include: {
                        seen: { select: safeUserSelect },
                    }
                }
            }
        });

        await pusherServer.trigger(conversationChannel(conversationId), 'messages:new', newMessage);

        const lastMessage = updatedConversation.messages[updatedConversation.messages.length - 1];

        updatedConversation.users.forEach((user) => {
            if (user.email) {
                pusherServer.trigger(userChannel(user.email), 'conversation:update', {
                    id: conversationId, messages: [lastMessage]
                })
            }
        });

        return NextResponse.json(newMessage);
    } catch (error: any) {
        console.log(error, 'ERROR_MESSAGES');
        return new NextResponse('InternalError', { status: 500 });
    }
}
