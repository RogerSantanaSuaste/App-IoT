// app/api/mapa-data/route.ts

import { ParcelaController } from '@/app/controllers/parcelaController';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const controller = new ParcelaController();
    const response = await controller.getDeletedParcelas();
    
    if (!response.success) {
      return NextResponse.json(
        { success: false, error: response.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}