import { sensorModel } from "../models/sensorModel";
import { ParcelasResponseInterface } from "../zeTypes";

export class SensorService {
    private model = new sensorModel();

    async insertSensorData(parcelaApiId: number, parcelaDbId: number, parcela: ParcelasResponseInterface) {
        try {
            const existe = await this.model.checarSiExisteParcela(parcelaDbId, parcelaApiId);
            if (!existe) {
                // No existe :c
                console.log(`⚠️  Parcela con ID API ${parcelaApiId} (DB ID: ${parcelaDbId}) no existe o está inactiva, omitiendo sensores`);
                return;
            }

            const latestSensorData = await this.model.ultimosDatosDeSensor(parcelaApiId);
            const { humedad, temperatura, lluvia, sol } = parcela.sensor;
            const cambios = [];

            // Detectar cambios.
            if (latestSensorData) {
                if (latestSensorData.humedad !== humedad) {
                    cambios.push({ campo: 'humedad', valorAnterior: latestSensorData.humedad, valorNuevo: humedad });
                }
                if (latestSensorData.temperatura !== temperatura) {
                    cambios.push({ campo: 'temperatura', valorAnterior: latestSensorData.temperatura, valorNuevo: temperatura });
                }
                if (latestSensorData.lluvia !== lluvia) {
                    cambios.push({ campo: 'lluvia', valorAnterior: latestSensorData.lluvia, valorNuevo: lluvia });
                }
                if (latestSensorData.sol !== sol) {
                    cambios.push({ campo: 'sol', valorAnterior: latestSensorData.sol, valorNuevo: sol });
                }

                if (cambios.length > 0) {
                    await this.model.crearCambiosSensor(parcelaApiId, cambios);
                    console.log(`🔄 Sensores actualizados para parcela ID API: ${parcelaApiId}`);
                }
            }

            await this.model.crearLecturaDeSensor(parcelaApiId, { humedad, temperatura, lluvia, sol });
            console.log(`📊 Datos de sensor registrados para parcela ID API: ${parcelaApiId}`);

        } catch (error) {
            console.error(`❌ Error en insertSensorData para parcela ID API: ${parcelaApiId}`, error);
            throw error;
        }
    }
}