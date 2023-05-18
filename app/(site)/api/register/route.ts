import bcrypt from 'bcrypt';

import prisma from '@/app/libs/prismadb';
import { NextResponse } from 'next/server';

export async function POST(
    request: Request,
) {
    try {
        const body = await request.json();
        const {
            email,
            name,
            pasword,
        } = body;

        if (!email || !name || !pasword) {
            return new NextResponse('Missing information', { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(pasword, 12);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                hashedPassword,
            },
        });
        return NextResponse.json(user);
    } catch (error) {
        console.log(error, 'REGISTRATION_ERROR');
        return new NextResponse('Something went wrong', { status: 500 });
    }
}

