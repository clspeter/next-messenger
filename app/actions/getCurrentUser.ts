import getSession from '@/app/actions/getSession';
import prisma from '@/app/libs/prismadb';
import { safeUserSelect } from '@/app/libs/safeUser';

const getCurrentUser = async () => {
    try {
        const session = await getSession();

        if (!session?.user?.email) return null;

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email as string },
            select: safeUserSelect,
        });

        if (!currentUser) return null;

        return currentUser;
    } catch (error: any) {
        return null;
    }
}

export default getCurrentUser;
