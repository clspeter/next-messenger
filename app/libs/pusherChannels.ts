/**
 * Centralized Pusher channel-name helpers so the client subscriber, the server
 * trigger, and the /api/pusher/auth authorizer always agree on naming.
 *
 * The `private-` prefix forces Pusher to call /api/pusher/auth before a client
 * is allowed to subscribe — that endpoint is where we enforce membership. Using
 * unprefixed (public) channel names, as the original code did, let anyone with
 * the public app key subscribe and eavesdrop without any authorization check.
 */

export const PRESENCE_CHANNEL = 'presence-messenger';

export const CONVERSATION_CHANNEL_PREFIX = 'private-conversation-';
export const USER_CHANNEL_PREFIX = 'private-user-';

export const conversationChannel = (conversationId: string) =>
    `${CONVERSATION_CHANNEL_PREFIX}${conversationId}`;

export const userChannel = (email: string) =>
    `${USER_CHANNEL_PREFIX}${email}`;
