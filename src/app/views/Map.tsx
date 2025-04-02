"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import type { ParcelasResponseInterface } from "../zeTypes"
import { Loader2 } from "lucide-react"

mapboxgl.accessToken =
  "pk.eyJ1Ijoicm9nZXJzYW50YW5hc3Vhc3RlIiwiYSI6ImNtODdjamtmMTBlbXAybHE5cDA2N2N0d3EifQ.A0vwTYWm4fFXzEyrPAll9Q"

const Map: React.FC = () => {
  const [parcelas, setParcelas] = useState<ParcelasResponseInterface[]>([])
  const [loading, setLoading] = useState(true)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/map-data")
        const data = await response.json()

        if (data && data.success && Array.isArray(data.data)) {
          setParcelas(data.data as ParcelasResponseInterface[])
        } else {
          console.error("❌ [ERROR] Formato de datos inválido:", JSON.stringify(data, null, 2))
        }
      } catch (error) {
        console.error("❌ [ERROR] Fetching parcelas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (!mapContainerRef.current || parcelas.length === 0) return

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11", // Using dark theme to match the dashboard
      center: [-86.87443282456339, 21.064389842953606],
      zoom: 13,
    })

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), "top-right")

    parcelas.forEach((parcela) => {
      const marker = new mapboxgl.Marker({
        color: "#10b981", // Emerald green for better visibility
        scale: 0.8,
      })
        .setLngLat([parcela.longitud, parcela.latitud])
        .setPopup(
          new mapboxgl.Popup({
            offset: 25,
            maxWidth: "320px",
            className: "custom-popup",
          }).setHTML(`
              <div style="
                padding: 16px; 
                background: #1e293b; 
                color: #e2e8f0; 
                border-radius: 8px; 
                font-family: 'Geist', sans-serif;
              ">
                <h4 style="color: #38bdf8; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">${parcela.nombre}</h4>
                
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px; margin-bottom: 12px;">
                  <div style="color: #94a3b8;">📍 Ubicación:</div>
                  <div style="font-weight: 500;">${parcela.ubicacion}</div>
                  
                  <div style="color: #94a3b8;">👤 Responsable:</div>
                  <div style="font-weight: 500;">${parcela.responsable}</div>
                  
                  <div style="color: #94a3b8;">🌱 Cultivo:</div>
                  <div style="font-weight: 500;">${parcela.tipo_cultivo}</div>
                  
                  <div style="color: #94a3b8;">🕒 Último Riego:</div>
                  <div style="font-weight: 500;">${new Date(parcela.ultimo_riego).toLocaleString()}</div>
                </div>
                
                <div style="background: rgba(255,255,255,0.05); border-radius: 6px; padding: 12px; margin-top: 8px;">
                  <h5 style="margin: 0 0 8px 0; font-size: 14px; color: #94a3b8;">Datos de los sensores:</h5>
                  
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <div>
                      <div style="color: #ef4444; font-weight: 600; font-size: 18px;">${parcela.sensor.temperatura}°C</div>
                      <div style="font-size: 12px; color: #94a3b8;">Temperatura</div>
                    </div>
                    <div>
                      <div style="color: #3b82f6; font-weight: 600; font-size: 18px;">${parcela.sensor.humedad}%</div>
                      <div style="font-size: 12px; color: #94a3b8;">Humedad</div>
                    </div>
                    <div>
                      <div style="color: #06b6d4; font-weight: 600; font-size: 18px;">${parcela.sensor.lluvia} mm</div>
                      <div style="font-size: 12px; color: #94a3b8;">Lluvia</div>
                    </div>
                    <div>
                      <div style="color: #eab308; font-weight: 600; font-size: 18px;">${parcela.sensor.sol} W/m²</div>
                      <div style="font-size: 12px; color: #94a3b8;">Sol</div>
                    </div>
                  </div>
                </div>
              </div>
            `),
        )
        .addTo(map)

      return () => marker.remove()
    })

    // Add custom CSS for the popup
    const style = document.createElement("style")
    style.innerHTML = `
      .mapboxgl-popup-content {
        padding: 0 !important;
        background: transparent !important;
        border-radius: 12px !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2) !important;
        overflow: hidden;
      }
      .mapboxgl-popup-close-button {
        color: white !important;
        font-size: 18px !important;
        padding: 8px !important;
        right: 4px !important;
        top: 4px !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      map.remove()
      document.head.removeChild(style)
    }
  }, [parcelas])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return <div ref={mapContainerRef} className="w-full h-[80vh]" />
}

export default Map

