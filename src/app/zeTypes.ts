// INTERFACES WOW
export interface ResponseInterface {
    sensores: {
        humedad: number;
        temperatura: number;
        lluvia: number;
        sol: number;
    };
    parcelas: ParcelasResponseInterface[];
}

export interface ParcelasResponseInterface {
    id: number;
    nombre: string;
    ubicacion: string;
    responsable: string;
    tipo_cultivo: string;
    ultimo_riego: string;
    sensor: {
      humedad: number;
      temperatura: number;
      lluvia: number;
      sol: number;
    };
    latitud: number;
    longitud: number;
  }


  
  export interface HistoricoInterface {
    id: number;
    parcela_id: number;
    cambio_tipo: 'INSERT' | 'UPDATE' | 'DELETE';
    campo: string;
    valor_anterior: string | null;
    valor_nuevo: string | null;
    registrado_en: string;
  }

  export interface ParcelaDB {
    id: number;
    id_parcela: number;
    nombre: string;
    ubicacion: string;
    responsable: string;
    tipo_cultivo: string;
    ultimo_riego: string;
    latitud: number;
    longitud: number;
  }