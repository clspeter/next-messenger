'use client';

import axios from 'axios';
import { find } from 'lodash';
import { signIn } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';

import useConversation from '@/app/hooks/useConversation';
import { puhserClient } from '@/app/libs/puhser';
import { FullMessageType } from '@/app/types';

import MessageBox from './MessageBox';

interface BodyProps {
    initialMessages: any;
}

const Body: React.FC<BodyProps> = ({ initialMessages }) => {

    const [messages, setMessages] = useState<FullMessageType[]>(initialMessages);
    const bottomRef = useRef<HTMLDivElement>(null);

    const { conversationId } = useConversation();

    const messageHandler = (message: FullMessageType) => {
        axios.post(`/api/conversations/${conversationId}/seen`)

        setMessages((current) => {
            if (find(current, { id: message.id })) return current;
            return [...current, message]
        })

        bottomRef?.current?.scrollIntoView;
    }

    const updateMessageHandler = (newMessage: FullMessageType) => {
        setMessages((current) => current.map((currentMessage) => {
            if (currentMessage.id === newMessage.id) {
                return newMessage;
            }
            return currentMessage;
        }))
    }


    useEffect(() => {
        axios.post(`/api/conversations/${conversationId}/seen`)
    }, [conversationId]);

    useEffect(() => {
        puhserClient.subscribe(conversationId)
        bottomRef?.current?.scrollIntoView();

        puhserClient.bind('messages:new', messageHandler)
        puhserClient.bind('message:update', updateMessageHandler)
        return () => {
            puhserClient.unsubscribe(conversationId)
            puhserClient.unbind('messages:new', messageHandler)
            puhserClient.unbind('message:update', updateMessageHandler)
        }

    }, [conversationId])

    return (
        <div className="flex-1 overflow-y-auto">
            {messages.map((message, i) => (<MessageBox isLast={i === messages.length - 1} key={message.id} data={message} />)
            )}
            <div ref={bottomRef} className="pt-24" />
        </div>);
}

export default Body;