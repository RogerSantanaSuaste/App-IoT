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
import { getChartDataFromDB, getParcelasFromDB } from '../databaseHandler';

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

const Charts: React.FC = () => {
    const [lineData, setLineData] = useState<any>(null);
    const [barData, setBarData] = useState<any>(null);
    const [doughnutData, setDoughnutData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            console.log('🔹 [FETCH START] Fetching data for charts...');
            try {
                setLoading(true);
                setError(null);

                const parcelas = await getParcelasFromDB();
                const parcelaIds = parcelas.map(parcela => parcela.id);
                const chartData = await getChartDataFromDB(parcelaIds);

                console.log(`✅ [CHART DATA]`, chartData);

                // Se agrupan los datos
                const parcelaMap: {
                    [key: number]: {
                        time: string[];
                        lluvia: number[];
                        temperatura: number[];
                        sol: number[];
                        humedad: number[];
                    };
                } = {};

                parcelaIds.forEach(id => {
                    parcelaMap[id] = { time: [], lluvia: [], temperatura: [], sol: [], humedad: [] };
                });

                chartData.forEach(item => {
                    const parcela = parcelaMap[item.parcelaId];
                    if (parcela) {
                        parcela.time.push(new Date(item.time).toLocaleTimeString());
                        parcela.lluvia.push(item.lluvia);
                        parcela.temperatura.push(item.temperatura);
                        parcela.sol.push(item.sol);
                        parcela.humedad.push(item.humedad);
                    }
                });

                console.log(`🛠️ [PARCELA MAP]`, parcelaMap);

                // Grafica de linea, lluvia sobre x cantidad de tiempo.
                setLineData({
                    labels: parcelaMap[1].time,
                    datasets: parcelaIds.map((id, index) => ({
                        label: `Parcela ${id} - Lluvia`,
                        data: parcelaMap[id].lluvia,
                        borderColor: ['#4CAF50', '#FF6384', '#36A2EB', '#FFCE56'][index],
                        backgroundColor: ['#4CAF5080', '#FF638480', '#36A2EB80', '#FFCE5680'][index],
                        fill: true,
                        tension: 0.3
                    }))
                });

                // Grafica de barras - Temperatura promedio
                const avgTemps = parcelaIds.map(id => {
                    const temps = parcelaMap[id].temperatura;
                    const avgTemp = temps.length
                        ? temps.reduce((sum, val) => sum + val, 0) / temps.length
                        : 0;
                    return avgTemp.toFixed(1);
                });

                setBarData({
                    labels: parcelaIds.map(id => `Parcela ${id}`),
                    datasets: [
                        {
                            label: 'Temperatura promedio (°C)',
                            data: avgTemps,
                            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50']
                        }
                    ]
                });

                // Grafica de dona - Porcentajes de humedad
                const totalHumedad = parcelaIds.reduce((acc, id) => {
                    return acc + parcelaMap[id].lluvia.reduce((sum, val) => sum + val, 0);
                }, 0);

                const humedadPercentages = parcelaIds.map(id => {
                    const parcelaHumedad = parcelaMap[id].humedad.reduce((sum, val) => sum + val, 0);
                    return totalHumedad ? ((parcelaHumedad / totalHumedad) * 100).toFixed(1) : '0';
                });

                setDoughnutData({
                    labels: parcelaIds.map(id => `Parcela ${id}`),
                    datasets: [
                        {
                            label: 'Humedad (%)',
                            data: humedadPercentages,
                            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50']
                        }
                    ]
                });

                console.log('✅ [FETCH SUCCESS] Graficas creadas con éxito.');

            } catch (error) {
                console.error('❌ [ERROR] Obteniendo datos:', error);
                setError('Erorr al obtener datos.');
            } finally {
                console.log('🔌 [FETCH COMPLETED]');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        console.log('⌛ [LOADING] Cargando graficas...');
        return <p>Cargando graficas...</p>;
    }

    if (error) {
        console.error(`❌ [ERROR] ${error}`);
        return <p>Error: {error}</p>;
    }

    console.log('✅ [RENDER] Mostrando graficas');

    return (
        <div className="p-8 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-md p-4 col-span-2">
                <h2 className="text-lg font-semibold mb-4 text-black">Lluvia en todas las parcelas</h2>
                {lineData ? <Line data={lineData} /> : <p>No hay datos disponibles</p>}
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-4 text-black">Temperatura promedio</h2>
                {barData ? <Bar data={barData} /> : <p>No hay datos disponibles</p>}
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-4 text-black">Porcentaje de humedad</h2>
                {doughnutData ? <Doughnut data={doughnutData} /> : <p>No hay datos disponibles</p>}
            </div>
        </div>
    );
};

export default Charts;
