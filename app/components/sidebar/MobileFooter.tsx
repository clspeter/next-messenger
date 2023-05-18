'use client';

import useConversation from "@/app/hooks/useConversation";
import useRoutes from "@/app/hooks/useRoutes";
import MobileItem from "./MobileItem";

const MobileFooter = () => {
    const routes = useRoutes();
    const { isOpen } = useConversation();

    if (isOpen) return null;

    return (
        <div className="fixed bottom-0 z-40 flex w-full items-center justify-between border-t-[1px] bg-white lg:hidden">
            {routes.map((route) => (
                <MobileItem
                    key={route.label}
                    onClick={route.onClick}
                    icon={route.icon}
                    active={route.active}
                    href={route.href}
                />))}
        </div>
    )
        ;
}

export default MobileFooter;