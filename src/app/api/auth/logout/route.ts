import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ message: 'Cierre de sesión éxitoso.' });
    response.cookies.delete('token');
    return response;
}