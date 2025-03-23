'use server';
// Se requiere llamar a la API para registrar los datos de las parcelas dentro de la base de datos. Adicionalmente, se debe registrar los cambios de estado de las parcelas en la base de datos, solo si, existe un cambio, por obvias razones.
// Adicionalmente, se debe tener una función que detecte cuando una parcela deja de existir, y marcarla como eliminada en la base de datos. Posteriormente, se debe de mostrar una graficación del historico de los cambios de las parcelas, al igual que un registro de las parcelas eliminadas.
import { ResponseInterface, ParcelasResponseInterface, ParcelaDB } from "./zeTypes";
import fetchData from "./apiHandler";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función para escuchar los cambios de la API y registrarlos en la base de datos
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

      if (!existeParcela) {
        await prisma.parcelas.create({
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

      } else {
        const camposARevisar: (keyof ParcelasResponseInterface)[] = [
          'nombre', 'ubicacion', 'responsable', 'tipo_cultivo', 'ultimo_riego', 'latitud', 'longitud'
        ];

        let hasChanges = false;
        const updateData: { [key: string]: string | number | { humedad: number; temperatura: number; lluvia: number; sol: number; } | Date } = {};

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
              updateData[field] = new Date(parcela.ultimo_riego) as any; 
            } else {
              updateData[field as keyof ParcelasResponseInterface] = parcela[field];
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
      }
    }));

  } catch (error) {
    console.error('❌ Error obteniendo o registrando cambios:', error);
  } finally {
    await prisma.$disconnect();
  }
};

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
        longitud: p.longitud
      }));
    } catch (error) {
      console.error('❌ Error obteniendo parcelas desde la base de datos: ', error);
      return [];
    } finally {
      await prisma.$disconnect();
    }
  };

export default fetchAndTrackChanges;
