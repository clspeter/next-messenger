'use client';

import { User } from "@prisma/client";
import Image from 'next/image';

interface AvatarProps {
    user?: User;
}

const Avator: React.FC<AvatarProps> = ({ user }) => {
    return (
        <div className="relative">
            <div className="relative inline-block h-9 w-9 overflow-hidden rounded-full md:h-11 md:w-11">
                <Image alt="Avator" src={user?.image || '/images/placeholder.png'} fill />
            </div>
        </div>
    );
}

export default Avator;