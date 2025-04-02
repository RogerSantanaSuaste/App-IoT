"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { ParcelaDB } from "../zeTypes"
import { Loader2, MapPin, User, Leaf, Clock, AlertTriangle, Hash } from "lucide-react"

const DeletedParcelas: React.FC = () => {
  const [parcelas, setParcelas] = useState<ParcelaDB[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/deletedParcelas")
        const { success, data, error } = await response.json()
        if (success) {
          data.sort((a: ParcelaDB, b: ParcelaDB) => a.nombre.localeCompare(b.nombre))
        }

        if (!success) {
          throw new Error(error || "Failed to fetch parcelas eliminadas.")
        }
        setParcelas(data)
        setLoading(false)
      } catch (error) {
        console.error("❌ [ERROR]", error)
        setError("Fallo al intentar cargar las parcelas")
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading)
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Cargando parcelas eliminadas...</span>
      </div>
    )

  if (error)
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <span className="ml-2 text-lg text-destructive">{error}</span>
      </div>
    )

  return (
    <div className="w-full p-6">
      <h1 className="text-2xl font-bold mb-6 text-white/90">Parcelas Eliminadas</h1>

      {parcelas.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl p-8 text-center w-full">
          <p className="text-gray-400 text-lg">No se encontraron parcelas eliminadas.</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
          {parcelas.map((parcela) => (
            <div
              key={parcela.id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-5">
                <h2 className="text-xl font-semibold mb-3">{parcela.nombre}</h2>
                <div className="space-y-2 text-slate-300">
                <div className="flex items-center">
                    <Hash className="h-4 w-4 mr-2 text-slate-400" />
                    <p>{parcela.id}</p>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                    <p>{parcela.ubicacion}</p>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-slate-400" />
                    <p>{parcela.responsable}</p>
                  </div>
                  <div className="flex items-center">
                    <Leaf className="h-4 w-4 mr-2 text-slate-400" />
                    <p>{parcela.tipo_cultivo}</p>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-slate-400" />
                    <p className="text-sm">Último riego: {new Date(parcela.ultimo_riego).toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-300 border border-red-800">
                    ELIMINADA
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DeletedParcelas

