import Sidebar from "@/app/components/sidebar/Sidebar";
import DesktopSidebar from "../components/sidebar/DesktopSidebar";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
    return (
        // @ts-expect-error Server Component
        <Sidebar>
            <div className="h-full">
                <DesktopSidebar />
                <main className="h-full lg:pl-20">{children}</main>
            </div>
        </Sidebar>
    );
}