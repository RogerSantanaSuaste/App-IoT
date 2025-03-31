'use client'
import React from 'react';
import Image from 'next/image';
import UTLOGO from '../img/UTLOGO.png';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

interface TheSideBarProps {
    children: React.ReactNode;
}

const TheSideBar: React.FC<TheSideBarProps> = ({ children }) => {
    const router = useRouter();

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
                <nav className="flex-1 p-2 justify-between space-y-2">
                    <a href="/dashboard" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 bg-slate-800">📊 Dashboard</a>
                    <a href="/charts" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 bg-slate-800">📈 Gráficas</a>
                    <a href="/deletedParcelas" className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 bg-slate-800">🗑️ Parcelas Eliminadas</a>
                    <button
                        onClick={handleLogout}
                        className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700 w-full text-left bg-slate-800"
                    >
                        🚪 Salir
                    </button>
                </nav>
            </div>
            <div className='flex-1'>{children}</div>
        </>
    );
};

export default TheSideBar;