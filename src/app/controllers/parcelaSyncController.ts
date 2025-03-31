import { ParcelaSyncService } from '../services/parcelaSyncService';
import fetchData from '../apiHandler';

export class ParcelaSyncController {
    private syncService = new ParcelaSyncService();

    async syncParcelas() {
        try {
            const data = await fetchData();
            if (!data) {
                throw new Error('Error al recuperar los datos.');
            }

            await this.syncService.fetchAndTrackChanges(data);
            return { success: true, message: 'Sincronizacion completada.' };
        } catch (error) {
            console.error('❌ Error in syncParcelas:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Sincronizacion fallida.'
            };
        } finally {
            await this.syncService.cleanup();
        }
    }
}