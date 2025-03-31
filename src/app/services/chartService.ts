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
        const parcelas = await this.parcelaModel.findAllParcelas();
        console.log('Parcelas:', parcelas);
        const parcelaIds = parcelas.map(p => p.id);
        console.log('Parcelas IDs:', parcelaIds);
        const chartData = await this.getChartData(parcelaIds);

        return { parcelas, chartData };
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