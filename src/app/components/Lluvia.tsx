import React from 'react';
import { ResponseInterface } from '../apiHandler';

interface LluviaProps {
    data: ResponseInterface | null;
}

const Lluvia: React.FC<LluviaProps> = ({ data }) => {
    return (
        <div className=''>
            <div className="card bg-slate-900 w-96 shadow-sm">
                <div className="card-body">
                    <h2 className="card-title">Lluvia</h2>
                    <p className="text-4xl font-bold">{data ? data.sensores.lluvia : 'N/A'}%</p>
                </div>
            </div>
        </div>
    )
}

export default Lluvia;