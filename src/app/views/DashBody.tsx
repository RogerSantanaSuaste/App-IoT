'use client'
import React, { useState, useEffect } from 'react';
import Humedad from './Humedad';
import IntensidadSol from './IntensidadSol';
import Lluvia from './Lluvia';
import Temperatura from './Temperatura';
import Map from './Map';
import fetchData from '../apiHandler';
import { ResponseInterface } from '../zeTypes';



const DashBody: React.FC = () => {
    const [data, setData] = useState<ResponseInterface | null>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const getData = async () => {
            try {
                const startWorker = async () => {
                    await fetch('/api/backgroundWorker');
                  };
              
                  startWorker();
              
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
                <div className="card bg-slate-900 shadow-xl md:col-span-1 lg:col-span-2">
                    <div className="card-body">
                        <h2 className="card-title">Mapa</h2>
                        <Map />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="card bg-slate-900 shadow-xl">
                        <div className="card-body">
                            <Temperatura data={data} />
                        </div>
                    </div>
                    <div className="card bg-slate-900 shadow-xl">
                        <div className="card-body">
                            <Humedad data={data} />
                        </div>
                    </div>
                    <div className="card bg-slate-900 shadow-xl">
                        <div className="card-body">
                            <IntensidadSol data={data} />
                        </div>
                    </div>
                    <div className="card bg-slate-900 shadow-xl">
                        <div className="card-body">
                            <Lluvia data={data} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DashBody;