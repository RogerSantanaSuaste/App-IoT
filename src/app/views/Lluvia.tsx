import type React from "react"
import type { ResponseInterface } from "../zeTypes"
import { CloudRain } from "lucide-react"

interface LluviaProps {
  data: ResponseInterface | null
}

const Lluvia: React.FC<LluviaProps> = ({ data }) => {
  const value = data?.sensores.lluvia ?? "N/A"

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Lluvia</h2>
          <CloudRain className="h-5 w-5 text-cyan-500" />
        </div>
        <div className="flex items-end">
          <p className="text-4xl font-bold text-cyan-500">{value}</p>
          <p className="text-xl ml-1 text-cyan-500/70">mm</p>
        </div>
      </div>
    </div>
  )
}

export default Lluvia

