import { Conversation, Message, User } from "@prisma/client";

// User without the bcrypt hash — this is the only user shape that should ever be
// sent to the client. Pair it with `safeUserSelect` on the server side.
export type SafeUser = Omit<User, "hashedPassword">;

export type FullMessageType = Message & {
    sender: SafeUser,
    seen: SafeUser[]
};

export type FullConversationType = Conversation & {
    users: SafeUser[],
    messages: FullMessageType[],
}
