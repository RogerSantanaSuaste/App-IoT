import type React from "react"
import type { ResponseInterface } from "../zeTypes"
import { Sun } from "lucide-react"

interface IntensidadSolProps {
  data: ResponseInterface | null
}

const IntensidadSol: React.FC<IntensidadSolProps> = ({ data }) => {
  const value = data?.sensores.sol ?? "N/A"

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Intensidad del Sol</h2>
          <Sun className="h-5 w-5 text-yellow-500" />
        </div>
        <div className="flex items-end">
          <p className="text-4xl font-bold text-yellow-500">{value}</p>
          <p className="text-xl ml-1 text-yellow-500/70">%</p>
        </div>
      </div>
    </div>
  )
}

export default IntensidadSol

