// src/app/controllers/ParcelaController.ts
import { ParcelaModel } from "../models/parcelaModel";
import { ParcelaDB, ChartData } from "../zeTypes";

export class ParcelaController {
    private model = new ParcelaModel();

    // Obtener parcelas activas
    async getActiveParcelas(): Promise<{
        success: boolean;
        data?: ParcelaDB[];
        error?: string;
    }> {
        try {
            const data = await this.model.findActiveParcelas();
            return { 
                success: true, 
                data: data.map(parcela => ({
                    ...parcela,
                    ultimo_riego: new Date(parcela.ultimo_riego).toISOString()
                }))
            };
        } catch (error) {
            console.error('Error getting active parcels:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get active parcels'
            };
        }
    }

    // Parcelas eliminadas
    async getDeletedParcelas(): Promise<{
        success: boolean;
        data?: ParcelaDB[];
        error?: string;
    }> {
        try {
            const data = await this.model.findDeletedParcelas();
            return { 
                success: true, 
                data: data.map(parcela => ({
                    ...parcela,
                    ultimo_riego: new Date(parcela.ultimo_riego).toISOString()
                }))
            };
        } catch (error) {
            console.error('Error getting deleted parcels:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get deleted parcels'
            };
        }
    }


    /**
     * Desactivar una parcela
     * @param parcelaId ID de la base de datos de la parcela
     * @param parcelaApiId ID de la parcela dentro de la API
     * @returns Promise con estatus exitoso.
     */
    async deactivateParcela(
        parcelaId: number,
        parcelaApiId: number
    ): Promise<{ success: boolean; error?: string }> {
        try {
            if (!parcelaId || !parcelaApiId) {
                throw new Error('Missing required parameters');
            }

            await this.model.deactivateParcela(parcelaId, parcelaApiId);
            return { success: true };
        } catch (error) {
            console.error('Error deactivating parcel:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to deactivate parcel'
            };
        }
    }

    /**
     * Crear una nueva parcela
     * @param parcelaData Datos de la parcela
     * @returns Promise con parcela creada
     */
    async createParcela(parcelaData: {
        id_parcela: number;
        nombre: string;
        ubicacion: string;
        responsable: string;
        tipo_cultivo: string;
        ultimo_riego: Date;
        latitud: number;
        longitud: number;
    }): Promise<{
        success: boolean;
        data?: ParcelaDB;
        error?: string;
    }> {
        try {
            if (!parcelaData.id_parcela || !parcelaData.nombre) {
                throw new Error('Missing required fields');
            }

            const data = await this.model.createParcela(parcelaData);
            const formattedData: ParcelaDB = {
                ...data,
                ultimo_riego: new Date(data.ultimo_riego).toISOString(),
            };
            return { success: true, data: formattedData };
        } catch (error) {
            console.error('Error creating parcel:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create parcel'
            };
        }
    }

    /**
     * Debería dejar que la IA comente mi codigo más seguido, es como swagger pero dentro de mi codigo
     * @param parcelaId ID of the parcel to update
     * @param updateData Data to update
     * @param changes Change records to create
     * @returns Promise with success status
     */
    async updateParcela(
        parcelaId: number,
        updateData: any,
        changes: {
            parcela_id: number;
            cambio_tipo: string;
            campo: string;
            valor_anterior: string;
            valor_nuevo: string;
        }[]
    ): Promise<{ success: boolean; error?: string }> {
        try {
            if (!parcelaId) {
                throw new Error('Missing parcel ID');
            }

            await this.model.updateParcela(parcelaId, updateData, changes);
            return { success: true };
        } catch (error) {
            console.error('Error updating parcel:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update parcel'
            };
        }
    }

    // Cerrar conexión a base de datos
    async disconnect() {
        try {
            await this.model.disconnect();
        } catch (error) {
            console.error('Error disconnecting:', error);
        }
    }
}