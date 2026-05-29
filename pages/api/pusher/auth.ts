import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/app/libs/prismadb';
import { pusherServer } from '@/app/libs/pusher';
import {
    PRESENCE_CHANNEL,
    CONVERSATION_CHANNEL_PREFIX,
    userChannel,
} from '@/app/libs/pusherChannels';

export default async function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    if (request.method !== 'POST') {
        return response.status(405).end();
    }

    const session = await getServerSession(request, response, authOptions);

    const email = session?.user?.email;
    if (!email) {
        return response.status(401).end();
    }

    const socketId = request.body.socket_id;
    const channel = request.body.channel_name;

    if (typeof socketId !== 'string' || typeof channel !== 'string') {
        return response.status(400).end();
    }

    try {
        // Global online-presence channel: any authenticated user may join.
        if (channel === PRESENCE_CHANNEL) {
            const auth = pusherServer.authorizeChannel(socketId, channel, {
                user_id: email,
            });
            return response.send(auth);
        }

        // Per-user private channel: must match the caller's own identity.
        if (channel === userChannel(email)) {
            const auth = pusherServer.authorizeChannel(socketId, channel);
            return response.send(auth);
        }

        // Private conversation channel: caller must be a member of that conversation.
        if (channel.startsWith(CONVERSATION_CHANNEL_PREFIX)) {
            const conversationId = channel.slice(CONVERSATION_CHANNEL_PREFIX.length);

            const currentUser = await prisma.user.findUnique({
                where: { email },
                select: { id: true },
            });
            if (!currentUser) {
                return response.status(403).end();
            }

            const conversation = await prisma.conversation.findFirst({
                where: {
                    id: conversationId,
                    userIds: { has: currentUser.id },
                },
                select: { id: true },
            });
            if (!conversation) {
                return response.status(403).end();
            }

            const auth = pusherServer.authorizeChannel(socketId, channel);
            return response.send(auth);
        }

        // Unknown channel namespace -> deny.
        return response.status(403).end();
    } catch (error) {
        // Fail closed (e.g. malformed ObjectId in conversationId).
        return response.status(403).end();
    }
}
