import prisma from "../../lib/prisma";
import { ParcelaDB, ParcelasResponseInterface, SensorData } from "../zeTypes";



export class sensorModel {

  async obtenerDatosSensores(parcelaApiIds: number[]): Promise<SensorData[]> {
    if (!parcelaApiIds || parcelaApiIds.length === 0) {
      console.warn(`⚠️ Lista de IDs vacía o inválida`);
      const latestSensorData = await Promise.all(
        parcelaApiIds.map(async (id) => {
          return prisma.sensores_parcela.findFirst({
        where: { parcela_id: id },
        orderBy: { registrado_en: 'desc' },
        select: {
          parcela_id: true,
          sol: true,
          humedad: true,
          temperatura: true,
          lluvia: true
        }
          });
        })
      );

      return latestSensorData
        .filter((data): data is NonNullable<typeof data> => data !== null)
        .map((data) => ({
          parcelaId: data.parcela_id,
          humedad: data.humedad,
          temperatura: data.temperatura,
          lluvia: data.lluvia,
          sol: data.sol,
        }));
    }

    const sensores = await prisma.sensores_parcela.groupBy({
      by: ['parcela_id'],
      where: {
        parcela_id: {
          in: parcelaApiIds
        }
      },
      _max: {
        registrado_en: true
      }
    });

    const latestReadings = await Promise.all(
      sensores.map(async (sensor) => {
        return prisma.sensores_parcela.findFirst({
          where: {
            parcela_id: sensor.parcela_id,
            registrado_en: sensor._max.registrado_en ?? undefined
          },
          select: {
            parcela_id: true,
            sol: true,
            humedad: true,
            temperatura: true,
            lluvia: true
          }
        });
      })
    );

    return latestReadings
      .filter((reading): reading is NonNullable<typeof reading> => reading !== null)
      .map((reading) => ({
        parcelaId: reading.parcela_id,
        humedad: reading.humedad,
        temperatura: reading.temperatura,
        lluvia: reading.lluvia,
        sol: reading.sol,
      }));
  }
  async insertSensorData(parcelaApiId: number, parcelaDbId: number, parcela: ParcelasResponseInterface) {
    try {
      // Verificar que la parcela existe y está activa
      const parcelaExistente = await prisma.parcelas.findUnique({
        where: { id: parcelaDbId },
        select: { estado: true, id_parcela: true }
      });

      if (!parcelaExistente || !parcelaExistente.estado || parcelaExistente.id_parcela !== parcelaApiId) {
        console.log(`⚠️  Parcela con ID API ${parcelaApiId} (DB ID: ${parcelaDbId}) no existe o está inactiva, omitiendo sensores`);
        return;
      }

      const latestSensorData = await prisma.sensores_parcela.findFirst({
        where: { parcela_id: parcelaApiId },
        orderBy: { registrado_en: 'desc' }
      });

      const { humedad, temperatura, lluvia, sol } = parcela.sensor;
      const cambios = [];

      if (latestSensorData) {
        if (latestSensorData.humedad !== humedad) {
          cambios.push({ campo: 'humedad', valor_anterior: latestSensorData.humedad, valor_nuevo: humedad });
        }
        if (latestSensorData.temperatura !== temperatura) {
          cambios.push({ campo: 'temperatura', valor_anterior: latestSensorData.temperatura, valor_nuevo: temperatura });
        }
        if (latestSensorData.lluvia !== lluvia) {
          cambios.push({ campo: 'lluvia', valor_anterior: latestSensorData.lluvia, valor_nuevo: lluvia });
        }
        if (latestSensorData.sol !== sol) {
          cambios.push({ campo: 'sol', valor_anterior: latestSensorData.sol, valor_nuevo: sol });
        }

        if (cambios.length > 0) {
          await prisma.$transaction([
            ...cambios.map(cambio =>
              prisma.cambios_parcela.create({
                data: {
                  parcela_id: parcelaApiId,
                  cambio_tipo: 'UPDATE',
                  campo: cambio.campo,
                  valor_anterior: String(cambio.valor_anterior),
                  valor_nuevo: String(cambio.valor_nuevo)
                }
              })
            )
          ]);
          console.log(`🔄 Sensores actualizados para parcela ID API: ${parcelaApiId}`);
        }
      }

      await prisma.sensores_parcela.create({
        data: {
          parcela_id: parcelaApiId,
          humedad,
          temperatura,
          lluvia,
          sol
        }
      });
      console.log(`📊 Datos de sensor registrados para parcela ID API: ${parcelaApiId}`);

    } catch (error) {
      console.error(`❌ Error en insertSensorData para parcela ID API: ${parcelaApiId}`, error);
    }
  }

  async checarSiExisteParcela(parcelaDbId: number, parcelaApiId: number) {
    if (!parcelaDbId || !parcelaApiId) {
      console.warn(`⚠️ ID inválido - parcelaDbId: ${parcelaDbId}, parcelaApiId: ${parcelaApiId}`);
      return null; // O devuelve `false` según tu lógica
    }

    const parcela = await prisma.parcelas.findUnique({
      where: { id: parcelaDbId },
      select: { estado: true, id_parcela: true }
    });

    return parcela;
  }


  async ultimosDatosDeSensor(parcelaApiId: number) {
    return prisma.sensores_parcela.findFirst({
      where: { parcela_id: parcelaApiId },
      orderBy: { registrado_en: 'desc' }
    });

  }

  async crearCambiosSensor(parcelaApiId: number, cambios: {
    campo: string,
    valorAnterior: any,
    valorNuevo: any
  }[]) {
    if (cambios.length === 0) return;

    await prisma.$transaction([
      ...cambios.map(cambio =>
        prisma.cambios_parcela.create({
          data: {
            parcela_id: parcelaApiId,
            cambio_tipo: 'UPDATE',
            campo: cambio.campo,
            valor_anterior: String(cambio.valorAnterior),
            valor_nuevo: String(cambio.valorNuevo)
          }
        })
      )
    ]);
  }

  async crearLecturaDeSensor(parcelaApiId: number, data: {
    humedad: number;
    temperatura: number;
    lluvia: number;
    sol: number;
  }) {
    return prisma.sensores_parcela.create({
      data: {
        parcela_id: parcelaApiId,
        ...data
      }
    });
  }
}