import React from 'react';
import { ResponseInterface } from '../zeTypes';

interface LluviaProps {
    data: ResponseInterface | null;
}

const Lluvia: React.FC<LluviaProps> = ({ data }) => {
    return (
        <div className=''>
            <div className="card">
                <div className="card-body">
                    <h2 className="card-title">Lluvia 🌧️</h2>
                    <p className="text-4xl font-bold text-cyan-500">{data ? data.sensores.lluvia : 'N/A'}mm</p>
                </div>
            </div>
        </div>
    )
}

export default Lluvia;