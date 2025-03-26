'use client'
import React, { useState, useEffect } from 'react';
import { ParcelaDB } from "../zeTypes";
import { getDeletedParcelasFromDB } from '../databaseHandler';

const DeletedParcelas: React.FC = () => {
  const [parcelas, setParcelas] = useState<ParcelaDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDeletedParcelasFromDB();
        setParcelas(data);
        setLoading(false);
      } catch (error) {
        console.error('❌ [ERROR]', error);
        setError('Fallo al intentar cargar las parcelas');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="text-center text-lg">⏳ Cargando parcelas eliminadas...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">🌿 Parcelas Eliminadas</h1>

      {parcelas.length === 0 ? (
        <p className="text-gray-500 text-center">No se encontraron parcelas eliminadas.</p>
      ) : (
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {parcelas.map((parcela) => (
            <div 
              key={parcela.id} 
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <div className="card-body">
                <h2 className="card-title">{parcela.nombre}</h2>
                <p className="text-slate-200">📍 {parcela.ubicacion}</p>
                <p className="text-slate-300">👤 {parcela.responsable}</p>
                <p className="text-slate-300">🌱 {parcela.tipo_cultivo}</p>
                <p className="text-slate-300 text-sm">
                  🕒 Último riego: {new Date(parcela.ultimo_riego).toLocaleString()}
                </p>
                <div className="badge badge-error mt-4">[DELETED]</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeletedParcelas;
