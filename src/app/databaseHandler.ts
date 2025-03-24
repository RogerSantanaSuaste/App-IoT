'use server';
// Se requiere llamar a la API para registrar los datos de las parcelas dentro de la base de datos. Adicionalmente, se debe registrar los cambios de estado de las parcelas en la base de datos, solo si, existe un cambio, por obvias razones.
// Adicionalmente, se debe tener una función que detecte cuando una parcela deja de existir, y marcarla como eliminada en la base de datos. Posteriormente, se debe de mostrar una graficación del historico de los cambios de las parcelas, al igual que un registro de las parcelas eliminadas.
import { ResponseInterface, ParcelasResponseInterface, ParcelaDB, HistoricoInterface, DataType } from "./zeTypes";
import fetchData from "./apiHandler";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función para escuchar los cambios de la API y registrarlos en la base de datos
const insertSensorData = async (parcelaId: number, parcela: ParcelasResponseInterface) => {
  try {
    const latestSensorData = await prisma.sensores_parcela.findFirst({
      where: { parcela_id: parcelaId },
      orderBy: { registrado_en: 'desc' }
    });

    const { humedad, temperatura, lluvia, sol } = parcela.sensor;

    const changes = [];

    if (latestSensorData) {
      if (latestSensorData.humedad !== humedad) {
        changes.push({
          campo: 'humedad',
          valor_anterior: latestSensorData.humedad.toString(),
          valor_nuevo: humedad.toString()
        });
      }
      if (latestSensorData.temperatura !== temperatura) {
        changes.push({
          campo: 'temperatura',
          valor_anterior: latestSensorData.temperatura.toString(),
          valor_nuevo: temperatura.toString()
        });
      }
      if (latestSensorData.lluvia !== lluvia) {
        changes.push({
          campo: 'lluvia',
          valor_anterior: latestSensorData.lluvia.toString(),
          valor_nuevo: lluvia.toString()
        });
      }
      if (latestSensorData.sol !== sol) {
        changes.push({
          campo: 'sol',
          valor_anterior: latestSensorData.sol.toString(),
          valor_nuevo: sol.toString()
        });
      }

      // Revisamos si existen cambios porque si no no hacemos nada.
      if (changes.length > 0) {
        await Promise.all(
          changes.map(async (change) => {
            await prisma.cambios_parcela.create({
              data: {
                parcela_id: parcelaId,
                cambio_tipo: 'UPDATE',
                campo: change.campo,
                valor_anterior: change.valor_anterior,
                valor_nuevo: change.valor_nuevo
              }
            });
            console.log(`🔄 Sensor ${change.campo} cambió en la parcela con ID: ${parcelaId}`);
          })
        );
      } else {
        console.log(`✅ No hubo cambios de sensores en la parcela con ID: ${parcelaId}`);
      }
    }

    // Para tener el historial de sensores.
    await prisma.sensores_parcela.create({
      data: {
        parcela_id: parcelaId,
        humedad,
        temperatura,
        lluvia,
        sol
      }
    });

    console.log(`✅ Nuevos datos de sensor insertados en parcela con ID: ${parcelaId}`);

  } catch (error) {
    console.error(`❌ Error buscando cambios en los sensores de la parcela con ID: ${parcelaId}`, error);
  }
};



// ---------------------- Función para obtener y registrar cambios
const fetchAndTrackChanges = async () => {
  try {
    const data: ResponseInterface | undefined = await fetchData();
    if (!data) {
      throw new Error('Error al recuperar los datos.');
    }

    const parcelasDeApi: ParcelasResponseInterface[] = data.parcelas;

    await Promise.all(parcelasDeApi.map(async (parcela) => {
      const existeParcela = await prisma.parcelas.findUnique({
        where: { id_parcela: parcela.id }
      });
      // Create a new function to compare the parcelas in the API response to the parcelas in the database. If, a parcela exist in the database, but not in the API, change the "estado", which is a boolean, to false.
      const parcelasIdsFromApi = parcelasDeApi.map(p => p.id);
      const parcelasInDb = await prisma.parcelas.findMany({
        where: {
          estado: true
        }
      });

      const parcelasToDelete = parcelasInDb.filter(p => !parcelasIdsFromApi.includes(p.id_parcela));

      await Promise.all(parcelasToDelete.map(async (parcela) => {
        await prisma.parcelas.update({
          where: { id_parcela: parcela.id_parcela },
          data: { estado: false }
        });

        await prisma.cambios_parcela.create({
          data: {
        parcela_id: parcela.id_parcela,
        cambio_tipo: 'DELETE',
        campo: 'estado',
        valor_anterior: 'true',
        valor_nuevo: 'false'
          }
        });

        console.log(`❌ Parcela eliminada: ${parcela.nombre}`);
      }));
      if (!existeParcela) {
        // Crear nueva parcela si no existe
        const newParcela = await prisma.parcelas.create({
          data: {
            id_parcela: parcela.id,
            nombre: parcela.nombre,
            ubicacion: parcela.ubicacion,
            responsable: parcela.responsable,
            tipo_cultivo: parcela.tipo_cultivo,
            ultimo_riego: new Date(parcela.ultimo_riego),
            latitud: parcela.latitud,
            longitud: parcela.longitud
          }
        });
        console.log(`✅ Añadida nueva parcela: ${parcela.nombre}`);

        // Insertar datos de sensores
        await insertSensorData(newParcela.id, parcela);

      } else {
        const camposARevisar: (keyof ParcelasResponseInterface)[] = [
          'nombre', 'ubicacion', 'responsable', 'tipo_cultivo', 'ultimo_riego', 'latitud', 'longitud'
        ];

        let hasChanges = false;
        const updateData: { [key: string]: any } = {};

        await Promise.all(camposARevisar.map(async (field) => {
          const valorAnterior = existeParcela[field as keyof typeof existeParcela]?.toString();
          const valorNuevo = parcela[field]?.toString();

          if (valorAnterior !== valorNuevo) {
            await prisma.cambios_parcela.create({
              data: {
                parcela_id: parcela.id,
                cambio_tipo: 'UPDATE',
                campo: field,
                valor_anterior: valorAnterior || '',
                valor_nuevo: valorNuevo || ''
              }
            });

            console.log(`🔄 Actualizado ${field} en parcela: ${parcela.nombre}`);

            if (field === 'ultimo_riego') {
              updateData[field] = new Date(parcela.ultimo_riego);
            } else {
              updateData[field] = parcela[field];
            }

            hasChanges = true;
          }
        }));

        if (hasChanges) {
          await prisma.parcelas.update({
            where: { id_parcela: parcela.id },
            data: updateData
          });
          console.log(`✅ Parcela actualizada: ${parcela.nombre}`);
        }

        // Verificar y registrar cambios en los sensores
        await insertSensorData(existeParcela.id, parcela);
      }
    }));

  } catch (error) {
    console.error('❌ Error obteniendo o registrando cambios:', error);
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
