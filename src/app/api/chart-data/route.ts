// app/api/chart-data/route.ts

import { ChartController } from '@/app/controllers/chartController';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const controller = new ChartController();
    const response = await controller.getAllChartData();
    
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