// app/api/chart-data/route.ts

import { ChartController } from '@/app/controllers/chartController';
import { NextResponse } from 'next/server';

function filterLast12Hours(data: any[]) {
  const now = new Date();
  const twelveHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 12 hours in milliseconds
  
  return data.filter(item => {
    const recordTime = new Date(item.time || item.registrado_en);
    return recordTime >= twelveHoursAgo && recordTime <= now;
  });
}

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

    // Get current time for the response metadata
    const currentTime = new Date().toISOString();
    const timeRangeStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // Final filtering
    const filteredData = {
      ...response.data,
      chartData: filterLast12Hours((response.data?.chartData || [])),
      parcelas: (response.data?.parcelas ?? []).map(parcela => ({
        ...parcela,
        sensores_parcela: filterLast12Hours(parcela.sensores_parcela || [])
      }))
    };

    // Calculate statistics
    const totalParcelas = filteredData.parcelas?.length || 0;
    const parcelasConDatos = filteredData.parcelas?.filter(
      p => p.sensores_parcela?.length > 0
    ).length || 0;

    return NextResponse.json({
      success: true,
      data: filteredData,
      metadata: {
        currentTime,
        timeRangeStart,
        timeRangeEnd: currentTime,
        totalParcelas,
        parcelasConDatos,
        totalReadings: filteredData.chartData.length,
        message: filteredData.chartData.length === 0 
          ? 'No sensor data received in the last 24 hours' 
          : `Showing data from the last 12 hours (${filteredData.chartData.length} readings)`
      }
    });
    
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        metadata: {
          currentTime: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}