import { get } from "http";
import DesktopSidebar from "./DesktopSidebar";
import MobileFooter from './MobileFooter';
import getCurrentUser from "@/app/actions/getCurrentUser";

async function Sidebar({ children }: { children: React.ReactNode }) {
    const currentUser = await getCurrentUser();


    return (
        <div className="h-full">
            <DesktopSidebar currentUser={currentUser} />
            <MobileFooter />
            <main className="h-full lg:pl-20">{children}</main>
        </div>
    )
}

export default Sidebar;