import prisma from '@/app/libs/prismadb'

import getSession from '@/app/actions/getSession'
import { safeUserSelect } from '@/app/libs/safeUser'

const getUser = async () => {
    const session = await getSession();

    if (!session?.user?.email) return [];

    try {
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            where: {
                NOT: {
                    email: session.user.email
                }
            },
            // Never ship hashedPassword to the browser.
            select: safeUserSelect,
        });

        return users;
    } catch (error: any) {
        return [];
    }
}

export default getUser;
