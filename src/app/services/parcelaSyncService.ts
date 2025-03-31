// /services/parcelaSyncService.ts
import { ParcelaModel } from '../models/parcelaModel';
import { SensorService } from './sensorService';
import { ResponseInterface, ParcelasResponseInterface } from '../zeTypes';

export class ParcelaSyncService {
  private parcelaModel = new ParcelaModel();
  private sensorService = new SensorService();

  async fetchAndTrackChanges(apiData: ResponseInterface) {
    const parcelasDeApi = apiData.parcelas ?? [];
    const parcelasIdsFromApi = new Set(parcelasDeApi.map(p => p.id));

    // Handlers para procesos
    await this.handleDeletedParcelas(parcelasIdsFromApi);

    await this.processApiParcelas(parcelasDeApi);
  }

  private async handleDeletedParcelas(apiParcelaIds: Set<number>) {
    const activeParcelas = await this.parcelaModel.findActiveParcelas();
    const parcelasToDeactivate = activeParcelas.filter(
      p => !apiParcelaIds.has(p.id_parcela)
    );

    await Promise.all(parcelasToDeactivate.map(async (parcela) => {
      await this.parcelaModel.deactivateParcela(parcela.id, parcela.id_parcela);
      console.log(`❌ Parcela marcada como inactiva: ${parcela.nombre} (ID API: ${parcela.id_parcela})`);
    }));
  }

  private async processApiParcelas(parcelasDeApi: ParcelasResponseInterface[]) {
    const activeParcelas = await this.parcelaModel.findActiveParcelas();
    const parcelasMap = new Map(activeParcelas.map(p => [p.id_parcela, p]));

    await Promise.all(parcelasDeApi.map(async (parcelaApi) => {
      const existingParcela = parcelasMap.get(parcelaApi.id);

      if (!existingParcela) {
        await this.createNewParcela(parcelaApi);
      } else {
        await this.updateExistingParcela(existingParcela, parcelaApi);
      }
    }));
  }

  private async createNewParcela(parcelaApi: ParcelasResponseInterface) {
    const existingParcela = await this.parcelaModel.findParcelaById(parcelaApi.id);
  
    if (existingParcela) {
      console.log(`⚠️ Parcela con ID ${parcelaApi.id} ya existe. Saltando creación.`);
      return;
    }
  
    const nuevaParcela = await this.parcelaModel.createParcela({
      id_parcela: parcelaApi.id,
      nombre: parcelaApi.nombre,
      ubicacion: parcelaApi.ubicacion,
      responsable: parcelaApi.responsable,
      tipo_cultivo: parcelaApi.tipo_cultivo,
      ultimo_riego: new Date(parcelaApi.ultimo_riego),
      latitud: parcelaApi.latitud,
      longitud: parcelaApi.longitud
    });
  
    console.log(`✅ Nueva parcela creada: ${parcelaApi.nombre} (ID API: ${parcelaApi.id})`);
    await this.sensorService.insertSensorData(nuevaParcela.id_parcela, nuevaParcela.id, parcelaApi);
  }
  

  private async updateExistingParcela(
    existingParcela: any, 
    parcelaApi: ParcelasResponseInterface
  ) {
    const updateData: any = {};
    const changes: any[] = [];

    const fieldsToCheck: (keyof ParcelasResponseInterface)[] = [
      'nombre', 'ubicacion', 'responsable', 'tipo_cultivo', 
      'ultimo_riego', 'latitud', 'longitud'
    ];

    fieldsToCheck.forEach(field => {
      const dbValue = existingParcela[field];
      const apiValue = field === 'ultimo_riego' 
        ? new Date(parcelaApi[field])
        : parcelaApi[field];

      if (JSON.stringify(dbValue) !== JSON.stringify(apiValue)) {
        updateData[field] = apiValue;
        changes.push({
          parcela_id: parcelaApi.id,
          cambio_tipo: 'UPDATE',
          campo: field,
          valor_anterior: String(dbValue),
          valor_nuevo: String(apiValue)
        });
      }
    });

    if (changes.length > 0) {
      await this.parcelaModel.updateParcela(existingParcela.id, updateData, changes);
      console.log(`🔄 Parcela actualizada: ${parcelaApi.nombre} (ID API: ${parcelaApi.id})`);
    }

    await this.sensorService.insertSensorData(parcelaApi.id, existingParcela.id, parcelaApi);
  }

  async cleanup() {
    await this.parcelaModel.disconnect();
  }
}