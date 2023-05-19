import getConversationById from '@/app/actions/getConversationById';
import getMessages from '@/app/actions/getMessage';
import { Conversation } from '@prisma/client';

import EmptyState from '../../components/EmptyState';
import Body from './components/Body';
import Form from './components/Form';
import Header from './components/Header';

interface IParmas {
    conversationId: string;
}

const ConversationId = async ({ params }: { params: IParmas }) => {
    const conversation = await getConversationById(params.conversationId);
    const message = await getMessages(params.conversationId);

    if (!conversation) {
        return (
            <div className="h-full lg:pl-80">
                <div className="flex h-full flex-col">
                    <EmptyState />
                </div>
            </div>
        )
    }

    return (
        <div className="h-full lg:pl-80">
            <div className="flex h-full flex-col">
                <Header conversation={conversation} />
                <Body />
                <Form />
            </div>
        </div>
    )
}

export default ConversationId;