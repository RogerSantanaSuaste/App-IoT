import type React from "react"
import type { ResponseInterface } from "../zeTypes"
import { Droplet } from "lucide-react"

interface HumedadProps {
  data: ResponseInterface | null
}

const Humedad: React.FC<HumedadProps> = ({ data }) => {
  const value = data?.sensores.humedad ?? "N/A"

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Humedad</h2>
          <Droplet className="h-5 w-5 text-blue-500" />
        </div>
        <div className="flex items-end">
          <p className="text-4xl font-bold text-blue-500">{value}</p>
          <p className="text-xl ml-1 text-blue-500/70">%</p>
        </div>
      </div>
    </div>
  )
}

export default Humedad

