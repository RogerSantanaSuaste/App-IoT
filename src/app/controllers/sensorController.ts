import { SensorService } from '../services/sensorService';
import { ParcelasResponseInterface } from '../zeTypes';

export class SensorController {
  private service = new SensorService();

  async handleInsertSensorData(parcelaApiId: number, parcelaDbId: number, parcela: ParcelasResponseInterface) {
    try {
      await this.service.insertSensorData(parcelaApiId, parcelaDbId, parcela);
      return { success: true };
    } catch (error) {
      console.error('Controller error:', error);
      return { success: false, error: 'Failed to insert sensor data' };
    }
  }
}