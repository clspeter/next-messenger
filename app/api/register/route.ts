import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

import prisma from '@/app/libs/prismadb';
import { safeUserSelect } from '@/app/libs/safeUser';
import { rateLimit, getClientIp } from '@/app/libs/rateLimit';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
// bcrypt only hashes the first 72 bytes; reject longer to avoid silent truncation.
const MAX_PASSWORD_LENGTH = 72;
const MAX_NAME_LENGTH = 100;

export async function POST(
    request: Request,
) {
    try {
        // Throttle account creation per IP to curb spam and bcrypt CPU abuse.
        const ip = getClientIp(request.headers);
        const limit = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
        if (!limit.success) {
            return new NextResponse('Too many requests', { status: 429 });
        }

        const body = await request.json();
        const {
            email,
            name,
            password,
        } = body;

        if (typeof email !== 'string' || typeof name !== 'string' || typeof password !== 'string') {
            return new NextResponse('Missing information', { status: 400 });
        }
        if (!EMAIL_REGEX.test(email)) {
            return new NextResponse('Invalid email', { status: 400 });
        }
        if (!name.trim() || name.length > MAX_NAME_LENGTH) {
            return new NextResponse('Invalid name', { status: 400 });
        }
        if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
            return new NextResponse(
                `Password must be ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters`,
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                hashedPassword,
            },
            select: safeUserSelect,
        });
        return NextResponse.json(user);
    } catch (error) {
        // Unique-constraint violation on email -> the address is already taken.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            return new NextResponse('Email already in use', { status: 409 });
        }
        console.log(error, 'REGISTRATION_ERROR');
        return new NextResponse('Something went wrong', { status: 500 });
    }
}
