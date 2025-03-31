import { ParcelaSyncController } from "../app/controllers/parcelaSyncController";

const POLLING_INTERVAL = 5 * 60 * 1000;

export const startBackgroundWorker = () => {
  console.log('🚀 El chambeador esta chambeando.'); // Cheks de salud porque si no, me da miedo

  // Inicia por primera vez
  const sync = async () => {
    console.log('🔄 Checking for changes...');
    const controller = new ParcelaSyncController();
    await controller.syncParcelas();
  };

  sync();

  // Ejecuta cada TIEMPO ESTIPULADO AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
  setInterval(sync, POLLING_INTERVAL);
};
