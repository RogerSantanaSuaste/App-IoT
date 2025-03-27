'use server';
// Se requiere llamar a la API para registrar los datos de las parcelas dentro de la base de datos. Adicionalmente, se debe registrar los cambios de estado de las parcelas en la base de datos, solo si, existe un cambio, por obvias razones.
// Adicionalmente, se debe tener una función que detecte cuando una parcela deja de existir, y marcarla como eliminada en la base de datos. Posteriormente, se debe de mostrar una graficación del historico de los cambios de las parcelas, al igual que un registro de las parcelas eliminadas.
import { ResponseInterface, ParcelasResponseInterface, ParcelaDB } from "./zeTypes";
import fetchData from "./apiHandler";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función para escuchar los cambios de la API y registrarlos en la base de datos
const insertSensorData = async (parcelaApiId: number, parcelaDbId: number, parcela: ParcelasResponseInterface) => {
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
};



// ---------------------- Función para obtener y registrar cambios
const fetchAndTrackChanges = async () => {
  try {
    const data: ResponseInterface | undefined = await fetchData();
    if (!data) {
      throw new Error('Error al recuperar los datos.');
    }

    const parcelasDeApi: ParcelasResponseInterface[] = data?.parcelas ?? [];
    const parcelasIdsFromApi = new Set(parcelasDeApi.map(p => p.id));

    // 1. Manejar parcelas eliminadas
    const parcelasActivasEnDB = await prisma.parcelas.findMany({
      where: { estado: true }
    });

    const parcelasParaDesactivar = parcelasActivasEnDB.filter(
      p => !parcelasIdsFromApi.has(p.id_parcela)
    );

    await Promise.all(parcelasParaDesactivar.map(async (parcela) => {
      await prisma.$transaction([
        prisma.parcelas.update({
          where: { id: parcela.id },
          data: { estado: false }
        }),
        prisma.cambios_parcela.create({
          data: {
            parcela_id: parcela.id_parcela,
            cambio_tipo: 'DELETE',
            campo: 'estado',
            valor_anterior: 'true',
            valor_nuevo: 'false'
          }
        })
      ]);
      console.log(`❌ Parcela marcada como inactiva: ${parcela.nombre} (ID API: ${parcela.id_parcela})`);
    }));

    // 2. Crear mapa de parcelas existentes por id_parcela
    const parcelasExistentesMap = new Map(
      parcelasActivasEnDB.map(p => [p.id_parcela, p])
    );

    // 3. Procesar parcelas de la API
    await Promise.all(parcelasDeApi.map(async (parcelaApi) => {
      const parcelaExistente = parcelasExistentesMap.get(parcelaApi.id);

      if (!parcelaExistente) {
        // Crear nueva parcela
        const nuevaParcela = await prisma.parcelas.create({
          data: {
            id_parcela: parcelaApi.id,
            nombre: parcelaApi.nombre,
            ubicacion: parcelaApi.ubicacion,
            responsable: parcelaApi.responsable,
            tipo_cultivo: parcelaApi.tipo_cultivo,
            ultimo_riego: new Date(parcelaApi.ultimo_riego),
            latitud: parcelaApi.latitud,
            longitud: parcelaApi.longitud,
            estado: true
          }
        });
        console.log(`✅ Nueva parcela creada: ${parcelaApi.nombre} (ID API: ${parcelaApi.id})`);
        await insertSensorData(nuevaParcela.id_parcela, nuevaParcela.id, parcelaApi);
      } else {
        // Actualizar parcela existente
        const updateData: any = {};
        const cambios: {campo: string, anterior: any, nuevo: any}[] = [];

        const camposParaVerificar: (keyof ParcelasResponseInterface)[] = [
          'nombre', 'ubicacion', 'responsable', 'tipo_cultivo', 
          'ultimo_riego', 'latitud', 'longitud'
        ];

        camposParaVerificar.forEach(campo => {
          const valorDB = (parcelaExistente as unknown as ParcelasResponseInterface)[campo];
          const valorApi = campo === 'ultimo_riego' 
            ? new Date(parcelaApi[campo])
            : parcelaApi[campo];

          if (JSON.stringify(valorDB) !== JSON.stringify(valorApi)) {
            updateData[campo] = valorApi;
            cambios.push({
              campo,
              anterior: valorDB,
              nuevo: valorApi
            });
          }
        });

        if (cambios.length > 0) {
          await prisma.$transaction([
            prisma.parcelas.update({
              where: { id: parcelaExistente.id },
              data: updateData
            }),
            ...cambios.map(cambio => 
              prisma.cambios_parcela.create({
                data: {
                  parcela_id: parcelaApi.id,
                  cambio_tipo: 'UPDATE',
                  campo: cambio.campo,
                  valor_anterior: String(cambio.anterior),
                  valor_nuevo: String(cambio.nuevo)
                }
              })
            )
          ]);
          console.log(`🔄 Parcela actualizada: ${parcelaApi.nombre} (ID API: ${parcelaApi.id})`);
        }

        // Insertar datos de sensores
        await insertSensorData(parcelaApi.id, parcelaExistente.id, parcelaApi);
      }
    }));

  } catch (error) {
    console.error('❌ Error en fetchAndTrackChanges:', error);
  } finally {
    await prisma.$disconnect();
  }
};


// Funcion para obtener datos de las parcelas, usado en el componente de mapa.
export const getParcelasFromDB = async (): Promise<ParcelaDB[]> => {
  try {
    const parcelas = await prisma.parcelas.findMany({
      include: {
        sensores_parcela: true,
      }
    });
    return parcelas.map((p) => ({
      id: p.id,
      id_parcela: p.id_parcela,
      nombre: p.nombre,
      ubicacion: p.ubicacion,
      responsable: p.responsable,
      tipo_cultivo: p.tipo_cultivo,
      ultimo_riego: p.ultimo_riego.toISOString(),
      latitud: p.latitud,
      longitud: p.longitud,
      estado: p.estado
    }));
  } catch (error) {
    console.error('❌ Error obteniendo parcelas desde la base de datos: ', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
};

export const getDeletedParcelasFromDB = async (): Promise<ParcelaDB[]> => {
  try {
      const deletedParcelas = await prisma.parcelas.findMany({
          where: {
              estado: false
          },
          orderBy: {
              id: 'asc'
          }
      });

      return deletedParcelas.map((p) => ({
        id: p.id,
        id_parcela: p.id_parcela,
        nombre: p.nombre,
        ubicacion: p.ubicacion,
        responsable: p.responsable,
        tipo_cultivo: p.tipo_cultivo,
        ultimo_riego: p.ultimo_riego.toISOString(),
        latitud: p.latitud,
        longitud: p.longitud,
        estado: p.estado
      }));
  } catch (error) {
      console.error('❌ [ERROR] Obteniendo las parcelas elimninadas:', error);
      throw new Error('Fallo al obtener las parcelas eliminadas.');
  }
};


export const getChartDataFromDB = async (parcelaIds: number[]) => {
  try {
      const result = await prisma.sensores_parcela.findMany({
          where: {
              parcela_id: { in: parcelaIds }
          },
          orderBy: {
              registrado_en: 'asc'
          }
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
      throw new Error('Fallo al obtener los datos de la Base de Datos Wow');
  }
};


export default fetchAndTrackChanges;