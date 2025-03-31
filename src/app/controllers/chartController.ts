import { ChartService } from "../services/chartService";

export class ChartController {
    private chartService = new ChartService();

    async getChartData(parcelaIds: number[]) {
        try {
            const data = await this.chartService.getChartData(parcelaIds);
            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Error en ChartController: ', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Fallo al obtener datos para las graficas.'
            };
        }
    }

    async getActiveParcelaData(){
        try{
            const data = await this.chartService.getChartDataForActiveParcelas();
            return {
                success: true,
                data
            }
        } catch (error){
            console.error('Error en ChartController: ', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Fallo al obtener datos de parcelas activas.'
            }
        }
    }

    async getAllChartData() {
        try {
            const data = await this.chartService.getAllChartData();
            
            console.log('Data from ChartService:', data);  // Add this to debug the returned data
    
            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Error en ChartController', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Fallo al obtener datos de TODAS las parcelas.'
            };
        }
    }
    

    async getChartDataForActiveParcelas() {
        try {
            const data = await this.chartService.getChartDataForActiveParcelas();
            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Error en ChartController:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Fallo al obtener datos de las parcelas activas.'
            };
        }
    }
}