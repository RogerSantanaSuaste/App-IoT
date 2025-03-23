import axios from 'axios';

axios.defaults.baseURL = 'http://moriahmkt.com/iotapp/';

interface ResponseInterface {
    sensores: {
        humedad: number;
        temperatura: number;
        lluvia: number;
        sol: number;
    };
    parcelas: ParselasResponseInterface[];
}

interface ParselasResponseInterface {
    id: number;
    nombre: string;
    ubicacion: string;
    responsable: string;
    tipo_completo: string;
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

// Fetch the data
const fetchData = async () => {
    try {
        const response = await axios.get<ResponseInterface>('');
        const data = response.data;
        console.log('Sensores:', data.sensores);
        console.log('Parcelas:', data.parcelas);

        return data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Axios error:', error.message);
        } else {
            console.error('Unexpected error:', error);
        }
    }
};

export default fetchData;
export type { ResponseInterface, ParselasResponseInterface };