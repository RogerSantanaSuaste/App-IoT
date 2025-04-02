import axios from 'axios';
import { ResponseInterface } from './zeTypes';

const API_URL = process.env.API_URL || 'https://moriahmkt.com/iotapp/updated/';
axios.defaults.baseURL = API_URL;

// Fetch the data
const fetchData = async () => {
    try {
        const response = await axios.get<ResponseInterface>('');
        const data: ResponseInterface = response.data;
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