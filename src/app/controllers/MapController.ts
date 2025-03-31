import { MapService } from "../services/mapService";

export class MapController {
    private MapService = new MapService();

    async getMapData() {
        try {
            const mapData = await this.MapService.getMapData();
            return {
                success: true,
                data: mapData
            };
        } catch (error) {
            console.error("Error fetching map data:", error);
            return {
                success: false,
                error: "Failed to retrieve map data"
            };
        }
    }
}