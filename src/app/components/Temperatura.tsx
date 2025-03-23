import React from 'react';
import { ResponseInterface } from '../zeTypes';

interface TemperaturaProps {
    data: ResponseInterface | null;
}
const Temperatura: React.FC<TemperaturaProps> = ({ data }) => {
    return (
        <div className=''>
            <div className="card bg-slate-900 w-96 shadow-sm">
                <div className="card-body">
                    <h2 className="card-title">Temperatura</h2>
                    <p className="text-4xl font-bold">{data ? data.sensores.temperatura : "N/A"}</p>
                </div>
            </div>
        </div>
    )
}

export default Temperatura;