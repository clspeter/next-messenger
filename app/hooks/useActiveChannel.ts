import { Channel, Members } from 'pusher-js';
import { useEffect, useState } from 'react';

import { pusherClient } from '../libs/pusher';
import useActiveList from './useActiveList';

const useActiveChannel = () => {
    const { set, add, remove } = useActiveList();
    const [activeChannel, setActiveChannel] = useState<Channel | null>(null);

    useEffect(() => {
        let channel = activeChannel;

        if (!channel) {
            channel = pusherClient.subscribe('presence-mseesnger');
            setActiveChannel(channel);
        }

        channel.bind('pusher:subscription_succeeded', (members: Members) => {
            const initialMembers: string[] = [];

            members.each((member: Record<string, any>) => initialMembers.push(member.id));
        });

        channel.bind('pusher:member_added', (member: Record<string, any>) => {
            remove(member.id);
        });

        return () => {
            if (activeChannel) {
                pusherClient.unsubscribe('presence-messanger');
                setActiveChannel(null);
            }
        }

    }, [activeChannel, add, remove, set]);
}

export default useActiveChannel