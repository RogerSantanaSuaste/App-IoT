import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'empanada';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // Buscar usuario por email
        const user = await prisma.usuario.findUnique({
            where: { correo: email }
        });

        if (!user) {
            return NextResponse.json(
                { message: 'Credenciales invalidas.' },
                { status: 401 }
            );
        }

        // Comparar contraseñas
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { message: 'Credenciales invalidas' },
                { status: 401 }
            );
        }

        // Retorna la pregunta de seguridad para el 2fa
        return NextResponse.json({
            message: 'Por favor responde la pregunta de seguridad.',
            securityQuestion: user.securityQuestion
        });

    } catch (error) {
        console.error('Error de login:', error);
        return NextResponse.json(
            { message: 'Error en el servidor interno.' },
            { status: 500 }
        );
    }
}