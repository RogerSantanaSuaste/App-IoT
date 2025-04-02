import prisma from "../../lib/prisma";
import { SensorData } from "../zeTypes";

export class sensorModel {
    async obtenerDatosSensores(parcelaApiIds: number[]): Promise<SensorData[]> {
        if (!parcelaApiIds || parcelaApiIds.length === 0) {
            console.warn(`⚠️ Lista de IDs vacía o inválida`);
            return [];
        }

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

    async checarSiExisteParcela(parcelaApiId: number) {
        if (!parcelaApiId) {
            console.warn(`⚠️ ID inválido - parcelaApiId: ${parcelaApiId}`);
            return false;
        }

        const parcela = await prisma.parcelas.findUnique({
            where: { id_parcela: parcelaApiId },
            select: { estado: true }
        });

        return parcela?.estado ?? false;
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