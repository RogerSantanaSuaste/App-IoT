import prisma from "@/lib/prisma";
import { ParcelaDB, ChartData } from "../zeTypes";

export class ParcelaModel {
    private db = prisma;
    
    async findActiveParcelas(): Promise<ParcelaDB[]> {
        const parcelas = await this.db.parcelas.findMany({
            where: { estado: true },
            include: { sensores_parcela: true }
        });

        return parcelas.map(parcela => ({
            ...parcela,
            ultimo_riego: parcela.ultimo_riego.toISOString()
        }));
    }

    async findAllParcelas(): Promise<ParcelaDB[]> {
        const parcelas = await this.db.parcelas.findMany({
            include: { sensores_parcela: true }
        });
        return parcelas.map(parcela => ({
            ...parcela,
            ultimo_riego: parcela.ultimo_riego.toISOString()
        }));
    }

    async findDeletedParcelas(): Promise<ParcelaDB[]> {
        const parcelas = await this.db.parcelas.findMany({
            where: { estado: false },
            orderBy: { id_parcela: 'asc' }
        });

        return parcelas.map(parcela => ({
            ...parcela,
            ultimo_riego: parcela.ultimo_riego.toISOString()
        }));
    }

    async findParcelaById(id_parcela: number) {
        return this.db.parcelas.findUnique({
            where: { id_parcela }
        });
    }

    async getChartData(parcelaIds: number[]): Promise<ChartData[]> {
        try {
            const twelveHoursAgo = new Date();
            twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12); // Subtract 12 hours
    
            const result = await this.db.sensores_parcela.findMany({
                where: { 
                    parcela_id: { in: parcelaIds },
                    registrado_en: { gte: twelveHoursAgo }
                },
                orderBy: { registrado_en: 'asc' }
            });
    
            return result.map((item) => ({
                parcelaId: item.parcela_id,
                time: item.registrado_en,
                lluvia: item.lluvia,
                temperatura: item.temperatura,
                sol: item.sol,
                humedad: item.humedad
            }));
        } catch (error) {
            console.error('❌ [ERROR] Obteniendo datos:', error);
            throw new Error('Error al obtener datos de la base de datos.');
        }
    }

    async deactivateParcela(parcelaApiId: number) {
        await this.db.$transaction([
            this.db.parcelas.update({
                where: { id_parcela: parcelaApiId },
                data: { estado: false }
            }),
            this.db.cambios_parcela.create({
                data: {
                    parcela_id: parcelaApiId,
                    cambio_tipo: 'DELETE',
                    campo: 'estado',
                    valor_anterior: 'true',
                    valor_nuevo: 'false'
                }
            })
        ]);
    }

    async createParcela(parcelaData: {
        id_parcela: number;
        nombre: string;
        ubicacion: string;
        responsable: string;
        tipo_cultivo: string;
        ultimo_riego: Date;
        latitud: number;
        longitud: number;
    }) {
        return this.db.parcelas.create({
            data: {
                ...parcelaData,
                estado: true
            }
        });
    }

    async restoreParcela(parcelaApiId: number) {
        await this.db.$transaction([
            this.db.parcelas.update({
                where: { id_parcela: parcelaApiId },
                data: { estado: true }
            }),
            this.db.cambios_parcela.create({
                data: {
                    parcela_id: parcelaApiId,
                    cambio_tipo: 'RESTORE',
                    campo: 'estado',
                    valor_anterior: 'false',
                    valor_nuevo: 'true'
                }
            })
        ]);
    }
    
    async updateParcela(parcelaApiId: number, updateData: any, changes: {
        parcela_id: number;
        cambio_tipo: string;
        campo: string;
        valor_anterior: string;
        valor_nuevo: string;
    }[]) {
        if (changes.length === 0) return;

        await this.db.$transaction([
            this.db.parcelas.update({
                where: { id_parcela: parcelaApiId },
                data: updateData
            }),
            ...changes.map(change =>
                this.db.cambios_parcela.create({
                    data: change
                })
            )
        ]);
    }

    async disconnect() {
        await this.db.$disconnect();
    }
}