import React from 'react';
import { ResponseInterface } from '../zeTypes';

interface TemperaturaProps {
    data: ResponseInterface | null;
}
const Temperatura: React.FC<TemperaturaProps> = ({ data }) => {
    return (
        <div className=''>
            <div className="card ">
                <div className="card-body">
                    <h2 className="card-title">Temperatura 🌡️</h2>
                    <p className="text-4xl font-bold text-red-500">
                        {data ? `${data.sensores.temperatura}°C` : "N/A"}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Temperatura;