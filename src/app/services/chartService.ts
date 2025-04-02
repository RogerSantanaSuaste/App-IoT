import { ParcelaModel } from "../models/parcelaModel";
import { ChartData, ParcelasResponseInterface} from "../zeTypes";

export class ChartService {
    private parcelaModel = new ParcelaModel();

    async getChartData(parcelaIds: number[]): Promise<ChartData[]> {
        return this.parcelaModel.getChartData(parcelaIds);
    }

    async getAllChartData(): Promise<{
        parcelas: any[],
        chartData: ChartData[]
    }> {
        // 1. Get all parcelas
        const parcelas = await this.parcelaModel.findAllParcelas();
        const parcelaIds = parcelas.map(p => p.id_parcela);
    
        // 2. Get raw chart data (without relying on DB filtering)
        const rawChartData = await this.getChartData(parcelaIds);
    
        // 3. Calculate time boundaries (UTC)
        const now = new Date();
        const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    
        // 4. Strict client-side filtering
        const filteredChartData = rawChartData.filter(item => {
            const recordDate = new Date(item.time);
            return recordDate >= twelveHoursAgo && recordDate <= now;
        });
    
        // 5. Debug logs
        console.log(`[Filter] Current UTC: ${now.toISOString()}`);
        console.log(`[Filter] 12 hours ago: ${twelveHoursAgo.toISOString()}`);
        console.log(`[Filter] Raw records: ${rawChartData.length}`);
        console.log(`[Filter] Filtered records: ${filteredChartData.length}`);
        
        if (filteredChartData.length === 0 && rawChartData.length > 0) {
            console.warn('[WARNING] No recent data found, but old data exists. Latest record:', 
                new Date(rawChartData[rawChartData.length-1].time).toISOString());
        }
    
        return { 
            parcelas, 
            chartData: filteredChartData  // Only return filtered data
        };
    }

    async getChartDataForActiveParcelas(): Promise<ParcelasResponseInterface[]> {
        const parcelas = await this.parcelaModel.findActiveParcelas();
        const parcelaIds = parcelas.map(p => p.id);
        const chartData = await this.getChartData(parcelaIds);

        return parcelas.map(parcela => ({
            ...parcela,
            sensorData: chartData.filter(data => data.parcelaId === parcela.id),
            sensor: {
                humedad: chartData.filter(data => data.parcelaId === parcela.id).reduce((sum, d) => sum + d.humedad, 0) / (chartData.filter(data => data.parcelaId === parcela.id).length || 1),
                temperatura: chartData.filter(data => data.parcelaId === parcela.id).reduce((sum, d) => sum + d.temperatura, 0) / (chartData.filter(data => data.parcelaId === parcela.id).length || 1),
                lluvia: chartData.filter(data => data.parcelaId === parcela.id).reduce((sum, d) => sum + d.lluvia, 0) / (chartData.filter(data => data.parcelaId === parcela.id).length || 1),
                sol: chartData.filter(data => data.parcelaId === parcela.id).reduce((sum, d) => sum + d.sol, 0) / (chartData.filter(data => data.parcelaId === parcela.id).length || 1),
            }
        }));
    }
    // logik
    async getAverageSensorData(parcelaIds: number[]) {
        const chartData = await this.getChartData(parcelaIds);

        return parcelaIds.map(id => {
            const parcelaData = chartData.filter(d => d.parcelaId === id);
            const count = parcelaData.length;

            return {
                parcelaId: id,
                avgTemperatura: count > 0 ?
                    parcelaData.reduce((sum, d) => sum + d.temperatura, 0) / count : 0,
                avgHumedad: count > 0 ?
                    parcelaData.reduce((sum, d) => sum + d.humedad, 0) / count : 0,
                avgLluvia: count > 0 ?
                    parcelaData.reduce((sum, d) => sum + d.lluvia, 0) / count : 0,
                avgSol: count > 0 ?
                    parcelaData.reduce((sum, d) => sum + d.sol, 0) / count : 0,
            };
        });
    }
}