// app/components/Charts.tsx
'use client';
import React, { useEffect, useState } from 'react';
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
    Legend
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

interface ChartData {
    parcelaId: number;
    time: string;
    lluvia: number;
    temperatura: number;
    sol: number;
    humedad: number;
}

interface Parcela {
    id: number;
    [key: string]: any;
}

const Charts: React.FC = () => {
    const [lineData, setLineData] = useState<any>(null);
    const [barData, setBarData] = useState<any>(null);
    const [doughnutData, setDoughnutData] = useState<Record<number, any>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch('/api/chart-data');
                const { success, data, error } = await response.json();

                if (!success) {
                    throw new Error(error || 'Failed to fetch chart data');
                }

                const { parcelas, chartData } = data;

                const parcelaMap = parcelas.reduce((acc: Record<number, {
                    time: string[];
                    lluvia: number[];
                    temperatura: number[];
                    sol: number[];
                    humedad: number[];
                }>, parcela: Parcela) => {
                    acc[parcela.id] = {
                        time: [],
                        lluvia: [],
                        temperatura: [],
                        sol: [],
                        humedad: []
                    };
                    return acc;
                }, {});

                chartData.forEach((item: ChartData) => {
                    const parcela = parcelaMap[item.parcelaId];
                    if (parcela) {
                        parcela.time.push(new Date(item.time).toLocaleTimeString());
                        parcela.lluvia.push(item.lluvia);
                        parcela.temperatura.push(item.temperatura);
                        parcela.sol.push(item.sol);
                        parcela.humedad.push(item.humedad);
                    }
                });

                parcelas.sort((a: Parcela, b: Parcela) => a.id - b.id);

                setLineData({
                    labels: parcelaMap[parcelas[0].id].time.slice(-35),
                    datasets: parcelas.map((parcela: Parcela, index: number) => ({
                        label: `Parcela ${parcela.id} - Lluvia`,
                        data: parcelaMap[parcela.id].lluvia.slice(-35),
                        borderColor: ['#4CAF50', '#FF6384', '#36A2EB', '#FFCE56'][index % 4],
                        backgroundColor: ['#4CAF5080', '#FF638480', '#36A2EB80', '#FFCE5680'][index % 4],
                        fill: true,
                        tension: 0.3
                    }))
                });

                const avgTemps = parcelas.map((parcela: Parcela) => {
                    const temps = parcelaMap[parcela.id].temperatura;
                    return temps.length > 0
                        ? parseFloat((temps.reduce((sum: number, val: number) => sum + val, 0) / temps.length).toFixed(1))
                        : 0;
                });

                setBarData({
                    labels: parcelas.map((parcela: Parcela) => `Parcela ${parcela.id}`),
                    datasets: [{
                        label: 'Temperatura promedio (°C)',
                        data: avgTemps,
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50']
                    }]
                });

                const parcelaDoughnutData = parcelas.reduce((acc: Record<number, any>, parcela: Parcela) => {
                    const humedadValues = parcelaMap[parcela.id].humedad;
                    const totalHumedad = humedadValues.reduce((sum: number, val: number) => sum + val, 0);
                    const avgHumedad = humedadValues.length > 0
                        ? parseFloat((totalHumedad / humedadValues.length).toFixed(1))
                        : 0;

                    acc[parcela.id] = {
                        labels: ['Humedad', 'Resto'],
                        datasets: [{
                            label: `Humedad Parcela ${parcela.id}`,
                            data: [avgHumedad, 100 - avgHumedad],
                            backgroundColor: ['#36A2EB', '#E0E0E0']
                        }]
                    };
                    return acc;
                }, {});

                setDoughnutData(parcelaDoughnutData);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Error al obtener datos');
                console.error('Chart data error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="text-center p-8">Cargando gráficas...</div>;
    }

    if (error) {
        return <div className="text-red-500 text-center p-8">{error}</div>;
    }

    return (
        <div className="p-8 space-y-8">
            <div className="bg-slate-300 rounded-lg shadow-md p-4 w-full">
                <h2 className="text-lg font-semibold mb-4 text-black">Lluvia en todas las parcelas</h2>
                <div className="h-96">
                    {lineData ? <Line
                        data={lineData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false
                        }}
                    /> : <p>No hay datos disponibles</p>}
                </div>
            </div>

            <div className="bg-slate-300 rounded-lg shadow-md p-4 w-full text-black">
                <h2 className="text-lg font-semibold mb-4">Temperatura promedio</h2>
                <div className="h-96">
                    {barData ? <Bar
                        data={barData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false
                        }}
                    /> : <p>No hay datos disponibles</p>}
                </div>
            </div>

            <div className="bg-slate-300 rounded-lg shadow-md p-4 w-full">
                <h2 className="text-lg font-semibold mb-4 text-black">Humedad por parcela</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Object.keys(doughnutData).map((parcelaId) => (
                        <div key={parcelaId} className="bg-slate-200 rounded-lg shadow p-4">
                            <div>
                                <h3 className="text-md font-medium mb-2 text-center text-black">Parcela {parcelaId}</h3>
                            </div>
                            <div className="h-64 flex justify-center items-center">
                                <Doughnut
                                    data={doughnutData[parseInt(parcelaId)]}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default Charts;
