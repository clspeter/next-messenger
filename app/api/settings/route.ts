import { NextResponse } from 'next/server';

import getCurrentUser from '@/app/actions/getCurrentUser';
import prisma from '@/app/libs/prismadb';
import { safeUserSelect } from '@/app/libs/safeUser';

const MAX_NAME_LENGTH = 100;

export async function POST(
    request: Request
) {
    try {
        const currentUser = await getCurrentUser();
        const body = await request.json();
        const {
            name,
            image
        } = body;

        if (!currentUser?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Validate name: required, non-empty, bounded length.
        if (typeof name !== 'string' || !name.trim() || name.length > MAX_NAME_LENGTH) {
            return new NextResponse('Invalid name', { status: 400 });
        }

        // Validate image when provided: must be an https URL.
        if (image !== undefined && image !== null && image !== '') {
            if (typeof image !== 'string') {
                return new NextResponse('Invalid image', { status: 400 });
            }
            try {
                if (new URL(image).protocol !== 'https:') {
                    return new NextResponse('Invalid image URL', { status: 400 });
                }
            } catch {
                return new NextResponse('Invalid image URL', { status: 400 });
            }
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: currentUser.id
            },
            data: {
                image: image,
                name: name
            },
            select: safeUserSelect,
        });

        return NextResponse.json(updatedUser)
    } catch (error: any) {
        console.log(error, 'ERROR_SETTINGS');
        return new NextResponse('Internal Error', { status: 500 });
    }
}
