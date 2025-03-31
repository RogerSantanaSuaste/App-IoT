import React from 'react';
import { ResponseInterface } from '../zeTypes';

interface HumedadProps {
    data: ResponseInterface | null;
}

const Humedad: React.FC<HumedadProps> = ({ data }) => {
    return (
        <div className=''>
            <div className="card">
                <div className="card-body">
                    <h2 className="card-title">Humedad 💧</h2>
                    <p className="text-4xl font-bold text-blue-500">{data ? data.sensores.humedad : 'N/A'}%</p>
                </div>
            </div>
        </div>
    )
}

export default Humedad;