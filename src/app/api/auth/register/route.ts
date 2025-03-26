import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { email, password, name, securityQuestion, securityAnswer } = await request.json();

        const existingUser = await prisma.usuario.findUnique({
            where: { correo: email }
        });

        if (existingUser) {
            return NextResponse.json(
                { message: 'User already exists' },
                { status: 400 }
            );
        }

        // Hasheo de contraseña y pregunta
        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedAnswer = securityAnswer.toLowerCase();

        // Crear nuevo usuario
        const user = await prisma.usuario.create({
            data: {
                correo: email,
                password: hashedPassword,
                nombre: name,
                securityQuestion,
                securityAnswer: hashedAnswer
            }
        });

        return NextResponse.json({
            message: 'Usuario registrado éxitosamente.',
            userId: user.id
        });

    } catch (error) {
        console.error('Error de registro:', error);
        return NextResponse.json(
            { message: 'Error de servidor interno.' },
            { status: 500 }
        );
    }
}