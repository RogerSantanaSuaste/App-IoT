import fetchAndTrackChanges from "../databaseHandler";

const POLLING_INTERVAL = 1 * 60 * 1000;

export const startBackgroundWorker = () => {
  console.log('🚀 El chambeador esta chambeando.'); // Cheks de salud porque si no, me da miedo

  // Inicia por primera vez
  fetchAndTrackChanges();

  // Ejecuta cada minuto
  setInterval(async () => {
    console.log('🔄 Buscando cambios...');
    await fetchAndTrackChanges();
  }, POLLING_INTERVAL);
};
