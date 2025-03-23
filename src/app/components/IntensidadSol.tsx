import React from 'react';

import { ResponseInterface } from '../zeTypes';

interface IntensidadSolProps {
    data: ResponseInterface | null;
}

const IntensidadSol: React.FC<IntensidadSolProps> = ({ data }) => {
    return (
        <div className=''>
            <div className="card bg-slate-900 w-96 shadow-sm">
                <div className="card-body">
                    <h2 className="card-title">Intensidad del Sol</h2>
                    <p className="text-4xl font-bold">{data ? data.sensores.sol : 'N/A'}%</p>
                </div>
            </div>
        </div>
    )
}

export default IntensidadSol;