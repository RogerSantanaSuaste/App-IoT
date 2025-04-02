'use client';
import React from 'react';
import Image from 'next/image';
import UTLOGO from '../img/UTLOGO.png';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, BarChart2, Trash2, LogOut } from "lucide-react";
import { useAuth } from '@/lib/AuthProvider';
import { supabase } from '@/lib/supabase';

interface TheSideBarProps {
    children: React.ReactNode;
}

const TheSideBar: React.FC<TheSideBarProps> = ({ children }) => {
    const router = useRouter();
    const auth = useAuth();
    const user = auth?.user;
    const loading = auth?.loading ?? false;

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            router.refresh();
            router.push('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <>
            <div className="w-40 h-screen bg-slate-900 text-white flex flex-col left-0 sticky top-0">
                <div className="p-4 text-lg font-bold">
                    <div className="flex-1">
                        <Image src={UTLOGO} alt="UT Logo" width={140} height={140} />
                    </div>
                </div>
                {!loading && user && (
                    <nav className="flex-1 p-2 justify-between space-y-2">
                        <a
                            href="/dashboard"
                            className="flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 bg-slate-800"
                        >
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            <span>Dashboard</span>
                        </a>
                        <a
                            href="/charts"
                            className="flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 bg-slate-800"
                        >
                            <BarChart2 className="h-4 w-4 mr-2" />
                            <span>Gráficas</span>
                        </a>
                        <a
                            href="/deletedParcelas"
                            className="flex items-center py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 bg-slate-800"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            <span>Parcelas Eliminadas</span>
                        </a>
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 text-left bg-slate-800 text-red-600"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            <span>Salir</span>
                        </button>
                    </nav>
                )}
            </div>
            <div className='flex-1'>{children}</div>
        </>
    );
};

export default TheSideBar;