import React from 'react';

import { ResponseInterface } from '../zeTypes';

interface IntensidadSolProps {
    data: ResponseInterface | null;
}

const IntensidadSol: React.FC<IntensidadSolProps> = ({ data }) => {
    return (
        <div className=''>
            <div className="card ">
                <div className="card-body">
                    <h2 className="card-title">Intensidad del Sol ☀️</h2>
                    <p className="text-4xl font-bold text-yellow-500">{data ? data.sensores.sol : 'N/A'}%</p>
                </div>
            </div>
        </div>
    )
}

export default IntensidadSol;