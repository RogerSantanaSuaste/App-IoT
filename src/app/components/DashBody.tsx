'use client'
import React, { useState, useEffect, use } from 'react';
import Humedad from './Humedad';
import IntensidadSol from './IntensidadSol';
import Lluvia from './Lluvia';
import Temperatura from './Temperatura';
import Map from './Map';
import fetchData from '../apiHandler';
import { ResponseInterface } from '../zeTypes';
import { startBackgroundWorker } from '../lib/backgroundWorker';



const DashBody: React.FC = () => {
    const [data, setData] = useState<ResponseInterface | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const getData = async () => {
            try {
                startBackgroundWorker();
                const response = await fetchData();
                if (response) {
                    setData(response);
                }
            }catch (error) {
                console.error('Error:', error);
            }finally{
                setLoading(false);
            }
        };
        getData();
    }, []);
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                <div className="card bg-slate-900 shadow-xl col-span-2">
                    <div className="card-body">
                        <h2 className="card-title">Map</h2>
                        <Map />
                    </div>
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="w-full md:w-1/2">
                        <Temperatura data={data} />
                    </div>
                    <div className="w-full md:w-1/2">
                        <Humedad data={data} />
                    </div>
                    <div className="w-full md:w-1/2">
                        <IntensidadSol data={data} />
                    </div>
                    <div className="w-full md:w-1/2">
                        <Lluvia data={data} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default DashBody;