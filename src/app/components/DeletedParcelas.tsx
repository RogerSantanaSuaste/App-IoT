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

  if (loading) return <p>Cargando parcelas eliminadas...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Parcelas Eliminadas</h1>

      {parcelas.length === 0 ? (
        <p className="text-gray-500">No se encontraron parcelas eliminadas.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {parcelas.map((parcela) => (
            <div
              key={parcela.id}
              className="bg-white border rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-lg font-semibold text-black">{parcela.nombre}</h2>
              <p className="text-gray-600">📍 {parcela.ubicacion}</p>
              <p className="text-gray-500">👤 {parcela.responsable}</p>
              <p className="text-gray-500">🌱 {parcela.tipo_cultivo}</p>
              <p className="text-gray-400 text-sm">
                🕒 Último riego: {new Date(parcela.ultimo_riego).toLocaleString()}
              </p>
              <p className="text-red-500 font-bold mt-2">[DELETED]</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeletedParcelas;
