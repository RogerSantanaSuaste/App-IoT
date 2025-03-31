import { ParcelaModel } from "../models/parcelaModel";
import { sensorModel } from "../models/sensorModel";
import { ParcelasResponseInterface} from "../zeTypes";

export class MapService {
    private parcelaModel = new ParcelaModel();
    private sensorModel = new sensorModel();
    async getMapData(): Promise<ParcelasResponseInterface[]> {
        const parcelas = await this.parcelaModel.findActiveParcelas();
        const parcelaIds = parcelas.map(p => p.id);
        const sensors = await this.sensorModel.obtenerDatosSensores(parcelaIds);
        return parcelas.map(parcela => {
            const sensorData = sensors.find(sensor => sensor.parcelaId === parcela.id);
            return {
            id: parcela.id,
            nombre: parcela.nombre,
            ubicacion: parcela.ubicacion,
            responsable: parcela.responsable,
            tipo_cultivo: parcela.tipo_cultivo,
            ultimo_riego: parcela.ultimo_riego,
            latitud: parcela.latitud,
            longitud: parcela.longitud,
            estado: parcela.estado,
            sensor: {
                lluvia: sensorData?.lluvia ?? 0,
                temperatura: sensorData?.temperatura ?? 0,
                sol: sensorData?.sol ?? 0,
                humedad: sensorData?.humedad ?? 0
            }
            };
        });
        
        
    }
}
