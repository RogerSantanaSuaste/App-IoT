import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'empanada';

export async function POST(request: Request) {
    try {
        const { email, securityAnswer } = await request.json();

        // Find user by email
        const user = await prisma.usuario.findUnique({
            where: { correo: email }
        });

        if (!user) {
            return NextResponse.json(
                { message: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        // Compare security answers (case insensitive)
        const isAnswerValid = securityAnswer.toLowerCase() === user.securityAnswer.toLowerCase();
        if (!isAnswerValid) {
            return NextResponse.json(
                { message: 'Respuesta de seguridad incorrecta' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.correo },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Create response and set cookie
        const response = NextResponse.json({
            message: 'Inicio de sesión exitoso',
            token
        });

        // Set HTTP-only cookie for security
        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 // 1 hour
        });

        return response;

    } catch (error) {
        console.error('2FA verification error:', error);
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}