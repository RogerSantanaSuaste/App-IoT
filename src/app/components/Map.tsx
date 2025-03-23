"use client";
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { ParcelaDB } from "../zeTypes";
import { getParcelasFromDB } from "../databaseHandler";
// Esto es un desastrer, pero funciona
mapboxgl.accessToken = 'pk.eyJ1Ijoicm9nZXJzYW50YW5hc3Vhc3RlIiwiYSI6ImNtODdjamtmMTBlbXAybHE5cDA2N2N0d3EifQ.A0vwTYWm4fFXzEyrPAll9Q';

const Map: React.FC = () => {
  const [parcelas, setParcelas] = useState<ParcelaDB[]>([]);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getParcelasFromDB();
      setParcelas(data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || parcelas.length === 0) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-86.84705025483673, 21.04976380146583],
      zoom: 15
    });

    parcelas.forEach((parcela) => {
      const marker = new mapboxgl.Marker({ color: "red" })
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
                <p>Ubicación: <strong>${parcela.ubicacion}</strong></p>
                <p>Responsable: <strong>${parcela.responsable}</strong></p>
                <p>Tipo: <strong>${parcela.tipo_cultivo}</strong></p>
                <p>Último Riego: <strong>${new Date(parcela.ultimo_riego).toLocaleString()}</strong></p>
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
