import type React from "react"
import type { ResponseInterface } from "../zeTypes"
import { Thermometer } from "lucide-react"

interface TemperaturaProps {
  data: ResponseInterface | null
}

const Temperatura: React.FC<TemperaturaProps> = ({ data }) => {
  const value = data?.sensores.temperatura ?? "N/A"

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Temperatura</h2>
          <Thermometer className="h-5 w-5 text-red-500" />
        </div>
        <div className="flex items-end">
          <p className="text-4xl font-bold text-red-500">{value}</p>
          <p className="text-xl ml-1 text-red-500/70">°C</p>
        </div>
      </div>
    </div>
  )
}

export default Temperatura

