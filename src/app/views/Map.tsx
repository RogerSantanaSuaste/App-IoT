"use client";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { ParcelasResponseInterface } from "../zeTypes";

mapboxgl.accessToken = 'pk.eyJ1Ijoicm9nZXJzYW50YW5hc3Vhc3RlIiwiYSI6ImNtODdjamtmMTBlbXAybHE5cDA2N2N0d3EifQ.A0vwTYWm4fFXzEyrPAll9Q';

const Map: React.FC = () => {
  const [parcelas, setParcelas] = useState<ParcelasResponseInterface[]>([]);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/map-data');
        const data = await response.json();

        if (data && data.success && Array.isArray(data.data)) {
          setParcelas(data.data as ParcelasResponseInterface[]);
        } else {
          console.error('❌ [ERROR] Formato de datos inválido:', JSON.stringify(data, null, 2));
        }
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
      zoom: 13
    });

    parcelas.forEach((parcela) => {
      const marker = new mapboxgl.Marker({ color: "green" })
        .setLngLat([parcela.longitud, parcela.latitud])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div style="
                max-width: 500px; 
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
                <h5 style="margin-top: 10px;">Datos de los sensores:</h5>
                <p>🌡️ Temperatura: <strong>${parcela.sensor.temperatura}°C</strong></p>
                <p>💧 Humedad: <strong>${parcela.sensor.humedad}%</strong></p>
                <p>🌧️ Lluvia: <strong>${parcela.sensor.lluvia} mm</strong></p>
                <p>☀️ Sol: <strong>${parcela.sensor.sol} W/m²</strong></p>
              </div>
            `)
        )
        .addTo(map);

      return () => marker.remove();
    });

    return () => map.remove();
  }, [parcelas]);

  return (
    <div ref={mapContainerRef} style={{ width: "100%", height: "90vh" }} />
  );
};

export default Map;
