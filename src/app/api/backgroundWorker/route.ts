// src/app/api/backgroundWorker/route.ts

import { ParcelaSyncController } from '../../../app/controllers/parcelaSyncController';
import { SensorController } from '@/app/controllers/sensorController';

const POLLING_INTERVAL = 5 * 60 * 1000;

export async function GET(req: Request) {
  const sync = async () => {
    console.log('🔄 Checking for changes...');
    const controller = new ParcelaSyncController();
    const sensorController = new SensorController();
    await controller.syncParcelas();
  };

  sync();

  setInterval(sync, POLLING_INTERVAL);

  return new Response('Background worker started', { status: 200 });
}
