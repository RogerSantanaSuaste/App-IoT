"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Humedad from "./Humedad"
import IntensidadSol from "./IntensidadSol"
import Lluvia from "./Lluvia"
import Temperatura from "./Temperatura"
import Map from "./Map"
import fetchData from "../apiHandler"
import type { ResponseInterface } from "../zeTypes"
import { Loader2 } from "lucide-react"

const DashBody: React.FC = () => {
  const [data, setData] = useState<ResponseInterface | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      try {
        const startWorker = async () => {
          await fetch("/api/backgroundWorker")
        }

        await startWorker()

        const response = await fetchData()
        if (response) {
          setData(response)
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    getData()

    const POLLING_INTERVAL = 1 * 60 * 1000

    const interval = setInterval(() => {
      console.log("Refreshing data...")
      setLoading(true)
      getData()
    }, POLLING_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-white/90">Panel de Control</h1>

      {loading ? (
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl overflow-hidden border border-slate-800 bg-slate-900/80 shadow-xl">
            <div className="p-4 border-b border-slate-800">
              <h2 className="text-xl font-medium">Mapa de Parcelas</h2>
            </div>
            <Map />
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Temperatura data={data} />
              <Humedad data={data} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <IntensidadSol data={data} />
              <Lluvia data={data} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashBody
