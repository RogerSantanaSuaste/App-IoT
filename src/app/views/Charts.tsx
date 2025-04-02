"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Line, Bar, Doughnut } from "react-chartjs-2"
import { Loader2, AlertTriangle } from "lucide-react"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

interface ChartData {
  parcelaId: number
  time: string
  lluvia: number
  temperatura: number
  sol: number
  humedad: number
}

interface Parcela {
  id: number
  [key: string]: any
}

const Charts: React.FC = () => {
  const [lineData, setLineData] = useState<any>(null)
  const [barData, setBarData] = useState<any>(null)
  const [doughnutData, setDoughnutData] = useState<Record<number, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/chart-data")
        const { success, data, error } = await response.json()

        if (!success) {
          throw new Error(error || "Failed to fetch chart data")
        }

        const { parcelas, chartData } = data

        const parcelaMap = parcelas.reduce(
          (
            acc: Record<
              number,
              {
                time: string[]
                lluvia: number[]
                temperatura: number[]
                sol: number[]
                humedad: number[]
              }
            >,
            parcela: Parcela,
          ) => {
            acc[parcela.id] = {
              time: [],
              lluvia: [],
              temperatura: [],
              sol: [],
              humedad: [],
            }
            return acc
          },
          {},
        )

        chartData.forEach((item: ChartData) => {
          const parcela = parcelaMap[item.parcelaId]
          if (parcela) {
            parcela.time.push(new Date(item.time).toLocaleTimeString())
            parcela.lluvia.push(item.lluvia)
            parcela.temperatura.push(item.temperatura)
            parcela.sol.push(item.sol)
            parcela.humedad.push(item.humedad)
          }
        })

        parcelas.sort((a: Parcela, b: Parcela) => a.id - b.id)

        setLineData({
          labels: parcelaMap[parcelas[0].id].time.slice(-10),
          datasets: parcelas.map((parcela: Parcela, index: number) => ({
            label: `Parcela ${parcela.id} - Lluvia`,
            data: parcelaMap[parcela.id].lluvia.slice(-10),
            borderColor: [
              "#10b981",
              "#f43f5e",
              "#3b82f6",
              "#f59e0b",
              "#8b5cf6",
              "#ec4899",
              "#22d3ee",
              "#eab308",
              "#14b8a6",
              "#ef4444",
              "#6366f1",
            ][index % 11],
            backgroundColor: [
              "rgba(16, 185, 129, 0.1)",
              "rgba(244, 63, 94, 0.1)",
              "rgba(59, 130, 246, 0.1)",
              "rgba(245, 158, 11, 0.1)",
              "rgba(139, 92, 246, 0.1)",
              "rgba(236, 72, 153, 0.1)",
              "rgba(34, 211, 238, 0.1)",
              "rgba(234, 179, 8, 0.1)",
              "rgba(20, 184, 166, 0.1)",
              "rgba(239, 68, 68, 0.1)",
              "rgba(99, 102, 241, 0.1)",
            ][index % 11],
            fill: true,
            tension: 0.3,
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
          })),
        })

        const avgTemps = parcelas.map((parcela: Parcela) => {
          const temps = parcelaMap[parcela.id].temperatura
          return temps.length > 0
            ? Number.parseFloat((temps.reduce((sum: number, val: number) => sum + val, 0) / temps.length).toFixed(1))
            : 0
        })

        setBarData({
          labels: parcelas.map((parcela: Parcela) => `Parcela ${parcela.id}`),
          datasets: [
            {
              label: "Temperatura promedio (°C)",
              data: avgTemps,
              backgroundColor: [
          "#f43f5e",
          "#3b82f6",
          "#f59e0b",
          "#10b981",
          "#8b5cf6",
          "#ec4899",
          "#22d3ee",
          "#eab308",
          "#14b8a6",
          "#ef4444",
          "#6366f1",
              ],
              borderRadius: 6,
              borderWidth: 0,
            },
          ],
        })

        const parcelaDoughnutData = parcelas.reduce((acc: Record<number, any>, parcela: Parcela) => {
          const humedadValues = parcelaMap[parcela.id].humedad
          const totalHumedad = humedadValues.reduce((sum: number, val: number) => sum + val, 0)
          const avgHumedad =
            humedadValues.length > 0 ? Number.parseFloat((totalHumedad / humedadValues.length).toFixed(1)) : 0

          acc[parcela.id] = {
            labels: ["Humedad", "Resto"],
            datasets: [
              {
                label: `Humedad Parcela ${parcela.id}`,
                data: [avgHumedad, 100 - avgHumedad],
                backgroundColor: ["#3b82f6", "rgba(148, 163, 184, 0.2)"],
                borderWidth: 0,
                cutout: "70%",
              },
            ],
          }
          return acc
        }, {})

        setDoughnutData(parcelaDoughnutData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al obtener datos")
        console.error("Chart data error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Cargando gráficas...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <span className="ml-2 text-lg text-destructive">{error}</span>
      </div>
    )
  }

  return (
    <div className="w-full p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-6 text-white/90">Análisis de Datos</h1>

      <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-xl overflow-hidden w-full">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-xl font-medium">Lluvia en todas las parcelas</h2>
          <p className="text-slate-400 text-sm mt-1">Registro histórico de precipitaciones</p>
        </div>
        <div className="p-5">
          <div className="h-96">
            {lineData ? (
              <Line
                data={lineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top",
                      labels: {
                        usePointStyle: true,
                        boxWidth: 6,
                        color: "#94a3b8",
                      },
                    },
                    tooltip: {
                      backgroundColor: "#1e293b",
                      titleColor: "#e2e8f0",
                      bodyColor: "#e2e8f0",
                      borderColor: "#475569",
                      borderWidth: 1,
                      padding: 12,
                      displayColors: true,
                      usePointStyle: true,
                      boxWidth: 6,
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        color: "rgba(148, 163, 184, 0.1)",
                      },
                      ticks: {
                        color: "#94a3b8",
                      },
                    },
                    y: {
                      grid: {
                        color: "rgba(148, 163, 184, 0.1)",
                      },
                      ticks: {
                        color: "#94a3b8",
                      },
                    },
                  },
                }}
              />
            ) : (
              <p className="text-center text-slate-400">No hay datos disponibles</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-xl overflow-hidden w-full">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-xl font-medium">Temperatura promedio</h2>
          <p className="text-slate-400 text-sm mt-1">Comparativa entre parcelas</p>
        </div>
        <div className="p-5">
          <div className="h-80">
            {barData ? (
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      backgroundColor: "#1e293b",
                      titleColor: "#e2e8f0",
                      bodyColor: "#e2e8f0",
                      borderColor: "#475569",
                      borderWidth: 1,
                      padding: 12,
                    },
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false,
                      },
                      ticks: {
                        color: "#94a3b8",
                      },
                    },
                    y: {
                      grid: {
                        color: "rgba(148, 163, 184, 0.1)",
                      },
                      ticks: {
                        color: "#94a3b8",
                      },
                    },
                  },
                }}
              />
            ) : (
              <p className="text-center text-slate-400">No hay datos disponibles</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-xl shadow-xl overflow-hidden w-full">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-xl font-medium">Humedad por parcela</h2>
          <p className="text-slate-400 text-sm mt-1">Últimos niveles de humedad</p>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.keys(doughnutData).length > 0 ? (
              Object.keys(doughnutData).map((parcelaId) => (
                <div key={parcelaId} className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4 text-center">Parcela {parcelaId}</h3>
                  <div className="h-64 relative">
                    <Doughnut
                      data={doughnutData[Number.parseInt(parcelaId)]}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            backgroundColor: "#1e293b",
                            titleColor: "#e2e8f0",
                            bodyColor: "#e2e8f0",
                            borderColor: "#475569",
                            borderWidth: 1,
                            padding: 12,
                          },
                        },
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-3xl font-bold text-blue-500">
                        {doughnutData[Number.parseInt(parcelaId)].datasets[0].data[0]}%
                      </span>
                      <span className="text-sm text-slate-400">Humedad</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 col-span-3">No hay datos disponibles</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Charts

