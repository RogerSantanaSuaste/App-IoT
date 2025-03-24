"use client";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { ParcelaDB } from "../zeTypes";
import { getParcelasFromDB, getChartDataFromDB } from "../databaseHandler";

mapboxgl.accessToken = 'pk.eyJ1Ijoicm9nZXJzYW50YW5hc3Vhc3RlIiwiYSI6ImNtODdjamtmMTBlbXAybHE5cDA2N2N0d3EifQ.A0vwTYWm4fFXzEyrPAll9Q';

const Map: React.FC = () => {
  const [parcelas, setParcelas] = useState<ParcelaDB[]>([]);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getParcelasFromDB();
        
        const activeParcelas = data.filter((parcela) => parcela.estado === true);
        
        setParcelas(activeParcelas);

        const parcelaIds = activeParcelas.map(parcela => parcela.id);
        const sensorData = await getChartDataFromDB(parcelaIds);

        const parcelasWithSensorData = activeParcelas.map(parcela => {
          const parcelaSensorData = sensorData
            .filter(data => data.parcelaId === parcela.id)
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())[0]; // Get the latest sensor data
          return { ...parcela, sensorData: parcelaSensorData ? [parcelaSensorData] : [] };
        });

        setParcelas(parcelasWithSensorData);
      } catch (error) {
        console.error('❌ [ERROR] Fetching parcelas:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || parcelas.length === 0) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-86.87443282456339, 21.064389842953606],
      zoom: 14
    });

    parcelas.forEach((parcela) => {
      const marker = new mapboxgl.Marker({ color: "green" })
        .setLngLat([parcela.longitud, parcela.latitud])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div style="
            max-width: 300px; 
            padding: 15px; 
            background: #fff; 
            color: #333; 
            border-radius: 8px; 
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          ">
            <h4 style="color: #007bff; margin: 0;">${parcela.nombre}</h4>
            <p>📍 Ubicación: <strong>${parcela.ubicacion}</strong></p>
            <p>👤 Responsable: <strong>${parcela.responsable}</strong></p>
            <p>🌱 Cultivo: <strong>${parcela.tipo_cultivo}</strong></p>
            <p>🕒 Último Riego: <strong>${new Date(parcela.ultimo_riego).toLocaleString()}</strong></p>
            <h5 style="margin-top: 10px;">Sensor Data:</h5>
            ${parcela.sensorData?.filter((sensor: { parcelaId: number }) => sensor.parcelaId === parcela.id).map((sensor: { temperatura: number; humedad: number; time: string }) => `
          <p>🌡️ Temperatura: <strong>${sensor.temperatura}°C</strong></p>
          <p>💧 Humedad: <strong>${sensor.humedad}%</strong></p>
          <p>📅 Fecha: <strong>${new Date(sensor.time).toLocaleString()}</strong></p>
            `).join('')}
          </div>
        `)
        )
        .addTo(map);

      return () => marker.remove();
    });

    return () => map.remove();
  }, [parcelas]);

  return (
    <div ref={mapContainerRef} style={{ width: "100%", height: "100vh" }} />
  );
};

export default Map;
